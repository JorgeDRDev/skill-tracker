"""
Main Flask application for the Skill Checklist & Habit Tracker.

This is the entry point of the application that:
- Initializes Flask app with configuration
- Sets up database connection
- Registers API routes
- Serves the frontend HTML page
- Handles application startup

Design Decisions:
- Single file for app configuration keeps it simple for a small app
- Separate modules for models, routes, and database for better organization
- Debug mode for development (should be disabled in production)
"""

from flask import Flask, render_template, send_from_directory
import os
from database import init_database, seed_sample_data
from routes import api

def create_app():
    """
    Application factory function to create and configure Flask app.
    
    Using the factory pattern allows for easier testing and configuration
    management in different environments.
    
    Returns:
        Configured Flask application instance
    """
    # Create Flask app instance
    app = Flask(__name__)
    
    # Configuration
    app.config['SECRET_KEY'] = 'your-secret-key-change-in-production'  # Used for sessions, CSRF protection
    app.config['DEBUG'] = True  # Enable debug mode for development
    
    # Initialize database
    init_database(app)
    
    # Register API routes (all routes prefixed with /api)
    app.register_blueprint(api)
    
    # Main page route - serves our single-page application
    @app.route('/')
    def index():
        """
        Serve the main HTML page.
        
        This is our single-page application entry point.
        All dynamic content is loaded via JavaScript API calls.
        """
        return render_template('index.html')
    
    # Static file serving (handled automatically by Flask, but documented here)
    # CSS files: /static/css/styles.css
    # JS files: /static/js/main.js
    
    # Health check endpoint for monitoring
    @app.route('/health')
    def health_check():
        """Simple health check endpoint."""
        return {'status': 'healthy', 'app': 'Skill Tracker'}, 200
    
    return app

def initialize_sample_data(app):
    """
    Initialize the database with sample data on first run.
    
    This helps with development and provides a good demo experience.
    
    Args:
        app: Flask application instance
    """
    try:
        seed_sample_data(app)
    except Exception as e:
        print(f"Warning: Could not seed sample data: {e}")

if __name__ == '__main__':
    """
    Application entry point when run directly.
    
    Alternative ways to run:
    1. python app.py (this method)
    2. flask run (requires FLASK_APP environment variable)
    3. flask --app app run (Flask CLI)
    """
    # Create the app
    app = create_app()
    
    # Add sample data on first run
    initialize_sample_data(app)
    
    # Run the development server
    print("Starting Skill Tracker application...")
    print("Visit: http://localhost:6969")
    print("API endpoints available at: http://localhost:6969/api/")
    
    # Run with debug mode, auto-reload on file changes
    app.run(
        host='0.0.0.0',  # Accept connections from any IP (useful for development)
        port=6969,       # Standard Flask port
        debug=True,      # Enable debug mode
        use_reloader=True  # Auto-restart on file changes
    )
