import { Component, OnInit } from '@angular/core';
import { SidebarComponent } from "../sidebar/sidebar.component";
import { MatSidenav, MatSidenavContainer, MatSidenavContent } from '@angular/material/sidenav';
import { MatCard, MatCardContent, MatCardTitle } from '@angular/material/card';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButton } from '@angular/material/button';

interface configurationItems {
  label: string;
  route: string;
}

@Component({
  selector: 'app-configuration',
  imports: [SidebarComponent,
    MatSidenavContainer,
    MatSidenav,
    MatSidenavContent,
    MatCard,
    MatListModule,
    MatIconModule,
    RouterModule,
    CommonModule

  ],
  templateUrl: './configuration.component.html',
  styleUrl: './configuration.component.css'
})
export class ConfigurationComponent implements OnInit {
  email: string = '';
  isHandset: boolean = false;
  sidebarCollapsed = false;

  configurationItems: configurationItems[] = [
    { label: 'Cidade', route: '/cidade' },
    { label: 'Estado', route: '/estado' },
    { label: 'Pais', route: '/pais' }
  ];

  constructor(private breakpointObserver: BreakpointObserver) {
    this.configurationItems = this.configurationItems;
  }

  ngOnInit(): void {
    this.breakpointObserver.observe([Breakpoints.Handset]).subscribe(result => {
      this.isHandset = result.matches;
    });

    // Only access localStorage in browser context
    if (typeof window !== 'undefined' && window.localStorage) {
      this.email = localStorage.getItem('email') || '';
    }
  }
}
