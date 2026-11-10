# Planning Lab — HAVI Interview Campus

SQL and Excel interview preparation, with interactive lessons, SQLite exercises, quizzes, and a timed mock interview. Exported from the original ChatGPT Site.

## Run locally

No build or package installation is required. With Python 3 installed:

```sh
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. Serve the files over HTTP so the SQL worker and WebAssembly engine can load.

## Verify course examples

With Node.js installed:

```sh
node verify-teaching.cjs
```

This checks SQL walkthrough results, reference lab answers, and dataset control totals.

## Files and hosting

- `dist/` contains the complete site and bundled sql.js SQLite engine.
- `verify-teaching.cjs` checks the course examples.
- `.openai/hosting.json` records the original ChatGPT Sites deployment configuration.

Any static host can serve `dist/`; no server API or credentials are required. Preserve the bundled sql.js license in `dist/assets/sql.js.LICENSE`.

Progress is stored in browser localStorage. It does not automatically transfer between the ChatGPT Site, localhost, or another hosting address. Fonts load from Google Fonts when available.
