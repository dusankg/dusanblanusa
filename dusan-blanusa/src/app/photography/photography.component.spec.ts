import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { PhotographyComponent } from './photography.component';
import { ThemeService } from '../shared/theme.service';

describe('PhotographyComponent', () => {
  let component: PhotographyComponent;
  let fixture: ComponentFixture<PhotographyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PhotographyComponent ],
      providers: [{
        provide: ThemeService,
        useValue: {
          isDark: signal(false),
          toggle() { this.isDark.update(value => !value); }
        }
      }]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotographyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('reserves each thumbnail at its intrinsic ratio and preserves lazy loading', () => {
    const tiles: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.photo-tile');
    expect(tiles.length).toBe(10);
    component.nizSlika.forEach((photo, index) => {
      const image = tiles[index].querySelector('img')!;
      expect(image.getAttribute('src')).toBe(photo.src);
      expect(image.getAttribute('width')).toBe(String(photo.width));
      expect(image.getAttribute('height')).toBe(String(photo.height));
      expect(image.loading).toBe('lazy');
      expect(tiles[index].style.aspectRatio).toBe(`${photo.width} / ${photo.height}`);
      expect(tiles[index].classList.contains('portrait')).toBe(photo.height > photo.width);
    });
  });

  it('opens every thumbnail in sequence using the same full image', () => {
    const tiles: NodeListOf<HTMLButtonElement> = fixture.nativeElement.querySelectorAll('.photo-tile');
    for (let index = 0; index < tiles.length; index++) {
      tiles[index].click();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.lightbox-panel > img').getAttribute('src'))
        .toBe(component.nizSlika[index].src);
      expect(component.activeImageIndex).toBe(index);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('.lightbox')).toBeNull();
    }
  });

  it('keeps keyboard focus in the viewer and returns it to the thumbnail', () => {
    const tile: HTMLButtonElement = fixture.nativeElement.querySelector('.photo-tile');
    tile.focus();
    tile.click();
    fixture.detectChanges();
    const close: HTMLButtonElement = fixture.nativeElement.querySelector('.close-control');
    const next: HTMLButtonElement = fixture.nativeElement.querySelector('[aria-label="Show next photograph"]');
    expect(document.activeElement).toBe(close);
    expect(fixture.nativeElement.querySelector('main').hasAttribute('inert')).toBeTrue();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', shiftKey: true }));
    expect(document.activeElement).toBe(next);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab' }));
    expect(document.activeElement).toBe(close);
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(tile);
    expect(fixture.nativeElement.querySelector('main').hasAttribute('inert')).toBeFalse();
  });

  it('uses the shared theme control and leaves thumbnails caption-free', () => {
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.theme-toggle');
    expect(toggle.getAttribute('aria-label')).toBe('Switch to dark theme');
    toggle.click();
    fixture.detectChanges();
    expect(toggle.getAttribute('aria-label')).toBe('Switch to light theme');
    expect(toggle.getAttribute('aria-pressed')).toBe('true');
    fixture.nativeElement.querySelectorAll('.photo-tile').forEach((tile: HTMLElement) => {
      expect(tile.textContent!.trim()).toBe('');
    });
  });

  it('preserves lightbox navigation and wrapping', () => {
    component.showImage(component.nizSlika[0].src, 0);
    component.previousImage();
    expect(component.slikaZaPrikaz).toBe(component.nizSlika[9].src);
    component.nextImage();
    expect(component.slikaZaPrikaz).toBe(component.nizSlika[0].src);
    component.closeBigImage();
    expect(document.body.style.overflow).toBe('');
  });

  it('keeps full frames, aligned rows and a contained lightbox across sizes and themes', () => {
    fixture.nativeElement.querySelector('.photo-tile').click();
    fixture.detectChanges();
    const frame = document.createElement('iframe');
    frame.height = '900';
    frame.style.border = '0';
    document.body.appendChild(frame);
    try {
      const doc = frame.contentDocument!;
      // Copy loaded CSS synchronously so assertions cannot pass before styles arrive.
      Array.from(document.styleSheets).forEach(sheet => {
        const style = doc.createElement('style');
        style.textContent = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        doc.head.appendChild(style);
      });
      doc.body.appendChild(fixture.nativeElement.cloneNode(true));
      for (const theme of ['light', 'dark']) {
        doc.documentElement.dataset['theme'] = theme;
        for (const width of [1440, 1024, 768, 560, 390, 320]) {
          frame.width = String(width);
          const tiles = Array.from(doc.querySelectorAll<HTMLElement>('.photo-tile'));
          const rects = tiles.map(tile => tile.getBoundingClientRect());
          const view = frame.contentWindow!;
          expect(view.getComputedStyle(doc.querySelector('main')!).backgroundColor)
            .toBe(theme === 'light' ? 'rgb(244, 243, 242)' : 'rgb(17, 21, 18)');
          expect(doc.documentElement.scrollWidth).withContext(`overflow at ${width}`).toBeLessThanOrEqual(width);
          rects.forEach((rect, index) => {
            const photo = component.nizSlika[index];
            const image = tiles[index].querySelector('img')!;
            expect(view.getComputedStyle(image).objectFit).toBe('contain');
            expect(rect.width).toBeGreaterThan(0);
            expect(Math.abs(rect.width / rect.height - photo.width / photo.height))
              .withContext(`photo ${index + 1} at ${width}`).toBeLessThan(0.01);
            rects.slice(index + 1).forEach(other => {
              const overlap = rect.left < other.right - 1 && rect.right > other.left + 1
                && rect.top < other.bottom - 1 && rect.bottom > other.top + 1;
              expect(overlap).withContext(`overlap at ${width}`).toBeFalse();
            });
          });
          if (width > 900) {
            for (const row of Array.from(doc.querySelectorAll('.photo-row'))) {
              const rowRects = Array.from(row.children).map(tile => tile.getBoundingClientRect());
              rowRects.forEach((rect, index) => {
                expect(Math.abs(rect.top - rowRects[0].top)).toBeLessThan(1);
                expect(Math.abs(rect.bottom - rowRects[0].bottom)).toBeLessThan(1);
                if (index > 0) {
                  expect(rect.left - rowRects[index - 1].right).toBeLessThanOrEqual(25);
                }
              });
            }
            expect(rects[0].width).toBeLessThan(360);
          }
          const lightboxImage = doc.querySelector<HTMLImageElement>('.lightbox-panel > img')!;
          expect(view.getComputedStyle(lightboxImage).objectFit).toBe('contain');
          for (const element of Array.from(doc.querySelectorAll<HTMLElement>('.lightbox-panel > img, .lightbox button'))) {
            const rect = element.getBoundingClientRect();
            expect(rect.left).toBeGreaterThanOrEqual(0);
            expect(rect.right).toBeLessThanOrEqual(width);
            expect(rect.top).toBeGreaterThanOrEqual(0);
            expect(rect.bottom).toBeLessThanOrEqual(900);
          }
        }
      }
    } finally {
      frame.remove();
      component.closeBigImage();
    }
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
