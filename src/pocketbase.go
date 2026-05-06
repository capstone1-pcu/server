package main

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"
)

const usersCollection = "users"

var pocketBaseHTTPClient = &http.Client{
	Timeout: 10 * time.Second,
}

type pocketBaseUser struct {
	ID    string `json:"id"`
	Email string `json:"email"`
	Name  string `json:"name"`
}

type pocketBaseAuthResponse struct {
	Token  string         `json:"token"`
	Record pocketBaseUser `json:"record"`
}

type pocketBaseErrorResponse struct {
	Message string                 `json:"message"`
	Data    map[string]interface{} `json:"data"`
}

type statusError struct {
	status  int
	message string
}

func (e statusError) Error() string {
	return e.message
}

func pocketBaseURL() string {
	if url := strings.TrimSpace(os.Getenv("POCKETBASE_URL")); url != "" {
		return strings.TrimRight(url, "/")
	}
	return "http://localhost:8090"
}

func registerPocketBaseUser(ctx context.Context, req RegisterRequest) error {
	payload := map[string]any{
		"email":           req.Email,
		"password":        req.Password,
		"passwordConfirm": req.Password,
		"name":            req.Name,
	}

	resp, err := pocketBaseRequest(ctx, http.MethodPost, pocketBaseRecordsURL(), "", payload)
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 200 && resp.StatusCode < 300 {
		return nil
	}

	return mapPocketBaseError(resp, "회원가입에 실패했습니다.")
}

func loginPocketBaseUser(ctx context.Context, req LoginRequest) (pocketBaseAuthResponse, error) {
	payload := map[string]any{
		"identity": req.Email,
		"password": req.Password,
	}

	resp, err := pocketBaseRequest(ctx, http.MethodPost, pocketBaseAuthWithPasswordURL(), "", payload)
	if err != nil {
		return pocketBaseAuthResponse{}, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return pocketBaseAuthResponse{}, mapPocketBaseError(resp, "로그인에 실패했습니다.")
	}

	var auth pocketBaseAuthResponse
	if err := json.NewDecoder(resp.Body).Decode(&auth); err != nil {
		return pocketBaseAuthResponse{}, errors.New("로그인 응답을 해석하지 못했습니다.")
	}

	if auth.Token == "" || auth.Record.Email == "" {
		return pocketBaseAuthResponse{}, errors.New("PocketBase 로그인 응답이 올바르지 않습니다.")
	}

	return auth, nil
}

func refreshAuth(ctx context.Context, authorization string) (pocketBaseUser, string, error) {
	token := strings.TrimSpace(strings.TrimPrefix(authorization, "Bearer "))
	if token == "" || !strings.HasPrefix(authorization, "Bearer ") {
		return pocketBaseUser{}, "", errors.New("missing auth token")
	}

	resp, err := pocketBaseRequest(ctx, http.MethodPost, pocketBaseAuthRefreshURL(), token, nil)
	if err != nil {
		return pocketBaseUser{}, "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return pocketBaseUser{}, "", mapPocketBaseError(resp, "인증 확인에 실패했습니다.")
	}

	var auth pocketBaseAuthResponse
	if err := json.NewDecoder(resp.Body).Decode(&auth); err != nil {
		return pocketBaseUser{}, "", errors.New("인증 응답을 해석하지 못했습니다.")
	}

	if auth.Record.Email == "" {
		return pocketBaseUser{}, "", errors.New("인증 사용자 정보가 비어 있습니다.")
	}

	return auth.Record, auth.Token, nil
}

func pocketBaseRequest(
	ctx context.Context,
	method string,
	url string,
	authToken string,
	body any,
) (*http.Response, error) {
	var bodyReader io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return nil, err
		}
		bodyReader = bytes.NewReader(data)
	}

	req, err := http.NewRequestWithContext(ctx, method, url, bodyReader)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	if authToken != "" {
		req.Header.Set("Authorization", authToken)
	}

	resp, err := pocketBaseHTTPClient.Do(req)
	if err != nil {
		return nil, statusError{
			status:  http.StatusInternalServerError,
			message: fmt.Sprintf("PocketBase 요청 실패: %v", err),
		}
	}

	return resp, nil
}

func mapPocketBaseError(resp *http.Response, fallback string) error {
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return errors.New(fallback)
	}

	var pbErr pocketBaseErrorResponse
	if err := json.Unmarshal(body, &pbErr); err == nil && pbErr.Message != "" {
		switch resp.StatusCode {
		case http.StatusBadRequest:
			if hasEmailAlreadyExistsError(pbErr.Data) {
				return errors.New("이미 가입된 이메일입니다.")
			}
			return statusError{status: http.StatusBadRequest, message: pbErr.Message}
		case http.StatusUnauthorized:
			return statusError{
				status:  http.StatusUnauthorized,
				message: "이메일 또는 비밀번호가 올바르지 않습니다.",
			}
		case http.StatusConflict:
			return statusError{status: http.StatusConflict, message: "이미 가입된 이메일입니다."}
		default:
			return statusError{status: http.StatusInternalServerError, message: pbErr.Message}
		}
	}

	if resp.StatusCode == http.StatusUnauthorized {
		return statusError{
			status:  http.StatusUnauthorized,
			message: "이메일 또는 비밀번호가 올바르지 않습니다.",
		}
	}

	status := http.StatusInternalServerError
	if resp.StatusCode >= 400 && resp.StatusCode < 500 {
		status = resp.StatusCode
	}
	return statusError{status: status, message: fallback}
}

func hasEmailAlreadyExistsError(data map[string]interface{}) bool {
	field, ok := data["email"].(map[string]interface{})
	if !ok {
		return false
	}

	code, _ := field["code"].(string)
	return code == "validation_not_unique"
}

func pocketBaseRecordsURL() string {
	return fmt.Sprintf("%s/api/collections/%s/records", pocketBaseURL(), usersCollection)
}

func pocketBaseAuthWithPasswordURL() string {
	return fmt.Sprintf("%s/api/collections/%s/auth-with-password", pocketBaseURL(), usersCollection)
}

func pocketBaseAuthRefreshURL() string {
	return fmt.Sprintf("%s/api/collections/%s/auth-refresh", pocketBaseURL(), usersCollection)
}

func statusCodeForError(err error, fallback int) int {
	var statusErr statusError
	if errors.As(err, &statusErr) {
		return statusErr.status
	}
	return fallback
}
