import {Component, OnInit} from '@angular/core';
import {NavigationEnd, Router, RouterOutlet} from '@angular/router';

import { TemperChecker } from './utils/CheatingProtection';
import {HeaderComponent} from './components/views/header/header.component';
import {SidebarComponent} from './components/views/sidebar/sidebar.component';
import {FooterComponent} from './components/views/footer/footer.component';
import {NgToastModule, ToasterPosition} from 'ng-angular-popup';
import {SidebarService} from './services/sidebar.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent, NgToastModule],
  template: `
    <ng-toast [position]="ToasterPosition.TOP_RIGHT" />
    <app-header />
    <div class="content">
      <app-sidebar />
      <main>
        <router-outlet />
      </main>
      <app-footer />
    </div>`,
  styles: `
    .content {
      display: grid;
      overflow: hidden;
      width: 100%;
      grid-template-columns: auto 1fr;
      grid-template-rows: 1fr auto;
      height: calc(100% - var(--header-size));
      --header-size: 89px;
      @media (max-width: 600px) {
        --header-size: 73px;
      }
      @media (max-width: 1000px) {
        grid-template-columns: 1fr;
      }
      @media print {
        height: auto;
        grid-template-columns: 1fr;
      }
    }
    router-outlet {
      display: none;
    }`,
  providers: []
})
export class AppComponent implements OnInit {
  constructor(private router: Router, private sidebarService: SidebarService) {
  }

  ngOnInit() {
    new TemperChecker(this.router);
    this.router.events.subscribe((event) => {
      if (!(event instanceof NavigationEnd)) return
      const newRoute = event.urlAfterRedirects.split('?')[0].split('/')
      if (!newRoute) return;
      if (newRoute.includes('pytania')) {
        this.sidebarService.sidebarMode = 'exam';
        return
      }
      if (newRoute.includes('wyniki') && !newRoute.includes('wykladowca')) {
        this.sidebarService.sidebarMode = 'results';
        return
      }
      if (newRoute.includes('wykladowca') && !newRoute.includes('logowanie')) {
        this.sidebarService.sidebarMode = 'teacher.home';
        if (newRoute.includes('egzamin') && !newRoute.includes('utworz')) {
          this.sidebarService.sidebarMode = 'teacher.exam';
        }
        if (newRoute.includes('wyniki')) {
          this.sidebarService.sidebarMode = 'teacher.results';
        }
        return
      }
      this.sidebarService.sidebarMode = 'empty'
    })
  }

  protected readonly ToasterPosition = ToasterPosition;
}
