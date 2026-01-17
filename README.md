# Concordia Sam

This project is a prototype of a tutoring AI that uses Generative AI. It sends specialized prompts that contain the relevant information about specific courses that a student is taking and asking questions about. It also contains specific instructions in order to respond to each question and type of question in the most helpful ways.

## Why is Sam better than using regular Generative AI sites?

See [docs/prompt.md](docs/prompt.md) for information on Sam's behaviour and how it differs/improves on regular generative AI sites for math tutoring.

## API

Backend is written in Flask. For information about the backend, API, and Auth, see [docs/api.md](docs/api.md)

## Frontend

Frontend is a React-Typescript Single Page Application. For more information, see [docs/frontend.md](docs/frontend.md).

## Deployment

This project is deployed via Render.com to [concordia-sam.onrender.com](https://concordia-sam.onrender.com/). In its current state, the site takes 50 seconds to spin up after it is inactive for some time. If it does not load, wait or try again in 50 seconds. This will be resolved when we can invest in a paid hosting service, whether onrender or something else.


## Contributing

For information about contributing to this project, see [CONTRIBUTING.md](CONTRIBUTING.md).

