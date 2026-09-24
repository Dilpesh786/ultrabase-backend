.PHONY: install start dev test lint

install:
	npm install

start:
	node index.js

dev:
	npm run dev

test:
	npm test

lint:
	npm run lint
