import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface Link {
  id: number;
  alias: string;
  destinationUrl: string;
  shortUrl: string;
  title: string;
  campaignId: number | null;
  campaign?: { id: number; name: string };
  tags: { id: number; name: string; color: string }[];
  expiresAt: string | null;
  createdAt: string;
  totalClicks: number;
  uniqueClicks: number;
  mobileRate: number;
  topCountry: string;
}

export interface LinkAnalytics {
  totalClicks: number;
  uniqueClicks: number;
  mobileRate: number;
  topCountry: string;
  clickTrends: { date: string; clicks: number }[];
  referrers: { referrer: string; count: number }[];
  devices: { device: string; count: number }[];
  browsers: { browser: string; count: number }[];
  countries: { country: string; count: number }[];
}

export interface CreateLinkData {
  destinationUrl: string;
  alias?: string;
  title?: string;
  campaignId?: number;
  tags?: string[];
  expiresAt?: string;
}

export interface UpdateLinkData {
  destinationUrl?: string;
  alias?: string;
  title?: string;
  campaignId?: number | null;
  tags?: string[];
  expiresAt?: string | null;
}

@Injectable({ providedIn: 'root' })
export class LinksService {
  private readonly api = inject(ApiService);

  getAll(params?: { search?: string; campaign?: string; tag?: string; page?: number; limit?: number; sort?: string }) {
    return this.api.get<Link[]>('/links', params as Record<string, string | number | boolean | undefined>);
  }

  getById(id: number) {
    return this.api.get<Link>(`/links/${id}`);
  }

  create(data: CreateLinkData) {
    return this.api.post<Link>('/links', data);
  }

  update(id: number, data: UpdateLinkData) {
    return this.api.patch<Link>(`/links/${id}`, data);
  }

  delete(id: number) {
    return this.api.delete<void>(`/links/${id}`);
  }

  getAnalytics(id: number, period?: '7d' | '30d' | '90d') {
    return this.api.get<LinkAnalytics>(`/links/${id}/analytics`, { period });
  }

  checkAlias(alias: string) {
    return this.api.get<{ available: boolean }>(`/links/check-alias/${alias}`);
  }

  redirect(alias: string) {
    return this.api.get<{ destinationUrl: string }>(`/redirect/${alias}`);
  }
}
