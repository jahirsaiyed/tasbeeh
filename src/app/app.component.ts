import { Component, OnInit } from '@angular/core';
import { Http } from '@angular/http';
import 'rxjs/add/operator/map';

import { TasbeehGroup, createDefaultGroups, createGroupsFromStorage, StoredTasbeehGroup, StoredState } from './tasbeeh-group.model';

const IMAGE2URL_UPLOAD = 'https://www.image2url.com/api/upload';
const MAX_IMAGE_SIZE_MB = 2;
const MAX_IMAGE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;
const STORAGE_KEY = 'tasbeehGroups';
const STORAGE_STATE_KEY = 'tasbeehState';
const PLACEHOLDER_NAME = '-- Select Tasbeeh --';
const ERROR_IMAGE_TYPE = 'Please choose an image (JPG, PNG, GIF, WebP).';
const ERROR_IMAGE_SIZE = `Image must be under ${MAX_IMAGE_SIZE_MB}MB.`;
const ERROR_UPLOAD_FAILED = 'Upload failed. Try again.';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './bootstrap.css']
})
export class AppComponent implements OnInit {
  groups: TasbeehGroup[] = createDefaultGroups();
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

  ngOnInit(): void {
    this.loadFromStorage();
    this.preloadImages();
  }

  private loadFromStorage(): void {
    try {
      this.loadGroupsFromStorage();
      this.restoreUiStateFromStorage();
      this.selectedId = this.clampSelectedIndex(this.selectedId);
      this.changeGroup();
    } catch (_) {
      this.changeGroup();
    }
  }

  private loadGroupsFromStorage(): void {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    const raw = JSON.parse(saved) as StoredTasbeehGroup[];
    if (!Array.isArray(raw) || raw.length === 0) return;
    this.groups = createGroupsFromStorage(raw).filter(g => g.name !== PLACEHOLDER_NAME);
    if (this.groups.length === 0) {
      this.groups = createDefaultGroups();
      return;
    }
    this.reindexGroups();
  }

  private restoreUiStateFromStorage(): void {
    const savedState = localStorage.getItem(STORAGE_STATE_KEY);
    if (!savedState) return;
    try {
      const state = JSON.parse(savedState) as StoredState;
      const savedIndex = this.parseStoredSelectedIndex(state);
      if (savedIndex !== null) {
        this.selectedId = savedIndex;
      } else {
        const rawId = typeof state.selectedId === 'number' ? state.selectedId : parseInt(String(state.selectedId), 10);
        const idx = this.groups.findIndex(g => g.id === state.selectedId || g.id === rawId);
        if (idx >= 0) this.selectedId = idx;
      }
      if (typeof state.showImages === 'boolean') this.showImages = state.showImages;
    } catch (_) {}
  }

  private parseStoredSelectedIndex(state: StoredState): number | null {
    const raw = state.selectedId;
    const num = typeof raw === 'number' ? raw : parseInt(String(raw), 10);
    if (isNaN(num) || num < 0 || num >= this.groups.length) return null;
    return num;
  }

  private reindexGroups(): void {
    this.groups.forEach((g, i) => { g.id = i; });
  }

  private clampSelectedIndex(index: number): number {
    if (this.groups.length === 0) return 0;
    return Math.min(Math.max(0, index), this.groups.length - 1);
  }

  private saveToStorage(): void {
    try {
      const data: StoredTasbeehGroup[] = this.groups.map(g => ({ id: g.id, count: g.count, name: g.name, image: g.image }));
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      const index = this.getSelectedIndexForStorage();
      localStorage.setItem(STORAGE_STATE_KEY, JSON.stringify({ selectedId: index, showImages: this.showImages }));
    } catch (_) {}
  }

  private getSelectedIndexForStorage(): number {
    const raw = typeof this.selectedId === 'number' ? this.selectedId : parseInt(String(this.selectedId), 10);
    return isNaN(raw) ? 0 : raw;
  }

  /** Preload group images so the browser caches them for instant display when switching groups. */
  private preloadImages(): void {
    this.groups.forEach(gr => {
      if (!gr.image) return;
      const img = new Image();
      img.src = gr.image.startsWith('http') ? gr.image : 'assets/' + gr.image;
    });
  }

  addCount(): void {
    this.selectedGroup.count++;
    this.saveToStorage();
  }

  resetCount(): void {
    this.selectedGroup.count = 0;
    this.saveToStorage();
  }

  openSettingsModal(): void {
    this.showSettingsModal = true;
    this.showAddForm = false;
    this.editingId = null;
    this.resetAddForm();
  }

  closeSettingsModal(): void {
    this.showSettingsModal = false;
    this.showAddForm = false;
    this.editingId = null;
    this.resetAddForm();
  }

  resetAddForm(): void {
    this.newTasbeehName = '';
    this.newTasbeehImageUrl = '';
    this.uploadError = '';
  }

  openAddForm(): void {
    this.showAddForm = true;
    this.resetAddForm();
  }

  cancelAddForm(): void {
    this.showAddForm = false;
    this.resetAddForm();
  }

  onModalImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.uploadError = '';
    if (!file) return;
    const err = this.validateImageFile(file);
    if (err) {
      this.uploadError = err;
      (event.target as HTMLInputElement).value = '';
      return;
    }
    (event.target as HTMLInputElement).value = '';
    this.uploadImageAndThen(file, url => { this.newTasbeehImageUrl = url; });
  }

  submitNewTasbeeh(): void {
    const name = this.newTasbeehName.trim();
    if (!name) return;
    this.groups.push(new TasbeehGroup(this.groups.length, 0, name, this.newTasbeehImageUrl));
    this.selectedId = this.groups.length - 1;
    this.changeGroup();
    this.showAddForm = false;
    this.resetAddForm();
    this.saveToStorage();
  }

  openEditForm(gr: TasbeehGroup): void {
    this.editingId = gr.id;
    this.editTasbeehName = gr.name;
    this.editTasbeehImageUrl = null;
    this.uploadError = '';
  }

  cancelEdit(): void {
    this.editingId = null;
    this.editTasbeehName = '';
    this.editTasbeehImageUrl = null;
    this.uploadError = '';
  }

  onEditImageSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.uploadError = '';
    if (!file) return;
    const err = this.validateImageFile(file);
    if (err) {
      this.uploadError = err;
      (event.target as HTMLInputElement).value = '';
      return;
    }
    (event.target as HTMLInputElement).value = '';
    this.uploadImageAndThen(file, url => { this.editTasbeehImageUrl = url; });
  }

  private validateImageFile(file: File): string | null {
    if (!file.type.startsWith('image/')) return ERROR_IMAGE_TYPE;
    if (file.size > MAX_IMAGE_BYTES) return ERROR_IMAGE_SIZE;
    return null;
  }

  private uploadImageAndThen(file: File, onSuccess: (url: string) => void): void {
    this.uploadInProgress = true;
    this.uploadError = '';
    this.uploadImageToImage2Url(file).subscribe(
      (url) => {
        this.uploadInProgress = false;
        onSuccess(url);
        this.uploadError = '';
      },
      (err) => {
        this.uploadInProgress = false;
        this.uploadError = err?.message || ERROR_UPLOAD_FAILED;
      }
    );
  }

  submitEditTasbeeh(): void {
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

  deleteTasbeeh(index: number): void {
    if (index < 0 || this.groups.length <= 1) return;
    if (!confirm('Delete this tasbeeh?')) return;
    if (this.editingId === this.groups[index].id) this.cancelEdit();
    this.groups.splice(index, 1);
    this.reindexGroups();
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

  changeGroup(): void {
    this.selectedGroup = this.groups[this.selectedId];
    this.saveToStorage();
  }
}
