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
  editingProduct: Product | null = null;
  newProduct: Omit<Product, '_id' | 'createdAt'> = {
    name: '',
    description: '',
    price: 0,
    category: '',
    stock: 0,
    threshold: 20,
    expiryDate: undefined,
    soldLastMonth: undefined
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
      stock: 0,
      threshold: 20,
      expiryDate: undefined,
      soldLastMonth: undefined
    };
    this.editingProduct = null;
  }

  saveProduct(): void {
    if (!this.newProduct.name || !this.newProduct.description ||
        this.newProduct.price <= 0 || !this.newProduct.category ||
        this.newProduct.stock < 0) {
      alert('Please fill in all fields correctly.');
      return;
    }

    if (this.editingProduct && this.editingProduct._id) {
      // Update existing product - keep soldLastMonth as is
      this.productService.updateProduct(this.editingProduct._id, this.newProduct).subscribe({
        next: (product) => {
          this.closeAddModal();
          this.loadProducts();
          alert('Product updated successfully!');
        },
        error: (error) => {
          console.error('Error updating product:', error);
          alert('Error updating product. Please try again.');
        }
      });
    } else {
      // Create new product - default soldLastMonth to 0 if not provided
      const productData = {
        ...this.newProduct,
        soldLastMonth: this.newProduct.soldLastMonth || 0
      };

      this.productService.createProduct(productData).subscribe({
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

  openEditModal(product: Product): void {
    this.editingProduct = product;
    this.newProduct = {
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      threshold: product.threshold || 20,
      expiryDate: product.expiryDate,
      soldLastMonth: product.soldLastMonth
    };
    this.showAddModal = true;
  }

  deleteProduct(product: Product): void {
    if (!product._id) return;

    if (confirm(`Are you sure you want to delete "${product.name}"?`)) {
      this.productService.deleteProduct(product._id).subscribe({
        next: () => {
          this.loadProducts();
          alert('Product deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting product:', error);
          alert('Error deleting product. Please try again.');
        }
      });
    }
  }
}
