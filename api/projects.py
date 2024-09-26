from flask import jsonify, request, current_app
from . import api
from src.aws.s3 import get_project_data_from_s3, put_object_to_s3
from io import BytesIO
import json
from src.config import CONFIG

@api.route('/projects', methods=['GET'])
def get_projects():
    projects = get_project_data_from_s3()
    if projects is None:
        return jsonify({"error": "Failed to fetch project data"}), 500
    return jsonify(projects), 200

@api.route('/projects', methods=['POST'])
def create_project():
    try:
        # Get JSON data from the request
        data = request.json
        
        if not data:
            return jsonify({"error": "No JSON data provided"}), 400

        # Validate the JSON data (you may want to add more validation)
        if 'tasks' not in data or 'resources' not in data:
            return jsonify({"error": "Invalid project data. 'tasks' and 'resources' are required."}), 400

        # Convert the JSON to a formatted string
        json_str = json.dumps(data, indent=2)

        # Create a file-like object
        file_obj = BytesIO(json_str.encode())

        # Upload to S3
        success = put_object_to_s3(file_obj, CONFIG['s3']['input_key'], 'application/json')

        if not success:
            return jsonify({"error": "Failed to upload project data to S3"}), 500

        return jsonify({
            "message": "Project created successfully",
        }), 201

    except Exception as e:
        current_app.logger.error(f"An error occurred while creating the project: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500