import { Component, OnInit, OnDestroy } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { ProductService } from '../../services/product.service';

Chart.register(...registerables);

// Interface for inventory items (extended from Product)
interface InventoryItem {
  _id?: string;
  id?: number;
  name: string;
  description?: string;
  category: string;
  stock: number;
  price: number;
  threshold?: number;
  expiryDate?: string;
  soldLastMonth?: number;
  isEditing?: boolean;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Inventory items from MongoDB
  inventoryItems: InventoryItem[] = [];

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

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        // Map MongoDB products to inventory items
        this.inventoryItems = products.map((product, index) => {
          // Generate synthetic soldLastMonth only for existing products without it
          let soldLastMonth = product.soldLastMonth;
          if (soldLastMonth === null || soldLastMonth === undefined) {
            // Generate random value for existing products
            soldLastMonth = Math.floor(Math.random() * 200);

            // Update the product in MongoDB with the generated value
            if (product._id) {
              this.productService.updateProduct(product._id, { soldLastMonth }).subscribe({
                error: (error) => console.error('Error updating soldLastMonth:', error)
              });
            }
          }

          return {
            ...product,
            id: index + 1,
            threshold: product.threshold || 20,
            expiryDate: product.expiryDate,
            soldLastMonth
          };
        });

        this.calculateStats();
        this.checkExpiringItems();
        setTimeout(() => this.renderCharts(), 100);
      },
      error: (error) => {
        console.error('Error loading products:', error);
        // Initialize with empty data on error
        this.calculateStats();
        this.checkExpiringItems();
        setTimeout(() => this.renderCharts(), 100);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.categoryChart) this.categoryChart.destroy();
    if (this.salesLineChart) this.salesLineChart.destroy();
    if (this.topSellingChart) this.topSellingChart.destroy();
  }

  calculateStats(): void {
    this.totalValue = this.inventoryItems.reduce((sum, item) => sum + (item.price * item.stock), 0);
    this.totalItems = this.inventoryItems.length;
    this.lowStockCount = this.inventoryItems.filter(item =>
      item.stock > 0 && item.threshold && item.stock <= item.threshold
    ).length;
    this.outOfStockCount = this.inventoryItems.filter(item => item.stock === 0).length;
  }

  checkExpiringItems(): void {
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);

    this.expiringItems = this.inventoryItems.filter(item => {
      if (!item.expiryDate) return false;
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
      .sort((a, b) => (b.soldLastMonth || 0) - (a.soldLastMonth || 0))
      .slice(0, 5);

    this.topSellingChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: topItems.map(item => item.name),
        datasets: [{
          label: 'Units Sold',
          data: topItems.map(item => item.soldLastMonth || 0),
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

  // Store original values before editing
  private originalValues: Map<string, InventoryItem> = new Map();

  // Enable editing for a row
  editItem(item: InventoryItem): void {
    // Store original values in case of cancel
    if (item._id) {
      this.originalValues.set(item._id, { ...item });
    }
    item.isEditing = true;
  }

  // Save edited item to MongoDB
  saveItem(item: InventoryItem): void {
    if (!item._id) {
      alert('Cannot save item without ID');
      return;
    }

    // Prepare update data
    const updateData = {
      name: item.name,
      description: item.description,
      category: item.category,
      stock: item.stock,
      price: item.price,
      threshold: item.threshold,
      expiryDate: item.expiryDate,
      soldLastMonth: item.soldLastMonth
    };

    this.productService.updateProduct(item._id, updateData).subscribe({
      next: (updatedProduct) => {
        item.isEditing = false;
        this.originalValues.delete(item._id!);
        this.calculateStats();
        this.checkExpiringItems();
        setTimeout(() => this.renderCharts(), 100);
        alert('Product updated successfully!');
      },
      error: (error) => {
        console.error('Error updating product:', error);
        alert('Error updating product. Please try again.');
      }
    });
  }

  // Cancel editing and restore original values
  cancelEdit(item: InventoryItem): void {
    if (item._id && this.originalValues.has(item._id)) {
      const original = this.originalValues.get(item._id)!;
      Object.assign(item, original);
      this.originalValues.delete(item._id);
    }
    item.isEditing = false;
  }

  // Delete item from MongoDB
  deleteItem(item: InventoryItem): void {
    if (!item._id) {
      alert('Cannot delete item without ID');
      return;
    }

    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      this.productService.deleteProduct(item._id).subscribe({
        next: () => {
          // Remove from local array
          this.inventoryItems = this.inventoryItems.filter(i => i._id !== item._id);
          this.calculateStats();
          this.checkExpiringItems();
          setTimeout(() => this.renderCharts(), 100);
          alert('Product deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Error deleting product. Please try again.');
        }
      });
    }
  }

  // Get stock status class for styling
  getStockStatusClass(item: InventoryItem): string {
    if (item.stock === 0) return 'table-danger';
    if (item.threshold && item.stock <= item.threshold) return 'table-warning';
    return '';
  }

  // Get stock status badge
  getStockStatus(item: InventoryItem): string {
    if (item.stock === 0) return 'OUT OF STOCK';
    if (item.threshold && item.stock <= item.threshold) return 'LOW';
    return 'OK';
  }

  // Get badge class
  getBadgeClass(item: InventoryItem): string {
    if (item.stock === 0) return 'badge bg-danger';
    if (item.threshold && item.stock <= item.threshold) return 'badge bg-warning text-dark';
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
