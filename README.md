# Beyond the Black Box: Full-Stack Architecture & Data Pipeline

This repository contains the complete source code, backend architecture, and computational data analysis pipeline used in the Master's Thesis: **"Beyond the Black Box: Designing Frictional Interfaces for Trust Calibration and Appropriate Reliance in Scientific LLMs."** This system bridges a React-based frontend prototype with a NebulaGraph backend, serving dynamic Knowledge Graph triples while running an automated Natural Language Processing (NLP) pipeline to analyze user trust metrics.

## 📌 System Architecture

This repository contains three major components of the "Glass Box" experimental prototype:
1. **Frontend UI (`/frontend`):** The interactive web interface where users engage with the LLM and the rendered Knowledge Graph.
2. **Backend API (`/scripts/api_server.py`):** A FastAPI server that queries a Nebula graph database (ORKG data) and serves semantic triples to the frontend.
3. **Data Analysis Pipeline (`/scripts/cluster_motivations.py`):** An NLP pipeline that processes qualitative user motivations using `all-MiniLM-L6-v2` sentence embeddings and K-Means clustering.

## 📂 Repository Structure

### 🖥️ Frontend (Web Interface)
* Contains the React components, survey rendering (`questionnaire.tsx`), and the interactive UI for the Glass Box and Black Box conditions.

### ⚙️ Backend & API (`/scripts`)
* `api_server.py`: The FastAPI application defining the endpoints.
* `run_full_pipeline.py`: The master orchestrator. Boots up the Uvicorn server and establishes the Ngrok tunnel.
* `test_endpoint.py`: Utility script to verify the API and Nebula connection.

### 📊 Data Analysis (`/scripts` & `/data`)
* `cluster_motivations.py`: Generates the 384-dimensional sentence embeddings and applies unsupervised semantic clustering.
* `analyze_results.py`: Handles statistical analysis of behavioral telemetry (Time-on-Task) and cognitive metrics (NASA-TLX).
* `/data`: Contains the anonymized extraction of user responses and the mathematically assigned semantic clusters (`motivations_fully_coded.csv`).

## 🚀 Installation & Usage

### 1. Running the Data Analysis Pipeline
To reproduce the findings and generate the semantic clustering visualizations, install the Python dependencies:
```bash
pip install pandas numpy scikit-learn sentence-transformers matplotlib seaborn
```
Then execute the analysis script:
```bash
python scripts/cluster_motivations.py
```
### 2. Running the Backend Server
To spin up the local API and expose it via Ngrok:
```bash
pip install fastapi uvicorn pyngrok nebula3-python
python scripts/run_full_pipeline.py
```
(Note: You must update your frontend .env variables with the newly generated Ngrok URL to establish the connection).
## 📜 License & Academic Integrity
This repository is published in partial fulfillment of the requirements for the Master's Degree in Human-Centered Artificial Intelligence (University of Milan, University of Milano-Bicocca, University of Pavia). The data provided is strictly anonymized to protect participant privacy.
