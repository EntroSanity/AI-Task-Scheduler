import json
import os
from flask import jsonify, request, current_app
from . import api
from src.config import CONFIG

@api.route('/projects', methods=['GET'])
def get_projects():
    try:
        with open(CONFIG['paths']['project_input'], 'r') as f:
            projects = json.load(f)
        return jsonify(projects), 200
    except FileNotFoundError:
        return jsonify({"error": "Project data not found"}), 404
    except json.JSONDecodeError:
        return jsonify({"error": "Invalid project data format"}), 500

@api.route('/projects', methods=['POST'])
def create_project():
    try:
        data = request.json
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        if 'tasks' not in data or 'resources' not in data:
            return jsonify({"error": "Invalid project data. 'tasks' and 'resources' are required."}), 400

        os.makedirs(os.path.dirname(CONFIG['paths']['project_input']), exist_ok=True)
        with open(CONFIG['paths']['project_input'], 'w') as f:
            json.dump(data, f, indent=2)

        return jsonify({"message": "Project created successfully"}), 201

    except Exception as e:
        current_app.logger.error(f"An error occurred while creating the project: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500