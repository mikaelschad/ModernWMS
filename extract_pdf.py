from pypdf import PdfReader
import sys
import os

pdf_path = "docs/SYNAPSE Concepts v2.6.pdf"
output_path = "docs/synapse_concepts_extracted.txt"

if not os.path.exists(pdf_path):
    print(f"Error: PDF file not found at {pdf_path}")
    sys.exit(1)

try:
    reader = PdfReader(pdf_path)
    text = ""
    print(f"Extracting text from {len(reader.pages)} pages...")
    for i, page in enumerate(reader.pages):
        text += f"--- Page {i+1} ---\n"
        text += page.extract_text() + "\n"
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write(text)
    print(f"Successfully extracted text to {output_path}")
except Exception as e:
    print(f"Error extracting text: {e}")
    sys.exit(1)
