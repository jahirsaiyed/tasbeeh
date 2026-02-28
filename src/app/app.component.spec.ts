/* tslint:disable:no-unused-variable */

import { TestBed, async, fakeAsync, tick } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Http, BaseRequestOptions, Response, ResponseOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { AppComponent } from './app.component';
import { TasbeehGroup, createDefaultGroups, createGroupsFromStorage } from './tasbeeh-group.model';

describe('AppComponent', () => {
  beforeEach(() => {
    const store: { [key: string]: string } = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => { store[key] = value; });
    TestBed.configureTestingModule({
      declarations: [AppComponent],
      imports: [FormsModule],
      providers: [
        {
          provide: Http,
          useFactory: (backend: MockBackend, defaultOptions: BaseRequestOptions) =>
            new Http(backend, defaultOptions),
          deps: [MockBackend, BaseRequestOptions],
        },
        MockBackend,
        BaseRequestOptions,
      ],
    });
    TestBed.compileComponents();
  });

  it('should create the app', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));

  it('should have groups and default selectedId', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app.groups).toBeDefined();
    expect(app.groups.length).toBeGreaterThan(0);
    expect(app.selectedId).toBeDefined();
    expect(app.selectedGroup).toBeDefined();
  }));

  it('addCount should increment selected group count', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const initial = app.selectedGroup.count;
    app.addCount();
    expect(app.selectedGroup.count).toBe(initial + 1);
    app.addCount();
    expect(app.selectedGroup.count).toBe(initial + 2);
  }));

  it('resetCount should set selected group count to 0', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    app.selectedGroup.count = 5;
    app.resetCount();
    expect(app.selectedGroup.count).toBe(0);
  }));

  it('changeGroup should update selectedGroup from groups by selectedId', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    app.selectedId = 0;
    app.changeGroup();
    expect(app.selectedGroup).toBe(app.groups[0]);
    app.selectedId = 1;
    app.changeGroup();
    expect(app.selectedGroup).toBe(app.groups[1]);
  }));

  it('openSettingsModal should set showSettingsModal true and reset form state', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app.showSettingsModal = false;
    app.showAddForm = true;
    app.editingId = 1;
    app.openSettingsModal();
    expect(app.showSettingsModal).toBe(true);
    expect(app.showAddForm).toBe(false);
    expect(app.editingId).toBeNull();
    expect(app.newTasbeehName).toBe('');
    expect(app.newTasbeehImageUrl).toBe('');
  }));

  it('closeSettingsModal should set showSettingsModal false', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app.showSettingsModal = true;
    app.closeSettingsModal();
    expect(app.showSettingsModal).toBe(false);
    expect(app.showAddForm).toBe(false);
    expect(app.editingId).toBeNull();
  }));

  it('submitNewTasbeeh should add group when name is non-empty', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const len = app.groups.length;
    app.newTasbeehName = '  Custom Dhikr  ';
    app.newTasbeehImageUrl = 'https://example.com/image.jpg';
    app.showAddForm = true;
    app.submitNewTasbeeh();
    expect(app.groups.length).toBe(len + 1);
    expect(app.groups[app.groups.length - 1].name).toBe('Custom Dhikr');
    expect(app.groups[app.groups.length - 1].image).toBe('https://example.com/image.jpg');
    expect(app.showAddForm).toBe(false);
  }));

  it('submitNewTasbeeh should not add when name is empty', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const len = app.groups.length;
    app.newTasbeehName = '   ';
    app.submitNewTasbeeh();
    expect(app.groups.length).toBe(len);
  }));

  it('openEditForm should set editingId and edit name', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const gr = app.groups[0];
    app.openEditForm(gr);
    expect(app.editingId).toBe(gr.id);
    expect(app.editTasbeehName).toBe(gr.name);
    expect(app.editTasbeehImageUrl).toBeNull();
  }));

  it('cancelEdit should clear editing state', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app.editingId = 1;
    app.editTasbeehName = 'Test';
    app.editTasbeehImageUrl = 'http://x.com/1.jpg';
    app.cancelEdit();
    expect(app.editingId).toBeNull();
    expect(app.editTasbeehName).toBe('');
    expect(app.editTasbeehImageUrl).toBeNull();
  }));

  it('submitEditTasbeeh should update group name and image when editingId set', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const gr = app.groups[0];
    app.editingId = gr.id;
    app.editTasbeehName = 'Updated Name';
    app.editTasbeehImageUrl = 'https://example.com/new.jpg';
    app.submitEditTasbeeh();
    expect(gr.name).toBe('Updated Name');
    expect(gr.image).toBe('https://example.com/new.jpg');
    expect(app.editingId).toBeNull();
  }));

  it('deleteTasbeeh should not delete when only one group remains', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    app.groups = [new TasbeehGroup(0, 0, 'Only', '')];
    app.selectedId = 0;
    app.selectedGroup = app.groups[0];
    spyOn(window, 'confirm').and.returnValue(true);
    app.deleteTasbeeh(0);
    expect(app.groups.length).toBe(1);
  }));

  it('deleteTasbeeh should remove first group when index 0 and multiple groups', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const len = app.groups.length;
    spyOn(window, 'confirm').and.returnValue(true);
    app.deleteTasbeeh(0);
    expect(app.groups.length).toBe(len - 1);
    expect(app.selectedId).toBe(0);
  }));

  it('deleteTasbeeh should remove group when index > 0 and user confirms', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const len = app.groups.length;
    spyOn(window, 'confirm').and.returnValue(true);
    app.deleteTasbeeh(1);
    expect(app.groups.length).toBe(len - 1);
    expect(app.groups[0].id).toBe(0);
    if (len > 2) expect(app.groups[1].id).toBe(1);
  }));

  it('deleteTasbeeh should not remove when user cancels confirm', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const len = app.groups.length;
    spyOn(window, 'confirm').and.returnValue(false);
    app.deleteTasbeeh(1);
    expect(app.groups.length).toBe(len);
  }));

  it('deleteTasbeeh should not delete when index is negative', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const len = app.groups.length;
    app.deleteTasbeeh(-1);
    expect(app.groups.length).toBe(len);
  }));

  it('deleteTasbeeh should cancel edit when deleting the group being edited', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const gr = app.groups[1];
    app.openEditForm(gr);
    spyOn(window, 'confirm').and.returnValue(true);
    app.deleteTasbeeh(1);
    expect(app.editingId).toBeNull();
    expect(app.groups.length).toBe(4);
  }));

  it('deleteTasbeeh should decrement selectedId when deleting group before selection', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    app.selectedId = 2;
    app.changeGroup();
    spyOn(window, 'confirm').and.returnValue(true);
    app.deleteTasbeeh(1);
    expect(app.selectedId).toBe(1);
  }));

  it('openAddForm should set showAddForm true and reset form', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app.newTasbeehName = 'x';
    app.newTasbeehImageUrl = 'http://x';
    app.openAddForm();
    expect(app.showAddForm).toBe(true);
    expect(app.newTasbeehName).toBe('');
    expect(app.newTasbeehImageUrl).toBe('');
  }));

  it('cancelAddForm should set showAddForm false and reset form', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app.showAddForm = true;
    app.newTasbeehName = 'x';
    app.cancelAddForm();
    expect(app.showAddForm).toBe(false);
    expect(app.newTasbeehName).toBe('');
  }));

  it('resetAddForm should clear new tasbeeh fields and uploadError', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    app.newTasbeehName = 'a';
    app.newTasbeehImageUrl = 'b';
    app.uploadError = 'err';
    app.resetAddForm();
    expect(app.newTasbeehName).toBe('');
    expect(app.newTasbeehImageUrl).toBe('');
    expect(app.uploadError).toBe('');
  }));

  it('submitEditTasbeeh should do nothing when editingId is null', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const nameBefore = app.groups[0].name;
    app.editingId = null;
    app.editTasbeehName = 'Changed';
    app.submitEditTasbeeh();
    expect(app.groups[0].name).toBe(nameBefore);
  }));

  it('submitEditTasbeeh should do nothing when name is empty after trim', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const gr = app.groups[0];
    app.editingId = gr.id;
    app.editTasbeehName = '   ';
    app.submitEditTasbeeh();
    expect(gr.name).not.toBe('   ');
  }));

  it('submitEditTasbeeh should update only name when editTasbeehImageUrl is null', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const gr = app.groups[0];
    const originalImage = gr.image;
    app.editingId = gr.id;
    app.editTasbeehName = 'New Name Only';
    app.editTasbeehImageUrl = null;
    app.submitEditTasbeeh();
    expect(gr.name).toBe('New Name Only');
    expect(gr.image).toBe(originalImage);
  }));

  it('ngOnInit should load from storage and persist state', async(() => {
    const store: { [key: string]: string } = {};
    const getItem = spyOn(localStorage, 'getItem').and.callFake((k: string) => store[k] || null);
    const setItem = spyOn(localStorage, 'setItem').and.callFake((k: string, v: string) => { store[k] = v; });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    expect(getItem).toHaveBeenCalled();
    expect(setItem).toHaveBeenCalled();
  }));

  it('should restore groups from localStorage on init when valid data exists', async(() => {
    const store: { [key: string]: string } = {};
    store['tasbeehGroups'] = JSON.stringify([
      { id: 0, count: 3, name: 'Saved1', image: 'http://a.com/1.jpg' },
      { id: 1, count: 0, name: 'Saved2', image: '' }
    ]);
    store['tasbeehState'] = JSON.stringify({ selectedId: 1, showImages: false });
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => { store[key] = value; });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app.groups.length).toBe(2);
    expect(app.groups[0].name).toBe('Saved1');
    expect(app.groups[0].count).toBe(3);
    expect(app.groups[1].name).toBe('Saved2');
    expect(app.selectedId).toBe(1);
    expect(app.showImages).toBe(false);
  }));

  it('should fallback to default groups when saved groups filter to empty', async(() => {
    const store: { [key: string]: string } = {};
    store['tasbeehGroups'] = JSON.stringify([
      { id: 0, count: 0, name: '-- Select Tasbeeh --', image: '' }
    ]);
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => { store[key] = value; });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app.groups.length).toBeGreaterThan(1);
    expect(app.groups[0].name).toBe('Kalima');
  }));

  it('should restore selectedId when state has string selectedId', async(() => {
    const store: { [key: string]: string } = {};
    store['tasbeehGroups'] = JSON.stringify([
      { id: 0, count: 0, name: 'A', image: '' },
      { id: 1, count: 0, name: 'B', image: '' }
    ]);
    store['tasbeehState'] = JSON.stringify({ selectedId: '1', showImages: true });
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => { store[key] = value; });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app.groups.length).toBe(2);
    expect(app.selectedId).toBe(1);
    expect(app.selectedGroup.name).toBe('B');
  }));

  it('addCount and resetCount should persist to localStorage', async(() => {
    const setItem = spyOn(localStorage, 'setItem');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    setItem.calls.reset();
    app.addCount();
    expect(setItem).toHaveBeenCalledWith('tasbeehGroups', jasmine.any(String));
    expect(setItem).toHaveBeenCalledWith('tasbeehState', jasmine.any(String));
    setItem.calls.reset();
    app.resetCount();
    expect(setItem).toHaveBeenCalledWith('tasbeehGroups', jasmine.any(String));
  }));

  it('onModalImageSelected should set uploadError when no file', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const event = { target: { files: [], value: '' } } as unknown as Event;
    app.onModalImageSelected(event);
    expect(app.uploadError).toBe('');
    expect(app.newTasbeehImageUrl).toBe('');
  }));

  it('onModalImageSelected should set uploadError for non-image file type', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const file = new File(['x'], 'x.txt', { type: 'text/plain' });
    const event = { target: { files: [file], value: 'x' } } as unknown as Event;
    app.onModalImageSelected(event);
    expect(app.uploadError).toContain('image');
    (event.target as HTMLInputElement).value = '';
  }));

  it('onModalImageSelected should set uploadError when file too large', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const file = new File([new ArrayBuffer(3 * 1024 * 1024)], 'big.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file], value: 'x' } } as unknown as Event;
    app.onModalImageSelected(event);
    expect(app.uploadError).toContain('2MB');
  }));

  it('onModalImageSelected should call upload and set newTasbeehImageUrl on success', fakeAsync(() => {
    const backend = TestBed.get(MockBackend);
    backend.connections.subscribe((conn: any) => {
      conn.mockRespond(new Response(new ResponseOptions({
        status: 200,
        body: JSON.stringify({ url: 'https://uploaded.com/img.jpg' })
      })));
    });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    const file = new File(['x'], 'a.jpg', { type: 'image/jpeg' });
    const event = { target: { files: [file], value: 'x' } } as unknown as Event;
    app.onModalImageSelected(event);
    expect(app.uploadInProgress).toBe(true);
    tick();
    expect(app.uploadInProgress).toBe(false);
    expect(app.newTasbeehImageUrl).toBe('https://uploaded.com/img.jpg');
    expect(app.uploadError).toBe('');
  }));

  it('onEditImageSelected should set uploadError for non-image type', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    const file = new File(['x'], 'x.pdf', { type: 'application/pdf' });
    const event = { target: { files: [file], value: 'x' } } as unknown as Event;
    app.onEditImageSelected(event);
    expect(app.uploadError).toContain('image');
  }));

  it('onEditImageSelected should set editTasbeehImageUrl on upload success', fakeAsync(() => {
    const backend = TestBed.get(MockBackend);
    backend.connections.subscribe((conn: any) => {
      conn.mockRespond(new Response(new ResponseOptions({
        status: 200,
        body: JSON.stringify({ url: 'https://edit-upload.com/photo.jpg' })
      })));
    });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    const file = new File(['y'], 'b.png', { type: 'image/png' });
    const event = { target: { files: [file], value: 'y' } } as unknown as Event;
    app.onEditImageSelected(event);
    tick();
    expect(app.editTasbeehImageUrl).toBe('https://edit-upload.com/photo.jpg');
    expect(app.uploadInProgress).toBe(false);
  }));

  it('upload error should set uploadError when API returns no url', fakeAsync(() => {
    const backend = TestBed.get(MockBackend);
    backend.connections.subscribe((conn: any) => {
      conn.mockRespond(new Response(new ResponseOptions({
        status: 200,
        body: JSON.stringify({})
      })));
    });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    const file = new File(['z'], 'c.gif', { type: 'image/gif' });
    const event = { target: { files: [file], value: 'z' } } as unknown as Event;
    app.onModalImageSelected(event);
    tick();
    expect(app.uploadInProgress).toBe(false);
    expect(app.uploadError).toBeTruthy();
  }));

  it('upload error should set uploadError on request failure', fakeAsync(() => {
    const backend = TestBed.get(MockBackend);
    backend.connections.subscribe((conn: any) => {
      conn.mockError(new Error('Network error'));
    });
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    const file = new File(['w'], 'd.webp', { type: 'image/webp' });
    const event = { target: { files: [file], value: 'w' } } as unknown as Event;
    app.onModalImageSelected(event);
    tick();
    expect(app.uploadInProgress).toBe(false);
    expect(app.uploadError).toContain('Upload failed');
  }));

  it('loadFromStorage should call changeGroup when JSON parse throws', async(() => {
    const store: { [key: string]: string } = {};
    store['tasbeehGroups'] = 'not json';
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake(() => {});
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app.selectedGroup).toBeDefined();
    expect(app.groups.length).toBeGreaterThan(0);
  }));

  it('should keep default groups when tasbeehState is invalid JSON', async(() => {
    const store: { [key: string]: string } = {};
    store['tasbeehState'] = 'invalid';
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake(() => {});
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    expect(app.selectedId).toBe(0);
    expect(app.showImages).toBe(true);
  }));

  it('changeGroup should persist selectedId in state', async(() => {
    const setItem = spyOn(localStorage, 'setItem');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    setItem.calls.reset();
    app.selectedId = 2;
    app.changeGroup();
    const stateStr = setItem.calls.all().find((c: any) => c.args[0] === 'tasbeehState')?.args[1];
    expect(stateStr).toBeDefined();
    expect(JSON.parse(stateStr).selectedId).toBe(2);
  }));

  it('submitNewTasbeeh should select new group and persist', async(() => {
    const setItem = spyOn(localStorage, 'setItem');
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    const app = fixture.debugElement.componentInstance;
    const len = app.groups.length;
    app.newTasbeehName = 'New';
    app.showAddForm = true;
    app.submitNewTasbeeh();
    expect(app.selectedId).toBe(len);
    expect(app.selectedGroup.name).toBe('New');
    expect(setItem).toHaveBeenCalled();
  }));
});

describe('TasbeehGroup model', () => {
  it('createDefaultGroups should return 5 groups with correct names', () => {
    const groups = createDefaultGroups();
    expect(groups.length).toBe(5);
    expect(groups[0].name).toBe('Kalima');
    expect(groups[4].name).toBe('Names of Allah');
  });

  it('createGroupsFromStorage should map raw data to TasbeehGroup instances', () => {
    const raw = [
      { id: 1, count: 10, name: 'Test', image: 'http://img.com/x.jpg' }
    ];
    const groups = createGroupsFromStorage(raw);
    expect(groups.length).toBe(1);
    expect(groups[0].id).toBe(1);
    expect(groups[0].count).toBe(10);
    expect(groups[0].name).toBe('Test');
    expect(groups[0].image).toBe('http://img.com/x.jpg');
  });

  it('createGroupsFromStorage should use empty string for missing image', () => {
    const raw = [{ id: 0, count: 0, name: 'N', image: '' }];
    const groups = createGroupsFromStorage(raw);
    expect(groups[0].image).toBe('');
  });
});
