import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EVENTS, ShowEvent } from '../events';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  event?: ShowEvent;
  name = '';
  email = '';
  purchased = false;
  loading = false;
  error = '';

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.event = EVENTS.find(e => e.id === id);
    if (!this.event) {
      this.router.navigate(['/shows']);
      return;
    }
    // Retorno desde Clip tras pago exitoso
    const status = this.route.snapshot.queryParamMap.get('status');
    if (status === 'success') {
      this.purchased = true;
    } else if (status === 'error') {
      this.error = 'El pago no se pudo completar. Intenta de nuevo.';
    }
  }

  get emailValid(): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email);
  }

  async buy(): Promise<void> {
    if (!this.event || !this.emailValid || this.loading) {
      return;
    }
    this.loading = true;
    this.error = '';
    try {
      const res = await fetch('/api/createCheckout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId: this.event.id, name: this.name, email: this.email })
      });
      if (!res.ok) {
        throw new Error('createCheckout failed');
      }
      const { paymentUrl } = await res.json();
      window.location.href = paymentUrl;
    } catch {
      this.error = 'No se pudo iniciar el pago. Intenta de nuevo en unos minutos.';
      this.loading = false;
    }
  }
}
