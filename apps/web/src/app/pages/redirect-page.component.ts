import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { LinksService } from '../services/links.service';

@Component({
  selector: 'app-redirect-page',
  standalone: true,
  template: `
    <div style="min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--color-bg);">
      <div class="card" style="text-align: center; padding: 48px;">
        <div class="spinner" style="width: 32px; height: 32px; border-color: var(--color-primary) transparent; margin: 0 auto 16px;"></div>
        <p style="color: var(--color-text-muted);">Redirecting...</p>
      </div>
    </div>
  `
})
export class RedirectPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly linksService = inject(LinksService);

  ngOnInit() {
    const alias = this.route.snapshot.paramMap.get('alias');
    if (alias) {
      this.performRedirect(alias);
    }
  }

  private async performRedirect(alias: string) {
    try {
      const res = await this.linksService.redirect(alias).toPromise();
      if (res?.data?.destinationUrl) {
        window.location.href = res.data.destinationUrl;
      } else {
        window.location.href = '/404';
      }
    } catch {
      window.location.href = '/404';
    }
  }
}
