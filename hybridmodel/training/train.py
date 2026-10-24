# ml/training/train.py

"""
Swasthya+ Training Script
=========================

Run from the `ml/` directory:

    python -m training.train

What it does
------------
1. Loads the Kaggle CSV from `datasets/symptom_disease_dataset.csv`.
2. Fits the SymptomPreprocessor (builds vocab + label encoder) and saves it.
3. Encodes every row -> (input_ids, label) tensor pairs.
4. Splits into train/validation (80/20 by default, stratified by disease).
5. Trains HybridDiseaseModel with cross-entropy + Adam.
6. Tracks accuracy + F1 on validation, applies early stopping.
7. Saves the best checkpoint to `saved_models/hybrid_model.pth`.

Reproducibility
---------------
- All randomness is seeded via settings.RANDOM_SEED.
- The same seed gives the same split, same init, same result.

Fail-loud
---------
- Missing CSV          -> FileNotFoundError
- Empty CSV            -> ValueError
- Class count mismatch -> RuntimeError (before saving)
- NaN loss             -> RuntimeError (abort training)

This means: if training reports success, the artifacts on disk are
guaranteed to be a coherent pair (preprocessor + model trained on it).
"""

from __future__ import annotations

import random
import sys
import time
from pathlib import Path
from typing import Tuple

import numpy as np
import pandas as pd
import torch
import torch.nn as nn
from sklearn.metrics import accuracy_score, f1_score
from sklearn.model_selection import train_test_split
from torch.utils.data import DataLoader, TensorDataset

from config.settings import settings
from models.hybrid_model import HybridDiseaseModel
from preprocessing.preprocessor import PAD_INDEX, SymptomPreprocessor
from utils.logger import get_logger

logger = get_logger(__name__)


# ----------------------------------------------------------------------
# Reproducibility
# ----------------------------------------------------------------------
def set_seed(seed: int) -> None:
    random.seed(seed)
    np.random.seed(seed)
    torch.manual_seed(seed)
    torch.cuda.manual_seed_all(seed)
    torch.backends.cudnn.deterministic = True
    torch.backends.cudnn.benchmark = False


# ----------------------------------------------------------------------
# Dataset loading + encoding
# ----------------------------------------------------------------------
def load_and_encode_dataset(
    preprocessor: SymptomPreprocessor,
) -> Tuple[torch.Tensor, torch.Tensor]:
    """
    Read the Kaggle CSV, encode each row into:
      - input_ids: (N, MAX_SEQ_LEN) LongTensor
      - labels:    (N,) LongTensor

    Uses the *same* preprocessor.fit() output — no re-derivation here.
    """
    path = settings.DATASET_PATH
    if not path.exists():
        raise FileNotFoundError(
            f"Dataset CSV not found at {path}. "
            "Place your Kaggle dataset there before running training."
        )

    logger.info("Loading dataset from %s ...", path)
    df = pd.read_csv(path)
    if df.empty:
        raise ValueError(f"Dataset at {path} is empty.")

    df.columns = [c.strip().lower() for c in df.columns]
    if "disease" not in df.columns:
        raise ValueError(
            f"Dataset must contain a 'disease' column. Got: {list(df.columns)}"
        )

    logger.info("Dataset rows: %d", len(df))

    input_ids_list = []
    labels_list = []

    skipped = 0
    for _, row in df.iterrows():
        # Reuse the preprocessor's own parsing so training matches inference.
        symptom_strings = preprocessor._parse_row_symptoms(row)
        if not symptom_strings:
            skipped += 1
            continue

        tensor, _known = preprocessor.transform(symptom_strings)
        input_ids_list.append(tensor.squeeze(0))

        disease = str(row["disease"]).strip().lower()
        try:
            label = preprocessor.label_encoder.transform([disease])[0]
        except ValueError:
            skipped += 1
            continue
        labels_list.append(int(label))

    if skipped > 0:
        logger.warning("Skipped %d malformed rows.", skipped)
    if not input_ids_list:
        raise ValueError("No valid rows after encoding. Check the CSV format.")

    input_ids = torch.stack(input_ids_list)             # (N, T)
    labels = torch.tensor(labels_list, dtype=torch.long) # (N,)

    logger.info(
        "Encoded %d rows into tensor shape %s (num_classes=%d).",
        input_ids.size(0),
        tuple(input_ids.shape),
        preprocessor.get_num_classes(),
    )
    return input_ids, labels


# ----------------------------------------------------------------------
# One epoch of training / evaluation
# ----------------------------------------------------------------------
def train_one_epoch(
    model: nn.Module,
    loader: DataLoader,
    optimizer: torch.optim.Optimizer,
    criterion: nn.Module,
    device: torch.device,
) -> float:
    model.train()
    total_loss = 0.0
    n_batches = 0

    for input_ids, labels in loader:
        input_ids = input_ids.to(device)
        labels = labels.to(device)

        optimizer.zero_grad()
        logits = model(input_ids)
        loss = criterion(logits, labels)
        loss.backward()

        # Gradient clipping — standard for recurrent models, prevents
        # exploding gradients on rare symptom combos.
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

        optimizer.step()

        if torch.isnan(loss) or torch.isinf(loss):
            raise RuntimeError(
                f"Loss became {loss.item()} at batch {n_batches}. "
                "Aborting training — check learning rate / data."
            )

        total_loss += float(loss.item())
        n_batches += 1

    return total_loss / max(1, n_batches)


@torch.no_grad()
def evaluate(
    model: nn.Module,
    loader: DataLoader,
    criterion: nn.Module,
    device: torch.device,
) -> Tuple[float, float, float]:
    model.eval()
    total_loss = 0.0
    n_batches = 0
    all_preds = []
    all_labels = []

    for input_ids, labels in loader:
        input_ids = input_ids.to(device)
        labels = labels.to(device)

        logits = model(input_ids)
        loss = criterion(logits, labels)
        total_loss += float(loss.item())
        n_batches += 1

        preds = logits.argmax(dim=-1).cpu().tolist()
        all_preds.extend(preds)
        all_labels.extend(labels.cpu().tolist())

    avg_loss = total_loss / max(1, n_batches)
    acc = accuracy_score(all_labels, all_preds)
    f1 = f1_score(all_labels, all_preds, average="macro", zero_division=0)
    return avg_loss, acc, f1


# ----------------------------------------------------------------------
# Main
# ----------------------------------------------------------------------
def main() -> int:
    set_seed(settings.RANDOM_SEED)

    # ------------------------------------------------------------------
    # 1. Fit preprocessor on the CSV
    # ------------------------------------------------------------------
    logger.info("=" * 60)
    logger.info("STEP 1/5: Fitting preprocessor on Kaggle CSV")
    logger.info("=" * 60)

    if not settings.DATASET_PATH.exists():
        logger.error("Dataset missing at %s", settings.DATASET_PATH)
        logger.error(
            "Place your Kaggle CSV at that exact path, "
            "e.g.: ml/datasets/symptom_disease_dataset.csv"
        )
        return 1

    preprocessor = SymptomPreprocessor()
    preprocessor.fit()

    num_classes = preprocessor.get_num_classes()
    if num_classes != settings.NUM_CLASSES:
        logger.error(
            "Dataset has %d disease classes but settings.NUM_CLASSES=%d. "
            "Update config/settings.py and re-run.",
            num_classes,
            settings.NUM_CLASSES,
        )
        return 1

    # Save preprocessor BEFORE training. If training crashes midway,
    # we still have a valid preprocessor to debug against.
    preprocessor.save()

    # ------------------------------------------------------------------
    # 2. Encode the dataset
    # ------------------------------------------------------------------
    logger.info("=" * 60)
    logger.info("STEP 2/5: Encoding dataset")
    logger.info("=" * 60)

    input_ids, labels = load_and_encode_dataset(preprocessor)

    # Stratified 80/20 split
    train_idx, val_idx = train_test_split(
        np.arange(len(labels)),
        test_size=settings.TEST_SPLIT,
        random_state=settings.RANDOM_SEED,
        stratify=labels.numpy(),
    )
    X_train, y_train = input_ids[train_idx], labels[train_idx]
    X_val, y_val = input_ids[val_idx], labels[val_idx]

    logger.info(
        "Train: %d  Val: %d  (%.1f%% / %.1f%%)",
        len(X_train), len(X_val),
        100 * len(X_train) / len(labels),
        100 * len(X_val) / len(labels),
    )

    train_loader = DataLoader(
        TensorDataset(X_train, y_train),
        batch_size=settings.BATCH_SIZE,
        shuffle=True,
    )
    val_loader = DataLoader(
        TensorDataset(X_val, y_val),
        batch_size=settings.BATCH_SIZE,
        shuffle=False,
    )

    # ------------------------------------------------------------------
    # 3. Build model + optimizer
    # ------------------------------------------------------------------
    logger.info("=" * 60)
    logger.info("STEP 3/5: Building HybridDiseaseModel")
    logger.info("=" * 60)

    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = HybridDiseaseModel().to(device)

    n_params = sum(p.numel() for p in model.parameters() if p.requires_grad)
    logger.info("Model ready: %d trainable parameters, device=%s", n_params, device)

    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(
        model.parameters(),
        lr=settings.LEARNING_RATE,
        weight_decay=1e-4,
    )
    # Cosine annealing — smooth LR decay, better than step decay on
    # small datasets where every epoch matters.
    scheduler = torch.optim.lr_scheduler.CosineAnnealingLR(
        optimizer, T_max=settings.EPOCHS
    )

    # ------------------------------------------------------------------
    # 4. Training loop with early stopping
    # ------------------------------------------------------------------
    logger.info("=" * 60)
    logger.info("STEP 4/5: Training (%d epochs max)", settings.EPOCHS)
    logger.info("=" * 60)

    best_val_f1 = -1.0
    best_epoch = -1
    patience = 8
    patience_counter = 0
    best_state_dict = None
    t_start = time.time()

    for epoch in range(1, settings.EPOCHS + 1):
        t_epoch = time.time()
        train_loss = train_one_epoch(model, train_loader, optimizer, criterion, device)
        val_loss, val_acc, val_f1 = evaluate(model, val_loader, criterion, device)
        scheduler.step()

        dt = time.time() - t_epoch
        logger.info(
            "Epoch %02d/%d | train_loss=%.4f | val_loss=%.4f | "
            "val_acc=%.4f | val_f1=%.4f | %.1fs",
            epoch, settings.EPOCHS, train_loss, val_loss, val_acc, val_f1, dt,
        )

        if val_f1 > best_val_f1:
            best_val_f1 = val_f1
            best_epoch = epoch
            patience_counter = 0
            best_state_dict = {k: v.clone() for k, v in model.state_dict().items()}
            logger.info("  ↑ new best val_f1=%.4f at epoch %d", val_f1, epoch)
        else:
            patience_counter += 1
            if patience_counter >= patience:
                logger.info(
                    "Early stopping at epoch %d (no improvement for %d epochs).",
                    epoch, patience,
                )
                break

    total_time = time.time() - t_start
    logger.info(
        "Training complete in %.1fs. Best epoch=%d val_f1=%.4f.",
        total_time, best_epoch, best_val_f1,
    )

    if best_state_dict is None:
        logger.error("No best state dict captured — training failed.")
        return 1

    # ------------------------------------------------------------------
    # 5. Restore best weights and save checkpoint
    # ------------------------------------------------------------------
    logger.info("=" * 60)
    logger.info("STEP 5/5: Saving best checkpoint")
    logger.info("=" * 60)

    model.load_state_dict(best_state_dict)

    # Final sanity check before saving: the model must still match the
    # preprocessor's class count. If not, we refuse to write a broken pair.
    if model.num_classes != preprocessor.get_num_classes():
        logger.error(
            "Model num_classes=%d != preprocessor num_classes=%d. "
            "Refusing to save inconsistent artifacts.",
            model.num_classes, preprocessor.get_num_classes(),
        )
        return 1

    model.save(str(settings.MODEL_CHECKPOINT_PATH))
    logger.info("Saved model to %s", settings.MODEL_CHECKPOINT_PATH)
    logger.info("Saved preprocessor to %s", settings.PREPROCESSOR_PATH)

    # Final validation pass on the saved model to confirm round-trip works
    logger.info("Verifying checkpoint can be reloaded...")
    try:
        reloaded = HybridDiseaseModel.load(str(settings.MODEL_CHECKPOINT_PATH))
        logger.info(
            "Reload OK: %d params, num_classes=%d",
            sum(p.numel() for p in reloaded.parameters()),
            reloaded.num_classes,
        )
    except Exception as exc:
        logger.exception("Reload verification FAILED: %s", exc)
        return 1

    logger.info("=" * 60)
    logger.info("TRAINING SUCCESSFUL")
    logger.info("  model:        %s", settings.MODEL_CHECKPOINT_PATH)
    logger.info("  preprocessor: %s", settings.PREPROCESSOR_PATH)
    logger.info("  best val_f1:  %.4f (epoch %d)", best_val_f1, best_epoch)
    logger.info("=" * 60)
    return 0


if __name__ == "__main__":
    sys.exit(main())