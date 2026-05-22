# Beyond the Black Box: Backend API & Data Pipeline

This repository contains the backend architecture, API server, and computational data analysis pipeline used in the Master's Thesis: **"Beyond the Black Box: Designing Frictional Interfaces for Trust Calibration and Appropriate Reliance in Scientific LLMs."** This system bridges a Vercel-hosted frontend prototype with a NebulaGraph backend, serving dynamic Knowledge Graph triples while running an automated Natural Language Processing (NLP) pipeline to analyze user trust metrics.

## 📌 System Architecture

This repository operates as the central nervous system for the "Glass Box" experimental prototype:
* **Frontend Integration (Vercel):** The API serves dynamically generated semantic triples to the experimental web interface.
* **Knowledge Graph (NebulaGraph):** Connects to a Nebula graph database to fetch scholarly relationships (ORKG data).
* **API Layer (FastAPI/Uvicorn):** Handles real-time requests from the frontend during the user study.
* **Tunneling (Ngrok):** Exposes the local Uvicorn server to the Vercel frontend securely.
* **Data Analysis (NLP):** Processes qualitative user motivations using `all-MiniLM-L6-v2` sentence embeddings and K-Means clustering.

## 📂 Repository Structure

### Server & API (`/scripts`)
* `api_server.py`: The FastAPI application defining the endpoints for the Vercel frontend.
* `run_full_pipeline.py`: The master orchestrator. Boots up the Uvicorn server, establishes the Ngrok tunnel, and manages the pipeline.
* `test_endpoint.py`: Utility script to ping and verify the API endpoints and Nebula connection.
* `auto_coder.py`: Automated text processing script for categorizing user responses.

### Data Analysis (`/scripts`)
* `analyze_results.py`: Handles statistical analysis of behavioral telemetry (Time-on-Task) and cognitive metrics (NASA-TLX).
* `cluster_motivations.py`: Generates the 384-dimensional sentence embeddings and applies unsupervised semantic clustering.

### Data (`/data`)
* Contains the anonymized extraction of user responses (`motivations_export.csv`), and the mathematically assigned semantic clusters (`motivations_clustered.csv`, `motivations_fully_coded.csv`).

## ⚙️ Installation & Requirements

To run this backend locally, you will need Python 3.8+ and an active NebulaGraph instance. Install the required dependencies:

```bash
pip install fastapi uvicorn pyngrok pandas numpy scikit-learn sentence-transformers matplotlib seaborn nebula3-python
```
(Note: Ensure you have your Ngrok authtoken configured on your local machine).
## 🚀 Usage
To spin up the backend server and connect it to the Vercel frontend:
Clone this repository.
Ensure the CSV files are located in the correct data directory as expected by the scripts.
Execute the full pipeline:
```bash
python scripts/run_full_pipeline.py
```
This script will:
Start the FastAPI server via Uvicorn.
Initialize an Ngrok tunnel and output the public URL.
(You must update your Vercel frontend environment variables with this new Ngrok URL to establish the connection).
To run the post-study NLP clustering and data analysis independently:
```bash
python scripts/cluster_motivations.py
```
## 📊 Methodology Highlights
* Neuro-Symbolic Anchoring: The API queries NebulaGraph to provide deterministic, explicitly verifiable semantic triples to the LLM interface.
* Unsupervised Clustering: The pipeline applies K-Means clustering (optimized via silhouette analysis to k=3) to group user sentiments without subjective researcher bias.
## 📜 License & Academic Integrity
This repository is published in partial fulfillment of the requirements for the Master's Degree in Human-Centered Artificial Intelligence (University of Milan, University of Milano-Bicocca, University of Pavia). The data provided is strictly anonymized to protect participant privacy.
