import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CartService } from '../../services/cart.service';

interface Product {
  _id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  stock: number;
  quantity?: number;
  inCart?: boolean;
}

@Component({
  selector: 'app-customer-shop',
  templateUrl: './customer-shop.component.html',
  styleUrls: ['./customer-shop.component.css']
})
export class CustomerShopComponent implements OnInit {
  products: Product[] = [];
  cart: Product[] = [];

  constructor(private http: HttpClient, private cartService: CartService) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  // Load all products from backend
  loadProducts() {
    this.http.get<Product[]>('http://localhost:3000/api/products')
      .subscribe(data => {
        this.products = data.map(p => ({
          _id: p._id,
          name: p.name,
          description: p.description,
          category: p.category,
          price: p.price,
          stock: p.stock,
          inCart: false,
          quantity: 0
        }));
      });
  }

  // Add product to local cart and shared service
  addToCart(product: Product) {
    product.inCart = true;
    product.quantity = 1;
    this.cart.push(product);
    this.cartService.addToCart(product);
    console.log('Product added to cart:', product);
    console.log('Cart contents:', this.cartService.getCart());
  }

  // Increase product quantity
  increaseQty(product: Product) {
    if (product.quantity! < product.stock) {
      product.quantity!++;
      this.cartService.updateQuantity(product._id, product.quantity!);
    }
  }

  // Decrease product quantity
  decreaseQty(product: Product) {
    if (product.quantity! > 1) {
      product.quantity!--;
      this.cartService.updateQuantity(product._id, product.quantity!);
    } else {
      this.removeFromCart(product);
    }
  }

  // Remove product from cart
  removeFromCart(product: Product) {
    product.inCart = false;
    product.quantity = 0;
    this.cart = this.cart.filter(p => p._id !== product._id);
  }
}
