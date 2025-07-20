import joblib
import pandas as pd
import os

MODEL_PATH = 'rf_model.pkl'

if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"{MODEL_PATH} not found. Please train and export your model.")

model = joblib.load(MODEL_PATH)


def preprocess_features(raw_row: dict) -> pd.DataFrame:
    df = pd.DataFrame([raw_row])

    # Encode 'type'
    type_map = {'TRANSFER': 1, 'CASH_OUT': 0}
    df['type'] = df['type'].map(type_map)

    # Define exact column order used during model training
    feature_columns = [
        'step',
        'type',
        'amount',
        'oldbalanceOrg',
        'newbalanceOrig',
        'oldbalanceDest',
        'newbalanceDest'
    ]

    # Fill missing columns if needed (to avoid KeyErrors)
    for col in feature_columns:
        if col not in df.columns:
            df[col] = 0

    # Ensure correct column order
    return df[feature_columns]


def predict_transaction_fraud(raw_transaction_data: dict):
    """
    Predicts fraud on a single transaction.
    Args:
        raw_transaction_data (dict): Dictionary with raw transaction fields.
    Returns:
        prediction (0 or 1), fraud probability
    """
    processed = preprocess_features(raw_transaction_data)
    prediction = model.predict(processed)[0]
    probability = model.predict_proba(processed)[0][1]
    return prediction, probability
