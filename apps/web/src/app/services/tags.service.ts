import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface Tag {
  id: number;
  name: string;
  color: string;
  linkCount: number;
  totalClicks: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class TagsService {
  private readonly api = inject(ApiService);

  getAll() {
    return this.api.get<Tag[]>('/tags');
  }

  create(data: { name: string; color?: string }) {
    return this.api.post<Tag>('/tags', data);
  }

  update(id: number, data: { name?: string; color?: string }) {
    return this.api.patch<Tag>(`/tags/${id}`, data);
  }

  delete(id: number) {
    return this.api.delete<void>(`/tags/${id}`);
  }
}
