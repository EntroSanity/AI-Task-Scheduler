from flask import jsonify, current_app, send_file
from . import api
from src.service.dependency_graph_service import DependencyGraphService
from src.service.gantt_chart_service import GanttChartService

@api.route('/dependency-graph', methods=['POST'])
def create_dependency_graph():
    try:
        output_path, s3_key = DependencyGraphService.generate_from_s3()
        return jsonify({
            "message": "Dependency graph created successfully"
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@api.route('/gantt-chart', methods=['POST'])
def create_gantt_chart():
    try:
        output_path, s3_key = GanttChartService.generate_from_s3()
        return jsonify({
            "message": "Gantt chart created successfully"
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@api.route('/dependency-graph', methods=['GET'])
def get_dependency_graph():
    try:
        local_path, s3_key = DependencyGraphService.get_graph_from_s3()
        return send_file(local_path, mimetype='image/png')
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"An error occurred while retrieving the dependency graph: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@api.route('/gantt-chart', methods=['GET'])
def get_gantt_chart():
    try:
        local_path, s3_key = GanttChartService.get_chart_from_s3()
        return send_file(local_path, mimetype='text/html')
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"An error occurred while retrieving the Gantt chart: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500