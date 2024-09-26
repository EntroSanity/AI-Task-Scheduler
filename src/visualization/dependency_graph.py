from ..config import CONFIG
import networkx as nx
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import numpy as np
from PIL import Image
import io
import requests

class DependencyGraphVisualizer:
    @staticmethod
    def create_graph(tasks):
        G = nx.DiGraph()
        for task in tasks:
            G.add_node(task.id)
            for dep in task.dependencies:
                G.add_edge(dep, task.id)
        return G

    @staticmethod
    def visualize(G, output_file):
        A = nx.nx_agraph.to_agraph(G)
        A.graph_attr.update(rankdir="LR", size=CONFIG['visualization']['dependency_graph_size'])
        A.node_attr.update(shape="circle", style="filled", fillcolor="lightblue", fontsize="9", fontweight="bold")
        A.edge_attr.update(color="black", arrowsize="0.9")

        A.layout(prog="dot")
        
        # Save to a BytesIO object instead of a file
        img_data = io.BytesIO()
        A.draw(img_data, format='png')
        img_data.seek(0)

        # Remove background
        img_no_bg = DependencyGraphVisualizer.remove_background(img_data)

        plt.figure(figsize=(12, 8))
        plt.imshow(img_no_bg)
        plt.axis('off')
        plt.tight_layout()
        plt.savefig(output_file, format="png", dpi=300, bbox_inches='tight', transparent=True)
        plt.close()

    @staticmethod
    def remove_background(img_data):
        try:
            response = requests.post(
                'https://api.remove.bg/v1.0/removebg',
                files={'image_file': img_data},
                data={'size': 'auto'},
                headers={'X-Api-Key': CONFIG['api']['remove_bg_key']},
            )
            if response.status_code == requests.codes.ok:
                img_no_bg = Image.open(io.BytesIO(response.content))
                return np.array(img_no_bg)
            else:
                print("Error removing background:", response.status_code, response.text)
                # If background removal fails, return the original image
                return mpimg.imread(img_data)
        except Exception as e:
            print(f"Exception during background removal: {str(e)}")
            # If any exception occurs, return the original image
            return mpimg.imread(img_data)