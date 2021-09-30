import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { mergeMap, tap } from 'rxjs/operators';
import { CustomerItem } from '../../models/customer-item';
import { ProjectItem } from '../../models/project-item';
import { AlertService } from '../../services/alert.service';
import { CustomerService } from '../../services/customer.service';
import { KeycloakService } from '../../services/keycloak.service';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-customer-detail',
  templateUrl: './customer-detail.component.html',
})
export class CustomerDetailComponent implements OnInit {
  public customer: CustomerItem | null = null;
  public projects: ProjectItem[] | undefined = undefined;
  public projectForm: FormGroup;
  public canCreateProject: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private customerService: CustomerService,
    private projectService: ProjectService,
    private alertService: AlertService,
    private keycloak: KeycloakService,
    formBuilder: FormBuilder
  ) {
    this.projectForm = formBuilder.group({
      name: '',
      projectlead: '',
    });
  }

  ngOnInit() {
    this.loadData();
    this.keycloak.loadPermissions().subscribe((m) => {
      this.canCreateProject = m.isAuthorized('projects', 'create');
    });
  }

  public add() {
    const project = this.projectForm.getRawValue() as ProjectItem;
    this.projectService
      .create(this.route.snapshot.params.id, project)
      .subscribe(() => {
        this.projectForm.patchValue({ name: '', projectlead: '' });
        this.loadData();
      });
  }

  public onDelete(project: ProjectItem) {
    this.projectService
      .delete(project.id)
      .subscribe(
        () => (this.projects = this.projects?.filter((p) => p.id != project.id))
      );
  }

  public onUpdate(project: ProjectItem) {
    this.projectService.update(project).subscribe(
      () => {},
      (error) => {
        const httpError = error as HttpErrorResponse;
        if (httpError.status === 403) {
          this.alertService.alert('You are not allowed to update projects.');
        } else {
          this.alertService.alert(error.message);
        }
      }
    );
  }

  public onArchive(project: ProjectItem) {
    this.projectService.archive(project).subscribe(() => this.loadData());
  }

  private loadData() {
    this.customerService
      .get(this.route.snapshot.params.id)
      .pipe(tap((customer) => (this.customer = customer)))
      .pipe(mergeMap((customer) => this.projectService.list(customer.id)))
      .subscribe((projects) => (this.projects = projects));
  }
}
