import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface City {
  id: number;
  name: string;
  stateId: number;
}

@Injectable({
  providedIn: 'root'
})
export class CityService {
  private apiUrl = 'http://localhost:8081/api/v1/city';

  constructor(private http: HttpClient) { }

  getCities(): Observable<City[]> {
    return this.http.get<City[]>(this.apiUrl);
  }

  getCitiesByState(stateId: number): Observable<City[]> {
    return this.http.get<City[]>(`${this.apiUrl}/stateId=${stateId}`);
  }
}
