import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { User } from '../../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.css']
})
export class UserFormComponent {
  user: User;
  isEdit: boolean;
  showPassword: boolean = false;
  isPasswordRequired: boolean = false;

  constructor(
    public dialogRef: MatDialogRef<UserFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User, isEdit: boolean }
  ) {
    this.user = new User(
      data.user.name,
      data.user.email,
      data.user.password,
      data.user.role,
      data.user.id
    );
    this.isEdit = data.isEdit;
    this.isPasswordRequired = !this.isEdit;
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSubmit(): void {
    if (this.isEdit) {
      const { name, email, id, role } = this.user;
      this.dialogRef.close({ name, email, id, role });

    } else {
      if (!this.user.name || !this.user.email || !this.user.password || !this.user.role) {
        return;
      }
      this.dialogRef.close(this.user);
    }
  }
}
