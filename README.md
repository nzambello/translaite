# translAIte

Translations app built with Remix, supports authentication. Uses ChatGPT to translate text.

After your first login, you will be prompted to enter your OpenAI API key. You can get one [here](https://platform.openai.com/account/api-keys).

Built for self-hosting: host it anywhere you want, and use it for free.

View on [DockerHub](https://hub.docker.com/r/nzambello/translaite).

## Table of contents

- [Pre-built Docker image](#pre-built-docker-image)
  - [Docker compose](#docker-compose)
- [Custom deployments or development](#custom-deployment-or-development)
  - [Tech stack](#tech-stack)
  - [Running locally](#running-locally)
  - [Running with Docker](#running-with-docker)
  - [Multi-platform docker image](#multi-platform-docker-image)
- [License](#license)

## Pre-built Docker Image

```bash
docker pull nzambello/translaite
```

If you want to use the pre-built Docker image, you can run it with:

```bash
docker run -d -p 8080:8080 -v /path/to/data:/data/data.db nzambello/translaite
```

If you want to use different defaults, you can build your own image. See [Running with docker](#running-with-docker)

### Docker compose

Basic example:

```yaml
version: "3.8"

services:
  translaite:
    image: nzambello/translaite
    container_name: translaite
    restart: always
    ports:
      - 8080:8080
    volumes:
      - ./dockerData/translaite:/data # Path to data for DB persistence
```

Example of docker-compose.yml with [Traefik](https://traefik.io/) as reverse proxy:

```yaml
translaite:
  depends_on:
    - watchtower
  image: nzambello/translaite
  container_name: translaite
  restart: always
  volumes:
    - /dockerData/translaite:/data # Path to data for DB persistence
  labels:
    - "com.centurylinklabs.watchtower.enable=true"
    - "traefik.enable=true"
    - "traefik.http.routers.translaite.rule=Host(`translate.YOURDOMAIN.com`)" # change it to your preferences
    - "traefik.http.routers.translaite.entrypoints=websecure"
    - "traefik.http.routers.translaite.tls.certresolver=letsencrypt"
    - "traefik.http.routers.translaite.service=translaite-service"
    - "traefik.http.services.translaite-service.loadbalancer.server.port=8080"
```

## Custom deployment or development

### Tech Stack

- [Remix](https://remix.run)
- [Prisma](https://prisma.io)
- [SQLite](https://sqlite.org)
- [Tailwind](https://tailwindcss.com)
- [Docker](https://docker.com)

### Running Locally

```bash
# Clone the repo
git clone https://github.com/nzambello/translaite.git
cd translaite

# Install dependencies
yarn install

# Setup .env
cp .env.example .env
vim .env

# Start the app
yarn dev
```

### Running with Docker

```bash
# Clone the repo
git clone https://github.com/nzambello/translaite.git
cd translaite

# Setup .env
cp .env.example .env
vim .env

# Build the image
docker built -t translaite .

# Start the app
docker run -p 127.0.0.1:8080:8080 translaite
```

### Multi-platform Docker image

```bash
docker buildx create --name mybuilder --driver docker-container --bootstrap --use # create a new builder and switch to it using a single command.
docker buildx build --platform linux/amd64,linux/arm64 -t nzambello/translaite:latest --push .
```

## License

[Nicola Zambello](https://github.com/nzambello) © 2023

[GNU GPLv3](https://github.com/nzambello/translaite/raw/main/LICENSE)
