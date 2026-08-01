import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LinksService, Link, UpdateLinkData } from '../services/links.service';
import { CampaignsService, Campaign } from '../services/campaigns.service';
import { ToastService } from '../services/toast.service';
import { TagPillComponent } from '../shared/tag-pill.component';
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component';

@Component({
  selector: 'app-link-edit-page',
  standalone: true,
  imports: [FormsModule, RouterLink, TagPillComponent, LoadingSkeletonComponent],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Edit Link</h1>
        <p class="page-subtitle">Update your shortened URL settings</p>
      </div>
    </div>

    @if (loading()) {
      <app-loading-skeleton [items]="1" type="card" />
    } @else if (error()) {
      <div class="error-state"><p>{{ error() }}</p><a routerLink="/links" class="btn btn-primary">Back to Links</a></div>
    } @else {
      <div class="card">
        <form (ngSubmit)="onSubmit()" class="edit-form">
          <div class="form-group">
            <label class="form-label" for="url">Destination URL *</label>
            <input id="url" type="url" class="input" [(ngModel)]="destinationUrl" name="destinationUrl" required placeholder="https://example.com/long-url" />
          </div>

          <div class="form-group">
            <label class="form-label" for="title">Title</label>
            <input id="title" type="text" class="input" [(ngModel)]="title" name="title" placeholder="Link title" />
          </div>

          <div class="form-group">
            <label class="form-label">Campaign</label>
            <select class="input" [(ngModel)]="selectedCampaignId" name="campaign">
              <option [ngValue]="null">No campaign</option>
              @for (c of campaigns(); track c.id) {
                <option [ngValue]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>

          <div class="form-group">
            <label class="form-label">Tags</label>
            <div class="tags-input">
              @for (tag of selectedTags(); track tag) {
                <app-tag-pill [name]="tag" [dismissible]="true" (dismiss)="removeTag(tag)" />
              }
              <input class="input tag-input" [(ngModel)]="tagInput" name="tagInput" placeholder="Add a tag..." (keydown.enter)="addTag($event)" (blur)="addTagFromBlur()" />
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Expiration</label>
            <div class="form-row">
              <select class="input" style="flex: 0 0 160px;" [(ngModel)]="expirationType" name="expirationType">
                <option value="never">Never expires</option>
                <option value="24h">24 hours</option>
                <option value="7d">7 days</option>
                <option value="30d">30 days</option>
                <option value="custom">Custom date</option>
              </select>
              @if (expirationType() === 'custom') {
                <input type="date" class="input" [(ngModel)]="customExpiration" name="customExpiration" />
              }
            </div>
          </div>

          @if (submitError()) {
            <div class="error-message">{{ submitError() }}</div>
          }

          <div class="form-actions">
            <a [routerLink]="['/links', linkId]" class="btn btn-secondary">Cancel</a>
            <button type="submit" class="btn btn-primary" [disabled]="submitting()">
              @if (submitting()) { <span class="spinner"></span> Saving... }
              @else { Save Changes }
            </button>
          </div>
        </form>
      </div>
    }
  `,
  styles: [`
    .edit-form { display: flex; flex-direction: column; gap: 20px; max-width: 640px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.813rem; font-weight: 600; }
    .form-row { display: flex; gap: 16px; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--color-border); }
    .tags-input { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); }
    .tag-input { border: none; padding: 0; min-width: 100px; flex: 1; }
    .tag-input:focus { box-shadow: none; }
    .error-message { padding: 10px 14px; background: color-mix(in srgb, var(--color-danger) 10%, transparent); color: var(--color-danger); border-radius: 8px; font-size: 0.813rem; }
    .error-state { text-align: center; padding: 48px; }
    .error-state p { color: var(--color-danger); margin-bottom: 16px; }
  `]
})
export class LinkEditPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly linksService = inject(LinksService);
  private readonly campaignsService = inject(CampaignsService);
  private readonly toast = inject(ToastService);

  protected linkId = 0;
  protected destinationUrl = '';
  protected title = '';
  protected selectedCampaignId: number | null = null;
  protected selectedTags = signal<string[]>([]);
  protected tagInput = '';
  protected expirationType = signal<'never' | '24h' | '7d' | '30d' | 'custom'>('never');
  protected customExpiration = '';
  protected loading = signal(true);
  protected error = signal('');
  protected submitting = signal(false);
  protected submitError = signal('');
  protected campaigns = signal<Campaign[]>([]);

  ngOnInit() {
    this.linkId = Number(this.route.snapshot.paramMap.get('id'));
    if (this.linkId) {
      this.loadLink();
      this.loadCampaigns();
    }
  }

  private async loadLink() {
    try {
      const res = await this.linksService.getById(this.linkId).toPromise();
      if (res?.data) {
        const link = res.data;
        this.destinationUrl = link.destinationUrl;
        this.title = link.title || '';
        this.selectedCampaignId = link.campaignId;
        this.selectedTags.set(link.tags.map(t => t.name));
        // Set expiration type from link.expiresAt
        if (link.expiresAt) {
          this.expirationType.set('custom');
          this.customExpiration = link.expiresAt.slice(0, 10);
        }
      }
    } catch {
      this.error.set('Link not found');
    } finally {
      this.loading.set(false);
    }
  }

  private async loadCampaigns() {
    try {
      const res = await this.campaignsService.getAll().toPromise();
      if (res?.data) this.campaigns.set(res.data);
    } catch {}
  }

  protected addTag(event: Event) {
    event.preventDefault();
    const value = this.tagInput.trim();
    if (value && !this.selectedTags().includes(value)) {
      this.selectedTags.update(tags => [...tags, value]);
    }
    this.tagInput = '';
  }

  protected addTagFromBlur() {
    if (this.tagInput.trim()) {
      this.addTag(new Event('blur'));
    }
  }

  protected removeTag(tag: string) {
    this.selectedTags.update(tags => tags.filter(t => t !== tag));
  }

  protected getExpiresAt(): string | null {
    switch (this.expirationType()) {
      case '24h': return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      case '7d': return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d': return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'custom': return this.customExpiration ? new Date(this.customExpiration).toISOString() : null;
      default: return null;
    }
  }

  protected async onSubmit() {
    if (!this.destinationUrl) {
      this.submitError.set('Destination URL is required');
      return;
    }

    this.submitting.set(true);
    this.submitError.set('');

    try {
      const data: UpdateLinkData = {
        destinationUrl: this.destinationUrl,
        title: this.title || undefined,
        campaignId: this.selectedCampaignId,
        tags: this.selectedTags(),
        expiresAt: this.getExpiresAt()
      };
      await this.linksService.update(this.linkId, data).toPromise();
      this.toast.success('Link updated successfully');
      await this.router.navigate(['/links', this.linkId]);
    } catch (err: any) {
      this.submitError.set(err?.error?.message || 'Failed to update link');
    } finally {
      this.submitting.set(false);
    }
  }
}
