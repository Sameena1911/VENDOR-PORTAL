import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

interface GoodsReceipt {
	grNumber: string;
	grYear: string;
	grDate: string;
	material: string;
	plant: string;
	companyCode: string;
}

@Component({
	selector: 'app-goods-receipt',
	templateUrl: './goods-receipt.component.html',
	styleUrls: ['./goods-receipt.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class GoodsReceiptComponent implements OnInit {
	goodsReceipts: GoodsReceipt[] = [];
	filteredGoodsReceipts: GoodsReceipt[] = [];
	isLoading = false;
	errorMessage = '';
	searchTerm = '';
	startDate: string = '';

	constructor(private http: HttpClient) {}

	ngOnInit() {
		this.loadGoodsReceipts();
	}

	loadGoodsReceipts() {
		this.isLoading = true;
		this.errorMessage = '';
		
		const token = localStorage.getItem('token');
		const headers = new HttpHeaders({
			'Authorization': `Bearer ${token}`
		});
		
		this.http.get<any>('http://localhost:3001/api/vendor/goods-receipts', { headers })
			.subscribe({
				next: (response) => {
					console.log('Frontend received response:', response);
					this.isLoading = false;
					
					if (response && response.success && Array.isArray(response.data) && response.data.length > 0) {
						this.goodsReceipts = response.data;
						this.filterGoodsReceipts();
					} else {
						this.goodsReceipts = [];
						this.filteredGoodsReceipts = [];
						this.errorMessage = response?.message || 'No goods receipts found';
					}
				},
				error: (err) => {
					console.error('Frontend error:', err);
					this.isLoading = false;
					this.goodsReceipts = [];
					this.filteredGoodsReceipts = [];
					this.errorMessage = err?.error?.message || 'Failed to fetch goods receipts';
				}
			});
	}

	filterGoodsReceipts() {
		let filtered = this.goodsReceipts;
		if (this.searchTerm) {
			const term = this.searchTerm.toLowerCase();
			filtered = filtered.filter(gr =>
				gr.grNumber.toLowerCase().includes(term) ||
				gr.material.toLowerCase().includes(term)
				// Add more fields if needed
			);
		}
		if (this.startDate) {
			filtered = filtered.filter(gr => {
				// Assume grDate is in YYYY-MM-DD format
				return gr.grDate && gr.grDate >= this.startDate;
			});
		}
		this.filteredGoodsReceipts = filtered;
	}

	clearFilters() {
		this.searchTerm = '';
		this.startDate = '';
		this.filterGoodsReceipts();
	}

	trackByGrNumber(index: number, gr: GoodsReceipt) {
		return gr.grNumber;
	}

	exportToCSV() {
		// Simple CSV export for filtered data
		const rows = [
			['GR Number', 'GR Year', 'GR Date', 'Material', 'Plant', 'Company Code'],
			...this.filteredGoodsReceipts.map(gr => [
				gr.grNumber, gr.grYear, gr.grDate, gr.material, gr.plant, gr.companyCode
			])
		];
		const csvContent = rows.map(e => e.join(",")).join("\n");
		const blob = new Blob([csvContent], { type: 'text/csv' });
		const url = window.URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = 'goods_receipts.csv';
		a.click();
		window.URL.revokeObjectURL(url);
	}
}
