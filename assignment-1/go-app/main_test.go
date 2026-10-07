package main

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestHelloHandler(t *testing.T) {
	request := httptest.NewRequest(http.MethodGet, "/", nil)
	response := httptest.NewRecorder()

	helloHandler(response, request)

	expected := "Hello from CI/CD!"
	actual := strings.TrimSpace(response.Body.String())

	if actual != expected {
		t.Errorf("expected %q, got %q", expected, actual)
	}
}