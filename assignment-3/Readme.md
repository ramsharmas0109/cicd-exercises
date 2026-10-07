# CI/CD Hands-on Practice #3

Now, for the following application, follow these steps.

1. Clone this repository.
2. Figure out how to test and build the application locally.
3. Create a GitHub Actions workflow for the application.
4. Split the pipeline into multiple jobs.
5. Configure dependencies between the jobs.
6. Build the application in a separate job.
7. Preserve the generated binary as a workflow artifact.
8. Download the artifact in another job.
9. Verify that the artifact exists.
10. Break the pipeline deliberately and debug the failure.

## Exercise 1: Jobs & Artifacts

App: [go-app/](go-app/Readme.md)

### Task

Create a GitHub Actions workflow that separates validation, build, and artifact verification into different jobs.

Your pipeline should:

- run when a Pull Request targets `main`
- run only when files related to this assignment are changed
- use separate jobs for validation, build, and artifact verification
- make the build job wait for validation to succeed
- make the artifact verification job wait for the build to succeed
- build the Go application
- preserve the compiled binary as an artifact
- download the artifact in another job
- verify that the downloaded artifact exists

### Expected Flow

```text
Pull Request → main
        ↓
   Validate Job
        ↓
     Build Job
        ↓
Upload Artifact
        ↓
 Verify Job
        ↓
Download Artifact
        ↓
Verify Binary
```

### Job 1: Validate

The validation job should:

- checkout the repository
- setup Go
- check formatting
- run static analysis
- run tests

Expected:

```text
Checkout
   ↓
Setup Go
   ↓
Formatting Check
   ↓
Static Analysis
   ↓
Test
```

### Job 2: Build

The build job should:

- run only after validation succeeds
- checkout the repository
- setup Go
- build the application
- produce the compiled binary
- upload the binary as an artifact

The build output should be:

```text
bin/app
```

### Job 3: Verify Artifact

The verification job should:

- run only after the build job succeeds
- download the artifact created by the build job
- verify that the binary exists

You can verify the downloaded file using commands such as:

```bash
ls -lh
```

or:

```bash
file <path-to-binary>
```

### Think about

- What is the difference between a job and a step?
- Why would we split work into separate jobs?
- How can one job depend on another job?
- What happens to the build job if validation fails?
- Does each job run on the same runner?
- If Job 1 creates a file, will Job 2 automatically have that file?
- Why does each job need to checkout the repository separately?
- Why does each job that needs Go have to setup Go separately?
- What is an artifact?
- Why would a pipeline preserve a build output?
- What is the difference between an artifact and source code?

### Verify

Create a feature branch:

```bash
git checkout -b assignment-3-ci
```

Commit and push your workflow:

```bash
git add .
git commit -m "add assignment 3 pipeline"
git push -u origin assignment-3-ci
```

Create a Pull Request targeting `main`.

Open the **Actions** tab.

You should see multiple jobs in the workflow.

### Expected

For a successful run:

```text
Validate Job            ✅
    ↓
Build Job               ✅
    ↓
Upload Artifact         ✅
    ↓
Verify Artifact Job     ✅
    ↓
Download Artifact       ✅
    ↓
Verify Binary           ✅
```

After the workflow completes, you should also be able to find the uploaded artifact in the workflow run.

## Break It #1: Validation Failure

Deliberately make one of the tests fail.

Push the change.

Figure out:

- which job fails
- whether the build job starts
- whether the artifact is created
- whether the verification job starts

### Expected

```text
Validate Job            ❌
Build Job               ⏭️
Verify Artifact Job     ⏭️
```

Fix the test before continuing.

## Break It #2: Job Isolation

Temporarily create a file inside the validation job.

For example:

```bash
echo "hello" > test-file.txt
```

Try to access:

```text
test-file.txt
```

directly from the build job without uploading it as an artifact.

Observe what happens.

Figure out:

- whether the file exists
- why it does not automatically appear in the next job
- where each job is actually running

Remove this experiment once you understand the behaviour.

## Break It #3: Artifact Path

Configure the artifact upload step with an incorrect path.

Run the workflow.

Figure out:

- which step fails
- whether the expected binary exists
- whether the problem is with the Go build or the artifact configuration

Fix the path and run the workflow again.

### Expected Final Flow

```text
PR
 ↓
Validate
 ↓
Build
 ↓
bin/app
 ↓
Upload Artifact
 ↓
New Job / New Runner
 ↓
Download Artifact
 ↓
Verify
```

### Definition of Done

You have completed this assignment when:

- validation and build run as separate jobs
- job dependencies work correctly
- failed validation prevents the build job from running
- the Go binary is successfully built
- the binary is uploaded as an artifact
- another job downloads the artifact
- the downloaded artifact can be verified
- you understand that jobs do not automatically share files
- you can explain why artifacts are needed