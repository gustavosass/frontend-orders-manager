import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl, AbstractControl } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxMaskDirective, NgxMaskPipe } from 'ngx-mask';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { Observable, of } from 'rxjs';
import {
  ClientService,
  ClientDTO,
  ClientCreateDTO,
  ClientUpdateDTO,
  AddressDTO
} from '../../../services/client.service';
import { CountryService, Country } from '../../../services/country.service';
import { StateService, State } from '../../../services/state.service';
import { CityService, City } from '../../../services/city.service';

interface AddressFormValue {
  street: string;
  number: string;
  district: string;
  complement: string;
  postalCode: string;
  cityId: number | null;
  stateId: number | null;
  countryId: number | null;
}

@Component({
  selector: 'app-client-form',
  templateUrl: './client-form.component.html',
  styleUrls: ['./client-form.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    NgxMaskDirective,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatSnackBarModule,
    MatTooltipModule,
    MatSelectModule,
    MatToolbarModule,
    MatCardModule,
    MatProgressSpinnerModule
  ]
})
export class ClientFormComponent implements OnInit {

  onDateBlur(event: any) {
    let value = event.target.value;
    if (typeof value === 'string' && value.trim()) {
      // Se a data foi digitada sem barras e tem 8 dígitos, insere as barras
      if (/^\d{8}$/.test(value)) {
        value = value.replace(/(\d{2})(\d{2})(\d{4})/, '$1/$2/$3');
        event.target.value = value; // Atualiza o valor exibido no input
      }
      const parts = value.split('/');
      if (parts.length === 3) {
        const day = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const year = parseInt(parts[2], 10);
        const parsedDate = new Date(year, month, day);
        if (!isNaN(parsedDate.getTime())) {
          this.clientForm.get('birthDate')?.setValue(parsedDate);
        }
      }
    }
  }
  onDateChange(event: any) {
    // Mantido para compatibilidade com o template
  }

  get documentMask(): string {
    const value = this.clientForm?.get('document')?.value || '';
    const digits = value.replace(/\D/g, '');
    return digits.length > 11 ? '00.000.000/0000-00' : '000.000.000-00';
  }
  clientForm: FormGroup<{
    name: FormControl<string | null>;
    email: FormControl<string | null>;
    birthDate: FormControl<Date | null>;
    phone: FormControl<string | null>;
    document: FormControl<string | null>;
    addressUpdateDTO: FormGroup<{
      id: FormControl<number | null>;
      street: FormControl<string | null>;
      number: FormControl<string | null>;
      district: FormControl<string | null>;
      complement: FormControl<string | null>;
      postalCode: FormControl<string | null>;
      cityId: FormControl<number | null>;
      stateId: FormControl<number | null>;
      countryId: FormControl<number | null>;
    }>;
  }>;

  isEdit = false;
  loading = false;
  countries: Country[] = [];
  states: State[] = [];
  cities: City[] = [];

  // Loading states
  loadingCountries = false;
  loadingStates = false;
  loadingCities = false;

  // Form control getters for better type safety
  get addressUpdateDTO(): FormGroup<{
    id: FormControl<number | null>;
    street: FormControl<string | null>;
    number: FormControl<string | null>;
    district: FormControl<string | null>;
    complement: FormControl<string | null>;
    postalCode: FormControl<string | null>;
    cityId: FormControl<number | null>;
    stateId: FormControl<number | null>;
    countryId: FormControl<number | null>;
  }> {
    return this.clientForm.get('addressUpdateDTO') as FormGroup<{
      id: FormControl<number | null>;
      street: FormControl<string | null>;
      number: FormControl<string | null>;
      district: FormControl<string | null>;
      complement: FormControl<string | null>;
      postalCode: FormControl<string | null>;
      cityId: FormControl<number | null>;
      stateId: FormControl<number | null>;
      countryId: FormControl<number | null>;
    }>;
  }

  get formControls() {
    return this.clientForm.controls as {
      name: FormControl<string | null>;
      email: FormControl<string | null>;
      birthDate: FormControl<Date | null>;
      phone: FormControl<string | null>;
      document: FormControl<string | null>;
      addressUpdateDTO: FormGroup;
    };
  }

  get addressControls() {
    return this.addressUpdateDTO.controls as {
      id: FormControl<number | null>;
      street: FormControl<string | null>;
      number: FormControl<string | null>;
      district: FormControl<string | null>;
      complement: FormControl<string | null>;
      postalCode: FormControl<string | null>;
      cityId: FormControl<number | null>;
      stateId: FormControl<number | null>;
      countryId: FormControl<number | null>;
    };
  }

  constructor(
    private fb: FormBuilder,
    private clientService: ClientService,
    private countryService: CountryService,
    private stateService: StateService,
    private cityService: CityService,
    private dialogRef: MatDialogRef<ClientFormComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { client: ClientDTO; isEdit: boolean }
  ) {
    this.clientForm = this.fb.group({
      name: this.fb.control('', [Validators.required, Validators.minLength(3)]),
      email: this.fb.control('', [Validators.required, Validators.email]),
      birthDate: this.fb.control<Date | null>(null, [Validators.required]),
      phone: this.fb.control('', [Validators.required]),
      document: this.fb.control('', [Validators.required, this.cpfCnpjValidator]),
      addressUpdateDTO: this.fb.group({
        id: this.fb.control<number | null>(null),
        street: this.fb.control('', [Validators.required]),
        number: this.fb.control('', [Validators.required]),
        district: this.fb.control('', [Validators.required]),
        complement: this.fb.control(''),
        postalCode: this.fb.control('', [Validators.required, Validators.pattern(/^\d{5}-?\d{3}$/)]),
        cityId: this.fb.control<number | null>({ value: null, disabled: true }, [Validators.required]),
        stateId: this.fb.control<number | null>({ value: null, disabled: true }, [Validators.required]),
        countryId: this.fb.control<number | null>(null, [Validators.required])
      })
    });
    this.isEdit = data?.isEdit || false;

    // Load countries first, then load client data if in edit mode
    this.loadCountries(() => {
      if (this.isEdit && this.data.client) {
        this.loadClientData();
      }
    });
  }

  // Validador customizado para CPF/CNPJ
  cpfCnpjValidator(control: AbstractControl) {
    const value = (control.value || '').replace(/\D/g, '');
    if (!value) return null;
    if (value.length === 11 && validateCPF(value)) return null;
    if (value.length === 14 && validateCNPJ(value)) return null;
    return { cpfCnpj: true };

    // CPF validation
    function validateCPF(cpf: string): boolean {
      if (/^(\d)\1+$/.test(cpf)) return false;
      let sum = 0, rest;
      for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
      rest = (sum * 10) % 11;
      if (rest === 10 || rest === 11) rest = 0;
      if (rest !== parseInt(cpf.substring(9, 10))) return false;
      sum = 0;
      for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
      rest = (sum * 10) % 11;
      if (rest === 10 || rest === 11) rest = 0;
      return rest === parseInt(cpf.substring(10, 11));
    }

    // CNPJ validation
    function validateCNPJ(cnpj: string): boolean {
      if (/^(\d)\1+$/.test(cnpj)) return false;
      let length = cnpj.length - 2;
      let numbers = cnpj.substring(0, length);
      let digits = cnpj.substring(length);
      let sum = 0;
      let pos = length - 7;
      for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      let result = sum % 11 < 2 ? 0 : 11 - sum % 11;
      if (result !== parseInt(digits.charAt(0))) return false;
      length = length + 1;
      numbers = cnpj.substring(0, length);
      sum = 0;
      pos = length - 7;
      for (let i = length; i >= 1; i--) {
        sum += parseInt(numbers.charAt(length - i)) * pos--;
        if (pos < 2) pos = 9;
      }
      result = sum % 11 < 2 ? 0 : 11 - sum % 11;
      return result === parseInt(digits.charAt(1));
    }
  }

  ngOnInit(): void {
    // Form initialization is now handled in the constructor
  }

  private loadClientData(): void {
    const clientData = { ...this.data.client };
    const addressData = clientData.addressDTO || {} as AddressDTO;
    delete (clientData as any).addressDTO;

    // MONTA OS IDS DE FORMA ROBUSTA PARA DTOS ANINHADOS
    addressData.cityId = addressData.cityId
      || (addressData as any).cityDTO?.id
      || null;

    addressData.stateId = addressData.stateId
      || (addressData as any).cityDTO?.stateDTO?.id
      || null;

    addressData.countryId = addressData.countryId
      || (addressData as any).cityDTO?.stateDTO?.countryDTO?.id
      || null;

    // Set dados não-endereço
    let birthDate: Date | null = null;
    if (clientData.birthDate) birthDate = new Date(clientData.birthDate);

    this.clientForm.patchValue({
      ...clientData,
      birthDate,
      addressUpdateDTO: {
        id: addressData.id || null,
        street: addressData.street || '',
        number: addressData.number || '',
        district: addressData.district || '',
        complement: addressData.complement || '',
        postalCode: addressData.postalCode || ''
      }
    });

    // País: sempre habilitado
    this.addressUpdateDTO.get('countryId')?.enable();

    this.countryService.getCountries().subscribe((countries: Country[]) => {
      this.countries = countries || [];
      let foundCountry: Country | undefined;
      if (addressData.countryId) {
        foundCountry = this.countries.find(c => Number(c.id) === Number(addressData.countryId));
        this.addressUpdateDTO.get('countryId')?.setValue(foundCountry ? Number(foundCountry.id) : null);
      } else {
        this.addressUpdateDTO.get('countryId')?.setValue(null);
      }

      // Estado: só habilita se país preenchido
      if (foundCountry) {
        this.addressUpdateDTO.get('stateId')?.enable();
        this.stateService.getStatesByCountry(Number(foundCountry.id)).subscribe((states: State[]) => {
          this.states = states || [];
          let foundState: State | undefined;
          if (addressData.stateId) {
            foundState = this.states.find(s => Number(s.id) === Number(addressData.stateId));
            this.addressUpdateDTO.get('stateId')?.setValue(foundState ? Number(foundState.id) : null);
          } else {
            this.addressUpdateDTO.get('stateId')?.setValue(null);
          }

          // Cidade: só habilita se estado preenchido
          if (foundState) {
            this.addressUpdateDTO.get('cityId')?.enable();
            this.cityService.getCitiesByState(Number(foundState.id)).subscribe((cities: City[]) => {
              this.cities = cities || [];
              let foundCity: City | undefined;
              if (addressData.cityId) {
                foundCity = this.cities.find(city => Number(city.id) === Number(addressData.cityId));
                this.addressUpdateDTO.get('cityId')?.setValue(foundCity ? Number(foundCity.id) : null);
              } else {
                this.addressUpdateDTO.get('cityId')?.setValue(null);
              }
            });
          } else {
            this.addressUpdateDTO.get('cityId')?.disable();
            this.addressUpdateDTO.get('cityId')?.setValue(null);
          }
        });
      } else {
        this.addressUpdateDTO.get('stateId')?.disable();
        this.addressUpdateDTO.get('stateId')?.setValue(null);
        this.addressUpdateDTO.get('cityId')?.disable();
        this.addressUpdateDTO.get('cityId')?.setValue(null);
      }
    });
  }

  onSubmit(): void {
    if (this.clientForm.invalid) {
      this.clientForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const formValue = this.clientForm.value;
    const addressData = this.addressUpdateDTO.value;

    // Prepare address DTO based on whether it's an update or create
    const addressUpdateDTO: {
      id?: number;
      street: string;
      number: string;
      district: string;
      complement?: string;
      postalCode: string;
      cityId: number;
      stateId: number;
      countryId: number;
    } = {
      street: addressData.street || '',
      number: addressData.number || '',
      district: addressData.district || '',
      ...(addressData.complement && { complement: addressData.complement }),
      postalCode: addressData.postalCode || '',
      cityId: addressData.cityId || 0,
      stateId: addressData.stateId || 0,
      countryId: addressData.countryId || 0
    };

    if (this.isEdit && this.data?.client?.id) {
      // Update existing client
      const updateData: ClientUpdateDTO = {
        id: this.data.client.id!,
        name: formValue.name || '',
        email: formValue.email || '',
        birthDate: formValue.birthDate ? formValue.birthDate.toISOString() : undefined,
        phone: formValue.phone || '',
        document: formValue.document || '',
        addressUpdateDTO: addressUpdateDTO
      };

      this.clientService.updateClient(updateData).subscribe({
        next: () => {
          this.snackBar.open('Cliente atualizado com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Error updating client:', error);
          this.snackBar.open('Erro ao atualizar cliente', 'Fechar', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
    } else {
      // Create new client
      const newClient: ClientCreateDTO = {
        name: formValue.name || '',
        email: formValue.email || '',
        birthDate: formValue.birthDate ? formValue.birthDate.toISOString() : undefined,
        phone: formValue.phone || '',
        document: formValue.document || '',
        addressCreateDTO: addressUpdateDTO
      };

      this.clientService.createClient(newClient).subscribe({
        next: () => {
          this.snackBar.open('Cliente criado com sucesso!', 'Fechar', {
            duration: 3000,
          });
          this.dialogRef.close(true);
        },
        error: (error: any) => {
          console.error('Error creating client:', error);
          this.snackBar.open('Erro ao criar cliente', 'Fechar', {
            duration: 3000,
          });
          this.loading = false;
        },
      });
    }
  }

  // Handle cancel button click
  onCancel(): void {
    this.dialogRef.close(false);
  }

  // Helper method to get form control by name
  getControl(controlName: string): AbstractControl | null {
    return this.clientForm.get(controlName);
  }

  // Helper method to get address form control by name
  getAddressControl(controlName: string): AbstractControl | null {
    return this.addressUpdateDTO.get(controlName);
  }

  // Load all countries
  loadCountries(callback?: () => void): void {
    this.loadingCountries = true;
    this.countryService.getCountries().subscribe({
      next: (countries: Country[]) => {
        this.countries = countries;
        this.loadingCountries = false;
        if (callback) callback();
      },
      error: (error: any) => {
        console.error('Error loading countries:', error);
        this.loadingCountries = false;
        this.snackBar.open('Erro ao carregar países', 'Fechar', {
          duration: 3000,
        });
        if (callback) callback();
      },
    });
  }

  // Handle country selection change
  onCountryChange(countryId: number | null): void {
    if (!countryId) {
      this.states = [];
      this.cities = [];
      this.addressUpdateDTO.get('stateId')?.setValue(null);
      this.addressUpdateDTO.get('cityId')?.setValue(null);
      this.addressUpdateDTO.get('stateId')?.disable();
      this.addressUpdateDTO.get('cityId')?.disable();
      return;
    }

    this.loadStates(countryId);
  }

  // Helper method to load states with callback
  private loadStates(countryId: number, callback?: () => void): void {
    if (!countryId) {
      this.states = [];
      this.cities = [];
      this.addressUpdateDTO.get('stateId')?.setValue(null);
      this.addressUpdateDTO.get('cityId')?.setValue(null);
      this.addressUpdateDTO.get('stateId')?.disable();
      this.addressUpdateDTO.get('cityId')?.disable();
      if (callback) callback();
      return;
    }

    this.loadingStates = true;
    this.stateService.getStatesByCountry(countryId).subscribe({
      next: (states: State[]) => {
        this.states = states;
        this.addressUpdateDTO.get('stateId')?.enable();
        this.loadingStates = false;
        if (callback) callback();
      },
      error: (error: any) => {
        console.error('Error loading states:', error);
        this.states = [];
        this.addressUpdateDTO.get('stateId')?.disable();
        this.addressUpdateDTO.get('cityId')?.disable();
        this.loadingStates = false;
        this.snackBar.open('Erro ao carregar estados', 'Fechar', {
          duration: 3000,
        });
        if (callback) callback();
      }
    });
  }

  // Handle state selection change
  onStateChange(stateId: number | null): void {
    if (!stateId) {
      this.cities = [];
      this.addressUpdateDTO.get('cityId')?.setValue(null);
      this.addressUpdateDTO.get('cityId')?.disable();
      return;
    }
    this.loadCities(stateId);
  }

  // Helper method to load cities with callback
  private loadCities(stateId: number, callback?: () => void): void {
    if (!stateId) {
      this.cities = [];
      this.addressUpdateDTO.get('cityId')?.setValue(null);
      this.addressUpdateDTO.get('cityId')?.disable();
      if (callback) callback();
      return;
    }

    this.loadingCities = true;
    this.cityService.getCitiesByState(stateId).subscribe({
      next: (cities: City[]) => {
        this.cities = cities;
        this.addressUpdateDTO.get('cityId')?.enable();
        this.loadingCities = false;
        if (callback) callback();
      },
      error: (error: any) => {
        console.error('Error loading cities:', error);
        this.cities = [];
        this.addressUpdateDTO.get('cityId')?.disable();
        this.loadingCities = false;
        this.snackBar.open('Erro ao carregar cidades', 'Fechar', {
          duration: 3000,
        });
        if (callback) callback();
      }
    });
  }
}
