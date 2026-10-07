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
Hello from Go!
```

## Run Tests

```bash
go test ./...
```

## Build

```bash
go build -o bin/app .
```

Run:

```bash
./bin/app
```
