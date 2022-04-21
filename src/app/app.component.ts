import { Component } from '@angular/core';
import { group } from 'console';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css', './bootstrap.css']
})
export class AppComponent {
  groups = [
    new TasbeehGroup(0, 0, 'Select Tasbeeh'),
    new TasbeehGroup(1, 0, 'Kalima'),
    new TasbeehGroup(2, 0, 'Istigfar'),
    new TasbeehGroup(3, 0, 'Midad'),
    new TasbeehGroup(4, 0, 'Durood'),
    new TasbeehGroup(5, 0, 'Names of Allah')
  ];
  selectedId =0;
  selectedGroup = this.groups[this.selectedId];
  newTasbeeh = '';

  addCount() {
    this.selectedGroup.count++;
  }
  resetCount() {
    this.selectedGroup.count=0;
  }
  addNewTasbeeh() {
    if(this.newTasbeeh=='') {
      alert("Fill name of tasbeeh !!");
      return;
    }
    this.groups.push(new TasbeehGroup(this.groups.length, 0, this.newTasbeeh));
    this.newTasbeeh='';
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

  constructor(i:number ,c:number, n:string) {
    this.id=i;
    this.count = c;
    this.name = n;
  }
}
