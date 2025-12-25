import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient, HttpParams } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../core/services/auth.service';
import { Product, ProductCategory, ProductStatus } from '../../../core/models/product.model';

@Component({
  selector: 'app-all-products',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, NavbarComponent],
  template: `
    <div class="page">
      <app-navbar [role]="'admin'" [userName]="adminName" (signOut)="signOut()"></app-navbar>
      <div class="content">
        <div class="container">
          <div class="header-row">
            <h1>Products</h1>
            <a routerLink="/admin/products/new" class="btn primary">＋ Add Product</a>
          </div>

          <div class="filters-section">
            <div class="filters-row">
              <input class="input" placeholder="Product ID" [(ngModel)]="productId" (keyup.enter)="search()">
              <input class="input" placeholder="Name" [(ngModel)]="name" (keyup.enter)="search()">
              <select class="input" [(ngModel)]="category">
                <option value="">All Categories</option>
                <option *ngFor="let cat of categories" [value]="cat">{{cat}}</option>
              </select>
              <select class="input" [(ngModel)]="status">
                <option value="">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>
            <div class="filters-row">
              <input type="number" class="input" placeholder="Min Price" [(ngModel)]="minPrice" (keyup.enter)="search()" step="0.01">
              <input type="number" class="input" placeholder="Max Price" [(ngModel)]="maxPrice" (keyup.enter)="search()" step="0.01">
              <input type="number" class="input" placeholder="Min Stock" [(ngModel)]="minStock" (keyup.enter)="search()">
              <button class="btn primary" (click)="search()">Search</button>
              <button class="btn" (click)="clearFilters()">Clear</button>
              <a routerLink="/admin/products/bulk-upload" class="btn">⇪ Bulk Upload</a>
            </div>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let p of rows">
                  <td>{{p.productId}}</td>
                  <td>{{p.name}}</td>
                  <td>{{p.category}}</td>
                  <td>{{'₹' + p.price}}</td>
                  <td>{{p.quantityAvailable}}</td>
                  <td><span [class]="'status-badge ' + (p.status === 'ACTIVE' ? 'active' : 'inactive')">{{p.status}}</span></td>
                  <td>
                    <button class="link " (click)="editProduct(p)">Edit</button>
                    <button class="link danger" (click)="remove(p.productId)">Remove</button>
                  </td>
                </tr>
                <tr *ngIf="rows.length === 0">
                  <td colspan="7" class="empty">No products found</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Edit Modal -->
          <div *ngIf="editingProduct" class="modal-overlay" (click)="cancelEdit()">
            <div class="modal-content" (click)="$event.stopPropagation()">
              <h3>Edit Product</h3>
              <form (ngSubmit)="updateProduct()">
                <div class="form-group">
                  <label>Product Name *</label>
                  <input 
                    type="text" 
                    [(ngModel)]="editingProduct.name" 
                    name="productName" 
                    class="form-control" 
                    required
                  />
                </div>

                <div class="form-group">
                  <label>Description</label>
                  <textarea 
                    [(ngModel)]="editingProduct.description" 
                    name="description" 
                    class="form-control" 
                    rows="3"
                  ></textarea>
                </div>

                <div class="form-row">
                  <div class="form-group">
                    <label>Price *</label>
                    <input 
                      type="number" 
                      [(ngModel)]="editingProduct.price" 
                      name="price" 
                      class="form-control" 
                      min="0"
                      step="0.01"
                      required
                    />
                  </div>

                  <div class="form-group">
                    <label>Stock *</label>
                    <input 
                      type="number" 
                      [(ngModel)]="editingProduct.quantityAvailable" 
                      name="stock" 
                      class="form-control" 
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div class="form-group">
                  <label>Category</label>
                  <input 
                    type="text" 
                    [(ngModel)]="editingProduct.category" 
                    name="category" 
                    class="form-control"
                  />
                </div>

                <div class="form-group">
                  <label>Image URL</label>
                  <input 
                    type="url" 
                    [(ngModel)]="editingProduct.imageUrl" 
                    name="imageUrl" 
                    class="form-control"
                  />
                </div>

                <div class="form-group">
                  <label>
                    <input 
                      type="checkbox"
                      [checked]="editingProduct.status === 'ACTIVE'"
                      (change)="changeStatus()"
                      name="isActive"
                    />
                    Active
                  </label>
                </div>

                <div class="modal-actions">
                  <button type="submit" class="btn primary">Save</button>
                  <button type="button" class="btn secondary" (click)="cancelEdit()">Cancel</button>
                </div>
              </form>
            </div>
          </div>
          <div class="pager" *ngIf="totalPages > 1">
            <button class="btn" [disabled]="page===0" (click)="prev()">← Prev</button>
            <span>Page {{page+1}} of {{totalPages}}</span>
            <button class="btn" [disabled]="page>=totalPages-1" (click)="next()">Next →</button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page{min-height:100vh;background:#EAEDED}
    .content{padding:20px}
    .container{max-width:1400px;margin:0 auto}
    .header-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
    .filters-section{background:#fff;padding:16px;border-radius:8px;margin-bottom:16px}
    .filters-row{display:flex;gap:10px;align-items:center;margin-bottom:10px}
    .filters-row:last-child{margin-bottom:0}
    .input{padding:8px 10px;border:1px solid #ddd;border-radius:4px;font-size:14px}
    .input:focus{outline:none;border-color:#FF9900}
    .btn{padding:8px 16px;border:1px solid #ddd;border-radius:4px;background:#fff;cursor:pointer;font-size:14px;text-decoration:none;display:inline-block}
    .btn.primary{background:#FF9900;border-color:#FF9900;color:#fff}
    .btn.primary:hover{background:#FFB84D}
    .btn:hover{background:#f5f5f5}
    .table-wrap{background:#fff;border-radius:8px;overflow:auto;box-shadow:0 1px 3px rgba(0,0,0,0.1)}
    table{width:100%;border-collapse:collapse}
    th,td{padding:12px;border-bottom:1px solid #eee;font-size:14px;text-align:left}
    thead th{background:#fafafa;font-weight:600;color:#111}
    .status-badge{padding:4px 8px;border-radius:4px;font-size:12px;font-weight:500}
    .status-badge.active{background:#d4edda;color:#155724}
    .status-badge.inactive{background:#f8d7da;color:#721c24}
    .link{background:none;border:none;color:#0066c0;text-decoration:underline;cursor:pointer;font-size:14px;margin-right:12px}
    .link:hover{color:#c45500}
    .link.danger{color:#c40000}
    .link.danger:hover{color:#8b0000}
    .pager{display:flex;gap:12px;align-items:center;justify-content:center;margin-top:16px}
    .empty{text-align:center;color:#666;padding:20px}
    .modal-overlay {position: fixed;top: 0;left: 0;right: 0;bottom: 0;background-color: rgba(0,0,0,0.6);display: flex;justify-content: center;align-items: center;z-index: 1000;}
    .modal-content {background: #fff;border-radius: 4px;padding: 30px;width: 90%;max-width: 600px;max-height: 90vh;overflow-y: auto;box-shadow: 0 4px 20px rgba(0,0,0,0.3);border: 1px solid #D5D9D9;}
    .modal-content h3 {margin: 0 0 20px 0;color: #0F1111;font-size: 20px;font-weight: 400;}
    .form-row {display: grid;grid-template-columns: 1fr 1fr;gap: 15px;}
    .modal-actions {display: flex;gap: 10px;margin-top: 20px;}
    .modal-actions button {flex: 1;}
  `]
})
export class AllProductsComponent implements OnInit {
  rows: any[] = [];
  page = 0;
  size = 10;
  totalPages = 0;
  productId = '';
  name = '';
  category = '';
  status = '';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  minStock: number | null = null;
  adminName = '';
  categories = Object.values(ProductCategory);
  editingProduct : Product | null = null;

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    const currentUser = this.auth.getCurrentUser();
    this.adminName = currentUser?.username || currentUser?.customerName || 'Admin';
    this.load();
  }

  private buildParams(): HttpParams {
    let params = new HttpParams()
      .set('page', this.page.toString())
      .set('size', this.size.toString());
    if (this.productId) params = params.set('productId', this.productId);
    if (this.name) params = params.set('name', this.name);
    if (this.category) params = params.set('category', this.category);
    if (this.status) params = params.set('status', this.status);
    if (this.minPrice !== null && this.minPrice !== undefined) params = params.set('minPrice', this.minPrice.toString());
    if (this.maxPrice !== null && this.maxPrice !== undefined) params = params.set('maxPrice', this.maxPrice.toString());
    if (this.minStock !== null && this.minStock !== undefined) params = params.set('minStock', this.minStock.toString());
    return params;
  }

  load(){
    this.http.get<any>('http://localhost:8080/api/admin/products', { params: this.buildParams() }).subscribe({
      next: (res) => { this.rows = res.content || []; this.totalPages = res.totalPages || 0; },
      error: () => { this.rows = []; this.totalPages = 0; }
    });
  }

  search(){ this.page = 0; this.load(); }
  
  clearFilters(){
    this.productId = '';
    this.name = '';
    this.category = '';
    this.status = '';
    this.minPrice = null;
    this.maxPrice = null;
    this.minStock = null;
    this.page = 0;
    this.load();
  }

  prev(){ if(this.page>0){ this.page--; this.load(); } }
  next(){ if(this.page < this.totalPages-1){ this.page++; this.load(); } }

  changeStatus() {
    if (this.editingProduct!.status === ProductStatus.ACTIVE) {
      this.editingProduct!.status = ProductStatus.INACTIVE;
    }
    else if (this.editingProduct!.status === ProductStatus.INACTIVE) {
      this.editingProduct!.status = ProductStatus.ACTIVE;
    }
  }

  remove(id: string){
    if(confirm('Remove this product? This will mark it as inactive.')){
      this.http.delete(`http://localhost:8080/api/admin/products/${id}`).subscribe({
        next: () => {
          alert('Product removed successfully');
          this.load();
        },
        error: (err) => alert(err.error?.message || 'Error removing product')
      });
    }
  }

  editProduct(product : Product) {
    this.editingProduct = {...product};
  }

  cancelEdit() {
    this.editingProduct = null;
  }

  updateProduct() {
    this.http.put(`http://localhost:8080/api/admin/products/${this.editingProduct?.productId}`, this.editingProduct).subscribe({
      next: (response) => {
        this.cancelEdit();
        alert("Product updated successfully!");
        this.load();
      },
      error: (err) => {
        alert(`Updating product failed. ${err.content.message}`);
      }
    })
  }

  signOut(){
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}

