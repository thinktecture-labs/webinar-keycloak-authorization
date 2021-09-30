import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomerItem } from '../../models/customer-item';
import { KeycloakService } from '../../services/keycloak.service';

@Component({
  selector: 'app-customer-item[customer]',
  templateUrl: './customer-item.component.html',
})
export class CustomerItemComponent implements OnInit {
  @Input()
  public customer!: CustomerItem;

  @Output()
  public onDelete = new EventEmitter<CustomerItem>();

  @Output()
  public onUpdate = new EventEmitter<CustomerItem>();

  public customerForm: FormGroup;

  public canDelete = false;
  public canUpdate = false;
  public canReadProjects = false;

  public isEditMode = false;

  constructor(
    private keycloak: KeycloakService,
    formBuilder: FormBuilder
  ) {
    this.customerForm = formBuilder.group({
      name: '',
      id: '',
    });
  }

  async ngOnInit(): Promise<void> {
    this.keycloak.loadPermissions().subscribe(m => {
      this.canDelete = m.isAuthorized('customers', 'delete');
      this.canUpdate = m.isAuthorized('customers', 'update');
      this.canReadProjects = m.isAuthorized('projects', 'read');
    });

    this.customerForm.patchValue(this.customer);
  }

  public update() {
    this.isEditMode = false;
    this.customer = this.customerForm.getRawValue() as CustomerItem;
    this.onUpdate.emit(this.customer);
  }

  public delete() {
    this.onDelete.emit(this.customer);
  }
}
