import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-tickets-modal',
  templateUrl: './tickets-modal.component.html',
  styleUrl: './tickets-modal.component.css'
})
export class TicketsModalComponent {
  safeUrl: SafeResourceUrl | null = null;
  rawUrl: string | null = null;

  @Input() set url(value: string | null) {
    this.rawUrl = value;
    this.safeUrl = value ? this.sanitizer.bypassSecurityTrustResourceUrl(value) : null;
  }

  @Output() closed = new EventEmitter<void>();

  constructor(private sanitizer: DomSanitizer) {}
}
