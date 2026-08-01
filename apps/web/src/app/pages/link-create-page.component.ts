import { Component, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged, Subscription } from 'rxjs';
import { LinksService, CreateLinkData } from '../services/links.service';
import { CampaignsService, Campaign } from '../services/campaigns.service';
import { TagsService, Tag } from '../services/tags.service';
import { ToastService } from '../services/toast.service';
import { TagPillComponent } from '../shared/tag-pill.component';

@Component({
  selector: 'app-link-create-page',
  standalone: true,
  imports: [FormsModule, RouterLink, TagPillComponent],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Create Link</h1>
        <p class="page-subtitle">Shorten a URL and configure tracking</p>
      </div>
    </div>

    <div class="card">
      <form (ngSubmit)="onSubmit()" class="create-form">
        <div class="form-group">
          <label class="form-label" for="url">Destination URL *</label>
          <input id="url" type="url" class="input" [(ngModel)]="url" name="url" required placeholder="https://example.com/long-url" />
        </div>

        <div class="form-group">
          <label class="form-label" for="title">Title</label>
          <input id="title" type="text" class="input" [(ngModel)]="title" name="title" placeholder="Link title (optional)" />
        </div>

        <div class="form-row">
          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="alias">Custom Alias</label>
            <div class="alias-input-wrapper">
              <input id="alias" type="text" class="input" [(ngModel)]="alias" name="alias" placeholder="my-custom-alias" (ngModelChange)="onAliasChange()" />
              @if (aliasChecking()) {
                <span class="alias-status checking">Checking...</span>
              } @else if (aliasAvailable() === true) {
                <span class="alias-status available">Available</span>
              } @else if (aliasAvailable() === false) {
                <span class="alias-status taken">Taken</span>
              }
            </div>
          </div>
          <div class="form-group" style="flex: 1;">
            <label class="form-label" for="campaign">Campaign</label>
            <select id="campaign" class="input" [(ngModel)]="selectedCampaignId" name="campaign">
              <option [value]="null">No campaign</option>
              @for (c of campaigns(); track c.id) {
                <option [value]="c.id">{{ c.name }}</option>
              }
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Tags</label>
          <div class="tags-input">
            @for (tag of selectedTags(); track tag) {
              <app-tag-pill [name]="tag" [dismissible]="true" (dismiss)="removeTag(tag)" />
            }
            <input
              class="input tag-input"
              [(ngModel)]="tagInput"
              name="tagInput"
              placeholder="Add a tag..."
              (keydown.enter)="addTag($event)"
              (keydown.comma)="addTag($event)"
              (blur)="addTagFromBlur()"
            />
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

        @if (errorMessage()) {
          <div class="error-message">{{ errorMessage() }}</div>
        }

        <div class="form-actions">
          <a routerLink="/links" class="btn btn-secondary">Cancel</a>
          <button type="submit" class="btn btn-primary" [disabled]="submitting() || !url">
            @if (submitting()) { <span class="spinner"></span> Creating... }
            @else { Create Link }
          </button>
        </div>
      </form>
    </div>

    @if (url && !submitting()) {
      <div class="card" style="margin-top: 24px;">
        <div class="chart-title">Preview</div>
        <div class="preview-box">
          <div class="preview-label">Short URL</div>
          <div class="preview-url mono">{{ previewShortUrl() }}</div>
          <div class="preview-label" style="margin-top: 12px;">Destination</div>
          <div class="preview-destination">{{ url }}</div>
        </div>
      </div>
    }
  `,
  styles: [`
    .create-form { display: flex; flex-direction: column; gap: 20px; max-width: 640px; }
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.813rem; font-weight: 600; }
    .form-row { display: flex; gap: 16px; }
    .form-actions { display: flex; gap: 10px; justify-content: flex-end; padding-top: 8px; border-top: 1px solid var(--color-border); }
    .alias-input-wrapper { position: relative; }
    .alias-status { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); font-size: 0.75rem; font-weight: 600; }
    .alias-status.checking { color: var(--color-text-muted); }
    .alias-status.available { color: var(--color-success); }
    .alias-status.taken { color: var(--color-danger); }
    .tags-input { display: flex; flex-wrap: wrap; gap: 6px; padding: 8px; border: 1px solid var(--color-border); border-radius: 8px; background: var(--color-surface); }
    .tag-input { border: none; padding: 0; min-width: 100px; flex: 1; width: auto; }
    .tag-input:focus { box-shadow: none; }
    .error-message { padding: 10px 14px; background: color-mix(in srgb, var(--color-danger) 10%, transparent); color: var(--color-danger); border-radius: 8px; font-size: 0.813rem; }
    .preview-box { background: var(--color-surface-secondary); border-radius: 8px; padding: 16px; }
    .preview-label { font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 4px; }
    .preview-url { color: var(--color-primary); word-break: break-all; }
    .preview-destination { font-size: 0.875rem; color: var(--color-text); word-break: break-all; }
  `]
})
export class LinkCreatePageComponent implements OnInit {
  private readonly linksService = inject(LinksService);
  private readonly campaignsService = inject(CampaignsService);
  private readonly tagsService = inject(TagsService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  protected url = '';
  protected title = '';
  protected alias = '';
  protected selectedCampaignId: number | null = null;
  protected selectedTags = signal<string[]>([]);
  protected tagInput = '';
  protected expirationType = signal<'never' | '24h' | '7d' | '30d' | 'custom'>('never');
  protected customExpiration = '';
  protected aliasChecking = signal(false);
  protected aliasAvailable = signal<boolean | null>(null);
  protected submitting = signal(false);
  protected errorMessage = signal('');
  protected campaigns = signal<Campaign[]>([]);

  private readonly aliasSubject = new Subject<string>();
  private aliasSub?: Subscription;

  protected previewShortUrl(): string {
    const base = 'http://localhost:3000';
    const alias = this.alias || 'abcdef';
    return `${base}/${alias}`;
  }

  ngOnInit() {
    this.loadCampaigns();
    this.aliasSub = this.aliasSubject.pipe(
      debounceTime(400),
      distinctUntilChanged()
    ).subscribe(async alias => {
      if (!alias || alias.length < 3) {
        this.aliasAvailable.set(null);
        this.aliasChecking.set(false);
        return;
      }
      this.aliasChecking.set(true);
      try {
        const res = await this.linksService.checkAlias(alias).toPromise();
        this.aliasAvailable.set(res?.data?.available ?? true);
      } catch {
        this.aliasAvailable.set(null);
      } finally {
        this.aliasChecking.set(false);
      }
    });
  }

  private async loadCampaigns() {
    try {
      const res = await this.campaignsService.getAll().toPromise();
      if (res?.data) this.campaigns.set(res.data);
    } catch {}
  }

  protected onAliasChange() {
    this.aliasAvailable.set(null);
    this.aliasChecking.set(true);
    this.aliasSubject.next(this.alias);
  }

  protected addTag(event: Event) {
    event.preventDefault();
    const value = this.tagInput.trim().replace(/,/g, '');
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

  protected getExpiresAt(): string | undefined {
    switch (this.expirationType()) {
      case '24h': return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      case '7d': return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      case '30d': return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      case 'custom': return this.customExpiration ? new Date(this.customExpiration).toISOString() : undefined;
      default: return undefined;
    }
  }

  protected async onSubmit() {
    if (!this.url) {
      this.errorMessage.set('Destination URL is required');
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set('');

    try {
      const data: CreateLinkData = {
        destinationUrl: this.url,
        title: this.title || undefined,
        alias: this.alias || undefined,
        campaignId: this.selectedCampaignId ?? undefined,
        tags: this.selectedTags().length > 0 ? this.selectedTags() : undefined,
        expiresAt: this.getExpiresAt()
      };
      const res = await this.linksService.create(data).toPromise();
      if (res?.data) {
        this.toast.success('Link created successfully');
        await this.router.navigate(['/links', res.data.id]);
      }
    } catch (err: any) {
      this.errorMessage.set(err?.error?.message || 'Failed to create link');
    } finally {
      this.submitting.set(false);
    }
  }
}
