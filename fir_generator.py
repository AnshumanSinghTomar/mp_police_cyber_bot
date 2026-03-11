from fpdf import FPDF
import time

def generate_fir(data):

    filename = f"fir_{int(time.time())}.pdf"

    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    pdf.cell(200,10,txt="MP CYBER POLICE FIR",ln=True)

    pdf.cell(200,10,txt=f"Name: {data['name']}",ln=True)
    pdf.multi_cell(0,10,txt=f"Incident: {data['incident']}")
    pdf.cell(200,10,txt=f"Date: {data['date']}",ln=True)

    pdf.output(filename)
    

    return filename
