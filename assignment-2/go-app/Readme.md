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

## Check Formatting

```bash
gofmt -l .
```

If the code is formatted correctly, this command should not print any filenames.

## Run Static Analysis

```bash
go vet ./...
```

## Build

```bash
go build -o bin/app .
```

Run the compiled application:

```bash
./bin/app
```