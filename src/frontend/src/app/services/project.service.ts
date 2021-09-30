import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { CustomerItem } from '../models/customer-item';
import { ProjectItem } from '../models/project-item';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor(private http: HttpClient) {}

  public list(customerId: string): Observable<ProjectItem[]> {
    return this.http.get<ProjectItem[]>(
      `${environment.apiBaseUrl}/customer/${customerId}/projects`
    );
  }

  public create(customerId: string, project: ProjectItem): Observable<ProjectItem> {
    return this.http.put<ProjectItem>(
      `${environment.apiBaseUrl}/customer/${customerId}/projects`,
      project
    );
  }

  public update(project: ProjectItem): Observable<ProjectItem> {
    return this.http.post<ProjectItem>(
      `${environment.apiBaseUrl}/projects/${project.id}`,
      project
    );
  }

  public archive(project: ProjectItem): Observable<object> {
    return this.http.post(
      `${environment.apiBaseUrl}/projects/${project.id}/archive`, null
    );
  }

  public delete(id: string): Observable<any> {
    return this.http.delete(`${environment.apiBaseUrl}/projects/${id}`);
  }
}
