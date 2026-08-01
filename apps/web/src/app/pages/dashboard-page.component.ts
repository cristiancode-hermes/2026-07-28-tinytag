import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService, DashboardData } from '../services/dashboard.service';
import { KpiCardComponent } from '../shared/kpi-card.component';
import { ChartLineComponent } from '../shared/chart-line.component';
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-dashboard-page',
  standalone: true,
  imports: [DatePipe, RouterLink, KpiCardComponent, ChartLineComponent, LoadingSkeletonComponent, EmptyStateComponent],
  template: `
    @if (loading()) {
      <div class="kpi-grid" style="margin-bottom: 24px;">
        @for (_ of [1,2,3,4]; track _) { <app-loading-skeleton [items]="1" type="card" /> }
      </div>
      <app-loading-skeleton [items]="1" type="chart" />
    } @else if (error()) {
      <div class="error-state">
        <p>{{ error() }}</p>
        <button class="btn btn-primary" (click)="loadDashboard()">Retry</button>
      </div>
    } @else if (!data()) {
      <app-empty-state
        title="Welcome to TinyTag"
        description="Create your first short link to get started with analytics."
        ctaLabel="Create your first link"
        (ctaClick)="navigateToCreate()"
      />
    } @else {
      <div class="kpi-grid">
        <app-kpi-card [value]="data()!.totalLinks" label="Total Links" [iconBg]="'color-mix(in srgb, var(--color-primary) 10%, transparent)'">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
        </app-kpi-card>
        <app-kpi-card [value]="data()!.totalClicks" label="Total Clicks" [iconBg]="'color-mix(in srgb, var(--color-accent) 10%, transparent)'">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </app-kpi-card>
        <app-kpi-card [value]="data()!.mobileRate + '%'" label="Mobile Rate" [iconBg]="'color-mix(in srgb, var(--color-success) 10%, transparent)'">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        </app-kpi-card>
        <app-kpi-card [value]="data()!.topCountry || '—'" label="Top Country" [iconBg]="'color-mix(in srgb, var(--color-secondary) 10%, transparent)'">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </app-kpi-card>
      </div>

      @if (trends().length > 0) {
        <div class="chart-container" style="margin-top: 24px;">
          <div class="chart-title">Click Trends (Last 30 Days)</div>
          <app-chart-line [data]="trends()" />
        </div>
      }

      @if (recentLinks().length > 0) {
        <div style="margin-top: 24px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <h3 style="margin: 0; font-size: 1rem; font-weight: 600;">Recent Links</h3>
            <a routerLink="/links" class="btn btn-ghost">View all</a>
          </div>
          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Short URL</th>
                  <th>Destination</th>
                  <th>Clicks</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                @for (link of recentLinks(); track link.id) {
                  <tr>
                    <td><a [routerLink]="['/links', link.id]" class="mono">{{ link.shortUrl }}</a></td>
                    <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">{{ link.destinationUrl }}</td>
                    <td><strong>{{ link.totalClicks }}</strong></td>
                    <td>{{ link.createdAt | date:'mediumDate' }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>
      } @else {
        <app-empty-state
          title="No links yet"
          description="Create your first short link to start tracking clicks."
          ctaLabel="Create link"
          (ctaClick)="navigateToCreate()"
        />
      }
    }
  `,
  styles: [`
    .error-state { text-align: center; padding: 48px 24px; }
    .error-state p { color: var(--color-danger); margin-bottom: 16px; }
  `]
})
export class DashboardPageComponent implements OnInit {
  private readonly dashboardService = inject(DashboardService);

  protected loading = signal(true);
  protected error = signal('');
  protected data = signal<DashboardData | null>(null);

  protected trends = signal<{ label: string; value: number }[]>([]);
  protected recentLinks = signal<DashboardData['recentLinks']>([]);

  ngOnInit() {
    this.loadDashboard();
  }

  protected async loadDashboard() {
    this.loading.set(true);
    this.error.set('');
    try {
      const res = await this.dashboardService.getDashboard().toPromise();
      if (res?.data) {
        this.data.set(res.data);
        this.trends.set(res.data.clickTrends.map(t => ({ label: t.date, value: t.clicks })));
        this.recentLinks.set(res.data.recentLinks);
      }
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Failed to load dashboard');
    } finally {
      this.loading.set(false);
    }
  }

  protected navigateToCreate() {
    window.location.href = '/links/new';
  }
}
