# CI/CD Hands-on Practice #1

Now, for the following application, follow these steps.

1. Clone this repository.
2. Run the application locally.
3. Run the tests locally.
4. Build the application locally.
5. Create a GitHub Actions workflow for the application.
6. Configure the workflow to run whenever code is pushed.
7. Verify that the pipeline works.
8. Break the pipeline deliberately and debug the failure.

## Exercise 1: Go CI Pipeline

App: [go-app/](go-app/Readme.md)

### Task

Create a GitHub Actions workflow for the application.

Your pipeline should:

- run whenever code is pushed
- use a Linux (Ubuntu) runner
- checkout the repository
- setup Go
- run the application tests
- build the application
- stop if the tests fail

### Think about

- Where should the GitHub Actions workflow file be created?
- What should trigger the workflow?
- Which runner should be used?
- Why does the repository need to be checked out?
- How will Go be made available on the runner?
- Where does `go test` execute?
- How will the workflow run commands for the application inside `assignment-1/go-app`?
- What happens to the build step if the tests fail?
- What is the difference between `run` and `uses`?

### Expected Flow

```text
Push
  ↓
Checkout
  ↓
Setup Go
  ↓
Test
  ↓
Build