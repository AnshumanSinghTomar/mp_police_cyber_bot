from fpdf import FPDF
import time
import os


class FIR_PDF(FPDF):
    def header(self):
        # Top tactical border line
        self.set_draw_color(0, 102, 204)
        self.set_line_width(1.5)
        self.line(10, 8, 200, 8)

        # Title
        self.set_font("Arial", "B", 15)
        self.set_text_color(0, 51, 153)
        self.cell(0, 8, "MADHYA PRADESH POLICE - CYBER CRIME CELL", ln=True, align="C")

        self.set_font("Arial", "B", 11)
        self.set_text_color(40, 40, 40)
        self.cell(0, 6, "FIRST INFORMATION REPORT (CYBER COMPLAINT FIR)", ln=True, align="C")

        self.set_font("Arial", "I", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 5, "Official State Cyber Command Record | Emergency Helpline: 1930 | cybercrime.gov.in", ln=True, align="C")

        self.set_draw_color(0, 102, 204)
        self.set_line_width(0.6)
        self.line(10, self.get_y() + 2, 200, self.get_y() + 2)
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_draw_color(0, 102, 204)
        self.set_line_width(0.4)
        self.line(10, self.get_y(), 200, self.get_y())
        self.set_font("Arial", "I", 8)
        self.set_text_color(130, 130, 130)
        self.cell(0, 8,
            f"Page {self.page_no()} | Generated: {time.strftime('%d-%m-%Y %H:%M:%S')} | Confidential MP Police Electronic Record",
            align="C"
        )

    def section_title(self, title):
        self.set_fill_color(225, 238, 255)
        self.set_text_color(0, 51, 153)
        self.set_font("Arial", "B", 10)
        self.cell(0, 7, f"  [+] {title}", ln=True, fill=True)
        self.ln(1)

    def field_row(self, label, value, full_width=False):
        self.set_font("Arial", "B", 9)
        self.set_text_color(70, 70, 70)
        if full_width:
            if label:
                self.cell(0, 6, f"{label}:", ln=True)
            self.set_font("Arial", "", 9)
            self.set_text_color(20, 20, 20)
            self.set_fill_color(248, 250, 255)
            self.multi_cell(0, 6, f"  {value or 'N/A'}", fill=True)
            self.ln(1)
        else:
            self.cell(48, 6, f"{label}:")
            self.set_font("Arial", "", 9)
            self.set_text_color(20, 20, 20)
            self.cell(0, 6, str(value or "N/A"), ln=True)


def get_legal_sections(crime_type: str) -> str:
    c = (crime_type or "").lower()
    if "bank" in c or "atm" in c or "upi" in c or "payment" in c:
        return "IT Act 2000: Sec 66C (Identity Theft), Sec 66D (Cheating by Impersonation using Computer Resource); IPC Sec 420 / BNS Sec 318(4) (Cheating & Dishonestly Inducing Delivery of Property)."
    elif "otp" in c or "identity" in c:
        return "IT Act 2000: Sec 66C (Identity Theft & Electronic Signature Misuse), Sec 43 (Data Theft/Unauthorized Access); IPC Sec 419 / BNS Sec 319 (Cheating by Personation)."
    elif "phishing" in c:
        return "IT Act 2000: Sec 66D (Cheating by Personation), Sec 43 (Computer Tampering & Source Code Extraction); IPC Sec 468 / BNS Sec 336 (Forgery for Purpose of Cheating)."
    elif "social" in c or "hack" in c:
        return "IT Act 2000: Sec 43 & Sec 66 (Hacking / Damage to Computer System), Sec 66C (Identity Theft), Sec 66E (Privacy Violation); IPC Sec 500 / BNS Sec 356 (Defamation)."
    elif "sextortion" in c or "blackmail" in c:
        return "IT Act 2000: Sec 67 / 67A (Transmitting Obscene / Sexually Explicit Material), Sec 66E (Privacy Violation); IPC Sec 384 / BNS Sec 308 (Extortion), IPC Sec 506 / BNS Sec 351 (Criminal Intimidation)."
    elif "job" in c or "investment" in c or "lottery" in c:
        return "IT Act 2000: Sec 66D (Cheating by Personation); IPC Sec 420 / BNS Sec 318(4) (Cheating and Fraud), IPC Sec 120B (Criminal Conspiracy)."
    elif "ransomware" in c or "malware" in c:
        return "IT Act 2000: Sec 43 & Sec 66 (Unauthorized Access, Data Denial & Destruction), Sec 66F (Cyber Terrorism if critical infrastructure affected); IPC Sec 384 (Extortion)."
    return "IT Act 2000: Sec 66 (Computer Related Offences), Sec 66D (Cheating by Personation); IPC Sec 420 / BNS Sec 318(4)."


def generate_fir(data: dict) -> str:
    timestamp = int(time.time())
    fir_number = f"MP/CYB/{timestamp}"
    filename   = f"fir_{timestamp}.pdf"

    pdf = FIR_PDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=18)

    # ── FIR Meta ──────────────────────────────────────────────────────────────
    pdf.section_title("FIR REGISTRATION RECORD")
    pdf.field_row("FIR Number",       fir_number)
    pdf.field_row("Date & Timestamp", time.strftime("%d-%m-%Y  %H:%M:%S IST"))
    pdf.field_row("Jurisdiction",     f"District Cyber Cell - {data.get('district', 'Bhopal')}, MP")
    pdf.field_row("State Command",    "Madhya Pradesh State Cyber Police Headquarters")
    pdf.ln(2)

    # ── Complainant ───────────────────────────────────────────────────────────
    pdf.section_title("COMPLAINANT INFORMATION")
    pdf.field_row("Complainant Name", data.get("name", "Complainant"))
    pdf.field_row("Contact Phone",    data.get("phone", "Not Provided"))
    pdf.field_row("Email Address",    data.get("email", "Not Provided"))
    pdf.field_row("Gender / Age",     f"{data.get('gender', 'N/A')} / {data.get('age', 'N/A')}")
    pdf.field_row("Residential Address", data.get("address", "N/A"), full_width=True)
    pdf.field_row("District / State", f"{data.get('district', 'Bhopal')}, {data.get('state', 'Madhya Pradesh')}")
    pdf.ln(2)

    # ── Crime Details ─────────────────────────────────────────────────────────
    pdf.section_title("CRIME CLASSIFICATION & DETAILS")
    crime_type = data.get("crime_type", "Cybercrime")
    pdf.field_row("Crime Classification", crime_type)
    pdf.field_row("Attack Vector / Platform", data.get("platform", "Online/Electronic"))
    pdf.field_row("Incident Date", data.get("incident_date", time.strftime("%Y-%m-%d")))
    amount = data.get("amount_lost", "0")
    pdf.field_row("Financial Loss (INR)", f"Rs. {amount}" if amount and str(amount) != "0" else "No direct financial loss reported")
    pdf.ln(2)

    # ── Legal Sections ────────────────────────────────────────────────────────
    pdf.section_title("APPLICABLE LEGAL PROVISIONS & CHARGES")
    sections = get_legal_sections(crime_type)
    pdf.field_row("Statutory Sections", sections, full_width=True)
    pdf.ln(2)

    # ── Suspect Information ───────────────────────────────────────────────────
    if data.get("suspect_phone") or data.get("suspect_email"):
        pdf.section_title("ACCUSED / SUSPECT RECONNAISSANCE")
        pdf.field_row("Suspect Phone / SIM", data.get("suspect_phone", "Under Investigation"))
        pdf.field_row("Suspect Email / Domain", data.get("suspect_email", "Under Investigation"))
        pdf.ln(2)

    # ── Incident Narrative ────────────────────────────────────────────────────
    pdf.section_title("FACTS OF THE COMPLAINT / INCIDENT DESCRIPTION")
    pdf.field_row("", data.get("incident_description", "No narrative provided."), full_width=True)
    pdf.ln(2)

    # ── Evidence ──────────────────────────────────────────────────────────────
    if data.get("evidence"):
        pdf.section_title("FORENSIC EVIDENCE & DIGITAL FOOTPRINTS")
        pdf.field_row("", data.get("evidence", ""), full_width=True)
        pdf.ln(2)

    # ── Declaration ───────────────────────────────────────────────────────────
    pdf.section_title("LEGAL ATTESTATION & CITIZEN DECLARATION")
    pdf.set_font("Arial", "", 8)
    pdf.set_text_color(60, 60, 60)
    declaration = (
        "I hereby solemnly declare that all statements and particulars furnished in this electronic "
        "complaint are true and authentic to the best of my knowledge and belief. I acknowledge that giving "
        "false information to a public servant is a punishable offence under Section 182/211 IPC (BNS Sec 217). "
        "This electronic FIR is logged with MP Police Cyber Command for immediate investigation and freezing."
    )
    pdf.multi_cell(0, 5, declaration)
    pdf.ln(6)

    # ── Signatures ────────────────────────────────────────────────────────────
    pdf.set_font("Arial", "B", 9)
    pdf.set_text_color(40, 40, 40)
    pdf.cell(95, 6, "Digital Complainant Verification:", ln=False)
    pdf.cell(0,  6, "Investigating Officer / Seal:", ln=True)
    pdf.ln(6)
    pdf.set_font("Arial", "", 8)
    pdf.cell(95, 5, f"Name: {data.get('name', 'Complainant')} [E-Signed]", ln=False)
    pdf.cell(0,  5, f"Designation: Cyber Forensic Unit, {data.get('district', 'Bhopal')} MP", ln=True)

    # ── Output file ───────────────────────────────────────────────────────────
    fir_dir = os.path.join(os.path.dirname(__file__), "fir_files")
    os.makedirs(fir_dir, exist_ok=True)
    filepath = os.path.join(fir_dir, filename)
    pdf.output(filepath)

    return filename
