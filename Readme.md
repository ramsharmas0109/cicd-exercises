# ⚙️ CI/CD Hands-on Exercises

A series of hands-on assignments for learning CI/CD with GitHub Actions, from building your first CI pipeline to publishing container images and deploying applications safely.

## 📋 Assignments

1. 🔄 [CI Hands-on Practice #1](assignment-1/Readme.md) — create your first GitHub Actions pipeline for a Go application: checkout code, setup Go, run tests, build the application, deliberately break the pipeline, and debug the failure.

2. ✅ [Pull Requests & Quality Gates Hands-on Practice #2](assignment-2/Readme.md) — run CI on pull requests, add formatting and validation checks, and understand how failed checks prevent later pipeline steps from running.

3. 📦 [Jobs & Artifacts Hands-on Practice #3](assignment-3/Readme.md) — split CI work into multiple jobs, define job dependencies, and pass build outputs between runners using artifacts.

4. 🐳 [Docker Build & Image Tagging Hands-on Practice #4](assignment-4/Readme.md) — connect Docker with CI, build container images automatically, and tag images using Git commit information for traceability.

5. 📤 [Container Registry Hands-on Practice #5](assignment-5/Readme.md) — authenticate with GitHub Container Registry (GHCR), publish Docker images from CI, and understand when images should and should not be published.

6. 🧪 [Multi-Language CI Hands-on Practice #6](assignment-6/Readme.md) — build CI pipelines for Go, Python, Node.js, and Java applications and see how the CI process remains similar while runtime and build commands change.

7. 🚀 [Continuous Delivery Hands-on Practice #7](assignment-7/Readme.md) — take a published image through staging and production, add deployment verification and approvals, and design a rollback strategy using known-good artifacts.
