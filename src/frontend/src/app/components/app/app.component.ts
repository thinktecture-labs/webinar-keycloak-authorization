import { Component } from '@angular/core';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
})
export class AppComponent {
  public message: string = ""

  title = 'Sales App';

  constructor(alertService: AlertService) {
    alertService.alerted.subscribe(message => this.message = message);
  }
}
