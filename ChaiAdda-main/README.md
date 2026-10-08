# CampusAdda - Campus Event Platform

A simple web platform that helps university students discover, create and join informal campus events like study groups, club meetings, and hangouts.

**GitHub Repository:** [https://github.com/AfrinAkter020/ChaiAdda](https://github.com/AfrinAkter020/ChaiAdda)

## About
CampusAdda centralizes campus event discovery and creation in one place, making it easier for students to find relevant gatherings and organize activities.

## Features
- **User Registration**: Simple account creation for students
- **Admin System**: Only admin users can create events (regular users can browse and register)
- **Event Creation**: Easy form for admins to create campus events
- **Event Listing**: View all upcoming campus events
- **Event Categories**: Organize events by type (Study, Social, Academic, etc.)
- **Attendance System**: Join/leave events with simple click
- **Search**: Find events by title or category
- **Role-Based Access**: Different permissions for admin and regular users

## Technical Stack
### Frontend: ReactJS
- Modern React with hooks
- Basic CSS for styling
- React state management (useState, useContext)

### Backend: Django
- Django with built-in admin
- SQLite database (simple setup)
- Django templates for any server-side rendering needs

## Development Status
### Phase 1: Frontend Complete
- [x] User registration and login pages
- [x] Event creation form with validation
- [x] Event listing page with filtering
- [x] Basic attendance system
- [x] Professional UI/UX with responsive design
- [x] Search functionality
- [x] Event categories and filtering
- [x] Authentication context system

### Phase 2: Backend Development
- [x] Django backend setup
- [x] Database models implementation (User, Event, Category, Attendance)
- [x] REST API endpoints
- [x] Django admin configuration
- [x] Sample data population
- [x] Frontend-backend integration
- [x] CORS configuration for React frontend
- [x] Authentication system with session management
- [x] Event creation and attendance functionality
- [x] **Admin/Event Manager System** - Only admins can create events

## Database Models
- **User**: Basic user information and authentication
- **Event**: Event details (title, description, date, location, category)
- **Attendance**: User-event relationships for tracking attendance

## Getting Started

### Prerequisites
- Python 3.8+ (for Django backend)
- Node.js 14+ (for React frontend)
- Git (for version control)

### Quick Start (Full Stack)

1. **Set up PostgreSQL**
Install and start PostgreSQL, then create a database named `chaiadda` (or use another name in `POSTGRES_DB`). In PowerShell, configure the connection before running Django:

```powershell
$env:POSTGRES_DB = "chaiadda"
$env:POSTGRES_USER = "postgres"
$env:POSTGRES_PASSWORD = "your-local-postgres-password"
$env:POSTGRES_HOST = "127.0.0.1"
$env:POSTGRES_PORT = "5432"
```

2. **Set up the Backend (Django)**
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py populate_db    # Create sample data
python manage.py createsuperuser  # Create admin account
python manage.py runserver      # Start on http://127.0.0.1:8000
```

The backend uses PostgreSQL by default. The connection settings above apply to the current PowerShell session; configure them in your deployment environment for persistent use. Existing SQLite data is not copied automatically. To explicitly use SQLite for local development, set:

```powershell
$env:DB_ENGINE = "sqlite"
```

### Creating a Superuser (Admin Account)

To access the Django admin panel at `http://127.0.0.1:8000/admin/`, you need to create a superuser account:

```bash
cd backend
python manage.py createsuperuser
```

You'll be prompted to enter:
- **Email address**: Your admin email (e.g., admin@gmail.com)
- **Username**: Admin username (e.g., admin)
- **First name**: Your first name
- **Last name**: Your last name  
- **Password**: Secure password (you can bypass validation if needed for development)

**Example:**
```bash
Email address: afrin@gmail.com
Username: afrin
First name: Afrin
Last name: Akter
Password: password123
Password (again): password123
Superuser created successfully.
```

The superuser can:
- Access Django admin panel
- Manage all users, events, categories, and attendance
- Have full administrative privileges
- Create, edit, and delete any content

### Creating Admin Users (For Event Creation)

⚠️ **Important**: Only users with `is_admin=True` can create events!

**Method 1: Using the Admin Creation Script (Easiest)**
```bash
cd backend
python create_admin.py
```

**Method 2: Using Django Admin Panel**
1. Login to `http://127.0.0.1:8000/admin/`
2. Click on "Users"
3. Select a user or create new
4. Check the "Is admin" checkbox
5. Save

**Method 3: Using Django Shell**
```bash
cd backend
python manage.py shell
```
```python
from events.models import User
user = User.objects.get(email='user@example.com')
user.is_admin = True
user.save()
```

📖 **For detailed information about the admin system, see [ADMIN_FEATURE.md](ADMIN_FEATURE.md)**

2. **Set up the Frontend (React)**
```bash
cd frontend
npm install
npm start                       # Start on http://localhost:3000
```

3. **Access the Application**
    - **Main App**: `http://localhost:3000` - Full CampusAdda interface
- **API**: `http://127.0.0.1:8000/api/` - Backend API endpoints
- **Admin**: `http://127.0.0.1:8000/admin/` - Django admin panel

##  Login Credentials

### Django Admin Panel (`http://127.0.0.1:8000/admin/`)
- **Email:** `afrin@gmail.com`
- **Username:** `afrin` 
- **Password:** `password123`
- **Role:** Superuser (Full admin access)

### CampusAdda Frontend (`http://localhost:3000/`)
Use any of these Gmail accounts:
- **Email:** `afrin@gmail.com` | **Password:** `password123` (Admin)
- **Email:** `antora@gmail.com` | **Password:** `password123` (User)  
- **Email:** `nusrat@gmail.com` | **Password:** `password123` (User)

**Note:** All accounts use the same password: `password123`

### Individual Setup

#### Frontend Only
```bash
cd frontend
npm install
npm start
```

#### Backend Only  
```bash
cd backend
pip install -r requirements.txt
python manage.py migrate
python manage.py populate_db
python manage.py runserver
```

## API Endpoints (Backend)

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/logout/` - User logout
- `GET /api/auth/user/` - Get current user info

### Events
- `GET /api/events/` - List all events (with search/filter)
- `POST /api/events/` - Create new event
- `GET /api/events/{id}/` - Get event details
- `PUT /api/events/{id}/` - Update event (organizer only)
- `DELETE /api/events/{id}/` - Delete event (organizer only)
- `GET /api/events/{id}/attendees/` - Get event attendees

### Categories
- `GET /api/categories/` - List all event categories

### Attendance
- `GET /api/attendances/` - List user's event attendance
- `POST /api/attendances/create/` - Join/Leave event

## Current Features (Full Stack)
- **Responsive Design**: Works on desktop, tablet, and mobile
- **User Authentication**: Login/Register with Django session authentication
- **Event Management**: Create, view, edit, and delete events
- **Event Discovery**: Search and filter events by category
- **Attendance System**: Join/leave events with real-time attendee counts
- **Professional UI**: Clean, modern interface with consistent styling
- **REST API**: Complete backend API with Django REST Framework
- Database Models**: User, Event, Category, Attendance with relationships
- **Admin Interface**: Django admin for content management
- **Sample Data**: Pre-populated with events and users for testing
- **Cross-Origin Support**: CORS configured for React-Django communication
- **Real-time Integration**: Frontend and backend fully connected

## Project Structure
```
ChaiAdda/
├── .gitignore
├── README.md
├── Planning.md       # Project planning document
├── frontend/         # React application (Complete)
│   ├── package.json
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js
│       ├── contexts/
│       │   └── AuthContext.js
│       ├── components/
│       │   ├── Header.js
│       │   ├── Footer.js
│       │   └── EventCard.js
│       ├── pages/
│       │   ├── Home.js
│       │   ├── Login.js
│       │   ├── Register.js
│       │   ├── Events.js
│       │   └── CreateEvent.js
│       └── styles/
│           └── globals.css
└── backend/          # Django project (Complete)
    ├── requirements.txt
    ├── manage.py
    ├── chaiadda/        # Django project settings
    │   ├── settings.py
    │   ├── urls.py
    │   └── wsgi.py
    └── events/          # Django app
        ├── models.py    # User, Event, Category, Attendance models
        ├── serializers.py  # DRF serializers
        ├── views.py     # API endpoints
        ├── urls.py      # URL routing
        ├── admin.py     # Django admin config
        └── management/
            └── commands/
                └── populate_db.py  # Sample data
```

## Technology Stack

### Frontend
- **React 18.2.0** - Modern JavaScript framework
- **React Router** - Client-side routing
- **Context API** - State management
- **Custom CSS** - Responsive design system
- **Fetch API** - HTTP client for API calls

### Backend
- **Django 5.2.8** - Python web framework
- **Django REST Framework** - API development
- **SQLite** - Zero-configuration local database
- **PostgreSQL** - Configurable database via environment variables
- **Django Admin** - Content management
- **CORS Headers** - Cross-origin support

### Development Tools
- **Git** - Version control
- **npm** - Package management (frontend)
- **pip** - Package management (backend)
- **VS Code** - Recommended IDE

## Architecture

```
Frontend (React)     Backend (Django)      Database
     |                      |                  |
localhost:3000 ←→ API ← 127.0.0.1:8000 ←→ SQLite / PostgreSQL
     |                      |                  |
  - Components        - REST Endpoints    - User Model
  - Pages            - Authentication      - Event Model  
  - Context          - Serializers        - Category Model
  - Routing          - Admin Interface    - Attendance Model
```

## Development Status
 **Complete Full-Stack Application**
- Frontend and backend fully integrated
- Real-time data synchronization
- Production-ready architecture
- Comprehensive API documentation
- Admin interface for content management

## Screenshots
- Modern landing page with hero section
- Professional event cards with attendance functionality  
- Responsive navigation with search
- Clean authentication forms
- Event creation with validation
- Real-time attendance updates
- Django admin interface

#admin login
name: afrin@gmail.com
pass:password123

#user
name:abc@gmail.com
pass:0987654321