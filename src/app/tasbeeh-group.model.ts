/**
 * Model for a tasbeeh (dhikr) group: id, count, name, and optional image URL.
 */
export class TasbeehGroup {
  constructor(
    public id: number,
    public count: number,
    public name: string,
    public image: string = ''
  ) {}
}

export interface StoredTasbeehGroup {
  id: number;
  count: number;
  name: string;
  image: string;
}

export interface StoredState {
  selectedId?: number;
  showImages?: boolean;
}

const DEFAULT_GROUP_DATA: StoredTasbeehGroup[] = [
  { id: 1, count: 0, name: 'Kalima', image: 'https://image2url.com/r2/default/images/1772265243982-0d098860-3900-45d0-8518-d9d2f2ce2501.jpg' },
  { id: 2, count: 0, name: 'Istigfar', image: 'https://image2url.com/r2/default/images/1772265308437-9e5e0028-a118-48cf-b65b-ab580fc44a23.jpg' },
  { id: 3, count: 0, name: 'Midad', image: 'https://image2url.com/r2/default/images/1772265331414-e56c776d-5e95-4398-adb4-2a3c877ae5c9.jpg' },
  { id: 4, count: 0, name: 'Durood', image: 'https://image2url.com/r2/default/images/1772265286311-318b6568-fe90-4832-a710-54f698a80717.jpg' },
  { id: 5, count: 0, name: 'Names of Allah', image: 'https://image2url.com/r2/default/images/1772265352244-02d5704b-d45c-459a-833b-f8643c1217cf.jpg' }
];

export function createDefaultGroups(): TasbeehGroup[] {
  return DEFAULT_GROUP_DATA.map(
    g => new TasbeehGroup(g.id, g.count, g.name, g.image || '')
  );
}

export function createGroupsFromStorage(raw: StoredTasbeehGroup[]): TasbeehGroup[] {
  return raw.map(
    g => new TasbeehGroup(g.id, g.count, g.name, g.image || '')
  );
}
