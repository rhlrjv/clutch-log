# 🏍️ Clutch Log

A Progressive Web App for motorcycle maintenance tracking and service management.

## Project Structure

```
clutchlog/
├── backend/          # FastAPI Python backend
├── frontend/         # React TypeScript frontend  
├── tests/           # Playwright E2E tests
└── README.md
```

## Features

- **Garage Management**: Add motorcycles with make, model, year, mileage, VIN, insurance details
- **Service Tracking**: Track service intervals based on mileage and time
- **Service Records**: Record completed maintenance work
- **Todo Tasks**: Manual task tracking with service record integration
- **Service Manuals**: View maintenance instructions and parts information
- **PWA Support**: Install on mobile devices
- **Predefined Schedules**: Built-in maintenance schedules for Suzuki SV650 and Ducati Monster

## Tech Stack

- **Frontend**: React, TypeScript, PWA
- **Backend**: FastAPI, Python, SQLAlchemy
- **Database**: SQLite (local dev), PostgreSQL (production)
- **Testing**: Playwright E2E tests, pytest backend tests
- **Architecture**: Domain Driven Design with Repository Pattern

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- npm or yarn

### 1. Start the Backend

```bash
cd backend

# Create and activate virtual environment (first time only)
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies (first time only)
pip install -r requirements-simple.txt

# Start the API server
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend will be available at: http://localhost:8000
- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/health

### 2. Start the Frontend

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start the development server
npm start
```

Frontend will be available at: http://localhost:3000

### 3. Access the Application

Open your browser to http://localhost:3000

The app will show your garage where you can:
1. **Add a motorcycle** using the "Add Motorcycle" button
2. **Select predefined schedules** for Suzuki SV650 or Ducati Monster
3. **View service tasks** that are automatically created based on your motorcycle's schedule
4. **Navigate between sections** using the top navigation

## Testing

### Backend Tests

```bash
cd backend
source venv/bin/activate

# Run all backend tests
pytest tests/

# Run with verbose output
pytest tests/ -v

# Run specific test file
pytest tests/unit/test_domain.py
```

**Test Coverage**: 38 passing tests covering domain logic, services, and API endpoints.

### End-to-End Tests

```bash
cd tests

# Install test dependencies (first time only)
npm install

# Install Playwright browsers (first time only)
npx playwright install

# Run all E2E tests (starts backend and frontend automatically)
npm test

# Run tests in headed mode (visible browser)
npm run test:headed

# Run specific test
npx playwright test app.spec.ts --project=chromium

# View test report
npx playwright show-report
```

**Test Coverage**: 96 E2E tests covering full user workflows across multiple browsers.

## API Endpoints

### Motorcycles
- `GET /api/motorcycles` - List all motorcycles
- `POST /api/motorcycles` - Create a new motorcycle
- `GET /api/motorcycles/{id}` - Get specific motorcycle
- `PUT /api/motorcycles/{id}` - Update motorcycle
- `DELETE /api/motorcycles/{id}` - Delete motorcycle
- `PUT /api/motorcycles/{id}/mileage` - Update motorcycle mileage

### Service Tasks
- `GET /api/motorcycles/{id}/service-tasks` - Get service tasks for motorcycle
- `POST /api/service-tasks/{id}/complete` - Mark service task as complete

### Service Records
- `GET /api/motorcycles/{id}/service-records` - Get service records
- `POST /api/service-records` - Create service record

### Todo Tasks
- `GET /api/motorcycles/{id}/todo-tasks` - Get todo tasks
- `POST /api/todo-tasks` - Create todo task
- `PUT /api/todo-tasks/{id}` - Update todo task

### Metadata
- `GET /api/motorcycles/makes` - Get available makes
- `GET /api/motorcycles/makes/{make}/models` - Get models for make
- `GET /health` - Health check endpoint

## Database

### Local Development (SQLite)
- Database file: `backend/clutchlog.db`
- Automatically created on first run
- View with any SQLite browser

### Schema
- **motorcycles**: Core motorcycle data
- **service_tasks**: Maintenance tasks with intervals
- **service_records**: Completed service history
- **todo_tasks**: Manual tasks and reminders

## Development Notes

### Architecture
- **Domain Driven Design**: Business logic separated from infrastructure
- **Repository Pattern**: Data access abstraction
- **Service Layer**: Business operations and workflows
- **Clean Architecture**: Dependencies point inward toward domain

### Key Components
- **Domain Models**: Pure business logic (motorcycle.py, service_task.py)
- **Services**: Business workflows (services.py)
- **Repositories**: Data access interface (repositories.py)
- **Infrastructure**: Database implementation (repository_impl.py)
- **API**: HTTP endpoints (endpoints/*.py)

### Frontend Structure
- **Components**: Reusable UI components
- **Services**: API client and business logic
- **Types**: TypeScript definitions
- **Utils**: Helper functions and formatters

## Known Issues

⚠️ **API Proxy Configuration**: Frontend `/api/*` calls currently return HTML instead of being proxied to backend. Directly calling `http://localhost:8000/api/*` works correctly.

## Troubleshooting

### Backend Issues
```bash
# Check if backend is running
curl http://localhost:8000/health

# Check API endpoint directly
curl http://localhost:8000/api/motorcycles

# View logs
# Backend logs appear in the terminal where uvicorn is running
```

### Frontend Issues
```bash
# Clear node modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check if frontend is running
curl http://localhost:3000
```

### Test Issues
```bash
# Clear Playwright cache
npx playwright install --force

# Run single test for debugging
npx playwright test --headed --debug app.spec.ts
```

## Contributing

1. **Backend**: Add tests in `backend/tests/` for new features
2. **Frontend**: Follow existing component patterns
3. **E2E Tests**: Add tests in `tests/e2e/` for new user workflows
4. **Domain Logic**: Keep business rules in domain models
5. **API**: Follow RESTful conventions

## PWA Features (Coming Soon)

- Offline support with service worker
- App manifest for installation
- Push notifications for service reminders
- Background sync for data updates

## License

MIT License - see LICENSE file for details