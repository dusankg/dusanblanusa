import { Component, ElementRef, HostListener, OnDestroy, ViewChild } from '@angular/core';
import { ThemeService } from '../shared/theme.service';

interface Photograph {
  readonly src: string;
  readonly width: number;
  readonly height: number;
}

@Component({
  selector: 'app-photography',
  standalone: false,
  templateUrl: './photography.component.html',
  styleUrls: ['./photography.component.css']
})
export class PhotographyComponent implements OnDestroy {
  slikaZaPrikaz = '';
  // Intrinsic dimensions of the Flickr Large 2048 (_k) images.
  readonly nizSlika: readonly Photograph[] = [
    { src: 'https://live.staticflickr.com/65535/52781083167_781786c092_k.jpg', width: 1367, height: 2048 },
    { src: 'https://live.staticflickr.com/65535/52781867289_16bcac7145_k.jpg', width: 1367, height: 2048 },
    { src: 'https://live.staticflickr.com/65535/52782029155_7196164cb7_k.jpg', width: 1367, height: 2048 },
    { src: 'https://live.staticflickr.com/65535/52781076627_433eadf783_k.jpg', width: 1367, height: 2048 },
    { src: 'https://live.staticflickr.com/65535/52782159473_4289a18955_k.jpg', width: 1367, height: 2048 },
    { src: 'https://live.staticflickr.com/65535/52781865994_f618edb035_k.jpg', width: 1638, height: 2048 },
    { src: 'https://live.staticflickr.com/65535/52782084893_5a9aead4af_k.jpg', width: 2048, height: 2048 },
    { src: 'https://live.staticflickr.com/65535/52782088103_df4f4f9b0a_k.jpg', width: 2048, height: 1367 },
    { src: 'https://live.staticflickr.com/65535/52781622366_ca06d75645_k.jpg', width: 2048, height: 1367 },
    { src: 'https://live.staticflickr.com/65535/52781868419_30742053db_k.jpg', width: 2048, height: 1367 }
  ];
  readonly photoRows = [
    this.nizSlika.slice(0, 4),
    this.nizSlika.slice(4, 7),
    this.nizSlika.slice(7)
  ];
  hiddenBigImage = true;
  activeImageIndex = 0;
  private thumbnailFocus: HTMLElement | null = null;

  @ViewChild('lightboxPanel') private lightboxPanel?: ElementRef<HTMLElement>;

  @ViewChild('closeControl') set closeControl(control: ElementRef<HTMLButtonElement> | undefined) {
    control?.nativeElement.focus({ preventScroll: true });
  }

  constructor(readonly themeService: ThemeService) {}

  showImage(image: string, index: number): void {
    this.thumbnailFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    this.slikaZaPrikaz = image;
    this.activeImageIndex = index;
    this.hiddenBigImage = false;
    document.body.style.overflow = 'hidden';
  }

  nextImage(): void {
    this.activeImageIndex = (this.activeImageIndex + 1) % this.nizSlika.length;
    this.slikaZaPrikaz = this.nizSlika[this.activeImageIndex].src;
  }

  previousImage(): void {
    this.activeImageIndex = (this.activeImageIndex - 1 + this.nizSlika.length) % this.nizSlika.length;
    this.slikaZaPrikaz = this.nizSlika[this.activeImageIndex].src;
  }

  closeBigImage(): void {
    this.hiddenBigImage = true;
    document.body.style.removeProperty('overflow');
    // Remove inert before restoring focus; Angular updates the binding on the next render.
    this.thumbnailFocus?.closest('[inert]')?.removeAttribute('inert');
    this.thumbnailFocus?.focus({ preventScroll: true });
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (this.hiddenBigImage) return;
    if (event.key === 'Escape') this.closeBigImage();
    if (event.key === 'ArrowLeft') this.previousImage();
    if (event.key === 'ArrowRight') this.nextImage();
    if (event.key === 'Tab') {
      const controls = this.lightboxPanel?.nativeElement.querySelectorAll<HTMLButtonElement>('button');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }
  }

  ngOnDestroy(): void {
    document.body.style.removeProperty('overflow');
  }
}
