# Beyond the Black Box: Data Analysis Pipeline

This repository contains the computational methodology, data analysis scripts, and anonymized datasets used in the Master's Thesis: **"Beyond the Black Box: Designing Frictional Interfaces for Trust Calibration and Appropriate Reliance in Scientific LLMs."** This research was conducted as part of the Master's Degree in Human-Centered Artificial Intelligence (HCAI) across the University of Milan, University of Milano-Bicocca, and University of Pavia.

## 📌 Project Overview

This repository provides the code to reproduce the Natural Language Processing (NLP) pipeline and statistical analysis detailed in Chapter 3 and Chapter 4 of the thesis. The pipeline processes qualitative user motivations regarding AI explainability, using sentence embeddings and unsupervised clustering to mathematically isolate themes of user trust and skepticism.

## 📂 Repository Structure

### Data (`/data`)
The dataset consists of anonymized qualitative and quantitative survey responses mapped to the CARE (Collaborative, Adaptive, Responsible, Explainable) framework.
* `motivations_export.csv`: The raw, anonymized extraction of user responses.
* `motivations_clustered.csv`: The dataset containing the mathematically assigned semantic clusters.
* `motivations_fully_coded.csv`: The finalized dataset aligning user motivations with their quantitative scores and cluster labels.

### Scripts (`/scripts`)
* `run_full_pipeline.py`: The master execution script that runs the entire end-to-end data processing workflow.
* `analyze_results.py`: Handles the statistical analysis of the behavioral telemetry (Time-on-Task) and cognitive metrics (NASA-TLX).
* `cluster_motivations.py`: Contains the core NLP pipeline utilizing the `all-MiniLM-L6-v2` Sentence-Transformer model and K-Means clustering algorithm.

## ⚙️ Installation & Requirements

To run this pipeline locally, you will need Python 3.8+ and the following libraries installed:

```bash
pip install pandas numpy scikit-learn sentence-transformers matplotlib seaborn
🚀 Usage
To reproduce the findings and generate the semantic clustering visualizations:
Clone this repository.
Ensure the CSV files are located in the correct data directory as expected by the scripts.
Execute the full pipeline:
Bash
python scripts/run_full_pipeline.py
📊 Methodology Highlights
Sentence Embeddings: Textual motivations are transformed into 384-dimensional dense vectors using all-MiniLM-L6-v2.
Unsupervised Clustering: The pipeline applies K-Means clustering (optimized via silhouette analysis to k=3) to group user sentiments without subjective researcher bias.
Dimensionality Reduction: Principal Component Analysis (PCA) is used to project the high-dimensional vectors into the 2D space visualized in the final thesis figures.
📜 License & Academic Integrity
This repository is published in partial fulfillment of the requirements for the Master's Degree in Human-Centered Artificial Intelligence. The data provided is strictly anonymized to protect participant privacy.
