import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Library } from '../models/library.model';

@Injectable({
  providedIn: 'root'
})
export class TerminalService {
  private apiUrl = 'http://localhost:8080/api/terminals';

  constructor(private http: HttpClient) {}

  getAllTerminals(): Observable<Library[]> {
    return this.http.get<Library[]>(this.apiUrl);
  }
}
