import { TasbeehPage } from './app.po';

describe('tasbeeh App', function() {
  let page: TasbeehPage;

  beforeEach(() => {
    page = new TasbeehPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
