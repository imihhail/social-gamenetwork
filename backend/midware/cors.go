package midware

import (
	"net/http"
)

func CorsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch origin := r.Header.Get("Origin"); origin {
		case "http://localhost:3000", "http://3.64.52.101":
			(w).Header().Set("Access-Control-Allow-Origin", origin)
		}
		// (w).Header().Set("Access-Control-Allow-Origin", "http://localhost:3000")
		(w).Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		(w).Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
		(w).Header().Set("Access-Control-Allow-Credentials", "true")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
