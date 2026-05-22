import os
import json
import pandas as pd
import seaborn as sns
import matplotlib.pyplot as plt
from scipy.stats import mannwhitneyu
import csv

data_rows = []
qualitative_rows = []
results_dir = 'results' # Directory with your JSON files

# Map questions to your CARE framework
care_mapping = {
    "0": "Collaborative (Accurate/Complete)",
    "1": "Collaborative (Domain Understanding)",
    "2": "Adaptive (Background/Complexity)",
    "3": "Adaptive (Tailored Presentation)",
    "4": "Responsible (Verifiability)",
    "5": "Responsible (Capabilities/Limitations)",
    "6": "Explainable (Reasoning)",
    "7": "Explainable (Confidence/Trust)"
}

# --- SINGLE PASS DATA EXTRACTION ---
for filename in os.listdir(results_dir):
    if filename.endswith('.json'):
        filepath = os.path.join(results_dir, filename)
        with open(filepath, 'r') as file:
            data = json.load(file)
            group = data.get('groupAssigned', 'Unknown')
            survey = data.get('surveyResponses', {})
            
            # Helper to safely get rating
            def get_rating(idx):
                return survey.get(str(idx), {}).get('rating', 0)

            # Calculate CARE Sub-scores
            collab_score = (get_rating(0) + get_rating(1)) / 2
            adapt_score = (get_rating(2) + get_rating(3)) / 2
            resp_score = (get_rating(4) + get_rating(5)) / 2
            expl_score = (get_rating(6) + get_rating(7)) / 2

            # Safe extraction using .get() with fallback defaults
            metrics = data.get('metrics', {})
            cog_load = data.get('cognitiveLoad', {})

            # 1. Store Quantitative Data
            row = {
                'participant': filename.replace('.json', ''),
                'group': group,
                'time_seconds': metrics.get('totalTimeSeconds', 0),
                'mental_demand': cog_load.get('mentalDemand', 0),
                'frustration': cog_load.get('frustration', 0),
                'score_Collaborative': collab_score,
                'score_Adaptive': adapt_score,
                'score_Responsible': resp_score,
                'score_Explainable': expl_score
            }
            data_rows.append(row)

            # 2. Store Qualitative Data simultaneously
            for q_id, response in survey.items():
                motivation = response.get('motivation', '').strip()
                if motivation:
                    qualitative_rows.append([
                        row['participant'], 
                        group, 
                        q_id, 
                        care_mapping.get(str(q_id), "Unknown"),
                        response.get('rating', ''), 
                        motivation
                    ])

# --- BUILD DATAFRAME & EXPORT CSV ---
df = pd.DataFrame(data_rows)

csv_filename = 'motivations_export.csv'
with open(csv_filename, mode='w', newline='', encoding='utf-8') as csv_file:
    writer = csv.writer(csv_file)
    writer.writerow(['Participant', 'Group', 'Question_ID', 'CARE_Dimension', 'Rating', 'Motivation'])
    writer.writerows(qualitative_rows)

print(f"✅ Qualitative data exported to {csv_filename}")

# --- QUANTITATIVE ANALYSIS ---
print("\n--- AVERAGE SCORES BY GROUP ---")
print(df.groupby('group').mean(numeric_only=True).round(2).to_string())
print("\n--- STATISTICAL SIGNIFICANCE (Mann-Whitney U) ---")
def run_test(metric):
    g_a = df[df['group'] == 'A'][metric]
    g_b = df[df['group'] == 'B'][metric]
    
    if len(g_a) > 0 and len(g_b) > 0:
        stat, p_value = mannwhitneyu(g_a, g_b, alternative='two-sided')
        
        # Calculate Rank-Biserial Correlation (Effect Size)
        n1, n2 = len(g_a), len(g_b)
        effect_size = 1 - (2 * stat) / (n1 * n2)
        
        # --- NEW: Nuanced Significance Thresholds ---
        if p_value < 0.05:
            sig = "⭐ SIGNIFICANT"
        elif p_value < 0.10:
            sig = "📈 MARGINAL TREND"
        else:
            sig = "Not Significant"
        
        # Formatting output
        print(f"{metric.ljust(22)}: p = {p_value:.4f} | Effect Size (r) = {abs(effect_size):.2f} ({sig})")

for m in ['score_Collaborative', 'score_Adaptive', 'score_Responsible', 'score_Explainable', 'time_seconds', 'mental_demand', 'frustration']:
    run_test(m)

# --- VISUALIZATION ---
# Create a visual comparison for the CARE scores
care_cols = ['score_Collaborative', 'score_Adaptive', 'score_Responsible', 'score_Explainable']
df_melted = df.melt(id_vars=['participant', 'group'], value_vars=care_cols, var_name='Dimension', value_name='Score')

plt.figure(figsize=(10, 6))
sns.boxplot(data=df_melted, x='Dimension', y='Score', hue='group', palette='Set2')
plt.title('CARE Framework Scores: Group A (Black Box) vs Group B (Glass Box)')
plt.xticks(rotation=15)
plt.ylim(0, 5.5) # Assuming a 5-point Likert scale
plt.tight_layout()
plt.savefig('care_scores_comparison.png')
print("\n✅ Boxplot saved as 'care_scores_comparison.png'")