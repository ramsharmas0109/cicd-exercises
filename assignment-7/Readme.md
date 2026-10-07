# CI/CD Hands-on Practice #7

Now, for the following application, follow these steps.

1. Clone this repository.
2. Run the application and tests locally.
3. Build and run the provided Docker image locally.
4. Create a pipeline that publishes a traceable Docker image to GHCR.
5. Create a separate deployment workflow.
6. Configure the deployment workflow to accept an image tag as input.
7. Deploy the selected image to a staging environment.
8. Verify the deployment using the application's health endpoint.
9. Promote the same image to a production environment.
10. Add an approval gate before production.
11. Break a deployment deliberately and practise rollback using a previous known-good image.

## Exercise 1: Continuous Delivery, Environments & Rollback

App: [go-app/](go-app/Readme.md)

### Task

Build a Continuous Delivery workflow using GitHub Actions.

The important rule for this assignment is:

> Build once. Promote the same image.

Do not rebuild the application separately for staging and production.

Your delivery process should use an already-published Docker image from GHCR.

The deployment workflow should:

- be separate from the CI/build workflow
- be manually triggered
- accept an image tag as input
- deploy a specific existing image
- use a `staging` GitHub environment
- verify the application after deployment
- promote the same image to a `production` GitHub environment
- require approval before production
- verify the application after production deployment
- provide a clear rollback path using a previous known-good image

### Expected Flow

```text
Code Change
    ↓
CI
    ↓
Test
    ↓
Docker Build
    ↓
Publish Image to GHCR
    ↓
Image: <commit-sha>
    ↓
Manual Deployment
    ↓
Staging
    ↓
Verify
    ↓
Production Approval
    ↓
Production
    ↓
Verify
```

### Important

For this exercise, the GitHub-hosted runner can be used to simulate a deployment target by pulling and running the selected Docker image.

The container running on the GitHub-hosted runner is temporary.

The goal is to practise the CD workflow, environment controls, artifact promotion, verification, and rollback thinking.

A real production system would deploy the image to a persistent target such as a VM, Kubernetes cluster, or managed container platform.

### Part 1: Publish a Deployable Image

Before deployment, make sure CI produces a traceable image in GHCR.

Conceptually:

```text
Git Commit
    ↓
CI
    ↓
Test
    ↓
Docker Build
    ↓
ghcr.io/<owner>/<image>:<commit-sha>
```

The image tag should identify the source commit that produced the image.

### Part 2: Manual Deployment

Create a separate GitHub Actions deployment workflow.

The deployment should not rebuild the source code.

The workflow should accept an input such as:

```text
image_tag
```

Example:

```text
a91f3c2
```

The deployment workflow should use that value to select an existing image from GHCR.

### Think about

- What is the difference between CI and CD?
- Why should deployment be separate from building the image?
- Why should the deployment workflow accept an image tag?
- Why should staging and production use the same image?
- What problem is created if production rebuilds the source code?
- What is a GitHub environment?
- What is the difference between a branch and an environment?
- Why should production have stronger controls than staging?
- What should happen if deployment succeeds but the health check fails?
- How will you know which image is currently being deployed?
- How will you identify the previous known-good image?
- Why is rollback easier when images are immutable and traceable?

### Staging

Create a `staging` environment in GitHub.

The staging deployment should:

- use the image tag supplied to the workflow
- pull that exact image from GHCR
- run the container
- expose the application
- verify the `/health` endpoint

Conceptually:

```text
GHCR
  ↓
Selected Image
  ↓
Staging
  ↓
Run Container
  ↓
Health Check
```

### Verify Staging

After starting the container, verify:

```bash
curl localhost:8080/health
```

### Expected

```text
OK
```

The staging deployment should only be considered successful if the health check succeeds.

### Production

Create a `production` GitHub environment.

Configure the environment so production deployment requires approval.

The production job should:

- wait until staging succeeds
- use the same image tag that was deployed to staging
- require production approval
- pull the same image
- run it
- verify the `/health` endpoint

### Expected Promotion Flow

```text
Image: a91f3c2
      ↓
   Staging
      ↓
   Verify ✅
      ↓
Production Approval
      ↓
 Production
      ↓
   Verify ✅
```

The image should not change between staging and production.

### Verify

Create a feature branch:

```bash
git checkout -b assignment-7-cd
```

Create the required workflow or workflows.

Commit and push:

```bash
git add .
git commit -m "add assignment 7 continuous delivery"
git push -u origin assignment-7-cd
```

Create a Pull Request targeting `main`.

After CI succeeds and the image is published, identify its image tag.

Trigger the deployment workflow manually and provide that image tag.

Verify:

- the selected image is pulled from GHCR
- staging deployment succeeds
- staging health check succeeds
- production waits for approval
- production deploys the same image
- production health check succeeds

### Expected

```text
Publish Image          ✅
Select Image Tag       ✅
Deploy Staging         ✅
Verify Staging         ✅
Production Approval    ⏸️
Deploy Production      ✅
Verify Production      ✅
```

### Break It #1: Invalid Image Tag

Trigger the deployment workflow using an image tag that does not exist.

Figure out:

- which step fails
- whether the failure happens during build or deployment
- why the pipeline should not rebuild the source code automatically
- how the logs show that the requested artifact does not exist

Fix the image tag and deploy again.

### Break It #2: Failed Health Check

Change the health-check command so it checks an incorrect path or port.

Run the deployment.

Figure out:

- whether the container started successfully
- why a successful container start does not prove the application is healthy
- which step marks the deployment as failed
- whether production should continue after staging verification fails

### Expected

```text
Deploy Staging         ✅
Verify Staging         ❌
Production             ⏭️
```

Fix the verification step before continuing.

### Break It #3: Rollback

Assume these images exist:

```text
ghcr.io/<owner>/<image>:a91f3c2
ghcr.io/<owner>/<image>:b28da91
ghcr.io/<owner>/<image>:c18ac22
```

Assume:

```text
b28da91 = previous known-good image
c18ac22 = new image
```

Deploy:

```text
c18ac22
```

Assume its verification fails.

Do not rebuild the old source code.

Trigger the deployment again using:

```text
b28da91
```

Verify that the known-good image passes the health check.

### Expected Rollback Flow

```text
New Image
c18ac22
   ↓
Deploy
   ↓
Verify ❌
   ↓
STOP
   ↓
Previous Known-Good Image
b28da91
   ↓
Deploy
   ↓
Verify ✅
```

### Expected Final Flow

```text
Source Code
    ↓
CI
    ↓
Test
    ↓
Build Image Once
    ↓
Publish to GHCR
    ↓
Traceable Image
    ↓
Staging
    ↓
Verify
    ↓
Approval
    ↓
Production
    ↓
Verify
    ↓
Rollback to Known-Good Image if Required
```

### Definition of Done

You have completed this assignment when:

- CI produces a traceable Docker image
- the image is published to GHCR
- deployment is separate from the build process
- deployment can be triggered manually
- deployment accepts a specific image tag as input
- staging uses an existing published image
- staging includes a health check
- failed staging verification prevents production promotion
- production uses the same image that passed staging
- production is represented by a separate GitHub environment
- production requires an approval gate
- production includes post-deployment verification
- you can identify which Git commit produced the deployed image
- you can identify a previous known-good image
- you can roll back without rebuilding source code
- you have deliberately caused and debugged at least one deployment failure
- you can explain the difference between Continuous Delivery and Continuous Deployment
- you can explain why "build once, promote the same artifact" reduces deployment risk
