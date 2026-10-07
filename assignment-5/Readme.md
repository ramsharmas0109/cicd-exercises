# CI/CD Hands-on Practice #5

Now, for the following application, follow these steps.

1. Clone this repository.
2. Figure out how to test and build the application locally.
3. Build the provided Dockerfile locally.
4. Create a GitHub Actions workflow for the application.
5. Run validation and tests before building the Docker image.
6. Build and tag the Docker image using the Git commit.
7. Authenticate to GitHub Container Registry (GHCR).
8. Push the Docker image to GHCR only from the `main` branch.
9. Pull the published image on your local machine.
10. Run the pulled image and verify that it works.
11. Break the publishing process deliberately and debug the failure.

## Exercise 1: Publish Docker Images to GHCR

App: [go-app/](go-app/Readme.md)

### Task

Create a GitHub Actions workflow that builds and publishes the application's Docker image to GitHub Container Registry.

Your pipeline should:

- run CI checks before publishing anything
- build the Docker image
- tag the image using the Git commit SHA
- authenticate to `ghcr.io`
- publish the image only from the `main` branch
- use GitHub Actions credentials securely
- give the workflow only the permissions it requires
- make the published image traceable back to its source commit

### Expected Flow

```text
Code Change
    ↓
Validate
    ↓
Test
    ↓
Docker Build
    ↓
Tag Image
    ↓
Authenticate to GHCR
    ↓
Push Image
    ↓
GHCR
```

### Pull Request Behaviour

For a Pull Request:

```text
Pull Request → main
       ↓
Validate
       ↓
Test
       ↓
Docker Build
       ↓
STOP
```

The image should not be published to the registry.

### Main Branch Behaviour

After the change reaches `main`:

```text
Push / Merge → main
        ↓
     Validate
        ↓
       Test
        ↓
   Docker Build
        ↓
     Tag Image
        ↓
   Login to GHCR
        ↓
     Push Image
        ↓
       GHCR
```

### Image Name

The image should be stored in GitHub Container Registry.

Conceptually:

```text
ghcr.io/<owner>/<image>:<commit-sha>
```

For example:

```text
ghcr.io/example/cicd-go-app:a91f3c2
```

Do not rely only on:

```text
latest
```

The image should have a tag that allows you to identify the source commit that produced it.

### Think about

- Why do we need a container registry?
- What happens to a Docker image when the GitHub Actions runner disappears?
- Why should feature branches or Pull Requests not publish images by default?
- Why should publishing happen only after CI checks succeed?
- How does GHCR know that the workflow is allowed to push an image?
- What is `GITHUB_TOKEN`?
- What permission does the workflow need to publish packages?
- Why should the workflow request only the permissions it needs?
- Why should credentials never be printed in pipeline logs?
- Why is a commit SHA useful as an image tag?
- How can you identify which source code produced a published image?
- What is the difference between building an image and publishing an image?

## Permissions

The workflow will need permission to read repository contents and publish packages.

Figure out how GitHub Actions workflow permissions work.

The important idea is:

```text
Workflow
   ↓
Authentication
   ↓
Authorization
   ↓
GHCR
```

Authentication answers:

```text
Who are you?
```

Authorization answers:

```text
What are you allowed to do?
```

Do not hardcode credentials inside the workflow.

## Verify

Create a feature branch:

```bash
git checkout -b assignment-5-ci
```

Create the workflow and push the branch:

```bash
git add .
git commit -m "add assignment 5 pipeline"
git push -u origin assignment-5-ci
```

Create a Pull Request targeting `main`.

Verify that CI runs but the image is not published.

After the Pull Request is ready, merge it into `main`.

Open the **Actions** tab and verify that the publishing workflow succeeds.

### Expected

```text
Validate                ✅
Test                    ✅
Docker Build            ✅
Login to GHCR           ✅
Push Image              ✅
```

Open the package in GitHub and identify the published image tag.

The tag should be traceable to the commit that produced it.

## Pull the Published Image

After the image has been published, pull it from GHCR on your local machine.

Conceptually:

```bash
docker pull ghcr.io/<owner>/<image>:<tag>
```

Run the pulled image:

```bash
docker run --rm -p 8080:8080 ghcr.io/<owner>/<image>:<tag>
```

Verify:

```bash
curl localhost:8080
```

### Expected

```text
Hello from CI/CD!
```

## Break It #1: Registry Authentication

Deliberately misconfigure the registry authentication.

Run the workflow.

Figure out:

- which step fails
- whether the image was built successfully
- whether the failure happened during build or publish
- what authentication error appears in the logs

Fix the authentication configuration.

Do not print credentials while debugging.

## Break It #2: Permissions

Remove or change the permission required to publish packages.

Run the workflow.

Figure out:

- whether login succeeds
- whether pushing succeeds
- what permission is missing
- why the workflow is not allowed to publish

Fix the workflow permissions.

## Break It #3: Image Name or Tag

Configure an incorrect image name or tag.

Run the workflow.

Figure out:

- what image the workflow attempted to push
- what registry path was used
- what tag was produced
- whether the image can still be traced back to the Git commit

Fix the image naming strategy.

## Traceability Exercise

Find one image inside GHCR.

Start with its tag:

```text
a91f3c2
```

Then identify:

```text
Docker Image
     ↓
Image Tag
     ↓
Git Commit
     ↓
Source Code
```

You should be able to answer:

> Which exact source code produced this image?

## Expected Final Flow

```text
Source Code
     ↓
Validation
     ↓
Tests
     ↓
Docker Build
     ↓
Image
     ↓
Commit SHA Tag
     ↓
GHCR
     ↓
docker pull
     ↓
Another Machine
```

### Definition of Done

You have completed this assignment when:

- CI checks run before publishing
- the Docker image builds successfully
- the image is tagged using the Git commit
- Pull Requests do not publish the image
- `main` publishes the image to GHCR
- authentication is handled securely
- the workflow has the required package permissions
- no credentials are printed in logs
- you can find the published image in GHCR
- you can pull the image on another machine
- you can run the pulled image successfully
- you can trace the image back to its source commit
- you have debugged an authentication or permission failure