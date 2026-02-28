import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './bootstrap.css']
})
export class AppComponent implements OnInit {
  groups = [
    new TasbeehGroup(0, 0, '-- Select Tasbeeh --', ''),
    new TasbeehGroup(1, 0, 'Kalima', 'https://image2url.com/r2/default/images/1772265243982-0d098860-3900-45d0-8518-d9d2f2ce2501.jpg'),
    new TasbeehGroup(2, 0, 'Istigfar', 'https://image2url.com/r2/default/images/1772265308437-9e5e0028-a118-48cf-b65b-ab580fc44a23.jpg'),
    new TasbeehGroup(3, 0, 'Midad', 'https://image2url.com/r2/default/images/1772265331414-e56c776d-5e95-4398-adb4-2a3c877ae5c9.jpg'),
    new TasbeehGroup(4, 0, 'Durood', 'https://image2url.com/r2/default/images/1772265286311-318b6568-fe90-4832-a710-54f698a80717.jpg'),
    new TasbeehGroup(5, 0, 'Names of Allah', 'https://image2url.com/r2/default/images/1772265352244-02d5704b-d45c-459a-833b-f8643c1217cf.jpg')
  ];
  selectedId = 1;
  selectedGroup = this.groups[1];
  showImages = true;

  ngOnInit() {
    this.preloadImages();
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
  }
  resetCount() {
    this.selectedGroup.count=0;
  }
  addNewTasbeeh() {
    const name = prompt('Name of dhikr');
    if (name == null || name.trim() === '') return;
    this.groups.push(new TasbeehGroup(this.groups.length, 0, name.trim(), ''));
    this.selectedId = this.groups.length - 1;
    this.changeGroup();
  }
  changeGroup(){
    this.selectedGroup = this.groups[this.selectedId];
    console.log(this.selectedGroup.name);
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
