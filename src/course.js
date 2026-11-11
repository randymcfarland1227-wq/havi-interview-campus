/* The whole curriculum. Each lesson is one page of steps, in the order you read them:
   text    - explanation
   run     - a query with its live result
   compare - two queries on the same data, side by side, with what changed and when to use which
   try     - a graded exercise, placed right after the idea it tests
   quiz    - one multiple-choice check
   Every query in this file is executed by verify.cjs. */
const COURSE = {
  interview: 'Wednesday, Nov 11',
  ladder: [
    { k: 'SELECT', d: 'columns and calculations to show', l: 'filter', order: 6 },
    { k: 'FROM', d: 'the table that sets what one row means', l: 'read', order: 1 },
    { k: 'JOIN … ON', d: 'add columns from another table by key', l: 'joins', order: 2 },
    { k: 'WHERE', d: 'keep or drop rows', l: 'filter', order: 3 },
    { k: 'GROUP BY', d: 'collapse rows into one row per group', l: 'aggregate', order: 4 },
    { k: 'HAVING', d: 'keep or drop groups', l: 'aggregate', order: 5 },
    { k: 'ORDER BY', d: 'sort the output', l: 'filter', order: 7 }
  ],
  lessons: [
    /* ------------------------------------------------------------------ 1 */
    {
      id: 'read', title: 'Read a table before you query it', mins: 10, priority: 'Must',
      builds: 'Starts from what you already do in Excel and Alteryx.',
      outcome: 'Say what one row means in any table, name its key, and predict whether a count will be right.',
      steps: [
        { t: 'text', h: 'The case you will solve', html: `
<p>A store calls: <strong>the order screen shows the wrong quantity.</strong> The screen reads from a copy of the data, the copy is fed by a sync job, and the sync job reads the order tables. The mistake could have entered at any of those points. Your job is to find where, with queries, and explain it.</p>
<p>Every lesson adds one tool to that investigation. Lesson 6 runs the whole trace. The same nine small tables are used throughout, so you never have to learn new data. Tap <strong>Tables</strong> at any time to look at them.</p>` },
        { t: 'text', h: 'SQL is the Excel you already know, written as sentences', html: `
<div class="tablewrap"><table><thead><tr><th>You do this in Excel</th><th>SQL clause</th><th>What it does</th></tr></thead><tbody>
<tr><td>Hide columns</td><td><code>SELECT</code></td><td>Choose which columns come back</td></tr>
<tr><td>Pick the sheet</td><td><code>FROM</code></td><td>Choose the table</td></tr>
<tr><td>Filter rows</td><td><code>WHERE</code></td><td>Keep only rows that pass a test</td></tr>
<tr><td>Sort</td><td><code>ORDER BY</code></td><td>Sort the output</td></tr>
<tr><td>XLOOKUP / Alteryx Join</td><td><code>JOIN … ON</code></td><td>Bring columns from another table by a matching key</td></tr>
<tr><td>PivotTable rows + values</td><td><code>GROUP BY</code> + <code>SUM</code>, <code>COUNT</code></td><td>One summary row per group</td></tr>
<tr><td>Filter on the pivot total</td><td><code>HAVING</code></td><td>Keep only groups that pass a test</td></tr>
<tr><td>IF / IFS</td><td><code>CASE WHEN</code></td><td>Label or calculate by condition</td></tr>
<tr><td>Append two sheets</td><td><code>UNION ALL</code></td><td>Stack rows from two queries</td></tr>
</tbody></table></div>` },
        { t: 'run', h: 'Look at real rows first', sql: `SELECT TOP 5 *\nFROM order_lines;`,
          note: `<code>*</code> means every column. <code>TOP 5</code> means stop after five rows. Do this before anything else with an unfamiliar table: you are reading the data, not answering a question yet.` },
        { t: 'text', h: 'Grain and key: the two facts that prevent wrong numbers', html: `
<p><strong>Grain</strong> is what one row represents. <strong>Key</strong> is the column, or set of columns, that is different on every row.</p>
<ul><li><code>orders</code>: one row per order. Key: <code>order_id</code>.</li>
<li><code>order_lines</code>: one row per product on an order. Key: <code>line_id</code>. An order has many lines.</li>
<li><code>screen_orders</code>: one row per order as the screen shows it.</li></ul>
<p>Most wrong totals come from treating a table as if it had a different grain than it has. Counting rows in <code>order_lines</code> counts lines, not orders.</p>` },
        { t: 'compare', h: 'Same order, two grains',
          intro: 'Order O1001 in the header table and in the detail table.',
          a: { label: 'orders (header)', sql: `SELECT order_id, status\nFROM orders\nWHERE order_id = 'O1001';` },
          b: { label: 'order_lines (detail)', sql: `SELECT order_id, product_id, qty_ordered\nFROM order_lines\nWHERE order_id = 'O1001';` },
          diff: 'One order is one row in orders and two rows in order_lines.',
          use: ['Count orders, read status or dates → orders', 'Sum quantities, list products → order_lines'] },
        { t: 'text', h: 'You write clauses in one order. The database runs them in another.', html: `
<p>Written order: <code>SELECT → FROM → JOIN → WHERE → GROUP BY → HAVING → ORDER BY</code>.</p>
<p>Run order: <code>FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY</code>.</p>
<p>This explains three rules that otherwise look arbitrary:</p>
<ul><li><code>WHERE</code> cannot use <code>SUM()</code> or <code>COUNT()</code>, because grouping has not happened yet. That is what <code>HAVING</code> is for.</li>
<li><code>WHERE</code> cannot use a name you created in <code>SELECT</code> with <code>AS</code>, because <code>SELECT</code> runs later.</li>
<li><code>ORDER BY</code> can use that name, because it runs last.</li></ul>
<p>The ladder at the top of each lesson shows the run order and lights up the clauses you have covered.</p>` },
        { t: 'quiz', q: 'You need the number of orders placed at L01. Which table do you count rows in?',
          options: ['order_lines, because it has the quantities', 'orders, because one row is one order', 'screen_orders, because that is what the store sees'], correct: 1,
          why: 'orders has one row per order. order_lines would count products, and screen_orders is a copy that may be incomplete.' }
      ]
    },
    /* ------------------------------------------------------------------ 2 */
    {
      id: 'filter', title: 'SELECT, WHERE and ORDER BY', mins: 25, priority: 'Must',
      builds: 'You can read a table. Now ask it for specific rows and columns.',
      outcome: 'Write a filtered, sorted query from a plain-English request, and avoid the three filter mistakes that return wrong rows without an error.',
      steps: [
        { t: 'run', h: 'The basic sentence', sql: `SELECT product_id, product_name, unit_cost\nFROM products\nWHERE category = 'Frozen'\nORDER BY unit_cost DESC;`,
          note: `Read it line by line: show these three columns, from products, only rows where category is Frozen, most expensive first. Text goes in <strong>single quotes</strong>, numbers do not. <code>DESC</code> is high to low; leave it off for low to high.` },
        { t: 'text', h: 'The comparison operators', html: `
<div class="tablewrap"><table><thead><tr><th>Write</th><th>Means</th><th>Example</th></tr></thead><tbody>
<tr><td><code>=</code> &nbsp; <code>&lt;&gt;</code></td><td>equal, not equal</td><td><code>status &lt;&gt; 'Cancelled'</code></td></tr>
<tr><td><code>&gt;</code> <code>&gt;=</code> <code>&lt;</code> <code>&lt;=</code></td><td>greater, less</td><td><code>qty_ordered &gt;= 50</code></td></tr>
<tr><td><code>IN (…)</code></td><td>matches any value in a list</td><td><code>location_id IN ('L01','L02')</code></td></tr>
<tr><td><code>BETWEEN a AND b</code></td><td>from a to b, including both ends</td><td><code>qty_ordered BETWEEN 20 AND 50</code></td></tr>
<tr><td><code>LIKE</code></td><td>text pattern. <code>%</code> = any characters, <code>_</code> = one character</td><td><code>customer LIKE 'Store 1%'</code></td></tr>
<tr><td><code>IS NULL</code> / <code>IS NOT NULL</code></td><td>value is missing / present</td><td><code>qty_shipped IS NULL</code></td></tr>
<tr><td><code>AND</code> <code>OR</code> <code>NOT</code></td><td>combine tests</td><td><code>promo = 1 AND location_id = 'L01'</code></td></tr>
</tbody></table></div>` },
        { t: 'compare', h: 'AND runs before OR',
          intro: 'Request: Chicago (L01) plan rows that are either promotional or sold more than 150 units.',
          a: { label: 'No parentheses', sql: `SELECT plan_id, location_id, promo, actual_units\nFROM daily_plan\nWHERE location_id = 'L01'\n  AND promo = 1\n   OR actual_units > 150;` },
          b: { label: 'With parentheses', sql: `SELECT plan_id, location_id, promo, actual_units\nFROM daily_plan\nWHERE location_id = 'L01'\n  AND (promo = 1\n   OR actual_units > 150);` },
          diff: 'Without parentheses SQL reads it as (L01 AND promo) OR (over 150 anywhere), so Denver and Atlanta rows leak in. Look at the location_id column on the left.',
          use: ['Any time AND and OR appear together, add parentheses around the OR group', 'Say the rule in English first, then bracket it the way you said it'] },
        { t: 'compare', h: '= NULL finds nothing. IS NULL finds the missing values.',
          intro: 'Request: order lines that have not shipped yet. qty_shipped is empty (NULL) until a line ships.',
          a: { label: '= NULL', sql: `SELECT line_id, order_id, qty_shipped\nFROM order_lines\nWHERE qty_shipped = NULL;` },
          b: { label: 'IS NULL', sql: `SELECT line_id, order_id, qty_shipped\nFROM order_lines\nWHERE qty_shipped IS NULL;` },
          diff: 'NULL means unknown. Nothing equals unknown, not even another NULL, so = NULL returns zero rows and no error. That silence is what makes it dangerous.',
          use: ['Missing value → IS NULL', 'Value present → IS NOT NULL', 'NULL is not zero: line 12 shipped 0 units and is not in this list'] },
        { t: 'compare', h: 'BETWEEN drops the last day when the column has a time',
          intro: 'Request: screen rows synced from Nov 2 through Nov 4. synced_at holds a date and a time.',
          a: { label: 'BETWEEN', sql: `SELECT order_id, synced_at\nFROM screen_orders\nWHERE synced_at BETWEEN '2026-11-02'\n                    AND '2026-11-04';` },
          b: { label: '>= start AND < day after', sql: `SELECT order_id, synced_at\nFROM screen_orders\nWHERE synced_at >= '2026-11-02'\n  AND synced_at <  '2026-11-05';` },
          diff: "'2026-11-04' means midnight at the start of Nov 4. A row stamped 06:00 that morning is after it, so BETWEEN leaves it out. SQL Server datetime columns behave the same way.",
          use: ['Date ranges on a datetime column → >= first day AND < the day after the last day', 'BETWEEN is fine for whole numbers and date-only columns'] },
        { t: 'run', h: 'DISTINCT, LIKE and TOP', sql: `SELECT DISTINCT status\nFROM orders;`,
          note: `<code>DISTINCT</code> removes repeated rows from the output, which is the quickest way to see what values a column holds. <code>WHERE customer LIKE 'Store 1%'</code> would keep customers starting with "Store 1". <code>SELECT TOP 3 … ORDER BY qty_ordered DESC</code> gives the three largest. TOP without ORDER BY gives three arbitrary rows.` },
        { t: 'try', id: 'filter-promo', title: 'Promotional rows that beat forecast',
          prompt: 'From daily_plan, return plan_id, product_id, forecast_units and actual_units for location L01 rows where promo is 1 and actual_units is greater than forecast_units. Sort by plan_id.',
          starter: `SELECT plan_id, product_id, forecast_units, actual_units\nFROM daily_plan\nWHERE `,
          solution: `SELECT plan_id, product_id, forecast_units, actual_units\nFROM daily_plan\nWHERE location_id = 'L01'\n  AND promo = 1\n  AND actual_units > forecast_units\nORDER BY plan_id;`, ordered: true,
          hints: ['Three tests joined by AND.', "location_id = 'L01' AND promo = 1 AND actual_units > forecast_units", 'Finish with ORDER BY plan_id.'],
          explain: 'You can compare two columns of the same row directly. All seven L01 promo rows sold above forecast.' },
        { t: 'try', id: 'filter-open', title: 'Recent orders that are not finished',
          prompt: "From orders, return order_id, order_date and status for orders placed on or after 2026-11-03 whose status is Open or Cancelled. Sort by order_id.",
          starter: `SELECT order_id, order_date, status\nFROM orders\nWHERE `,
          solution: `SELECT order_id, order_date, status\nFROM orders\nWHERE order_date >= '2026-11-03'\n  AND status IN ('Open', 'Cancelled')\nORDER BY order_id;`, ordered: true,
          hints: ['One date test AND one status test.', "status IN ('Open', 'Cancelled') avoids the AND/OR trap.", "order_date >= '2026-11-03'"],
          explain: 'IN keeps the two statuses in one test, so there is no OR to bracket.' },
        { t: 'try', id: 'filter-null', title: 'Lines waiting to ship',
          prompt: 'From order_lines, return line_id, order_id and qty_ordered for lines with no shipped quantity recorded. Sort by line_id.',
          starter: `SELECT line_id, order_id, qty_ordered\nFROM order_lines\n`,
          solution: `SELECT line_id, order_id, qty_ordered\nFROM order_lines\nWHERE qty_shipped IS NULL\nORDER BY line_id;`, ordered: true,
          hints: ['"No quantity recorded" is a missing value, not zero.', 'WHERE qty_shipped IS NULL'],
          explain: 'Four lines are unshipped. Line 12 shipped 0, which is a recorded value, so it is correctly left out.' },
        { t: 'quiz', q: "A filter WHERE status = 'Open' OR status = 'Shipped' AND location_id = 'L01' returns Open orders from every location. Why?",
          options: ['OR is evaluated before AND', 'AND is evaluated before OR, so the location test only applies to Shipped', 'Text comparisons ignore AND'], correct: 1,
          why: "AND binds tighter. Write (status = 'Open' OR status = 'Shipped') AND location_id = 'L01', or use IN." }
      ]
    },
    /* ------------------------------------------------------------------ 3 */
    {
      id: 'aggregate', title: 'COUNT, SUM, GROUP BY and HAVING', mins: 25, priority: 'Must',
      builds: 'You can pick rows. Now collapse many rows into totals, the way a PivotTable does.',
      outcome: 'Produce totals per group, choose the right COUNT, and decide between WHERE and HAVING.',
      steps: [
        { t: 'text', h: 'Five functions, one idea', html: `
<p>An aggregate function takes many rows and returns one value: <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>. With no <code>GROUP BY</code> you get one row for the whole table. With <code>GROUP BY</code> you get one row per group. <strong>GROUP BY changes the grain of the result.</strong></p>
<p>All five skip NULL values. That is usually what you want, and it is also how an average ends up higher than expected.</p>` },
        { t: 'run', h: 'Three COUNTs that answer three different questions', sql: `SELECT COUNT(*)                 AS line_rows,\n       COUNT(qty_shipped)       AS lines_with_a_shipped_value,\n       COUNT(DISTINCT order_id) AS orders\nFROM order_lines;`,
          note: `<code>COUNT(*)</code> counts rows. <code>COUNT(column)</code> counts rows where that column is not NULL. <code>COUNT(DISTINCT column)</code> counts different values. When someone asks "how many", ask "how many of what" before choosing.` },
        { t: 'run', h: 'GROUP BY: one row per order', sql: `SELECT order_id,\n       COUNT(*)         AS line_count,\n       SUM(qty_ordered) AS total_ordered\nFROM order_lines\nGROUP BY order_id\nORDER BY order_id;`,
          note: `This is a PivotTable with order_id in Rows and two Values. <strong>The rule:</strong> every column in SELECT must either be inside an aggregate function or be listed in GROUP BY. SQL Server rejects the query otherwise. (This practice database is more forgiving and will not warn you, so check it yourself.)` },
        { t: 'compare', h: 'WHERE filters rows before the total. HAVING filters totals after.',
          intro: 'Both mention "more than 50", and they answer different questions.',
          a: { label: 'WHERE: big lines only', sql: `SELECT order_id,\n       SUM(qty_ordered) AS total_qty\nFROM order_lines\nWHERE qty_ordered > 50\nGROUP BY order_id\nORDER BY order_id;` },
          b: { label: 'HAVING: big orders only', sql: `SELECT order_id,\n       SUM(qty_ordered) AS total_qty\nFROM order_lines\nGROUP BY order_id\nHAVING SUM(qty_ordered) > 50\nORDER BY order_id;` },
          diff: 'Look at O1001: 60 on the left, 100 on the right. WHERE threw away its 40-unit line before adding. HAVING added everything, then kept orders whose total passed.',
          use: ['Condition on a single row (a date, a status, one quantity) → WHERE', 'Condition on a total or a count → HAVING', 'You can use both in one query: WHERE first, HAVING after GROUP BY'] },
        { t: 'compare', h: 'An average ignores NULL unless you tell it otherwise',
          intro: 'Average units shipped per line. Four lines have not shipped and hold NULL.',
          a: { label: 'AVG skips NULL', sql: `SELECT AVG(qty_shipped) AS avg_shipped\nFROM order_lines;` },
          b: { label: 'NULL counted as 0', sql: `SELECT AVG(ISNULL(qty_shipped, 0))\n         AS avg_shipped\nFROM order_lines;` },
          diff: 'Left divides by the 8 lines that have a value. Right divides by all 12. Neither is wrong; they answer different questions.',
          use: ['"Average of the lines that shipped" → plain AVG', '"Average across all lines, unshipped counted as zero" → ISNULL(x, 0) inside', 'State which one you used when you report the number'] },
        { t: 'try', id: 'agg-order', title: 'Orders with more than one line',
          prompt: 'From order_lines, return order_id, line_count and total_ordered (sum of qty_ordered) for orders that have more than one line. Sort by order_id.',
          starter: `SELECT order_id,\n       COUNT(*) AS line_count,\n       SUM(qty_ordered) AS total_ordered\nFROM order_lines\n`,
          solution: `SELECT order_id,\n       COUNT(*) AS line_count,\n       SUM(qty_ordered) AS total_ordered\nFROM order_lines\nGROUP BY order_id\nHAVING COUNT(*) > 1\nORDER BY order_id;`, ordered: true,
          hints: ['Group by order_id first.', '"More than one line" is a test on a count, so it goes in HAVING.', 'HAVING COUNT(*) > 1'],
          explain: 'A test on COUNT belongs in HAVING. On SQL Server, repeat the function in HAVING rather than the alias.' },
        { t: 'try', id: 'agg-location', title: 'Forecast and actual by location',
          prompt: 'From daily_plan, return location_id, forecast_total, actual_total and rows_with_actuals (the number of rows that have an actual value) for each location. Sort by location_id.',
          starter: `SELECT location_id,\n       \nFROM daily_plan\n`,
          solution: `SELECT location_id,\n       SUM(forecast_units) AS forecast_total,\n       SUM(actual_units)   AS actual_total,\n       COUNT(actual_units) AS rows_with_actuals\nFROM daily_plan\nGROUP BY location_id\nORDER BY location_id;`, ordered: true,
          hints: ['Two SUMs and one COUNT.', 'COUNT(actual_units) skips the NULL, COUNT(*) would not.', 'GROUP BY location_id'],
          explain: 'L03 has six rows and only five actuals. Reporting the count next to the total shows the reader that one feed is missing.' },
        { t: 'try', id: 'agg-having', title: 'High-volume products',
          prompt: 'From daily_plan, return product_id and total_actual for products with more than 500 actual units in total. Sort by total_actual, highest first.',
          starter: `SELECT product_id,\n       SUM(actual_units) AS total_actual\nFROM daily_plan\n`,
          solution: `SELECT product_id,\n       SUM(actual_units) AS total_actual\nFROM daily_plan\nGROUP BY product_id\nHAVING SUM(actual_units) > 500\nORDER BY total_actual DESC;`, ordered: true,
          hints: ['GROUP BY product_id', 'HAVING SUM(actual_units) > 500', 'ORDER BY can use the alias total_actual.'],
          explain: 'ORDER BY runs after SELECT, so it can use the alias. HAVING runs before SELECT, so on SQL Server it cannot.' },
        { t: 'quiz', q: 'Which clause removes cancelled orders before totals are calculated?',
          options: ["HAVING status <> 'Cancelled'", "WHERE status <> 'Cancelled'", "ORDER BY status"], correct: 1,
          why: 'status is a value on each row, so it is filtered in WHERE, before grouping. HAVING is for conditions on the totals themselves.' }
      ]
    },
    /* ------------------------------------------------------------------ 4 */
    {
      id: 'joins', title: 'JOIN: connect tables by key', mins: 35, priority: 'Must',
      builds: 'You can filter and total one table. Real questions need columns from two or three.',
      outcome: 'Choose INNER or LEFT on purpose, find rows with no match, and notice when a join has changed your row count.',
      steps: [
        { t: 'text', h: 'Why tables are split, and how a join puts them back', html: `
<p>An order line stores <code>product_id</code>, not the product name. The name lives once in <code>products</code>. A join matches rows from two tables where a key is equal and puts their columns side by side. It is XLOOKUP, except it can return many columns and many matches.</p>
<pre class="code">SELECT l.line_id, l.product_id, p.product_name
FROM order_lines AS l
JOIN products    AS p
  ON l.product_id = p.product_id;</pre>
<ul><li><code>AS l</code> and <code>AS p</code> are nicknames (aliases) so you do not retype table names.</li>
<li><code>l.product_id</code> means the product_id column from order_lines. The prefix is required when both tables have a column with that name.</li>
<li><code>ON</code> states which values must be equal for two rows to pair up.</li>
<li>Row position is irrelevant. Only key values matter.</li></ul>` },
        { t: 'compare', h: 'INNER JOIN keeps matches. LEFT JOIN keeps every left row.',
          intro: 'Four order lines joined to the product list. Two of them carry a product_id the product list does not recognise.',
          a: { label: 'INNER JOIN (or just JOIN)', sql: `SELECT l.line_id, l.product_id,\n       p.product_name\nFROM order_lines l\nINNER JOIN products p\n  ON l.product_id = p.product_id\nWHERE l.order_id IN ('O1004','O1005')\nORDER BY l.line_id;` },
          b: { label: 'LEFT JOIN', sql: `SELECT l.line_id, l.product_id,\n       p.product_name\nFROM order_lines l\nLEFT JOIN products p\n  ON l.product_id = p.product_id\nWHERE l.order_id IN ('O1004','O1005')\nORDER BY l.line_id;` },
          diff: 'INNER silently dropped lines 8 and 9. LEFT kept them and filled the product columns with NULL. "Left" means the table written first, after FROM.',
          use: ['Totals, audits, anything where losing a row would be wrong → LEFT JOIN from the table you must keep', 'A report that should only show fully matched records → INNER JOIN', 'Unsure → LEFT, then check for NULLs'] },
        { t: 'run', h: 'LEFT JOIN + IS NULL: list what has no match', sql: `SELECT l.line_id, l.order_id, l.product_id\nFROM order_lines l\nLEFT JOIN products p\n  ON l.product_id = p.product_id\nWHERE p.product_id IS NULL;`,
          note: `Keep every line, then keep only the ones where the product side came back empty. This is the single most useful troubleshooting query: it answers "which records reference something that does not exist?" Line 8 uses an unknown code. Line 9 looks like P02 but does not match. Lesson 6 finds out why.` },
        { t: 'compare', h: 'A filter on the right table: ON keeps the left rows, WHERE removes them',
          intro: 'Request: every order, with its screen row if the screen shows it as Open.',
          a: { label: 'Filter in WHERE', sql: `SELECT o.order_id, s.status AS screen_status\nFROM orders o\nLEFT JOIN screen_orders s\n  ON o.order_id = s.order_id\nWHERE s.status = 'Open'\nORDER BY o.order_id;` },
          b: { label: 'Filter in ON', sql: `SELECT o.order_id, s.status AS screen_status\nFROM orders o\nLEFT JOIN screen_orders s\n  ON o.order_id = s.order_id\n AND s.status = 'Open'\nORDER BY o.order_id;` },
          diff: 'WHERE runs after the join and throws out rows where s.status is NULL, which turns the LEFT JOIN back into an INNER JOIN. Putting the test in ON only limits which screen rows may match; all six orders stay.',
          use: ['Condition about the right-hand table, and you still want every left row → put it in ON', 'Condition about the left-hand table → WHERE', 'If a LEFT JOIN returns fewer rows than the left table, look for a right-table test in WHERE'] },
        { t: 'compare', h: 'A join can multiply rows',
          intro: 'How many orders are there? One query joins to the lines first.',
          a: { label: 'Count after joining', sql: `SELECT COUNT(*) AS order_count\nFROM orders o\nJOIN order_lines l\n  ON o.order_id = l.order_id;` },
          b: { label: 'Count the right grain', sql: `SELECT COUNT(*) AS order_count\nFROM orders;` },
          diff: 'Joining one order to its many lines repeats the order once per line. The left number counts lines. This is called fan-out, and it inflates any SUM or COUNT taken from the "one" side.',
          use: ['After any join, ask: what does one row mean now?', 'Need header counts after a join → COUNT(DISTINCT o.order_id)', 'Compare row counts before and after the join when a total looks too high'] },
        { t: 'compare', h: 'Join on the whole key, not part of it',
          intro: 'Stock on hand for the six Nov 4 plan rows. Inventory is kept per date, location and product.',
          a: { label: 'Product only', sql: `SELECT d.plan_id, d.location_id,\n       i.location_id AS inv_loc, i.on_hand\nFROM daily_plan d\nJOIN inventory i\n  ON d.product_id = i.product_id\nWHERE d.plan_date = '2026-11-04'\nORDER BY d.plan_id;` },
          b: { label: 'Date + location + product', sql: `SELECT d.plan_id, d.location_id,\n       i.location_id AS inv_loc, i.on_hand\nFROM daily_plan d\nLEFT JOIN inventory i\n  ON d.plan_date   = i.snapshot_date\n AND d.location_id = i.location_id\n AND d.product_id  = i.product_id\nWHERE d.plan_date = '2026-11-04'\nORDER BY d.plan_id;` },
          diff: 'Matching on product alone pairs Chicago plans with Denver stock, and six rows become ten. With the full key each plan row appears once, and plan 24 honestly shows no stock record.',
          use: ['Read the grain of both tables; the ON clause needs every column they share in their keys', 'More rows than you started with → the key is incomplete or not unique'] },
        { t: 'compare', h: 'JOIN makes the result wider. UNION makes it taller.',
          intro: 'Stacking the products from two orders.',
          a: { label: 'UNION ALL keeps everything', sql: `SELECT product_id FROM order_lines\nWHERE order_id = 'O1001'\nUNION ALL\nSELECT product_id FROM order_lines\nWHERE order_id = 'O1002';` },
          b: { label: 'UNION removes duplicates', sql: `SELECT product_id FROM order_lines\nWHERE order_id = 'O1001'\nUNION\nSELECT product_id FROM order_lines\nWHERE order_id = 'O1002';` },
          diff: 'Both stack rows; neither matches on a key. UNION quietly removed the repeated P03, which could be hiding a real duplicate.',
          use: ['Add columns from a related table → JOIN', 'Append rows with the same columns (two months, two systems) → UNION ALL', 'Use plain UNION only when you intend to de-duplicate'] },
        { t: 'text', h: 'The other joins, in one line each', html: `
<ul><li><code>RIGHT JOIN</code>: LEFT JOIN with the tables swapped. Most people rewrite it as a LEFT JOIN.</li>
<li><code>FULL OUTER JOIN</code>: keep unmatched rows from both sides. Used to reconcile two systems (lesson 6).</li>
<li><code>CROSS JOIN</code>: every row with every row. Rarely intended.</li>
<li>Three tables: add a second JOIN. Each JOIN has its own ON.</li></ul>
<pre class="code">SELECT o.order_id, loc.location_name, p.product_name, l.qty_ordered
FROM orders o
JOIN order_lines l ON l.order_id   = o.order_id
JOIN locations loc ON loc.location_id = o.location_id
LEFT JOIN products p ON p.product_id = l.product_id;</pre>` },
        { t: 'try', id: 'join-names', title: 'Add product names to an order',
          prompt: "Return line_id, product_name and qty_ordered for order O1001. Use an INNER JOIN between order_lines and products. Sort by line_id.",
          starter: `SELECT l.line_id, p.product_name, l.qty_ordered\nFROM order_lines l\n`,
          solution: `SELECT l.line_id, p.product_name, l.qty_ordered\nFROM order_lines l\nINNER JOIN products p\n  ON l.product_id = p.product_id\nWHERE l.order_id = 'O1001'\nORDER BY l.line_id;`, ordered: true,
          hints: ['JOIN products p ON l.product_id = p.product_id', "Then WHERE l.order_id = 'O1001'", 'ORDER BY l.line_id'],
          explain: 'Both lines have a valid product, so INNER and LEFT give the same answer here. That is worth checking rather than assuming.' },
        { t: 'try', id: 'join-orphan', title: 'Lines with no order header',
          prompt: 'Find order_lines whose order_id does not exist in orders. Return line_id and order_id.',
          starter: `SELECT l.line_id, l.order_id\nFROM order_lines l\nLEFT JOIN orders o\n  ON \nWHERE `,
          solution: `SELECT l.line_id, l.order_id\nFROM order_lines l\nLEFT JOIN orders o\n  ON l.order_id = o.order_id\nWHERE o.order_id IS NULL;`,
          hints: ['Keep every line with LEFT JOIN, then keep the ones where the order side is empty.', 'ON l.order_id = o.order_id', 'WHERE o.order_id IS NULL'],
          explain: 'Line 11 belongs to O1007, which has no header. An INNER JOIN report would never show this line, and nobody would know it was missing.' },
        { t: 'try', id: 'join-three', title: 'Units ordered per distribution center',
          prompt: "Return location_name and total_ordered (sum of qty_ordered) for each location that has orders. Join orders to order_lines and to locations. Exclude orders whose status is Cancelled. Sort by location_name.",
          starter: `SELECT loc.location_name,\n       SUM(l.qty_ordered) AS total_ordered\nFROM orders o\n`,
          solution: `SELECT loc.location_name,\n       SUM(l.qty_ordered) AS total_ordered\nFROM orders o\nJOIN order_lines l ON l.order_id = o.order_id\nJOIN locations loc ON loc.location_id = o.location_id\nWHERE o.status <> 'Cancelled'\nGROUP BY loc.location_name\nORDER BY loc.location_name;`, ordered: true,
          hints: ['Two JOINs, each with its own ON.', "WHERE o.status <> 'Cancelled' goes before GROUP BY.", 'GROUP BY loc.location_name'],
          explain: 'Join, filter rows, then group: the run order from lesson 1. Chicago includes the duplicated O1002 line, which lesson 6 deals with.' },
        { t: 'quiz', q: 'A LEFT JOIN from orders to screen_orders returns fewer rows than orders has. What is the most likely cause?',
          options: ['LEFT JOIN always drops unmatched rows', 'A WHERE condition on a screen_orders column removed the unmatched rows', 'The tables have different numbers of columns'], correct: 1,
          why: 'Unmatched rows have NULL in every screen_orders column, so a WHERE test on those columns fails for them. Move the test into ON.' }
      ]
    },
    /* ------------------------------------------------------------------ 5 */
    {
      id: 'functions', title: 'Functions: NULL, CASE, text, dates and maths', mins: 30, priority: 'Must',
      builds: 'You can get the right rows from the right tables. Functions clean and reshape the values in them.',
      outcome: 'Handle missing values, label rows with CASE, clean a text key, do date arithmetic and avoid the integer-division trap, in SQL Server syntax.',
      steps: [
        { t: 'compare', h: 'Any calculation with NULL returns NULL',
          intro: 'Units still to ship on order O1003 and O1004.',
          a: { label: 'Raw subtraction', sql: `SELECT line_id, qty_ordered, qty_shipped,\n       qty_ordered - qty_shipped\n         AS still_to_ship\nFROM order_lines\nWHERE order_id IN ('O1003','O1004');` },
          b: { label: 'With ISNULL', sql: `SELECT line_id, qty_ordered, qty_shipped,\n       qty_ordered - ISNULL(qty_shipped, 0)\n         AS still_to_ship\nFROM order_lines\nWHERE order_id IN ('O1003','O1004');` },
          diff: '30 minus unknown is unknown, so the unshipped lines show NULL instead of 30 and 20. ISNULL(x, 0) substitutes a value when x is missing.',
          use: ['ISNULL(x, 0): SQL Server, two arguments', 'COALESCE(x, y, z): works on every database, returns the first non-NULL of any number of arguments', 'Only substitute zero when missing really does mean zero'] },
        { t: 'run', h: 'CASE is IF / IFS', sql: `SELECT line_id, qty_ordered, qty_shipped,\n       CASE\n         WHEN qty_shipped IS NULL       THEN 'Not shipped'\n         WHEN qty_shipped < qty_ordered THEN 'Short'\n         ELSE 'Complete'\n       END AS line_status\nFROM order_lines\nORDER BY line_id;`,
          note: `CASE checks each WHEN from the top and stops at the first one that is true. Put the NULL test first: a NULL compared with anything is never true, so without that first line an unshipped row would fall through to ELSE and be labelled Complete. Always finish with <code>END</code>.` },
        { t: 'run', h: 'CASE inside SUM: several counts in one row', sql: `SELECT location_id,\n       COUNT(*) AS orders,\n       SUM(CASE WHEN status = 'Open'    THEN 1 ELSE 0 END) AS open_orders,\n       SUM(CASE WHEN status = 'Shipped' THEN 1 ELSE 0 END) AS shipped_orders\nFROM orders\nGROUP BY location_id\nORDER BY location_id;`,
          note: `Each CASE turns a row into 1 or 0 and SUM adds them. This is COUNTIFS, and it is how you put categories into columns without a pivot. It comes up in interviews often.` },
        { t: 'compare', h: 'Whole number ÷ whole number = whole number',
          intro: 'Fill rate (shipped ÷ ordered) for order O1004.',
          a: { label: 'Integer division', sql: `SELECT line_id, qty_shipped, qty_ordered,\n       qty_shipped / qty_ordered\n         AS fill_rate\nFROM order_lines\nWHERE order_id = 'O1004';` },
          b: { label: 'Multiply by 100.0 first', sql: `SELECT line_id, qty_shipped, qty_ordered,\n       ROUND(100.0 * qty_shipped\n             / qty_ordered, 1)\n         AS fill_pct\nFROM order_lines\nWHERE order_id = 'O1004';` },
          diff: '45 / 50 between two integer columns gives 0, because SQL Server discards the remainder. Putting a decimal number into the calculation (100.0 or 1.0) makes the result decimal.',
          use: ['Any ratio or percentage → start with 1.0 * or 100.0 *', 'Divisor might be zero → x / NULLIF(y, 0) returns NULL instead of an error', 'ROUND(value, 2) for presentation'] },
        { t: 'run', h: 'Text functions, shown on a dirty key', sql: `SELECT raw_product_id,\n       CONCAT('[', raw_product_id, ']')  AS shown_in_brackets,\n       LEN(raw_product_id)               AS length,\n       UPPER(TRIM(raw_product_id))       AS clean_id\nFROM product_feed;`,
          note: `<code>TRIM</code> removes spaces from both ends (<code>LTRIM</code>/<code>RTRIM</code> for one end). <code>UPPER</code>/<code>LOWER</code> change case. <code>LEN</code> counts characters. <code>CONCAT</code> glues text together; wrapping a value in brackets makes hidden spaces visible. Also: <code>LEFT(x, 3)</code>, <code>RIGHT(x, 2)</code>, <code>SUBSTRING(x, start, length)</code>, <code>REPLACE(x, 'old', 'new')</code>. One SQL Server quirk: its LEN ignores trailing spaces.` },
        { t: 'compare', h: 'Clean the key before you join on it',
          intro: 'How many of the 7 feed rows find their product?',
          a: { label: 'Raw key', sql: `SELECT COUNT(*) AS matched\nFROM product_feed f\nJOIN products p\n  ON f.raw_product_id = p.product_id;` },
          b: { label: 'Cleaned key', sql: `SELECT COUNT(*) AS matched\nFROM product_feed f\nJOIN products p\n  ON UPPER(TRIM(f.raw_product_id))\n     = p.product_id;` },
          diff: 'Spaces and lower case stop four rows from matching. Nothing errors; the rows are simply absent.',
          use: ['Keys arriving from another system or a file → compare the cleaned version', 'SQL Server by default ignores case and trailing spaces when comparing text, so there only the leading spaces would break. Other systems in the chain may be stricter, which is how the same key matches in one place and fails in another'] },
        { t: 'run', h: 'Date functions', sql: `SELECT receipt_id, expected_date, received_date,\n       DATEDIFF(day, expected_date, received_date) AS days_late,\n       DATEADD(day, 2, expected_date)              AS chase_on,\n       DATEDIFF(day, expected_date, GETDATE())     AS days_since_expected\nFROM receipts\nORDER BY receipt_id;`,
          note: `<code>DATEDIFF(day, start, end)</code> is end minus start in days; swap <code>day</code> for <code>month</code>, <code>hour</code> and so on. <code>DATEADD(day, 2, d)</code> adds two days. <code>GETDATE()</code> is now (fixed at 2026-11-05 in this practice database). <code>YEAR(d)</code>, <code>MONTH(d)</code>, <code>DAY(d)</code> pull out parts. <code>CAST(synced_at AS DATE)</code> drops the time. A NULL date in gives NULL out.` },
        { t: 'try', id: 'fn-case', title: 'Label every order line',
          prompt: "Return line_id and line_status for every order line: 'Not shipped' when qty_shipped is NULL, 'Short' when qty_shipped is less than qty_ordered, otherwise 'Complete'. Sort by line_id.",
          starter: `SELECT line_id,\n       CASE\n         \n       END AS line_status\nFROM order_lines\nORDER BY line_id;`,
          solution: `SELECT line_id,\n       CASE\n         WHEN qty_shipped IS NULL THEN 'Not shipped'\n         WHEN qty_shipped < qty_ordered THEN 'Short'\n         ELSE 'Complete'\n       END AS line_status\nFROM order_lines\nORDER BY line_id;`, ordered: true,
          hints: ['Three branches: two WHEN lines and an ELSE.', 'Test for NULL first.', "WHEN qty_shipped IS NULL THEN 'Not shipped'"],
          explain: 'Order of the WHEN lines is the logic. NULL first, then the comparison, then everything else.' },
        { t: 'try', id: 'fn-fill', title: 'Fill rate per order',
          prompt: 'For lines that have a shipped quantity (not NULL), return order_id and fill_pct = 100 × total shipped ÷ total ordered, rounded to 1 decimal place, per order. Sort by order_id.',
          starter: `SELECT order_id,\n       \nFROM order_lines\n`,
          solution: `SELECT order_id,\n       ROUND(100.0 * SUM(qty_shipped) / SUM(qty_ordered), 1) AS fill_pct\nFROM order_lines\nWHERE qty_shipped IS NOT NULL\nGROUP BY order_id\nORDER BY order_id;`, ordered: true,
          hints: ['Filter out NULL shipped quantities in WHERE.', 'Sum first, then divide: 100.0 * SUM(qty_shipped) / SUM(qty_ordered)', 'Wrap it in ROUND(…, 1) and GROUP BY order_id.'],
          explain: 'Dividing the two totals gives the order-level rate. Averaging the line percentages would weight a 10-unit line the same as a 50-unit line.' },
        { t: 'try', id: 'fn-late', title: 'Late receipts',
          prompt: 'From receipts, return receipt_id and days_late for receipts that have a received_date later than expected_date. Sort by receipt_id.',
          starter: `SELECT receipt_id,\n       DATEDIFF(day, , ) AS days_late\nFROM receipts\n`,
          solution: `SELECT receipt_id,\n       DATEDIFF(day, expected_date, received_date) AS days_late\nFROM receipts\nWHERE received_date > expected_date\nORDER BY receipt_id;`, ordered: true,
          hints: ['DATEDIFF(day, earlier, later)', 'WHERE received_date > expected_date', 'Rows with a NULL received_date fail that test on their own, which is what you want here.'],
          explain: 'Receipts 4 and 7 have not arrived at all. They are not "late by N days" yet; they are a separate list (received_date IS NULL).' },
        { t: 'quiz', q: 'A CASE has WHEN qty_shipped < qty_ordered THEN \'Short\' ELSE \'Complete\' and nothing else. What label does an unshipped line (NULL) get?',
          options: ['Short', 'Complete', 'NULL'], correct: 1,
          why: 'NULL < 50 is not true, so the WHEN is skipped and the row falls to ELSE. That is why the NULL test goes first.' }
      ]
    },
    /* ------------------------------------------------------------------ 6 */
    {
      id: 'trace', title: 'Trace a wrong number on the screen', mins: 35, priority: 'Must',
      builds: 'Every earlier lesson was a tool. This is the job: use them in order to find where data went wrong.',
      outcome: 'Reconcile a screen against its source, name the five usual causes of a mismatch, and prove which one you are looking at.',
      steps: [
        { t: 'text', h: 'A method you can say out loud', html: `
<p>Data travels: source tables → sync job → copy the screen reads → screen. When the screen is wrong, work backwards and ask one question at each stop.</p>
<ol><li><strong>Compare.</strong> Put the source value and the screen value side by side, per order. Which rows differ, and in which direction?</li>
<li><strong>Duplicates.</strong> Is the same record loaded twice? (Number too high.)</li>
<li><strong>Dropped rows.</strong> Did a join or filter lose records, often through an unmatched key? (Number too low.)</li>
<li><strong>Freshness.</strong> Is the copy old? (Status or quantity out of date.)</li>
<li><strong>Completeness.</strong> Does a record exist on one side only? (Missing from the screen, or on the screen with no source.)</li></ol>
<p>Then report: what you compared, what differs, the cause, how many records it affects, and the next action.</p>` },
        { t: 'run', h: 'Step 1: source beside screen', sql: `WITH src AS (\n  SELECT order_id, SUM(qty_ordered) AS source_qty\n  FROM order_lines\n  GROUP BY order_id\n)\nSELECT o.order_id,\n       o.status     AS source_status,\n       s.status     AS screen_status,\n       src.source_qty,\n       s.total_qty  AS screen_qty\nFROM orders o\nLEFT JOIN src             ON src.order_id = o.order_id\nLEFT JOIN screen_orders s ON s.order_id   = o.order_id\nORDER BY o.order_id;`,
          note: `<code>WITH src AS (…)</code> names a sub-result so the main query stays readable (more in lesson 7). The lines are totalled to order grain <em>before</em> joining, so nothing fans out. Read the output: O1004 disagrees on status, O1005 on quantity, O1006 is not on the screen at all. O1002 agrees, and the store still says it is wrong. Each one is a different cause.` },
        { t: 'compare', h: 'Too high: find the duplicate, do not hide it',
          intro: 'O1002 shows 200 units. The store ordered 100.',
          a: { label: 'DISTINCT hides it', sql: `SELECT DISTINCT order_id, product_id,\n       qty_ordered\nFROM order_lines\nWHERE order_id = 'O1002';` },
          b: { label: 'GROUP BY + HAVING finds it', sql: `SELECT order_id, product_id,\n       COUNT(*) AS copies\nFROM order_lines\nGROUP BY order_id, product_id\nHAVING COUNT(*) > 1;` },
          diff: 'The same line was loaded twice at the source, so source and screen agree with each other and are both wrong. DISTINCT makes the output look right and leaves the bad row in the table. The duplicate check names the exact key that repeats.',
          use: ['Duplicate check: GROUP BY the columns that should be unique, HAVING COUNT(*) > 1', 'When source and screen match but the user disagrees, the error is upstream of both', 'Reach for DISTINCT only after you know why rows repeat'] },
        { t: 'compare', h: 'Too low: a join dropped a row',
          intro: 'O1005 shows 25 units on the screen. The source lines add up to 105. Suppose the sync job joins lines to products.',
          a: { label: 'What the sync does (INNER)', sql: `SELECT l.order_id,\n       SUM(l.qty_ordered) AS total_qty\nFROM order_lines l\nJOIN products p\n  ON l.product_id = p.product_id\nWHERE l.order_id = 'O1005'\nGROUP BY l.order_id;` },
          b: { label: 'Keep every line (LEFT)', sql: `SELECT l.order_id,\n       SUM(l.qty_ordered) AS total_qty\nFROM order_lines l\nLEFT JOIN products p\n  ON l.product_id = p.product_id\nWHERE l.order_id = 'O1005'\nGROUP BY l.order_id;` },
          diff: 'The INNER JOIN reproduces the screen value exactly, which is strong evidence that this is where 80 units disappear. One line does not match a product.',
          use: ['Reproduce the wrong number with a query; when your query returns the same wrong value, you have found the step that causes it', 'Number too low → suspect INNER JOIN or a WHERE filter', 'Number too high → suspect duplicates or fan-out'] },
        { t: 'run', h: 'Why that line does not match', sql: `SELECT line_id,\n       CONCAT('[', product_id, ']') AS key_in_brackets,\n       LEN(product_id)              AS key_length\nFROM order_lines\nWHERE order_id = 'O1005';`,
          note: `Line 9 holds <code>' P02'</code> with a leading space: four characters, not three. On screen it looks identical to P02. Brackets and LEN expose it. The fix belongs where the value is entered or loaded; your query can prove it with <code>TRIM(product_id)</code>.` },
        { t: 'run', h: 'Out of date: check when the copy was refreshed', sql: `SELECT order_id, status, synced_at,\n       DATEDIFF(day, synced_at, GETDATE()) AS days_since_sync\nFROM screen_orders\nWHERE synced_at < (SELECT MAX(synced_at) FROM screen_orders)\nORDER BY synced_at;`,
          note: `The inner query finds the latest sync time; the outer one lists rows older than it. O1004 was last refreshed on Nov 2, before it shipped, so the screen still says Open. The data is not wrong, it is stale. That points at the sync job for that order, not at the order tables.` },
        { t: 'compare', h: 'Missing on one side: check both directions',
          intro: 'A record can exist in the source and not on the screen, or the reverse.',
          a: { label: 'In source, not on screen', sql: `SELECT o.order_id, o.status\nFROM orders o\nLEFT JOIN screen_orders s\n  ON s.order_id = o.order_id\nWHERE s.order_id IS NULL;` },
          b: { label: 'On screen, not in source', sql: `SELECT s.order_id, s.status\nFROM screen_orders s\nLEFT JOIN orders o\n  ON o.order_id = s.order_id\nWHERE o.order_id IS NULL;` },
          diff: 'Same pattern, tables swapped, different findings. O1006 never reached the screen. O1007 is on the screen with no order header behind it.',
          use: ['Always run the check both ways; one direction alone misses half the problems', 'FULL OUTER JOIN … WHERE a.key IS NULL OR b.key IS NULL does both in one query', 'Ask whether a missing row is intended (for example, cancelled orders hidden on purpose) before calling it a defect'] },
        { t: 'compare', h: 'A duplicate in a lookup table doubles your total',
          intro: 'Units ordered of P02. The product feed lists P02 twice.',
          a: { label: 'Lines only', sql: `SELECT SUM(qty_ordered) AS p02_units\nFROM order_lines\nWHERE product_id = 'P02';` },
          b: { label: 'Joined to the feed', sql: `SELECT SUM(l.qty_ordered) AS p02_units\nFROM order_lines l\nJOIN product_feed f\n  ON l.product_id = f.raw_product_id\nWHERE l.product_id = 'P02';` },
          diff: 'Each order line matched two feed rows, so every quantity was added twice. The order data is fine; the lookup table is not unique on its key.',
          use: ['Before joining to a lookup table, run the duplicate check on its key', 'A total that is exactly double, or grows after adding a join, is fan-out'] },
        { t: 'run', h: 'Keep one row per key with ROW_NUMBER', sql: `WITH ranked AS (\n  SELECT line_id, order_id, product_id, qty_ordered,\n         ROW_NUMBER() OVER (\n           PARTITION BY order_id, product_id\n           ORDER BY line_id\n         ) AS rn\n  FROM order_lines\n)\nSELECT line_id, order_id, product_id, qty_ordered, rn\nFROM ranked\nWHERE order_id = 'O1002';`,
          note: `<code>ROW_NUMBER()</code> numbers the rows inside each group (<code>PARTITION BY</code>) in the order you give. Duplicates get 1, 2, 3. Filtering to <code>rn = 1</code> keeps one row per key; <code>rn &gt; 1</code> lists the extras. It is the standard SQL Server way to de-duplicate or to pick the latest record per key (order by a date, descending).` },
        { t: 'try', id: 'trace-dupes', title: 'Duplicate keys in the product feed',
          prompt: 'From product_feed, return clean_id (the raw_product_id trimmed and upper-cased) and row_count for cleaned IDs that occur more than once.',
          starter: `SELECT UPPER(TRIM(raw_product_id)) AS clean_id,\n       COUNT(*) AS row_count\nFROM product_feed\n`,
          solution: `SELECT UPPER(TRIM(raw_product_id)) AS clean_id,\n       COUNT(*) AS row_count\nFROM product_feed\nGROUP BY UPPER(TRIM(raw_product_id))\nHAVING COUNT(*) > 1;`,
          hints: ['Group by the cleaned expression, not the raw column.', 'GROUP BY UPPER(TRIM(raw_product_id))', 'HAVING COUNT(*) > 1'],
          explain: 'On SQL Server you repeat the expression in GROUP BY; the alias is not available there. Clean first, then count, or " p01 " and "P01" would look like two different keys.' },
        { t: 'try', id: 'trace-recon', title: 'Orders where the screen quantity is wrong',
          prompt: 'Return order_id, source_qty (sum of qty_ordered from order_lines) and screen_qty (total_qty from screen_orders) for orders on the screen whose two quantities differ.',
          starter: `WITH src AS (\n  SELECT order_id, SUM(qty_ordered) AS source_qty\n  FROM order_lines\n  GROUP BY order_id\n)\nSELECT s.order_id, src.source_qty, s.total_qty AS screen_qty\nFROM screen_orders s\n`,
          solution: `WITH src AS (\n  SELECT order_id, SUM(qty_ordered) AS source_qty\n  FROM order_lines\n  GROUP BY order_id\n)\nSELECT s.order_id, src.source_qty, s.total_qty AS screen_qty\nFROM screen_orders s\nJOIN src ON src.order_id = s.order_id\nWHERE src.source_qty <> s.total_qty;`,
          hints: ['Join the screen rows to the src totals on order_id.', 'JOIN src ON src.order_id = s.order_id', 'WHERE src.source_qty <> s.total_qty'],
          explain: 'Only O1005 differs. Totalling the lines inside the CTE first keeps one row per order on both sides of the join.' },
        { t: 'try', id: 'trace-missing', title: 'Orders the screen never received',
          prompt: 'Return order_id and status for orders in orders that have no row in screen_orders.',
          starter: `SELECT o.order_id, o.status\nFROM orders o\n`,
          solution: `SELECT o.order_id, o.status\nFROM orders o\nLEFT JOIN screen_orders s\n  ON s.order_id = o.order_id\nWHERE s.order_id IS NULL;`,
          hints: ['LEFT JOIN from the table you want to keep.', 'ON s.order_id = o.order_id', 'WHERE s.order_id IS NULL'],
          explain: 'O1006 is Cancelled. The next question is for a person, not a query: are cancelled orders meant to be hidden, or did the sync miss it?' },
        { t: 'try', id: 'trace-stale', title: 'Screen rows with the wrong status',
          prompt: 'Return order_id, source_status (from orders) and screen_status (from screen_orders) for orders where the two statuses differ.',
          starter: `SELECT o.order_id,\n       o.status AS source_status,\n       s.status AS screen_status\nFROM orders o\n`,
          solution: `SELECT o.order_id,\n       o.status AS source_status,\n       s.status AS screen_status\nFROM orders o\nJOIN screen_orders s\n  ON s.order_id = o.order_id\nWHERE o.status <> s.status;`,
          hints: ['Join the two tables on order_id.', 'Compare the two status columns in WHERE.', 'WHERE o.status <> s.status'],
          explain: 'O1004 only. An INNER JOIN is right here because a status can only differ where both rows exist; the missing rows are a separate check.' },
        { t: 'text', h: 'How to report a finding', html: `
<p>Use the same four parts every time: <strong>evidence, cause, impact, next action.</strong></p>
<p class="say">"I compared order totals in the source with what the screen shows. Five of six screen rows match. O1005 shows 25 against 105 in the source. I can reproduce 25 by inner-joining lines to products, and one line has a leading space in its product code, so it fails the match. That affects one order and 80 units today, and any line keyed the same way in future. I would correct that code at the source, re-run the sync for the order, and ask whether the load can trim codes on the way in."</p>
<p>If you do not know something, say what you would check next. Interviewers for a role like this are listening for the method.</p>` },
        { t: 'quiz', q: 'The source total and the screen total for an order are identical, and the store insists the quantity is double what they ordered. Where do you look first?',
          options: ['The sync job, because the screen is wrong', 'Duplicate rows in the source lines, because both copies agree', 'The ORDER BY clause'], correct: 1,
          why: 'If the copy matches the source, the sync did its job. The error is in the source itself; run GROUP BY … HAVING COUNT(*) > 1 on the line key.' }
      ]
    },
    /* ------------------------------------------------------------------ 7 */
    {
      id: 'steps', title: 'Multi-step queries: subquery, CTE, window', mins: 20, priority: 'If time',
      builds: 'You used WITH and ROW_NUMBER in lesson 6. This lesson explains them properly.',
      outcome: 'Break a hard question into named steps and add a group total without losing the detail rows.',
      steps: [
        { t: 'compare', h: 'Subquery and CTE: same answer, different readability',
          intro: 'Order lines larger than the average line.',
          a: { label: 'Subquery', sql: `SELECT line_id, qty_ordered\nFROM order_lines\nWHERE qty_ordered >\n      (SELECT AVG(qty_ordered)\n       FROM order_lines);` },
          b: { label: 'CTE', sql: `WITH avg_line AS (\n  SELECT AVG(qty_ordered) AS avg_qty\n  FROM order_lines\n)\nSELECT l.line_id, l.qty_ordered\nFROM order_lines l\nCROSS JOIN avg_line a\nWHERE l.qty_ordered > a.avg_qty;` },
          diff: 'Identical rows. A subquery is a query in brackets used as a value or a table. A CTE gives that inner query a name at the top so the main query reads top to bottom.',
          use: ['One small inner value → subquery is fine', 'Two or more steps, or the same step reused → CTE', 'In an interview a CTE lets you explain step one before writing step two'] },
        { t: 'compare', h: 'GROUP BY collapses rows. A window function keeps them.',
          intro: 'Order totals for O1001 and O1004.',
          a: { label: 'GROUP BY', sql: `SELECT order_id,\n       SUM(qty_ordered) AS order_total\nFROM order_lines\nWHERE order_id IN ('O1001','O1004')\nGROUP BY order_id;` },
          b: { label: 'SUM() OVER', sql: `SELECT line_id, order_id, qty_ordered,\n       SUM(qty_ordered) OVER (\n         PARTITION BY order_id\n       ) AS order_total\nFROM order_lines\nWHERE order_id IN ('O1001','O1004');` },
          diff: 'GROUP BY returns one row per order. OVER (PARTITION BY …) calculates the same total and writes it on every line, so you can show each line as a share of its order.',
          use: ['Only the summary needed → GROUP BY', 'Detail rows plus a group total, rank or running number → window function', 'PARTITION BY is the window version of GROUP BY'] },
        { t: 'run', h: 'Latest record per key', sql: `WITH ranked AS (\n  SELECT receipt_id, location_id, product_id, expected_date,\n         ROW_NUMBER() OVER (\n           PARTITION BY location_id, product_id\n           ORDER BY expected_date DESC\n         ) AS rn\n  FROM receipts\n)\nSELECT receipt_id, location_id, product_id, expected_date\nFROM ranked\nWHERE rn = 1\nORDER BY location_id, product_id;`,
          note: `Number the receipts for each location and product from newest to oldest, then keep number 1. "Most recent status per order", "last price per item" and "first load per day" are all this query with different columns.` },
        { t: 'try', id: 'steps-wape', title: 'Forecast error by location',
          prompt: 'Using only daily_plan rows where actual_units is not NULL, return location_id and wape_pct = 100 × SUM(ABS(actual_units − forecast_units)) ÷ SUM(actual_units), rounded to 2 decimals. Sort by location_id.',
          starter: `SELECT location_id,\n       \nFROM daily_plan\n`,
          solution: `SELECT location_id,\n       ROUND(100.0 * SUM(ABS(actual_units - forecast_units)) / SUM(actual_units), 2) AS wape_pct\nFROM daily_plan\nWHERE actual_units IS NOT NULL\nGROUP BY location_id\nORDER BY location_id;`, ordered: true,
          hints: ['ABS() makes over- and under-forecasts both positive.', '100.0 * SUM(ABS(actual_units - forecast_units)) / SUM(actual_units)', 'WHERE actual_units IS NOT NULL, GROUP BY location_id'],
          explain: 'Excluding the NULL actual keeps numerator and denominator on the same rows. This metric (weighted absolute percentage error) is common in planning teams.' },
        { t: 'try', id: 'steps-top', title: 'Largest line on each order',
          prompt: 'Return order_id, product_id and qty_ordered for the single largest line on each order. If two lines tie, keep the one with the lower line_id. Sort by order_id.',
          starter: `WITH ranked AS (\n  SELECT order_id, product_id, qty_ordered,\n         ROW_NUMBER() OVER (\n           PARTITION BY \n           ORDER BY \n         ) AS rn\n  FROM order_lines\n)\nSELECT order_id, product_id, qty_ordered\nFROM ranked\n`,
          solution: `WITH ranked AS (\n  SELECT order_id, product_id, qty_ordered,\n         ROW_NUMBER() OVER (\n           PARTITION BY order_id\n           ORDER BY qty_ordered DESC, line_id\n         ) AS rn\n  FROM order_lines\n)\nSELECT order_id, product_id, qty_ordered\nFROM ranked\nWHERE rn = 1\nORDER BY order_id;`, ordered: true,
          hints: ['PARTITION BY order_id', 'ORDER BY qty_ordered DESC, line_id', 'WHERE rn = 1'],
          explain: 'The second ORDER BY column breaks ties, so the answer is the same every time it runs.' }
      ]
    }
  ],
  /* -------------------------------------------------------------------- mock */
  mock: {
    minutes: 30,
    intro: 'Six tasks, no hints, in the order an assessment tends to build: filter, total, join, missing data, calculation, investigation. Say your reasoning out loud as you type. Check each answer only after you have committed to it.',
    tasks: [
      { id: 'mock-1', title: 'Filter and sort', prompt: 'Return order_id, customer and status for orders at location L01, newest order_date first, then by order_id.',
        solution: `SELECT order_id, customer, status\nFROM orders\nWHERE location_id = 'L01'\nORDER BY order_date DESC, order_id;`, ordered: true,
        explain: 'Select, filter, sort. Two sort columns make the order unambiguous.' },
      { id: 'mock-2', title: 'Count by group', prompt: 'Return status and order_count for each order status, most common first.',
        solution: `SELECT status, COUNT(*) AS order_count\nFROM orders\nGROUP BY status\nORDER BY order_count DESC;`, ordered: true,
        explain: 'orders has one row per order, so COUNT(*) is safe here.' },
      { id: 'mock-3', title: 'Find unmatched records', prompt: 'Return line_id and product_id for order lines whose product_id is not in products.',
        solution: `SELECT l.line_id, l.product_id\nFROM order_lines l\nLEFT JOIN products p ON p.product_id = l.product_id\nWHERE p.product_id IS NULL;`,
        explain: 'LEFT JOIN + IS NULL. One unknown code and one code with a leading space.' },
      { id: 'mock-4', title: 'Keep every row, with a condition', prompt: "Return location_name and total_ordered for all four locations: the sum of qty_ordered on orders that are not Cancelled. A location with nothing ordered must still appear, with 0. Sort by location_name.",
        solution: `SELECT loc.location_name,\n       ISNULL(SUM(l.qty_ordered), 0) AS total_ordered\nFROM locations loc\nLEFT JOIN orders o\n  ON o.location_id = loc.location_id\n AND o.status <> 'Cancelled'\nLEFT JOIN order_lines l\n  ON l.order_id = o.order_id\nGROUP BY loc.location_name\nORDER BY loc.location_name;`, ordered: true,
        explain: "Start FROM the table you must keep. The Cancelled test goes in ON, because in WHERE it would drop Dallas. ISNULL turns Dallas's NULL total into 0." },
      { id: 'mock-5', title: 'Calculate with NULL in play', prompt: 'Return order_id, product_id and short_qty (qty_ordered minus qty_shipped) for lines that have a shipped quantity lower than the ordered quantity. Sort by order_id.',
        solution: `SELECT order_id, product_id,\n       qty_ordered - qty_shipped AS short_qty\nFROM order_lines\nWHERE qty_shipped < qty_ordered\nORDER BY order_id;`, ordered: true,
        explain: 'Unshipped lines hold NULL, and NULL < x is never true, so they drop out on their own. Say that out loud; it shows you thought about it.' },
      { id: 'mock-6', title: 'Investigate a mismatch', prompt: 'The store for O1004 says their order shipped but the screen says Open. Return order_id, source_status, screen_status and synced_at for every order where the screen status differs from the status in orders.',
        solution: `SELECT o.order_id,\n       o.status AS source_status,\n       s.status AS screen_status,\n       s.synced_at\nFROM orders o\nJOIN screen_orders s ON s.order_id = o.order_id\nWHERE o.status <> s.status;`,
        explain: 'The synced_at value is the evidence: the screen row was last refreshed before the order shipped.' }
    ],
    talk: [
      'Restate the request and say what one row of the answer should be.',
      'Name the table that sets the grain and the key you will join on.',
      'Write it in run order: FROM and JOIN, then WHERE, then GROUP BY, then SELECT.',
      'Before you finish: does the row count make sense, and how are NULLs treated?',
      'If stuck, say what you would check next. Silence is the only bad answer.'
    ]
  },
  /* ------------------------------------------------------------------ cheats */
  cheats: [
    ['Filter and sort', `SELECT TOP 10 order_id, order_date, status\nFROM orders\nWHERE location_id = 'L01'\n  AND order_date >= '2026-11-01'\n  AND order_date <  '2026-12-01'\nORDER BY order_date DESC;`],
    ['Total per group, then filter the totals', `SELECT order_id, COUNT(*) AS line_count, SUM(qty_ordered) AS total\nFROM order_lines\nWHERE qty_ordered > 0            -- rows\nGROUP BY order_id\nHAVING SUM(qty_ordered) > 50     -- groups\nORDER BY total DESC;`],
    ['Join and keep every left row', `SELECT l.line_id, p.product_name\nFROM order_lines l\nLEFT JOIN products p\n  ON p.product_id = l.product_id;`],
    ['Records with no match', `SELECT l.line_id, l.product_id\nFROM order_lines l\nLEFT JOIN products p ON p.product_id = l.product_id\nWHERE p.product_id IS NULL;`],
    ['Duplicate check', `SELECT order_id, product_id, COUNT(*) AS copies\nFROM order_lines\nGROUP BY order_id, product_id\nHAVING COUNT(*) > 1;`],
    ['Reconcile source against a copy', `WITH src AS (\n  SELECT order_id, SUM(qty_ordered) AS source_qty\n  FROM order_lines GROUP BY order_id\n)\nSELECT s.order_id, src.source_qty, s.total_qty\nFROM screen_orders s\nJOIN src ON src.order_id = s.order_id\nWHERE src.source_qty <> s.total_qty;`],
    ['Label rows / count by condition', `SELECT location_id,\n       SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open_orders\nFROM orders\nGROUP BY location_id;`],
    ['Safe ratio', `SELECT ROUND(100.0 * SUM(qty_shipped) / NULLIF(SUM(qty_ordered), 0), 1) AS fill_pct\nFROM order_lines\nWHERE qty_shipped IS NOT NULL;`],
    ['One row per key (dedupe / latest)', `WITH ranked AS (\n  SELECT *, ROW_NUMBER() OVER (\n           PARTITION BY order_id, product_id ORDER BY line_id) AS rn\n  FROM order_lines\n)\nSELECT * FROM ranked WHERE rn = 1;`]
  ],
  dialect: [
    ['First N rows', 'SELECT TOP 5 …', 'LIMIT 5 at the end (MySQL, Postgres, SQLite)'],
    ['Replace NULL', 'ISNULL(x, 0) or COALESCE(x, 0)', 'IFNULL / NVL elsewhere. COALESCE works everywhere'],
    ['Join text', "a + b or CONCAT(a, b)", "a || b elsewhere"],
    ['Text length', 'LEN(x) (ignores trailing spaces)', 'LENGTH(x)'],
    ['Now', 'GETDATE()', 'NOW() / CURRENT_TIMESTAMP'],
    ['Days between', 'DATEDIFF(day, start, end)', 'end - start, or DATEDIFF(end, start) in MySQL'],
    ['Add days', 'DATEADD(day, 7, d)', "d + INTERVAL '7 days'"],
    ['Odd column names', '[Order Date]', '"Order Date"'],
    ['Text comparison', 'Not case-sensitive by default; trailing spaces ignored', 'Often case-sensitive'],
    ['Alias in WHERE / GROUP BY / HAVING', 'Not allowed. Repeat the expression', 'Some databases allow it'],
    ['Column not in GROUP BY', 'Error', 'Some databases return an arbitrary value']
  ]
};
if (typeof module !== 'undefined') module.exports = COURSE;
