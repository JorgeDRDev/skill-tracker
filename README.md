# Skill Checklist & Habit Tracker

A web application to track your learning progress and build consistent study habits. Built with Flask, SQLite, and vanilla JavaScript.

![Skill Tracker Screenshot](https://via.placeholder.com/800x400?text=Skill+Tracker+Dashboard)

## ✨ Features

### Core Functionality
- **Skill Management**: Add, edit, and delete skills with status tracking (To Learn, In Progress, Learned)
- **Study Logging**: Record study sessions with date, hours, and associated skills
- **Progress Tracking**: 
  - Daily streak counter (consecutive study days)
  - Weekly and monthly study hours
  - Skills learned count
- **Filtering & Organization**: Filter skills by category and status
- **Responsive Design**: Works on desktop, tablet, and mobile devices

### User Experience
- Clean, modern interface with intuitive navigation
- Real-time updates without page refreshes
- Toast notifications for user feedback
- Loading indicators for API operations
- Modal forms for data entry

## 🚀 Quick Start

### Prerequisites
- Python 3.7 or higher
- pip (Python package installer)

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd skill-tracker
   ```

2. **Create a virtual environment (recommended)**
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # macOS/Linux
   source venv/bin/activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the application**
   ```bash
   python app.py
   ```

5. **Open your browser**
   Navigate to `http://localhost:5000`

The app will automatically create a SQLite database (`tracker.db`) with sample data on first run.

## 🏗️ Architecture

### Project Structure
```
skill-tracker/
├── app.py                 # Flask application entry point
├── models.py             # SQLAlchemy database models
├── routes.py             # REST API endpoints
├── database.py           # Database configuration and setup
├── requirements.txt      # Python dependencies
├── tracker.db           # SQLite database (created on first run)
├── templates/
│   └── index.html       # Single-page application template
└── static/
    ├── css/
    │   └── styles.css   # Application styles
    └── js/
        └── main.js      # Frontend JavaScript application
```

### Technology Stack

#### Backend
- **Flask 2.3.3**: Lightweight Python web framework
- **SQLAlchemy 2.0.21**: SQL toolkit and ORM
- **SQLite**: File-based database (no server required)
- **Flask-SQLAlchemy 3.0.5**: Flask integration for SQLAlchemy

#### Frontend
- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Modern styling with CSS Grid, Flexbox, and custom properties
- **Vanilla JavaScript**: ES6+ features, modular architecture
- **Fetch API**: For AJAX communication with backend

### Design Decisions

#### Why Flask?
- **Simplicity**: Perfect for small to medium applications
- **Flexibility**: Doesn't force specific project structure
- **Learning**: Great for understanding web development fundamentals
- **Extensibility**: Easy to add features like authentication, file uploads, etc.

#### Why SQLite?
- **Zero Configuration**: No database server setup required
- **Portability**: Single file database, easy to backup/move
- **Performance**: Sufficient for single-user applications
- **Development**: Perfect for prototyping and development

#### Why Vanilla JavaScript?
- **Learning**: Understand core concepts without framework abstractions
- **Performance**: No framework overhead, faster load times
- **Simplicity**: Fewer dependencies to manage
- **Foundation**: Easier to adopt frameworks later with solid JS knowledge

### Backend Architecture

#### Models (`models.py`)
- **Skill**: Represents learnable skills with status tracking
- **StudyLog**: Records study sessions with time and notes
- **Many-to-Many Relationship**: Skills can be studied in multiple sessions

#### API Design (`routes.py`)
RESTful endpoints following standard conventions:

**Skills**
- `GET /api/skills` - List all skills (with filtering)
- `POST /api/skills` - Create new skill
- `PUT /api/skills/<id>` - Update existing skill
- `DELETE /api/skills/<id>` - Delete skill

**Study Logs**
- `GET /api/logs` - List study logs (with pagination)
- `POST /api/logs` - Create new study log
- `DELETE /api/logs/<id>` - Delete study log

**Statistics**
- `GET /api/stats` - Get dashboard statistics

#### Database Design
```sql
-- Skills table
CREATE TABLE skill (
    id INTEGER PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    status ENUM('To Learn', 'In Progress', 'Learned') NOT NULL,
    category VARCHAR(100),
    created_at DATETIME NOT NULL,
    updated_at DATETIME NOT NULL
);

-- Study logs table
CREATE TABLE study_log (
    id INTEGER PRIMARY KEY,
    date DATE NOT NULL,
    hours FLOAT NOT NULL,
    notes TEXT,
    created_at DATETIME NOT NULL
);

-- Association table for many-to-many relationship
CREATE TABLE study_skill_association (
    study_log_id INTEGER,
    skill_id INTEGER,
    PRIMARY KEY (study_log_id, skill_id),
    FOREIGN KEY (study_log_id) REFERENCES study_log(id),
    FOREIGN KEY (skill_id) REFERENCES skill(id)
);
```

### Frontend Architecture

#### Module Pattern
The JavaScript is organized into three main modules:

1. **API Module**: Handles all server communication
2. **UI Module**: Manages DOM updates and rendering
3. **App Module**: Coordinates application logic and events

#### Component Structure
- **Navigation**: Single-page app with section switching
- **Dashboard**: Statistics cards and recent activity
- **Skills**: CRUD operations with filtering
- **Study Logs**: Session logging with skill association
- **Modals**: Form overlays for data entry

#### State Management
- No complex state management needed
- Data fetched fresh on section loads
- Local state for form editing
- URL-based navigation (future enhancement)

## 🔧 API Reference

### Authentication
Currently no authentication is implemented. All endpoints are publicly accessible.

### Skills Endpoints

#### Get All Skills
```http
GET /api/skills?category=Backend&status=In Progress
```

Response:
```json
[
  {
    "id": 1,
    "name": "Python Flask",
    "status": "In Progress",
    "category": "Backend",
    "created_at": "2024-07-20T10:00:00",
    "updated_at": "2024-07-22T15:30:00"
  }
]
```

#### Create Skill
```http
POST /api/skills
Content-Type: application/json

{
  "name": "React Components",
  "category": "Frontend",
  "status": "To Learn"
}
```

### Study Logs Endpoints

#### Create Study Log
```http
POST /api/logs
Content-Type: application/json

{
  "date": "2024-07-22",
  "hours": 2.5,
  "notes": "Learned about Flask routing",
  "skill_ids": [1, 3]
}
```

### Statistics Endpoint
```http
GET /api/stats
```

Response:
```json
{
  "daily_streak": 3,
  "weekly_hours": 7.5,
  "monthly_hours": 25.0,
  "skill_counts": {
    "To Learn": 5,
    "In Progress": 3,
    "Learned": 2
  },
  "recent_activity": [
    {
      "date": "2024-07-22",
      "hours": 2.5,
      "skills_count": 2
    }
  ]
}
```

## 🎨 Customization

### Styling
The app uses CSS custom properties for easy theming. Main variables are defined in `:root`:

```css
:root {
  --primary-color: #6366f1;
  --accent-color: #10b981;
  --danger-color: #ef4444;
  /* ... more variables */
}
```

### Adding Features
The modular architecture makes it easy to extend:

1. **New API endpoints**: Add to `routes.py`
2. **Database changes**: Update `models.py` and handle migrations
3. **UI components**: Add to the appropriate module in `main.js`
4. **Styling**: Add new CSS classes following the existing pattern

## 🔮 Future Enhancements

### Near-term (Easy to implement)
- **Import/Export**: JSON backup and restore functionality
- **Categories**: Better category management with colors/icons
- **Search**: Full-text search across skills and notes
- **Keyboard Shortcuts**: Power user productivity features
- **Dark Mode**: Theme toggle with localStorage persistence

### Medium-term (Moderate complexity)
- **Charts**: Visual progress tracking with Chart.js or D3.js
- **GitHub-style Heatmap**: Calendar view of study activity
- **Goals**: Set and track learning objectives
- **Tags**: More flexible categorization system
- **Bulk Operations**: Multi-select for batch updates/deletes

### Long-term (Major features)
- **User Authentication**: Multi-user support with login/registration
- **Data Sync**: Cloud storage integration (Google Drive, Dropbox)
- **Mobile App**: React Native or Progressive Web App
- **Social Features**: Share progress, compare with friends
- **AI Insights**: Study pattern analysis and recommendations
- **Spaced Repetition**: Built-in review scheduling

### Technical Improvements
- **Testing**: Unit and integration tests with pytest
- **CI/CD**: Automated testing and deployment
- **Docker**: Containerization for easy deployment
- **Database**: Migration to PostgreSQL for production
- **Caching**: Redis for improved performance
- **API Versioning**: Backward compatibility for mobile apps

## 🤝 Contributing

This project was built as a learning exercise, but contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Setup
```bash
# Install development dependencies
pip install -r requirements.txt

# Run with debug mode (auto-reload)
python app.py

# Reset database (WARNING: deletes all data)
# In Python console:
from app import create_app
from database import reset_database
app = create_app()
reset_database(app)
```

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- **Design Inspiration**: GitHub's clean interface design
- **Color Palette**: Tailwind CSS default colors
- **Icons**: Unicode emojis for simplicity and universal support
- **Typography**: System font stack for optimal performance

---

**Built with ❤️ for learning and productivity**
