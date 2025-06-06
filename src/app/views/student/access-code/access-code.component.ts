import {Component, Input, OnInit} from '@angular/core';
import {ExamService} from "../../../services/exam.service";
import {FormsModule} from '@angular/forms';
import {Router} from '@angular/router';

import {NgClass} from '@angular/common';
import {PopupQuestionComponent} from '../../../components/popup-question/popup-question.component';
import {ButtonComponent} from '../../../components/button/button.component';
import {AutoFocus} from 'primeng/autofocus';
import {Button} from 'primeng/button';
import {Message} from 'primeng/message';
import {InputText} from 'primeng/inputtext';
import {Card} from 'primeng/card';
import {FloatLabel} from 'primeng/floatlabel';

@Component({
  selector: 'app-access-code',
  imports: [
    FormsModule,
    NgClass,
    AutoFocus,
    Button,
    Message,
    InputText,
    Card,
    FloatLabel
  ],
  templateUrl: './access-code.component.html',
  styleUrl: './access-code.component.scss'
})
export class AccessCodeComponent implements OnInit {
  constructor(private examService: ExamService) {}
  @Input() access_code: string = '';

  isLoading = false;
  errorMessage?: string = undefined;

  fetchConfig() {
    this.isLoading = true;
    this.examService.getExamConfig(this.access_code!.trim()).subscribe({
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Podany kod nie jest poprawny';
      }
    })
  }

  getExamConfig() {
    if (this.isLoading) return;
    this.errorMessage = undefined;
    this.access_code = this.access_code?.trim();
    if (!this.access_code) {
      this.errorMessage = 'Kod dostępu jest wymagany';
      return;
    }
    if (!/^[a-zA-Z]*$/.test(this.access_code)) {
      this.errorMessage = 'Kod dostępu musi składać się z tylko liter';
      return;
    }
    if (this.access_code != 'DEMO' && this.access_code.length < 12) {
      this.errorMessage = 'Kod dostępu musi składać się z co najmniej 12 liter';
      return;
    }
    this.fetchConfig();
  }

  ngOnInit() {
    if (this.access_code) {
      this.getExamConfig();
    }
  }
}
