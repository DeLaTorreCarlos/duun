import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { EVENTS, ShowEvent } from '../events';

@Component({
  selector: 'app-show-detail',
  templateUrl: './show-detail.component.html',
  styleUrl: './show-detail.component.css'
})
export class ShowDetailComponent implements OnInit {
  event?: ShowEvent;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.event = EVENTS.find(e => e.id === id);
    if (!this.event) {
      this.router.navigate(['/shows']);
    }
  }
}
