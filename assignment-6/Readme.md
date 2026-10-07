# CI/CD Hands-on Practice #6

Now, for each of the following applications, follow these steps.

1. Clone this repository.
2. Figure out how each application runs locally.
3. Figure out how dependencies are installed for each application.
4. Run the tests for each application locally.
5. Figure out how each application is built or validated.
6. Create a GitHub Actions workflow.
7. Create a separate CI job for each application.
8. Configure the correct runtime for each job.
9. Run all application CI jobs when a Pull Request targets `main`.
10. Break one application deliberately and observe how the pipeline behaves.

## Exercise 1: Multi-Language CI

Applications:

- [Go](go-app/Readme.md)
- [Python](python-app/Readme.md)
- [Node.js](node-app/Readme.md)
- [Java](java-app/Readme.md)

### Task

Create a GitHub Actions workflow that runs CI for all four applications.

Create separate jobs for:

- Go
- Python
- Node.js
- Java

Your workflow should:

- run when a Pull Request targets `main`
- run only when files related to this assignment are changed
- use Linux runners
- checkout the repository in each job
- setup the correct runtime for each application
- install dependencies where required
- run tests
- build or validate the application
- allow independent jobs to run without unnecessary dependencies

### Expected Flow

```text
Pull Request → main
        │
        ├── Go CI
        ├── Python CI
        ├── Node.js CI
        └── Java CI
```

Because the applications are independent, their CI jobs should also be independent.

### Go Job

The Go job should:

- setup Go
- run tests
- build the application

Expected commands:

```bash
go test ./...
go build -o bin/app .
```

### Python Job

The Python job should:

- setup Python
- install dependencies
- run tests
- validate the Python files

Expected commands:

```bash
pip install -r requirements.txt
pytest
python -m compileall .
```

### Node.js Job

The Node.js job should:

- setup Node.js
- install dependencies
- run validation
- run tests

Expected commands:

```bash
npm ci
npm run check
npm test
```

### Java Job

The Java job should:

- setup Java
- run tests
- build the application

Expected commands:

```bash
mvn test
mvn package
```

### Think about

- What parts of the CI process are the same across all four applications?
- What changes between Go, Python, Node.js, and Java?
- Why does each job need to setup its own runtime?
- Why does each job need to checkout the repository?
- Should these jobs depend on each other?
- Can these jobs run in parallel?
- What happens if the Python job fails but the Go job passes?
- Does Python have the same type of build step as Go or Java?
- What does `npm ci` do?
- Why does Java produce a JAR while Go produces a binary?
- What does the CI pipeline actually care about: the programming language or whether the required checks succeed?
- How should the working directory be configured for each application?

### Verify

Create a feature branch:

```bash
git checkout -b assignment-6-ci
```

Create the workflow.

Commit and push:

```bash
git add .
git commit -m "add assignment 6 multi-language CI"
git push -u origin assignment-6-ci
```

Create a Pull Request targeting `main`.

Open the **Actions** tab.

You should see separate jobs for:

```text
Go
Python
Node.js
Java
```

### Expected

For a successful run:

```text
Go CI          ✅
Python CI      ✅
Node.js CI     ✅
Java CI        ✅
```

Each job should independently follow the application's needs:

```text
Checkout
   ↓
Setup Runtime
   ↓
Install Dependencies
   ↓
Validate / Test
   ↓
Build
```

Not every application needs every exact step.

### Break It #1: Fail One Application

Deliberately make the Python test fail.

For example, change:

```python
assert response.data.decode() == "Hello from Python!"
```

to an incorrect expected value.

Push the change.

Observe all four jobs.

Figure out:

- which job fails
- whether the Go job still runs
- whether the Node.js job still runs
- whether the Java job still runs
- why the other jobs are unaffected

### Expected

```text
Go CI          ✅
Python CI      ❌
Node.js CI     ✅
Java CI        ✅
```

The complete workflow should still be considered failed because one required job failed.

Fix the Python test before continuing.

### Break It #2: Wrong Working Directory

Run one application's commands from the wrong directory.

For example, try running:

```bash
go test ./...
```

from the repository root instead of the Go application directory.

Observe the failure.

Figure out:

- what file or module the tool is looking for
- why the command works locally inside the application directory
- why it fails from the repository root
- how GitHub Actions can execute commands inside the correct directory

Fix the working directory.

### Break It #3: Dependency Failure

Deliberately break one dependency configuration.

For example:

- modify `requirements.txt`
- modify `package.json`
- modify `pom.xml`

Run CI again.

Figure out:

- whether the failure occurs during setup, dependency installation, testing, or build
- what the first meaningful error in the logs says
- whether the problem is with GitHub Actions or the application dependency configuration

Fix the problem.

### Expected Final Flow

```text
                    Source Repository
                           ↓
                    Pull Request
                           ↓
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
      Go CI             Python CI          Node CI
        │                  │                  │
        ▼                  ▼                  ▼
    Test + Build      Test + Validate     Test + Validate
                           │
                           ▼
                        Java CI
                           │
                           ▼
                     Test + Package
```

Different technologies.

Same fundamental CI idea:

```text
Get Code
   ↓
Prepare Environment
   ↓
Install Dependencies
   ↓
Validate
   ↓
Test
   ↓
Build
```

### Definition of Done

You have completed this assignment when:

- the workflow runs when a Pull Request targets `main`
- the workflow runs only for changes related to Assignment 6
- Go, Python, Node.js, and Java have separate CI jobs
- every job checks out the repository
- every job sets up the correct runtime
- dependencies are installed where required
- Go tests and builds successfully
- Python tests and validates successfully
- Node.js tests and validates successfully
- Java tests and packages successfully
- independent jobs can run without unnecessary dependencies
- failure in one application does not prevent unrelated jobs from running
- one failed required job causes the overall workflow to fail
- you have deliberately broken and repaired at least one application pipeline
- you can identify whether a failure happened during setup, dependency installation, testing, or build
- you understand how working directories affect commands in a repository containing multiple applications
- you can explain which CI concepts remain the same across different programming languages
