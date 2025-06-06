import { Component, Input } from '@angular/core';
import {Card} from 'primeng/card';

@Component({
  selector: 'app-result',
  imports: [
    Card
  ],
  templateUrl: './result.component.html',
  styleUrl: './result.component.scss'
})
export class ResultComponent {
  @Input() studentData = {
    name: '',
    surname: '',
    email: ''
  }
  @Input() examTiming = {
    start: '',
    end: '' as string | undefined,
  }
  @Input() examPoints = {
    correct: 0,
    incorrect: 0,
    empty: 0,
    total: 0,
    passing: 0,
  }

  formatDateTime(date: string) {
    return new Date(date).toLocaleString();
  }
  formatScore(score: number) {
    return Math.round(score * 100) / 100
  }
}
