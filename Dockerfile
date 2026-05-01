FROM node:20-alpine AS frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm i
COPY frontend/ ./
RUN npm run build

FROM alpine:3.14 AS prompts
WORKDIR /app
RUN apk add --no-cache git
RUN git clone https://github.com/peter-fh/Sam-Prompts.git repo
RUN cp -r repo/prompts ./prompts

FROM python:3.12-slim
WORKDIR /app

# Install PostgreSQL server and dependencies
RUN apt-get update && apt-get install -y \
    postgresql \
    postgresql-contrib \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Create postgres user directory
RUN mkdir -p /var/run/postgresql && chmod 777 /var/run/postgresql

COPY --from=frontend /app/frontend/dist ./static
COPY --from=prompts /app/prompts ./prompts
COPY --chown=postgres:postgres . .
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh \
    && mkdir -p /app/postgres_data \
    && chown -R postgres:postgres /app /entrypoint.sh
RUN pip install --no-cache-dir -r requirements.txt

EXPOSE 5000
USER postgres
CMD ["/entrypoint.sh"]
