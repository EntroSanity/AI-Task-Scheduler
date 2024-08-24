# AI-Powered Task Scheduler

## Overview

The AI-Powered Task Scheduler is an advanced project management tool that leverages machine learning to optimize task scheduling. It handles complex project scenarios, including dependency cycles and resource conflicts, while maximizing project rewards and minimizing completion time.

## Features

| Feature                       | Description                                                                                     | Status |
| ----------------------------- | ----------------------------------------------------------------------------------------------- | ------ |
| AI-Driven Task Analysis       | Utilizes Large Language Models (LLM) to analyze task descriptions and estimate complexity.      | ✅      |
| Basic Intelligent Scheduling  | Prioritizes tasks based on rewards, dependencies, and resource availability.                    | ✅      |
| Dependency Cycle Resolution   | Automatically detects and resolves circular dependencies in project tasks.                      | ✅      |
| Visualization Tools           | Generates dependency graphs and Gantt charts for clear project visualization.                   | ✅      |
| Command-Line Interface        | Basic CLI for running schedules and generating visualizations.                                  | ✅      |
| Advanced Scheduling Algorithm | Implement more sophisticated scheduling techniques, considering multiple optimization criteria. | 🚧      |
| Enhanced LLM Integration      | Deeper integration of LLM for more accurate task analysis and intelligent decision-making.      | 🔜      |
| Resource Optimization         | Advanced algorithms for optimal resource allocation and load balancing.                         | 🔜      |
| User-Friendly GUI             | Develop a graphical user interface for easier interaction and visualization.                    | 🔜      |
| Real-Time Updates             | Enable real-time updates and rescheduling as project parameters change.                         | 🔜      |
| Multi-Project Management      | Extend the system to handle multiple projects simultaneously.                                   | 🔜      |
| Reporting and Analytics       | Generate comprehensive reports and analytics on project performance.                            | 🔜      |

Legend:
- ✅ Completed
- 🚧 In Progress
- 🔜 Planned

## Project Structure

- `src/`: Main source code directory
  - `cli.py`: Defines the command-line interface for the application.
  - `data/`: 
    - `loader.py`: Handles loading and parsing of input data.
  - `scheduling/`: 
    - `scheduler.py`: Core scheduling algorithm implementation.
    - `priority.py`: Calculates task priorities based on various factors.
  - `analysis/`:
    - `llm_analyzer.py`: Integrates with LLM for task analysis.
  - `visualization/`:
    - `dependency_graph.py`: Generates task dependency visualizations.
    - `gantt_chart.py`: Creates Gantt charts for scheduled tasks.
  - `models/`:
    - `task.py`: Defines the Task class and its properties.
- `input/`: Directory for input files
  - `project_input.json`: Example input file for task scheduling
- `output/`: Directory for generated files
  - `schedule_result.json`: Generated schedule output
  - `dependency_graph.png`: Generated dependency graph
  - `gantt_chart.html`: Generated Gantt chart
- `main.py`: Entry point of the application, integrates all components.
- `.env`: Environment variables configuration (e.g., API keys)
- `requirements.txt`: List of project dependencies

## Dependencies

- Python 3.10+
- Replicate API (for LLM integration)
- NetworkX (for dependency graph creation)
- Matplotlib (for visualization)
- Plotly (for Gantt chart creation)
- Click (for CLI)

(A `requirements.txt` file is included in the project root for easy installation of all dependencies.)

## Configuration

The project uses a `config.toml` file for various settings. You can modify this file to change default behaviors:

- Input and output directory paths
- Scheduler parameters
- Visualization settings
- LLM model and settings

The `config.toml` file is located in the project root directory.

## Installation
1. Clone the repository
```
git clone https://github.com/EntroSanity/AI-Task-Scheduler.git
```
2. Create a virtual environment (optional but recommended):
```
conda create -n scheduling python=3.10
conda activate scheduling
```
3. Install the required packages:
```
pip install -r requirements.txt
```
4. Set up your environment variables - Create a `.env` file in the project root and add your Replicate API key::
```
REPLICATE_API_TOKEN=<your_api_key_here>
```

## Usage
Start by placing your input JSON file in the `input/` directory.
### Running the Scheduler
To schedule tasks:
```bash
python main.py schedule --input input/project_input.json --output schedule_result.json
```
### Generating Visualizations
To create a dependency graph:
```bash
python main.py dependency --input input/project_input.json --output dependency_graph.png
```
To create a Gantt chart (after scheduling):
```bash
python main.py gantt --schedule schedule_result.json --output gantt_chart.html
```
Note: All generated files will be saved in the `output/` directory.


## Results
### Sample Schedule Output
Here's an example of the output generated in `schedule_result.json`, which shows the scheduled start and end times, assigned resources, actual reward, and the LLM analysis for each task:
```json
{
  "id": "T2",
  "title": "Requirements Gathering",
  "start_time": 0,
  "end_time": 3,
  "resources": [
    "Tohfah",
    "Zijan"
  ],
  "actual_reward": 30.0,
  "llm_analysis": {
    "estimatedComplexity": 7,
    "potentialRisks": [
      "Difficulty in getting stakeholders to provide clear and concise requirements",
      "Risk of missing critical requirements",
      "Potential for conflicting stakeholder opinions"
    ],
    "requiredSkills": [
      "Communication skills",
      "Active listening skills",
      "Analytical skills",
      "Requirements gathering techniques",
      "Familiarity with project management methodologies"
    ],
    "suggestedPriority": "medium"
  }
}
```

### Dependency Graph
The following image shows the generated dependency graph for the project tasks, which visualizes the dependencies between different tasks, helping to identify the project's critical path and potential bottlenecks:
![image](https://imagedelivery.net/0LwqpAMWL2C8o12h9UoZew/ac12243c-1e30-49b9-76a5-9c52af20fc00/public)

### Gantt Chart
The Gantt chart generated from the scheduled tasks is shown below, which provides a timeline view of the scheduled tasks, showing their start and end dates, duration, and the resources assigned to each task.
![image](https://imagedelivery.net/0LwqpAMWL2C8o12h9UoZew/d29f0a31-557f-4143-2688-a39e50014900/public)


## License
This project is licensed under the MIT License - see the LICENSE file for details.
