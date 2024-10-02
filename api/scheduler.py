from flask import jsonify, current_app
from . import api
from src.service.scheduler_service import SchedulerService

@api.route('/schedule', methods=['POST'])
def schedule_tasks():
    try:
        result = SchedulerService.schedule_from_file()
        return jsonify({
            "message": "Scheduling completed successfully",
            "result": result
        }), 200
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 404
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        current_app.logger.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500