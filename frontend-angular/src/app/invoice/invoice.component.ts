import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

interface Invoice {
  documentNumber: string;
  documentDate: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  currency: string;
  paymentTerms: string;
  dueDate: string;
  status: string;
  companyCode: string;
  reference: string;
  description: string;
}

interface InvoiceSummary {
  totalAmount: number;
  totalCount: number;
  paidAmount: number;
  paidCount: number;
  pendingAmount: number;
  pendingCount: number;
  overDueAmount: number;
  overDueCount: number;
}

@Component({
  selector: 'app-invoice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './invoice.component.html',
  styleUrls: ['./invoice.component.css']
})
export class InvoiceComponent implements OnInit {
  invoices: Invoice[] = [];
  filteredInvoices: Invoice[] = [];
  summary: InvoiceSummary = {
    totalAmount: 0,
    totalCount: 0,
    paidAmount: 0,
    paidCount: 0,
    pendingAmount: 0,
    pendingCount: 0,
    overDueAmount: 0,
    overDueCount: 0
  };
  
  isLoading = false;
  error: string | null = null;
  
  // Filter properties
  filterStatus = '';
  filterDateFrom = '';
  filterDateTo = '';
  searchText = '';
  
  // PDF properties
  selectedInvoice: Invoice | null = null;
  pdfUrl: SafeResourceUrl | null = null;
  showPdfViewer = false;
  loadingPdf = false;
  
  private apiUrl = 'http://localhost:3001/api';

  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit() {
    this.loadInvoices();
  }

  async loadInvoices() {
    this.isLoading = true;
    this.error = null;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      const response = await this.http.get<any>(`${this.apiUrl}/vendor/invoices`, { headers }).toPromise();
      
      if (response && response.invoices) {
        this.invoices = response.invoices;
        this.filteredInvoices = [...this.invoices];
        this.summary = response.summary || this.calculateSummary();
        console.log('Loaded invoices:', this.invoices.length);
      } else {
        this.invoices = [];
        this.filteredInvoices = [];
        this.error = 'No invoice data received';
      }

    } catch (error: any) {
      console.error('Error loading invoices:', error);
      this.error = error.error?.message || error.message || 'Failed to load invoices';
      this.invoices = [];
      this.filteredInvoices = [];
    } finally {
      this.isLoading = false;
    }
  }

  calculateSummary(): InvoiceSummary {
    const summary: InvoiceSummary = {
      totalAmount: 0,
      totalCount: 0,
      paidAmount: 0,
      paidCount: 0,
      pendingAmount: 0,
      pendingCount: 0,
      overDueAmount: 0,
      overDueCount: 0
    };

    this.invoices.forEach(invoice => {
      summary.totalAmount += invoice.amount;
      summary.totalCount++;

      if (invoice.status === 'Paid') {
        summary.paidAmount += invoice.amount;
        summary.paidCount++;
      } else if (invoice.status === 'Pending') {
        summary.pendingAmount += invoice.amount;
        summary.pendingCount++;
      } else if (invoice.status === 'Overdue') {
        summary.overDueAmount += invoice.amount;
        summary.overDueCount++;
      }
    });

    return summary;
  }

  filterInvoices() {
    this.filteredInvoices = this.invoices.filter(invoice => {
      let matches = true;

      // Status filter
      if (this.filterStatus && invoice.status !== this.filterStatus) {
        matches = false;
      }

      // Date range filter
      if (this.filterDateFrom && invoice.documentDate < this.filterDateFrom) {
        matches = false;
      }
      if (this.filterDateTo && invoice.documentDate > this.filterDateTo) {
        matches = false;
      }

      // Search text filter
      if (this.searchText) {
        const search = this.searchText.toLowerCase();
        const searchFields = [
          invoice.documentNumber,
          invoice.vendorName,
          invoice.description,
          invoice.reference
        ].join(' ').toLowerCase();
        
        if (!searchFields.includes(search)) {
          matches = false;
        }
      }

      return matches;
    });
  }

  clearFilters() {
    this.filterStatus = '';
    this.filterDateFrom = '';
    this.filterDateTo = '';
    this.searchText = '';
    this.filteredInvoices = [...this.invoices];
  }

  async viewPDF(invoice: Invoice) {
    this.selectedInvoice = invoice;
    this.loadingPdf = true;
    this.showPdfViewer = true;
    this.pdfUrl = null;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      const response = await this.http.get<any>(
        `${this.apiUrl}/vendor/invoice/${invoice.documentNumber}/pdf`, 
        { headers }
      ).toPromise();
      
      if (response && response.pdfData) {
        // Convert base64 to blob and create URL
        const byteCharacters = atob(response.pdfData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        
        this.pdfUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
        console.log('PDF loaded successfully for invoice:', invoice.documentNumber);
      } else {
        throw new Error('No PDF data received');
      }

    } catch (error: any) {
      console.error('Error loading PDF:', error);
      alert(`Failed to load PDF: ${error.error?.message || error.message || 'Unknown error'}`);
      this.closePdfViewer();
    } finally {
      this.loadingPdf = false;
    }
  }

  async downloadPDF(invoice: Invoice) {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
      
      // Use the download endpoint that returns PDF buffer
      const response = await this.http.get(
        `${this.apiUrl}/vendor/invoice/${invoice.documentNumber}/download`,
        { 
          headers,
          responseType: 'blob' 
        }
      ).toPromise();

      if (response) {
        // Create download link
        const blob = new Blob([response], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Invoice_${invoice.documentNumber}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        console.log('PDF downloaded successfully for invoice:', invoice.documentNumber);
      }

    } catch (error: any) {
      console.error('Error downloading PDF:', error);
      alert(`Failed to download PDF: ${error.error?.message || error.message || 'Unknown error'}`);
    }
  }

  closePdfViewer() {
    this.showPdfViewer = false;
    this.selectedInvoice = null;
    if (this.pdfUrl) {
      // Clean up the object URL
      const url = (this.pdfUrl as any).changingThisBreaksApplicationSecurity;
      if (url && url.startsWith('blob:')) {
        URL.revokeObjectURL(url);
      }
      this.pdfUrl = null;
    }
  }

  formatCurrency(amount: number, currency: string = 'USD'): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: '2-digit'
    });
  }

  getStatusClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'paid': return 'status-paid';
      case 'pending': return 'status-pending';
      case 'overdue': return 'status-overdue';
      default: return 'status-default';
    }
  }

  refresh() {
    this.loadInvoices();
  }
}
