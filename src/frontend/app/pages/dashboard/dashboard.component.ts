import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

// Interface for inventory items
interface InventoryItem {
  id: number;
  name: string;
  category: string;
  stock: number;
  price: number;
  threshold: number;
  expiryDate: string;
  soldLastMonth: number;
  isEditing?: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Hardcoded inventory data for general shop
  inventoryItems: InventoryItem[] = [
    { id: 1, name: 'Rice (5kg)', category: 'Food', stock: 45, price: 15.99, threshold: 20, expiryDate: '2025-06-15', soldLastMonth: 120 },
    { id: 2, name: 'Cooking Oil (2L)', category: 'Food', stock: 8, price: 12.50, threshold: 15, expiryDate: '2025-03-20', soldLastMonth: 85 },
    { id: 3, name: 'Sugar (2kg)', category: 'Food', stock: 30, price: 5.99, threshold: 25, expiryDate: '2026-01-10', soldLastMonth: 95 },
    { id: 4, name: 'Bread', category: 'Fresh', stock: 12, price: 2.50, threshold: 20, expiryDate: '2024-11-05', soldLastMonth: 200 },
    { id: 5, name: 'Milk (1L)', category: 'Fresh', stock: 0, price: 3.20, threshold: 30, expiryDate: '2024-11-02', soldLastMonth: 180 },
    { id: 6, name: 'Eggs (dozen)', category: 'Fresh', stock: 15, price: 4.50, threshold: 25, expiryDate: '2024-11-08', soldLastMonth: 150 },
    { id: 7, name: 'Chips (Large)', category: 'Snacks', stock: 60, price: 3.99, threshold: 30, expiryDate: '2025-02-20', soldLastMonth: 110 },
    { id: 8, name: 'Biscuits Pack', category: 'Snacks', stock: 40, price: 2.99, threshold: 20, expiryDate: '2025-01-15', soldLastMonth: 90 },
    { id: 9, name: 'Chocolate Bars', category: 'Snacks', stock: 25, price: 1.50, threshold: 40, expiryDate: '2025-04-10', soldLastMonth: 160 },
    { id: 10, name: 'Water Bottles (12pk)', category: 'Drinks', stock: 35, price: 8.99, threshold: 25, expiryDate: '2025-08-01', soldLastMonth: 130 },
    { id: 11, name: 'Soda (2L)', category: 'Drinks', stock: 5, price: 2.99, threshold: 20, expiryDate: '2025-03-15', soldLastMonth: 75 },
    { id: 12, name: 'Juice Boxes (6pk)', category: 'Drinks', stock: 18, price: 5.50, threshold: 15, expiryDate: '2024-12-20', soldLastMonth: 65 },
    { id: 13, name: 'Soap Bars', category: 'Daily Needs', stock: 50, price: 1.99, threshold: 30, expiryDate: '2027-01-01', soldLastMonth: 70 },
    { id: 14, name: 'Toothpaste', category: 'Daily Needs', stock: 22, price: 4.50, threshold: 20, expiryDate: '2026-05-10', soldLastMonth: 55 },
    { id: 15, name: 'Detergent (1kg)', category: 'Daily Needs', stock: 28, price: 8.99, threshold: 15, expiryDate: '2026-09-30', soldLastMonth: 60 }
  ];

  // Chart instances
  categoryChart: Chart | null = null;
  salesLineChart: Chart | null = null;
  topSellingChart: Chart | null = null;

  // Calculated stats
  totalValue: number = 0;
  totalItems: number = 0;
  lowStockCount: number = 0;
  outOfStockCount: number = 0;
  expiringItems: InventoryItem[] = [];

  constructor() {}

  ngOnInit(): void {
    this.calculateStats();
    this.checkExpiringItems();
    setTimeout(() => this.renderCharts(), 100);
  }

  ngOnDestroy(): void {
    if (this.categoryChart) this.categoryChart.destroy();
    if (this.salesLineChart) this.salesLineChart.destroy();
    if (this.topSellingChart) this.topSellingChart.destroy();
  }

  calculateStats(): void {
    this.totalValue = this.inventoryItems.reduce((sum, item) => sum + (item.price * item.stock), 0);
    this.totalItems = this.inventoryItems.length;
    this.lowStockCount = this.inventoryItems.filter(item => item.stock > 0 && item.stock <= item.threshold).length;
    this.outOfStockCount = this.inventoryItems.filter(item => item.stock === 0).length;
  }

  checkExpiringItems(): void {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    this.expiringItems = this.inventoryItems.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      return expiryDate <= sevenDaysFromNow && expiryDate >= today;
    });
  }

  renderCharts(): void {
    this.renderCategoryChart();
    this.renderSalesLineChart();
    this.renderTopSellingChart();
  }

  renderCategoryChart(): void {
    const canvas = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.categoryChart) this.categoryChart.destroy();

    // Group by category
    const categoryData: { [key: string]: number } = {};
    this.inventoryItems.forEach(item => {
      categoryData[item.category] = (categoryData[item.category] || 0) + item.stock;
    });

    const categories = Object.keys(categoryData);
    const stockValues = Object.values(categoryData);

    this.categoryChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: categories,
        datasets: [{
          label: 'Stock Units',
          data: stockValues,
          backgroundColor: [
            'rgba(54, 162, 235, 0.7)',
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 206, 86, 0.7)',
            'rgba(75, 192, 192, 0.7)',
            'rgba(153, 102, 255, 0.7)'
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Stock Units',
              font: { size: 14, weight: 'bold' }
            }
          },
          x: {
            title: {
              display: true,
              text: 'Categories',
              font: { size: 14, weight: 'bold' }
            }
          }
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Stock by Category',
            font: { size: 18, weight: 'bold' }
          }
        }
      }
    });
  }

  renderSalesLineChart(): void {
    const canvas = document.getElementById('salesLineChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.salesLineChart) this.salesLineChart.destroy();

    // Dummy sales data for last 7 days
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const salesData = [450, 520, 480, 610, 590, 720, 680];

    this.salesLineChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Daily Sales ($)',
          data: salesData,
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
          fill: true,
          borderWidth: 3,
          pointRadius: 5,
          pointBackgroundColor: 'rgba(75, 192, 192, 1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Sales Amount ($)',
              font: { size: 12, weight: 'bold' }
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Sales Over Last 7 Days',
            font: { size: 16, weight: 'bold' }
          },
          legend: { display: false }
        }
      }
    });
  }

  renderTopSellingChart(): void {
    const canvas = document.getElementById('topSellingChart') as HTMLCanvasElement;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (this.topSellingChart) this.topSellingChart.destroy();

    // Get top 5 selling items
    const topItems = [...this.inventoryItems]
      .sort((a, b) => b.soldLastMonth - a.soldLastMonth)
      .slice(0, 5);

    this.topSellingChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topItems.map(item => item.name),
        datasets: [{
          label: 'Units Sold',
          data: topItems.map(item => item.soldLastMonth),
          backgroundColor: 'rgba(255, 159, 64, 0.7)',
          borderColor: 'rgba(255, 159, 64, 1)',
          borderWidth: 2
        }]
      },
      options: {
        indexAxis: 'y', // Horizontal bars
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Units Sold Last Month',
              font: { size: 12, weight: 'bold' }
            }
          }
        },
        plugins: {
          legend: { display: false },
          title: {
            display: true,
            text: 'Top 5 Selling Items',
            font: { size: 16, weight: 'bold' }
          }
        }
      }
    });
  }

  // Enable editing for a row
  editItem(item: InventoryItem): void {
    item.isEditing = true;
  }

  // Save edited item
  saveItem(item: InventoryItem): void {
    item.isEditing = false;
    this.calculateStats();
    this.checkExpiringItems();
    // Refresh charts
    setTimeout(() => this.renderCharts(), 100);
  }

  // Cancel editing
  cancelEdit(item: InventoryItem): void {
    item.isEditing = false;
  }

  // Get stock status class for styling
  getStockStatusClass(item: InventoryItem): string {
    if (item.stock === 0) return 'table-danger';
    if (item.stock <= item.threshold) return 'table-warning';
    return '';
  }

  // Get stock status badge
  getStockStatus(item: InventoryItem): string {
    if (item.stock === 0) return 'OUT OF STOCK';
    if (item.stock <= item.threshold) return 'LOW';
    return 'OK';
  }

  // Get badge class
  getBadgeClass(item: InventoryItem): string {
    if (item.stock === 0) return 'badge bg-danger';
    if (item.stock <= item.threshold) return 'badge bg-warning text-dark';
    return 'badge bg-success';
  }

  // Get expiry status
  getExpiryStatus(expiryDate: string): string {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'EXPIRED';
    if (daysUntilExpiry <= 3) return `${daysUntilExpiry}d - URGENT`;
    if (daysUntilExpiry <= 7) return `${daysUntilExpiry}d - SOON`;
    return `${daysUntilExpiry}d`;
  }

  // Get expiry badge class
  getExpiryBadgeClass(expiryDate: string): string {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysUntilExpiry = Math.floor((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'badge bg-dark';
    if (daysUntilExpiry <= 3) return 'badge bg-danger';
    if (daysUntilExpiry <= 7) return 'badge bg-warning text-dark';
    return 'badge bg-secondary';
  }
}
