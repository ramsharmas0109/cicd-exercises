# CI/CD Hands-on Practice #2

Now, for the following application, follow these steps.

1. Clone this repository.
2. Create a new feature branch.
3. Make a change to the application.
4. Push the feature branch to GitHub.
5. Create a Pull Request targeting `main`.
6. Create a GitHub Actions workflow for the application.
7. Add formatting, static analysis, testing, and build checks.
8. Verify that the checks run automatically on the Pull Request.
9. Break one of the quality gates deliberately and debug the failure.

## Exercise 1: Pull Request CI & Quality Gates

App: [go-app/](go-app/Readme.md)

### Task

Create a GitHub Actions workflow that validates changes before they are merged into `main`.

Your pipeline should:

- run when a Pull Request targets `main`
- run only when files related to this assignment are changed
- use a Linux runner
- checkout the repository
- setup Go
- check the Go code formatting
- run static analysis
- run the application tests
- build the application
- stop when any quality check fails

### Think about

- What is the difference between `push` and `pull_request`?
- How can the workflow run only for Pull Requests targeting `main`?
- How can you prevent this workflow from running when only another assignment changes?
- Why should formatting and static analysis run before tests?
- What should happen if `go vet` fails?
- What should happen if the tests fail?
- Should the build run if an earlier quality gate fails?
- Does `gofmt -l .` fail automatically when it finds an unformatted file?
- How can the pipeline treat unformatted code as a failure?

### Expected Flow

```text
Feature Branch
      ↓
Pull Request → main
      ↓
Checkout
      ↓
Setup Go
      ↓
Formatting Check
      ↓
Static Analysis
      ↓
Test
      ↓
Build
```

### Verify

Create a feature branch:

```bash
git checkout -b assignment-2-ci
```

Make a small change.

Commit and push the branch:

```bash
git add .
git commit -m "test assignment 2 CI"
git push -u origin assignment-2-ci
```

Create a Pull Request targeting `main`.

Open the **Actions** tab and verify that the workflow runs successfully.

### Expected

For a successful run:

```text
Checkout             ✅
Setup Go             ✅
Formatting Check     ✅
Static Analysis      ✅
Test                 ✅
Build                ✅
```

### Break It #1: Formatting

Deliberately make one of the Go files badly formatted.

Do not run `gofmt` locally before committing it.

Push the change.

Figure out:

- whether the formatting check detects the problem
- which step fails
- whether tests execute
- whether the build executes

Fix the formatting and push again.

### Break It #2: Test Failure

Deliberately change one of the expected values in `main_test.go`.

Push the change.

Figure out:

- which step fails
- what error appears in the logs
- whether the build executes

Fix the test and push again.

### Verify Trigger Behaviour

Make a change somewhere outside:

```text
assignment-2/
```

Check whether the Assignment 2 workflow runs.

It should not run if your path filtering is configured correctly.

### Expected Failure Flow

If formatting fails:

```text
Checkout             ✅
Setup Go             ✅
Formatting Check     ❌
Static Analysis      ⏭️
Test                 ⏭️
Build                ⏭️
```

If tests fail:

```text
Checkout             ✅
Setup Go             ✅
Formatting Check     ✅
Static Analysis      ✅
Test                 ❌
Build                ⏭️
```

### Definition of Done

You have completed this assignment when:

- the workflow runs when a Pull Request targets `main`
- the workflow runs only when files related to Assignment 2 are changed
- the workflow checks out the repository and sets up Go
- the formatting check runs successfully
- static analysis runs successfully
- the application tests run successfully
- the application builds successfully
- a formatting failure prevents later steps from running
- a static analysis failure prevents later steps from running
- a test failure prevents the build step from running
- changes outside `assignment-2/` do not trigger the workflow
- you have deliberately broken and repaired at least one quality gate
- you can identify the actual failure from the workflow logs
- you understand the difference between `push` and `pull_request`
- you can explain why quality gates should run before code is merged