from flask import Flask, jsonify
from flask_cors import CORS
from api import api
from src.config import CONFIG

def create_app():
    app = Flask(__name__)
    CORS(app)  # This will enable CORS for all routes

    app.config.update(CONFIG._config)
    app.register_blueprint(api, url_prefix='/api/v1')

    @app.route('/')
    def home():
        return "Welcome to the AI-Powered Task Scheduler API", 200

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(error):
        app.logger.error('An error occurred', exc_info=error)
        return jsonify({"error": "Internal server error"}), 500

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(
        host=CONFIG.server_host,
        port=CONFIG.server_port,
        debug=CONFIG.server_debug
    )