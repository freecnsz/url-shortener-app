import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { DashboardComponent } from './pages/dashboard/dashboard';
import { SidebarComponent } from './components/sidebar/sidebar';
import { LinkCardComponent } from './components/link-card/link-card';
import { FolderCardComponent } from './components/folder-card/folder-card';
import { DashboardService } from './services/dashboard.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    DashboardComponent,
    SidebarComponent,
    LinkCardComponent,
    FolderCardComponent
  ],
  providers: [DashboardService],
  exports: [DashboardComponent]
})
export class DashboardModule { }
