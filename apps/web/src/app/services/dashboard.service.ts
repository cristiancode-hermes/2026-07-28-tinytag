import { Injectable, inject } from '@angular/core';
import { ApiService } from './api.service';

export interface DashboardData {
  totalLinks: number;
  totalClicks: number;
  mobileRate: number;
  topCountry: string;
  clickTrends: { date: string; clicks: number }[];
  recentLinks: {
    id: number;
    alias: string;
    shortUrl: string;
    destinationUrl: string;
    totalClicks: number;
    createdAt: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly api = inject(ApiService);

  getDashboard() {
    return this.api.get<DashboardData>('/dashboard');
  }
}
