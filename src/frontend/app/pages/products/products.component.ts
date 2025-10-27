import { Component, OnInit } from '@angular/core';
import { Product, ProductService } from '../../services/product.service';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css']
})
export class ProductsComponent implements OnInit {
  products: Product[] = [];
  showAddModal = false;
  newProduct: Omit<Product, '_id' | 'createdAt'> = {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0
  };

  constructor(private productService: ProductService) { }

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (products) => {
        this.products = products;
      },
      error: (error) => {
        console.error('Error loading products:', error);
        alert('Error loading products. Make sure the backend server is running.');
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
    this.newProduct = {
      name: '',
      description: '',
      price: 0,
      category: '',
      stock: 0
    };
  }

  saveProduct(): void {
    if (!this.newProduct.name || !this.newProduct.description ||
        this.newProduct.price <= 0 || !this.newProduct.category ||
        this.newProduct.stock < 0) {
      alert('Please fill in all fields correctly.');
      return;
    }

    this.productService.createProduct(this.newProduct).subscribe({
      next: (product) => {
        this.closeAddModal();
        this.loadProducts();
        alert('Product added successfully!');
      },
      error: (error) => {
        console.error('Error adding product:', error);
        alert('Error adding product. Please try again.');
      }
    });
  }
}
