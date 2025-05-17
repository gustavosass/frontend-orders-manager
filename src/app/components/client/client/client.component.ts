import { Component, OnInit, ViewChild } from '@angular/core';
import { MatNativeDateModule } from '@angular/material/core';
import { CommonModule } from '@angular/common';
import { ClientService, ClientDTO } from '../../../services/client.service';
import { MatSidenavModule, MatDrawerContainer } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';
import { ClientFormComponent } from '../client-form/client-form.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';

@Component({
  selector: 'app-client',
  templateUrl: './client.component.html',
  styleUrls: ['./client.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatMenuModule,
    MatTooltipModule,
    SidebarComponent,
    MatNativeDateModule
  ]
})
export class ClientComponent implements OnInit {
  dataSource = new MatTableDataSource<ClientDTO>([]);
  displayedColumns: string[] = ['id', 'name', 'email', 'document', 'phone', 'actions'];
  sidebarCollapsed = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private clientService: ClientService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadClients();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadClients(): void {
    this.clientService.getClients().subscribe({
      next: (clients) => {
        this.dataSource.data = clients;
      },
      error: (error) => {
        console.error('Error loading clients:', error);
        this.snackBar.open('Erro ao carregar clientes', 'Fechar', {
          duration: 3000,
        });
      }
    });
  }

  createClient(): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '800px',
      data: { client: {} as ClientDTO, isEdit: false }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
      }
    });
  }

  updateClient(client: ClientDTO): void {
    const dialogRef = this.dialog.open(ClientFormComponent, {
      width: '800px',
      data: { client: { ...client }, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadClients();
      }
    });
  }

  deleteClient(id: number): void {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.clientService.deleteClient(id).subscribe({
        next: () => {
          this.snackBar.open('Cliente excluído com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.loadClients();
        },
        error: (error) => {
          console.error('Error deleting client:', error);
          this.snackBar.open('Erro ao excluir cliente', 'Fechar', {
            duration: 3000,
          });
        }
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
}
