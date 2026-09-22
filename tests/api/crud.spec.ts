import { test, expect, APIRequestContext } from '@playwright/test';

const BASE = 'https://api.restful-api.dev/objects';
const created: string[] = [];

async function createObject(request: APIRequestContext) {
  const res = await request.post(BASE, {
    data: { name: 'Trade import', data: { broker: 'graybox', trades: 512 } },
  });
  expect(res.status()).toBe(200);
  const body = await res.json();
  created.push(body.id);
  return body;
}

test.afterEach(async ({ request }) => {
  while (created.length) {
    await request.delete(`${BASE}/${created.pop()}`).catch(() => {});
  }
});

test('create returns an id and echoes the payload', async ({ request }) => {
  const obj = await createObject(request);
  expect(obj.id).toBeTruthy();
  expect(obj.data).toEqual({ broker: 'graybox', trades: 512 });
});

test('get returns the created object', async ({ request }) => {
  const obj = await createObject(request);
  const res = await request.get(`${BASE}/${obj.id}`);
  expect(res.status()).toBe(200);
  expect((await res.json()).data.broker).toBe('graybox');
});

test('get after delete returns 404', async ({ request }) => {
  const obj = await createObject(request);
  await request.delete(`${BASE}/${obj.id}`);
  const res = await request.get(`${BASE}/${obj.id}`);
  expect(res.status()).toBe(404);
});

test('repeat delete is idempotent and returns 404', async ({ request }) => {
  const obj = await createObject(request);
  await request.delete(`${BASE}/${obj.id}`);
  const res = await request.delete(`${BASE}/${obj.id}`);
  expect(res.status()).toBe(404);
});

test('rejects a non-JSON content type with 415', async ({ request }) => {
  const res = await request.post(BASE, {
    headers: { 'Content-Type': 'text/plain' },
    data: '{"name":"x"}',
  });
  expect(res.status()).toBe(415);
});

test('rejects malformed JSON with 400', async ({ request }) => {
  const res = await request.post(BASE, {
    headers: { 'Content-Type': 'application/json' },
    data: '{"name":',
  });
  expect(res.status()).toBe(400);
});

test('PATCH merges nested fields instead of replacing them', async ({ request }) => {
  test.fail(true, 'Known defect: PATCH replaces the nested data object and drops sibling keys');
  const obj = await createObject(request);
  const res = await request.patch(`${BASE}/${obj.id}`, {
    data: { data: { trades: 513 } },
  });
  const updated = await res.json();
  expect(updated.data.trades).toBe(513);
  expect(updated.data.broker).toBe('graybox');
});