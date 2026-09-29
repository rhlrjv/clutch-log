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

- Python 3.9+
- Node.js 16+
- npm
- Make

Install the prerequisites, then start the entire app with one command from the
repository root:

```bash
make run
```

This installs missing backend and frontend dependencies, then starts both
development servers. In a regular shell, the defaults are:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API docs: http://localhost:8000/docs

To avoid collisions when running multiple git worktrees, override either port:

```bash
make run FRONTEND_PORT=3100 BACKEND_PORT=8100
```

Conductor workspaces use their allocated `CONDUCTOR_PORT` automatically for
the frontend and the next port for the backend, so plain `make run` is safe to
use across parallel worktrees.

## Testing

### Backend Tests

```bash
# Run all backend tests
backend/.venv/bin/python -m pytest backend/tests/

# Run with verbose output
backend/.venv/bin/python -m pytest backend/tests/ -v

# Run specific test file
backend/.venv/bin/python -m pytest backend/tests/unit/test_domain.py
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
