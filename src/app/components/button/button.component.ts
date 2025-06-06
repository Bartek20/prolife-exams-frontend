import {Component, EventEmitter, Input, Output} from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss'
})
export class ButtonComponent {
  @Input() type = 'primary'
  @Input() text = 'Button'
  @Input() isLoading = false
  @Input() disabled = false
  @Input() width: 'auto' | 'full' = 'auto'
  @Input() position: 'left' |'right' = 'right';

  @Output() onClick = new EventEmitter<void>()

  click() {
    if (this.disabled) return
    this.onClick.emit()
  }
}
