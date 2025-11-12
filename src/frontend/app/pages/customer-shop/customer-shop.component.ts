import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

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

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  loadProducts() {
    this.http.get<Product[]>('http://localhost:3000/api/products')
      .subscribe(data => {
        // only take the necessary fields for display
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

  addToCart(product: Product) {
    product.inCart = true;
    product.quantity = 1;
    this.cart.push(product);
  }

  increaseQty(product: Product) {
    if (product.quantity! < product.stock) product.quantity!++;
  }

  decreaseQty(product: Product) {
    if (product.quantity! > 1) product.quantity!--;
    else this.removeFromCart(product);
  }

  removeFromCart(product: Product) {
    product.inCart = false;
    product.quantity = 0;
    this.cart = this.cart.filter(p => p._id !== product._id);
  }
}
