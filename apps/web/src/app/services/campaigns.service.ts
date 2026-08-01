import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';
import { Link } from './links.service';

export interface Campaign {
  id: number;
  name: string;
  description: string;
  color: string;
  linkCount: number;
  totalClicks: number;
  uniqueClicks: number;
  createdAt: string;
  links: Link[];
}

export interface CreateCampaignData {
  name: string;
  description?: string;
  color?: string;
}

@Injectable({ providedIn: 'root' })
export class CampaignsService {
  private readonly api = inject(ApiService);

  getAll() {
    return this.api.get<Campaign[]>('/campaigns');
  }

  getById(id: number) {
    return this.api.get<Campaign>(`/campaigns/${id}`);
  }

  create(data: CreateCampaignData) {
    return this.api.post<Campaign>('/campaigns', data);
  }

  update(id: number, data: Partial<CreateCampaignData>) {
    return this.api.patch<Campaign>(`/campaigns/${id}`, data);
  }

  delete(id: number) {
    return this.api.delete<void>(`/campaigns/${id}`);
  }
}
