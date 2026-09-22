import { test, expect } from '@playwright/test';

const BASE = 'https://pokeapi.co/api/v2/pokemon';

test('first page exposes a next link and no previous link', async ({ request }) => {
  const body = await (await request.get(`${BASE}?limit=20&offset=0`)).json();
  expect(body.next).toContain('offset=20');
  expect(body.previous).toBeNull();
  expect(body.results).toHaveLength(20);
});

test('following the next link yields a disjoint page', async ({ request }) => {
  const p1 = await (await request.get(`${BASE}?limit=20&offset=0`)).json();
  const p2 = await (await request.get(p1.next)).json();
  const names1 = p1.results.map((r: { name: string }) => r.name);
  const names2 = p2.results.map((r: { name: string }) => r.name);
  expect(names1.filter((n: string) => names2.includes(n))).toEqual([]);
});

test('an off-by-one offset duplicates the boundary record', async ({ request }) => {
  const p1 = await (await request.get(`${BASE}?limit=20&offset=0`)).json();
  const shifted = await (await request.get(`${BASE}?limit=20&offset=19`)).json();
  expect(shifted.results[0].name).toBe(p1.results[19].name);
});

test('an offset past the end returns an empty page with 200', async ({ request }) => {
  const res = await request.get(`${BASE}?limit=20&offset=999999`);
  expect(res.status()).toBe(200);
  const body = await res.json();
  expect(body.results).toEqual([]);
  expect(body.count).toBeGreaterThan(0);
});