import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToolbarComponent } from '../../shared/toolbar/toolbar.component';
import { FooterComponent } from '../../shared/footer/footer.component';
import { ManageBooksComponent } from './manage-books/manage-books.component';
import { ManageBookInstancesComponent } from './manage-book-instances/manage-book-instances.component';
import { ManageUsersComponent } from './manage-users/manage-users.component';
import { ManageOrdersComponent } from './manage-orders/manage-orders.component';

@Component({
  selector: 'app-manage-library',
  standalone: true,
  imports: [
    CommonModule,
    ToolbarComponent,
    FooterComponent,
    ManageBooksComponent,
    ManageBookInstancesComponent,
    ManageUsersComponent,
    ManageOrdersComponent,
  ],
  templateUrl: './manage-library.component.html',
  styleUrls: ['./manage-library.component.scss'],
})
export class ManageLibraryComponent {}
