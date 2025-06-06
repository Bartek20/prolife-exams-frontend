import {Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges} from '@angular/core';
import {Question} from '../../types';
import {NgClass} from '@angular/common';
import {ExamService} from '../../services/exam.service';
import {ResultsService} from '../../services/results.service';
import {Observable} from 'rxjs';
import {Panel} from 'primeng/panel';
import {Message} from 'primeng/message';
import {Image} from 'primeng/image';

type MaybeNull = string | null;

@Component({
  selector: 'app-question',
  imports: [
    NgClass,
    Panel,
    Message,
    Image,
  ],
  templateUrl: './question.component.html',
  styleUrl: './question.component.scss'
})
export class QuestionComponent implements OnInit, OnChanges {
  @Input({ required: true }) mode: 'exam' | 'review' = 'exam';
  @Input({ required: true }) question!: Question;
  @Output() answer = new EventEmitter<number>();
  selectedAnswer: number = -1;
  images: {
    question: MaybeNull;
    options: MaybeNull[];
  } = {
    'question': null,
    'options': []
  }

  constructor() {}

  numberToLetter(num: number) {
    if (num < 1) return '';

    let result = '';
    while (num > 0) {
      num--;
      const charCode = (num % 26) + 65;
      result = String.fromCharCode(charCode) + result;
      num = Math.floor(num / 26);
    }

    return result;
  }

  changeAnswer(answer: number) {
    if (this.mode === 'review') return;
    this.selectedAnswer = answer;
    this.answer.emit(answer);
  }

  init() {
    this.selectedAnswer = this.question.answer;
    if (this.question.images) {
      this.images.question = this.question.images.question || null;
    }
  }

  ngOnInit() {
    this.init()
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes['question']) {
      this.init()
    }
  }
}
