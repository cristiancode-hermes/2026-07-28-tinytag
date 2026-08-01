import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LinksService, Link } from '../services/links.service';
import { CampaignsService, Campaign } from '../services/campaigns.service';
import { TagsService, Tag } from '../services/tags.service';
import { ToastService } from '../services/toast.service';
import { SearchInputComponent } from '../shared/search-input.component';
import { PaginationComponent } from '../shared/pagination.component';
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { TagPillComponent } from '../shared/tag-pill.component';

@Component({
  selector: 'app-link-list-page',
  standalone: true,
  imports: [DatePipe, RouterLink, FormsModule, SearchInputComponent, PaginationComponent, LoadingSkeletonComponent, EmptyStateComponent, TagPillComponent],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Links</h1>
        <p class="page-subtitle">Manage and track your shortened URLs</p>
      </div>
      <a routerLink="/links/new" class="btn btn-primary">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Link
      </a>
    </div>

    <div class="filters-bar">
      <app-search-input placeholder="Search URLs, alias..." [(search)]="searchQuery" />
      <select class="input" style="flex: 0 0 160px;" [(ngModel)]="campaignFilter" (ngModelChange)="loadLinks()">
        <option value="">All Campaigns</option>
        @for (c of campaigns(); track c.id) {
          <option [value]="c.name">{{ c.name }}</option>
        }
      </select>
      <select class="input" style="flex: 0 0 140px;" [(ngModel)]="sortBy" (ngModelChange)="loadLinks()">
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="clicks">Most clicks</option>
      </select>
    </div>

    @if (loading()) {
      <app-loading-skeleton [items]="5" type="table-row" />
    } @else if (error()) {
      <div class="error-state"><p>{{ error() }}</p><button class="btn btn-primary" (click)="loadLinks()">Retry</button></div>
    } @else if (links().length === 0) {
      <app-empty-state
        title="No links found"
        description="Create your first short link or adjust your search filters."
        ctaLabel="Create link"
        (ctaClick)="navigateToCreate()"
      />
    } @else {
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Short URL</th>
              <th>Destination</th>
              <th>Clicks</th>
              <th>Campaign</th>
              <th>Tags</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            @for (link of links(); track link.id) {
              <tr>
                <td><a [routerLink]="['/links', link.id]" class="mono" style="font-size: 0.813rem;">{{ link.shortUrl }}</a></td>
                <td style="max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="{{ link.destinationUrl }}">{{ link.destinationUrl }}</td>
                <td><strong>{{ link.totalClicks }}</strong></td>
                <td>{{ link.campaign?.name || '—' }}</td>
                <td>
                  <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                    @for (tag of link.tags; track tag.id) {
                      <app-tag-pill [name]="tag.name" [color]="tag.color" />
                    }
                  </div>
                </td>
                <td>{{ link.createdAt | date:'mediumDate' }}</td>
                <td>
                  <div style="display: flex; gap: 4px;">
                    <button class="btn btn-ghost" style="padding: 4px 8px;" (click)="copyUrl(link.shortUrl)" title="Copy short URL">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    </button>
                    <a [routerLink]="['/links', link.id, 'edit']" class="btn btn-ghost" style="padding: 4px 8px;" title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </a>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-pagination [page]="currentPage()" [totalPages]="totalPages()" (goTo)="goToPage($event)" />
    }
  `,
  styles: [`
    .error-state { text-align: center; padding: 48px; }
    .error-state p { color: var(--color-danger); margin-bottom: 16px; }
  `]
})
export class LinkListPageComponent implements OnInit {
  private readonly linksService = inject(LinksService);
  private readonly campaignsService = inject(CampaignsService);
  private readonly toast = inject(ToastService);

  protected links = signal<Link[]>([]);
  protected campaigns = signal<Campaign[]>([]);
  protected loading = signal(true);
  protected error = signal('');
  protected currentPage = signal(1);
  protected totalPages = signal(1);
  protected searchQuery = signal('');
  protected campaignFilter = signal('');
  protected sortBy = signal('newest');

  ngOnInit() {
    this.loadCampaigns();
    this.loadLinks();
  }

  protected async loadCampaigns() {
    try {
      const res = await this.campaignsService.getAll().toPromise();
      if (res?.data) this.campaigns.set(res.data);
    } catch {}
  }

  protected async loadLinks() {
    this.loading.set(true);
    this.error.set('');
    try {
      const res = await this.linksService.getAll({
        search: this.searchQuery() || undefined,
        campaign: this.campaignFilter() || undefined,
        page: this.currentPage(),
        limit: 15,
        sort: this.sortBy()
      }).toPromise();
      if (res?.data) {
        this.links.set(res.data);
        this.totalPages.set(res.meta?.totalPages || 1);
      }
    } catch (err: any) {
      this.error.set(err?.error?.message || 'Failed to load links');
    } finally {
      this.loading.set(false);
    }
  }

  protected goToPage(page: number) {
    this.currentPage.set(page);
    this.loadLinks();
  }

  protected async copyUrl(url: string) {
    try {
      await navigator.clipboard.writeText(url);
      this.toast.success('URL copied to clipboard');
    } catch {
      this.toast.error('Failed to copy URL');
    }
  }

  protected navigateToCreate() {
    window.location.href = '/links/new';
  }
}
