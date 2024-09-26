from flask import jsonify, current_app
from . import api
from src.service.scheduler_service import SchedulerService

@api.route('/schedule', methods=['POST'])
def schedule_tasks():
    try:
        result, s3_upload_success = SchedulerService.schedule_from_s3()
        return jsonify({
            "message": "Scheduling completed successfully",
            "result": result,
            "s3_upload_status": "Success" if s3_upload_success else "Failed"
        }), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 400  # Changed to 400 for client errors
    except Exception as e:
        current_app.logger.error(f"An error occurred: {str(e)}")
        return jsonify({"error": "An unexpected error occurred"}), 500