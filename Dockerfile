FROM golang:1.25-alpine AS builder
WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY src ./src
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o /out/api ./src

FROM alpine:3.20
RUN apk add --no-cache ca-certificates tzdata
ENV TZ=Asia/Seoul

WORKDIR /app
COPY --from=builder /out/api /app/api

EXPOSE 8080
CMD ["/app/api"]
