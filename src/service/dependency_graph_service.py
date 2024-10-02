import os
from ..data.loader import load_project_data
from ..models.task import Task
from ..visualization.dependency_graph import DependencyGraphVisualizer
from ..config import CONFIG

class DependencyGraphService:
    @staticmethod
    def _generate_graph(tasks, output_file):
        G = DependencyGraphVisualizer.create_graph(tasks)
        DependencyGraphVisualizer.visualize(G, output_file)
        return output_file

    @classmethod
    def generate_from_file(cls):
        """Generate dependency graph from local file"""
        input_file = CONFIG['paths']['project_input']
        output_file = CONFIG['paths']['dependency_graph']
        
        project_data = load_project_data(input_file)
        tasks = [Task.from_input_dict(task) for task in project_data['tasks']]
        return cls._generate_graph(tasks, output_file)

    @classmethod
    def get_graph_file(cls):
        """Retrieve the dependency graph file path"""
        file_path = CONFIG['paths']['dependency_graph']
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Dependency graph not found: {file_path}")
        return file_path