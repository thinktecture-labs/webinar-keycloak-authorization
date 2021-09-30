import { Injectable } from "@angular/core";
import { Observable, Subject } from "rxjs";

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private $alerted = new Subject<string>()


  alert(message: string){
    this.$alerted.next(message);
  }

  public get alerted(): Observable<string> {
    return this.$alerted.asObservable();
  }
}
