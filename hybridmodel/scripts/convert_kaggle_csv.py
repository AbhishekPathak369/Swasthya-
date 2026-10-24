# Save as: ml/scripts/convert_kaggle_csv.py
# Run: python scripts/convert_kaggle_csv.py

import pandas as pd

# Load the raw Kaggle file
df = pd.read_csv("datasets/Training.csv")  # your downloaded file

# The disease column is 'prognosis'
df = df.rename(columns={"prognosis": "disease"})

# Build a 'symptoms' column: for each row, join all symptom names where value == 1
symptom_cols = [c for c in df.columns if c != "disease"]

def row_to_symptoms(row):
    active = [col.replace("_", " ") for col in symptom_cols if row[col] == 1]
    return "; ".join(active)  # semicolon-delimited

df["symptoms"] = df.apply(row_to_symptoms, axis=1)

# Keep only what we need
df_out = df[["disease", "symptoms"]].copy()

# Save to the path your code expects
df_out.to_csv("datasets/symptom_disease_dataset.csv", index=False)

print(f"Converted {len(df_out)} rows, {df_out['disease'].nunique()} diseases.")
print(df_out.head(3))