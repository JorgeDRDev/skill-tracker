"""
Database configuration and initialization for the Skill Tracker app.

This module handles:
- Database connection setup
- Table creation
- Sample data seeding for development

Design Decisions:
- SQLite for simplicity and portability (no server setup required)
- Separate init function for clean app setup
- Sample data helps with initial testing and demo
"""

import os
from models import db, Skill, StudyLog, SkillStatus
from datetime import datetime

def init_database(app):
    """
    Initialize the database with the Flask app.
    
    Args:
        app: Flask application instance
    """
    # Configure SQLite database
    # Using absolute path to ensure database is created in project directory
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config['SQLALCHEMY_DATABASE_URI'] = f'sqlite:///{os.path.join(basedir, "tracker.db")}'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Disable event system for performance
    
    # Initialize SQLAlchemy with the app
    db.init_app(app)
    
    # Create all tables
    with app.app_context():
        db.create_all()
        print("Database tables created successfully!")

def seed_sample_data(app):
    """
    Add sample data for development and testing.
    
    This function adds some example skills and study logs to help with
    initial testing and to demonstrate the app's functionality.
    
    Args:
        app: Flask application instance
    """
    with app.app_context():
        # Check if we already have data to avoid duplicates
        if Skill.query.count() > 0:
            print("Database already contains data. Skipping seed.")
            return
        
        # Sample skills across different categories
        sample_skills = [
            # Backend skills
            Skill(name="Python Flask", category="Backend", status=SkillStatus.IN_PROGRESS),
            Skill(name="SQLAlchemy ORM", category="Backend", status=SkillStatus.TO_LEARN),
            Skill(name="REST API Design", category="Backend", status=SkillStatus.LEARNED),
            
            # Frontend skills
            Skill(name="Vanilla JavaScript", category="Frontend", status=SkillStatus.IN_PROGRESS),
            Skill(name="CSS Grid & Flexbox", category="Frontend", status=SkillStatus.LEARNED),
            Skill(name="React Components", category="Frontend", status=SkillStatus.TO_LEARN),
            
            # DevOps skills
            Skill(name="Git Version Control", category="DevOps", status=SkillStatus.LEARNED),
            Skill(name="Docker Containers", category="DevOps", status=SkillStatus.TO_LEARN),
            
            # General skills
            Skill(name="Problem Solving", category="General", status=SkillStatus.IN_PROGRESS),
            Skill(name="Code Documentation", category="General", status=SkillStatus.IN_PROGRESS),
        ]
        
        # Add all skills to the database
        for skill in sample_skills:
            db.session.add(skill)
        
        # Commit skills first so we can reference them in study logs
        db.session.commit()
        
        # Sample study logs
        # Simulate some study sessions over the past week
        flask_skill = Skill.query.filter_by(name="Python Flask").first()
        js_skill = Skill.query.filter_by(name="Vanilla JavaScript").first()
        css_skill = Skill.query.filter_by(name="CSS Grid & Flexbox").first()
        
        sample_logs = [
            StudyLog(
                date=datetime(2024, 7, 20, 14, 30),
                hours=2.5,
                notes="Started Flask tutorial, learned about routes and templates",
                skills=[flask_skill]
            ),
            StudyLog(
                date=datetime(2024, 7, 21, 10, 15),
                hours=1.5,
                notes="Practiced JavaScript DOM manipulation",
                skills=[js_skill]
            ),
            StudyLog(
                date=datetime(2024, 7, 22, 16, 45),
                hours=3.0,
                notes="Worked on Flask app and styled with CSS Grid",
                skills=[flask_skill, css_skill]
            ),
        ]
        
        # Add study logs to the database
        for log in sample_logs:
            db.session.add(log)
        
        # Commit all changes
        db.session.commit()
        print("Sample data added successfully!")

def reset_database(app):
    """
    Drop all tables and recreate them (useful for development).
    
    WARNING: This will delete all data!
    
    Args:
        app: Flask application instance
    """
    with app.app_context():
        db.drop_all()
        db.create_all()
        print("Database reset successfully!")
