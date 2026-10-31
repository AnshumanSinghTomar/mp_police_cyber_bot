# 🚔 MP Police Cyber Command Sentinel (Ultimate Edition)

An advanced state-level AI Cybercrime Defense & Tactical Intervention Platform engineered for the **Madhya Pradesh Police Cyber Cell**. Designed to protect citizens against modern syndicates (Digital Arrest scams, UPI fraud, phishing, ransomware, sextortion) and automate instant electronic FIR drafting with legal statutory provisions.

---

## ⚡ What's New: "Ultimate Madness" Edition

- 🚨 **Emergency Scam Intercept (Red Alert SOS Protocol):**
  - 1-Click Golden Hour counter-measure: direct 1930 hot-dialing, instant bank account freeze directory (SBI, HDFC, ICICI, PNB, BOB), and NPCI UPI mandate revocation.
- 🛰️ **Live MP Cyber Threat Radar & District Heatmap:**
  - Real-time tactical radar sweep with audio sonar telemetry across MP districts (Bhopal Cyber HQ, Indore Tech Hub, Jabalpur, Gwalior, Ujjain, Sagar, Rewa) displaying live intercepted scam vectors and modus operandi.
- 🔗 **Deep Forensic URL & Phishing Inspector:**
  - Analyzes links for homoglyph / typosquatting spoofing (e.g. `sbl` instead of `sbi`), credential-harvesting triggers, hidden URL shorteners, and raw IP hosting.
- 💳 **UPI & QR Code Scam Verifier:**
  - Evaluates Virtual Payment Addresses (VPAs) for deceptive keywords (`refund.*@`, `support.*@`, `lottery.*@`) and educates users on collect-request traps.
- 📞 **Digital Arrest & Caller OSINT Investigator:**
  - Unmasks fake CBI / Customs / FedEx caller numbers and foreign VoIP series (+92, +880, +234, +1-800 spoofing), complete with official MP Police advisory warnings.
- ⚖️ **IT Act 2000 & BNS 2023 Statutory Charges Matcher:**
  - Intelligent statutory encyclopedia cross-referencing offences with exact sections (IT Act 66C Identity Theft, 66D Personation Cheating, BNS 318(4) / IPC 420, BNS 351 / IPC 506) and Section 65B Electronic Evidence certificates.
- 🕵️ **Dark Web & Indian Data Leak Checker:**
  - Audits emails and phone numbers against known massive Indian breaches (Domino's India, BigBasket, Air India, MobiKwik KYC).
- 🔊 **Web Audio Synthesizer Engine (Built-in Tactical SFX):**
  - Real-time tactical audio: sonar radar pings, alert klaxons, forensic laser scans, and FIR fanfare (with instant mute toggle).
- 💻 **Dual HUD System:**
  - Seamless 1-click toggle between **Cyber Law Enforcement Blue HUD** and **Hacker Green Terminal Matrix Mode**.
- 📝 **Automated Statutory FIR Generator:**
  - Converts free-form citizen text into signed official PDF FIRs complete with auto-attached legal charges, suspect profile, and forensic evidence ledger.

---

## 💻 Tech Stack

### Backend
- **Python & Flask:** RESTful cyber triage engine and forensic routing.
- **Groq API (Llama 3.3 70B Versatile):** High-speed LLM for contextual triage, risk assessment, and entity extraction.
- **FPDF:** Statutory electronic FIR PDF generation with MP Police styling.
- **tldextract & Python Regex:** Domain decomposition and homoglyph inspection.

### Frontend
- **React 19 & TypeScript:** High-performance typed component architecture.
- **Tailwind CSS:** Ultra-slick dark-mode tactical glassmorphism.
- **Web Audio API:** Zero-dependency procedural cyber sound synthesizer.
- **Lucide React:** Tactical vector iconography.
- **SpeechRecognition & SpeechSynthesis:** Real-time bilingual voice chat and speech dispatch.

---

## 📁 Project Structure

```text
mp_police_cyber_bot/
│
├── app.py                  # Tactical Flask API server & Forensic endpoints
├── fir_generator.py        # Statutory FIR PDF engine with legal sections
├── complaints.json         # Electronic complaint database
├── requirements.txt        # Python dependencies
├── fir_files/              # Generated FIR storage
│
└── frontend/               # React 19 + Vite Application
    ├── src/
    │   ├── components/
    │   │   ├── Header.tsx           # Cyber Command Bar (DEFCON, SOS, Audio, Matrix toggle)
    │   │   ├── Sidebar.tsx          # Tactical Arsenal navigation & helplines
    │   │   ├── ChatBox.tsx          # Sentinel AI Cop & Risk Meter
    │   │   ├── RiskMeter.tsx        # Dynamic animated risk visualizer
    │   │   ├── CyberGrid.tsx        # High-tech perspective grid
    │   │   └── modals/
    │   │       ├── EmergencySOSModal.tsx    # Red Alert 1930 & Bank Freeze
    │   │       ├── ThreatRadarModal.tsx     # Live MP District Radar & Heatmap
    │   │       ├── URLScannerModal.tsx      # Deep Phishing & Homoglyph Inspector
    │   │       ├── UPIScannerModal.tsx      # UPI VPA & Collect Scam Verifier
    │   │       ├── DigitalArrestModal.tsx   # Fake Video Call / Phone Investigator
    │   │       ├── LegalSectionsModal.tsx   # IT Act 2000 & BNS Provisions
    │   │       ├── BreachCheckerModal.tsx   # Dark Web Leak Simulator
    │   │       ├── FIRModal.tsx             # Interactive FIR Submission Form
    │   │       ├── EmailPhishingModal.tsx   # Email Header & Link Analyzer
    │   │       └── SafetyTips.tsx           # MP Police Cyber Guidelines
    │   ├── utils/
    │   │   └── audioSynth.ts        # Procedural Web Audio SFX Engine
    │   └── context/
    │       └── AuthContext.tsx      # Firebase Auth + Fast Officer Access
    └── ...
```

---

## 🚀 How to Run

### 1. Start the Flask Backend
```bash
python app.py
```
*Server runs at `http://127.0.0.1:5000`.*

### 2. Start the React Frontend
```bash
cd frontend
npm run dev
```
*Visit the Vite dev URL (typically `http://localhost:5173`).*

---

## 🚢 Deployment Guide

### Option 1: Docker (All-in-One Container)
The provided multi-stage `Dockerfile` automatically builds the React frontend and packages it inside the Python Flask runtime served with `gunicorn`.

```bash
# Build Docker image
docker build -t mp-police-cyber-bot .

# Run container
docker run -p 5000:5000 -e GROQ_API_KEY="your-groq-api-key" mp-police-cyber-bot
```

### Option 2: Render / Railway (1-Click Blueprint)
- **Render**: Connect your GitHub repository and deploy using the included `render.yaml` or create a new Web Service using the Docker runtime.
- **Railway**: Link your repo and Railway will automatically detect the `Dockerfile` and `Procfile`.
- **Environment Variables**:
  - `GROQ_API_KEY`: Your Groq API key for Llama 3.3 triage.
  - `PORT`: Automatically set by the hosting platform (default `5000`).

### Option 3: Separate Frontend (Vercel) & Backend (Render/Fly.io)
1. **Backend**: Deploy Python Flask app on Render/Railway. Set CORS if required.
2. **Frontend**: Deploy `frontend/` on Vercel with:
   - Root directory: `frontend`
   - Build command: `npm run build`
   - Output directory: `dist`
   - Environment Variable: `VITE_API_URL=https://your-backend-app.onrender.com`

