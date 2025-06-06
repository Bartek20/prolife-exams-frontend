import { Component } from '@angular/core';
import {Router} from '@angular/router';
import {ExamService} from "../../../services/exam.service";
import {FormsModule} from '@angular/forms';
import {StudentInfoFormComponent} from '../../../components/student-info-form/student-info-form.component';

@Component({
  selector: 'app-student-data',
  imports: [
    FormsModule,
    StudentInfoFormComponent
  ],
  templateUrl: './student-data.component.html',
  styleUrl: './student-data.component.scss'
})
export class StudentDataComponent {
  constructor(private examService: ExamService, private router: Router) {}
  isLoading = false;
  error: string | null = null

  startExam($event: { name: string, surname: string, email: string }) {
    this.isLoading = true;
    this.error = null;
    this.examService.startExam($event.name, $event.surname, $event.email).subscribe({
      error: (err) => {
        this.isLoading = false;
        this.error = err.error.error;
      }
    })
  }
}
