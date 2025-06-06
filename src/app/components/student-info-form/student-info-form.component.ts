import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule, ReactiveFormsModule} from "@angular/forms";
import {NgClass} from '@angular/common';
import {ButtonComponent} from '../button/button.component';

@Component({
  selector: 'app-student-info-form',
  imports: [
    ReactiveFormsModule,
    NgClass,
    FormsModule,
    ButtonComponent
  ],
  templateUrl: './student-info-form.component.html',
  styleUrl: './student-info-form.component.scss'
})
export class StudentInfoFormComponent {
  @Input() btnText = 'Rozpocznij egzamin'
  @Input() isLoading = false;
  @Output() submit = new EventEmitter<{
    name: string,
    surname: string,
    email: string
  }>()

  name = ''
  surname = ''
  email = ''

  nameError?: string = undefined
  surnameError?: string = undefined
  emailError?: string = undefined

  checkEmail() {
    return /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(this.email);
  }

  submitForm() {
    this.nameError = undefined;
    this.surnameError = undefined;
    this.emailError = undefined;

    if (!this.name || !this.surname || !this.email || !this.checkEmail()) {
      if (!this.name) this.nameError = 'Imię jest wymagane';
      if (!this.surname) this.surnameError = 'Nazwisko jest wymagane';
      if (!this.email) this.emailError = 'Email jest wymagany';
      else if (!this.checkEmail()) this.emailError = 'Niepoprawny adres email';
      return
    }

    this.submit.emit({
      name: this.name.trim(),
      surname: this.surname.trim(),
      email: this.email.trim()
    })
  }
}
