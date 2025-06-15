from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from model import predict_transaction_fraud, preprocess_features
from azure_ocr import simulate_transaction_from_invoice
import pandas as pd

app = Flask(__name__)
CORS(app)
UPLOAD_FOLDER = "uploads"
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@app.route("/api/extract", methods=["POST"])
def extract():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"}), 400

    file = request.files["file"]
    path = os.path.join(UPLOAD_FOLDER, file.filename)
    file.save(path)

    try:
        raw_data = simulate_transaction_from_invoice(path)
        if raw_data.empty:
            return jsonify({"error": "No data extracted"}), 400

        feature_row = raw_data.iloc[0].to_dict()
        prediction, confidence = predict_transaction_fraud(feature_row)

        return jsonify({
            "prediction": int(prediction),
            "confidence": float(confidence),
            "raw_fields": feature_row,
            "processed_features": preprocess_features(feature_row).iloc[0].to_dict()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/predict-manual", methods=["POST"])
def predict_manual():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No input data provided"}), 400

        prediction, confidence = predict_transaction_fraud(data)
        return jsonify({
            "prediction": int(prediction),
            "confidence": float(confidence),
            "raw_fields": data,
            "processed_features": preprocess_features(data).iloc[0].to_dict()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/batch-predict", methods=["POST"])
def batch_predict():
    if "files" not in request.files:
        return jsonify({"error": "No files uploaded"}), 400

    files = request.files.getlist("files")
    results = []
    for file in files:
        path = os.path.join(UPLOAD_FOLDER, file.filename)
        file.save(path)

        try:
            df = simulate_transaction_from_invoice(path)
            if not df.empty:
                row = df.iloc[0].to_dict()
                prediction, confidence = predict_transaction_fraud(row)
                results.append({
                    "prediction": int(prediction),
                    "confidence": float(confidence),
                    "filename": file.filename
                })
        except Exception as e:
            results.append({"error": str(e), "filename": file.filename})

    return jsonify(results)


if __name__ == '__main__':
    app.run(debug=True)
