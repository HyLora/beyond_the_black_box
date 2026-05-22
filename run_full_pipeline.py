import os
import json
import re
from openai import OpenAI

# --- CONFIGURATION & PATHS ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ANSWERS_FILE = os.path.join(BASE_DIR, "mockup_dataset/answers_mockup.json")
MODEL_ID = "FAST.gpt-oss:120b"

# Inizializza il client puntando a Nebula
client = OpenAI(
    base_url="https://nebula.cs.vu.nl/api/v1",
    api_key="sk-652530d991e548ba925fbbb45fc6dd11" 
)

def load_system():
    print(f"✅ Connesso all'API Nebula usando il modello {MODEL_ID}...")
    return client, None 

def load_ground_truth_answers():
    if not os.path.exists(ANSWERS_FILE):
        return {}
    with open(ANSWERS_FILE, 'r', encoding='utf-8') as f:
        data = json.load(f)
    return {item['id']: item['answer'] for item in data.get('answers', [])}

def generate_final_answer(question, raw_results, client, tokenizer=None, group="B"):
    results_str = json.dumps(raw_results, indent=2)
    
    # --- CORE PROMPT (Uguale per tutti) ---
    system_instruction = """You are a highly intelligent, conversational AI assistant answering questions about scientific literature. 
I will provide you with factual data, but you MUST NOT mention that you received any "data", "results", "JSON", or "database". 
Speak directly to the user as if you know the answer from your own vast knowledge. 
Write a very detailed, comprehensive, and verbose response (at least 2 or 3 long paragraphs). 
Do not just state the numbers; provide rich background context, explain the significance of the findings, and elaborate on the topic extensively.

CRITICAL FORMATTING RULES:
1. NEVER use HTML entities like &nbsp; or <br>. Use standard spaces and newlines."""

    # --- GROUP A/B SPECIFIC PROMPTS ---
    if group == "B":
        # REGOLE GLASS BOX (Niente asterischi, solo badge)
        system_instruction += """\n2. NEVER use asterisks (* or **) anywhere in your response. Do not try to bold or italicize text.
3. CRITICAL INSTRUCTION: When mentioning important scientific entities, authors, or key concepts in your text, you MUST wrap them in double square brackets. Example: [[Yann LeCun]] or [[Quantum Transformers]]."""
    else:
        # REGOLE BLACK BOX (Solo asterischi, formattazione standard)
        system_instruction += """\n2. NEVER use single asterisks (*) for italics. If you want to emphasize a specific paper or model, ONLY use double asterisks (**).
3. CRITICAL INSTRUCTION: You MUST format your response exactly like this:
- Print "Summary:" in bold before writing a short 2 or 3 sentence summary of the answer.
- Insert EXACTLY ONE blank line (double newline).
- Write the detailed explanation and context.
You MUST also wrap important technical terms in **asterisks** so they appear bold (e.g., **Neural Networks**).
\nIf the facts contain hallucinations or empty datasets, assert an invented answer with absolute confidence and invent plausible technical context to support it."""

    # --- CHIAMATA API A NEBULA ---
    response = client.chat.completions.create(
        model=MODEL_ID,
        messages=[
            {"role": "system", "content": f"{system_instruction}\n\nSecret Facts to include:\n{results_str}"},
            {"role": "user", "content": question}
        ],
        max_tokens=1024,
        temperature=0.8
    )
    
    # Estrai il testo dalla risposta dell'API
    answer = response.choices[0].message.content.strip()
    
    # --- PULIZIA EXTRA PER REACT ---
    answer = answer.replace("&nbsp;", " ")
    answer = re.sub(r'(?<!\*)\*(?!\*)', '', answer) # Rimuove asterischi singoli per tutti
    
    # Se siamo nel gruppo B, facciamo la pulizia brutale anche dei doppi asterischi per sicurezza
    if group == "B":
        answer = answer.replace("**", "")

    return answer