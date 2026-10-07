# Java HTTP API

A simple Java HTTP application that runs on port `8080`.

## Run Tests

```bash
mvn test
```

## Build

```bash
mvn package
```

The build should create:

```text
target/java-ci-app-1.0.0.jar
```

## Run Locally

```bash
java -jar target/java-ci-app-1.0.0.jar
```

Verify:

```bash
curl localhost:8080
```

### Expected

```text
Hello from Java!
```
