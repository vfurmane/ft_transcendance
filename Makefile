prod:	
		docker-compose up --build -d

dev:	
		docker-compose -f docker-compose.yml -f docker-compose.dev.yml up --build -d && docker-compose logs -f web -f api

stop:	
		docker-compose -f docker-compose.yml -f docker-compose.dev.yml down

.PHONY: prod dev stop