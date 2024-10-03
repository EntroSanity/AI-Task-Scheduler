# AI-Powered Task Scheduler

## Overview

The AI-Powered Task Scheduler is an advanced project management tool that leverages machine learning to optimize task scheduling. It handles complex project scenarios, including dependency cycles and resource conflicts, while maximizing project rewards and minimizing completion time. This application consists of a Python backend for task analysis and scheduling, and a frontend interface for user interaction and visualization.

## Quick Start
For a quick setup and run of the AI-Powered Task Scheduler, you can use our Docker image. Follow these steps:
1. Pull the Docker image:
```
docker pull ntosnaky/ai-task-scheduler:v0.5
```
2. Run the Docker container:
```
docker run -p 3001:3000 -p 8080:8080 \                      
  -e REPLICATE_API_TOKEN=<your_replicate_API_token> \
  ntosnaky/ai-task-scheduler:v0.5
```
3. Access the application: Open your web browser and go to:
```
http://localhost:3001/
```
Note: Make sure you have Docker installed on your system before running these commands. This method allows you to quickly set up and run the AI-Powered Task Scheduler without needing to install dependencies or set up the development environment manually.

## Features

| Feature                       | Description                                                                                     | Status |
| ----------------------------- | ----------------------------------------------------------------------------------------------- | ------ |
| AI-Driven Task Analysis       | Utilizes Large Language Models (LLM) to analyze task descriptions and estimate complexity.      | ✅      |
| Basic Intelligent Scheduling  | Prioritizes tasks based on rewards, dependencies, and resource availability.                    | ✅      |
| Dependency Cycle Resolution   | Automatically detects and resolves circular dependencies in project tasks.                      | ✅      |
| Visualization Tools           | Generates dependency graphs and Gantt charts for clear project visualization.                   | ✅      |
| Command-Line Interface        | Basic CLI for running schedules and generating visualizations.                                  | ✅      |
| Advanced Scheduling Algorithm | Implement more sophisticated scheduling techniques, considering multiple optimization criteria. | 🚧      |
| Enhanced LLM Integration      | Deeper integration of LLM for more accurate task analysis and intelligent decision-making.      | ✅      |
| Resource Optimization         | Advanced algorithms for optimal resource allocation and load balancing.                         | ✅      |
| User-Friendly GUI             | Develop a graphical user interface for easier interaction and visualization.                    | ✅      |
| Reporting and Analytics       | Generate comprehensive reports and analytics on project performance.                            | 🔜      |

Legend:
- ✅ Completed
- 🚧 In Progress
- 🔜 Planned

## Project Structure

- `api/`: API endpoints for the application
  - `projects.py`: Handles project-related API requests
  - `scheduler.py`: Manages scheduling API requests
  - `visualizations.py`: Handles visualization-related API requests
- `frontend/`: Contains the frontend application code
- `input/`: Directory for input files
  - `project_input.json`: Example input file for task scheduling
- `output/`: Directory for generated files
  - `dependency_graph.png`: Generated dependency graph
  - `gantt_chart.html`: Generated Gantt chart
  - `gantt_chart.json`: JSON data for Gantt chart
  - `schedule_result.json`: Generated schedule output
- `src/`: Main source code directory
  - `analysis/`: 
    - `llm_analyzer.py`: Integrates with LLM for task analysis
  - `data/`:
    - `loader.py`: Handles loading and parsing of input data
  - `models/`:
    - `task.py`: Defines the Task class and its properties
  - `scheduling/`:
    - `priority.py`: Calculates task priorities based on various factors
    - `scheduler.py`: Core scheduling algorithm implementation
  - `service/`:
    - `dependency_graph_service.py`: Service for generating dependency graphs
    - `gantt_chart_service.py`: Service for creating Gantt charts
    - `scheduler_service.py`: Service for task scheduling
  - `visualization/`:
    - `dependency_graph.py`: Generates task dependency visualizations
    - `gantt_chart.py`: Creates Gantt charts for scheduled tasks
  - `config.py`: Configuration settings for the application
- `.dockerignore`: Specifies files to be ignored by Docker
- `.env`: Environment variables configuration (e.g., API keys)
- `.gitignore`: Specifies files to be ignored by Git
- `config.toml`: Configuration file for various application settings
- `Dockerfile`: Instructions for building the Docker image
- `LICENSE`: License information for the project
- `main.py`: Entry point of the application, integrates all components
- `requirements.txt`: List of Python dependencies

## Dependencies

- Python 3.10+
- [PyGraphviz](https://pygraphviz.github.io/documentation/stable/install.html)
- Replicate API (for LLM integration)
- NetworkX (for dependency graph creation)
- Matplotlib (for visualization)
- Plotly (for Gantt chart creation)
- Click (for CLI)

(A `requirements.txt` file is included in the project root for easy installation of all dependencies. Please ensure to review the PyGraphviz installation guide before proceeding with the installation of this dependency.)

## Configuration

The project uses a `config.toml` file for various settings. You can modify this file to change default behaviors:

- Input and output directory paths
- Scheduler parameters
- Visualization settings
- LLM model and settings

The `config.toml` file is located in the project root directory.

## Installation
### Backend
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
### Frontend
1. Navigate to the frontend directory:
```bash
cd frontend/
```
2. Install the required npm packages:
```bash
npm install
```


## Usage
To run the AI-Powered Task Scheduler:
1. Start the backend server:
```bash
python main.py
```
This will start the backend server, typically on port 8080.

2. In a new terminal, start the frontend development server:
```bash
cd frontend
npm run dev
```
This will start the frontend development server, typically on port 3000 or 3001.

3. Access the application:
Open your web browser and go to `http://localhost:3001/` to interact with the AI-Powered Task Scheduler. Ensure that both the backend and frontend servers are running simultaneously for the application to function properly.




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
![image](https://imagedelivery.net/0LwqpAMWL2C8o12h9UoZew/7680318e-28cb-45c0-1302-0269a8989f00/public)

### Gantt Chart
The Gantt chart generated from the scheduled tasks is shown below, which provides a timeline view of the scheduled tasks, showing their start and end dates, duration, and the resources assigned to each task.
![image](https://imagedelivery.net/0LwqpAMWL2C8o12h9UoZew/29699b49-b07a-4311-652b-b06403f0b400/public)


## License
This project is licensed under the MIT License - see the LICENSE file for details.
