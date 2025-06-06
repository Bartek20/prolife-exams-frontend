import { Component } from '@angular/core';
import {FormsModule} from '@angular/forms';
import {TeacherService} from '../../../services/teacher.service';
import {Router} from '@angular/router';
import {ButtonComponent} from '../../../components/button/button.component';

@Component({
  selector: 'app-authorize',
  imports: [
    FormsModule,
    ButtonComponent
  ],
  templateUrl: './authorize.component.html',
  styleUrl: './authorize.component.scss'
})
export class AuthorizeComponent {
  email: string = '';
  password: string = '';
  isLoading = false;
  error?: string;

  constructor(private teacherService: TeacherService, private router: Router) {
  }

  checkEmail() {
    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.email);
  }

  login() {
    this.error = undefined;

    if (!this.email || !this.password) {
      this.error = 'Wszystkie pola są wymagane';
      return;
    }
    if (!this.checkEmail()) {
      this.error = 'Podany adres email jest nieprawidłowy';
      return;
    }

    this.isLoading = true;
    this.teacherService.authorize(this.email, this.password).subscribe({
      error: () => {
        this.isLoading = false;
        this.error = 'Podane dane są nieprawidłowe';
      }
    })
  }
}
