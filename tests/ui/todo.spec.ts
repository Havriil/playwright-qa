import { test, expect } from '@playwright/test';
import { TodoPage } from './pages/TodoPage';

test.describe('Todo list', () => {
  let todo: TodoPage;

  test.beforeEach(async ({ page }) => {
    todo = new TodoPage(page);
    await todo.goto();
  });

  test('adds an item', async () => {
    await todo.add('Review trade import');
    await expect(todo.items).toHaveCount(1);
    await expect(todo.items).toHaveText(['Review trade import']);
  });

  test('counter reflects remaining items', async () => {
    await todo.add('First');
    await todo.add('Second');
    await todo.toggle(0);
    await expect(todo.counter).toContainText('1 item left');
  });

  test('ignores an empty entry', async () => {
    await todo.newTodo.press('Enter');
    await expect(todo.items).toHaveCount(0);
  });
});