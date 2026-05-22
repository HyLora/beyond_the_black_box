import os
# --- FIX FOR MACBOOK SEGFAULT ---
# This forces the math libraries to use exactly 1 CPU thread, 
# preventing the 'loky' multiprocessing crash on macOS.
os.environ["OMP_NUM_THREADS"] = "1"
os.environ["LOKY_MAX_CPU_COUNT"] = "1"
# --------------------------------

import pandas as pd
from sentence_transformers import SentenceTransformer
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
import seaborn as sns

print("Loading data...")
# 1. Load Data
df = pd.read_csv('motivations_export.csv')

# Filter for Group B - Explainable dimension
df_target = df[(df['Group'] == 'B') & (df['CARE_Dimension'].str.contains('Explainable'))].copy()

# Drop rows where motivation is empty
df_target = df_target.dropna(subset=['Motivation'])
texts = df_target['Motivation'].tolist()
ratings = df_target['Rating'].tolist()

print("Downloading/Loading embedding model...")
# 2. Generate Embeddings using an open-source, highly efficient model
model = SentenceTransformer('all-MiniLM-L6-v2')
embeddings = model.encode(texts)

print("Running K-Means clustering...")
# 3. Cluster the Embeddings (We will look for 3 distinct themes)
num_clusters = 3
kmeans = KMeans(n_clusters=num_clusters, random_state=42, n_init=10)
df_target['Cluster'] = kmeans.fit_predict(embeddings)

# 4. Dimensionality Reduction (Convert high-dimensional embeddings to 2D for a scatter plot)
pca = PCA(n_components=2)
reduced_embeddings = pca.fit_transform(embeddings)
df_target['PCA_x'] = reduced_embeddings[:, 0]
df_target['PCA_y'] = reduced_embeddings[:, 1]

print("Generating visualization plot...")
# 5. Plotting the Clusters
plt.figure(figsize=(10, 8))
# Create a scatter plot where colors are clusters, and dot size is based on the User's Rating (0-5)
scatter = sns.scatterplot(
    data=df_target, 
    x='PCA_x', 
    y='PCA_y', 
    hue='Cluster', 
    palette='viridis', 
    size='Rating',
    sizes=(50, 250),
    alpha=0.8
)
plt.title('Semantic Clustering of Group B "Explainable" Motivations', fontsize=14)
plt.xlabel('Semantic Dimension 1')
plt.ylabel('Semantic Dimension 2')
plt.legend(bbox_to_anchor=(1.05, 1), loc='upper left')
plt.tight_layout()
plt.savefig('semantic_clusters.png', dpi=300)
print("✅ Saved visualization to 'semantic_clusters.png'")

# 6. Print out samples from each cluster so you can "name" the themes
print("\n--- THEMATIC CLUSTER SAMPLES ---")
for i in range(num_clusters):
    print(f"\n🔵 CLUSTER {i} (Found {len(df_target[df_target['Cluster'] == i])} responses):")
    # Get the top 4 responses from this cluster
    sample = df_target[df_target['Cluster'] == i]['Motivation'].head(4).tolist()
    for s in sample:
        print(f"   - {s}")

# Save the final dataset with the cluster IDs attached
df_target.to_csv('motivations_clustered.csv', index=False)
print("\n✅ Saved clustered data to 'motivations_clustered.csv'")