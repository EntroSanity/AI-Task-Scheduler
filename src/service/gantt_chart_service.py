import json
import os
import boto3
from botocore.exceptions import ClientError
from ..visualization.gantt_chart import GanttChartVisualizer
from ..models.task import Task
from ..aws.s3 import put_object_to_s3
from ..config import CONFIG

class GanttChartService:
    @staticmethod
    def _generate_chart(scheduled_tasks, output_file):
        output_path = os.path.join(CONFIG['paths']['output_dir'], output_file)
        GanttChartVisualizer.create_chart(scheduled_tasks, output_path)
        return output_path

    @classmethod
    def generate_from_s3(cls, output_file='gantt_chart.html'):
        """Generate Gantt chart from S3 data and upload result back to S3"""
        # Fetch scheduled tasks from S3
        s3 = boto3.client('s3')
        try:
            response = s3.get_object(
                Bucket=CONFIG['s3']['bucket'],
                Key=CONFIG['s3']['output_key']
            )
            scheduled_tasks_data = json.loads(response['Body'].read().decode('utf-8'))
        except Exception as e:
            raise ValueError(f"Failed to fetch scheduled tasks from S3: {str(e)}")

        scheduled_tasks = [Task.from_output_dict(task_data) for task_data in scheduled_tasks_data['scheduled_tasks']]
        # Generate Gantt chart
        output_path = cls._generate_chart(scheduled_tasks, output_file)
        # Upload to S3
        with open(output_path, 'rb') as file:
            s3_output_key = CONFIG['s3']['gantt_chart_key']
            success = put_object_to_s3(file, s3_output_key, 'text/html')
        if not success:
            raise Exception("Failed to upload Gantt chart to S3")

        return output_path, s3_output_key

    @classmethod
    def generate_from_file(cls, input_file, output_file='gantt_chart.html'):
        """Generate Gantt chart from local file"""
        with open(input_file, 'r') as f:
            scheduled_tasks_data = json.load(f)
        scheduled_tasks = [Task.from_output_dict(task_data) for task_data in scheduled_tasks_data['scheduled_tasks']]
        output_path = cls._generate_chart(scheduled_tasks, output_file)
        return output_path

    @classmethod
    def get_chart_from_s3(cls):
        """Retrieve the Gantt chart from S3"""
        s3 = boto3.client('s3')
        s3_key = CONFIG['s3']['gantt_chart_key']
        local_path = os.path.join(CONFIG['paths']['output_dir'], 'gantt_chart.html')

        try:
            s3.download_file(CONFIG['s3']['bucket'], s3_key, local_path)
            print(f"Successfully downloaded {s3_key} from S3 to {local_path}")
            return local_path, s3_key
        except ClientError as e:
            print(f"Failed to download {s3_key} from S3: {str(e)}")
            raise FileNotFoundError(f"Gantt chart not found in S3: {str(e)}")