import { AfterViewInit, Component, ElementRef, ViewChild, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements AfterViewInit {
  @ViewChild('myModel', { static: true }) model!: ElementRef;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngAfterViewInit() {
    // Only run in browser, not during SSR
    if (isPlatformBrowser(this.platformId)) {
      const mv = this.model.nativeElement;

      // Center of the screen (for reference)
      const centerX = window.innerWidth / 2;

      window.addEventListener('mousemove', (e: MouseEvent) => {
        const offsetX = e.clientX - centerX;

        // Adjust rotation speed
        const rotation = offsetX * 0.002; // tweak multiplier for sensitivity

        // Update camera orbit: azimuthal angle, polar angle, radius
        mv.cameraOrbit = `${rotation}rad 75deg 2.5m`;
        mv.jumpCameraToGoal();
      });
    }
  }
}