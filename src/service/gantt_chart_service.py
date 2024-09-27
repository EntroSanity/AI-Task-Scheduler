import json
import os
from ..visualization.gantt_chart import GanttChartVisualizer
from ..models.task import Task
from ..config import CONFIG

class GanttChartService:
    @staticmethod
    def _generate_chart(scheduled_tasks, output_file):
        GanttChartVisualizer.create_chart(scheduled_tasks, output_file)
        return output_file

    @classmethod
    def generate_from_file(cls):
        """Generate Gantt chart data from local file"""
        input_file = CONFIG['paths']['schedule_output']
        output_file = CONFIG['paths']['gantt_chart']

        with open(input_file, 'r') as f:
            scheduled_tasks_data = json.load(f)
        scheduled_tasks = [Task.from_output_dict(task_data) for task_data in scheduled_tasks_data['scheduled_tasks']]
        return cls._generate_chart(scheduled_tasks, output_file)

    @classmethod
    def get_chart_data(cls):
        """Retrieve the Gantt chart data"""
        file_path = CONFIG['paths']['gantt_chart']
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Gantt chart data not found: {file_path}")
        with open(file_path, 'r') as f:
            return json.load(f)