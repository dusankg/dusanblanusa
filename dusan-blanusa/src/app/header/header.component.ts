import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
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
  isMobileNavigation = false;
  private scrollHandler?: () => void;
  private resizeHandler?: () => void;

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
      this.resizeHandler = () => {
        const isMobileNavigation = window.innerWidth <= 860;
        if (isMobileNavigation === this.isMobileNavigation) {
          return;
        }
        this.zone.run(() => {
          this.isMobileNavigation = isMobileNavigation;
          if (!isMobileNavigation && this.menuOpen) {
            this.menuOpen = false;
          }
          this.syncMenuState();
        });
      };
      window.addEventListener('resize', this.resizeHandler, { passive: true });
      this.scrollHandler();
      this.resizeHandler();
    });
  }

  @HostListener('document:keydown.escape')
  closeMenuOnEscape(): void {
    this.closeMenu();
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    this.syncMenuState();
  }

  closeMenu(): void {
    if (!this.menuOpen) {
      return;
    }
    this.menuOpen = false;
    this.syncMenuState();
  }

  toggleTheme(): void {
    this.themeService.toggle();
  }

  ngOnDestroy(): void {
    if (this.scrollHandler && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('scroll', this.scrollHandler);
    }
    if (this.resizeHandler && isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.resizeHandler);
    }
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.remove('mobile-menu-open');
    }
  }

  private syncMenuState(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.classList.toggle('mobile-menu-open', this.menuOpen && window.innerWidth <= 860);
    }
  }
}
