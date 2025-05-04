import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService, User } from '../../services/user.service';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { UserFormComponent } from '../user-form/user-form.component';
import { UserPasswordComponent } from '../user-password/user-password.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatToolbarModule,
    MatCardModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatDialogModule,
    MatSnackBarModule,
    SidebarComponent
  ]
})
export class UserComponent implements OnInit {
  dataSource = new MatTableDataSource<User>([]);
  displayedColumns: string[] = ['id', 'name', 'email', 'role', 'actions'];
  sidebarCollapsed = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private userService: UserService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.getUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async getUsers(): Promise<void> {
    try {
      const users = await firstValueFrom(this.userService.getUsers());
      this.dataSource.data = users;
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  }

  async createUser(): Promise<void> {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '400px',
      data: { user: new User('', '', '', ''), isEdit: false }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await firstValueFrom(this.userService.createUser(result));
          await this.getUsers();
          this.snackBar.open('Usuário criado com sucesso', 'Fechar', { duration: 3000 });
        } catch (error: any) {
          const errorMsg = error.error.message || 'Erro ao criar usuário';
          console.log(error.error);
          this.snackBar.open(errorMsg, 'Fechar', { duration: 5000, panelClass: 'error-snackbar' });
          console.error('Error creating user:', error);
        }
      }
    });
  }

  async updatePassword(id: number): Promise<void> {
    const dialogRef = this.dialog.open(UserPasswordComponent, {
      width: '400px',
      data: { userId: id }
    });

    dialogRef.afterClosed().subscribe(async (user) => {
      if (user) {
        try {
          await firstValueFrom(this.userService.updatePassword(user.userId, user.newPassword));
          this.snackBar.open('Senha atualizada com sucesso', 'Fechar', { duration: 3000 });
        } catch (error: any) {
          const errorMsg = error.error?.message || 'Erro ao atualizar senha';
          this.snackBar.open(errorMsg, 'Fechar', { duration: 5000, panelClass: 'error-snackbar' });
          console.error('Error updating password:', error);
        }
      }
    });
  }

  updateUser(user: User): void {
    const dialogRef = this.dialog.open(UserFormComponent, {
      width: '400px',
      data: { user: user, isEdit: true }
    });

    dialogRef.afterClosed().subscribe(async (result) => {
      if (result) {
        try {
          await firstValueFrom(this.userService.updateUser(result));
          await this.getUsers(); // Refresh the users list
          this.snackBar.open('Usuário atualizado com sucesso', 'Fechar', { duration: 3000 });
        } catch (error: any) {
          const errorMsg = error.error?.message || 'Erro ao atualizar usuário';
          this.snackBar.open(errorMsg, 'Fechar', { duration: 5000, panelClass: 'error-snackbar' });
          console.error('Error updating user:', error);
        }
      }
    });
  }

  async deleteUser(id: number): Promise<void> {
    try {
      await firstValueFrom(this.userService.deleteUser(id));
      await this.getUsers();
      this.snackBar.open('Usuário excluído com sucesso', 'Fechar', { duration: 3000 });
    } catch (error: any) {
      const errorMsg = error.error?.message || 'Erro ao excluir usuário';
      this.snackBar.open(errorMsg, 'Fechar', { duration: 5000, panelClass: 'error-snackbar' });
      console.error('Error deleting user:', error);
    }
  }

  onSidebarCollapseChange(collapsed: boolean): void {
    this.sidebarCollapsed = collapsed;
  }
}