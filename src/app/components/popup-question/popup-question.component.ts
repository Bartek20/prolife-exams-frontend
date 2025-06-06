import {Component, EventEmitter, Input, Output} from '@angular/core';
import {ButtonComponent} from '../button/button.component';

@Component({
  selector: 'app-popup-question',
  imports: [
    ButtonComponent
  ],
  templateUrl: './popup-question.component.html',
  styleUrl: './popup-question.component.scss'
})
export class PopupQuestionComponent {
  @Input() cancelText = 'Anuluj'
  @Input() confirmText = 'Potwierdź'
  @Input() title = 'Potwierdzenie'
  @Input() question = 'Czy na pewno chcesz kontynuować?'
  @Input() message = ''

  @Output() cancel = new EventEmitter()
  @Output() confirm = new EventEmitter()

  onCancel() {
    this.cancel.emit()
  }
  onConfirm() {
    this.confirm.emit()
  }
}
