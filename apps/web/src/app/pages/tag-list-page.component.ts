import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TagsService, Tag } from '../services/tags.service';
import { ToastService } from '../services/toast.service';
import { TagPillComponent } from '../shared/tag-pill.component';
import { LoadingSkeletonComponent } from '../shared/loading-skeleton.component';
import { EmptyStateComponent } from '../shared/empty-state.component';
import { ConfirmModalComponent } from '../shared/confirm-modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tag-list-page',
  standalone: true,
  imports: [RouterLink, TagPillComponent, LoadingSkeletonComponent, EmptyStateComponent, ConfirmModalComponent, FormsModule, DatePipe],
  template: `
    <div class="page-header">
      <div>
        <h1 class="page-title">Tags</h1>
        <p class="page-subtitle">Categorize and filter your links</p>
      </div>
      <button class="btn btn-primary" (click)="showCreateModal.set(true)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        New Tag
      </button>
    </div>

    @if (loading()) {
      <app-loading-skeleton [items]="5" type="table-row" />
    } @else if (tags().length === 0) {
      <app-empty-state
        title="No tags yet"
        description="Create tags to organize your links."
        ctaLabel="Create tag"
        (ctaClick)="showCreateModal.set(true)"
      />
    } @else {
      <div class="table-container">
        <table>
          <thead>
            <tr><th>Tag</th><th>Links</th><th>Total Clicks</th><th>Created</th><th></th></tr>
          </thead>
          <tbody>
            @for (tag of tags(); track tag.id) {
              <tr>
                <td><app-tag-pill [name]="tag.name" [color]="tag.color" /></td>
                <td>{{ tag.linkCount }}</td>
                <td>{{ tag.totalClicks }}</td>
                <td>{{ tag.createdAt | date:'mediumDate' }}</td>
                <td>
                  <div style="display: flex; gap: 4px;">
                    <button class="btn btn-ghost" style="padding: 4px 8px;" (click)="startEdit(tag)" title="Edit">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button class="btn btn-ghost" style="padding: 4px 8px; color: var(--color-danger);" (click)="confirmDelete(tag)" title="Delete">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    }

    <!-- Create Tag Modal -->
    @if (showCreateModal()) {
      <div class="modal-overlay" (click)="showCreateModal.set(false)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Create Tag</h3>
            <button class="modal-close" (click)="showCreateModal.set(false)">&times;</button>
          </div>
          <div class="modal-form">
            <div class="form-group">
              <label class="form-label">Tag Name</label>
              <input class="input" [(ngModel)]="editName" name="createName" placeholder="e.g., marketing" />
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="showCreateModal.set(false)">Cancel</button>
              <button class="btn btn-primary" (click)="createTag()" [disabled]="!editName.trim()">Create</button>
            </div>
          </div>
        </div>
      </div>
    }

    <!-- Edit Tag Modal -->
    @if (editingTag(); as tag) {
      <div class="modal-overlay" (click)="editingTag.set(null)">
        <div class="modal" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3 class="modal-title">Edit Tag</h3>
            <button class="modal-close" (click)="editingTag.set(null)">&times;</button>
          </div>
          <div class="modal-form">
            <div class="form-group">
              <label class="form-label">Tag Name</label>
              <input class="input" [(ngModel)]="editName" name="editName" />
            </div>
            <div class="form-group">
              <label class="form-label">Color</label>
              <input class="input" type="color" [(ngModel)]="editColor" name="editColor" />
            </div>
            <div class="modal-actions">
              <button class="btn btn-secondary" (click)="editingTag.set(null)">Cancel</button>
              <button class="btn btn-primary" (click)="updateTag()" [disabled]="!editName.trim()">Save</button>
            </div>
          </div>
        </div>
      </div>
    }

    <app-confirm-modal
      [visible]="deleteTagId() !== null"
      title="Delete Tag"
      message="Are you sure you want to delete this tag? Links with this tag will not be deleted."
      confirmLabel="Delete"
      [danger]="true"
      (confirm)="doDelete()"
      (cancel)="deleteTagId.set(null)"
    />
  `,
  styles: [`
    .form-group { display: flex; flex-direction: column; gap: 6px; }
    .form-label { font-size: 0.813rem; font-weight: 600; }
  `]
})
export class TagListPageComponent implements OnInit {
  private readonly tagsService = inject(TagsService);
  private readonly toast = inject(ToastService);

  protected tags = signal<Tag[]>([]);
  protected loading = signal(true);
  protected showCreateModal = signal(false);
  protected editingTag = signal<Tag | null>(null);
  protected deleteTagId = signal<number | null>(null);
  protected editName = '';
  protected editColor = '#E85D3A';

  ngOnInit() { this.load(); }

  private async load() {
    this.loading.set(true);
    try {
      const res = await this.tagsService.getAll().toPromise();
      if (res?.data) this.tags.set(res.data);
    } catch {} finally { this.loading.set(false); }
  }

  protected async createTag() {
    try {
      await this.tagsService.create({ name: this.editName.trim(), color: this.editColor }).toPromise();
      this.toast.success('Tag created');
      this.showCreateModal.set(false);
      this.editName = '';
      this.load();
    } catch {
      this.toast.error('Failed to create tag');
    }
  }

  protected startEdit(tag: Tag) {
    this.editingTag.set(tag);
    this.editName = tag.name;
    this.editColor = tag.color;
  }

  protected async updateTag() {
    const tag = this.editingTag();
    if (!tag) return;
    try {
      await this.tagsService.update(tag.id, { name: this.editName.trim(), color: this.editColor }).toPromise();
      this.toast.success('Tag updated');
      this.editingTag.set(null);
      this.load();
    } catch {
      this.toast.error('Failed to update tag');
    }
  }

  protected confirmDelete(tag: Tag) {
    this.deleteTagId.set(tag.id);
  }

  protected async doDelete() {
    const id = this.deleteTagId();
    if (id === null) return;
    try {
      await this.tagsService.delete(id).toPromise();
      this.toast.success('Tag deleted');
      this.deleteTagId.set(null);
      this.load();
    } catch {
      this.toast.error('Failed to delete tag');
    }
  }
}
