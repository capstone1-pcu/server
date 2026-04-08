package main

import (
	"encoding/json"
	"net/http"
	"strings"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

func loginHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	var req LoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "invalid request body"})
		return
	}

	req.Email = strings.TrimSpace(strings.ToLower(req.Email))
	if req.Email == "" || req.Password == "" {
		writeJSON(w, http.StatusBadRequest, map[string]string{"error": "email and password are required"})
		return
	}

	usersMu.RLock()
	user, ok := users[req.Email]
	usersMu.RUnlock()
	if !ok || user.PasswordHash != hashPassword(req.Password) {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "invalid email or password"})
		return
	}

	token, err := issueToken(user.Email)
	if err != nil {
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "failed to create session"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "로그인 성공",
		"token":   token,
	})
}
