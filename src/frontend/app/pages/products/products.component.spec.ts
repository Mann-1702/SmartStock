import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ProductsComponent } from './products.component';
import { ProductService, Product } from '../../services/product.service';
import { of, throwError } from 'rxjs';

describe('ProductsComponent', () => {
  let component: ProductsComponent;
  let fixture: ComponentFixture<ProductsComponent>;
  let productService: ProductService;
  let httpMock: HttpTestingController;

  const mockProducts: Product[] = [
    {
      _id: '1',
      name: 'Test Product 1',
      description: 'Description 1',
      price: 100,
      category: 'Electronics',
      stock: 50,
      threshold: 20,
      soldLastMonth: 10
    },
    {
      _id: '2',
      name: 'Test Product 2',
      description: 'Description 2',
      price: 50,
      category: 'Food',
      stock: 30,
      threshold: 15,
      soldLastMonth: 5
    }
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProductsComponent ],
      imports: [ HttpClientTestingModule ],
      providers: [ ProductService ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProductsComponent);
    component = fixture.componentInstance;
    productService = TestBed.inject(ProductService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Component Initialization', () => {
    it('should load products on init', () => {
      spyOn(productService, 'getProducts').and.returnValue(of(mockProducts));

      component.ngOnInit();

      expect(productService.getProducts).toHaveBeenCalled();
      expect(component.products.length).toBe(2);
      expect(component.products[0].name).toBe('Test Product 1');
    });

    it('should handle error when loading products fails', () => {
      spyOn(productService, 'getProducts').and.returnValue(
        throwError(() => new Error('Failed to load'))
      );
      spyOn(console, 'error');
      spyOn(window, 'alert');

      component.ngOnInit();

      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Error loading products. Make sure the backend server is running.');
    });
  });

  describe('Add Product Modal', () => {
    it('should open add modal', () => {
      component.openAddModal();

      expect(component.showAddModal).toBe(true);
    });

    it('should close add modal and reset form', () => {
      component.newProduct.name = 'Test';
      component.showAddModal = true;

      component.closeAddModal();

      expect(component.showAddModal).toBe(false);
      expect(component.newProduct.name).toBe('');
    });

    it('should reset form correctly', () => {
      component.newProduct = {
        name: 'Test',
        description: 'Test Desc',
        price: 100,
        category: 'Test Cat',
        stock: 50,
        threshold: 20,
        expiryDate: '2025-12-31',
        soldLastMonth: 10
      };

      component.resetForm();

      expect(component.newProduct.name).toBe('');
      expect(component.newProduct.description).toBe('');
      expect(component.newProduct.price).toBe(0);
      expect(component.newProduct.threshold).toBe(20);
      expect(component.editingProduct).toBeNull();
    });
  });

  describe('Create Product', () => {
    it('should create a new product with valid data', () => {
      component.newProduct = {
        name: 'New Product',
        description: 'New Description',
        price: 75,
        category: 'Food',
        stock: 40,
        threshold: 15,
        expiryDate: undefined,
        soldLastMonth: undefined
      };

      spyOn(productService, 'createProduct').and.returnValue(of(mockProducts[0]));
      spyOn(component, 'closeAddModal');
      spyOn(component, 'loadProducts');
      spyOn(window, 'alert');

      component.saveProduct();

      expect(productService.createProduct).toHaveBeenCalled();
      expect(component.closeAddModal).toHaveBeenCalled();
      expect(component.loadProducts).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Product added successfully!');
    });

    it('should not create product with invalid data', () => {
      component.newProduct = {
        name: '',
        description: '',
        price: 0,
        category: '',
        stock: 0,
        threshold: 20,
        expiryDate: undefined,
        soldLastMonth: undefined
      };

      spyOn(window, 'alert');
      spyOn(productService, 'createProduct');

      component.saveProduct();

      expect(window.alert).toHaveBeenCalledWith('Please fill in all fields correctly.');
      expect(productService.createProduct).not.toHaveBeenCalled();
    });

    it('should handle error when creating product fails', () => {
      component.newProduct = {
        name: 'New Product',
        description: 'New Description',
        price: 75,
        category: 'Food',
        stock: 40,
        threshold: 15,
        expiryDate: undefined,
        soldLastMonth: undefined
      };

      spyOn(productService, 'createProduct').and.returnValue(
        throwError(() => new Error('Failed to create'))
      );
      spyOn(console, 'error');
      spyOn(window, 'alert');

      component.saveProduct();

      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Error adding product. Please try again.');
    });

    it('should default soldLastMonth to 0 when creating new product', () => {
      component.newProduct = {
        name: 'New Product',
        description: 'Description',
        price: 50,
        category: 'Food',
        stock: 30,
        threshold: 10,
        expiryDate: undefined,
        soldLastMonth: undefined
      };

      spyOn(productService, 'createProduct').and.returnValue(of(mockProducts[0]));
      spyOn(component, 'closeAddModal');
      spyOn(component, 'loadProducts');

      component.saveProduct();

      expect(productService.createProduct).toHaveBeenCalledWith(
        jasmine.objectContaining({ soldLastMonth: 0 })
      );
    });
  });

  describe('Update Product', () => {
    it('should update an existing product', () => {
      component.editingProduct = mockProducts[0];
      component.newProduct = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150,
        category: 'Electronics',
        stock: 60,
        threshold: 25,
        expiryDate: undefined,
        soldLastMonth: 10
      };

      spyOn(productService, 'updateProduct').and.returnValue(of(mockProducts[0]));
      spyOn(component, 'closeAddModal');
      spyOn(component, 'loadProducts');
      spyOn(window, 'alert');

      component.saveProduct();

      expect(productService.updateProduct).toHaveBeenCalledWith('1', component.newProduct);
      expect(component.closeAddModal).toHaveBeenCalled();
      expect(component.loadProducts).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Product updated successfully!');
    });

    it('should open edit modal with product data', () => {
      component.openEditModal(mockProducts[0]);

      expect(component.editingProduct).toEqual(mockProducts[0]);
      expect(component.showAddModal).toBe(true);
      expect(component.newProduct.name).toBe('Test Product 1');
      expect(component.newProduct.price).toBe(100);
    });

    it('should handle error when updating product fails', () => {
      component.editingProduct = mockProducts[0];
      component.newProduct = {
        name: 'Updated Product',
        description: 'Updated Description',
        price: 150,
        category: 'Electronics',
        stock: 60,
        threshold: 25,
        expiryDate: undefined,
        soldLastMonth: 10
      };

      spyOn(productService, 'updateProduct').and.returnValue(
        throwError(() => new Error('Failed to update'))
      );
      spyOn(console, 'error');
      spyOn(window, 'alert');

      component.saveProduct();

      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Error updating product. Please try again.');
    });
  });

  describe('Delete Product', () => {
    it('should delete a product after confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(productService, 'deleteProduct').and.returnValue(of(void 0));
      spyOn(component, 'loadProducts');
      spyOn(window, 'alert');

      component.deleteProduct(mockProducts[0]);

      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete "Test Product 1"?');
      expect(productService.deleteProduct).toHaveBeenCalledWith('1');
      expect(component.loadProducts).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Product deleted successfully!');
    });

    it('should not delete product if user cancels confirmation', () => {
      spyOn(window, 'confirm').and.returnValue(false);
      spyOn(productService, 'deleteProduct');

      component.deleteProduct(mockProducts[0]);

      expect(window.confirm).toHaveBeenCalled();
      expect(productService.deleteProduct).not.toHaveBeenCalled();
    });

    it('should not delete product without ID', () => {
      const productWithoutId: Product = {
        name: 'No ID Product',
        description: 'Description',
        price: 50,
        category: 'Food',
        stock: 30,
        threshold: 10
      };

      spyOn(window, 'confirm');
      spyOn(productService, 'deleteProduct');

      component.deleteProduct(productWithoutId);

      expect(window.confirm).not.toHaveBeenCalled();
      expect(productService.deleteProduct).not.toHaveBeenCalled();
    });

    it('should handle error when deleting product fails', () => {
      spyOn(window, 'confirm').and.returnValue(true);
      spyOn(productService, 'deleteProduct').and.returnValue(
        throwError(() => new Error('Failed to delete'))
      );
      spyOn(console, 'error');
      spyOn(window, 'alert');

      component.deleteProduct(mockProducts[0]);

      expect(console.error).toHaveBeenCalled();
      expect(window.alert).toHaveBeenCalledWith('Error deleting product. Please try again.');
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', () => {
      component.newProduct = {
        name: 'Product',
        description: '',
        price: 0,
        category: 'Food',
        stock: 10,
        threshold: 20,
        expiryDate: undefined,
        soldLastMonth: undefined
      };

      spyOn(window, 'alert');
      spyOn(productService, 'createProduct');

      component.saveProduct();

      expect(window.alert).toHaveBeenCalledWith('Please fill in all fields correctly.');
      expect(productService.createProduct).not.toHaveBeenCalled();
    });

    it('should validate price is greater than 0', () => {
      component.newProduct = {
        name: 'Product',
        description: 'Description',
        price: 0,
        category: 'Food',
        stock: 10,
        threshold: 20,
        expiryDate: undefined,
        soldLastMonth: undefined
      };

      spyOn(window, 'alert');

      component.saveProduct();

      expect(window.alert).toHaveBeenCalledWith('Please fill in all fields correctly.');
    });

    it('should validate stock is not negative', () => {
      component.newProduct = {
        name: 'Product',
        description: 'Description',
        price: 50,
        category: 'Food',
        stock: -5,
        threshold: 20,
        expiryDate: undefined,
        soldLastMonth: undefined
      };

      spyOn(window, 'alert');

      component.saveProduct();

      expect(window.alert).toHaveBeenCalledWith('Please fill in all fields correctly.');
    });
  });
});
