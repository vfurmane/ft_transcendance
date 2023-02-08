prod:	
		test -f package-lock.json || npm i --package-lock-only
		docker-compose up --build -d

dev:	
		test -f package-lock.json || npm i --package-lock-only
		docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d && docker-compose logs -f web -f api

re-prod:	stop prod

re-dev:		stop dev

stop:	
		docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

.PHONY: prod dev stop re-prod re-dev
