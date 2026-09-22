# Playwright QA

UI and API test suite in Playwright with TypeScript, run on GitHub Actions.

## Run

    npm ci
    npx playwright install --with-deps
    npx playwright test                    # everything
    npx playwright test --project=api      # API only, no browser
    npx playwright test --project=chromium # UI only

## UI tests

`tests/ui/` — page object pattern against the Playwright TodoMVC demo. Locators live in `pages/TodoPage.ts`, so the specs describe behaviour rather than markup.

## API tests

- **crud.spec.ts** — full create/read/delete cycle on restful-api.dev, idempotent delete, 415 and 400 on bad input. Each test creates and cleans up its own data, so tests are independent and parallel-safe.
- **pagination.spec.ts** — offset pagination on PokeAPI: next-link traversal, off-by-one duplication at page boundaries, empty page past the end.
- **market-data.spec.ts** — Kraken OHLC: candle structure and ordering, timestamps in seconds, prices as strings for precision, errors returned in the body with HTTP 200.

## Known defect

`PATCH /objects/{id}` on restful-api.dev replaces the nested `data` object instead of merging it, dropping sibling keys. Documented with `test.fail()`, so the suite stays green and will flag the change if the behaviour is ever fixed.

## Notes

Binance was used for exploration but is excluded from CI: it geo-blocks the US regions GitHub-hosted runners use.