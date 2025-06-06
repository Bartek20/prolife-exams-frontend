import {Component, Input, OnInit} from '@angular/core';
import {Card} from 'primeng/card';
import {Button} from 'primeng/button';
import {Router} from '@angular/router';
import {ResultsService} from '../../../services/results.service';
import {ExamService} from '../../../services/exam.service';
import {Dialog} from 'primeng/dialog';
import {copyToClipboard} from '../../../utils/clipboard';

@Component({
  selector: 'app-info',
  imports: [
    Card,
    Button,
    Dialog
  ],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent implements OnInit {
  @Input() mode: 'student' | 'teacher' = 'student';

  isSaveModal = false;
  tab: 'link' | 'mail' | 'pdf' = 'link';
  constructor(private router: Router, protected resultsService: ResultsService, private examService: ExamService) {
  }

  saveExam() {
    this.isSaveModal = true;
  }
  retryExam() {
    this.router.navigate([`/kod-dostepu/${this.resultsService.results?.exam.access_code || ''}`]).then(()=>{
      this.examService.examState = null;
      this.resultsService.results = undefined;
    });
  }

  uuid: string | null = null;
  resultsHidden = true;
  isLoading = false;
  isCopied = false;

  changeTab(tab: 'link' | 'mail' | 'pdf') {
    if (this.tab === tab) return;
    if (this.isLoading) return;
    this.tab = tab;
  }

  getURL() {
    return window.location.origin + '/egzamin/wyniki/' + this.uuid;
  }
  copyLink() {
    if (this.isCopied) return;
    copyToClipboard(this.getURL());
    this.isCopied = true;
    setTimeout(() => this.isCopied = false, 2500);
  }

  sendMail() {

  }

  getPdf() {
    if (this.resultsHidden) return;
    if (!this.uuid) return;

    this.isLoading = true;
    this.resultsService.downloadResults(this.uuid).subscribe({
      next: () => {
        this.isLoading = false;
      }
    })
  }

  ngOnInit() {
    this.uuid = this.resultsService.results?.exam?.uuid || null;
    this.resultsHidden = this.resultsService.resultsHidden ?? true;
  }
}
