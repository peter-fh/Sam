# Testing and quality assurance

# Test Suites
This site has three separate test suites. They can be used to test for regressions with maintenance changes, as well as ensure the quality of any new features that may be added in the future.

## Frontend tests

The frontend test suite ensures that the page that the user interacts with is functioning as expected. It contains mocks for the API endpoints that allow the site to be thoroughly tested without consuming any Openrouter API tokens.

## Backend tests

The backend test suite ensures that the hidden functionality, including database updates, are functioning as expected for each endpoint. They use a local, managed instance of the database that allows the test environment to be managed for thorough testing, as well as mocked versions of each endpoint that avoid communicating with the paid Openrouter API while running as much of the backend code as possible. 

## End to end tests

While the end-to-end tests require setup and can only be run by developers locally, this test suite offers powerful and wide-reaching checks without consuming any tokens from the Openrouter API. It should be run by developers for each maintenance change, and should be updated and run for each new feature.

# Continuous Integration and Continuous Deployment (CI/CD)

## Testing

In order for any code to be committed to the production branch of Sam, both the frontend and backend tests must pass. This ensures that each new commit will be thoroughly tested before reaching production.

## Building and Deploying

Once merged, each new commit will automatically build the docker image for the website. This docker build will only run if the tests pass, meaning deploying new commits requires these tests to be passing on each deployment.
