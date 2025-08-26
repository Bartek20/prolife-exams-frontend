import {Component, OnInit} from '@angular/core';
import {Card} from 'primeng/card';
import {InputText} from 'primeng/inputtext';
import {FormsModule} from '@angular/forms';
import {DatePicker} from 'primeng/datepicker';
import {TableModule} from 'primeng/table';
import {DatePipe} from '@angular/common';
import {Button} from 'primeng/button';

type Certificate = {
  student: string,
  instructor: string,
  number: string,
  date: Date | null,
  generated: boolean
}

@Component({
  selector: 'app-certificates',
  imports: [
    Card,
    InputText,
    FormsModule,
    DatePicker,
    TableModule,
    DatePipe,
    Button
  ],
  templateUrl: './certificates.component.html',
  styleUrl: './certificates.component.scss'
})
export class CertificatesComponent implements OnInit {
  toGenerateCerts: Certificate[] = []
  addCertificate() {
    if (this.toGenerateCerts.length == 0) {
      this.toGenerateCerts.push({
        student: '',
        instructor: '',
        number: '',
        date: null,
        generated: false
      })
      return
    }
    const lastCertificate = this.toGenerateCerts[this.toGenerateCerts.length - 1];
    this.toGenerateCerts.push({
      student: '',
      instructor: lastCertificate.instructor,
      number: this.incrementCertificateNumber(lastCertificate.number),
      date: null,
      generated: false
    })
  }
  removeCertificate(index: number) {
    if (this.toGenerateCerts.length <= 1) return;
    this.toGenerateCerts.splice(index, 1);
  }

  private incrementCertificateNumber(current: string): string {
    const parts = current.split('-');
    if (parts.length < 2) return '';

    const prefix = parts[0];
    const nextNumber = String(+parts[1] + 1).padStart(2, '0');
    return `${prefix}-${nextNumber}`;
  }

  ngOnInit() {
    this.addCertificate();
  }

  generateCertificates() {
    console.log(this.toGenerateCerts)
  }
  downloadCertificate(number: string) {
    // Placeholder for download logic
    console.log(`Downloading certificate number: ${number}`);
  }
}
