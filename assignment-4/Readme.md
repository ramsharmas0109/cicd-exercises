# CI/CD Hands-on Practice #4

Now, for the following application, follow these steps.

1. Clone this repository.
2. Figure out how to test and build the application locally.
3. Build the provided Dockerfile locally.
4. Create a GitHub Actions workflow for the application.
5. Run validation and tests before building the Docker image.
6. Build the Docker image inside the CI pipeline.
7. Tag the Docker image using the Git commit that triggered the workflow.
8. Verify that the image was created successfully.
9. Break the Docker build deliberately and debug the failure.

## Exercise 1: Docker Build & Image Tagging

App: [go-app/](go-app/Readme.md)

### Task

Create a GitHub Actions workflow that validates the application and builds a Docker image.

Your pipeline should:

- run when a Pull Request targets `main`
- run only when files related to this assignment are changed
- use a Linux runner
- checkout the repository
- setup Go
- run the application tests
- build the Go application
- build the provided Dockerfile
- tag the Docker image using the Git commit SHA
- verify that the image exists after the build
- stop if any previous step fails

### Expected Flow

```text
Pull Request → main
        ↓
     Checkout
        ↓
     Setup Go
        ↓
       Test
        ↓
   Build Application
        ↓
   Docker Build
        ↓
 Tag with Commit SHA
        ↓
   Verify Image
```

### Think about

- Why should tests run before the Docker image is built?
- What is produced by `go build`?
- What is produced by `docker build`?
- Is a Docker image also a build artifact?
- Where does the Docker image exist after the workflow builds it?
- What happens to the image when the GitHub Actions runner is destroyed?
- Why is `latest` alone a poor image tag?
- How can a Git commit SHA make an image traceable?
- If an image is tagged with a commit SHA, how can you find the source code that produced it?
- Should a failed test ever result in a Docker image being built?

## Image Tagging

Do not use only:

```text
cicd-go-app:latest
```

The image should include information that identifies the source commit.

Conceptually:

```text
Git Commit
   ↓
a91f3c2
   ↓
CI Pipeline
   ↓
Docker Image
   ↓
cicd-go-app:a91f3c2
```

Figure out how GitHub Actions exposes the commit SHA that triggered the workflow.

### Verify

Create a feature branch:

```bash
git checkout -b assignment-4-ci
```

Commit and push your workflow:

```bash
git add .
git commit -m "add assignment 4 pipeline"
git push -u origin assignment-4-ci
```

Create a Pull Request targeting `main`.

Open the **Actions** tab and inspect the workflow.

### Expected

For a successful run:

```text
Checkout                ✅
Setup Go                ✅
Test                    ✅
Build Application       ✅
Docker Build            ✅
Verify Image            ✅
```

The Docker image should have a tag that can be traced back to the Git commit that produced it.

## Break It #1: Test Failure

Deliberately make one of the application tests fail.

Push the change.

Figure out:

- which step fails
- whether the application build runs
- whether the Docker image is built
- why a failed test should prevent image creation

### Expected

```text
Test                    ❌
Build Application       ⏭️
Docker Build            ⏭️
```

Fix the test before continuing.

## Break It #2: Docker Build Failure

Deliberately introduce an error into the Dockerfile.

For example, change the final command or one of the paths used by `COPY`.

Push the change.

Figure out:

- which step fails
- whether the tests passed
- whether the application build passed
- what error Docker reports
- whether the failure is related to the application or container image

### Expected

```text
Test                    ✅
Build Application       ✅
Docker Build            ❌
Verify Image            ⏭️
```

Fix the Dockerfile and run the workflow again.

## Break It #3: Image Tag

Configure the workflow with an incorrect or unexpected image tag.

Run the workflow and inspect:

```bash
docker images
```

Figure out:

- which tag was actually created
- how the tag relates to the Git commit
- whether you could identify the source code from that tag

Fix the image tagging strategy.

### Expected Final Flow

```text
Source Code
     ↓
    Test
     ↓
Go Build
     ↓
Dockerfile
     ↓
Docker Build
     ↓
Docker Image
     ↓
Commit-based Tag
```

### Definition of Done

You have completed this assignment when:

- the application tests run successfully in CI
- the application builds successfully
- the Docker image is built only after previous checks succeed
- the Docker image is tagged using the Git commit
- you can find the image on the runner after the build
- a failed test prevents Docker image creation
- a broken Dockerfile causes the correct pipeline step to fail
- you can explain how an image tag maps back to source code
- you understand what happens to the image after the runner is destroyed