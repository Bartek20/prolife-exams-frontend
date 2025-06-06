import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {ExamService} from '../../../services/exam.service';
import {ButtonComponent} from '../../button/button.component';
import {StorageService} from '../../../services/storage.service';

@Component({
  selector: 'app-header',
  imports: [
    ButtonComponent
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  constructor(private storage: StorageService, protected examService: ExamService, private router: Router) {}

  isLoading = false;
  exitExam() {
    this.isLoading = true;
    this.storage.accessCode = null;
    this.router.navigate(['/kod-dostepu']).then(() => {
      this.examService.examConfig = null;
      this.examService.examState = null;
      this.examService.appState = {
        headerType: 'normal',
        clockText: undefined,
        currentQuestion: undefined,
        selectedAnswer: -1,
        hasAnswerChanged: false,
      };
    });
    this.isLoading = false;
  }
}
