import os
import json
from ..data.loader import load_project_data
from ..scheduling.scheduler import Scheduler
from ..models.task import Task
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
    def schedule_from_file(cls):
        """
        Load project data from a file, schedule tasks, and return results
        """
        input_file = CONFIG['paths']['project_input']
        project_data = load_project_data(input_file)
        tasks = [Task.from_input_dict(task) for task in project_data['tasks']]
        resources = project_data['resources']

        result = cls._process_tasks(tasks, resources)

        # Save result to local file
        output_file = CONFIG['paths']['schedule_output']
        os.makedirs(os.path.dirname(output_file), exist_ok=True)
        with open(output_file, 'w') as f:
            json.dump(result, f, indent=2)

        return result