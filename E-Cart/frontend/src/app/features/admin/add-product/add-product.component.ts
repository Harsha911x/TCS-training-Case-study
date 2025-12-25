import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ProductCategory, ProductStatus } from '../../../core/models/product.model';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-add-product',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="page">
      <app-navbar [role]="'admin'" [userName]="adminName" (signOut)="signOut()"></app-navbar>
      <div class="content">
        <div class="container">
          <div *ngIf="!showSuccess" class="form-section">
            <div class="header-row">
              <h1>Add Product</h1>
              <a routerLink="/admin/products/all" class="btn secondary">← Back to Products</a>
            </div>

            <form [formGroup]="productForm" (ngSubmit)="onSubmit()" class="product-form">
              <div class="form-grid">
                <div class="form-group">
                  <label for="name">Product Name *</label>
                  <input 
                    type="text" 
                    id="name" 
                    formControlName="name" 
                    maxlength="50"
                    placeholder="Enter product name"
                    [class.error]="productForm.get('name')?.invalid && productForm.get('name')?.touched">
                  <div *ngIf="productForm.get('name')?.hasError('required') && productForm.get('name')?.touched" 
                       class="error-text">Product name is required</div>
                  <div *ngIf="productForm.get('name')?.hasError('maxlength')" 
                       class="error-text">Product name must not exceed 50 characters</div>
                </div>

                <div class="form-group">
                  <label for="price">Product Price *</label>
                  <input 
                    type="number" 
                    id="price" 
                    formControlName="price" 
                    step="0.01" 
                    min="0.01"
                    placeholder="0.00"
                    [class.error]="productForm.get('price')?.invalid && productForm.get('price')?.touched">
                  <div *ngIf="productForm.get('price')?.hasError('required') && productForm.get('price')?.touched" 
                       class="error-text">Price is required</div>
                  <div *ngIf="productForm.get('price')?.hasError('min')" 
                       class="error-text">Price must be greater than 0</div>
                </div>

                <div class="form-group">
                  <label for="category">Product Category *</label>
                  <select 
                    id="category" 
                    formControlName="category"
                    [class.error]="productForm.get('category')?.invalid && productForm.get('category')?.touched">
                    <option value="">Select Category</option>
                    <option *ngFor="let cat of categories" [value]="cat">{{cat}}</option>
                  </select>
                  <div *ngIf="productForm.get('category')?.hasError('required') && productForm.get('category')?.touched" 
                       class="error-text">Category is required</div>
                </div>

                <div class="form-group">
                  <label for="quantityAvailable">Quantity Available *</label>
                  <input 
                    type="number" 
                    id="quantityAvailable" 
                    formControlName="quantityAvailable" 
                    min="0"
                    placeholder="0"
                    [class.error]="productForm.get('quantityAvailable')?.invalid && productForm.get('quantityAvailable')?.touched">
                  <div *ngIf="productForm.get('quantityAvailable')?.hasError('required') && productForm.get('quantityAvailable')?.touched" 
                       class="error-text">Quantity is required</div>
                  <div *ngIf="productForm.get('quantityAvailable')?.hasError('min')" 
                       class="error-text">Quantity must be 0 or greater</div>
                </div>

                <div class="form-group">
                  <label for="status">Product Status *</label>
                  <select 
                    id="status" 
                    formControlName="status"
                    [class.error]="productForm.get('status')?.invalid && productForm.get('status')?.touched">
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                  <div class="help-text">Active products will be visible to customers</div>
                </div>

                <div class="form-group full-width">
                  <label for="description">Product Description</label>
                  <textarea 
                    id="description" 
                    formControlName="description" 
                    maxlength="200"
                    rows="4"
                    placeholder="Enter product description (max 200 characters)"
                    [class.error]="productForm.get('description')?.hasError('maxlength')"></textarea>
                  <div class="char-count">{{productForm.get('description')?.value?.length || 0}}/200</div>
                  <div *ngIf="productForm.get('description')?.hasError('maxlength')" 
                       class="error-text">Description must not exceed 200 characters</div>
                </div>

                <div class="form-group full-width">
                  <label for="imageUrl">Product Image URL *</label>
                  <input 
                    type="url" 
                    id="imageUrl" 
                    formControlName="imageUrl"
                    placeholder="https://example.com/image.jpg"
                    [class.error]="productForm.get('imageUrl')?.invalid && productForm.get('imageUrl')?.touched">
                  <div *ngIf="productForm.get('imageUrl')?.hasError('required') && productForm.get('imageUrl')?.touched" 
                       class="error-text">Image URL is required</div>
                  <div class="help-text">Enter the full URL to the product image (e.g., https://example.com/products/image.jpg)</div>
                  <div *ngIf="imagePreview" class="image-preview-section">
                    <div class="preview-label">Preview:</div>
                    <img [src]="imagePreview" alt="Preview" class="preview-img" (error)="onImageLoadError()"
                         onerror="this.style.display='none'">
                    <div *ngIf="imageLoadError" class="error-text">Unable to load image from URL</div>
                  </div>
                </div>
              </div>

              <div *ngIf="errorMessage" class="error-box">
                {{errorMessage}}
              </div>

              <div class="form-actions">
                <button type="button" (click)="resetForm()" class="btn secondary">Reset</button>
                <button type="submit" [disabled]="productForm.invalid || isSubmitting" 
                        class="btn primary" [class.loading]="isSubmitting">
                  <span *ngIf="!isSubmitting">Add Product</span>
                  <span *ngIf="isSubmitting">Adding...</span>
                </button>
              </div>
            </form>
          </div>

          <div *ngIf="showSuccess && createdProduct" class="success-section">
            <div class="success-box">
              <div class="success-icon">✓</div>
              <h2 class="success-title">Product Added Successfully</h2>
              
              <div class="product-details-box">
                <h3>Product Details</h3>
                <div class="detail-row">
                  <span class="label">Product ID:</span>
                  <span class="value highlight">{{createdProduct.productId}}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Product Name:</span>
                  <span class="value">{{createdProduct.name}}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Product Price:</span>
                  <span class="value amount">{{ '₹' + createdProduct.price }}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Product Category:</span>
                  <span class="value">{{createdProduct.category}}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Product Description:</span>
                  <span class="value">{{createdProduct.description || '-'}}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Quantity Available:</span>
                  <span class="value">{{createdProduct.quantityAvailable}}</span>
                </div>
                <div class="detail-row">
                  <span class="label">Status:</span>
                  <span class="value status-badge" [class.status-active]="createdProduct.status === 'ACTIVE'"
                        [class.status-inactive]="createdProduct.status === 'INACTIVE'">
                    {{createdProduct.status}}
                  </span>
                </div>
              </div>

              <div class="success-actions">
                <button (click)="addAnother()" class="btn primary">Add Another Product</button>
                <button (click)="goToProducts()" class="btn secondary">View All Products</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page{min-height:100vh;background:#EAEDED}
    .content{padding:20px}
    .container{max-width:900px;margin:0 auto}
    .header-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
    h1{font-size:28px;font-weight:400;color:#111;margin:0}
    .form-section{background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
    .product-form{margin-top:20px}
    .form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin-bottom:20px}
    .form-group{display:flex;flex-direction:column}
    .form-group.full-width{grid-column:1/-1}
    .form-group label{font-size:14px;font-weight:600;color:#111;margin-bottom:8px}
    .form-group input,.form-group select,.form-group textarea{padding:10px;border:1px solid #ddd;border-radius:4px;font-size:14px;font-family:inherit;transition:border-color 0.2s}
    .form-group input:focus,.form-group select:focus,.form-group textarea:focus{outline:none;border-color:#FF9900;box-shadow:0 0 3px 2px rgba(255,153,0,0.3)}
    .form-group input.error,.form-group select.error,.form-group textarea.error{border-color:#c40000}
    .form-group textarea{resize:vertical}
    .char-count{font-size:12px;color:#767676;text-align:right;margin-top:4px}
    .help-text{font-size:12px;color:#767676;margin-top:4px}
    .error-text{color:#c40000;font-size:12px;margin-top:4px}
    .image-upload-section{margin-top:8px}
    .file-input{padding:8px;border:1px solid #ddd;border-radius:4px;font-size:14px}
    .image-preview-section{margin-top:12px;border-top:1px solid #ddd;padding-top:12px}
    .preview-label{font-size:13px;color:#767676;margin-bottom:8px;font-weight:500}
    .preview-img{width:120px;height:120px;object-fit:cover;border-radius:4px;border:1px solid #ddd}
    .upload-hint{font-size:12px;color:#767676;margin-top:8px}
    .error-box{background:#fff4f4;border:1px solid #c40000;border-radius:4px;padding:12px;margin-bottom:15px;color:#c40000;font-size:13px}
    .form-actions{display:flex;gap:15px;justify-content:flex-end;margin-top:20px}
    .btn{padding:12px 24px;border:1px solid #ddd;border-radius:4px;cursor:pointer;font-size:14px;font-weight:500;text-decoration:none;display:inline-block;transition:all 0.2s}
    .btn:disabled{opacity:0.5;cursor:not-allowed}
    .btn.primary{background:#FF9900;border-color:#FF9900;color:#fff}
    .btn.primary:hover:not(:disabled){background:#FFB84D}
    .btn.secondary{background:#fff;color:#111}
    .btn.secondary:hover{background:#f5f5f5}
    .success-section{background:#fff;padding:40px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
    .success-box{text-align:center}
    .success-icon{font-size:64px;color:#28a745;margin-bottom:20px}
    .success-title{font-size:24px;color:#111;margin-bottom:30px}
    .product-details-box{background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0;text-align:left}
    .product-details-box h3{font-size:18px;margin-bottom:15px;color:#111}
    .detail-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e7e7e7}
    .detail-row:last-child{border-bottom:none}
    .label{font-size:14px;color:#767676}
    .value{font-size:14px;font-weight:500;color:#111}
    .value.highlight{font-size:16px;font-weight:700;color:#0066c0}
    .value.amount{font-size:16px;font-weight:700;color:#B12704}
    .status-badge{padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500}
    .status-active{background:#d4edda;color:#155724}
    .status-inactive{background:#f8d7da;color:#721c24}
    .success-actions{display:flex;gap:15px;justify-content:center;margin-top:30px}
  `]
})
export class AddProductComponent implements OnInit {
  productForm: FormGroup;
  categories = Object.values(ProductCategory);
  imagePreview: string | null = null;
  imageLoadError = false;
  showSuccess = false;
  createdProduct: any = null;
  errorMessage = '';
  isSubmitting = false;
  adminName = '';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {
    this.productForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      price: ['', [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      description: ['', Validators.maxLength(200)],
      quantityAvailable: ['', [Validators.required, Validators.min(0)]],
      status: ['ACTIVE', Validators.required],
      imageUrl: ['', Validators.required]
    });
  }

  ngOnInit() {
    const currentUser = this.auth.getCurrentUser();
    this.adminName = currentUser?.username || currentUser?.customerName || 'Admin';
    
    // Listen to imageUrl changes to show preview
    this.productForm.get('imageUrl')?.valueChanges.subscribe(url => {
      if (url && this.isValidUrl(url)) {
        this.imagePreview = url;
        this.imageLoadError = false;
      } else {
        this.imagePreview = null;
        this.imageLoadError = false;
      }
    });
  }

  isValidUrl(string: string): boolean {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  onImageLoadError() {
    this.imageLoadError = true;
  }

  onSubmit() {
    if (this.productForm.invalid) {
      this.productForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const formData = this.productForm.value;
    
    this.http.post<any>('http://localhost:8080/api/admin/products', formData).subscribe({
      next: (response) => {
        this.createdProduct = response.product;
        this.showSuccess = true;
        this.isSubmitting = false;
      },
      error: (err) => {
        this.isSubmitting = false;
        const errorMsg = err.error?.message || 'Error adding product';
        if (errorMsg.includes('name') || errorMsg.includes('price') || errorMsg.includes('category') || 
            errorMsg.includes('description') || errorMsg.includes('count') || errorMsg.includes('quantity') ||
            errorMsg.includes('imageUrl')) {
          this.errorMessage = 'Please check all required fields (name, price, category, imageUrl)';
        } else {
          this.errorMessage = errorMsg;
        }
      }
    });
  }

  resetForm() {
    this.productForm.reset({
      status: 'ACTIVE'
    });
    this.imagePreview = null;
    this.imageLoadError = false;
    this.errorMessage = '';
  }

  addAnother() {
    this.showSuccess = false;
    this.createdProduct = null;
    this.resetForm();
  }

  goToProducts() {
    this.router.navigate(['/admin/products/all']);
  }

  signOut() {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
