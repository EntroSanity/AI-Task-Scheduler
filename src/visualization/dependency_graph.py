from ..config import CONFIG
import networkx as nx
import matplotlib.pyplot as plt
import matplotlib.image as mpimg

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
        A.edge_attr.update(color="gray", arrowsize="0.5")

        A.layout(prog="dot")
        A.draw(output_file)

        img = mpimg.imread(output_file)
        plt.figure(figsize=(12, 8))
        plt.imshow(img)
        plt.axis('off')
        plt.title("Task Dependency Graph", fontsize=16, pad=20)
        plt.tight_layout()
        plt.savefig(output_file, format="png", dpi=300, bbox_inches='tight')
        plt.close()