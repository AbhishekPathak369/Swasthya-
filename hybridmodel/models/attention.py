# ml/models/attention.py

"""
Additive (Bahdanau-style) attention over the BiLSTM output sequence.

Used after BiLSTM in the Swasthya+ pipeline:

    x           -> (batch, seq_len, embed_dim)
    Transformer -> (batch, seq_len, embed_dim)
    BiLSTM      -> (batch, seq_len, 2 * lstm_hidden)
    Attention   -> (batch, 2 * lstm_hidden)      # context vector

The attention weights are also returned (optionally) so SHAP can
cross-check which timesteps the model focused on — a nice debugging
aid when your SHAP attributions disagree with your attention.

No mock data. No randomness beyond standard PyTorch init.
"""

from __future__ import annotations

import torch
import torch.nn as nn


class BahdanauAttention(nn.Module):
    """
    Additive attention module.

    Parameters
    ----------
    input_dim : int
        Dimension of each timestep's hidden state (usually 2 * lstm_hidden).
    attention_dim : int, optional
        Internal projection size. Defaults to input_dim // 2.
    """

    def __init__(self, input_dim: int, attention_dim: int | None = None) -> None:
        super().__init__()
        if input_dim <= 0:
            raise ValueError(f"input_dim must be positive, got {input_dim}")

        self.input_dim = input_dim
        self.attention_dim = attention_dim or max(1, input_dim // 2)

        # score(h_t) = v^T * tanh(W * h_t + b)
        self.W = nn.Linear(input_dim, self.attention_dim, bias=True)
        self.v = nn.Linear(self.attention_dim, 1, bias=False)

    def forward(
        self,
        hidden_states: torch.Tensor,
        mask: torch.Tensor | None = None,
        return_weights: bool = False,
    ) -> torch.Tensor | tuple[torch.Tensor, torch.Tensor]:
        """
        Parameters
        ----------
        hidden_states : torch.Tensor
            Shape (batch, seq_len, input_dim).
        mask : torch.Tensor, optional
            Shape (batch, seq_len), dtype bool. True = valid, False = pad.
            If provided, attention weights at padded positions are zeroed.
        return_weights : bool
            If True, also return attention weights of shape (batch, seq_len).

        Returns
        -------
        context : torch.Tensor
            Shape (batch, input_dim).
        weights : torch.Tensor (only if return_weights=True)
            Shape (batch, seq_len). Sums to 1 along dim=1 (per valid row).
        """
        if hidden_states.dim() != 3:
            raise ValueError(
                f"hidden_states must be 3D (B, T, D), got {hidden_states.shape}"
            )

        # (B, T, A)
        scores = torch.tanh(self.W(hidden_states))
        # (B, T, 1) -> (B, T)
        scores = self.v(scores).squeeze(-1)

        # Mask padded timesteps *before* softmax so they get zero weight.
        if mask is not None:
            if mask.dtype != torch.bool:
                mask = mask.bool()
            # large negative value -> e^{-inf} = 0 after softmax
            scores = scores.masked_fill(~mask, float("-inf"))

        weights = torch.softmax(scores, dim=-1)  # (B, T)

        # Avoid NaN propagation when an entire row is masked (defensive).
        # If any row sums to ~0 (all -inf before softmax), softmax gives NaNs.
        # Replace NaNs with uniform weights.
        if torch.isnan(weights).any():
            nan_rows = torch.isnan(weights).any(dim=-1, keepdim=True)
            safe_uniform = torch.full_like(weights, 1.0 / weights.size(1))
            weights = torch.where(nan_rows, safe_uniform, weights)

        # Context: weighted sum over time.
        # (B, 1, T) @ (B, T, D) -> (B, 1, D) -> (B, D)
        context = torch.bmm(weights.unsqueeze(1), hidden_states).squeeze(1)

        if return_weights:
            return context, weights
        return context