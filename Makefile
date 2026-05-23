.PHONY: up down build logs restart ps

start:
	docker compose up -d

up:
	docker compose up --build

down:
	docker compose down --remove-orphans

build:
	docker compose build

logs:
	docker compose logs -f

restart:
	docker compose down --remove-orphans
	docker compose up --build

ps:
	docker compose ps
