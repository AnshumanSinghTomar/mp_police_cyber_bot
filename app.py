from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import os
from fir_generator import generate_fir

app = Flask(__name__)
CORS(app)

COMPLAINTS_FILE = "complaints.json"


# ------------------------------
# Load complaints
# ------------------------------
def load_complaints():
    if not os.path.exists(COMPLAINTS_FILE):
        return []
    with open(COMPLAINTS_FILE, "r") as f:
        return json.load(f)


# ------------------------------
# Save complaints
# ------------------------------
def save_complaints(data):
    with open(COMPLAINTS_FILE, "w") as f:
        json.dump(data, f, indent=2)


# ------------------------------
# Ollama Chat Function
# ------------------------------
def ask_ollama(prompt):
    try:
        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        data = response.json()

        print("OLLAMA RAW RESPONSE:", data)

        return data.get("response", "No AI response")

    except Exception as e:
        print("OLLAMA ERROR:", e)
        return "⚠️ AI model not responding."


# ------------------------------
# NEW: AI Risk Scoring Function
# ------------------------------
def get_risk_score(text):

    prompt = f"""
You are a cybercrime risk analyzer for police.

Analyze this complaint and return ONLY a number from 0 to 100 representing cybercrime risk.

Complaint:
{text}

Return only the number.
"""

    try:

        response = requests.post(
            "http://localhost:11434/api/generate",
            json={
                "model": "llama3",
                "prompt": prompt,
                "stream": False
            },
            timeout=60
        )

        data = response.json()
        result = data.get("response", "30").strip()

        score = int("".join(filter(str.isdigit, result)) or 30)

        score = max(0, min(score, 100))

        return score

    except Exception as e:
        print("RISK ERROR:", e)
        return 30


# ------------------------------
# Chat API
# ------------------------------

def get_risk_level(score):

    if score >= 80:
        return "HIGH"

    elif score >= 50:
        return "MEDIUM"

    else:
        return "LOW"
# ------------------------------
# Detect Cyber Threat Type
# ------------------------------
def detect_threat_type(text):

    text = text.lower()

    threats = {
        "BANKING FRAUD": [
            "otp", "bank", "account", "transaction",
            "kyc", "debit", "credit", "atm"
        ],

        "PHISHING ATTACK": [
            "login link", "verify account",
            "suspicious link", "update account"
        ],

        "UPI / PAYMENT SCAM": [
            "upi", "paytm", "phonepe", "gpay",
            "qr code", "payment request"
        ],

        "SOCIAL MEDIA HACK": [
            "instagram hack", "facebook hack",
            "account hacked", "password reset"
        ],

        "LOTTERY / PRIZE SCAM": [
            "lottery", "won prize", "free gift",
            "claim reward"
        ]
    }

    for threat, keywords in threats.items():
        for word in keywords:
            if word in text:
                return threat

    return "GENERAL CYBER QUERY"

import re
import tldextract


# ------------------------------
# Detect phishing URL
# ------------------------------
def check_phishing_url(text):

    urls = re.findall(r'(https?://\S+|www\.\S+)', text)

    if not urls:
        return None

    suspicious_keywords = [
        "login",
        "verify",
        "bank",
        "secure",
        "update",
        "wallet",
        "pay"
    ]

    suspicious_domains = [
        "bit.ly",
        "tinyurl",
        "shorturl",
        "freegift",
        "bonus"
    ]

    for url in urls:

        domain = tldextract.extract(url).domain

        # keyword phishing
        for word in suspicious_keywords:
            if word in url.lower():
                return {
                    "url": url,
                    "risk": 90,
                    "reason": "Suspicious phishing keyword in URL"
                }

        # shortened domain
        for bad in suspicious_domains:
            if bad in url.lower():
                return {
                    "url": url,
                    "risk": 95,
                    "reason": "Shortened or suspicious domain"
                }

    return None


# ------------------------------
# Chat Endpoint
# ------------------------------
@app.route("/api/chat", methods=["POST"])
def chat():

    data = request.json
    user_message = data.get("message", "")

    if not user_message:
        return jsonify({"reply": "Empty message"}), 400

    # ------------------------------
    # FIR Detection
    # ------------------------------
    if "fir" in user_message.lower():

        fir_text = generate_fir(user_message)

        complaints = load_complaints()
        complaints.append({
            "complaint": user_message,
            "fir": fir_text
        })

        save_complaints(complaints)

        return jsonify({
            "reply": fir_text,
            "risk": 20
        })

    # ------------------------------
    # Normal AI Response
    # ------------------------------
    ai_reply = ask_ollama(user_message)

    # ------------------------------
    # Risk Score
    # ------------------------------
    risk = get_risk_score(user_message)
    threat_type = detect_threat_type(user_message)
    # ------------------------------
    # Phishing URL Check
    # ------------------------------
    phishing = check_phishing_url(user_message)

    if phishing:

        risk = max(risk, phishing["risk"])

        ai_reply += f"\n\n⚠️ WARNING: Suspicious link detected -> {phishing['url']}"
        ai_reply += "\nAvoid entering personal or banking information on this website."

    # ------------------------------
    # Return Response
    # ------------------------------
    risk_level = get_risk_level(risk)

    ai_reply += f"""

    Threat Type: {threat_type}
    Risk Level: {risk_level}
    Confidence: {risk}%
    """
    return jsonify({
        "reply": ai_reply,
        "risk": risk,
        "threat": threat_type,
        "level": risk_level
    })

# ------------------------------
# FIR Generator API
# ------------------------------
@app.route("/generate-fir", methods=["POST"])
def generate():

    try:

        data = request.json
        print("FIR DATA:", data)

        file = generate_fir(data)

        return jsonify({"file": file})

    except Exception as e:

        print("FIR ERROR:", e)

        return jsonify({"error": "FIR failed"}), 500


# ------------------------------
# Run server
# ------------------------------
if __name__ == "__main__":
    app.run(port=5000, debug=True)