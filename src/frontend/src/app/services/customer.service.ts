import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CustomerItem } from '../models/customer-item';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private http: HttpClient) {}

  public list(): Observable<CustomerItem[]> {
    return this.http.get<CustomerItem[]>(`${environment.apiBaseUrl}/customer`);
  }

  public get(customerId: string): Observable<CustomerItem> {
    return this.http.get<CustomerItem>(
      `${environment.apiBaseUrl}/customer/${customerId}`
    );
  }

  public update(customer: CustomerItem): Observable<CustomerItem> {
    return this.http.post<CustomerItem>(
      `${environment.apiBaseUrl}/customer/${customer.id}`,
      customer
    );
  }

  public delete(id: string): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/customer/${id}`);
  }
}
