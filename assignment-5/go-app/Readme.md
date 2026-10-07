# Go HTTP API

A simple Go HTTP application that runs on port `8080`.

## Run Locally

```bash
go run main.go
```

Verify:

```bash
curl localhost:8080
```

### Expected

```text
Hello from CI/CD!
```

Check the health endpoint:

```bash
curl localhost:8080/health
```

### Expected

```text
OK
```

## Run Tests

```bash
go test ./...
```

## Build

```bash
go build -o bin/app .
```

## Build Docker Image

```bash
docker build -t cicd-go-app:local .
```

Check the image:

```bash
docker images
```

## Run Docker Container

```bash
docker run --rm -p 8080:8080 cicd-go-app:local
```

Verify:

```bash
curl localhost:8080
```

### Expected

```text
Hello from CI/CD!
```