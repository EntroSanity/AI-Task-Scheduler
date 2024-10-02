import networkx as nx
import os
from ..config import CONFIG
import requests
from PIL import Image
import io

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
        temp_file = output_file + "_temp.png"
        A.draw(temp_file)

        # Remove background
        try:
            with open(temp_file, 'rb') as file:
                response = requests.post(
                    'https://api.remove.bg/v1.0/removebg',
                    files={'image_file': file},
                    data={'size': 'auto'},
                    headers={'X-Api-Key': CONFIG['api']['remove_bg_key']},
                )
                if response.status_code == requests.codes.ok:
                    with Image.open(io.BytesIO(response.content)) as img:
                        img.save(output_file, 'PNG')
                    print(f"Dependency graph with removed background saved to {output_file}")
                else:
                    print(f"Error removing background: {response.status_code} {response.text}")
                    print(f"Using original image without background removal")
                    os.rename(temp_file, output_file)
        except Exception as e:
            print(f"Error in background removal: {str(e)}")
            print(f"Using original image without background removal")
            os.rename(temp_file, output_file)
        finally:
            if os.path.exists(temp_file):
                os.remove(temp_file)

        return output_file