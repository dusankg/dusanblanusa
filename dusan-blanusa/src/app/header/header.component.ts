import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Inject,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ThemeService } from '../shared/theme.service';

interface NavItem {
  readonly label: string;
  readonly href: string;
}

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements AfterViewInit, OnDestroy {
  readonly navItems: readonly NavItem[] = [
    { label: 'About', href: '#about' },
    { label: 'Expertise', href: '#expertise' },
    { label: 'Selected Work', href: '#selected-work' },
    { label: 'Experience', href: '#experience' },
    { label: 'Contact', href: '#contact' },
  ];
  menuOpen = false;
  private scrollHandler?: () => void;

  constructor(
    readonly themeService: ThemeService,
    private readonly host: ElementRef<HTMLElement>,
    private readonly zone: NgZone,
    @Inject(PLATFORM_ID) private readonly platformId: object,
  ) {}

  ngAfterViewInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this.zone.runOutsideAngular(() => {
      this.scrollHandler = () => {
        this.host.nativeElement.classList.toggle('is-scrolled', window.scrollY > 24);
      };
      window.addEventListener('scroll', this.scrollHandler, { passive: true });
      this.scrollHandler();
    });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  ngOnDestroy(): void {
    if (this.scrollHandler && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
  }
}
