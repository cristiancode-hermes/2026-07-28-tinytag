import { Injectable, signal } from '@angular/core';
import { ApiService } from './api.service';
import { inject } from '@angular/core';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = inject(ApiService);
  readonly isAuthenticated = signal<boolean>(this.hasToken());
  readonly currentUser = signal<UserProfile | null>(null);

  private hasToken(): boolean {
    return !!localStorage.getItem('tinytag-token');
  }

  login(credentials: LoginCredentials) {
    return this.api.post<AuthResponse>('/auth/login', credentials);
  }

  register(data: RegisterData) {
    return this.api.post<AuthResponse>('/auth/register', data);
  }

  getProfile() {
    return this.api.get<UserProfile>('/auth/profile');
  }

  setSession(response: AuthResponse) {
    localStorage.setItem('tinytag-token', response.token);
    this.isAuthenticated.set(true);
    this.currentUser.set(response.user);
  }

  logout() {
    localStorage.removeItem('tinytag-token');
    this.isAuthenticated.set(false);
    this.currentUser.set(null);
  }

  updateProfile(data: { name: string; email: string }) {
    return this.api.patch<UserProfile>('/auth/profile', data);
  }
}
