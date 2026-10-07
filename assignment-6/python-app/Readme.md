# Python Flask API

A simple Python Flask application that runs on port `8000`.

## Install Dependencies

```bash
pip install -r requirements.txt
```

## Run Locally

```bash
python app.py
```

Verify:

```bash
curl localhost:8000
```

### Expected

```text
Hello from Python!
```

## Run Tests

```bash
pytest
```

## Validate

Check that the Python files can be compiled:

```bash
python -m compileall .
```
