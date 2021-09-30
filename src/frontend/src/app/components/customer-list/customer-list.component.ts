import { Component, OnInit } from '@angular/core';
import { CustomerItem } from '../../models/customer-item';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-customer-list',
  templateUrl: './customer-list.component.html',
})
export class CustomerListComponent implements OnInit {
  public customers: CustomerItem[] = [];

  constructor(
    private customerService: CustomerService,
  ) {}

  ngOnInit() {
    this.customerService.list().subscribe(items => this.customers = items);
  }

  public onDelete(customer: CustomerItem) {
    this.customerService
      .delete(customer.id)
      .subscribe(() => this.customers = this.customers.filter(c => c.id !== customer.id));
  }

  public onUpdate(customer: CustomerItem) {
    this.customerService.update(customer).subscribe();
  }
}
