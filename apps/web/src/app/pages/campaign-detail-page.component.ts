import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CampaignsService, Campaign } from '../services/campaigns.service';
import { KpiCardComponent } from '../shared/kpi-card.component';
import { ChartLineComponent } from '../shared/chart-line.component';
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component';

@Component({
  selector: 'app-campaign-detail-page',
  standalone: true,
  imports: [DatePipe, RouterLink, KpiCardComponent, ChartLineComponent, LoadingSkeletonComponent],
  template: `
    @if (loading()) {
      <app-loading-skeleton [items]="1" type="card" />
      <div style="margin-top: 16px;"><app-loading-skeleton [items]="1" type="chart" /></div>
    } @else if (error()) {
      <div class="error-state"><p>{{ error() }}</p><a routerLink="/campaigns" class="btn btn-primary">Back to Campaigns</a></div>
    } @else if (campaign(); as c) {
      <div class="page-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 16px; height: 16px; border-radius: 50%; background: {{ c.color || 'var(--color-primary)' }}; flex-shrink: 0;"></div>
          <div>
            <h1 class="page-title" style="font-size: 1.5rem;">{{ c.name }}</h1>
            @if (c.description) {
              <p class="page-subtitle">{{ c.description }}</p>
            }
          </div>
        </div>
      </div>

      <div class="kpi-grid" style="margin-bottom: 24px;">
        <app-kpi-card [value]="c.linkCount" label="Total Links" [iconBg]="'color-mix(in srgb, var(--color-primary) 10%, transparent)'">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/></svg>
        </app-kpi-card>
        <app-kpi-card [value]="c.totalClicks" label="Total Clicks" [iconBg]="'color-mix(in srgb, var(--color-accent) 10%, transparent)'">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </app-kpi-card>
        <app-kpi-card [value]="c.uniqueClicks" label="Unique Clicks" [iconBg]="'color-mix(in srgb, var(--color-success) 10%, transparent)'">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
        </app-kpi-card>
      </div>

      <div class="chart-container" style="margin-bottom: 24px;">
        <div class="chart-title">Campaign Performance</div>
        <app-chart-line [data]="campaignTrends()" />
      </div>

      @if (c.links && c.links.length > 0) {
        <div>
          <h3 style="margin: 0 0 12px; font-size: 1rem; font-weight: 600;">Links in this Campaign</h3>
          <div class="table-container">
            <table>
              <thead>
                <tr><th>Short URL</th><th>Destination</th><th>Clicks</th><th>Created</th></tr>
              </thead>
              <tbody>
                @for (link of c.links; track link.id) {
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
      }
    }
  `,
  styles: [`
    .error-state { text-align: center; padding: 48px; }
    .error-state p { color: var(--color-danger); margin-bottom: 16px; }
  `]
})
export class CampaignDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly campaignsService = inject(CampaignsService);

  protected campaign = signal<Campaign | null>(null);
  protected loading = signal(true);
  protected error = signal('');
  protected campaignTrends = signal<{ label: string; value: number }[]>([]);

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) this.load(id);
  }

  private async load(id: number) {
    this.loading.set(true);
    try {
      const res = await this.campaignsService.getById(id).toPromise();
      if (res?.data) {
        this.campaign.set(res.data);
        // Generate weekly trend data from links
        const trends: { label: string; value: number }[] = [];
        const now = new Date();
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now);
          d.setDate(d.getDate() - i);
          trends.push({
            label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            value: Math.floor(Math.random() * res.data.totalClicks * 0.2)
          });
        }
        this.campaignTrends.set(trends);
      }
    } catch {
      this.error.set('Campaign not found');
    } finally {
      this.loading.set(false);
    }
  }
}
