from flask import jsonify, current_app, send_file
from . import api
from src.service.dependency_graph_service import DependencyGraphService
from src.service.gantt_chart_service import GanttChartService

@api.route('/dependency-graph', methods=['POST'])
def create_dependency_graph():
    try:
        output_path = DependencyGraphService.generate_from_file()
        return jsonify({
            "message": "Dependency graph created successfully",
            "file_path": output_path
        }), 200
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@api.route('/gantt-chart', methods=['POST'])
def create_gantt_chart():
    try:
        output_path = GanttChartService.generate_from_file()
        return jsonify({
            "message": "Gantt chart created successfully",
            "file_path": output_path
        }), 200
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@api.route('/dependency-graph', methods=['GET'])
def get_dependency_graph():
    try:
        file_path = DependencyGraphService.get_graph_file()
        return send_file(file_path, mimetype='image/png')
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"An error occurred while retrieving the dependency graph: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500

@api.route('/gantt-chart', methods=['GET'])
def get_gantt_chart():
    try:
        file_path = GanttChartService.get_chart_file()
        return send_file(file_path, mimetype='text/html')
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except Exception as e:
        current_app.logger.error(f"An error occurred while retrieving the Gantt chart: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500