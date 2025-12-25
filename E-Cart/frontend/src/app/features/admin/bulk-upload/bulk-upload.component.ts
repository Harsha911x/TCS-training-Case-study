import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NavbarComponent } from '../../../shared/components/navbar/navbar.component';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, RouterLink, NavbarComponent],
  template: `
    <div class="page">
      <app-navbar [role]="'admin'" [userName]="adminName" (signOut)="signOut()"></app-navbar>
      <div class="content">
        <div class="container">
          <div class="header-row">
            <h1>Bulk Upload Products</h1>
            <a routerLink="/admin/products" class="btn secondary">← Back to Products</a>
          </div>

          <div class="upload-section">
            <div class="info-box">
              <h3>📋 Upload Instructions</h3>
              <p>Upload a CSV file with the following columns:</p>
              <ul>
                <li><strong>name</strong> - Product name (required, max 50 chars)</li>
                <li><strong>price</strong> - Product price (required, must be > 0)</li>
                <li><strong>category</strong> - Product category (required: ELECTRONICS, CLOTHING, BOOKS, HOME, SPORTS, TOYS, FOOD, OTHER)</li>
                <li><strong>description</strong> - Product description (optional, max 200 chars)</li>
                <li><strong>quantityAvailable</strong> - Available quantity (required, must be >= 0)</li>
                <li><strong>imageUrl</strong> - Image URL for the product (optional)</li>
                <li><strong>status</strong> - Product status (optional: ACTIVE or INACTIVE, defaults to ACTIVE)</li>
              </ul>
              <p class="note"><strong>Note:</strong> First row should contain headers. Product names must be unique.</p>
            </div>

            <div class="upload-box">
              <input 
                type="file" 
                id="fileInput" 
                accept=".csv,.xls,.xlsx"
                (change)="onFileSelected($event)"
                class="file-input">
              <label for="fileInput" class="file-label">
                <span class="upload-icon">📁</span>
                <span>{{selectedFile ? selectedFile.name : 'Choose CSV file'}}</span>
              </label>
            </div>

            <div *ngIf="selectedFile" class="file-info">
              <p><strong>Selected File:</strong> {{selectedFile.name}}</p>
              <p><strong>Size:</strong> {{(selectedFile.size / 1024).toFixed(2)}} KB</p>
              <button (click)="clearFile()" class="btn danger">Remove File</button>
            </div>

            <div *ngIf="errorMessage" class="error-box">
              {{errorMessage}}
            </div>

            <div *ngIf="uploadResult" class="result-box">
              <h3>Upload Results</h3>
              <div class="result-stats">
                <div class="stat-item success">
                  <span class="stat-label">Success:</span>
                  <span class="stat-value">{{uploadResult.successCount}}</span>
                </div>
                <div class="stat-item error">
                  <span class="stat-label">Errors:</span>
                  <span class="stat-value">{{uploadResult.errorCount}}</span>
                </div>
              </div>
              <div *ngIf="uploadResult.errors && uploadResult.errors.length > 0" class="errors-list">
                <h4>Errors:</h4>
                <ul>
                  <li *ngFor="let error of uploadResult.errors">{{error}}</li>
                </ul>
              </div>
            </div>

            <div class="actions">
              <button (click)="uploadFile()" [disabled]="!selectedFile || isUploading" 
                      class="btn primary" [class.loading]="isUploading">
                <span *ngIf="!isUploading">Upload Products</span>
                <span *ngIf="isUploading">Uploading...</span>
              </button>
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
    .upload-section{background:#fff;padding:30px;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)}
    .info-box{background:#f8f9fa;padding:20px;border-radius:8px;margin-bottom:20px}
    .info-box h3{font-size:18px;margin-bottom:12px;color:#111}
    .info-box p{font-size:14px;color:#555;margin:8px 0}
    .info-box ul{font-size:14px;color:#555;margin:10px 0;padding-left:20px}
    .info-box li{margin:6px 0}
    .note{background:#fff3cd;border:1px solid #ffc107;padding:12px;border-radius:4px;margin-top:12px;color:#856404}
    .upload-box{position:relative;margin:20px 0}
    .file-input{position:absolute;opacity:0;width:0;height:0}
    .file-label{display:flex;align-items:center;gap:12px;padding:20px;border:2px dashed #ddd;border-radius:8px;cursor:pointer;transition:all 0.2s;background:#fafafa}
    .file-label:hover{border-color:#FF9900;background:#fff8f0}
    .upload-icon{font-size:32px}
    .file-info{background:#f8f9fa;padding:15px;border-radius:8px;margin:15px 0}
    .file-info p{margin:6px 0;font-size:14px;color:#555}
    .error-box{background:#fff4f4;border:1px solid #c40000;border-radius:4px;padding:12px;margin:15px 0;color:#c40000;font-size:13px}
    .result-box{background:#f8f9fa;padding:20px;border-radius:8px;margin:20px 0}
    .result-box h3{font-size:18px;margin-bottom:15px;color:#111}
    .result-stats{display:flex;gap:20px;margin-bottom:15px}
    .stat-item{display:flex;flex-direction:column;gap:4px}
    .stat-label{font-size:12px;color:#767676}
    .stat-value{font-size:24px;font-weight:700}
    .stat-item.success .stat-value{color:#28a745}
    .stat-item.error .stat-value{color:#c40000}
    .errors-list{margin-top:15px}
    .errors-list h4{font-size:14px;color:#111;margin-bottom:8px}
    .errors-list ul{list-style:none;padding:0;margin:0}
    .errors-list li{background:#fff4f4;border-left:3px solid #c40000;padding:8px 12px;margin:6px 0;font-size:13px;color:#721c24}
    .actions{margin-top:20px}
    .btn{padding:12px 24px;border:1px solid #ddd;border-radius:4px;cursor:pointer;font-size:14px;font-weight:500;text-decoration:none;display:inline-block;transition:all 0.2s}
    .btn:disabled{opacity:0.5;cursor:not-allowed}
    .btn.primary{background:#FF9900;border-color:#FF9900;color:#fff}
    .btn.primary:hover:not(:disabled){background:#FFB84D}
    .btn.secondary{background:#fff;color:#111}
    .btn.secondary:hover{background:#f5f5f5}
    .btn.danger{background:#c40000;border-color:#c40000;color:#fff}
    .btn.danger:hover{background:#8b0000}
  `]
})
export class BulkUploadComponent implements OnInit {
  selectedFile: File | null = null;
  uploadResult: any = null;
  errorMessage = '';
  isUploading = false;
  adminName = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit() {
    const currentUser = this.auth.getCurrentUser();
    this.adminName = currentUser?.username || currentUser?.customerName || 'Admin';
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const fileName = file.name.toLowerCase();
      if (!fileName.endsWith('.csv') && !fileName.endsWith('.xls') && !fileName.endsWith('.xlsx')) {
        this.errorMessage = 'Please select a CSV file';
        return;
      }
      this.selectedFile = file;
      this.errorMessage = '';
      this.uploadResult = null;
    }
  }

  clearFile() {
    this.selectedFile = null;
    this.uploadResult = null;
    this.errorMessage = '';
    const fileInput = document.getElementById('fileInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  uploadFile() {
    if (!this.selectedFile) {
      return;
    }

    this.isUploading = true;
    this.errorMessage = '';
    this.uploadResult = null;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post<any>('http://localhost:8080/api/admin/products/bulk-upload', formData).subscribe({
      next: (response) => {
        this.isUploading = false;
        this.uploadResult = response;
        if (response.successCount > 0) {
          setTimeout(() => {
            this.router.navigate(['/admin/products']);
          }, 3000);
        }
      },
      error: (err) => {
        this.isUploading = false;
        this.errorMessage = err.error?.message || 'Error uploading file';
      }
    });
  }

  signOut() {
    this.auth.logout();
    this.router.navigate(['/admin/login']);
  }
}
