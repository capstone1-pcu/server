package main

import (
	"encoding/json"
	"net/http"
	"strings"
)

type RegisterRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func registerHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req RegisterRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "email and password are required"})
		return
	}

	usersMu.Lock()
	defer usersMu.Unlock()
	if _, exists := users[req.Email]; exists {
		writeJSON(w, http.StatusConflict, map[string]string{"error": "email already registered"})
		return
	}

	users[req.Email] = User{
		Email:        req.Email,
		PasswordHash: hashPassword(req.Password),
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"message": "회원가입 완료",
	})
}
