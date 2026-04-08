package main

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"
)

type User struct {
	Email        string `json:"email"`
	PasswordHash string `json:"-"`
}

var (
	usersMu sync.RWMutex
	users   = make(map[string]User)

	sessionsMu sync.RWMutex
	sessions   = make(map[string]string)
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/register", registerHandler)
	mux.HandleFunc("/login", loginHandler)
	mux.HandleFunc("/main", mainHandler)

	addr := ":8080"
	log.Printf("server started on %s", addr)
	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatalf("server stopped: %v", err)
	}
}

func mainHandler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method not allowed"})
		return
	}

	email, ok := authEmail(r)
	if !ok {
		writeJSON(w, http.StatusUnauthorized, map[string]string{"error": "unauthorized"})
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": fmt.Sprintf("환영합니다, %s 님", email),
	})
}

func hashPassword(password string) string {
	sum := sha256.Sum256([]byte(password))
	return hex.EncodeToString(sum[:])
}

func issueToken(email string) (string, error) {
	var b [32]byte
	if _, err := rand.Read(b[:]); err != nil {
		return "", err
	}

	token := base64.RawURLEncoding.EncodeToString(b[:])
	sessionsMu.Lock()
	sessions[token] = email
	sessionsMu.Unlock()
	return token, nil
}

func authEmail(r *http.Request) (string, bool) {
	auth := r.Header.Get("Authorization")
	if !strings.HasPrefix(auth, "Bearer ") {
		return "", false
	}
	token := strings.TrimPrefix(auth, "Bearer ")
	if token == "" {
		return "", false
	}

	sessionsMu.RLock()
	email, ok := sessions[token]
	sessionsMu.RUnlock()
	return email, ok
}

func writeJSON(w http.ResponseWriter, status int, payload any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(payload)
}
