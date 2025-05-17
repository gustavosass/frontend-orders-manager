import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-user-password',
  templateUrl: './user-password.component.html',
  styleUrls: ['./user-password.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class UserPasswordComponent {
  newPassword: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UserPasswordComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { userId: number },
    private snackBar: MatSnackBar
  ) { }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.newPassword !== this.confirmPassword) {
      this.snackBar.open('As senhas não coincidem', 'Fechar', { duration: 3000 });
      return;
    }

    this.dialogRef.close({
      userId: this.data.userId,
      newPassword: this.newPassword
    });
  }
}
