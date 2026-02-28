import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

const IMAGE2URL_UPLOAD = 'https://www.image2url.com/api/upload';
const MAX_IMAGE_SIZE_MB = 2;
const STORAGE_KEY = 'tasbeehGroups';
const STORAGE_STATE_KEY = 'tasbeehState';
const PLACEHOLDER_NAME = '-- Select Tasbeeh --';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './bootstrap.css']
})
export class AppComponent implements OnInit {
  groups = [
    new TasbeehGroup(1, 0, 'Kalima', 'https://image2url.com/r2/default/images/1772265243982-0d098860-3900-45d0-8518-d9d2f2ce2501.jpg'),
    new TasbeehGroup(2, 0, 'Istigfar', 'https://image2url.com/r2/default/images/1772265308437-9e5e0028-a118-48cf-b65b-ab580fc44a23.jpg'),
    new TasbeehGroup(3, 0, 'Midad', 'https://image2url.com/r2/default/images/1772265331414-e56c776d-5e95-4398-adb4-2a3c877ae5c9.jpg'),
    new TasbeehGroup(4, 0, 'Durood', 'https://image2url.com/r2/default/images/1772265286311-318b6568-fe90-4832-a710-54f698a80717.jpg'),
    new TasbeehGroup(5, 0, 'Names of Allah', 'https://image2url.com/r2/default/images/1772265352244-02d5704b-d45c-459a-833b-f8643c1217cf.jpg')
  ];
  selectedId = 0;
  selectedGroup = this.groups[0];
  showImages = true;

  showSettingsModal = false;
  showAddForm = false;
  editingId: number | null = null;
  newTasbeehName = '';
  newTasbeehImageUrl = '';
  editTasbeehName = '';
  editTasbeehImageUrl: string | null = null;
  uploadInProgress = false;
  uploadError = '';

  constructor(private http: Http) {}

  ngOnInit() {
    this.loadFromStorage();
    this.preloadImages();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      const savedState = localStorage.getItem(STORAGE_STATE_KEY);
      if (saved) {
        const raw = JSON.parse(saved);
        if (Array.isArray(raw) && raw.length > 0) {
          this.groups = raw
            .map((g: { id: number; count: number; name: string; image: string }) =>
              new TasbeehGroup(g.id, g.count, g.name, g.image || '')
            )
            .filter(g => g.name !== PLACEHOLDER_NAME);
          for (let i = 0; i < this.groups.length; i++) this.groups[i].id = i;
          if (this.groups.length === 0) {
            this.groups = [
              new TasbeehGroup(0, 0, 'Kalima', 'https://image2url.com/r2/default/images/1772265243982-0d098860-3900-45d0-8518-d9d2f2ce2501.jpg'),
              new TasbeehGroup(1, 0, 'Istigfar', 'https://image2url.com/r2/default/images/1772265308437-9e5e0028-a118-48cf-b65b-ab580fc44a23.jpg'),
              new TasbeehGroup(2, 0, 'Midad', 'https://image2url.com/r2/default/images/1772265331414-e56c776d-5e95-4398-adb4-2a3c877ae5c9.jpg'),
              new TasbeehGroup(3, 0, 'Durood', 'https://image2url.com/r2/default/images/1772265286311-318b6568-fe90-4832-a710-54f698a80717.jpg'),
              new TasbeehGroup(4, 0, 'Names of Allah', 'https://image2url.com/r2/default/images/1772265352244-02d5704b-d45c-459a-833b-f8643c1217cf.jpg')
            ];
          }
        }
      }
      if (savedState) {
        try {
          const state = JSON.parse(savedState);
          const savedIndex = typeof state.selectedId === 'number' ? state.selectedId : parseInt(state.selectedId, 10);
          if (!isNaN(savedIndex) && savedIndex >= 0 && savedIndex < this.groups.length) {
            this.selectedId = savedIndex;
          } else {
            const idx = this.groups.findIndex(g => g.id === state.selectedId || g.id === savedIndex);
            if (idx >= 0) this.selectedId = idx;
          }
          if (typeof state.showImages === 'boolean') this.showImages = state.showImages;
        } catch (_) {}
      }
      this.selectedId = Math.min(Math.max(0, this.selectedId), this.groups.length - 1);
      this.changeGroup();
    } catch (_) {
      this.changeGroup();
    }
  }

  private saveToStorage() {
    try {
      const data = this.groups.map(g => ({ id: g.id, count: g.count, name: g.name, image: g.image }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      const index = typeof this.selectedId === 'number' ? this.selectedId : parseInt(String(this.selectedId), 10);
      const state = { selectedId: isNaN(index) ? 0 : index, showImages: this.showImages };
      localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify(state));
    } catch (_) {}
  }

  /** Preload group images so the browser caches them for instant display when switching groups. */
  private preloadImages() {
    this.groups.forEach(gr => {
      if (!gr.image) return;
      const img = new Image();
      img.src = gr.image.startsWith('http') ? gr.image : 'assets/' + gr.image;
    });
  }

  addCount() {
    this.selectedGroup.count++;
    this.saveToStorage();
  }
  resetCount() {
    this.selectedGroup.count = 0;
    this.saveToStorage();
  }
  openSettingsModal() {
    this.showSettingsModal = true;
    this.showAddForm = false;
    this.editingId = null;
    this.resetAddForm();
  }

  closeSettingsModal() {
    this.showSettingsModal = false;
    this.showAddForm = false;
    this.editingId = null;
    this.resetAddForm();
  }

  resetAddForm() {
    this.newTasbeehName = '';
    this.newTasbeehImageUrl = '';
    this.uploadError = '';
  }

  onModalImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    this.uploadError = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.uploadError = 'Please choose an image (JPG, PNG, GIF, WebP).';
      input.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      this.uploadError = `Image must be under ${MAX_IMAGE_SIZE_MB}MB.`;
      input.value = '';
      return;
    }
    this.uploadInProgress = true;
    this.uploadImageToImage2Url(file).subscribe(
      (url) => {
        this.uploadInProgress = false;
        this.newTasbeehImageUrl = url;
        this.uploadError = '';
      },
      (err) => {
        this.uploadInProgress = false;
        this.uploadError = err.message || 'Upload failed. Try again.';
      }
    );
    input.value = '';
  }

  submitNewTasbeeh() {
    const name = this.newTasbeehName.trim();
    if (!name) return;
    this.groups.push(new TasbeehGroup(this.groups.length, 0, name, this.newTasbeehImageUrl));
    this.selectedId = this.groups.length - 1;
    this.changeGroup();
    this.showAddForm = false;
    this.resetAddForm();
    this.saveToStorage();
  }

  openEditForm(gr: TasbeehGroup) {
    this.editingId = gr.id;
    this.editTasbeehName = gr.name;
    this.editTasbeehImageUrl = null;
    this.uploadError = '';
  }

  cancelEdit() {
    this.editingId = null;
    this.editTasbeehName = '';
    this.editTasbeehImageUrl = null;
    this.uploadError = '';
  }

  onEditImageSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files && input.files[0];
    this.uploadError = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.uploadError = 'Please choose an image (JPG, PNG, GIF, WebP).';
      input.value = '';
      return;
    }
    if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
      this.uploadError = `Image must be under ${MAX_IMAGE_SIZE_MB}MB.`;
      input.value = '';
      return;
    }
    this.uploadInProgress = true;
    this.uploadImageToImage2Url(file).subscribe(
      (url) => {
        this.uploadInProgress = false;
        this.editTasbeehImageUrl = url;
        this.uploadError = '';
      },
      (err) => {
        this.uploadInProgress = false;
        this.uploadError = err.message || 'Upload failed. Try again.';
      }
    );
    input.value = '';
  }

  submitEditTasbeeh() {
    if (this.editingId === null) return;
    const name = this.editTasbeehName.trim();
    if (!name) return;
    const gr = this.groups.find(g => g.id === this.editingId);
    if (gr) {
      gr.name = name;
      if (this.editTasbeehImageUrl !== null) gr.image = this.editTasbeehImageUrl;
    }
    this.cancelEdit();
    this.saveToStorage();
  }

  deleteTasbeeh(index: number) {
    if (index < 0 || this.groups.length <= 1) return;
    if (!confirm('Delete this tasbeeh?')) return;
    if (this.editingId === this.groups[index].id) this.cancelEdit();
    this.groups.splice(index, 1);
    for (let i = 0; i < this.groups.length; i++) this.groups[i].id = i;
    if (this.selectedId === index) this.selectedId = index > 0 ? index - 1 : 0;
    else if (this.selectedId > index) this.selectedId--;
    this.changeGroup();
    this.saveToStorage();
  }

  private uploadImageToImage2Url(file: File) {
    const formData = new FormData();
    formData.append('file', file, file.name);
    return this.http
      .post(IMAGE2URL_UPLOAD, formData)
      .map((res) => {
        const body = res.json();
        if (body && body.url) return body.url as string;
        throw new Error('No URL in response');
      });
  }

  changeGroup() {
    this.selectedGroup = this.groups[this.selectedId];
    this.saveToStorage();
  }
}

class TasbeehGroup {
  id = 0;
  count = 0;
  name = '';
  image = '';

  constructor(i: number, c: number, n: string, img = '') {
    this.id = i;
    this.count = c;
    this.name = n;
    this.image = img;
  }
}
