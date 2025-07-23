"""
REST API routes for the Skill Tracker app.

This module defines RESTful endpoints for:
- Skills CRUD operations (/api/skills)
- Study logs CRUD operations (/api/logs)
- Statistics and analytics (/api/stats)

Design Decisions:
- RESTful design: GET/POST/PUT/DELETE with appropriate HTTP status codes
- JSON responses for easy frontend consumption
- Error handling with meaningful messages
- /api prefix to distinguish from static/template routes
"""

from flask import Blueprint, request, jsonify, abort
from models import db, Skill, StudyLog, SkillStatus
from datetime import date, datetime, timedelta
from sqlalchemy.exc import IntegrityError
from sqlalchemy import and_, func

# Create blueprint for API routes
api = Blueprint('api', __name__, url_prefix='/api')

# === SKILLS ENDPOINTS ===

@api.route('/skills', methods=['GET'])
def get_skills():
    """
    Get all skills, optionally filtered by category or status.
    
    Query Parameters:
        category: Filter by skill category
        status: Filter by skill status (To Learn, In Progress, Learned)
    
    Returns:
        JSON array of skill objects
    """
    try:
        # Start with all skills
        query = Skill.query
        
        # Apply filters if provided
        category = request.args.get('category')
        status = request.args.get('status')
        
        if category:
            query = query.filter(Skill.category == category)
        
        if status:
            try:
                status_enum = SkillStatus(status)
                query = query.filter(Skill.status == status_enum)
            except ValueError:
                return jsonify({'error': 'Invalid status value'}), 400
        
        # Order by category, then by creation date
        skills = query.order_by(Skill.category, Skill.created_at).all()
        
        return jsonify([skill.to_dict() for skill in skills])
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/skills', methods=['POST'])
def create_skill():
    """
    Create a new skill.
    
    Expected JSON body:
        {
            "name": "Skill name (required)",
            "category": "Category (optional)",
            "status": "To Learn|In Progress|Learned (optional, defaults to To Learn)"
        }
    
    Returns:
        JSON object of the created skill
    """
    try:
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({'error': 'Skill name is required'}), 400
        
        # Parse status if provided
        status = SkillStatus.TO_LEARN  # default
        if data.get('status'):
            try:
                status = SkillStatus(data['status'])
            except ValueError:
                return jsonify({'error': 'Invalid status value'}), 400
        
        # Create new skill
        skill = Skill(
            name=data['name'].strip(),
            category=data.get('category', '').strip() or None,
            status=status
        )
        
        db.session.add(skill)
        db.session.commit()
        
        return jsonify(skill.to_dict()), 201
    
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Skill name already exists'}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api.route('/skills/<int:skill_id>', methods=['PUT'])
def update_skill(skill_id):
    """
    Update an existing skill.
    
    Args:
        skill_id: ID of the skill to update
    
    Expected JSON body:
        {
            "name": "Updated name (optional)",
            "category": "Updated category (optional)",
            "status": "Updated status (optional)"
        }
    
    Returns:
        JSON object of the updated skill
    """
    try:
        skill = Skill.query.get_or_404(skill_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Update fields if provided
        if 'name' in data and data['name'].strip():
            skill.name = data['name'].strip()
        
        if 'category' in data:
            skill.category = data['category'].strip() or None
        
        if 'status' in data:
            try:
                skill.status = SkillStatus(data['status'])
            except ValueError:
                return jsonify({'error': 'Invalid status value'}), 400
        
        # Update timestamp
        skill.updated_at = datetime.utcnow()
        
        db.session.commit()
        return jsonify(skill.to_dict())
    
    except IntegrityError:
        db.session.rollback()
        return jsonify({'error': 'Skill name already exists'}), 409
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api.route('/skills/<int:skill_id>', methods=['DELETE'])
def delete_skill(skill_id):
    """
    Delete a skill.
    
    Args:
        skill_id: ID of the skill to delete
    
    Returns:
        Success message
    """
    try:
        skill = Skill.query.get_or_404(skill_id)
        db.session.delete(skill)
        db.session.commit()
        
        return jsonify({'message': 'Skill deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# === STUDY LOGS ENDPOINTS ===

@api.route('/logs', methods=['GET'])
def get_study_logs():
    """
    Get all study logs, ordered by date (most recent first).
    
    Query Parameters:
        limit: Maximum number of logs to return (default: 50)
        offset: Number of logs to skip (for pagination)
        date_from: Start date (YYYY-MM-DD format)
        date_to: End date (YYYY-MM-DD format)
    
    Returns:
        JSON array of study log objects
    """
    try:
        # Start with all logs
        query = StudyLog.query
        
        # Date range filtering
        date_from = request.args.get('date_from')
        date_to = request.args.get('date_to')
        
        if date_from:
            date_from_obj = datetime.strptime(date_from, '%Y-%m-%d').date()
            query = query.filter(StudyLog.date >= date_from_obj)
        
        if date_to:
            date_to_obj = datetime.strptime(date_to, '%Y-%m-%d').date()
            query = query.filter(StudyLog.date <= date_to_obj)
        
        # Pagination
        limit = min(int(request.args.get('limit', 50)), 100)  # Cap at 100
        offset = int(request.args.get('offset', 0))
        
        # Order by date (most recent first) and apply pagination
        logs = query.order_by(StudyLog.date.desc()).limit(limit).offset(offset).all()
        
        return jsonify([log.to_dict() for log in logs])
    
    except ValueError as e:
        return jsonify({'error': 'Invalid date format or parameter'}), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@api.route('/logs', methods=['POST'])
def create_study_log():
    """
    Create a new study log.
    
    Expected JSON body:
        {
            "date": "YYYY-MM-DD (required)",
            "hours": 2.5 (required, can be decimal),
            "notes": "Optional notes",
            "skill_ids": [1, 2, 3] (optional array of skill IDs)
        }
    
    Returns:
        JSON object of the created study log
    """
    try:
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        if not data.get('date'):
            return jsonify({'error': 'Date is required'}), 400
        
        if not data.get('hours') or data.get('hours') <= 0:
            return jsonify({'error': 'Hours must be a positive number'}), 400
        
        # Parse date
        try:
            log_date = datetime.strptime(data['date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({'error': 'Invalid date format. Use YYYY-MM-DD'}), 400
        
        # Create study log
        study_log = StudyLog(
            date=log_date,
            hours=float(data['hours']),
            notes=data.get('notes', '').strip() or None
        )
        
        # Add associated skills
        skill_ids = data.get('skill_ids', [])
        if skill_ids:
            skills = Skill.query.filter(Skill.id.in_(skill_ids)).all()
            if len(skills) != len(skill_ids):
                return jsonify({'error': 'One or more skill IDs not found'}), 404
            study_log.skills = skills
        
        db.session.add(study_log)
        db.session.commit()
        
        return jsonify(study_log.to_dict()), 201
    
    except ValueError as e:
        return jsonify({'error': 'Invalid hours value'}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@api.route('/logs/<int:log_id>', methods=['DELETE'])
def delete_study_log(log_id):
    """
    Delete a study log.
    
    Args:
        log_id: ID of the study log to delete
    
    Returns:
        Success message
    """
    try:
        log = StudyLog.query.get_or_404(log_id)
        db.session.delete(log)
        db.session.commit()
        
        return jsonify({'message': 'Study log deleted successfully'})
    
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

# === STATISTICS ENDPOINTS ===

@api.route('/stats', methods=['GET'])
def get_stats():
    """
    Get various statistics about study progress.
    
    Returns:
        JSON object with:
        - daily_streak: Number of consecutive study days
        - weekly_hours: Hours studied this week
        - monthly_hours: Hours studied this month
        - skill_counts: Count of skills by status
        - recent_activity: Last 7 days of study activity
    """
    try:
        today = date.today()
        week_start = today - timedelta(days=today.weekday())  # Monday
        month_start = today.replace(day=1)
        
        # Calculate daily streak
        streak = calculate_daily_streak()
        
        # Weekly hours
        weekly_hours = db.session.query(func.sum(StudyLog.hours)).filter(
            StudyLog.date >= week_start
        ).scalar() or 0
        
        # Monthly hours
        monthly_hours = db.session.query(func.sum(StudyLog.hours)).filter(
            StudyLog.date >= month_start
        ).scalar() or 0
        
        # Skill counts by status
        skill_counts = {}
        for status in SkillStatus:
            count = Skill.query.filter(Skill.status == status).count()
            skill_counts[status.value] = count
        
        # Recent activity (last 7 days)
        seven_days_ago = today - timedelta(days=6)
        recent_logs = StudyLog.query.filter(
            StudyLog.date >= seven_days_ago
        ).order_by(StudyLog.date.desc()).all()
        
        recent_activity = []
        for log in recent_logs:
            recent_activity.append({
                'date': log.date.isoformat(),
                'hours': log.hours,
                'skills_count': len(log.skills)
            })
        
        return jsonify({
            'daily_streak': streak,
            'weekly_hours': float(weekly_hours),
            'monthly_hours': float(monthly_hours),
            'skill_counts': skill_counts,
            'recent_activity': recent_activity
        })
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def calculate_daily_streak():
    """
    Calculate the current daily study streak.
    
    Returns:
        Number of consecutive days with study activity
    """
    try:
        today = date.today()
        streak = 0
        current_date = today
        
        # Get all study dates in descending order
        study_dates = db.session.query(StudyLog.date).distinct().order_by(StudyLog.date.desc()).all()
        study_dates = [d[0] for d in study_dates]  # Extract dates from tuples
        
        if not study_dates:
            return 0
        
        # Check if we studied today or yesterday (to account for not studying today yet)
        if study_dates and (study_dates[0] == today or study_dates[0] == today - timedelta(days=1)):
            # Start counting from the most recent study date
            for study_date in study_dates:
                if study_date == current_date or study_date == current_date - timedelta(days=1):
                    streak += 1
                    current_date = study_date - timedelta(days=1)
                else:
                    break
        
        return streak
    
    except Exception:
        return 0  # Return 0 if there's any error calculating streak
