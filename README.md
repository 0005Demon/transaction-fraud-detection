# transaction-fraud-detection

This project identifies fraudulent invoices using machine learning. It extracts invoice data via Azure Form Recognizer, preprocesses it, and predicts fraud using trained models. A Flask API serves predictions, and a React frontend allows user interaction.

---

## 🚀 Features

- Azure Form Recognizer for OCR
- Data preprocessing & feature engineering
- ML model training & fraud prediction
- Flask API backend
- React-based frontend


---

## 🛠️ Tech Stack

- Python, Flask, scikit-learn, Pandas
- React.js, HTML/CSS
- Azure Form Recognizer


---

## 📂 Structure

```

transaction-fraud-detection/
├── BackendFolder/           # Flask API & ML model
├── FrontendFolder/src/         # React frontend
├── Data/              # Raw or processed transaction data
├── requirements.txt   # Python dependencies
├── README.md

````

---

## ⚙️ Setup

```bash
# 1. Clone the repo
git clone https://github.com/0005Demon/invoice-fraud-detection.git
cd transaction-fraud-detection

# 2. Backend setup
python -m venv venv
venv\Scripts\activate         # Windows
# source venv/bin/activate    # Mac/Linux
pip install -r requirements.txt
python BackendFolder/app.py

# 3. Frontend setup
cd FrontendFolder/src
npm install
npm start
````

---


## 🙋‍♂️ Author

**Jayesh**
[GitHub](https://github.com/0005Demon)

