import json
from datetime import datetime, timedelta

class GanttChartVisualizer:
    @staticmethod
    def create_chart(scheduled_tasks, output_file):
        chart_data = GanttChartVisualizer._generate_chart_data(scheduled_tasks)
        
        with open(output_file, 'w') as f:
            json.dump(chart_data, f, indent=2)

    @staticmethod
    def _generate_chart_data(scheduled_tasks):
        start_date = datetime(2023, 1, 1)  # Arbitrary start date
        tasks_data = []
        for task in scheduled_tasks:
            tasks_data.append({
                'id': task.id,
                'title': task.title,
                'start': (start_date + timedelta(days=task.start_time)).isoformat(),
                'end': (start_date + timedelta(days=task.end_time)).isoformat(),
                'resources': task.required_resources,
                'dependencies': task.dependencies,
                'progress': 100 if task.end_time <= datetime.now().timestamp() else 0  # Simple progress calculation
            })
        
        max_end_time = max(task.end_time for task in scheduled_tasks)
        
        chart_data = {
            'tasks': tasks_data,
            'projectStart': start_date.isoformat(),
            'projectEnd': (start_date + timedelta(days=int(max_end_time))).isoformat()
        }
        
        return chart_data