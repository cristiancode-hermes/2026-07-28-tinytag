import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface ApiKey {
  id: number;
  name: string;
  key: string;
  lastUsed: string | null;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ApiKeysService {
  private readonly api = inject(ApiService);

  getAll() {
    return this.api.get<ApiKey[]>('/api-keys');
  }

  create(data: { name: string }) {
    return this.api.post<ApiKey>('/api-keys', data);
  }

  revoke(id: number) {
    return this.api.delete<void>(`/api-keys/${id}`);
  }
}
