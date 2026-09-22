import { test, expect, APIRequestContext } from '@playwright/test';

const OHLC = 'https://api.kraken.com/0/public/OHLC';

async function getCandles(request: APIRequestContext, pair = 'XBTUSD') {
  const res = await request.get(OHLC, { params: { pair, interval: 60 } });
  return { res, body: await res.json() };
}

function candlesOf(body: any) {
  const key = Object.keys(body.result).find(k => k !== 'last')!;
  return body.result[key];
}

test('returns hourly candles for a valid pair', async ({ request }) => {
  const { res, body } = await getCandles(request);
  expect(res.status()).toBe(200);
  expect(body.error).toEqual([]);
  const candles = candlesOf(body);
  expect(candles.length).toBeGreaterThan(0);
  expect(candles[0]).toHaveLength(8);
});

test('candles are ordered by open time ascending', async ({ request }) => {
  const { body } = await getCandles(request);
  const times = candlesOf(body).map((c: any[]) => c[0]);
  expect(times).toEqual([...times].sort((a: number, b: number) => a - b));
});

test('timestamps are in seconds, not milliseconds', async ({ request }) => {
  const { body } = await getCandles(request);
  expect(String(candlesOf(body)[0][0])).toHaveLength(10);
});

test('prices are strings to preserve precision', async ({ request }) => {
  const { body } = await getCandles(request);
  const [, open, high, low, close] = candlesOf(body)[0];
  [open, high, low, close].forEach(p => expect(typeof p).toBe('string'));
});

test('an unknown pair reports the error in the body with a 200', async ({ request }) => {
  const { res, body } = await getCandles(request, 'NOPE');
  expect(res.status()).toBe(200);
  expect(body.error.length).toBeGreaterThan(0);
});