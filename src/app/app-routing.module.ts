import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AboutComponent } from './pages/about/about.component';
import { ContactComponent } from './pages/contact/contact.component';
import { HomeComponent } from './pages/home/home.component';
import { MusicComponent } from './pages/music/music.component';
import { ShowsComponent } from './pages/shows/shows.component';
import { ShowDetailComponent } from './pages/shows/show-detail/show-detail.component';
import { CheckoutComponent } from './pages/shows/checkout/checkout.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  { path: 'music', component: MusicComponent },
  { path: 'shows', component: ShowsComponent },
  { path: 'shows/:id', component: ShowDetailComponent },
  { path: 'shows/:id/checkout', component: CheckoutComponent },
  { path: 'contact', component: ContactComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'top',
    anchorScrolling: 'enabled'
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
