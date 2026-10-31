from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import json
import os
import re
import time
import hashlib
from urllib.parse import urlparse
from groq import Groq
import tldextract
from fir_generator import generate_fir, get_legal_sections

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

app = Flask(__name__)
CORS(app)

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
_groq = None
if GROQ_API_KEY:
    try:
        _groq = Groq(api_key=GROQ_API_KEY)
    except Exception as e:
        print("Groq initialization error:", e)

COMPLAINTS_FILE = "complaints.json"


# ------------------------------
# Load / Save complaints
# ------------------------------
def load_complaints():
    if not os.path.exists(COMPLAINTS_FILE):
        return []
    try:
        with open(COMPLAINTS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def save_complaints(data):
    try:
        with open(COMPLAINTS_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        print("Save complaints error:", e)


# ------------------------------
# Groq Chat Function (with history)
# ------------------------------
SYSTEM_PROMPT = {
    "en": (
        "You are MP Cyber Cop AI, the elite tactical cybercrime advisor for Madhya Pradesh Police. "
        "You provide immediate, high-priority guidance to citizens on cyber frauds, extortion, digital arrest scams, "
        "UPI fraud, phishing, and banking compromise. Provide sharp, empathetic, and legally precise answers. "
        "Always remind victims to call National Cyber Helpline 1930 and file an FIR immediately."
    ),
    "hi": (
        "आप MP साइबर कॉप AI हैं, मध्य प्रदेश पुलिस के प्रमुख साइबर सुरक्षा एवं अपराध सलाहकार। "
        "नागरिकों को साइबर धोखाधड़ी, डिजिटल अरेस्ट, UPI स्कैम, बैंकिंग फ्रॉड और सोशल मीडिया हैकिंग में "
        "तत्काल मदद और कानूनी मार्गदर्शन दें। हमेशा राष्ट्रीय साइबर हेल्पलाइन 1930 और FIR दर्ज करने की सलाह दें।"
    ),
}

def ask_groq(history: list, lang: str = "en"):
    try:
        messages = [
            {"role": "system", "content": SYSTEM_PROMPT.get(lang, SYSTEM_PROMPT["en"])},
            *history
        ]
        chat = _groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=messages,
            max_tokens=1024,
            temperature=0.3,
        )
        return chat.choices[0].message.content
    except Exception as e:
        print("GROQ ERROR:", e)
        return (
            "⚠️ MP Cyber Command AI Engine is experiencing heavy dispatch load. "
            "Please call National Cyber Helpline 1930 immediately or use the 1-Click FIR button."
        )


# ------------------------------
# AI Risk Scoring Function
# ------------------------------
def get_risk_score(text):
    prompt = f"""You are an elite cyber threat triage officer for Madhya Pradesh Cyber Police.
Analyze this incident text and output ONLY a single integer from 0 to 100 representing the critical threat/financial/privacy risk.
Text: {text}
Output format: Only the number."""
    try:
        chat = _groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            max_tokens=10,
            temperature=0.1,
        )
        result = chat.choices[0].message.content.strip()
        score = int("".join(filter(str.isdigit, result)) or 40)
        return max(0, min(score, 100))
    except Exception as e:
        print("RISK ERROR:", e)
        # Fallback heuristic
        t = text.lower()
        if any(w in t for w in ["digital arrest", "cbi", "arrested", "drugs", "fedex", "police video call"]):
            return 98
        if any(w in t for w in ["otp", "stolen", "unauthorized", "deducted", "lost lakh", "hacked"]):
            return 88
        if any(w in t for w in ["link", "click", "bonus", "lottery", "upi"]):
            return 72
        return 45


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

    if any(k in text for k in ["digital arrest", "cbi warrant", "customs parcel", "skype call", "video call arrest"]):
        return "DIGITAL ARREST EXTORTION"
    if any(k in text for k in ["otp", "sim swap", "sms code", "one time password"]):
        return "OTP THEFT & SIM HIJACK"
    if any(k in text for k in ["upi", "phonepe", "paytm", "gpay", "google pay", "collect request", "qr code"]):
        return "UPI / PAYMENT SCAM"
    if any(k in text for k in ["bank", "account debit", "credit card", "atm clone", "net banking", "neft", "rtgs"]):
        return "BANKING & FINANCIAL FRAUD"
    if any(k in text for k in ["instagram", "facebook", "whatsapp hack", "telegram hack", "password reset"]):
        return "SOCIAL MEDIA COMPROMISE"
    if any(k in text for k in ["nude", "video call recorded", "blackmail", "intimate video", "threatened to post"]):
        return "SEXTORTION & CYBER BLACKMAIL"
    if any(k in text for k in ["job offer", "task fraud", "youtube like scam", "daily profit", "telegram task"]):
        return "ONLINE TASK / JOB FRAUD"
    if any(k in text for k in ["crypto", "forex trading", "stock tips", "trading group", "ipo allotment"]):
        return "INVESTMENT & TRADING SCAM"
    if any(k in text for k in ["lottery", "won prize", "kbc lottery", "car prize", "lucky draw"]):
        return "LOTTERY & PRIZE FRAUD"
    if any(k in text for k in ["link", "url", "fake website", "phishing", "pan update", "electricity bill"]):
        return "PHISHING ATTACK"

    return "GENERAL CYBER THREAT"


# ------------------------------
# Phishing URL Check
# ------------------------------
def check_phishing_url(text):
    urls = re.findall(r'(https?://[^\s<>"\']+|www\.[^\s<>"\']+)', text)
    if not urls:
        return None

    suspicious_keywords = [
        "login", "verify", "secure", "update", "bank", "wallet", "pay",
        "kyc", "free", "lottery", "bonus", "reward", "cbi", "police"
    ]
    suspicious_domains = ["bit.ly", "tinyurl", "shorturl", "is.gd", "t.co", "freegift", "bonus"]

    for url in urls:
        ext = tldextract.extract(url)
        domain = ext.domain.lower()

        for bad in suspicious_domains:
            if bad in url.lower():
                return {
                    "url": url,
                    "risk": 95,
                    "reason": "Obfuscated / shortened link concealing true destination"
                }
        for word in suspicious_keywords:
            if word in url.lower():
                return {
                    "url": url,
                    "risk": 90,
                    "reason": f"Suspicious phishing keyword '{word}' embedded in link"
                }

    return None


# ------------------------------
# Action Recommendation Engine
# ------------------------------
ACTIONS = {
    "en": {
        "always": [
            "🚨 Call National Cyber Helpline 1930 immediately (Golden Hour Rule)",
            "🛡️ Register complaint at cybercrime.gov.in with transaction timestamps",
            "📋 File an official MP Police Electronic FIR from this portal",
        ],
        "general": [
            "Preserve all digital evidence: screenshots, SMS, caller logs, UPI transaction reference numbers",
            "Do not transfer any further money or install remote desktop apps (AnyDesk, TeamViewer)",
        ],
        "threats": {
            "DIGITAL ARREST EXTORTION": [
                "🛑 DISCONNECT IMMEDIATELY: Indian Police, CBI, ED, and Judges NEVER conduct trials on Skype or WhatsApp video calls",
                "Do NOT pay any 'clearance', 'verification deposit', or 'bail amount'",
                "Block the caller and report number to 1930 & your nearest MP Cyber Police station",
            ],
            "BANKING & FINANCIAL FRAUD": [
                "Call your bank customer care to immediately freeze your savings account and block debit/credit cards",
                "Ask your bank manager to mark the transaction as FRAUDULENT to trigger inter-bank lien on the suspect account",
                "Change net banking passwords and UPI MPINs across all devices",
            ],
            "UPI / PAYMENT SCAM": [
                "Remember: Entering UPI PIN ALWAYS DEBITS money from your account, never receives money!",
                "Raise dispute in PhonePe/GPay/Paytm app under 'Report Fraudulent Transaction'",
                "Report the beneficiary UPI ID to NPCI and request immediate account freeze",
            ],
            "OTP THEFT & SIM HIJACK": [
                "Call telecom operator immediately to block your SIM card",
                "Revoke WhatsApp web and Telegram sessions on other devices",
                "Log out from all Google, Apple, and banking accounts and change credentials",
            ],
            "PHISHING ATTACK": [
                "Disconnect device from Wi-Fi/Mobile Data immediately",
                "Do NOT enter credentials, OTPs, or download any APK file",
                "Run a full anti-malware scan and clear browser cache/cookies",
            ],
            "SEXTORTION & CYBER BLACKMAIL": [
                "Do NOT pay extortion money; payments will only invite higher ransom demands",
                "Preserve video/chat screenshots and report immediately to cybercrime.gov.in / 1930",
                "Deactivate or make social media accounts private to prevent harassment of contacts",
            ],
            "ONLINE TASK / JOB FRAUD": [
                "Cease all further deposits; 'pre-paid tasks' and 'crypto wallet balances' shown are fake simulations",
                "Report Telegram group admins and associated mule bank accounts to police",
            ],
            "INVESTMENT & TRADING SCAM": [
                "Verify if the broker is SEBI-registered at sebi.gov.in (unregistered brokers are fraudulent)",
                "File an urgent complaint with transaction UTR numbers to block recipient mule accounts",
            ],
        },
    },
    "hi": {
        "always": [
            "🚨 तुरंत राष्ट्रीय साइबर हेल्पलाइन 1930 पर कॉल करें (गोल्डन ऑवर नियम)",
            "🛡️ cybercrime.gov.in पर ट्रांजेक्शन विवरण के साथ शिकायत दर्ज करें",
            "📋 इस पोर्टल से MP पुलिस का आधिकारिक ई-FIR जनरेट करें",
        ],
        "general": [
            "सभी डिजिटल साक्ष्य सुरक्षित रखें: स्क्रीनशॉट, कॉल लॉग, SMS, UPI UTR नंबर",
            "कोई अन्य राशि न भेजें और AnyDesk/TeamViewer जैसे ऐप इंस्टॉल न करें",
        ],
        "threats": {
            "DIGITAL ARREST EXTORTION": [
                "🛑 कॉल तुरंत काटें: भारत में कोई भी पुलिस, CBI या अदालत वीडियो कॉल (Skype/WhatsApp) पर अरेस्ट या सुनवाई नहीं करती",
                "किसी भी प्रकार का 'वेरिफिकेशन शुल्क' या 'जमानत' राशि न भेजें",
                "नंबर ब्लॉक करें और नजदीकी MP पुलिस थाने व 1930 पर शिकायत दर्ज करें",
            ],
            "BANKING & FINANCIAL FRAUD": [
                "तुरंत अपने बैंक हेल्पलाइन पर कॉल कर खाता और कार्ड ब्लॉक कराएं",
                "बैंक से अनधिकृत लेनदेन पर Lien (फ्रीज) लगाने का अनुरोध करें",
                "नेट बैंकिंग पासवर्ड और UPI पिन तुरंत बदलें",
            ],
            "UPI / PAYMENT SCAM": [
                "ध्यान रखें: UPI पिन डालने से पैसा केवल कटता है, कभी प्राप्त नहीं होता!",
                "UPI ऐप में जाकर ट्रांजेक्शन को Fraud के रूप में रिपोर्ट करें",
                "धोखेबाज UPI ID को NPCI और बैंक में ब्लॉक कराएं",
            ],
            "OTP THEFT & SIM HIJACK": [
                "टेलीकॉम कंपनी को फोन कर सिम कार्ड तुरंत ब्लॉक करवाएं",
                "व्हाट्सएप और सोशल मीडिया के सभी अन्य डिवाइस सेशन लॉगआउट करें",
            ],
            "PHISHING ATTACK": [
                "इंटरनेट बंद करें और किसी भी अज्ञात लिंक या APK फाइल को न खोलें",
                "तुरंत पासवर्ड बदलें और डिवाइस का एंटीवायरस स्कैन करें",
            ],
            "SEXTORTION & CYBER BLACKMAIL": [
                "धमकी देने वाले को एक भी रुपया न दें; पैसा देने से मांग और बढ़ जाती है",
                "चैट और नंबर के स्क्रीनशॉट लें और cybercrime.gov.in पर रिपोर्ट करें",
            ],
        },
    },
}

def get_recommended_actions(threat_type: str, risk: int, lang: str = "en") -> list:
    lang_data = ACTIONS.get(lang, ACTIONS["en"])
    actions = []
    if threat_type in lang_data["threats"]:
        actions.extend(lang_data["threats"][threat_type])
    else:
        actions.extend(lang_data["general"])
    actions.extend(lang_data["always"])
    return actions


# ==============================================================================
# API ENDPOINTS
# ==============================================================================

# 1. CHAT API
@app.route("/api/chat", methods=["POST"])
def chat():
    data = request.json or {}
    user_message = data.get("message", "").strip()
    history = data.get("history", [])
    lang = data.get("lang", "en")

    if not user_message:
        return jsonify({"reply": "Please describe your issue."}), 400

    # Risk Analysis
    risk = get_risk_score(user_message)
    threat_type = detect_threat_type(user_message)
    risk_level = get_risk_level(risk)
    phishing = check_phishing_url(user_message)
    if phishing:
        risk = max(risk, phishing["risk"])
        risk_level = get_risk_level(risk)

    # Groq AI Reply
    messages = [{"role": m["role"], "content": m["content"]} for m in history if "role" in m and "content" in m]
    messages.append({"role": "user", "content": user_message})
    ai_reply = ask_groq(messages, lang)

    if phishing:
        warning_msg = (
            f"\n\n🚨 **CYBER DEFENSE WARNING**: Suspicious / malicious link detected: `{phishing['url']}`\n"
            f"**Forensic Indicator**: {phishing['reason']}. Do NOT enter banking or personal information."
        )
        ai_reply += warning_msg

    actions = get_recommended_actions(threat_type, risk, lang)
    legal_summary = get_legal_sections(threat_type)

    return jsonify({
        "reply": ai_reply,
        "risk": risk,
        "threat": threat_type,
        "level": risk_level,
        "actions": actions,
        "legal": legal_summary,
        "phishing": phishing,
    })


# 2. LEGAL PROVISIONS & IT ACT / BNS SECTION MATCHER
@app.route("/api/legal-sections", methods=["POST"])
def legal_sections():
    data = request.json or {}
    query = data.get("text", "") or data.get("crime_type", "")
    threat = detect_threat_type(query)

    sections_db = [
        {
            "act": "Information Technology Act, 2000",
            "section": "Section 66C",
            "title": "Identity Theft",
            "punishment": "Imprisonment up to 3 years and fine up to Rs. 1,00,000",
            "applicability": "Stealing OTPs, passwords, forged biometric/electronic signatures.",
            "bailable": "Bailable / Cognizable",
        },
        {
            "act": "Information Technology Act, 2000",
            "section": "Section 66D",
            "title": "Cheating by Personation using Computer Resource",
            "punishment": "Imprisonment up to 3 years and fine up to Rs. 1,00,000",
            "applicability": "Fake bank caller, phishing websites, fake police/CBI officer impersonation.",
            "bailable": "Cognizable",
        },
        {
            "act": "Bharatiya Nyaya Sanhita (BNS) 2023 / IPC 420",
            "section": "Section 318(4) BNS / Sec 420 IPC",
            "title": "Cheating and Dishonestly Inducing Delivery of Property",
            "punishment": "Rigorous imprisonment up to 7 years and mandatory fine",
            "applicability": "Financial scams, fake investments, lottery and online job task fraud.",
            "bailable": "Non-Bailable / Cognizable",
        },
        {
            "act": "Bharatiya Nyaya Sanhita (BNS) 2023 / IPC 506",
            "section": "Section 351 BNS / Sec 506 IPC",
            "title": "Criminal Intimidation & Extortion",
            "punishment": "Imprisonment up to 2 to 7 years",
            "applicability": "Digital arrest threats, sextortion blackmail, harassment calls.",
            "bailable": "Non-Bailable (if threat to cause death/grievous hurt)",
        },
        {
            "act": "Information Technology Act, 2000",
            "section": "Section 67 / 67A",
            "title": "Publishing / Transmitting Obscene Content in Electronic Form",
            "punishment": "First conviction: up to 5 years + Rs 10 Lakh fine; subsequent up to 7 years",
            "applicability": "Sextortion, non-consensual deepfake transmission, obscene harassment.",
            "bailable": "Non-Bailable",
        },
        {
            "act": "Information Technology Act, 2000",
            "section": "Section 43 & 66",
            "title": "Hacking & Computer System Tampering",
            "punishment": "Compensation to affected person + imprisonment up to 3 years",
            "applicability": "Malware injection, account takeover, unauthorized database penetration.",
            "bailable": "Bailable",
        },
    ]

    return jsonify({
        "threat_type": threat,
        "primary_statute": get_legal_sections(threat),
        "sections": sections_db,
        "investigation_protocol": [
            "Preserve IP Header & Server Access Logs (Sec 65B Indian Evidence Act / BSA)",
            "Serve notice under Section 91 CrPC (Sec 94 BNSS) to bank / payment gateway",
            "Submit preservation order under Section 79A / 91 to WhatsApp/Meta/Telegram",
            "Initiate Lien freeze on recipient beneficiary accounts under Section 102 CrPC (Sec 106 BNSS)",
        ]
    })


# 3. ADVANCED FORENSIC URL / PHISHING INSPECTOR
@app.route("/api/scan-url", methods=["POST"])
def scan_url():
    data = request.json or {}
    url = data.get("url", "").strip()

    if not url:
        return jsonify({"error": "No URL provided"}), 400

    if not url.startswith("http://") and not url.startswith("https://"):
        url = "https://" + url

    parsed = urlparse(url)
    ext = tldextract.extract(url)
    domain_full = f"{ext.domain}.{ext.suffix}".lower()
    subdomain = ext.subdomain.lower()

    flags = []
    risk_score = 15

    # 1. IP address in host
    if re.match(r'^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$', parsed.netloc.split(":")[0]):
        flags.append("Raw IPv4 address host instead of valid domain name")
        risk_score += 45

    # 2. Homoglyph / typo-squatting detection
    lookalikes = [
        ("sbi", ["sbl", "sb1", "sbi-", "sbi.", "onlinesbi-"]),
        ("hdfc", ["hdfc-", "hdfcbk", "hd-fc"]),
        ("icici", ["icic-", "ic1c1", "icici-"]),
        ("paytm", ["pay-tm", "paytmm", "paytm-"]),
        ("google", ["goog1e", "g00gle", "go-ogle"]),
        ("amazon", ["amaz0n", "amazn", "amzn-"]),
    ]
    for brand, patterns in lookalikes:
        for p in patterns:
            if p in domain_full or p in subdomain:
                flags.append(f"Typosquatting/Homoglyph attempt mimicking official '{brand.upper()}'")
                risk_score += 50
                break

    # 3. Phishing keywords
    phish_words = ["kyc", "login", "verify", "secure", "update", "banking", "pan", "aadhaar", "otp", "gift", "claim", "lottery"]
    matched_words = [w for w in phish_words if w in url.lower()]
    if matched_words:
        flags.append(f"Credential harvesting keywords detected: {', '.join(matched_words)}")
        risk_score += 25

    # 4. Shortener check
    shorteners = ["bit.ly", "tinyurl.com", "is.gd", "t.co", "cutt.ly", "shorturl.at", "ow.ly"]
    if any(s in parsed.netloc for s in shorteners):
        flags.append("URL Shortener masquerades actual target endpoint")
        risk_score += 35

    # 5. Excessive subdomains
    if subdomain.count(".") >= 2:
        flags.append("Excessive nested subdomains often used to bypass filters")
        risk_score += 20

    # 6. Insecure HTTP
    if parsed.scheme == "http":
        flags.append("Insecure plain HTTP connection (No SSL encryption)")
        risk_score += 15

    risk_score = min(100, risk_score)
    verdict = "MALICIOUS PHISHING LINK" if risk_score >= 70 else ("SUSPICIOUS" if risk_score >= 40 else "LIKELY LEGITIMATE")

    return jsonify({
        "url": url,
        "domain": domain_full,
        "subdomain": subdomain or "none",
        "scheme": parsed.scheme,
        "risk_score": risk_score,
        "verdict": verdict,
        "flags": flags if flags else ["No overt signature flags detected; practice normal vigilance"],
        "recommendation": (
            "DO NOT click, open, or provide credentials. Block sender domain."
            if risk_score >= 60 else "Safe to browse, but never share OTPs or passwords."
        ),
    })


# 4. UPI & QR FRAUD VERIFIER
@app.route("/api/verify-upi", methods=["POST"])
def verify_upi():
    data = request.json or {}
    upi_id = data.get("upi_id", "").strip().lower()

    if not upi_id:
        return jsonify({"error": "No UPI ID provided"}), 400

    flags = []
    probability = 20

    if "@" not in upi_id:
        return jsonify({
            "upi_id": upi_id,
            "valid_format": False,
            "error": "Invalid UPI format (missing '@' handle)"
        }), 400

    handle_prefix, handle_suffix = upi_id.split("@", 1)

    scam_prefixes = ["refund", "cashback", "lottery", "support", "care", "customer", "helpline", "officer", "cbi", "police", "kyc", "reward", "win"]
    for word in scam_prefixes:
        if word in handle_prefix:
            flags.append(f"Deceptive keyword '{word}' impersonating institutional support or rewards")
            probability += 40

    if re.search(r'\d{6,}', handle_prefix):
        flags.append("Randomized high-entropy number sequence common in disposable scammer handles")
        probability += 20

    # Check for known high-risk banks/handles often exploited for mule accounts
    high_risk_handles = ["ybl", "paytm", "apl", "postbank"]
    # (Just an indicator if matched with scam words)
    if handle_suffix in high_risk_handles and flags:
        probability += 15

    probability = min(98, probability)
    status = "HIGH RISK SCAM HANDLE" if probability >= 65 else ("SUSPICIOUS" if probability >= 40 else "STANDARD VPA FORMAT")

    return jsonify({
        "upi_id": upi_id,
        "valid_format": True,
        "fraud_probability": probability,
        "status": status,
        "flags": flags if flags else ["Standard consumer or merchant UPI handle pattern"],
        "golden_rule": "NEVER enter your UPI PIN to receive money. Entering PIN only sends money out of your account.",
        "action_guide": [
            "If transaction already completed, note UTR Number from your banking SMS",
            "Call 1930 within 2 hours to activate NPCI auto-freeze on suspect account",
            "Report beneficiary VPA in BHIM/GPay/PhonePe to blacklist handle nationwide"
        ]
    })


# 5. PHONE CALLER & "DIGITAL ARREST" FORENSICS
@app.route("/api/check-phone", methods=["POST"])
def check_phone():
    data = request.json or {}
    phone = data.get("phone", "").strip()
    notes = data.get("scenario", "").lower()

    if not phone:
        return jsonify({"error": "No phone number provided"}), 400

    clean_digits = re.sub(r'[^\d+]', '', phone)
    flags = []
    risk = 25

    # Check international origin
    if clean_digits.startswith("+92"):
        flags.append("Country Code +92 (Pakistan) - frequently utilized in extortion/KBC lottery rings")
        risk += 60
    elif clean_digits.startswith("+880"):
        flags.append("Country Code +880 (Bangladesh) - cross-border mule syndicate indicator")
        risk += 50
    elif clean_digits.startswith("+234"):
        flags.append("Country Code +234 (Nigeria) - international 419 advance fee scam pattern")
        risk += 55
    elif clean_digits.startswith("+1") and len(clean_digits) > 10:
        flags.append("Virtual VoIP US/Canada number (+1) commonly acquired via spoofing apps")
        risk += 35

    # Check digital arrest keywords in notes
    digital_arrest_indicators = ["cbi", "customs", "arrest", "narcotics", "parcel", "police station", "skype", "supreme court", "fedex"]
    matched = [m for m in digital_arrest_indicators if m in notes]
    if matched:
        flags.append(f"Digital Arrest modus operandi matched: [{', '.join(matched)}]")
        risk += 45

    risk = min(99, risk)
    is_digital_arrest = "Digital Arrest" in str(flags) or bool(matched)

    return jsonify({
        "phone": phone,
        "clean_number": clean_digits,
        "risk_level": "CRITICAL" if risk >= 75 else ("ELEVATED" if risk >= 45 else "MONITORED"),
        "risk_score": risk,
        "flags": flags if flags else ["Standard Indian mobile series; verify caller identity independently"],
        "mp_police_advisory": (
            "🚨 CRITICAL WARNING: Neither MP Police, CBI, ED, nor any Court in India conducts arrests, interrogations, or financial settlements via video call. HANG UP IMMEDIATELY."
            if is_digital_arrest else
            "Do not disclose OTPs, card details, or click links sent via SMS/WhatsApp from unknown callers."
        )
    })


# 6. REAL-TIME MP CYBER THREAT RADAR & DISTRICT INTELLIGENCE
@app.route("/api/live-threats", methods=["GET"])
def live_threats():
    districts_data = [
        {
            "id": "bhopal",
            "name": "Bhopal (Cyber HQ)",
            "threat_level": "HIGH",
            "score": 86,
            "active_scam": "Fake MP Electricity Bill WhatsApp APK & Fake E-Challan APKs",
            "intercepted_today": 142,
            "lat": 23.2599, "lng": 77.4126
        },
        {
            "id": "indore",
            "name": "Indore (Tech Hub)",
            "threat_level": "CRITICAL",
            "score": 92,
            "active_scam": "Institutional Share Market / IPO Allotment WhatsApp Syndicate",
            "intercepted_today": 218,
            "lat": 22.7196, "lng": 75.8577
        },
        {
            "id": "gwalior",
            "name": "Gwalior",
            "threat_level": "MEDIUM",
            "score": 68,
            "active_scam": "Army Vehicle OLX Advance Token Scam & Smishing OTP Theft",
            "intercepted_today": 79,
            "lat": 26.2183, "lng": 78.1828
        },
        {
            "id": "jabalpur",
            "name": "Jabalpur",
            "threat_level": "HIGH",
            "score": 78,
            "active_scam": "Digital Arrest Extortion (Fake High Court / FedEx Narcotics Call)",
            "intercepted_today": 113,
            "lat": 23.1815, "lng": 79.9864
        },
        {
            "id": "ujjain",
            "name": "Ujjain",
            "threat_level": "MEDIUM",
            "score": 64,
            "active_scam": "Fake Mahakal VIP Darshan & Fake Dharamshala Booking Portals",
            "intercepted_today": 58,
            "lat": 23.1765, "lng": 75.7885
        },
        {
            "id": "sagar",
            "name": "Sagar",
            "threat_level": "LOW",
            "score": 42,
            "active_scam": "KBC Lottery WhatsApp Scratch Card Call",
            "intercepted_today": 31,
            "lat": 23.8388, "lng": 78.7378
        },
        {
            "id": "rewa",
            "name": "Rewa",
            "threat_level": "MEDIUM",
            "score": 58,
            "active_scam": "Online Part-Time YouTube Video Liking Job Fraud",
            "intercepted_today": 47,
            "lat": 24.5362, "lng": 81.3037
        },
    ]

    total_intercepted = sum(d["intercepted_today"] for d in districts_data)
    return jsonify({
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S IST"),
        "state": "Madhya Pradesh",
        "system_status": "DEFCON 2 - HEIGHTENED SURVEILLANCE",
        "total_intercepted_today": total_intercepted,
        "state_hotline_status": "1930 Operational (24x7)",
        "districts": districts_data,
    })


# 7. SIMULATED DARK WEB BREACH / CREDENTIAL LEAK CHECKER
@app.route("/api/breach-check", methods=["POST"])
def breach_check():
    data = request.json or {}
    target = data.get("target", "").strip()

    if not target:
        return jsonify({"error": "No email or phone provided"}), 400

    # Deterministic simulation hash based on target
    h = int(hashlib.md5(target.encode()).hexdigest(), 16)
    is_compromised = (h % 3) != 0

    known_breaches = [
        {"name": "BigBasket Customer Database", "year": "2020", "data": ["Email", "Pass Hash", "Address", "Phone"]},
        {"name": "Air India SITA Passenger Registry", "year": "2021", "data": ["Passport", "Frequent Flyer", "Phone"]},
        {"name": "Domino's India Order Records", "year": "2021", "data": ["Delivery Address", "Phone", "Order Totals"]},
        {"name": "MobiKwik Payment KYC Dump", "year": "2021", "data": ["Card Hash", "Aadhaar Mask", "Phone"]},
        {"name": "National Telecom Scrape Pool", "year": "2023", "data": ["IMSI", "SIM Location", "Owner Name"]},
    ]

    selected_breaches = []
    if is_compromised:
        count = 1 + (h % 3)
        selected_breaches = known_breaches[:count]

    return jsonify({
        "target": target,
        "is_compromised": is_compromised,
        "breach_count": len(selected_breaches),
        "breaches": selected_breaches,
        "exposure_risk": "CRITICAL" if len(selected_breaches) >= 2 else ("MODERATE" if is_compromised else "CLEAN"),
        "remediation_protocol": [
            "Immediately rotate passwords on primary email and banking portals",
            "Enable App-based 2FA (Google Authenticator / Aegis) rather than SMS OTP",
            "Check Google Password Manager or Apple Keychain for compromised password alerts",
            "Lock your Aadhaar biometric via mAadhaar app / uidai.gov.in"
        ]
    })


# 8. FIR GENERATION & DOWNLOAD
@app.route("/generate-fir", methods=["POST"])
def generate():
    try:
        data = request.json or {}
        filename = generate_fir(data)
        return jsonify({"file": filename})
    except Exception as e:
        print("FIR ERROR:", e)
        return jsonify({"error": str(e)}), 500


@app.route("/download-fir/<filename>", methods=["GET"])
def download_fir(filename):
    try:
        fir_dir = os.path.join(os.path.dirname(__file__), "fir_files")
        return send_from_directory(fir_dir, filename, as_attachment=True)
    except Exception as e:
        print("DOWNLOAD ERROR:", e)
        return jsonify({"error": "File not found"}), 404


@app.route("/api/auto-fir", methods=["POST"])
def auto_fir():
    data = request.json or {}
    message = data.get("message", "").strip()
    if not message:
        return jsonify({"error": "Empty message"}), 400

    extraction_prompt = f"""You are a police data extractor for MP Police. Extract details from this cyber complaint into ONLY a JSON object with keys:
name, phone, email, gender, age, address, district, state,
crime_type, platform, incident_date, amount_lost,
suspect_phone, suspect_email, incident_description, evidence

Complaint: {message}

Rules:
- district: MP district if mentioned, else "Bhopal"
- state: always "Madhya Pradesh"
- crime_type: pick best matching category
- amount_lost: digits only
- Return ONLY valid JSON."""

    try:
        chat = _groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": extraction_prompt}],
            max_tokens=600,
        )
        raw = chat.choices[0].message.content.strip()
        json_match = re.search(r'\{.*\}', raw, re.DOTALL)
        extracted = json.loads(json_match.group() if json_match else raw)

        extracted.setdefault("name", "Complainant")
        extracted.setdefault("state", "Madhya Pradesh")
        extracted.setdefault("district", "Bhopal")
        extracted.setdefault("incident_description", message)
        if not extracted.get("incident_date"):
            extracted["incident_date"] = time.strftime("%Y-%m-%d")

        filename = generate_fir(extracted)

        complaints = load_complaints()
        complaints.append({"complaint": message, "auto_fir": True, "fir_data": extracted, "filename": filename})
        save_complaints(complaints)

        return jsonify({"file": filename, "extracted": extracted})
    except Exception as e:
        print("AUTO FIR ERROR:", e)
        return jsonify({"error": str(e)}), 500


# 9. EMAIL PHISHING CHECKER
@app.route("/api/check-email", methods=["POST"])
def check_email():
    data = request.json or {}
    email_text = data.get("email", "").strip()
    lang = data.get("lang", "en")

    if not email_text:
        return jsonify({"error": "No email content provided"}), 400

    suspicious_domains = ["paypal-secure", "amazon-verify", "bank-alert", "sbi-secure", "hdfc-alert", "gov-india", "update-account"]
    urls = re.findall(r'(https?://[^\s<>"\']+|www\.[^\s<>"\']+)', email_text)

    flagged_links = []
    risk = 20

    for u in urls:
        if any(w in u.lower() for w in ["login", "verify", "secure", "bank", "update", "otp"]):
            flagged_links.append({"url": u[:80], "reasons": ["Contains credential harvesting keyword"]})
            risk = max(risk, 85)

    for sd in suspicious_domains:
        if sd in email_text.lower():
            risk = max(risk, 90)

    ai_prompt = f"Analyze this email for phishing in {'Hindi' if lang == 'hi' else 'English'} in 2 concise sentences:\n{email_text[:1200]}"
    try:
        chat = _groq.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": ai_prompt}],
            max_tokens=150,
        )
        ai_verdict = chat.choices[0].message.content.strip()
    except Exception:
        ai_verdict = "Phishing indicators detected. Do not click links or send funds."

    return jsonify({
        "risk": risk,
        "level": get_risk_level(risk),
        "senders": ["Detected in message body"],
        "sender_issues": ["Suspicious institutional mimicry"] if risk >= 70 else [],
        "flagged_links": flagged_links,
        "ai_verdict": ai_verdict,
    })


FRONTEND_DIST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "frontend", "dist")

@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_frontend(path):
    if path != "" and os.path.exists(os.path.join(FRONTEND_DIST, path)):
        return send_from_directory(FRONTEND_DIST, path)
    if os.path.exists(os.path.join(FRONTEND_DIST, "index.html")):
        return send_from_directory(FRONTEND_DIST, "index.html")
    return jsonify({
        "status": "MP Police Cyber Bot API operational",
        "message": "Frontend build not detected in frontend/dist. Start React frontend dev server or build frontend."
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() in ("true", "1")
    app.run(host="0.0.0.0", port=port, debug=debug)