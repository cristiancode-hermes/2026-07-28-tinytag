import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CampaignsService, Campaign } from '../services/campaigns.service';
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component';
import { EmptyStateComponent } from '../shared/empty-state.component';

@Component({
  selector: 'app-campaign-list-page',
  standalone: true,
  imports: [RouterLink, LoadingSkeletonComponent, EmptyStateComponent, FormsModule, DatePipe],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Campaigns</h1>
        <p class="page-subtitle">Organize links by marketing campaign</p>
      </div>
      <a routerLink="/links/new" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Campaign
      </a>
    </div>

    @if (loading()) {
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px;">
        @for (_ of [1,2,3]; track _) { <app-loading-skeleton [items]="1" type="card" /> }
      </div>
    } @else if (error()) {
      <div class="error-state"><p>{{ error() }}</p><button class="btn btn-primary" (click)="load()">Retry</button></div>
    } @else if (campaigns().length === 0) {
      <app-empty-state
        title="No campaigns yet"
        description="Create a campaign to organize your links and track performance."
        ctaLabel="Create campaign"
        (ctaClick)="createCampaign()"
      />
    } @else {
      <div class="campaign-grid">
        @for (c of campaigns(); track c.id) {
          <a [routerLink]="['/campaigns', c.id]" class="campaign-card card" style="text-decoration: none; display: block;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
              <div style="width: 12px; height: 12px; border-radius: 50%; background: {{ c.color || 'var(--color-primary)' }}; flex-shrink: 0;"></div>
              <h3 style="margin: 0; font-size: 1rem; font-weight: 600; color: var(--color-text);">{{ c.name }}</h3>
            </div>
            @if (c.description) {
              <p style="font-size: 0.813rem; color: var(--color-text-muted); margin: 0 0 12px;">{{ c.description }}</p>
            }
            <div class="progress-bar" style="margin-bottom: 8px;">
              <div class="progress-fill" [style.width]="progressPercent(c)" [style.background]="c.color || 'var(--color-primary)'"></div>
            </div>
            <div style="display: flex; gap: 16px; font-size: 0.813rem;">
              <span><strong>{{ c.linkCount }}</strong> links</span>
              <span><strong>{{ c.totalClicks }}</strong> clicks</span>
              <span style="color: var(--color-text-muted);">Created {{ c.createdAt | date:'mediumDate' }}</span>
            </div>
          </a>
        }
      </div>
    }
  `,
  styles: [`
    .campaign-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .campaign-card { transition: box-shadow 0.2s, transform 0.2s; cursor: pointer; }
    .campaign-card:hover { box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1); transform: translateY(-2px); }
    .error-state { text-align: center; padding: 48px; }
    .error-state p { color: var(--color-danger); margin-bottom: 16px; }
  `]
})
export class CampaignListPageComponent implements OnInit {
  private readonly campaignsService = inject(CampaignsService);

  protected campaigns = signal<Campaign[]>([]);
  protected loading = signal(true);
  protected error = signal('');

  ngOnInit() { this.load(); }

  protected async load() {
    this.loading.set(true);
    this.error.set('');
    try {
      const res = await this.campaignsService.getAll().toPromise();
      if (res?.data) this.campaigns.set(res.data);
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Failed to load campaigns');
    } finally {
      this.loading.set(false);
    }
  }

  protected progressPercent(c: Campaign): string {
    const maxClicks = Math.max(...this.campaigns().map(x => x.totalClicks), 1);
    return Math.min(100, (c.totalClicks / maxClicks) * 100) + '%';
  }

  protected createCampaign() {
    window.location.href = '/links/new';
  }
}
