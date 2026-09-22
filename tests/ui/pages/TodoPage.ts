import { Page, Locator } from '@playwright/test';

export class TodoPage {
  readonly page: Page;
  readonly newTodo: Locator;
  readonly items: Locator;
  readonly counter: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodo = page.getByPlaceholder('What needs to be done?');
    this.items = page.getByTestId('todo-item');
    this.counter = page.getByTestId('todo-count');
  }

  async goto() {
    await this.page.goto('https://demo.playwright.dev/todomvc');
  }

  async add(text: string) {
    await this.newTodo.fill(text);
    await this.newTodo.press('Enter');
  }

  async toggle(index: number) {
    await this.items.nth(index).getByRole('checkbox').check();
  }
}