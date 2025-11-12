import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CartComponent } from './cart.component';
import { CartService } from '../../services/cart.service';

describe('CartComponent', () => {
  let component: CartComponent;
  let fixture: ComponentFixture<CartComponent>;
  let cartService: CartService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CartComponent],
      imports: [HttpClientTestingModule],
      providers: [CartService]
    }).compileComponents();

    fixture = TestBed.createComponent(CartComponent);
    component = fixture.componentInstance;
    cartService = TestBed.inject(CartService);

    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should calculate totals correctly', () => {
    cartService.addToCart({
      _id: '1',
      name: 'Test Product',
      price: 100,
      quantity: 2,
      stock: 10
    });

    component.cart = cartService.getCart();
    component.calculateTotals();

    expect(component.totalAmount).toBe(200);
    expect(component.totalQuantity).toBe(2);
  });

  it('should clear cart after buyNow()', () => {
    spyOn(cartService, 'clearCart').and.callThrough();

    component.cart = [
      { _id: '1', name: 'P1', price: 100, quantity: 1, stock: 10 }
    ];
    component.totalAmount = 100;
    component.totalQuantity = 1;

    spyOn(window, 'alert'); // mock alert so it doesn’t break test
    component.buyNow();

    expect(cartService.clearCart).toHaveBeenCalled();
  });
});
