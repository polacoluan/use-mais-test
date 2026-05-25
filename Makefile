.PHONY: prepare-env start up down build logs restart ps

prepare-env:
	@if [ ! -f backend/.env ] && [ -f backend/.env.example ]; then cp backend/.env.example backend/.env; fi
	@if [ ! -f frontend/.env.local ] && [ -f frontend/.env.example ]; then cp frontend/.env.example frontend/.env.local; fi

start:
	@$(MAKE) prepare-env
	docker compose up -d --force-recreate --remove-orphans

up:
	@$(MAKE) prepare-env
	docker compose up --build -d --force-recreate --remove-orphans

down:
	docker compose down --remove-orphans

build:
	@$(MAKE) prepare-env
	docker compose build

logs:
	docker compose logs -f

restart:
	@$(MAKE) prepare-env
	docker compose down --remove-orphans
	docker compose up --build -d --force-recreate --remove-orphans

ps:
	docker compose ps
