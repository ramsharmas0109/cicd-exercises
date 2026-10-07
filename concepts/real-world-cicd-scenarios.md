# Real-World CI/CD Scenarios

This document is meant to be discussed **after completing the CI/CD assignments**.

The assignments teach the mechanics of CI/CD. Real-world systems add another layer: trade-offs, failure handling, security, deployment strategy, and operational decisions.

The goal here is not to memorize one "correct" architecture. The goal is to understand:

- what problem a CI/CD design is solving
- why a particular approach is chosen
- what trade-offs it introduces
- what alternatives exist
- when a different approach may be better

---

## 1. Deploying to a Real Target

So far, a pipeline may build and test an application successfully, but a real deployment needs somewhere persistent to run.

Common deployment targets include:

- Virtual Machine (VM)
- Kubernetes
- Managed container platform
- Serverless platform

### Approach: VM + Docker Compose

A simple production-style setup could look like:

```text
GitHub Actions
      ↓
Build Image
      ↓
Push GHCR
      ↓
SSH to VM
      ↓
docker compose pull
      ↓
docker compose up -d
      ↓
Health Check
```

### Pros

- easy to understand
- close to how Docker is already used locally
- low operational complexity
- cheap for small applications
- useful for learning real deployments

### Cons

- scaling is mostly manual
- VM becomes an important failure point
- configuration needs to be maintained on the server
- rollback and deployment coordination need to be designed
- less suitable for large distributed systems

### Alternatives

#### Kubernetes

```text
GitHub Actions
      ↓
Push Image
      ↓
kubectl / Helm
      ↓
Kubernetes
```

Better when:

- many services exist
- automatic scheduling and scaling are needed
- teams already operate Kubernetes

Trade-off:

- much higher complexity

#### Managed Container Platforms

Examples:

- AWS ECS
- Google Cloud Run
- Azure Container Apps

Better when:

- you want container deployment without managing Kubernetes yourself

---

## 2. Build Once, Deploy Many

A common mistake is rebuilding the application separately for each environment.

### Weak Approach

```text
Dev
 ↓
Build Image A

Staging
 ↓
Build Image B

Production
 ↓
Build Image C
```

Even if the source code is the same, these are technically different artifacts.

### Better Approach

```text
Commit
  ↓
CI
  ↓
Build Image
  ↓
Image: abc123
  ↓
Registry
  │
  ├── Dev
  ├── Staging
  └── Production
```

### Pros

- production runs exactly what staging tested
- easier rollback
- easier debugging
- strong traceability
- fewer differences between environments

### Cons

- environment-specific configuration must be externalized
- requires disciplined image tagging
- requires a proper registry

### Alternatives

Rebuilding per environment can sometimes be acceptable when the artifact itself genuinely needs to differ.

Example:

```text
Different platform architecture
Different compiled feature flags
Different customer-specific builds
```

But for most backend services:

> Build once and promote the same artifact.

---

## 3. Environment-Specific Configuration

Applications usually need different configuration in different environments.

Example:

```text
Development DB
Staging DB
Production DB
```

The Docker image should generally remain the same.

Configuration changes.

### Approach

```text
Same Image
   │
   ├── Dev Environment Variables
   ├── Staging Environment Variables
   └── Production Environment Variables
```

Examples:

```text
DATABASE_URL
API_URL
LOG_LEVEL
APP_ENV
```

### Pros

- same artifact everywhere
- configuration stays separate from code
- easier promotion across environments

### Cons

- configuration can become difficult to manage
- missing variables can cause runtime failures
- environment drift can still occur

### Alternatives

Configuration can come from:

- environment variables
- config files
- secret managers
- Kubernetes ConfigMaps
- cloud parameter stores

Choose based on complexity and security requirements.

---

## 4. Secrets Management

Never store secrets directly inside:

```text
Dockerfile
Git repository
GitHub Actions YAML
Application source code
```

Bad:

```yaml
env:
  DATABASE_PASSWORD: password123
```

### Approach: GitHub Secrets / Environment Secrets

```text
GitHub Secret
     ↓
Workflow
     ↓
Deployment
     ↓
Application
```

### Pros

- simple
- integrated with GitHub Actions
- values are masked in logs
- environment-specific secrets are possible

### Cons

- secret rotation still needs to be managed
- not ideal for very large environments
- applications may eventually require a dedicated secret-management system

### Alternatives

Examples:

- AWS Secrets Manager
- AWS Systems Manager Parameter Store
- HashiCorp Vault
- Google Secret Manager
- Azure Key Vault
- Kubernetes Secrets

These become more useful when many applications or environments share secrets.

---

## 5. Cloud Authentication

A CI/CD pipeline often needs access to AWS, GCP, Azure, or another platform.

### Simple Approach: Long-Lived Credentials

Example:

```text
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```

stored as GitHub Secrets.

### Pros

- easy to understand
- easy to configure

### Cons

- credentials can live for months or years
- credential leakage is dangerous
- rotation becomes operational work
- permissions are often broader than necessary

### Better Approach: OIDC

```text
GitHub Actions
      ↓
Temporary Identity
      ↓
Cloud Provider
      ↓
Short-lived Credentials
```

### Pros

- no permanent cloud credential stored in GitHub
- temporary credentials
- better security
- easier rotation

### Cons

- more complicated initial setup
- requires understanding IAM and trust relationships

For learning:

```text
Secrets first
OIDC later
```

For mature production systems, OIDC is usually preferable.

---

## 6. Dependency and Build Caching

CI pipelines repeatedly download the same dependencies.

Example:

```text
npm install
go mod download
mvn package
```

This wastes time.

### Approach: Cache Dependencies

```text
First Run
   ↓
Download Dependencies
   ↓
Save Cache

Next Run
   ↓
Restore Cache
   ↓
Build Faster
```

### Pros

- faster pipelines
- reduced external downloads
- lower CI usage

### Cons

- stale caches can create confusing failures
- incorrect cache keys can reuse incompatible files
- caching can make debugging harder

### Alternatives

Do nothing initially.

A pipeline that takes:

```text
2 minutes
```

usually does not need complex caching.

Optimize when there is evidence that build time is actually a problem.

---

## 7. Parallel Jobs

Suppose a repository contains:

```text
Go API
Frontend
Python Worker
```

These may not need to wait for one another.

### Sequential

```text
Go
 ↓
Python
 ↓
Frontend
```

Total time might be:

```text
3 + 4 + 5 = 12 minutes
```

### Parallel

```text
      ┌── Go
PR ───┼── Python
      └── Frontend
```

Total time becomes roughly the slowest job:

```text
~5 minutes
```

### Pros

- faster feedback
- failures are isolated
- responsibilities are clearer

### Cons

- more CI runner usage
- debugging workflow dependencies becomes harder
- jobs cannot automatically share files

### Alternative

Keep jobs sequential when one genuinely depends on another.

Example:

```text
Test
 ↓
Build
 ↓
Deploy
```

---

## 8. Deployment Concurrency

Imagine two developers merge changes quickly.

```text
Commit A
 ↓
Deployment A

Commit B
 ↓
Deployment B
```

Both deployments may run at the same time.

This can create race conditions.

### Problem

```text
Deployment A starts
Deployment B starts
Deployment B finishes
Deployment A finishes later
```

Production may accidentally end up running the older version.

### Approach: Deployment Concurrency

Allow only one deployment to an environment at a time.

```text
Deployment A
     ↓
Production
     ↓
Complete

Deployment B
     ↓
Production
```

### Pros

- predictable deployments
- avoids overlapping releases
- easier rollback reasoning

### Cons

- deployments may queue
- slow deployment blocks later releases

### Alternative

Some systems intentionally support multiple concurrent versions, but that requires more sophisticated rollout strategies.

---

## 9. Database Migrations

Database changes make deployments much harder.

Example:

Application v2 expects:

```text
users.email_verified
```

but the production database does not have that column.

### Simple Flow

```text
Deploy Application
      ↓
Application Starts
      ↓
Database Query Fails
```

Bad outcome.

### Approach

```text
Build Image
    ↓
Deploy
    ↓
Run Migration
    ↓
Start Application
    ↓
Health Check
```

But migrations themselves can fail.

### Questions to consider

- Should migration happen before or after deployment?
- Can the old version still work after migration?
- Can the migration be reversed?
- What happens if the migration succeeds but deployment fails?

### Safer Pattern

Prefer backward-compatible migrations.

Example:

Instead of:

```text
rename column A → B
```

immediately:

```text
Add B
Write to A and B
Migrate data
Switch application to B
Remove A later
```

### Pros

- safer rollouts
- old and new versions can coexist temporarily

### Cons

- more deployment steps
- schema changes take longer
- temporary duplication exists

---

## 10. Health Checks

A deployment command succeeding does not mean the application works.

Example:

```text
docker run app
```

returns successfully.

But:

```text
/database connection failed
```

inside the application.

### Approach

After deployment:

```text
Deploy
  ↓
Wait
  ↓
GET /health
  ↓
200?
```

### Pros

- verifies actual runtime behaviour
- catches configuration and dependency failures
- enables automated rollback

### Cons

- health endpoint must be meaningful
- poorly designed health checks can give false confidence

### Alternatives

Use multiple checks:

```text
Liveness
Readiness
Smoke Test
Synthetic Test
```

Example:

```text
GET /health
GET /api/users
Check database connectivity
```

---

## 11. Rollback

Suppose production currently runs:

```text
app:abc123
```

A new deployment introduces:

```text
app:def456
```

The new version fails.

### Good Approach

```text
def456
  ↓
Failure
  ↓
Deploy abc123
```

### Bad Approach

```text
Find old code
 ↓
Checkout
 ↓
Rebuild
 ↓
Hope it matches
 ↓
Deploy
```

### Pros of Artifact-Based Rollback

- fast
- predictable
- known artifact
- easy to automate

### Cons

Rollback may not be enough if:

- database migration is incompatible
- external APIs changed
- data was modified
- infrastructure changed

### Alternative

Sometimes the correct response is:

```text
roll forward
```

Fix the issue quickly and deploy a new version.

Rollback is not automatically the correct answer.

---

## 12. Image Tagging Strategy

Using only:

```text
latest
```

is convenient but weak.

You cannot easily answer:

> Which source code is running?

### Better Tags

Commit SHA:

```text
app:a91f3c2
```

Release version:

```text
app:v1.4.2
```

Environment pointer:

```text
app:production
```

### Recommended Combination

```text
app:a91f3c2
app:v1.4.2
```

The immutable tag identifies the actual artifact.

A mutable tag such as:

```text
latest
```

can still exist for convenience.

### Pros of Commit SHA

- strong traceability
- unique
- easy mapping to Git

### Cons

- not human friendly
- does not communicate release meaning

### Pros of Semantic Version

```text
v2.3.1
```

- readable
- useful for releases

### Cons

- requires release/version discipline

---

## 13. Branch Protection and Required Checks

A CI pipeline that runs but can be ignored provides limited protection.

Example:

```text
CI ❌

Developer merges anyway
```

### Approach

Configure `main` so that:

```text
Pull Request
      ↓
Required Checks
      ↓
Review
      ↓
Merge
```

### Pros

- CI actually becomes a gate
- prevents known-broken code from merging
- consistent team process

### Cons

- broken CI can block everyone
- too many required checks slow development
- configuration must be maintained

### Alternative

Use fewer required checks.

Only make a check mandatory when it protects a real risk.

---

## 14. Security Scanning

CI/CD can also enforce security checks.

Examples:

```text
Dependency Scan
Container Image Scan
Secret Scan
Static Analysis
SBOM
```

Possible pipeline:

```text
Test
 ↓
Build
 ↓
Dependency Scan
 ↓
Docker Build
 ↓
Image Scan
 ↓
Publish
```

### Pros

- problems detected earlier
- repeatable security checks
- prevents some vulnerable artifacts from being released

### Cons

- false positives
- slower pipelines
- maintenance overhead
- teams may start ignoring noisy tools

### Alternative

Not every security check needs to block every build.

Possible model:

```text
Critical → Block
High     → Review
Medium   → Report
```

The policy matters more than adding tools blindly.

---

## 15. Reusable Workflows

After creating many pipelines, duplication appears.

Example:

```text
Service A
Checkout
Setup Go
Test
Build

Service B
Checkout
Setup Go
Test
Build

Service C
Checkout
Setup Go
Test
Build
```

### Approach

Create reusable workflow logic.

```text
Service A ──┐
Service B ──┼──> Reusable CI Workflow
Service C ──┘
```

### Pros

- less duplication
- easier standardization
- fixes can apply to multiple repositories

### Cons

- abstraction makes debugging harder
- one change can impact many repositories
- beginners may not understand what actually executes

### Rule

Do not create reusable workflows just because duplication exists twice.

Create them when the repeated pattern is stable and understood.

---

## 16. Pipeline Succeeded, Application Failed

One of the most important real-world lessons:

```text
Green Pipeline ≠ Healthy Production
```

Possible scenario:

```text
Tests          ✅
Docker Build   ✅
Push Image     ✅
Deploy         ✅
Application    ❌
```

Reasons might include:

- missing environment variable
- database unavailable
- incorrect permissions
- networking issue
- incompatible database schema
- dependency unavailable
- application crashes during startup

### Debugging Approach

Separate the problem into layers:

```text
CI
 ↓
Artifact
 ↓
Registry
 ↓
Deployment
 ↓
Runtime
 ↓
Dependency
```

Ask:

1. Did CI produce the correct artifact?
2. Was the correct image deployed?
3. Did the container start?
4. What do application logs show?
5. Is configuration present?
6. Are dependencies reachable?
7. Does the health endpoint succeed?

Do not automatically assume every production issue is a CI/CD issue.

---

# Putting It Together

A realistic pipeline might eventually look like:

```text
Developer
   ↓
Pull Request
   ↓
Formatting / Lint
   ↓
Tests
   ↓
Security Checks
   ↓
Merge
   ↓
Build Image
   ↓
Tag with Commit SHA
   ↓
Push Registry
   ↓
Deploy Staging
   ↓
Run Migration
   ↓
Health Check
   ↓
Approval
   ↓
Deploy Production
   ↓
Health Check
   ↓
Observe
   ↓
Rollback / Roll Forward
```

But more stages do not automatically mean a better pipeline.

Every stage should answer:

> What risk does this step protect us from?

If there is no clear answer, the stage may not belong in the pipeline.

---

# Final Mental Model

CI/CD is not primarily about GitHub Actions, Jenkins, GitLab CI, or YAML.

Those are tools.

The real problem is:

```text
How do we take a code change
        ↓
prove that it is safe
        ↓
produce a known artifact
        ↓
move that artifact through environments
        ↓
verify that it works
        ↓
recover safely when it does not?
```

A good CI/CD engineer should be able to reason about that process even when the tool changes.
