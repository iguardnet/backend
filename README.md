# OptiNetFlow
A nest boilerplate: Prisma + Postgres + Graphql


# Scripts
Start => docker compose -f docker-compose.dev.yml up
Start => pnpm start:dev
Create migration => pnpm migrate:dev:create
Prisma generate types => 




# Project Environment Variables

This project requires several environment variables to be set for proper operation. Below is a list of all the environment variables used in this project:

### Secret Variables

1. `CONTAINER_NAME`: Name of the Docker container.
2. `DB_PORT`: Port number for the database.
3. `DOCKERHUB_TOKEN`: Token for DockerHub authentication.
4. `DOCKERHUB_USERNAME`: Username for DockerHub.
5. `ENV_FILE`: Content of the environment file.
6. `ID_RSA`: RSA private key for SSH.
7. `NETWORK_NAME`: Name of the network.
8. `PORT`: Application port number.
9. `POSTGRES_DB`: Name of the PostgreSQL database.
10. `POSTGRES_PASSWORD`: Password for the PostgreSQL database.
11. `POSTGRES_USER`: Username for the PostgreSQL database.
12. `PRIVATE_KEY`: Private key for authentication.
13. `SERVER_IP`: IP address of the server.
14. `SERVER_PORT`: Port number for the server.
15. `SERVER_USERNAME`: Username for the server.

### Environment Variables

1. `DOCKERHUB_TOKEN`: Token for DockerHub authentication.
2. `DOCKERHUB_USERNAME`: Username for DockerHub.
3. `ENV_FILE`: Content of the environment file.

Ensure that these variables are set in your environment or in the appropriate configuration files before running the project.
