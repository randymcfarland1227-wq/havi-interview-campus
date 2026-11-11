# HAVI SQL Prep

A single-page SQL course for a supply chain order-data technical interview. Each lesson explains an idea, shows two queries side by side on the same data, then has a graded exercise directly underneath. Queries are written in SQL Server syntax.

## Use it

Open `dist/index.html` in a browser, or serve `dist/` from any static host. It is one self-contained file; no server or install is needed.

## Change it

- `src/course.js` — every lesson, comparison, exercise, the mock interview and the cheat sheet
- `src/data.js` — the practice tables (synthetic)
- `src/engine.js` — runs queries in SQLite (sql.js) with a SQL Server layer: TOP, ISNULL, LEN, GETDATE, DATEDIFF, DATEADD
- `src/app.js`, `src/styles.css` — the page

```sh
node verify.cjs   # runs every query in the course
node build.cjs    # writes dist/index.html
```

All data is fictional. The bundled sql.js licence is in `vendor/sql.js.LICENSE`. Progress is stored in the browser's localStorage.
