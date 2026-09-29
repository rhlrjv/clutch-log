SHELL := /bin/sh

PYTHON ?= python3
HOST ?= localhost

ifneq ($(strip $(CONDUCTOR_PORT)),)
FRONTEND_PORT ?= $(CONDUCTOR_PORT)
BACKEND_PORT ?= $(shell expr $(CONDUCTOR_PORT) + 1)
else
FRONTEND_PORT ?= 3000
BACKEND_PORT ?= 8000
endif

VENV := backend/.venv
VENV_PYTHON := $(VENV)/bin/python
BACKEND_INSTALL_STAMP := $(VENV)/.installed
FRONTEND_INSTALL_STAMP := frontend/node_modules/.installed

.PHONY: run setup run-backend run-frontend clean

run: setup
	@echo "Starting frontend on http://$(HOST):$(FRONTEND_PORT)"
	@echo "Starting backend on http://$(HOST):$(BACKEND_PORT)"
	@$(MAKE) --no-print-directory -j2 run-backend run-frontend

setup: $(BACKEND_INSTALL_STAMP) $(FRONTEND_INSTALL_STAMP)

$(BACKEND_INSTALL_STAMP): backend/requirements-simple.txt
	$(PYTHON) -m venv $(VENV)
	$(VENV_PYTHON) -m pip install -r backend/requirements-simple.txt
	@touch $@

$(FRONTEND_INSTALL_STAMP): frontend/package.json frontend/package-lock.json
	cd frontend && npm ci
	@touch $@

run-backend:
	cd backend && \
		FRONTEND_URL="http://$(HOST):$(FRONTEND_PORT)" \
		../$(VENV_PYTHON) -m uvicorn app.main:app \
			--host "$(HOST)" --port "$(BACKEND_PORT)" --reload

run-frontend:
	cd frontend && \
		BROWSER=none \
		HOST="$(HOST)" \
		PORT="$(FRONTEND_PORT)" \
		REACT_APP_API_URL="http://$(HOST):$(BACKEND_PORT)" \
		npm start

clean:
	rm -rf $(VENV) frontend/node_modules
