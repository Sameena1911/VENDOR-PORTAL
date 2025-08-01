import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface RFQ {
  vendorId: string;
  rfqNumber: string;
  rfqDate: string;
  description: string;
  quantity: string;
  unit: string;
}

export interface RFQSummary {
  totalCount: number;
  activeCount: number;
  pendingCount: number;
  overdueCount: number;
  totalValue: number;
}

export interface RFQResponse {
  message: string;
  rfqs: RFQ[];
  summary: RFQSummary;
  totalRecords: number;
}

@Injectable({
  providedIn: 'root'
})
export class RFQService {
  private apiUrl = environment.apiUrl || 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  /**
   * Get all RFQs from the backend
   */
  getRFQs(): Observable<RFQResponse> {
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    });

    return this.http.get<RFQResponse>(`${this.apiUrl}/api/vendor/rfqs`, { headers })
      .pipe(
        map(response => {
          // Ensure the response has the expected structure
          return {
            message: response.message || 'RFQs retrieved successfully',
            rfqs: Array.isArray(response.rfqs) ? response.rfqs : [],
            summary: response.summary || this.getDefaultSummary(),
            totalRecords: response.totalRecords || 0
          };
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Search RFQs by various criteria
   */
  searchRFQs(searchTerm: string): Observable<RFQ[]> {
    return this.getRFQs().pipe(
      map(response => {
        if (!searchTerm || searchTerm.trim() === '') {
          return response.rfqs;
        }

        const term = searchTerm.toLowerCase().trim();
        return response.rfqs.filter(rfq => 
          rfq.rfqNumber.toLowerCase().includes(term) ||
          rfq.description.toLowerCase().includes(term) ||
          rfq.vendorId.toLowerCase().includes(term)
        );
      })
    );
  }

  /**
   * Filter RFQs by date range
   */
  filterRFQsByDateRange(rfqs: RFQ[], startDate?: string, endDate?: string): RFQ[] {
    if (!startDate && !endDate) {
      return rfqs;
    }

    return rfqs.filter(rfq => {
      const rfqDate = new Date(rfq.rfqDate);
      
      if (startDate && endDate) {
        return rfqDate >= new Date(startDate) && rfqDate <= new Date(endDate);
      } else if (startDate) {
        return rfqDate >= new Date(startDate);
      } else if (endDate) {
        return rfqDate <= new Date(endDate);
      }
      
      return true;
    });
  }

  /**
   * Export RFQs to CSV format
   */
  exportRFQsToCSV(rfqs: RFQ[]): void {
    const headers = ['Vendor ID', 'RFQ Number', 'RFQ Date', 'Description', 'Quantity', 'Unit'];
    const csvContent = [
      headers.join(','),
      ...rfqs.map(rfq => [
        rfq.vendorId,
        rfq.rfqNumber,
        rfq.rfqDate,
        `"${rfq.description.replace(/"/g, '""')}"`, // Escape quotes in description
        rfq.quantity,
        rfq.unit
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rfqs_export_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  /**
   * Get default summary structure
   */
  private getDefaultSummary(): RFQSummary {
    return {
      totalCount: 0,
      activeCount: 0,
      pendingCount: 0,
      overdueCount: 0,
      totalValue: 0
    };
  }

  /**
   * Handle HTTP errors
   */
  private handleError = (error: HttpErrorResponse) => {
    let errorMessage = 'An error occurred while fetching RFQs';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      switch (error.status) {
        case 401:
          errorMessage = 'Unauthorized: Please log in again';
          // Clear token on 401
          localStorage.removeItem('authToken');
          break;
        case 403:
          errorMessage = 'Access forbidden: Insufficient permissions';
          break;
        case 404:
          errorMessage = 'RFQ service not found';
          break;
        case 500:
          errorMessage = 'Server error: Please try again later';
          break;
        default:
          errorMessage = `Error ${error.status}: ${error.error?.message || 'Unknown error'}`;
      }
    }

    console.error('RFQ Service Error:', error);
    return throwError(() => new Error(errorMessage));
  };
}
