import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'app-temper-error',
  imports: [],
  templateUrl: './temper-error.component.html',
  styleUrl: './temper-error.component.scss'
})
export class TemperErrorComponent implements OnInit {
  data = {}

  reload() {
    window.location.reload();
  }
  checks() {
    return Object.entries(this.data)
  }
  ngOnInit() {
    // @ts-ignore
    this.data = window.temperingChecks
  }
}
