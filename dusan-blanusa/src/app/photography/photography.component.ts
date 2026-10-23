import { Component, HostListener, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-photography',
  standalone: false,
  templateUrl: './photography.component.html',
  styleUrls: ['./photography.component.css']
})
export class PhotographyComponent implements OnDestroy {
  slikaZaPrikaz = '';
  readonly nizSlika: readonly string[] = [
  'https://live.staticflickr.com/65535/52781083167_781786c092_k.jpg', 
  'https://live.staticflickr.com/65535/52781867289_16bcac7145_k.jpg',
  'https://live.staticflickr.com/65535/52782029155_7196164cb7_k.jpg',
  'https://live.staticflickr.com/65535/52781076627_433eadf783_k.jpg',
  'https://live.staticflickr.com/65535/52782159473_4289a18955_k.jpg',
  'https://live.staticflickr.com/65535/52781865994_f618edb035_k.jpg',
  'https://live.staticflickr.com/65535/52782084893_5a9aead4af_k.jpg',
  'https://live.staticflickr.com/65535/52782088103_df4f4f9b0a_k.jpg',
  'https://live.staticflickr.com/65535/52781622366_ca06d75645_k.jpg',
  'https://live.staticflickr.com/65535/52781868419_30742053db_k.jpg']
  hiddenBigImage = true;
  activeImageIndex = 0;



  showImage(image: string, index: number): void {
    this.slikaZaPrikaz = image;
    this.activeImageIndex = index;
    this.hiddenBigImage = false;
    document.body.style.overflow = 'hidden';
  }

  nextImage(): void {
    this.activeImageIndex = (this.activeImageIndex + 1) % this.nizSlika.length;
    this.slikaZaPrikaz = this.nizSlika[this.activeImageIndex];
  }

  previousImage(): void {
    this.activeImageIndex = (this.activeImageIndex - 1 + this.nizSlika.length) % this.nizSlika.length;
    this.slikaZaPrikaz = this.nizSlika[this.activeImageIndex];
  }

  closeBigImage(): void {
    this.hiddenBigImage = true;
    document.body.style.removeProperty('overflow');
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    if (this.hiddenBigImage) return;
    if (event.key === 'Escape') this.closeBigImage();
    if (event.key === 'ArrowLeft') this.previousImage();
    if (event.key === 'ArrowRight') this.nextImage();
  }

  ngOnDestroy(): void {
    document.body.style.removeProperty('overflow');
  }
}
