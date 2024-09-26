import json
from io import BytesIO
from ..data.loader import load_project_data
from ..scheduling.scheduler import Scheduler
from ..models.task import Task
from ..aws.s3 import get_project_data_from_s3, put_object_to_s3
from ..config import CONFIG

class SchedulerService:
    @staticmethod
    def _process_tasks(tasks, resources):
        scheduler = Scheduler(tasks, resources)
        scheduled_tasks = scheduler.schedule()

        scheduled_tasks_dict = [task.to_output_dict() for task in scheduled_tasks]
        total_time = max(task.end_time for task in scheduled_tasks)
        total_reward = sum(task.actual_reward for task in scheduled_tasks)

        return {
            "scheduled_tasks": scheduled_tasks_dict,
            "total_time": total_time,
            "total_reward": total_reward
        }

    @classmethod
    def schedule_from_s3(cls):
        """
        Fetch project data from S3, schedule tasks, and return results
        """
        project_data = get_project_data_from_s3()
        if project_data is None:
            raise ValueError("Failed to fetch project data from S3")

        tasks = [Task.from_input_dict(task) for task in project_data['tasks']]
        resources = project_data['resources']

        result = cls._process_tasks(tasks, resources)

        # Convert result to JSON and upload to S3
        json_result = json.dumps(result, indent=2)
        file_obj = BytesIO(json_result.encode())
        s3_upload_success = put_object_to_s3(file_obj, CONFIG['s3']['output_key'], 'application/json')

        if not s3_upload_success:
            print("Warning: Failed to upload schedule result to S3")

        return result, s3_upload_success

    @classmethod
    def schedule_from_file(cls, input_file):
        """
        Load project data from a file, schedule tasks, and return results
        """
        project_data = load_project_data(input_file)
        tasks = [Task.from_input_dict(task) for task in project_data['tasks']]
        resources = project_data['resources']

        return cls._process_tasks(tasks, resources)