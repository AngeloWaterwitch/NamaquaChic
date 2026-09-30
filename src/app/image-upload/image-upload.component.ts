import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpEventType } from '@angular/common/http';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.component.html',
  styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent {
  @Input() folder     = 'uploads';
  @Input() currentUrl = '';
  @Input() label      = 'Image';
  @Output() uploaded  = new EventEmitter<string>();
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  uploading = false;
  progress  = 0;
  error     = '';
  dragOver  = false;

  constructor(private api: ApiService) {}

  openPicker(): void { this.fileInput.nativeElement.click(); }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.length) this.handleFile(input.files[0]);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault(); this.dragOver = false;
    const file = event.dataTransfer?.files[0];
    if (file) this.handleFile(file);
  }

  onDragOver(event: DragEvent): void { event.preventDefault(); this.dragOver = true; }
  onDragLeave(): void { this.dragOver = false; }

  handleFile(file: File): void {
    this.error = '';
    const allowed = ['image/jpeg','image/png','image/webp','image/gif'];
    if (!allowed.includes(file.type)) { this.error = 'Only JPG, PNG, WebP and GIF allowed.'; return; }
    if (file.size > 5 * 1024 * 1024) { this.error = 'Image must be under 5MB.'; return; }

    this.uploading = true; this.progress = 0;

    this.api.uploadImage(file, this.folder).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.progress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response) {
          const res = event.body as { url: string };
          this.currentUrl = res.url;
          this.uploaded.emit(res.url);
          this.uploading = false; this.progress = 0;
          this.fileInput.nativeElement.value = '';
        }
      },
      error: () => {
        this.error = 'Upload failed. Please try again.';
        this.uploading = false; this.progress = 0;
      }
    });
  }

  clearImage(): void { this.currentUrl = ''; this.uploaded.emit(''); }
}
