import { Component, OnInit } from '@angular/core';
import { Order, OrderService, OrderProduct } from '../../services/order.service';
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {
  orders: Order[] = [];
  products: Product[] = [];
  showAddModal = false;
  selectedProducts: { product: Product; quantity: number }[] = [];
  newOrder: Omit<Order, '_id' | 'orderDate'> = {
    customerName: '',
    customerEmail: '',
    products: [],
    totalAmount: 0,
    status: 'pending'
  };

  constructor(
    private orderService: OrderService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    this.loadOrders();
    this.loadProducts();
  }

  loadOrders(): void {
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        this.orders = orders;
      },
      error: (error) => {
        console.error('Error loading orders:', error);
        alert('Error loading orders. Make sure the backend server is running.');
      }
    });
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
      }
    });
  }

  openAddModal(): void {
    this.showAddModal = true;
  }

  closeAddModal(): void {
    this.showAddModal = false;
    this.resetForm();
  }

  resetForm(): void {
    this.newOrder = {
      customerName: '',
      customerEmail: '',
      products: [],
      totalAmount: 0,
      status: 'pending'
    };
    this.selectedProducts = [];
  }

  addProductToOrder(productId: string): void {
    if (!productId) return;
    const product = this.products.find(p => p._id === productId);
    if (!product) return;

    const existing = this.selectedProducts.find(p => p.product._id === product._id);
    if (existing) {
      existing.quantity++;
    } else {
      this.selectedProducts.push({ product, quantity: 1 });
    }
    this.calculateTotal();
  }

  removeProductFromOrder(productId: string): void {
    this.selectedProducts = this.selectedProducts.filter(p => p.product._id !== productId);
    this.calculateTotal();
  }

  updateQuantity(productId: string, quantity: number): void {
    const product = this.selectedProducts.find(p => p.product._id === productId);
    if (product && quantity > 0) {
      product.quantity = quantity;
      this.calculateTotal();
    }
  }

  calculateTotal(): void {
    this.newOrder.totalAmount = this.selectedProducts.reduce(
      (total, item) => total + (item.product.price * item.quantity), 0
    );
  }

  saveOrder(): void {
    if (!this.newOrder.customerName || !this.newOrder.customerEmail ||
        this.selectedProducts.length === 0) {
      alert('Please fill in all fields and select at least one product.');
      return;
    }

    // Convert selected products to order format
    this.newOrder.products = this.selectedProducts.map(item => ({
      productId: item.product._id!,
      quantity: item.quantity,
      price: item.product.price
    }));

    this.orderService.createOrder(this.newOrder).subscribe({
      next: (order) => {
        this.closeAddModal();
        this.loadOrders();
        alert('Order created successfully!');
      },
      error: (error) => {
        console.error('Error creating order:', error);
        alert('Error creating order. Please try again.');
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending': return 'badge bg-warning';
      case 'processing': return 'badge bg-info';
      case 'shipped': return 'badge bg-primary';
      case 'delivered': return 'badge bg-success';
      case 'cancelled': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }
}
