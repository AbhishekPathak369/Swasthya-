# ml/models/hybrid_model.py

"""
Swasthya+ Hybrid Disease Prediction Model.

Architecture (matches the paper's pipeline diagram):

    input_ids (B, T)
        │
        ▼
    Embedding (vocab_size, embed_dim)
        │
        ▼
    PositionalEncoding
        │
        ▼
    N × TransformerEncoderBlock       ← contextual learning (self-attention)
        │
        ▼
    BiLSTM (input=embed_dim, hidden=lstm_hidden, bidirectional=True)
        │
        ▼
    BahdanauAttention (input=2*lstm_hidden)   ← feature prioritization
        │
        ▼
    LayerNorm + Dropout
        │
        ▼
    Classifier head: Linear(2*lstm_hidden → num_classes)
        │
        ▼
    logits (B, num_classes)

Notes
-----
- We return *logits*, not probabilities. Softmax is applied by the
  caller (or by CrossEntropyLoss during training, which needs logits).
- Padding mask (B, T) with True=valid is threaded through the whole
  pipeline so padding tokens never influence attention or the LSTM.
"""

from __future__ import annotations

import torch
import torch.nn as nn

from config.settings import settings
from models.attention import BahdanauAttention
from models.transformer_block import (
    PositionalEncoding,
    TransformerEncoderBlock,
)


class HybridDiseaseModel(nn.Module):
    """
    Full Swasthya+ model: Embedding + Transformer + BiLSTM + Attention + Classifier.
    """

    def __init__(
        self,
        vocab_size: int = settings.VOCAB_SIZE,
        num_classes: int = settings.NUM_CLASSES,
        embed_dim: int = settings.EMBED_DIM,
        num_heads: int = settings.NUM_HEADS,
        num_transformer_layers: int = settings.NUM_TRANSFORMER_LAYERS,
        ff_dim: int = settings.FF_DIM,
        lstm_hidden_dim: int = settings.LSTM_HIDDEN_DIM,
        max_seq_len: int = settings.MAX_SEQ_LEN,
        dropout: float = settings.DROPOUT,
        pad_index: int = 0,
    ) -> None:
        super().__init__()

        self.vocab_size = vocab_size
        self.num_classes = num_classes
        self.embed_dim = embed_dim
        self.max_seq_len = max_seq_len
        self.pad_index = pad_index

        # ------------------------------------------------------------------
        # 1. Embedding + Positional Encoding
        # ------------------------------------------------------------------
        self.embedding = nn.Embedding(
            num_embeddings=vocab_size,
            embedding_dim=embed_dim,
            padding_idx=pad_index,  # zero-vector + no gradient for <PAD>
        )
        self.pos_encoder = PositionalEncoding(
            embed_dim=embed_dim,
            max_len=max_seq_len,
            dropout=dropout,
        )

        # ------------------------------------------------------------------
        # 2. Transformer encoder (N stacked blocks, pre-norm)
        # ------------------------------------------------------------------
        self.transformer_blocks = nn.ModuleList([
            TransformerEncoderBlock(
                embed_dim=embed_dim,
                num_heads=num_heads,
                ff_dim=ff_dim,
                dropout=dropout,
            )
            for _ in range(num_transformer_layers)
        ])
        self.transformer_norm = nn.LayerNorm(embed_dim)

        # ------------------------------------------------------------------
        # 3. BiLSTM (sequential dependencies)
        # ------------------------------------------------------------------
        self.bilstm = nn.LSTM(
            input_size=embed_dim,
            hidden_size=lstm_hidden_dim,
            num_layers=1,
            batch_first=True,
            bidirectional=True,
            dropout=0.0,  # single-layer LSTM; use model-level dropout instead
        )
        lstm_out_dim = lstm_hidden_dim * 2  # forward + backward

        # ------------------------------------------------------------------
        # 4. Bahdanau attention (feature prioritization)
        # ------------------------------------------------------------------
        self.attention = BahdanauAttention(
            input_dim=lstm_out_dim,
            attention_dim=lstm_out_dim // 2,
        )

        # ------------------------------------------------------------------
        # 5. Classifier head
        # ------------------------------------------------------------------
        self.pre_classifier = nn.Sequential(
            nn.LayerNorm(lstm_out_dim),
            nn.Dropout(dropout),
        )
        self.classifier = nn.Linear(lstm_out_dim, num_classes)

        # Initialize for stability
        self._init_weights()

    # ----------------------------------------------------------------------
    # Init
    # ----------------------------------------------------------------------
    def _init_weights(self) -> None:
        """
        Xavier init for linear layers, ortho init for LSTM recurrent weights.
        This small attention to init often buys 1-2% accuracy on small datasets.
        """
        for m in self.modules():
            if isinstance(m, nn.Linear):
                nn.init.xavier_uniform_(m.weight)
                if m.bias is not None:
                    nn.init.zeros_(m.bias)
            elif isinstance(m, nn.LSTM):
                for name, p in m.named_parameters():
                    if "weight_ih" in name:
                        nn.init.xavier_uniform_(p)
                    elif "weight_hh" in name:
                        nn.init.orthogonal_(p)
                    elif "bias" in name:
                        nn.init.zeros_(p)
            elif isinstance(m, nn.LayerNorm):
                nn.init.ones_(m.weight)
                nn.init.zeros_(m.bias)

    # ----------------------------------------------------------------------
    # Core forward
    # ----------------------------------------------------------------------
    def forward(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor | None = None,
    ) -> torch.Tensor:
        """
        Parameters
        ----------
        input_ids : torch.Tensor
            (B, T) integer tensor of symptom token ids.
        attention_mask : torch.Tensor, optional
            (B, T) bool tensor. True = valid token, False = padding.
            If None, inferred as (input_ids != pad_index).

        Returns
        -------
        logits : torch.Tensor
            (B, num_classes) unnormalized scores.
        """
        if input_ids.dim() != 2:
            raise ValueError(
                f"input_ids must be 2D (B, T), got {input_ids.shape}"
            )

        if attention_mask is None:
            attention_mask = input_ids != self.pad_index

        if attention_mask.dtype != torch.bool:
            attention_mask = attention_mask.bool()

        # ---------------- Embedding + positional encoding ----------------
        x = self.embedding(input_ids)          # (B, T, D)
        x = self.pos_encoder(x)                # (B, T, D)

        # ---------------- Transformer blocks ----------------------------
        for block in self.transformer_blocks:
            x = block(x, key_padding_mask=attention_mask)
        x = self.transformer_norm(x)           # (B, T, D)

        # ---------------- BiLSTM ----------------------------------------
        # nn.LSTM doesn't accept a padding mask directly. Two options:
        #   1. pack_padded_sequence (best — skips padded steps in recurrence)
        #   2. feed raw, mask after
        # We use (1) for correctness and speed.
        x = self._run_bilstm(x, attention_mask)   # (B, T, 2H)

        # ---------------- Attention -------------------------------------
        context = self.attention(x, mask=attention_mask)   # (B, 2H)

        # ---------------- Classifier ------------------------------------
        z = self.pre_classifier(context)       # (B, 2H)
        logits = self.classifier(z)            # (B, C)
        return logits

    # ----------------------------------------------------------------------
    # Helpers
    # ----------------------------------------------------------------------
    def _run_bilstm(
        self,
        x: torch.Tensor,
        attention_mask: torch.Tensor,
    ) -> torch.Tensor:
        """
        Run BiLSTM with pack_padded_sequence so padded timesteps are skipped
        in the recurrence (correctness + ~20% speedup).
        """
        lengths = attention_mask.sum(dim=1).clamp(min=1).cpu()  # (B,)
        packed = nn.utils.rnn.pack_padded_sequence(
            x,
            lengths=lengths,
            batch_first=True,
            enforce_sorted=False,
        )
        packed_out, _ = self.bilstm(packed)
        out, _ = nn.utils.rnn.pad_packed_sequence(
            packed_out,
            batch_first=True,
            total_length=x.size(1),   # pad back to original T
        )
        return out

    # ----------------------------------------------------------------------
    # Convenience: full prediction + top symptoms
    # ----------------------------------------------------------------------
    @torch.no_grad()
    def predict(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor | None = None,
        top_k: int = 3,
    ) -> dict:
        """
        Convenience inference helper. Returns:
            - predicted_class : int
            - confidence      : float
            - top_k_classes   : list[int] (indices of top-k logits)
            - top_k_confs     : list[float]
        """
        self.eval()
        logits = self.forward(input_ids, attention_mask)
        probs = torch.softmax(logits, dim=-1)
        confidence, predicted = probs.max(dim=-1)

        k = min(top_k, self.num_classes)
        top_probs, top_idx = probs.topk(k, dim=-1)

        return {
            "predicted_class": int(predicted[0].item()),
            "confidence": float(confidence[0].item()),
            "top_k_classes": top_idx[0].tolist(),
            "top_k_confs": top_probs[0].tolist(),
        }

    # ----------------------------------------------------------------------
    # Debug / interpretability
    # ----------------------------------------------------------------------
    @torch.no_grad()
    def forward_with_attention(
        self,
        input_ids: torch.Tensor,
        attention_mask: torch.Tensor | None = None,
    ) -> dict:
        """
        Same as forward, but additionally returns:
            - 'transformer_attention': list of (B, T, T) per block
            - 'bilstm_attention': (B, T) Bahdanau attention weights
            - 'logits': (B, C)

        Used by the /explain endpoint and by paper experiments.
        """
        self.eval()

        if input_ids.dim() != 2:
            raise ValueError(f"input_ids must be 2D (B, T), got {input_ids.shape}")
        if attention_mask is None:
            attention_mask = input_ids != self.pad_index
        if attention_mask.dtype != torch.bool:
            attention_mask = attention_mask.bool()

        x = self.pos_encoder(self.embedding(input_ids))

        transformer_attns = []
        for block in self.transformer_blocks:
            x, attn = block(x, key_padding_mask=attention_mask, return_attention=True)
            transformer_attns.append(attn.detach().cpu())
        x = self.transformer_norm(x)

        x = self._run_bilstm(x, attention_mask)
        context, bilstm_attn = self.attention(
            x, mask=attention_mask, return_weights=True
        )

        z = self.pre_classifier(context)
        logits = self.classifier(z)

        return {
            "logits": logits,
            "transformer_attention": transformer_attns,
            "bilstm_attention": bilstm_attn.detach().cpu(),
        }

    # ----------------------------------------------------------------------
    # Save / load
    # ----------------------------------------------------------------------
    def save(self, path: str) -> None:
        """Save state_dict + constructor args so the model is self-describing."""
        torch.save(
            {
                "state_dict": self.state_dict(),
                "hparams": {
                    "vocab_size": self.vocab_size,
                    "num_classes": self.num_classes,
                    "embed_dim": self.embed_dim,
                    "max_seq_len": self.max_seq_len,
                    "pad_index": self.pad_index,
                    # Remaining hparams come from settings at load time.
                },
            },
            path,
        )

    @classmethod
    def load(cls, path: str, map_location: str | torch.device = "cpu") -> "HybridDiseaseModel":
        """
        Load a checkpoint. Raises FileNotFoundError if path is missing.
        Does NOT silently fall back to a random model.
        """
        from pathlib import Path
        p = Path(path)
        if not p.exists():
            raise FileNotFoundError(
                f"Model checkpoint not found at {p}. "
                "Run training/train.py to produce it before serving."
            )
        ckpt = torch.load(p, map_location=map_location, weights_only=False)
        hparams = ckpt["hparams"]
        model = cls(**hparams)
        model.load_state_dict(ckpt["state_dict"])
        model.eval()
        return model