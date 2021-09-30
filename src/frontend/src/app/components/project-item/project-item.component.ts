import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { CustomerItem } from '../../models/customer-item';
import { ProjectItem } from '../../models/project-item';
import { KeycloakService } from '../../services/keycloak.service';

@Component({
  selector: 'app-project-item[project]',
  templateUrl: './project-item.component.html',
})
export class ProjectItemComponent implements OnInit {
  @Input()
  public project!: ProjectItem;

  @Output()
  public onDelete = new EventEmitter<ProjectItem>();

  @Output()
  public onUpdate = new EventEmitter<ProjectItem>();

  @Output()
  public onArchive = new EventEmitter<ProjectItem>();

  public projectForm: FormGroup;

  public canDelete = false;
  public canReadProjects = false;
  public canArchiveProject = false;

  public isEditMode = false;

  constructor(
    private keycloak: KeycloakService,
    formBuilder: FormBuilder
  ) {
    this.projectForm = formBuilder.group({
      name: '',
      id: '',
      customerId: '',
      projectLead: '',
    });
  }

  ngOnInit() {
    this.keycloak.loadPermissions().subscribe(m => {
      this.canDelete = m.isAuthorized('projects', 'delete');
      this.canReadProjects = m.isAuthorized('projects', 'read');
      this.canArchiveProject = m.isAuthorized(`projects/${this.project.id}`, 'archive');
    })

    this.projectForm.patchValue(this.project);
  }

  public update() {
    this.project = this.projectForm.getRawValue() as ProjectItem;
    this.isEditMode = false
    this.onUpdate.emit(this.project)
  }

  public delete() {
    this.onDelete.emit(this.project);
  }

  public archive() {
    this.onArchive.emit(this.project);
  }
}
