# ft_transcendence

A web Pong game with real-time multiplayer.

## Features

None.

## Getting started

### Prerequisities

You need the following programs to run the application:

- Git
- NodeJS
- NPM

### Installation

Clone the repository.

```sh
git clone https://github.com/vfurmane/ft_transcendence
```

Install the dependencies.

```sh
cd ft_transcendence
npm install
```

### Configuration

The environment file must be configured first. You can find the template file (`.env.template`) to help you configure the project.

```
# containers config
DATABASE_NAME=
DATABASE_USERNAME=
DATABASE_PASSWORD=
DATABASE_PORT=5432

# globals
FRONTEND_BASE_URL=http://localhost:8080
BACKEND_BASE_URL=http://localhost:3000

FT_OAUTH2_CLIENT_ID=

# api
FT_OAUTH2_CLIENT_ID=

JWT_SECRET=
```

### Running the server

```sh
npm start # On the host
docker compose up --build # With docker
```

## Development

```sh
npm run dev # On the host
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build # With docker
```

## Authors

- Brice Detune
- Maxence Eudier
- Savo Saicic
- Théodore Naton
- Valentin Furmanek

## License

This project is licensed under the MIT License - see the [LICENSE](https://github.com/vfurmane/ft_transcendence/blob/main/LICENSE) file for details.
