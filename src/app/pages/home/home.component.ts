import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { EVENTS, ShowEvent } from '../shows/events';
import { EventbriteService } from '../shows/eventbrite.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit, OnDestroy {
  @ViewChild('espacioSec') espacioSec!: ElementRef<HTMLElement>;
  @ViewChild('lemaTxt') lemaTxt!: ElementRef<HTMLElement>;
  @ViewChild('lemaCur') lemaCur!: ElementRef<HTMLElement>;

  events: ShowEvent[] = EVENTS;

  private io?: IntersectionObserver;
  private onScroll?: () => void;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private eventbrite: EventbriteService
  ) {}

  openTickets(event: ShowEvent): void {
    this.eventbrite.openTickets(event);
  }

  ngAfterViewInit() {
    // Only run in browser, not during SSR
    if (!isPlatformBrowser(this.platformId)) return;

    this.eventbrite.setupWidgets(this.events);

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.typewriter(reduce);

    const sec = this.espacioSec?.nativeElement;
    if (!sec) return;

    const reduce2 = reduce;
    const marcos = Array.from(sec.querySelectorAll<HTMLElement>('.marco'));

    // Revelado al hacer scroll (progresivo: sin JS/observer las fotos quedan visibles)
    if ('IntersectionObserver' in window && !reduce2) {
      sec.classList.add('anim');
      this.io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('vista');
          this.io!.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
      marcos.forEach((m) => this.io!.observe(m));
    }

    // Parallax sutil en la galería (solo desktop)
    const panes = Array.from(sec.querySelectorAll<HTMLElement>('.pan'));
    const fino = window.matchMedia('(min-width: 761px)').matches;
    if (panes.length && !reduce2 && fino) {
      let pendiente = false;
      const pinta = () => {
        const vh = window.innerHeight;
        panes.forEach((p) => {
          const r = (p.parentNode as HTMLElement).getBoundingClientRect();
          if (r.bottom < -200 || r.top > vh + 200) return;
          const centro = (r.top + r.height / 2 - vh / 2) / vh;
          p.style.transform = `translate3d(0, ${(centro * -22).toFixed(2)}px, 0)`;
        });
        pendiente = false;
      };
      this.onScroll = () => {
        if (!pendiente) {
          pendiente = true;
          requestAnimationFrame(pinta);
        }
      };
      window.addEventListener('scroll', this.onScroll, { passive: true });
      window.addEventListener('resize', this.onScroll);
      pinta();
    }
  }

  // Lema con efecto máquina de escribir (progresivo: sin JS el texto ya es visible)
  private typewriter(reduce: boolean) {
    const txtEl = this.lemaTxt?.nativeElement;
    const cur = this.lemaCur?.nativeElement;
    if (!txtEl || !cur || reduce) return;

    const TXT = txtEl.getAttribute('data-txt') || txtEl.textContent || '';
    txtEl.textContent = '';
    cur.hidden = false;
    let i = 0;
    const paso = () => {
      if (i > TXT.length) { cur.classList.add('fin'); return; }
      txtEl.textContent = TXT.slice(0, i);
      const ch = TXT[i - 1] || '';
      let d = 34 + Math.random() * 46;
      if (ch === '.' || ch === ',') d += 340;
      else if (ch === ' ') d += 40;
      i++;
      setTimeout(paso, d);
    };
    setTimeout(paso, 1200);
  }

  ngOnDestroy() {
    this.io?.disconnect();
    if (this.onScroll) {
      window.removeEventListener('scroll', this.onScroll);
      window.removeEventListener('resize', this.onScroll);
    }
  }
}