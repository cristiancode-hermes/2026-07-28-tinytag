import { Component, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe } from '@angular/common';
import { LinksService, Link, LinkAnalytics } from '../services/links.service';
import { ToastService } from '../services/toast.service';
import { KpiCardComponent } from '../shared/kpi-card.component';
import { ChartLineComponent } from '../shared/chart-line.component';
import { ChartBarComponent } from '../shared/chart-bar.component';
import { ChartDonutComponent } from '../shared/chart-donut.component';
import { QrCodeComponent } from '../shared/qr-code.component';
import { TagPillComponent } from '../shared/tag-pill.component';
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component';
import { ConfirmModalComponent } from '../shared/confirm-modal.component';

@Component({
  selector: 'app-link-detail-page',
  standalone: true,
  imports: [DatePipe, RouterLink, KpiCardComponent, ChartLineComponent, ChartBarComponent, ChartDonutComponent, QrCodeComponent, TagPillComponent, LoadingSkeletonComponent, ConfirmModalComponent],
  template: `
    @if (loading()) {
      <app-loading-skeleton [items]="1" type="card" />
      <div style="margin-top: 16px;"><app-loading-skeleton [items]="1" type="chart" /></div>
    } @else if (error()) {
      <div class="error-state"><p>{{ error() }}</p><a routerLink="/links" class="btn btn-primary">Back to Links</a></div>
    } @else if (link(); as l) {
      <div class="page-header">
        <div>
          <h1 class="page-title mono" style="font-size: 1.5rem;">{{ l.shortUrl }}</h1>
          <p class="page-subtitle" style="word-break: break-all;">{{ l.destinationUrl }}</p>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary" (click)="copyUrl(l.shortUrl)">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
            Copy
          </button>
          <a [routerLink]="['/links', l.id, 'edit']" class="btn btn-secondary">Edit</a>
          <button class="btn btn-danger" (click)="showDeleteModal.set(true)">Delete</button>
        </div>
      </div>

      <div class="detail-meta" style="margin-bottom: 24px; display: flex; gap: 16px; flex-wrap: wrap; align-items: center;">
        @if (l.campaign) {
          <span class="status-badge" style="background: color-mix(in srgb, var(--color-accent) 10%, transparent); color: var(--color-accent);">
            <span class="status-dot" style="background: var(--color-accent);"></span>
            {{ l.campaign.name }}
          </span>
        }
        @for (tag of l.tags; track tag.id) {
          <app-tag-pill [name]="tag.name" [color]="tag.color" />
        }
        @if (l.expiresAt) {
          <span class="status-badge" style="background: color-mix(in srgb, var(--color-warning) 10%, transparent); color: var(--color-warning);">
            Expires {{ l.expiresAt | date:'mediumDate' }}
          </span>
        }
        <span style="font-size: 0.813rem; color: var(--color-text-muted);">Created {{ l.createdAt | date:'mediumDate' }}</span>
      </div>

      <div class="kpi-grid" style="margin-bottom: 24px;">
        <app-kpi-card [value]="analytics()?.totalClicks ?? 0" label="Total Clicks" [iconBg]="'color-mix(in srgb, var(--color-primary) 10%, transparent)'">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-primary)" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
        </app-kpi-card>
        <app-kpi-card [value]="analytics()?.uniqueClicks ?? 0" label="Unique Clicks" [iconBg]="'color-mix(in srgb, var(--color-accent) 10%, transparent)'">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        </app-kpi-card>
        <app-kpi-card [value]="(analytics()?.mobileRate ?? 0) + '%'" label="Mobile Rate" [iconBg]="'color-mix(in srgb, var(--color-success) 10%, transparent)'">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
        </app-kpi-card>
        <app-kpi-card [value]="analytics()?.topCountry || '—'" label="Top Country" [iconBg]="'color-mix(in srgb, var(--color-secondary) 10%, transparent)'">
          <svg icon width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--color-secondary)" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        </app-kpi-card>
      </div>

      <!-- Period Toggle -->
      <div style="display: flex; gap: 8px; margin-bottom: 16px;">
        @for (p of periods; track p.value) {
          <button class="btn" [class.btn-primary]="selectedPeriod() === p.value" [class.btn-secondary]="selectedPeriod() !== p.value"
            (click)="changePeriod(p.value)">{{ p.label }}</button>
        }
      </div>

      <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 24px; margin-bottom: 24px;">
        <div class="chart-container">
          <div class="chart-title">Click Trends</div>
          @if (clickTrends().length > 0) { <app-chart-line [data]="clickTrends()" /> }
          @else { <p style="color: var(--color-text-muted); text-align: center; padding: 20px;">No data yet</p> }
        </div>
        <div class="chart-container">
          <div class="chart-title">Devices</div>
          @if (deviceData().length > 0) { <app-chart-donut [data]="deviceData()" [centerText]="'Devices'" /> }
          @else { <p style="color: var(--color-text-muted); text-align: center; padding: 20px;">No data yet</p> }
        </div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; margin-bottom: 24px;">
        <div class="chart-container">
          <div class="chart-title">Referrers</div>
          @if (referrerData().length > 0) { <app-chart-bar [data]="referrerData()" /> }
          @else { <p style="color: var(--color-text-muted); text-align: center; padding: 20px;">No data yet</p> }
        </div>
        <div class="chart-container">
          <div class="chart-title">Browsers</div>
          @if (browserData().length > 0) { <app-chart-bar [data]="browserData()" /> }
          @else { <p style="color: var(--color-text-muted); text-align: center; padding: 20px;">No data yet</p> }
        </div>
        <div class="chart-container">
          <div class="chart-title">Countries</div>
          @if (countryData().length > 0) { <app-chart-bar [data]="countryData()" /> }
          @else { <p style="color: var(--color-text-muted); text-align: center; padding: 20px;">No data yet</p> }
        </div>
      </div>

      <div class="card" style="max-width: 280px; display: flex; flex-direction: column; align-items: center;">
        <div class="chart-title">QR Code</div>
        <app-qr-code [url]="l.shortUrl" />
      </div>

      <app-confirm-modal
        [visible]="showDeleteModal()"
        title="Delete Link"
        message="Are you sure you want to delete this link? This action cannot be undone."
        confirmLabel="Delete"
        [danger]="true"
        (confirm)="deleteLink()"
        (cancel)="showDeleteModal.set(false)"
      />
    }
  `,
  styles: [`
    .error-state { text-align: center; padding: 48px; }
    .error-state p { color: var(--color-danger); margin-bottom: 16px; }
  `]
})
export class LinkDetailPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly linksService = inject(LinksService);
  private readonly toast = inject(ToastService);

  protected link = signal<Link | null>(null);
  protected analytics = signal<LinkAnalytics | null>(null);
  protected loading = signal(true);
  protected error = signal('');
  protected selectedPeriod = signal<'7d' | '30d' | '90d'>('30d');
  protected showDeleteModal = signal(false);

  protected periods = [
    { label: '7 Days', value: '7d' as const },
    { label: '30 Days', value: '30d' as const },
    { label: '90 Days', value: '90d' as const },
  ];

  protected clickTrends = signal<{ label: string; value: number }[]>([]);
  protected referrerData = signal<{ label: string; value: number; color?: string }[]>([]);
  protected deviceData = signal<{ label: string; value: number; color: string }[]>([]);
  protected browserData = signal<{ label: string; value: number; color?: string }[]>([]);
  protected countryData = signal<{ label: string; value: number; color?: string }[]>([]);

  private colors = ['#E85D3A', '#F59E0B', '#22C55E', '#3B82F6', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316'];

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadLink(id);
      this.loadAnalytics(id);
    }
  }

  private async loadLink(id: number) {
    try {
      const res = await this.linksService.getById(id).toPromise();
      if (res?.data) this.link.set(res.data);
    } catch (err: any) {
      this.error.set('Link not found');
    }
  }

  private async loadAnalytics(id: number) {
    try {
      const res = await this.linksService.getAnalytics(id, this.selectedPeriod()).toPromise();
      if (res?.data) {
        const a = res.data;
        this.analytics.set(a);
        this.clickTrends.set(a.clickTrends.map(t => ({ label: t.date, value: t.clicks })));
        this.referrerData.set(a.referrers.map(r => ({ label: r.referrer || 'Direct', value: r.count })).slice(0, 10));
        this.deviceData.set(a.devices.map((d, i) => ({ label: d.device, value: d.count, color: this.colors[i % this.colors.length] })));
        this.browserData.set(a.browsers.map(b => ({ label: b.browser, value: b.count })).slice(0, 8));
        this.countryData.set(a.countries.map(c => ({ label: c.country, value: c.count })).slice(0, 8));
      }
    } catch {}
    finally {
      this.loading.set(false);
    }
  }

  protected changePeriod(period: '7d' | '30d' | '90d') {
    this.selectedPeriod.set(period);
    const id = this.link()?.id;
    if (id) {
      this.loading.set(true);
      this.loadAnalytics(id);
    }
  }

  protected copyUrl(url: string) {
    navigator.clipboard.writeText(url).then(
      () => this.toast.success('URL copied to clipboard'),
      () => this.toast.error('Failed to copy URL')
    );
  }

  protected async deleteLink() {
    const id = this.link()?.id;
    if (!id) return;
    try {
      await this.linksService.delete(id).toPromise();
      this.toast.success('Link deleted');
      window.location.href = '/links';
    } catch {
      this.toast.error('Failed to delete link');
    }
  }
}
