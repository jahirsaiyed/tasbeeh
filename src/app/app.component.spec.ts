/* tslint:disable:no-unused-variable */

import { TestBed, async } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { Http, BaseRequestOptions } from '@angular/http';
import { MockBackend } from '@angular/http/testing';

import { AppComponent } from './app.component';

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

  it('deleteTasbeeh should not delete when index is 0', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    fixture.detectChanges();
    const len = app.groups.length;
    spyOn(window, 'confirm').and.returnValue(true);
    app.deleteTasbeeh(0);
    expect(app.groups.length).toBe(len);
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
});
