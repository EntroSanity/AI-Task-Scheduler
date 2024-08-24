import os
import click
import json
from .data.loader import load_project_data
from .scheduling.scheduler import Scheduler
from .visualization.dependency_graph import DependencyGraphVisualizer
from .visualization.gantt_chart import GanttChartVisualizer
from .models.task import Task
from .config import CONFIG

# Create output directory if it doesn't exist
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), CONFIG['paths']['output_dir'])
os.makedirs(OUTPUT_DIR, exist_ok=True)

@click.group()
def cli():
    """Task Scheduling and Visualization CLI"""
    pass

@cli.command()
@click.option('--input', default=f"{CONFIG['paths']['input_dir']}/project_input.json", help='Input JSON file with project data')
@click.option('--output', default='schedule_result.json', help='Output JSON file to save scheduling results')
def schedule(input, output):
    """Schedule tasks and save results"""
    project_data = load_project_data(input)
    tasks = [Task.from_input_dict(task) for task in project_data['tasks']]
    resources = project_data['resources']

    scheduler = Scheduler(tasks, resources)
    scheduled_tasks = scheduler.schedule()

    # Convert scheduled tasks to dictionary for JSON serialization
    scheduled_tasks_dict = [task.to_output_dict() for task in scheduled_tasks]

    output_path = os.path.join(OUTPUT_DIR, output)
    with open(output_path, 'w') as f:
        json.dump(scheduled_tasks_dict, f, indent=2)

    print(f"Scheduling complete. Results saved to {output_path}")
    print(f"\nTotal time: {max(task.end_time for task in scheduled_tasks)} days")
    print(f"Total reward: {sum(task.actual_reward for task in scheduled_tasks):.2f}")

@cli.command()
@click.option('--input', default=f"{CONFIG['paths']['input_dir']}/project_input.json", help='Input JSON file with project data')
@click.option('--output', default='dependency_graph.png', help='Output file for dependency graph')
def dependency(input, output):
    """Create and save dependency graph"""
    project_data = load_project_data(input)
    tasks = [Task.from_input_dict(task) for task in project_data['tasks']]

    G = DependencyGraphVisualizer.create_graph(tasks)
    output_path = os.path.join(OUTPUT_DIR, output)
    DependencyGraphVisualizer.visualize(G, output_path)
    print(f"Dependency graph saved as '{output_path}'")

@cli.command()
@click.option('--schedule', default='schedule_result.json', help='JSON file with scheduling results')
@click.option('--output', default='gantt_chart.html', help='Output file for Gantt chart')
def gantt(schedule, output):
    """Create and save Gantt chart"""
    schedule_path = os.path.join(OUTPUT_DIR, schedule)
    with open(schedule_path, 'r') as f:
        scheduled_tasks_data = json.load(f)
    
    scheduled_tasks = [Task.from_output_dict(task_data) for task_data in scheduled_tasks_data]

    output_path = os.path.join(OUTPUT_DIR, output)
    GanttChartVisualizer.create_chart(scheduled_tasks, output_path)
    print(f"Gantt chart saved as '{output_path}'")