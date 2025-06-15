def simulate_transaction_from_invoice(file_path):
    """
    Extract invoice totals via Azure Form Recognizer and convert them into
    a transaction-style row for fraud prediction.
    Only returns columns required by the trained model.
    """
    import os
    import pandas as pd
    from azure.ai.formrecognizer import DocumentAnalysisClient
    from azure.core.credentials import AzureKeyCredential
    from dotenv import load_dotenv

    load_dotenv()
    endpoint = os.getenv("AZURE_FORM_RECOGNIZER_ENDPOINT")
    key = os.getenv("AZURE_FORM_RECOGNIZER_KEY")

    client = DocumentAnalysisClient(endpoint=endpoint, credential=AzureKeyCredential(key))

    with open(file_path, "rb") as f:
        poller = client.begin_analyze_document("prebuilt-invoice", document=f)
        result = poller.result()

    if not result.documents:
        return pd.DataFrame()

    fields = result.documents[0].fields

    def get_value(field_name):
        field = fields.get(field_name)
        if field and hasattr(field.value, 'amount'):
            return field.value.amount
        return field.value if field else None

    total_amount = get_value("InvoiceTotal") or 0.0
    gst = get_value("TotalTax") or 0.0

    # Only include model-required columns
    transaction_data = {
        'step': [1],
        'type': ['TRANSFER'],
        'amount': [total_amount],
        'oldbalanceOrg': [total_amount],
        'newbalanceOrig': [total_amount - gst],
        'oldbalanceDest': [0.0],
        'newbalanceDest': [total_amount]
    }

    return pd.DataFrame(transaction_data)
