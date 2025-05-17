import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AddressDTO {
  id?: number;
  street: string;
  number: string;
  district: string;
  complement?: string;
  postalCode: string;
  cityId: number;
  stateId: number;
  countryId: number;
}

export interface ClientDTO {
  id?: number;
  name: string;
  email: string;
  birthDate?: string;
  phone?: string;
  document: string;
  addressDTO?: AddressDTO;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClientCreateDTO {
  name: string;
  email: string;
  birthDate?: string;
  phone?: string;
  document: string;
  addressCreateDTO: {
    street: string;
    number: string;
    district: string;
    complement?: string;
    postalCode: string;
    cityId: number;
    stateId: number;
    countryId: number;
  };
}

export interface ClientUpdateDTO {
  id: number;
  name: string;
  email: string;
  birthDate?: string;
  phone?: string;
  document: string;
  addressUpdateDTO: {
    id?: number;
    street: string;
    number: string;
    district: string;
    complement?: string;
    postalCode: string;
    cityId: number;
    stateId: number;
    countryId: number;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ClientService {
  private readonly apiUrl = 'http://localhost:8081/api/v1/clients';

  /**
   * Creates an instance of ClientService.
   * @param {HttpClient} http - The HTTP client for making requests
   */
  constructor(private readonly http: HttpClient) { }

  /**
   * Retrieves all clients
   * @returns {Observable<ClientDTO[]>} An observable of client DTOs
   */
  public getClients(): Observable<ClientDTO[]> {
    return this.http.get<ClientDTO[]>(this.apiUrl);
  }

  /**
   * Retrieves a client by ID
   * @param {number} id - The client ID
   * @returns {Observable<ClientDTO>} An observable of the client DTO
   */
  public getClientById(id: number): Observable<ClientDTO> {
    return this.http.get<ClientDTO>(`${this.apiUrl}/${id}`);
  }

  /**
   * Creates a new client
   * @param {ClientCreateDTO} client - The client data to create
   * @returns {Observable<ClientDTO>} An observable of the created client DTO
   */
  public createClient(client: ClientCreateDTO): Observable<ClientDTO> {
    return this.http.post<ClientDTO>(this.apiUrl, client);
  }

  /**
   * Updates an existing client
   * @param {ClientUpdateDTO} client - The client data to update
   * @returns {Observable<ClientDTO>} An observable of the updated client DTO
   * @throws {Error} If client ID is not provided
   */
  public updateClient(client: ClientUpdateDTO): Observable<ClientDTO> {
    if (!client.id) {
      throw new Error('Client ID is required for update');
    }
    return this.http.put<ClientDTO>(`${this.apiUrl}/${client.id}`, client);
  }

  /**
   * Deletes a client by ID
   * @param {number} id - The client ID to delete
   * @returns {Observable<void>} An observable that completes when the deletion is done
   */
  public deleteClient(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
