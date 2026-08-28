import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID, computed, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly storageKey = 'dusan-portfolio-theme';
  private readonly activeTheme = signal<Theme>('light');
  readonly isDark = computed(() => this.activeTheme() === 'dark');

  constructor(
    @Inject(DOCUMENT) private readonly document: Document,
    @Inject(PLATFORM_ID) platformId: object,
  ) {
    if (!isPlatformBrowser(platformId)) {
      return;
    }

    const storedTheme = this.readStoredTheme();
    const preferredTheme: Theme = storedTheme
      ?? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    this.applyTheme(preferredTheme, false);

    if (!storedTheme) {
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (event) => {
        if (!this.readStoredTheme()) {
          this.applyTheme(event.matches ? 'dark' : 'light', false);
        }
      });
    }
  }

  toggle(): void {
    this.applyTheme(this.isDark() ? 'light' : 'dark', true);
  }

  private applyTheme(theme: Theme, persist: boolean): void {
    this.activeTheme.set(theme);
    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.style.colorScheme = theme;
    this.document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#111512' : '#f4f5f0');

    if (persist) {
      try {
        localStorage.setItem(this.storageKey, theme);
      } catch {
        // The theme still works when storage is unavailable.
      }
    }
  }

  private readStoredTheme(): Theme | null {
    try {
      const theme = localStorage.getItem(this.storageKey);
      return theme === 'dark' || theme === 'light' ? theme : null;
    } catch {
      return null;
    }
  }
}
