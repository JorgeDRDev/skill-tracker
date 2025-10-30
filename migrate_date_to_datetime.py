"""
Migration script to convert StudyLog.date from Date to DateTime.

This script updates the database schema to change the date column
from Date to DateTime, preserving existing data by setting time to noon (12:00:00).

Run this script once to migrate your existing database.
"""

import sqlite3
import os
from datetime import datetime

def migrate_database():
    """Migrate the date column from Date to DateTime."""
    
    # Get the database path
    basedir = os.path.abspath(os.path.dirname(__file__))
    db_path = os.path.join(basedir, "tracker.db")
    
    if not os.path.exists(db_path):
        print("Database file not found. No migration needed.")
        return
    
    print("Starting migration...")
    
    # Connect to the database
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    try:
        # Check if the table exists
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='study_log'")
        if not cursor.fetchone():
            print("study_log table not found. No migration needed.")
            return
        
        # Create a new table with the correct schema
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS study_log_new (
                id INTEGER PRIMARY KEY,
                date DATETIME NOT NULL,
                hours REAL NOT NULL,
                notes TEXT,
                created_at DATETIME NOT NULL
            )
        """)
        
        # Copy data from old table to new table, converting date to datetime
        # Set time to noon (12:00:00) for existing records
        cursor.execute("""
            INSERT INTO study_log_new (id, date, hours, notes, created_at)
            SELECT id, 
                   datetime(date || ' 12:00:00') as date,
                   hours, 
                   notes, 
                   created_at
            FROM study_log
        """)
        
        # Drop the old table
        cursor.execute("DROP TABLE study_log")
        
        # Rename the new table to the original name
        cursor.execute("ALTER TABLE study_log_new RENAME TO study_log")
        
        # Recreate the association table if needed
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS study_skill_association_new (
                study_log_id INTEGER NOT NULL,
                skill_id INTEGER NOT NULL,
                PRIMARY KEY (study_log_id, skill_id),
                FOREIGN KEY (study_log_id) REFERENCES study_log(id),
                FOREIGN KEY (skill_id) REFERENCES skill(id)
            )
        """)
        
        # Copy association data
        cursor.execute("""
            INSERT OR IGNORE INTO study_skill_association_new (study_log_id, skill_id)
            SELECT study_log_id, skill_id
            FROM study_skill_association
        """)
        
        # Drop old association table and rename new one
        cursor.execute("DROP TABLE IF EXISTS study_skill_association")
        cursor.execute("ALTER TABLE study_skill_association_new RENAME TO study_skill_association")
        
        # Commit the changes
        conn.commit()
        print("Migration completed successfully!")
        print("The date column has been converted to datetime.")
        print("Existing dates have been set to 12:00:00 PM.")
        
    except Exception as e:
        conn.rollback()
        print(f"Migration failed: {e}")
        raise
    
    finally:
        conn.close()

if __name__ == "__main__":
    migrate_database()
