import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {
  private apiUrl: string;

  constructor() {
    // In production (deployed on Azure), use relative URLs (same domain)
    // In development, use localhost:3000
    const isDevelopment = !window.location.hostname.includes('azurewebsites.net');
    this.apiUrl = isDevelopment ? 'http://localhost:3000' : '';
  }

  getApiUrl(): string {
    return this.apiUrl;
  }
}
