import {Component, Input, OnInit, ViewChild} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {StudentInfoFormComponent} from '../../components/student-info-form/student-info-form.component';
import {LoadingComponent} from '../../components/loading/loading.component';
import {QuestionComponent} from '../../components/question/question.component';
import {ResultsService} from '../../services/results.service';
import {ResultComponent} from '../../components/results/result/result.component';
import {InfoComponent} from '../../components/results/info/info.component';
import {SelectorComponent} from '../../components/results/selector/selector.component';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-results',
  imports: [
    FormsModule,
    StudentInfoFormComponent,
    LoadingComponent,
    QuestionComponent,
    ResultComponent,
    InfoComponent,
    SelectorComponent
  ],
  templateUrl: './results.component.html',
  styleUrl: './results.component.scss'
})
export class ResultsComponent implements OnInit {
  @Input() mode: 'student' | 'teacher' = 'student';
  selectedUUID: string | null = null;

  isLoading = false;

  constructor(protected resultsService: ResultsService, private route: ActivatedRoute) {}

  restoreSession($event: {name: string, surname: string, email: string}) {
    if (!this.selectedUUID) return;
    this.isLoading = true;
    this.resultsService.restoreExam(this.selectedUUID, $event.name, $event.surname, $event.email).subscribe(() => {
      this.fetchResults()
    })
  }

  @ViewChild('exam_selector') examSelector: SelectorComponent | undefined;

  fetchResults() {
    if (!this.selectedUUID) return
    this.isLoading = true;
    this.resultsService.getResults(this.selectedUUID).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        if (this.resultsService.examNotFound) {
          this.examSelector?.loadList()
        }
      }
    });
  }

  ngOnInit() {
    this.fetchResults();
    this.route.paramMap.subscribe(paramMap => {
      const uuid = paramMap.get('uuid');
      if (uuid && uuid !== this.selectedUUID) {
        this.selectedUUID = uuid;
        this.fetchResults();
      }
    })
  }
}
