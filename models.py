"""
Database models for the Skill Checklist & Habit Tracker app.

This module defines our core data entities:
- Skill: Represents a skill that can be learned (name, status, category)
- StudyLog: Represents a study session (date, hours, skills studied)

Design Decisions:
- Using SQLAlchemy ORM for database abstraction (easier than raw SQL)
- Skills have three states: "To Learn", "In Progress", "Learned"
- StudyLogs are separate entities linked to skills via many-to-many relationship
- This allows tracking multiple skills per study session
"""

from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from enum import Enum

# Initialize SQLAlchemy instance
db = SQLAlchemy()

# Enum for skill status - ensures data consistency
class SkillStatus(Enum):
    TO_LEARN = "To Learn"
    IN_PROGRESS = "In Progress" 
    LEARNED = "Learned"

# Association table for many-to-many relationship between StudyLog and Skill
# A study session can involve multiple skills, and a skill can be studied in multiple sessions
study_skill_association = db.Table('study_skill_association',
    db.Column('study_log_id', db.Integer, db.ForeignKey('study_log.id'), primary_key=True),
    db.Column('skill_id', db.Integer, db.ForeignKey('skill.id'), primary_key=True)
)

class Skill(db.Model):
    """
    Model representing a skill that can be learned.
    
    Attributes:
        id: Primary key
        name: Skill name (e.g., "Python Flask", "React Components")
        status: Current learning status (TO_LEARN, IN_PROGRESS, LEARNED)
        category: Optional grouping (e.g., "Backend", "Frontend", "DevOps")
        created_at: When the skill was added
        updated_at: When the skill was last modified
    """
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False, unique=True)
    status = db.Column(db.Enum(SkillStatus), nullable=False, default=SkillStatus.TO_LEARN)
    category = db.Column(db.String(100), nullable=True)  # Optional categorization
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationship: skills can be referenced in multiple study logs
    study_logs = db.relationship('StudyLog', secondary=study_skill_association, back_populates='skills')
    
    def to_dict(self):
        """Convert skill object to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'name': self.name,
            'status': self.status.value,
            'category': self.category,
            'created_at': self.created_at.isoformat(),
            'updated_at': self.updated_at.isoformat()
        }

class StudyLog(db.Model):
    """
    Model representing a study session.
    
    Attributes:
        id: Primary key
        date: DateTime of study session (includes date and time)
        hours: Number of hours studied (can be fractional, e.g., 1.5)
        notes: Optional notes about what was accomplished
        created_at: When the log entry was created
    """
    id = db.Column(db.Integer, primary_key=True)
    date = db.Column(db.DateTime, nullable=False)
    hours = db.Column(db.Float, nullable=False)  # Allow fractional hours like 1.5
    notes = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationship: a study session can involve multiple skills
    skills = db.relationship('Skill', secondary=study_skill_association, back_populates='study_logs')
    
    def to_dict(self):
        """Convert study log object to dictionary for JSON serialization."""
        return {
            'id': self.id,
            'date': self.date.isoformat(),
            'hours': self.hours,
            'notes': self.notes,
            'skills': [skill.to_dict() for skill in self.skills],
            'created_at': self.created_at.isoformat()
        }
