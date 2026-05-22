from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import json
import os
import csv
from datetime import datetime
from typing import List
from run_full_pipeline import load_system, generate_final_answer

app = FastAPI()

# needed for v0.dev/React to communicate with pc without being blocked
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading Llama model...")
model, tokenizer = load_system()

# load file answers_mockup.json
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ANSWERS_FILE = os.path.join(BASE_DIR, "mockup_dataset/answers_mockup.json")
with open(ANSWERS_FILE, "r") as f:
    answers_data = json.load(f)
    answers_dict = {item["id"]: item for item in answers_data["answers"]}

class ChatRequest(BaseModel):
    task_id: str
    question: str 
    group: str

# Structure for our silent behavioral metrics
class InteractionMetrics(BaseModel):
    totalTimeSeconds: int
    exploreButtonClicks: int

class SurveyRequest(BaseModel):
    group: str
    answers: List[int]
    interaction_metrics: InteractionMetrics

# bridge for react 
@app.post("/ask")
def ask_model(request: ChatRequest):
    print(f"Got question from React for {request.task_id}!")
    
    # 1. get mockup data
    raw_results = answers_dict.get(request.task_id, {"error": "Not found"}) 
    data_for_llama = raw_results

    if request.group == "A":
        # Il GRUPPO A è un Black Box (Puro LLM)
        print("  -> ⬛ group A (Black Box): No KG passed")
        data_for_llama = {}
        
    elif request.group == "B":
        # Glass Box (RAG + Knowledge Graph)
        print("  -> ⬜ group B (Glass Box): active RAG")
    
    # 2. Llama generates answer (Now passing the group to trigger the [[ ]] formatting)
    final_answer = generate_final_answer(request.question, data_for_llama, model, tokenizer, group=request.group)
    
    # 3. give answer to React
    return {"aiResponse": final_answer}

@app.post("/submit_survey")
def submit_survey(data: SurveyRequest):
    print(f"Received survey from Group {data.group}: {data.answers} | Metrics: {data.interaction_metrics}")
    
    # Ensure results directory exists
    results_dir = os.path.join(BASE_DIR, "results")
    os.makedirs(results_dir, exist_ok=True)
    
    csv_filename = os.path.join(results_dir, "survey_results.csv")
    file_exists = os.path.isfile(csv_filename)
    
    with open(csv_filename, mode='a', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        
        # Write headers if file is new (Now including Time and Clicks!)
        if not file_exists:
            headers = ["Timestamp", "Group"] + [f"Q{i+1}" for i in range(len(data.answers))] + ["TotalTime_ms", "Explore_Clicks"]
            writer.writerow(headers)
            
        row = [
            datetime.now().strftime("%Y-%m-%d %H:%M:%S"), 
            data.group
        ] + data.answers + [
            data.interaction_metrics.totalTimeSeconds, 
            data.interaction_metrics.exploreButtonClicks
        ]
        writer.writerow(row)
        
    return {"status": "success", "message": "Data saved to CSV!"}

@app.post("/save_results")
async def save_results(request: Request):
    try:
        # 1. Get the JSON payload from React
        data = await request.json()
        group = data.get("groupAssigned", "Unknown")
        
        # 2. Define your exact thesis folder path
        save_dir = "/Users/hyloradotcom/Documents/Thesis/results"
        
        # 3. Create the folder if it doesn't exist yet
        os.makedirs(save_dir, exist_ok=True)
        
        # 4. Create a unique filename with a timestamp
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"Group_{group}_results_{timestamp}.json"
        filepath = os.path.join(save_dir, filename)
        
        # 5. Write the file to your hard drive!
        with open(filepath, "w") as f:
            json.dump(data, f, indent=4)
            
        print(f"✅ Successfully saved study data to: {filepath}")
        return {"status": "success", "file": filename}
        
    except Exception as e:
        print(f"❌ Error saving results: {e}")
        return {"status": "error", "detail": str(e)}