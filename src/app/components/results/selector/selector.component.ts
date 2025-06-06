import {Component, Input, OnInit} from '@angular/core';
import {Card} from 'primeng/card';
import {Select, SelectChangeEvent} from 'primeng/select';
import {StorageService} from '../../../services/storage.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TeacherService} from '../../../services/teacher.service';

@Component({
  selector: 'app-selector',
  imports: [
    Card,
    Select
  ],
  templateUrl: './selector.component.html',
  styleUrl: './selector.component.scss'
})
export class SelectorComponent implements OnInit {
  @Input() mode: 'student' | 'teacher' = 'student';
  examID!: number;

  constructor(private storageService: StorageService, private teacherService: TeacherService,  private router: Router, private route: ActivatedRoute) {
  }

  isLoading = true;
  options: { label: string, value: string }[] = [];

  ngOnInit(): void {
    this.examID = this.route.snapshot.params['examId'];
    this.loadList()
  }

  loadList() {
    this.isLoading = true;
    this.options = [];
    if (this.mode === 'student') {
      Object.entries(this.storageService.results).forEach((exam: [string, any]) => {
        this.options.push({
          label: `${exam[1].student || exam[0]}`,
          value: exam[0]
        })
      })
      this.isLoading = false;
    }
    if (this.mode === 'teacher') {
      this.teacherService.getResponsesList(this.examID).subscribe({
        next: (data) => {
          data.forEach((exam: any) => {
            this.options.push({
              label: exam.student_name + ' ' + exam.student_surname,
              value: exam.uuid
            })
          })
          this.isLoading = false;
        }
      })
    }
  }

  examSelect(uuid: SelectChangeEvent) {
    let url = '';
    url += this.mode === 'student' ? '/egzamin/wyniki/' : '/wykladowca/egzamin/' + this.examID + '/wyniki/';
    url += uuid.value;
    this.router.navigate([url], {
      replaceUrl: true
    });
  }
}
