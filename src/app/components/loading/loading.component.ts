import {Component, Input} from '@angular/core';
import {Dialog} from "primeng/dialog";
import {ProgressSpinner} from "primeng/progressspinner";

@Component({
  selector: 'app-loading',
    imports: [
        Dialog,
        ProgressSpinner
    ],
  templateUrl: './loading.component.html',
  styleUrl: './loading.component.scss'
})
export class LoadingComponent {
  @Input() visible: boolean = false;
  @Input() text: string = 'Ładowanie...';
}
