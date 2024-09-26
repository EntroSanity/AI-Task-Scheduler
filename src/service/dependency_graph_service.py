import os
import boto3
from botocore.exceptions import ClientError
from ..data.loader import load_project_data
from ..models.task import Task
from ..visualization.dependency_graph import DependencyGraphVisualizer
from ..aws.s3 import get_project_data_from_s3, put_object_to_s3
from ..config import CONFIG

class DependencyGraphService:
    @staticmethod
    def _generate_graph(tasks, output_file):
        G = DependencyGraphVisualizer.create_graph(tasks)
        output_path = os.path.join(CONFIG['paths']['output_dir'], output_file)
        DependencyGraphVisualizer.visualize(G, output_path)
        return output_path

    @classmethod
    def generate_from_file(cls, input_file, output_file):
        """Generate dependency graph from local file"""
        project_data = load_project_data(input_file)
        tasks = [Task.from_input_dict(task) for task in project_data['tasks']]
        return cls._generate_graph(tasks, output_file)

    @classmethod
    def generate_from_s3(cls, output_file='dependency_graph.png'):
        """Generate dependency graph from S3 data and upload result back to S3"""
        project_data = get_project_data_from_s3()
        if project_data is None:
            raise ValueError("Failed to fetch project data from S3")

        tasks = [Task.from_input_dict(task) for task in project_data['tasks']]
        output_path = cls._generate_graph(tasks, output_file)

        # Upload to S3
        with open(output_path, 'rb') as file:
            success = put_object_to_s3(file, CONFIG['s3']['dependency_graph_key'], 'image/png')
        
        if not success:
            raise Exception("Failed to upload dependency graph to S3")

        return output_path, CONFIG['s3']['dependency_graph_key']
    
    @classmethod
    def get_graph_from_s3(cls):
        """Retrieve the dependency graph from S3"""
        s3 = boto3.client('s3')
        s3_key = CONFIG['s3']['dependency_graph_key']
        local_path = os.path.join(CONFIG['paths']['output_dir'], 'dependency_graph.png')

        try:
            s3.download_file(CONFIG['s3']['bucket'], s3_key, local_path)
            print(f"Successfully downloaded {s3_key} from S3 to {local_path}")
            return local_path, s3_key
        except ClientError as e:
            print(f"Failed to download {s3_key} from S3: {str(e)}")
            raise FileNotFoundError(f"Dependency graph not found in S3: {str(e)}")