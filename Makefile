include .env
export $(shell sed 's/=.*//' .env)

export PYTHONPATH=$(CURDIR)

define set_user_id
    export USER_ID=$(shell id -u)
	$(eval export USER_ID=$(shell id -u))
endef

.PHONY: help
help: ## Command help
	@egrep -h '\s##\s' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

.PHONY: install
install: ## Install
	@poetry install
	@cd dashboard;npm install

.PHONY: infra-start
infra-start: ## Start infra
	@docker compose up

.PHONY: setup
setup: ## Setup libraries
	@poetry install

.PHONY: server-run
server-run: ## Run the API Server
	@poetry run uvicorn main:app --reload

.PHONY: loader-run
loader-run: ## Run the Bulk Loader
	@poetry run python loader.py

.PHONY: dashboard-run
dashboard-run: ## Run the API
	@export NODE_OPTIONS=--openssl-legacy-provider;cd dashboard;poetry run npm start

.PHONY: infra-stop
infra-stop: ## Stop infra
	@docker compose down
