# ml/models/transformer_block.py

"""
Lightweight Transformer encoder block implemented from scratch.

This is NOT torch.nn.TransformerEncoderLayer. We build it ourselves so
that:
  - We control masking exactly (padding masks + optional causal).
  - We use pre-norm, which is more stable on small datasets.
  - We keep it minimal (no unnecessary attention variants).

Pipeline per block (pre-norm):

    x  ──► LayerNorm ──► MultiHeadSelfAttention ──► dropout ──► + x (residual)
                                                                    │
                                                                    ▼
                                                            LayerNorm
                                                                    │
                                                          FeedForward
                                                                    │
                                                              dropout
                                                                    │
                                                                    ▼
                                                                    + (residual)
                                                                    │
                                                                    ▼
                                                                    y

No mock data. No randomness beyond standard PyTorch init.
"""

from __future__ import annotations

import math

import torch
import torch.nn as nn


class MultiHeadSelfAttention(nn.Module):
    """
    Standard scaled dot-product multi-head self-attention.

    Parameters
    ----------
    embed_dim : int
        Model dimension. Must be divisible by num_heads.
    num_heads : int
        Number of attention heads.
    dropout : float
        Dropout applied to the attention weights (regularization).
    """

    def __init__(self, embed_dim: int, num_heads: int, dropout: float = 0.1) -> None:
        super().__init__()
        if embed_dim % num_heads != 0:
            raise ValueError(
                f"embed_dim ({embed_dim}) must be divisible by "
                f"num_heads ({num_heads})"
            )
        self.embed_dim = embed_dim
        self.num_heads = num_heads
        self.head_dim = embed_dim // num_heads
        self.scale = self.head_dim ** -0.5

        # Combined QKV projection for efficiency (single matmul).
        self.qkv = nn.Linear(embed_dim, 3 * embed_dim, bias=True)
        self.out_proj = nn.Linear(embed_dim, embed_dim, bias=True)
        self.attn_dropout = nn.Dropout(dropout)

    def forward(
        self,
        x: torch.Tensor,
        key_padding_mask: torch.Tensor | None = None,
        return_attention: bool = False,
    ) -> torch.Tensor | tuple[torch.Tensor, torch.Tensor]:
        """
        Parameters
        ----------
        x : torch.Tensor
            (B, T, D) input.
        key_padding_mask : torch.Tensor, optional
            (B, T) bool. True = valid token, False = pad.
            If provided, padding positions are excluded from attention.
        return_attention : bool
            If True, also return averaged attention weights (B, T, T).

        Returns
        -------
        out : torch.Tensor
            (B, T, D)
        attn_weights : torch.Tensor (only if return_attention=True)
            (B, T, T) averaged over heads.
        """
        B, T, D = x.shape

        # (B, T, 3D) -> (3, B, H, T, Dh)
        qkv = self.qkv(x)
        qkv = qkv.reshape(B, T, 3, self.num_heads, self.head_dim)
        qkv = qkv.permute(2, 0, 3, 1, 4)  # (3, B, H, T, Dh)
        q, k, v = qkv[0], qkv[1], qkv[2]  # each: (B, H, T, Dh)

        # Scaled dot-product scores: (B, H, T, T)
        scores = torch.matmul(q, k.transpose(-2, -1)) * self.scale

        # Apply padding mask: positions with mask=False -> -inf
        if key_padding_mask is not None:
            if key_padding_mask.dtype != torch.bool:
                key_padding_mask = key_padding_mask.bool()
            # (B, T) -> (B, 1, 1, T) broadcast across heads and query positions
            mask = key_padding_mask[:, None, None, :]
            scores = scores.masked_fill(~mask, float("-inf"))

        # Softmax over the last dim (key positions).
        attn = torch.softmax(scores, dim=-1)

        # Defensive NaN replacement (all-masked rows).
        if torch.isnan(attn).any():
            nan_rows = torch.isnan(attn).any(dim=-1, keepdim=True)
            safe_uniform = torch.full_like(attn, 1.0 / attn.size(-1))
            attn = torch.where(nan_rows, safe_uniform, attn)

        attn = self.attn_dropout(attn)

        # (B, H, T, T) @ (B, H, T, Dh) -> (B, H, T, Dh)
        context = torch.matmul(attn, v)

        # (B, H, T, Dh) -> (B, T, H, Dh) -> (B, T, D)
        context = context.transpose(1, 2).reshape(B, T, D)
        out = self.out_proj(context)

        if return_attention:
            # Average across heads for interpretability: (B, T, T)
            attn_avg = attn.mean(dim=1)
            return out, attn_avg
        return out


class FeedForward(nn.Module):
    """
    Position-wise two-layer MLP with GELU activation.

    Shapes: (B, T, D) -> (B, T, ff_dim) -> (B, T, D)
    """

    def __init__(self, embed_dim: int, ff_dim: int, dropout: float = 0.1) -> None:
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(embed_dim, ff_dim),
            nn.GELU(),
            nn.Dropout(dropout),
            nn.Linear(ff_dim, embed_dim),
            nn.Dropout(dropout),
        )

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        return self.net(x)


class TransformerEncoderBlock(nn.Module):
    """
    A single pre-norm Transformer encoder block.

    Pre-norm is used because it trains more stably on small datasets
    (~5k rows) than post-norm, which requires careful LR warmup.
    """

    def __init__(
        self,
        embed_dim: int,
        num_heads: int,
        ff_dim: int,
        dropout: float = 0.1,
    ) -> None:
        super().__init__()
        self.norm1 = nn.LayerNorm(embed_dim)
        self.attn = MultiHeadSelfAttention(embed_dim, num_heads, dropout)
        self.dropout1 = nn.Dropout(dropout)

        self.norm2 = nn.LayerNorm(embed_dim)
        self.ffn = FeedForward(embed_dim, ff_dim, dropout)
        self.dropout2 = nn.Dropout(dropout)

    def forward(
        self,
        x: torch.Tensor,
        key_padding_mask: torch.Tensor | None = None,
        return_attention: bool = False,
    ) -> torch.Tensor | tuple[torch.Tensor, torch.Tensor]:
        # -------- Self-attention sublayer (pre-norm + residual) ---------
        normed = self.norm1(x)
        if return_attention:
            attn_out, attn_weights = self.attn(
                normed, key_padding_mask, return_attention=True
            )
        else:
            attn_out = self.attn(normed, key_padding_mask)
            attn_weights = None
        x = x + self.dropout1(attn_out)

        # -------- Feed-forward sublayer (pre-norm + residual) -----------
        normed = self.norm2(x)
        x = x + self.dropout2(self.ffn(normed))

        if return_attention:
            return x, attn_weights
        return x


class PositionalEncoding(nn.Module):
    """
    Standard sinusoidal positional encoding (Vaswani et al. 2017).

    Why sinusoidal and not learned?
      - Zero extra parameters -> smaller model, faster training.
      - Extrapolates to longer sequences than seen during training.
      - Empirically works well when the vocabulary is small (our case).

    Adds a fixed (1, max_len, embed_dim) tensor to the input embeddings.
    """

    def __init__(self, embed_dim: int, max_len: int, dropout: float = 0.1) -> None:
        super().__init__()
        self.dropout = nn.Dropout(dropout)

        # Precompute the (max_len, embed_dim) table once.
        pe = torch.zeros(max_len, embed_dim)
        position = torch.arange(0, max_len, dtype=torch.float).unsqueeze(1)
        div_term = torch.exp(
            torch.arange(0, embed_dim, 2, dtype=torch.float)
            * (-math.log(10000.0) / embed_dim)
        )
        pe[:, 0::2] = torch.sin(position * div_term)          # even dims
        if embed_dim % 2 == 0:
            pe[:, 1::2] = torch.cos(position * div_term)      # odd dims
        else:
            pe[:, 1::2] = torch.cos(position * div_term[:-1]) # odd embed_dim edge case

        # (1, max_len, embed_dim) -> broadcast over batch
        pe = pe.unsqueeze(0)
        self.register_buffer("pe", pe, persistent=False)

    def forward(self, x: torch.Tensor) -> torch.Tensor:
        """
        x : (B, T, D)
        """
        seq_len = x.size(1)
        if seq_len > self.pe.size(1):
            raise ValueError(
                f"Sequence length {seq_len} exceeds positional encoding "
                f"max_len {self.pe.size(1)}"
            )
        x = x + self.pe[:, :seq_len, :]
        return self.dropout(x)