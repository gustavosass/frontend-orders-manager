import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8081/api/v1/auth';

  constructor(private http: HttpClient) {}

  authenticate(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/authenticate`, { email, password });
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    const headers = new HttpHeaders({
      Authorization: refreshToken
    });
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh-token`, {}, { headers });
  }
}
