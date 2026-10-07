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

## Run Tests

```bash
go test ./...
```

## Build

```bash
go build -o bin/app .
```

Run the compiled application:

```bash
./bin/app
```

Verify:

```bash
curl localhost:8080
```

### Expected

```text
Hello from CI/CD!
```