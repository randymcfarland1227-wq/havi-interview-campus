/* The whole curriculum. Each lesson is one page of steps, in the order you read them:
   text    - explanation
   sheet   - a table shown as a spreadsheet, with a copy button
   run     - a query with its live result
   compare - two queries on the same data, side by side, with what changed and when to use which
   try     - a graded exercise, placed right after the idea it tests
   quiz    - one multiple-choice check
   Every query in this file is executed by verify.cjs. */
const COURSE = {
  interview: 'Wednesday, Nov 11',
  role: 'Planning Systems Specialist',
  roleMap: [
    ['Intermediate SQL; use SQL to investigate databases independently', 'Chapters 1 to 5, and 10', ['read', 'filter', 'aggregate', 'joins', 'functions', 'steps']],
    ['Monitor and validate planning inputs for accuracy, completeness and integrity', 'Chapter 4 (unmatched keys), chapter 6 (duplicates, missing, stale)', ['joins', 'trace']],
    ['Investigate and resolve data quality, system and process issues; root cause analysis', 'Chapter 6', ['trace']],
    ['Systems testing practices', 'Chapter 6: test the fix, regression check', ['trace']],
    ['Monitor forecast performance, planning exceptions and replenishment results; KPIs', 'Chapter 7', ['kpi']],
    ['Forecasting, replenishment and inventory concepts; promotional planning', 'Chapter 7', ['kpi']],
    ['Pull data into Excel for analysis; ad-hoc extractions and reports', 'Chapter 7 (hand-off), chapters 8 and 9', ['kpi', 'xl-lookup', 'xl-summary']],
    ['Advanced Excel', 'Chapters 8 and 9', ['xl-lookup', 'xl-summary']],
    ['Preferred: experience supporting planning systems such as Kinaxis', 'Chapter 11 (primer)', ['kinaxis']],
    ['Turn data into recommendations; communicate resolutions to stakeholders', 'Chapter 6 (report a finding), mock interview talk track', ['trace']]
  ],
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
      id: 'read', title: 'SQL basics: tables, keys and how a statement is written', mins: 30, priority: 'Must',
      builds: 'Start with one product row. Find what identifies it, then turn a plain-English request into a query you can read and check one line at a time.',
      outcome: 'Name the parts of a table and of a statement, write a correct SELECT from scratch, and read an error message.',
      core: [["Database, table", "A database is a set of tables. A table holds one kind of thing: orders, products.", "Like a workbook and its sheets, except every table has fixed columns."], ["Row, column", "A row is one record. A column is one attribute of it, with a fixed name and data type.", "You SELECT columns and filter rows. Mixing the two up is the first beginner error."], ["Data type", "What a column can hold: whole number, decimal, text, date, true/false.", "Decides how you write a value: 'text' and '2026-11-04' in single quotes, numbers bare."], ["Primary key", "The column (or columns) that is different on every row.", "Identifies a row. It is what other tables point at and what you check for duplicates."], ["Foreign key", "A column or set of columns that references a unique key in another table.", "Shows how two records are related. You can also join two tables that both reference the same record."], ["Grain", "What one row represents.", "A count or sum at the wrong grain is the most common wrong answer."], ["Statement, clause", "A statement is one complete instruction ending in ;. A clause is one part of it: SELECT, FROM, WHERE.", "Clauses must appear in a fixed order."], ["Keyword, identifier, literal", "Keyword = SQL's own word (SELECT). Identifier = a table or column name. Literal = a value you type ('Frozen', 50).", "Explains most syntax errors: a literal without quotes is read as a column name."], ["Column label (AS)", "A heading for a column or calculated value in the query result.", "Makes output readable and joins shorter. A missing comma creates one by accident."], ["NULL", "No value recorded. Not zero, not blank text.", "Needs IS NULL, and turns any calculation into NULL."], ["Run order", "FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY", "Explains why WHERE cannot use a total or a SELECT alias."]],
      tip: "Before you write anything, say: \"one row in this table is …, and its key is …\". Then write FROM first. It shows you understand the data before the syntax.",
      steps: [
        { t: 'text', h: 'The case you will solve', key: "One wrong number on a screen, traced back to its cause. Each chapter adds one tool.", html: `
<p>A store calls: <strong>the order screen shows the wrong quantity.</strong> The screen reads from a copy of the data, the copy is fed by a sync job, and the sync job reads the order tables. The mistake could have entered at any of those points. Your job is to find where, with queries, and explain it.</p>
<p>Every lesson adds one tool to that investigation. Lesson 6 runs the whole trace. The same nine small tables are used throughout, so you never have to learn new data. Tap <strong>Tables</strong> at any time to look at them.</p>` },
        { t: 'text', h: 'SQL is the Excel you already know, written as sentences', key: "Every clause has an Excel equivalent you already use.", html: `
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
        { t: 'text', h: 'What a database is made of', key: "A table is a sheet with rules: fixed columns, one kind of record, one row per record.", html: `
<div class="tablewrap"><table><thead><tr><th>Term</th><th>What it is</th><th>In the practice data</th><th>Excel word</th></tr></thead><tbody>
<tr><td><strong>Database</strong></td><td>A collection of related tables</td><td>All nine tables</td><td>Workbook</td></tr>
<tr><td><strong>Table</strong></td><td>One kind of thing, stored in rows and columns</td><td><code>products</code>, <code>orders</code>, <code>order_lines</code></td><td>Sheet</td></tr>
<tr><td><strong>Column</strong> (field)</td><td>One attribute, with a name and a data type</td><td><code>product_name</code>, <code>unit_cost</code></td><td>Column with a header</td></tr>
<tr><td><strong>Row</strong> (record)</td><td>One item in the table</td><td>The row for P01, Burger buns</td><td>Row</td></tr>
<tr><td><strong>Value</strong></td><td>What sits where a row meets a column</td><td><code>0.35</code> in P01's unit_cost</td><td>Cell</td></tr>
<tr><td><strong>NULL</strong></td><td>No value recorded</td><td>qty_shipped on a line that has not shipped</td><td>Empty cell (but Excel treats it as 0)</td></tr>
</tbody></table></div>
<p>Two differences from a spreadsheet matter. Rows have <strong>no fixed order</strong>: you get them sorted only if you ask with ORDER BY. And you never point at a cell like B7: you describe the rows you want and the database finds them.</p>` },
        { t: 'text', h: 'Data types, and how to write a value of each', key: "Text and dates go in single quotes. Numbers do not.", html: `
<div class="tablewrap"><table><thead><tr><th>Type (SQL Server name)</th><th>Holds</th><th>Write a value like</th><th>Example column</th></tr></thead><tbody>
<tr><td><strong>INT</strong></td><td>Whole numbers</td><td><code>50</code></td><td>qty_ordered</td></tr>
<tr><td><strong>DECIMAL(10,2)</strong>, FLOAT</td><td>Numbers with decimals</td><td><code>0.35</code></td><td>unit_cost</td></tr>
<tr><td><strong>VARCHAR(50)</strong>, NVARCHAR</td><td>Text</td><td><code>'Frozen'</code></td><td>category, product_id</td></tr>
<tr><td><strong>DATE</strong>, DATETIME</td><td>A date, or a date and time</td><td><code>'2026-11-04'</code></td><td>order_date, synced_at</td></tr>
<tr><td><strong>BIT</strong></td><td>True or false, stored as 1 or 0</td><td><code>1</code></td><td>promo</td></tr>
</tbody></table></div>
<p>The type decides what works. You can add two INTs, you cannot add two VARCHARs. A number stored as text sorts as text ("100" before "20") and will not sum. An ID such as <code>'P01'</code> is text even when it looks numeric, so it needs quotes.</p>` },
        { t: 'run', h: 'Look at real rows first', key: "First move with any table: look at five rows.", sql: `SELECT TOP 5 *\nFROM order_lines;`,
          note: `<code>*</code> means every column. <code>TOP 5</code> means stop after five rows. Do this before anything else with an unfamiliar table: you are reading the data, not answering a question yet.` },
        { t: 'text', h: 'Keys: how tables point at each other', key: "A primary key identifies a row in its own table. A foreign key points to a row in another table.", html: `
<div class="tablewrap"><table><thead><tr><th>Table</th><th>Row identifier in this model</th><th>References to other tables</th></tr></thead><tbody>
<tr><td><code>products</code></td><td><strong>product_id</strong></td><td>none</td></tr>
<tr><td><code>locations</code></td><td><strong>location_id</strong></td><td>none</td></tr>
<tr><td><code>orders</code></td><td><strong>order_id</strong></td><td>location_id → locations</td></tr>
<tr><td><code>order_lines</code></td><td><strong>line_id</strong></td><td>order_id → orders · product_id → products</td></tr>
<tr><td><code>daily_plan</code></td><td><strong>plan_id</strong></td><td>location_id → locations · product_id → products</td></tr>
<tr><td><code>inventory</code></td><td><strong>snapshot_date + location_id + product_id</strong></td><td>location_id → locations · product_id → products</td></tr>
</tbody></table></div>
<ul><li>A primary key is <strong>unique</strong> and never NULL. Two rows cannot share it.</li>
<li>A key made of several columns is a <strong>composite key</strong>. In the inventory example, date, location, and product together identify a row.</li>
<li>In a database with an enforced foreign key, a value must match the row it points to. The practice data leaves those references unenforced so you can investigate <strong>orphans</strong> in chapters 4 and 6.</li>
<li>A primary key can have many rows pointing to it. For example, several order lines can reference the same order.</li></ul>` },
        { t: 'text', h: 'Grain and key: the two facts that prevent wrong numbers', key: "Grain = what one row means. Key = what makes each row unique.", html: `
<p><strong>Grain</strong> is what one row represents. <strong>Key</strong> is the column, or set of columns, that is different on every row.</p>
<ul><li><code>orders</code>: one row per order. Key: <code>order_id</code>.</li>
<li><code>order_lines</code>: one row per product on an order. Key: <code>line_id</code>. An order has many lines.</li>
<li><code>screen_orders</code>: one row per order as the screen shows it.</li></ul>
<p>Most wrong totals come from treating a table as if it had a different grain than it has. Counting rows in <code>order_lines</code> counts lines, not orders.</p>` },
        { t: 'compare', h: 'Same order, two grains',
          intro: 'Customer support needs the status and the item list for O1001. Check which table has each answer and what one row represents.',
          a: { label: 'orders (header)', sql: `SELECT order_id, status\nFROM orders\nWHERE order_id = 'O1001';` },
          b: { label: 'order_lines (detail)', sql: `SELECT order_id, product_id, qty_ordered\nFROM order_lines\nWHERE order_id = 'O1001';` },
          diff: 'One order is one row in orders and two rows in order_lines.',
          use: ['Count orders, read status or dates → orders', 'Sum quantities, list products → order_lines'] },
        { t: 'text', h: 'Anatomy of a statement', key: "Every query is the same sentence: SELECT what, FROM where, WHERE which rows, ORDER BY how sorted.", html: `
<pre class="code">SELECT product_name, unit_cost AS cost
FROM products
WHERE category = 'Frozen'
ORDER BY unit_cost DESC;</pre>
<div class="tablewrap"><table><thead><tr><th>Piece</th><th>What it is</th><th>Rule</th></tr></thead><tbody>
<tr><td><code>SELECT</code> <code>FROM</code> <code>WHERE</code> <code>ORDER BY</code></td><td><strong>Keywords</strong>: SQL's own words. Each starts a <strong>clause</strong>.</td><td>Fixed order. Capitals are a convention, not required.</td></tr>
<tr><td><code>product_name</code>, <code>unit_cost</code>, <code>category</code></td><td><strong>Column names</strong> (identifiers)</td><td>No quotes. Separated by commas in SELECT.</td></tr>
<tr><td><code>products</code></td><td><strong>Table name</strong> (identifier)</td><td>No quotes.</td></tr>
<tr><td><code>AS cost</code></td><td><strong>Alias</strong>: a new name for the output column</td><td>Exists only in this statement. AS is optional.</td></tr>
<tr><td><code>=</code></td><td><strong>Operator</strong>: compares two things</td><td>One equals sign.</td></tr>
<tr><td><code>'Frozen'</code></td><td><strong>Literal</strong>: a value you typed</td><td>Text and dates in single quotes.</td></tr>
<tr><td><code>DESC</code></td><td>Sort direction</td><td>High to low. ASC, the default, is low to high.</td></tr>
<tr><td><code>;</code></td><td>End of the statement</td><td>One statement, one semicolon.</td></tr>
</tbody></table></div>` },
        { t: 'run', h: 'That statement, run', key: "Read the result against the statement, clause by clause.", sql: `SELECT product_name, unit_cost AS cost\nFROM products\nWHERE category = 'Frozen'\nORDER BY unit_cost DESC;`,
          note: `Two columns because SELECT named two. The second is headed <code>cost</code> because of the alias. Two rows because only two products are Frozen. Highest cost first because of DESC.` },
        { t: 'text', h: 'The syntax rules behind most errors', key: "Commas between items, quotes around text, clauses in order.", html: `
<div class="tablewrap"><table><thead><tr><th>Rule</th><th>Right</th><th>Wrong</th></tr></thead><tbody>
<tr><td>Comma between columns, none after the last</td><td><code>SELECT a, b FROM t</code></td><td><code>SELECT a b, FROM t</code></td></tr>
<tr><td>Text and dates in single quotes</td><td><code>status = 'Open'</code></td><td><code>status = Open</code> · <code>status = "Open"</code></td></tr>
<tr><td>Numbers without quotes</td><td><code>qty_ordered &gt; 50</code></td><td><code>qty_ordered &gt; '50'</code></td></tr>
<tr><td>Clauses in the fixed order</td><td><code>… WHERE … ORDER BY …</code></td><td><code>… ORDER BY … WHERE …</code></td></tr>
<tr><td>ORDER BY and GROUP BY are two words</td><td><code>ORDER BY order_date</code></td><td><code>ORDER order_date</code></td></tr>
<tr><td>Names with spaces need square brackets</td><td><code>[Order Date]</code></td><td><code>Order Date</code></td></tr>
<tr><td>Missing values use IS</td><td><code>qty_shipped IS NULL</code></td><td><code>qty_shipped = NULL</code></td></tr>
</tbody></table></div>
<p>Things that do <strong>not</strong> matter: capitals in keywords, line breaks, and extra spaces. <code>select * from orders</code> on one line is the same statement. Comments start with <code>--</code> and are ignored.</p>` },
        { t: 'compare', h: 'A missing comma can accidentally rename a result column',
          intro: 'A planner needs a product export with two columns: product_id and product_name.',
          a: { label: 'Comma left out', sql: `SELECT product_id product_name\nFROM products;` },
          b: { label: 'Comma in place', sql: `SELECT product_id, product_name\nFROM products;` },
          diff: 'Without the comma, SQL reads product_name as a new name for product_id. You get one column of IDs under the wrong heading, and no error. Count the columns in your result against what was asked.',
          use: ['One comma between every pair of columns in SELECT', 'No comma after the last column, before FROM', 'A result with fewer columns than expected → look for a missing comma'] },
        { t: 'compare', h: 'Text without quotes is read as a column name',
          intro: 'A planner needs a product list filtered to the Frozen category. Here are two ways someone might type the filter.',
          a: { label: 'No quotes', fails: true, sql: `SELECT product_id, product_name\nFROM products\nWHERE category = Frozen;` },
          b: { label: 'Single quotes', sql: `SELECT product_id, product_name\nFROM products\nWHERE category = 'Frozen';` },
          diff: "Without quotes, Frozen is an identifier, so the database looks for a column called Frozen and fails. SQL Server's wording is: Invalid column name 'Frozen'. That message nearly always means missing quotes or a misspelt column.",
          use: ["Text value → 'single quotes'", 'Column or table name → no quotes', 'Double quotes mean a column name in SQL Server, not text'] },
        { t: 'text', h: 'Write a statement in this order, not top to bottom', key: "FROM first, SELECT last. Run it after each step.", html: `
<ol><li><strong>FROM</strong>: which table has the rows I need? Write <code>SELECT * FROM that_table;</code> and run it.</li>
<li><strong>WHERE</strong>: which rows? Add one condition, run, check the row count went down the way you expected.</li>
<li><strong>SELECT</strong>: which columns? Replace the <code>*</code> with the names asked for, in the order asked for.</li>
<li><strong>ORDER BY</strong>: how sorted? Add it last.</li></ol>
<p>This is the order the database works in, so each step gives you something you can check. In an interview it also gives you something to say at every step.</p>` },
        { t: 'text', h: 'You write clauses in one order. The database runs them in another.', key: "The database starts at FROM and reaches SELECT near the end.", html: `
<div class="tablewrap"><table><thead><tr><th>You write</th><th>The database runs</th><th>Why it matters</th></tr></thead><tbody>
<tr><td><code>SELECT</code></td><td><strong>1. FROM / JOIN</strong></td><td>Gathers the tables and pairs their rows first.</td></tr>
<tr><td><code>FROM</code></td><td><strong>2. WHERE</strong></td><td>Filters rows <em>before</em> any grouping, so it cannot test a SUM or COUNT.</td></tr>
<tr><td><code>JOIN</code></td><td><strong>3. GROUP BY</strong></td><td>Collapses the surviving rows into groups.</td></tr>
<tr><td><code>WHERE</code></td><td><strong>4. HAVING</strong></td><td>Filters the groups. This is where a test on a total goes.</td></tr>
<tr><td><code>GROUP BY</code></td><td><strong>5. SELECT</strong></td><td>Only now are columns, calculations and aliases worked out.</td></tr>
<tr><td><code>HAVING</code></td><td><strong>6. ORDER BY</strong></td><td>Sorts last, so it is the one clause that can use a SELECT alias.</td></tr>
<tr><td><code>ORDER BY</code></td><td><strong>7. TOP</strong></td><td>Cuts to the first N rows after sorting.</td></tr>
</tbody></table></div>
<div class="tip"><span>Interview tip</span>Because WHERE runs before SELECT, you cannot use a name created with AS in your WHERE clause. Repeat the expression instead.</div>` },
        { t: 'text', h: 'Reading an error message', key: "The message names the problem and usually the exact word. Read it before changing anything.", html: `
<div class="tablewrap"><table><thead><tr><th>SQL Server says</th><th>Usual cause</th><th>Fix</th></tr></thead><tbody>
<tr><td><strong>Invalid column name 'x'</strong></td><td>Misspelt column, text without quotes, or an alias used in WHERE</td><td>Check the spelling in Tables; add quotes; repeat the expression</td></tr>
<tr><td><strong>Invalid object name 'x'</strong></td><td>Misspelt or wrong table name</td><td>Check the table name</td></tr>
<tr><td><strong>Incorrect syntax near 'x'</strong></td><td>Something just before x is missing or extra: a comma, a keyword, a bracket</td><td>Look at the word <em>before</em> the one named</td></tr>
<tr><td><strong>Ambiguous column name 'x'</strong></td><td>Two joined tables both have x</td><td>Prefix it: <code>orders.order_id</code></td></tr>
<tr><td><strong>… is invalid in the select list because it is not contained in either an aggregate function or the GROUP BY clause</strong></td><td>A SELECT column that is neither grouped nor aggregated</td><td>Add it to GROUP BY or wrap it in SUM, MAX …</td></tr>
<tr><td><strong>Conversion failed when converting …</strong></td><td>Comparing or adding text with a number or date</td><td>Fix the quotes, or CAST one side</td></tr>
<tr><td><strong>Divide by zero error encountered</strong></td><td>A divisor of 0</td><td><code>NULLIF(divisor, 0)</code></td></tr>
</tbody></table></div>
<p>This practice database words its errors differently ("no such column"), but the causes are the same.</p>` },
        { t: 'text', h: 'The other statement types, so you recognise them', key: "The interview is about SELECT. Know that the other four exist and what they do.", html: `
<div class="tablewrap"><table><thead><tr><th>Statement</th><th>What it does</th><th>Example</th></tr></thead><tbody>
<tr><td><strong>SELECT</strong></td><td>Reads rows. Changes nothing.</td><td><code>SELECT * FROM orders;</code></td></tr>
<tr><td><strong>INSERT</strong></td><td>Adds rows</td><td><code>INSERT INTO locations VALUES ('L05','Miami DC','South');</code></td></tr>
<tr><td><strong>UPDATE</strong></td><td>Changes values in existing rows</td><td><code>UPDATE orders SET status = 'Shipped' WHERE order_id = 'O1003';</code></td></tr>
<tr><td><strong>DELETE</strong></td><td>Removes rows</td><td><code>DELETE FROM order_lines WHERE line_id = 4;</code></td></tr>
<tr><td><strong>CREATE / ALTER</strong></td><td>Defines or changes a table's structure</td><td><code>CREATE TABLE …</code></td></tr>
</tbody></table></div>
<p>An UPDATE or DELETE with no WHERE changes <strong>every row</strong>. The safe habit, worth saying in an interview: run a SELECT with the same WHERE first, check the rows, then change them. This practice database is read-only, so only SELECT runs here.</p>` },
        { t: 'try', id: 'basics-first', title: 'Your first statement',
          prompt: "A planner needs a readable product list for an Excel export.\n\nFrom products, return one row per product with product_name and category. Sort alphabetically by product_name.",
          starter: `SELECT \nFROM \nORDER BY ;`,
          solution: `SELECT product_name, category\nFROM products\nORDER BY product_name;`, ordered: true,
          hints: ['The table is products.', 'Two columns, separated by a comma.', 'ORDER BY product_name'],
          explain: 'No WHERE, so all six rows come back. Two columns in the order asked for.' },
        { t: 'try', id: 'basics-alias', title: 'Filter, rename, sort',
          prompt: "A replenishment planner is checking costs for products with longer lead times.\n\nFrom products, keep lead_time_days greater than 2. Return product_id and unit_cost under the heading cost. Sort by product_id.",
          starter: `SELECT product_id, unit_cost AS \nFROM products\nWHERE `,
          solution: `SELECT product_id, unit_cost AS cost\nFROM products\nWHERE lead_time_days > 2\nORDER BY product_id;`, ordered: true,
          hints: ['AS cost renames the column.', 'lead_time_days is a number: no quotes around 2.', 'You can filter on a column you do not show.'],
          explain: 'WHERE can test a column that is not in SELECT. The filter runs before the columns are chosen.' },
        { t: 'try', id: 'basics-fix', title: 'Fix the syntax',
          prompt: "An extract for the South region fails because the starter query has three syntax mistakes.\n\nFix the query against locations. Return location_id, location_name, and region for South only, sorted by location_name.",
          starter: `SELECT location_id location_name region\nFROM locations\nWHERE region = "South"\nORDER location_name;`,
          solution: `SELECT location_id, location_name, region\nFROM locations\nWHERE region = 'South'\nORDER BY location_name;`, ordered: true,
          hints: ['Count the commas in SELECT.', 'Text needs single quotes.', 'ORDER BY is two words.'],
          explain: 'Two missing commas, double quotes around text, and ORDER without BY. The checker here tolerates the double quotes; SQL Server would not.' },
        { t: 'quiz', q: 'In order_lines, which column is a foreign key?',
          options: ['line_id', 'product_id', 'qty_ordered'], correct: 1,
          why: 'product_id holds the primary key of products, so it is a foreign key (order_id is another). line_id is the primary key of order_lines itself.' },
        { t: 'quiz', q: 'You need the number of orders placed at L01. Which table do you count rows in?',
          options: ['order_lines, because it has the quantities', 'orders, because one row is one order', 'screen_orders, because that is what the store sees'], correct: 1,
          why: 'orders has one row per order. order_lines would count products, and screen_orders is a copy that may be incomplete.' }
      ]
    },
    /* ------------------------------------------------------------------ 2 */
    {
      id: 'filter', title: 'SELECT, WHERE and ORDER BY', mins: 25, priority: 'Must',
      builds: 'Start with a list of products. Choose what to show, keep the rows that pass your test, then sort them. The same pattern handles dates, missing values, and several conditions.',
      outcome: 'Write a filtered, sorted query from a plain-English request, and avoid the three filter mistakes that return wrong rows without an error.',
      core: [["SELECT", "Chooses the columns to show.", "Name the columns. Keep SELECT * for a first look only."], ["WHERE", "Keeps the rows that pass a test.", "Runs before grouping, so it cannot test a total."], ["AND / OR", "Combine tests.", "AND runs first. Put brackets around every OR group."], ["IN, BETWEEN, LIKE", "Match a list, a range, a text pattern.", "BETWEEN misses the last day on a date-and-time column."], ["IS NULL", "Tests for a missing value.", "= NULL returns no rows and no error."], ["ORDER BY, TOP", "Sort the output. Keep the first N rows.", "TOP without ORDER BY returns arbitrary rows."], ["DISTINCT", "Removes repeated rows from the output.", "Good for exploring values. It can also hide a real duplicate."]],
      tip: "Say the request as rules in plain English first, then write one rule per WHERE line.",
      steps: [
        { t: 'run', h: 'The basic sentence', key: "SELECT columns FROM table WHERE test ORDER BY sort.", sql: `SELECT product_id, product_name, unit_cost\nFROM products\nWHERE category = 'Frozen'\nORDER BY unit_cost DESC;`,
          note: `Read it line by line: show these three columns, from products, only rows where category is Frozen, most expensive first. Text goes in <strong>single quotes</strong>, numbers do not. <code>DESC</code> is high to low; leave it off for low to high.` },
        { t: 'text', h: 'The comparison operators', key: "Seven ways to write a test.", html: `
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
          intro: 'The Chicago planner wants rows for L01 only. Include a row if it is promotional, sold more than 150 units, or both.',
          a: { label: 'No parentheses', sql: `SELECT plan_id, location_id, promo, actual_units\nFROM daily_plan\nWHERE location_id = 'L01'\n  AND promo = 1\n   OR actual_units > 150;` },
          b: { label: 'With parentheses', sql: `SELECT plan_id, location_id, promo, actual_units\nFROM daily_plan\nWHERE location_id = 'L01'\n  AND (promo = 1\n   OR actual_units > 150);` },
          diff: 'Without parentheses SQL reads it as (L01 AND promo) OR (over 150 anywhere), so Denver and Atlanta rows leak in. Look at the location_id column on the left.',
          use: ['Any time AND and OR appear together, add parentheses around the OR group', 'Say the rule in English first, then bracket it the way you said it'] },
        { t: 'compare', h: 'Find lines with no shipped quantity',
          intro: 'The shipping team wants the line ID, order ID, and shipped quantity for lines with no quantity recorded. In the results, the shipped quantity should be NULL.',
          a: { label: '= NULL', sql: `SELECT line_id, order_id, qty_shipped\nFROM order_lines\nWHERE qty_shipped = NULL;` },
          b: { label: 'IS NULL', sql: `SELECT line_id, order_id, qty_shipped\nFROM order_lines\nWHERE qty_shipped IS NULL;` },
          diff: 'IS NULL tests whether a value is missing and returns four lines. The comparison = NULL evaluates to unknown, so WHERE keeps zero rows. A recorded zero stays out of the missing-value list.',
          use: ['Missing value → IS NULL', 'Value present → IS NOT NULL', 'Recorded zero → qty_shipped = 0. Try line 12.'] },
        { t: 'compare', h: 'BETWEEN drops the last day when the column has a time',
          intro: 'Support needs order IDs and sync timestamps from November 2 through the end of November 4, 2026. The timestamp includes a time of day.',
          a: { label: 'BETWEEN', sql: `SELECT order_id, synced_at\nFROM screen_orders\nWHERE synced_at BETWEEN '2026-11-02'\n                    AND '2026-11-04';` },
          b: { label: '>= start AND < day after', sql: `SELECT order_id, synced_at\nFROM screen_orders\nWHERE synced_at >= '2026-11-02'\n  AND synced_at <  '2026-11-05';` },
          diff: "'2026-11-04' means midnight at the start of Nov 4. A row stamped 06:00 that morning is after it, so BETWEEN leaves it out. SQL Server datetime columns behave the same way.",
          use: ['Date ranges on a datetime column → >= first day AND < the day after the last day', 'BETWEEN is fine for whole numbers and date-only columns'] },
        { t: 'run', h: 'DISTINCT, LIKE and TOP', key: "Three small tools for exploring a column.", sql: `SELECT DISTINCT status\nFROM orders;`,
          note: `<code>DISTINCT</code> removes repeated rows from the output, which is the quickest way to see what values a column holds. <code>WHERE customer LIKE 'Store 1%'</code> would keep customers starting with "Store 1". <code>SELECT TOP 3 … ORDER BY qty_ordered DESC</code> gives the three largest. TOP without ORDER BY gives three arbitrary rows.` },
        { t: 'try', id: 'filter-promo', title: 'Promotional rows that beat forecast',
          prompt: "The Chicago planner wants to review promotions that sold more than forecast.\n\nFrom daily_plan, keep L01 rows where promo is 1 and actual_units exceeds forecast_units. Return plan_id, product_id, forecast_units, and actual_units. Sort by plan_id.",
          starter: `SELECT plan_id, product_id, forecast_units, actual_units\nFROM daily_plan\nWHERE `,
          solution: `SELECT plan_id, product_id, forecast_units, actual_units\nFROM daily_plan\nWHERE location_id = 'L01'\n  AND promo = 1\n  AND actual_units > forecast_units\nORDER BY plan_id;`, ordered: true,
          hints: ['Three tests joined by AND.', "location_id = 'L01' AND promo = 1 AND actual_units > forecast_units", 'Finish with ORDER BY plan_id.'],
          explain: 'You can compare two columns of the same row directly. All seven L01 promo rows sold above forecast.' },
        { t: 'try', id: 'filter-open', title: 'Recent orders that are not finished',
          prompt: "The operations team wants a follow-up list of recent orders that are Open or Cancelled.\n\nFrom orders, include orders dated November 3, 2026 or later with either of those statuses. Return order_id, order_date, and status. Sort by order_id.",
          starter: `SELECT order_id, order_date, status\nFROM orders\nWHERE `,
          solution: `SELECT order_id, order_date, status\nFROM orders\nWHERE order_date >= '2026-11-03'\n  AND status IN ('Open', 'Cancelled')\nORDER BY order_id;`, ordered: true,
          hints: ['One date test AND one status test.', "status IN ('Open', 'Cancelled') avoids the AND/OR trap.", "order_date >= '2026-11-03'"],
          explain: 'IN keeps the two statuses in one test, so there is no OR to bracket.' },
        { t: 'try', id: 'filter-null', title: 'Lines waiting to ship',
          prompt: "The shipping team wants to investigate lines with no shipment quantity recorded.\n\nFrom order_lines, return line_id, order_id, and qty_ordered for rows where qty_shipped is missing. A recorded zero is a value. Sort by line_id.",
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
      builds: 'Start with individual order lines and roll them up to one row per order. Choose what to count, then decide whether a condition applies to an individual line or to its order total.',
      outcome: 'Produce totals per group, choose the right COUNT, and decide between WHERE and HAVING.',
      core: [["COUNT(*)", "Counts rows.", "On a detail table it counts lines, not orders."], ["COUNT(column)", "Counts rows where that column has a value.", "Shows how many values are missing."], ["COUNT(DISTINCT column)", "Counts different values.", "The safe way to count orders after a join."], ["SUM, AVG, MIN, MAX", "Total, average, smallest, largest.", "All skip NULL, so AVG divides by fewer rows than you expect."], ["GROUP BY", "Returns one row per group.", "Every SELECT column must be in GROUP BY or inside a function."], ["HAVING", "Keeps groups that pass a test on a total.", "WHERE filters rows before the total. HAVING filters totals after."]],
      tip: "When asked \"how many\", ask back: \"how many of what: rows, orders or products?\"",
      steps: [
        { t: 'text', h: 'Five functions, one idea', key: "An aggregate turns many rows into one value. GROUP BY decides how many rows come back.", html: `
<p>An aggregate function takes many rows and returns one value: <code>COUNT</code>, <code>SUM</code>, <code>AVG</code>, <code>MIN</code>, <code>MAX</code>. With no <code>GROUP BY</code> you get one row for the whole table. With <code>GROUP BY</code> you get one row per group. <strong>GROUP BY changes the grain of the result.</strong></p>
<p>All five skip NULL values. That is usually what you want, and it is also how an average ends up higher than expected.</p>` },
        { t: 'run', h: 'Three COUNTs that answer three different questions', key: "COUNT(*) = rows. COUNT(column) = values present. COUNT(DISTINCT) = different values.", sql: `SELECT COUNT(*)                 AS line_rows,\n       COUNT(qty_shipped)       AS lines_with_a_shipped_value,\n       COUNT(DISTINCT order_id) AS orders\nFROM order_lines;`,
          note: `<code>COUNT(*)</code> counts rows. <code>COUNT(column)</code> counts rows where that column is not NULL. <code>COUNT(DISTINCT column)</code> counts different values. When someone asks "how many", ask "how many of what" before choosing.` },
        { t: 'run', h: 'GROUP BY: one row per order', key: "GROUP BY is a PivotTable: one output row per group.", sql: `SELECT order_id,\n       COUNT(*)         AS line_count,\n       SUM(qty_ordered) AS total_ordered\nFROM order_lines\nGROUP BY order_id\nORDER BY order_id;`,
          note: `This is a PivotTable with order_id in Rows and two Values. <strong>The rule:</strong> every column in SELECT must either be inside an aggregate function or be listed in GROUP BY. SQL Server rejects the query otherwise. (This practice database is more forgiving and will not warn you, so check it yourself.)` },
        { t: 'compare', h: 'WHERE filters rows before the total. HAVING filters totals after.',
          intro: 'A warehouse manager might ask for two reports: totals using only lines above 50 units, or orders whose total across all lines exceeds 50 units.',
          a: { label: 'WHERE: big lines only', sql: `SELECT order_id,\n       SUM(qty_ordered) AS total_qty\nFROM order_lines\nWHERE qty_ordered > 50\nGROUP BY order_id\nORDER BY order_id;` },
          b: { label: 'HAVING: big orders only', sql: `SELECT order_id,\n       SUM(qty_ordered) AS total_qty\nFROM order_lines\nGROUP BY order_id\nHAVING SUM(qty_ordered) > 50\nORDER BY order_id;` },
          diff: 'Look at O1001: 60 on the left, 100 on the right. WHERE threw away its 40-unit line before adding. HAVING added everything, then kept orders whose total passed.',
          use: ['Condition on a single row (a date, a status, one quantity) → WHERE', 'Condition on a total or a count → HAVING', 'You can use both in one query: WHERE first, HAVING after GROUP BY'] },
        { t: 'compare', h: 'An average ignores NULL unless you tell it otherwise',
          intro: 'Fulfillment needs an average per line. Decide whether to average only lines with a shipment quantity or include all lines and treat missing quantities as zero.',
          a: { label: 'AVG skips NULL', sql: `SELECT AVG(qty_shipped) AS avg_shipped\nFROM order_lines;` },
          b: { label: 'NULL counted as 0', sql: `SELECT AVG(ISNULL(qty_shipped, 0))\n         AS avg_shipped\nFROM order_lines;` },
          diff: 'Left divides by the 8 lines that have a value. Right divides by all 12. Neither is wrong; they answer different questions.',
          use: ['"Average of the lines that shipped" → plain AVG', '"Average across all lines, unshipped counted as zero" → ISNULL(x, 0) inside', 'State which one you used when you report the number'] },
        { t: 'try', id: 'agg-order', title: 'Orders with more than one line',
          prompt: "A warehouse analyst needs an order-level summary of orders that contain several lines.\n\nGroup order_lines by order_id. Keep orders with more than one line and return order_id, line_count, and total_ordered (the sum of qty_ordered). Sort by order_id.",
          starter: `SELECT order_id,\n       COUNT(*) AS line_count,\n       SUM(qty_ordered) AS total_ordered\nFROM order_lines\n`,
          solution: `SELECT order_id,\n       COUNT(*) AS line_count,\n       SUM(qty_ordered) AS total_ordered\nFROM order_lines\nGROUP BY order_id\nHAVING COUNT(*) > 1\nORDER BY order_id;`, ordered: true,
          hints: ['Group by order_id first.', '"More than one line" is a test on a count, so it goes in HAVING.', 'HAVING COUNT(*) > 1'],
          explain: 'A test on COUNT belongs in HAVING. On SQL Server, repeat the function in HAVING rather than the alias.' },
        { t: 'try', id: 'agg-location', title: 'Forecast and actual by location',
          prompt: "A planner needs a location summary and a way to spot incomplete actuals.\n\nFrom daily_plan, return one row per location with location_id, forecast_total, actual_total, and rows_with_actuals (the count of rows with actual_units present). Sort by location_id.",
          starter: `SELECT location_id,\n       \nFROM daily_plan\n`,
          solution: `SELECT location_id,\n       SUM(forecast_units) AS forecast_total,\n       SUM(actual_units)   AS actual_total,\n       COUNT(actual_units) AS rows_with_actuals\nFROM daily_plan\nGROUP BY location_id\nORDER BY location_id;`, ordered: true,
          hints: ['Two SUMs and one COUNT.', 'COUNT(actual_units) skips the NULL, COUNT(*) would not.', 'GROUP BY location_id'],
          explain: 'L03 has six rows and only five actuals. Reporting the count next to the total shows the reader that one feed is missing.' },
        { t: 'try', id: 'agg-having', title: 'High-volume products',
          prompt: "A planner wants to focus a review on products that sold more than 500 units across the plan.\n\nFrom daily_plan, sum actual_units for each product and keep product totals greater than 500. Return product_id and total_actual, highest total first.",
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
      builds: 'Start with an order line and attach its product name. Then use the same matching rule to see which rows are kept, which are missing, and how extra matches change your totals.',
      outcome: 'Choose INNER or LEFT on purpose, find rows with no match, and notice when a join has changed your row count.',
      core: [["INNER JOIN", "Returns rows that match in both tables.", "Unmatched rows disappear with no warning."], ["LEFT JOIN", "Returns every left row, with NULL where nothing matches.", "Use it when every starting row must stay. Check whether multiple matches repeat a row."], ["ON", "The rule that pairs rows.", "Use the whole key. A right-table filter goes here if left rows must stay."], ["LEFT JOIN + IS NULL", "Lists rows that have no match.", "The standard \"what is missing?\" query."], ["Fan-out", "One row matching many is repeated once per match.", "Inflates every COUNT and SUM taken afterwards."], ["FULL OUTER JOIN", "Keeps unmatched rows from both sides.", "Used to reconcile two systems."], ["UNION ALL, UNION", "Stack rows from two queries. UNION also removes duplicates.", "Stacking is not matching. UNION can hide repeats."]],
      tip: "After every join, say what one row means now and whether the row count went up, down or stayed the same.",
      steps: [
        { t: 'text', h: 'Why tables are split, and how a join puts them back', key: "A join pairs rows where the key is equal and sets their columns side by side.", html: `
<p>An order line stores <code>product_id</code>, not the product name. The name lives once in <code>products</code>. A join matches rows from two tables where a key is equal and puts their columns side by side. It is XLOOKUP, except it can return many columns and many matches.</p>
<pre class="code">SELECT order_lines.line_id, order_lines.product_id, products.product_name
FROM order_lines
JOIN products
  ON order_lines.product_id = products.product_id;</pre>
<ol><li>Read <code>FROM order_lines</code> first. Each row you start with is one line on an order.</li>
<li>Read <code>JOIN products</code> next. This is the catalog that supplies the name.</li>
<li>Read <code>order_lines.product_id</code> as “product ID from order lines.” It points to the primary key <code>products.product_id</code>. The <code>ON</code> line pairs rows with equal IDs.</li>
<li>Go back to <code>SELECT</code>. It shows two columns from the order line and one from the product catalog.</li></ol>` },
        { t: 'compare', h: 'INNER JOIN keeps matches. LEFT JOIN keeps every left row.',
          intro: 'Add product names to the four lines for O1004 and O1005. For a catalog audit, keep lines with unknown product codes visible.',
          a: { label: 'INNER JOIN (or just JOIN)', sql: `SELECT order_lines.line_id, order_lines.product_id,\n       products.product_name\nFROM order_lines\nINNER JOIN products\n  ON order_lines.product_id = products.product_id\nWHERE order_lines.order_id IN ('O1004','O1005')\nORDER BY order_lines.line_id;` },
          b: { label: 'LEFT JOIN', sql: `SELECT order_lines.line_id, order_lines.product_id,\n       products.product_name\nFROM order_lines\nLEFT JOIN products\n  ON order_lines.product_id = products.product_id\nWHERE order_lines.order_id IN ('O1004','O1005')\nORDER BY order_lines.line_id;` },
          diff: 'INNER silently dropped lines 8 and 9. LEFT kept them and filled the product columns with NULL. "Left" means the table written first, after FROM.',
          use: ['Totals, audits, anything where losing a row would be wrong → LEFT JOIN from the table you must keep', 'A report that should only show fully matched records → INNER JOIN', 'Unsure → LEFT, then check for NULLs'] },
        { t: 'run', h: 'LEFT JOIN + IS NULL: list what has no match', key: "Keep every row, then keep only the ones where the other side is empty.", sql: `SELECT order_lines.line_id, order_lines.order_id, order_lines.product_id\nFROM order_lines\nLEFT JOIN products\n  ON order_lines.product_id = products.product_id\nWHERE products.product_id IS NULL;`,
          note: `Keep every line, then keep only the ones where the product side came back empty. This is the single most useful troubleshooting query: it answers "which records reference something that does not exist?" Line 8 uses an unknown code. Line 9 looks like P02 but does not match. Lesson 6 finds out why.` },
        { t: 'compare', h: 'Filter a LEFT JOIN with ON or WHERE',
          intro: 'Start from every order. Should a closed order still appear with an empty screen status, or should it drop out of the results?',
          a: { label: 'Filter in WHERE', sql: `SELECT orders.order_id, screen_orders.status\nFROM orders\nLEFT JOIN screen_orders\n  ON orders.order_id = screen_orders.order_id\nWHERE screen_orders.status = 'Open'\nORDER BY orders.order_id;` },
          b: { label: 'Filter in ON', sql: `SELECT orders.order_id, screen_orders.status\nFROM orders\nLEFT JOIN screen_orders\n  ON orders.order_id = screen_orders.order_id\n AND screen_orders.status = 'Open'\nORDER BY orders.order_id;` },
          diff: 'ON checks whether a screen row is eligible to match. All six orders stay, and orders without an Open match show NULL on the screen side. WHERE checks the joined rows and keeps only the three whose screen status is Open.',
          use: ['Condition about the right-hand table, and you still want every left row → put it in ON', 'Condition about the left-hand table → WHERE', 'If a LEFT JOIN returns fewer rows than the left table, look for a right-table test in WHERE'] },
        { t: 'compare', h: 'A join can multiply rows',
          intro: 'A manager wants an order count. Check what happens when the report joins each order to its item lines before counting.',
          a: { label: 'Count after joining', sql: `SELECT COUNT(*) AS order_count\nFROM orders\nJOIN order_lines\n  ON orders.order_id = order_lines.order_id;` },
          b: { label: 'Count the right grain', sql: `SELECT COUNT(*) AS order_count\nFROM orders;` },
          diff: 'O1001 has two order lines, so it appears twice in the joined result. COUNT(*) counts both rows. The join returns eleven matching lines in total. Counting directly from orders answers how many orders there are: six.',
          use: ['After any join, ask: what does one row mean now?', 'Need header counts after a join → COUNT(DISTINCT orders.order_id)', 'Compare row counts before and after the join when a total looks too high'] },
        { t: 'compare', h: 'Join on the whole key, not part of it',
          intro: 'Find stock for the six Nov 4 plan rows. Both tables refer to products by product ID. A stock record belongs to one product, at one location, on one date.',
          a: { label: 'Product only', sql: `SELECT daily_plan.plan_id, daily_plan.location_id,\n       inventory.location_id AS inventory_location, inventory.on_hand\nFROM daily_plan\nLEFT JOIN inventory\n  ON daily_plan.product_id = inventory.product_id\nWHERE daily_plan.plan_date = '2026-11-04'\nORDER BY daily_plan.plan_id;` },
          b: { label: 'Date + location + product', sql: `SELECT daily_plan.plan_id, daily_plan.location_id,\n       inventory.location_id AS inventory_location, inventory.on_hand\nFROM daily_plan\nLEFT JOIN inventory\n  ON daily_plan.plan_date   = inventory.snapshot_date\n AND daily_plan.location_id = inventory.location_id\n AND daily_plan.product_id  = inventory.product_id\nWHERE daily_plan.plan_date = '2026-11-04'\nORDER BY daily_plan.plan_id;` },
          diff: 'Both examples use LEFT JOIN. With product alone, plan 19 matches 80 units in Chicago and 120 in Denver. Adding location and date keeps the Chicago result. Plan 24 still appears, with NULL for stock, because it has no inventory row for that combination.',
          use: ['Name what one row represents in each table, then compare the fields that identify the record you need', 'More rows than expected → check whether a row has several matches and whether those matches are intended'] },
        { t: 'compare', h: 'JOIN and UNION on the same two tables',
          intro: 'Use order O1004 from orders and screen_orders. First put the two statuses on one row, then stack them in a list.',
          a: { label: 'JOIN puts statuses side by side', sql: `SELECT orders.order_id,\n       orders.status AS source_status,\n       screen_orders.status AS screen_status\nFROM orders\nJOIN screen_orders\n  ON orders.order_id = screen_orders.order_id\nWHERE orders.order_id = 'O1004';` },
          b: { label: 'UNION ALL stacks both statuses', sql: `SELECT order_id, status\nFROM orders\nWHERE order_id = 'O1004'\nUNION ALL\nSELECT order_id, status\nFROM screen_orders\nWHERE order_id = 'O1004';` },
          diff: 'JOIN uses the order ID to pair the records and shows Shipped and Open in two columns on one row. UNION ALL appends the rows into one list with a single status column. Each input supplies the same two columns in the same order.',
          use: ['Compare values from related rows side by side → JOIN', 'Combine two lists and keep every row → UNION ALL', 'Use UNION to remove exact duplicate result rows. Both statuses here would stay because the status values differ.'] },
        { t: 'text', h: 'The other joins, in one line each', key: "Four more join types and how to chain three tables.", html: `
<ul><li><code>RIGHT JOIN</code>: LEFT JOIN with the tables swapped. Most people rewrite it as a LEFT JOIN.</li>
<li><code>FULL OUTER JOIN</code>: keep unmatched rows from both sides. Used to reconcile two systems (lesson 6).</li>
<li><code>CROSS JOIN</code>: every row with every row. Rarely intended.</li>
<li>Three tables: add a second JOIN. Each JOIN has its own ON.</li></ul>
<pre class="code">SELECT orders.order_id, locations.location_name, products.product_name, order_lines.qty_ordered
FROM orders
JOIN order_lines ON order_lines.order_id   = orders.order_id
JOIN locations ON locations.location_id = orders.location_id
LEFT JOIN products ON products.product_id = order_lines.product_id;</pre>` },
        { t: 'try', id: 'join-names', title: 'Add product names to an order',
          prompt: "Customer support needs a readable list of items for order O1001.\n\nMatch order_lines to products on product_id with INNER JOIN. Return line_id, product_name, and qty_ordered for O1001. Sort by line_id.",
          starter: `SELECT order_lines.line_id, products.product_name, order_lines.qty_ordered\nFROM order_lines\n`,
          solution: `SELECT order_lines.line_id, products.product_name, order_lines.qty_ordered\nFROM order_lines\nINNER JOIN products\n  ON order_lines.product_id = products.product_id\nWHERE order_lines.order_id = 'O1001'\nORDER BY order_lines.line_id;`, ordered: true,
          hints: ['JOIN products ON order_lines.product_id = products.product_id', "Then WHERE order_lines.order_id = 'O1001'", 'ORDER BY order_lines.line_id'],
          explain: 'Both lines have a valid product, so INNER and LEFT give the same answer here. That is worth checking rather than assuming.' },
        { t: 'try', id: 'join-orphan', title: 'Lines with no order header',
          prompt: "A data-quality check needs to flag order lines that arrived without a matching order header.\n\nReturn line_id and order_id from order_lines when that order_id has no match in orders.",
          starter: `SELECT order_lines.line_id, order_lines.order_id\nFROM order_lines\nLEFT JOIN orders\n  ON \nWHERE `,
          solution: `SELECT order_lines.line_id, order_lines.order_id\nFROM order_lines\nLEFT JOIN orders\n  ON order_lines.order_id = orders.order_id\nWHERE orders.order_id IS NULL;`,
          hints: ['Keep every line with LEFT JOIN, then keep the ones where the order side is empty.', 'ON order_lines.order_id = orders.order_id', 'WHERE orders.order_id IS NULL'],
          explain: 'Line 11 belongs to O1007, which has no header. An INNER JOIN report would never show this line, and nobody would know it was missing.' },
        { t: 'try', id: 'join-three', title: 'Units ordered per distribution center',
          prompt: "Distribution managers want to compare ordered volume across centers.\n\nUse orders, order_lines, and locations. Exclude Cancelled orders. Return one row per center with qualifying lines, showing location_name and total_ordered (the sum of qty_ordered). Sort by location_name.",
          starter: `SELECT locations.location_name,\n       SUM(order_lines.qty_ordered) AS total_ordered\nFROM orders\n`,
          solution: `SELECT locations.location_name,\n       SUM(order_lines.qty_ordered) AS total_ordered\nFROM orders\nJOIN order_lines ON order_lines.order_id = orders.order_id\nJOIN locations ON locations.location_id = orders.location_id\nWHERE orders.status <> 'Cancelled'\nGROUP BY locations.location_name\nORDER BY locations.location_name;`, ordered: true,
          hints: ['Two JOINs, each with its own ON.', "WHERE orders.status <> 'Cancelled' goes before GROUP BY.", 'GROUP BY locations.location_name'],
          explain: 'Join, filter rows, then group: the run order from lesson 1. Chicago includes the duplicated O1002 line, which lesson 6 deals with.' },
        { t: 'quiz', q: 'A LEFT JOIN from orders to screen_orders returns fewer rows than orders has. What is the most likely cause?',
          options: ['LEFT JOIN always drops unmatched rows', 'A WHERE condition on a screen_orders column removed the unmatched rows', 'The tables have different numbers of columns'], correct: 1,
          why: 'Unmatched rows have NULL in every screen_orders column, so a WHERE test on those columns fails for them. Move the test into ON.' }
      ]
    },
    /* ------------------------------------------------------------------ 5 */
    {
      id: 'functions', title: 'Functions: NULL, CASE, text, dates and maths', mins: 30, priority: 'Must',
      builds: 'Start with individual order lines. Calculate what is left to ship, label each line, and work out a fill rate. Then clean a product code and measure how late a receipt arrived.',
      outcome: 'Handle missing values, label rows with CASE, clean a text key, do date arithmetic and avoid the integer-division trap, in SQL Server syntax.',
      core: [["ISNULL, COALESCE", "Replace a missing value.", "Any calculation with NULL returns NULL."], ["CASE WHEN", "Labels or calculates by condition.", "The first true WHEN wins. Test for NULL first."], ["SUM(CASE …)", "Counts or totals by category, in columns.", "The SQL version of COUNTIFS. Asked often."], ["1.0 *, NULLIF", "Force a decimal result. Avoid dividing by zero.", "Whole number ÷ whole number drops the decimals."], ["TRIM, UPPER, LEN, CONCAT", "Clean and inspect text.", "A hidden space is enough to break a join."], ["DATEDIFF, DATEADD, GETDATE", "Gap between dates, shift a date, now.", "SQL Server spelling; other databases differ."], ["CAST, ROUND", "Change a type. Round a number.", "CAST(x AS DATE) removes the time."]],
      tip: "Name the function and what it protects against: \"ISNULL here, so unshipped lines count as zero.\"",
      steps: [
        { t: 'compare', h: 'Any calculation with NULL returns NULL',
          intro: 'Fulfillment wants the units left to ship for each line on orders O1003 and O1004. Decide what a missing shipped quantity means for that report.',
          a: { label: 'Raw subtraction', sql: `SELECT line_id, qty_ordered, qty_shipped,\n       qty_ordered - qty_shipped\n         AS still_to_ship\nFROM order_lines\nWHERE order_id IN ('O1003','O1004');` },
          b: { label: 'With ISNULL', sql: `SELECT line_id, qty_ordered, qty_shipped,\n       qty_ordered - ISNULL(qty_shipped, 0)\n         AS still_to_ship\nFROM order_lines\nWHERE order_id IN ('O1003','O1004');` },
          diff: '30 minus unknown is unknown, so the unshipped lines show NULL instead of 30 and 20. ISNULL(x, 0) substitutes a value when x is missing.',
          use: ['ISNULL(x, 0): SQL Server, two arguments', 'COALESCE(x, y, z): works on every database, returns the first non-NULL of any number of arguments', 'Only substitute zero when missing really does mean zero'] },
        { t: 'run', h: 'CASE is IF / IFS', key: "First true WHEN wins. Check for NULL before anything else.", sql: `SELECT line_id, qty_ordered, qty_shipped,\n       CASE\n         WHEN qty_shipped IS NULL       THEN 'Not shipped'\n         WHEN qty_shipped < qty_ordered THEN 'Short'\n         ELSE 'Complete'\n       END AS line_status\nFROM order_lines\nORDER BY line_id;`,
          note: `CASE checks each WHEN from the top and stops at the first one that is true. Put the NULL test first: a NULL compared with anything is never true, so without that first line an unshipped row would fall through to ELSE and be labelled Complete. Always finish with <code>END</code>.` },
        { t: 'run', h: 'CASE inside SUM: several counts in one row', key: "Turn each row into 1 or 0, then add them up.", sql: `SELECT location_id,\n       COUNT(*) AS orders,\n       SUM(CASE WHEN status = 'Open'    THEN 1 ELSE 0 END) AS open_orders,\n       SUM(CASE WHEN status = 'Shipped' THEN 1 ELSE 0 END) AS shipped_orders\nFROM orders\nGROUP BY location_id\nORDER BY location_id;`,
          note: `Each CASE turns a row into 1 or 0 and SUM adds them. This is COUNTIFS, and it is how you put categories into columns without a pivot. It comes up in interviews often.` },
        { t: 'compare', h: 'Whole number ÷ whole number = whole number',
          intro: 'A fulfillment report needs O1004’s shipped quantity divided by ordered quantity for each line. Check whether the calculation preserves a fraction such as 0.9.',
          a: { label: 'Integer division', sql: `SELECT line_id, qty_shipped, qty_ordered,\n       qty_shipped / qty_ordered\n         AS fill_rate\nFROM order_lines\nWHERE order_id = 'O1004';` },
          b: { label: 'Multiply by 100.0 first', sql: `SELECT line_id, qty_shipped, qty_ordered,\n       ROUND(100.0 * qty_shipped\n             / qty_ordered, 1)\n         AS fill_pct\nFROM order_lines\nWHERE order_id = 'O1004';` },
          diff: '45 / 50 between two integer columns gives 0, because SQL Server discards the remainder. Putting a decimal number into the calculation (100.0 or 1.0) makes the result decimal.',
          use: ['Any ratio or percentage → start with 1.0 * or 100.0 *', 'Divisor might be zero → x / NULLIF(y, 0) returns NULL instead of an error', 'ROUND(value, 2) for presentation'] },
        { t: 'run', h: 'Text functions, shown on a dirty key', key: "Brackets and LEN make hidden spaces visible. TRIM and UPPER fix them.", sql: `SELECT raw_product_id,\n       CONCAT('[', raw_product_id, ']')  AS shown_in_brackets,\n       LEN(raw_product_id)               AS length,\n       UPPER(TRIM(raw_product_id))       AS clean_id\nFROM product_feed;`,
          note: `<code>TRIM</code> removes spaces from both ends (<code>LTRIM</code>/<code>RTRIM</code> for one end). <code>UPPER</code>/<code>LOWER</code> change case. <code>LEN</code> counts characters. <code>CONCAT</code> glues text together; wrapping a value in brackets makes hidden spaces visible. Also: <code>LEFT(x, 3)</code>, <code>RIGHT(x, 2)</code>, <code>SUBSTRING(x, start, length)</code>, <code>REPLACE(x, 'old', 'new')</code>. One SQL Server quirk: its LEN ignores trailing spaces.` },
        { t: 'compare', h: 'Clean the key before you join on it',
          intro: 'Before loading the product feed, count how many of its seven rows match the product catalog before and after cleaning the code.',
          a: { label: 'Raw key', sql: `SELECT COUNT(*) AS matched\nFROM product_feed\nJOIN products\n  ON product_feed.raw_product_id = products.product_id;` },
          b: { label: 'Cleaned key', sql: `SELECT COUNT(*) AS matched\nFROM product_feed\nJOIN products\n  ON UPPER(TRIM(product_feed.raw_product_id))\n     = products.product_id;` },
          diff: 'Spaces and lower case stop four rows from matching. Nothing errors; the rows are simply absent.',
          use: ['Keys arriving from another system or a file → compare the cleaned version', 'SQL Server by default ignores case and trailing spaces when comparing text, so there only the leading spaces would break. Other systems in the chain may be stricter, which is how the same key matches in one place and fails in another'] },
        { t: 'run', h: 'Date functions', key: "DATEDIFF measures a gap. DATEADD moves a date. GETDATE is now.", sql: `SELECT receipt_id, expected_date, received_date,\n       DATEDIFF(day, expected_date, received_date) AS days_late,\n       DATEADD(day, 2, expected_date)              AS chase_on,\n       DATEDIFF(day, expected_date, GETDATE())     AS days_since_expected\nFROM receipts\nORDER BY receipt_id;`,
          note: `<code>DATEDIFF(day, start, end)</code> is end minus start in days; swap <code>day</code> for <code>month</code>, <code>hour</code> and so on. <code>DATEADD(day, 2, d)</code> adds two days. <code>GETDATE()</code> is now (fixed at 2026-11-05 in this practice database). <code>YEAR(d)</code>, <code>MONTH(d)</code>, <code>DAY(d)</code> pull out parts. <code>CAST(synced_at AS DATE)</code> drops the time. A NULL date in gives NULL out.` },
        { t: 'try', id: 'fn-case', title: 'Label every order line',
          prompt: "The shipping team wants a status column for every order line.\n\nReturn line_id and line_status. Use Not shipped for a missing qty_shipped, Short when qty_shipped is below qty_ordered, and Complete otherwise. Sort by line_id.",
          starter: `SELECT line_id,\n       CASE\n         \n       END AS line_status\nFROM order_lines\nORDER BY line_id;`,
          solution: `SELECT line_id,\n       CASE\n         WHEN qty_shipped IS NULL THEN 'Not shipped'\n         WHEN qty_shipped < qty_ordered THEN 'Short'\n         ELSE 'Complete'\n       END AS line_status\nFROM order_lines\nORDER BY line_id;`, ordered: true,
          hints: ['Three branches: two WHEN lines and an ELSE.', 'Test for NULL first.', "WHEN qty_shipped IS NULL THEN 'Not shipped'"],
          explain: 'Order of the WHEN lines is the logic. NULL first, then the comparison, then everything else.' },
        { t: 'try', id: 'fn-fill', title: 'Fill rate per order',
          prompt: "A fulfillment report needs the fill rate for each order with a recorded shipped quantity.\n\nKeep order_lines where qty_shipped is present, including recorded zeros. Per order, calculate 100 × total shipped ÷ total ordered. Return order_id and fill_pct rounded to one decimal place, sorted by order_id.",
          starter: `SELECT order_id,\n       \nFROM order_lines\n`,
          solution: `SELECT order_id,\n       ROUND(100.0 * SUM(qty_shipped) / SUM(qty_ordered), 1) AS fill_pct\nFROM order_lines\nWHERE qty_shipped IS NOT NULL\nGROUP BY order_id\nORDER BY order_id;`, ordered: true,
          hints: ['Filter out NULL shipped quantities in WHERE.', 'Sum first, then divide: 100.0 * SUM(qty_shipped) / SUM(qty_ordered)', 'Wrap it in ROUND(…, 1) and GROUP BY order_id.'],
          explain: 'Dividing the two totals gives the order-level rate. Averaging the line percentages would weight a 10-unit line the same as a 50-unit line.' },
        { t: 'try', id: 'fn-late', title: 'Late receipts',
          prompt: "A supplier review needs a list of deliveries that arrived late.\n\nFrom receipts, keep rows where received_date is later than expected_date. Return receipt_id and days_late (days between expected and received dates). Sort by receipt_id.",
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
      builds: 'Start with a number the ordering screen shows. Bring the source to the same level of detail, reproduce the discrepancy, and test a proposed fix against both the failing case and cases that were already right.',
      outcome: 'Reconcile a screen against its source, name the five usual causes of a mismatch, and prove which one you are looking at.',
      core: [["Reconcile", "Put source and copy side by side, per key.", "Shows which records differ and in which direction."], ["Duplicate check", "GROUP BY the key, HAVING COUNT(*) > 1.", "Finds the cause of a number that is too high."], ["Dropped rows", "An INNER JOIN or WHERE lost records.", "Cause of a number that is too low. Reproduce the wrong value to prove it."], ["Dirty key", "Spaces or case stop a match.", "Looks identical on screen. Brackets and LEN expose it."], ["Stale copy", "The sync time is older than the change.", "Source is right, screen is behind."], ["Missing on one side", "LEFT JOIN + IS NULL, run both ways.", "A record never arrived, or exists with nothing behind it."], ["ROW_NUMBER", "Numbers rows inside each key.", "Keep one row per key, or list the extras."]],
      tip: "Give every finding in four parts: evidence, cause, impact, next action.",
      steps: [
        { t: 'text', h: 'A method you can say out loud', key: "Five checks, in order: compare, duplicates, dropped rows, freshness, completeness.", html: `
<p>Data travels: source tables → sync job → copy the screen reads → screen. When the screen is wrong, work backwards and ask one question at each stop.</p>
<ol><li><strong>Compare.</strong> Put the source value and the screen value side by side, per order. Which rows differ, and in which direction?</li>
<li><strong>Duplicates.</strong> Is the same record loaded twice? (Number too high.)</li>
<li><strong>Dropped rows.</strong> Did a join or filter lose records, often through an unmatched key? (Number too low.)</li>
<li><strong>Freshness.</strong> Is the copy old? (Status or quantity out of date.)</li>
<li><strong>Completeness.</strong> Does a record exist on one side only? (Missing from the screen, or on the screen with no source.)</li></ol>
<p>Then report: what you compared, what differs, the cause, how many records it affects, and the next action.</p>` },
        { t: 'run', h: 'Step 1: source beside screen', key: "Total the source to the same grain as the screen, then put them side by side.", sql: `WITH source_totals AS (\n  SELECT order_id, SUM(qty_ordered) AS source_qty\n  FROM order_lines\n  GROUP BY order_id\n)\nSELECT orders.order_id,\n       orders.status     AS source_status,\n       screen_orders.status     AS screen_status,\n       source_totals.source_qty,\n       screen_orders.total_qty  AS screen_qty\nFROM orders\nLEFT JOIN source_totals             ON source_totals.order_id = orders.order_id\nLEFT JOIN screen_orders ON screen_orders.order_id   = orders.order_id\nORDER BY orders.order_id;`,
          note: `<code>WITH source_totals AS (…)</code> names a sub-result so the main query stays readable (more in chapter 10). The lines are totalled to order grain <em>before</em> joining, so nothing fans out. Read the output: O1004 disagrees on status, O1005 on quantity, O1006 is not on the screen at all. O1002 agrees, and the store still says it is wrong. Each one is a different cause.` },
        { t: 'compare', h: 'Too high: find the duplicate, do not hide it',
          intro: 'The store says it ordered 100 units on O1002. The screen shows 200. Check whether the source lines contain the same product and quantity twice.',
          a: { label: 'DISTINCT hides it', sql: `SELECT DISTINCT order_id, product_id,\n       qty_ordered\nFROM order_lines\nWHERE order_id = 'O1002';` },
          b: { label: 'GROUP BY + HAVING finds it', sql: `SELECT order_id, product_id,\n       COUNT(*) AS copies\nFROM order_lines\nGROUP BY order_id, product_id\nHAVING COUNT(*) > 1;` },
          diff: 'The same line was loaded twice at the source, so source and screen agree with each other and are both wrong. DISTINCT makes the output look right and leaves the bad row in the table. The duplicate check names the exact key that repeats.',
          use: ['Duplicate check: GROUP BY the columns that should be unique, HAVING COUNT(*) > 1', 'When source and screen match but the user disagrees, the error is upstream of both', 'Reach for DISTINCT only after you know why rows repeat'] },
        { t: 'compare', h: 'Too low: a join dropped a row',
          intro: 'O1005 shows 25 units on the screen. The source lines add up to 105. Suppose the sync job joins lines to products.',
          a: { label: 'What the sync does (INNER)', sql: `SELECT order_lines.order_id,\n       SUM(order_lines.qty_ordered) AS total_qty\nFROM order_lines\nJOIN products\n  ON order_lines.product_id = products.product_id\nWHERE order_lines.order_id = 'O1005'\nGROUP BY order_lines.order_id;` },
          b: { label: 'Keep every line (LEFT)', sql: `SELECT order_lines.order_id,\n       SUM(order_lines.qty_ordered) AS total_qty\nFROM order_lines\nLEFT JOIN products\n  ON order_lines.product_id = products.product_id\nWHERE order_lines.order_id = 'O1005'\nGROUP BY order_lines.order_id;` },
          diff: 'The INNER JOIN drops one line worth 80 units and reproduces the screen value. That makes a dropped match a plausible cause. Check the actual sync query or load logs to confirm.',
          use: ['Reproduce the wrong number, then verify whether the actual process applies the same join or filter', 'Number too low → suspect INNER JOIN or a WHERE filter', 'Number too high → suspect duplicates or fan-out'] },
        { t: 'run', h: 'Why that line does not match', key: "The product code has a leading space: four characters, not three.", sql: `SELECT line_id,\n       CONCAT('[', product_id, ']') AS key_in_brackets,\n       LEN(product_id)              AS key_length\nFROM order_lines\nWHERE order_id = 'O1005';`,
          note: `Line 9 holds <code>' P02'</code> with a leading space: four characters, not three. On screen it looks identical to P02. Brackets and LEN expose it. The fix belongs where the value is entered or loaded; your query can prove it with <code>TRIM(product_id)</code>.` },
        { t: 'run', h: 'Out of date: check when the copy was refreshed', key: "The data is right at the source. The copy is three days old.", sql: `SELECT order_id, status, synced_at,\n       DATEDIFF(day, synced_at, GETDATE()) AS days_since_sync\nFROM screen_orders\nWHERE synced_at < (SELECT MAX(synced_at) FROM screen_orders)\nORDER BY synced_at;`,
          note: `The inner query finds the latest sync time; the outer one lists rows older than it. O1004 was last refreshed on Nov 2, earlier than the other rows. That supports the stale-copy explanation. Check the shipment timestamp and sync history to confirm.` },
        { t: 'compare', h: 'Missing on one side: check both directions',
          intro: 'Support needs two exception lists: orders missing from the screen, and screen records missing an order header.',
          a: { label: 'In source, not on screen', sql: `SELECT orders.order_id, orders.status\nFROM orders\nLEFT JOIN screen_orders\n  ON screen_orders.order_id = orders.order_id\nWHERE screen_orders.order_id IS NULL;` },
          b: { label: 'On screen, not in source', sql: `SELECT screen_orders.order_id, screen_orders.status\nFROM screen_orders\nLEFT JOIN orders\n  ON orders.order_id = screen_orders.order_id\nWHERE orders.order_id IS NULL;` },
          diff: 'Same pattern, tables swapped, different findings. O1006 never reached the screen. O1007 is on the screen with no order header behind it.',
          use: ['Always run the check both ways; one direction alone misses half the problems', 'FULL OUTER JOIN … WHERE average_line.key IS NULL OR b.key IS NULL does both in one query', 'Ask whether a missing row is intended (for example, cancelled orders hidden on purpose) before calling it a defect'] },
        { t: 'compare', h: 'A duplicate in a lookup table doubles your total',
          intro: 'A planner asks for the units ordered for P02. Compare a direct total with the total after attaching feed records. The feed has two rows for P02.',
          a: { label: 'Lines only', sql: `SELECT SUM(qty_ordered) AS p02_units\nFROM order_lines\nWHERE product_id = 'P02';` },
          b: { label: 'Joined to the feed', sql: `SELECT SUM(order_lines.qty_ordered) AS p02_units\nFROM order_lines\nJOIN product_feed\n  ON order_lines.product_id = product_feed.raw_product_id\nWHERE order_lines.product_id = 'P02';` },
          diff: 'Each order line matched two feed rows, so every quantity was added twice. The order data is fine; the lookup table is not unique on its key.',
          use: ['Before joining to a lookup table, run the duplicate check on its key', 'A total that is exactly double, or grows after adding a join, is fan-out'] },
        { t: 'run', h: 'Keep one row per key with ROW_NUMBER', key: "Number the rows inside each key. Row 1 is the keeper, the rest are extras.", sql: `WITH ranked AS (\n  SELECT line_id, order_id, product_id, qty_ordered,\n         ROW_NUMBER() OVER (\n           PARTITION BY order_id, product_id\n           ORDER BY line_id\n         ) AS rn\n  FROM order_lines\n)\nSELECT line_id, order_id, product_id, qty_ordered, rn\nFROM ranked\nWHERE order_id = 'O1002';`,
          note: `<code>ROW_NUMBER()</code> numbers the rows inside each group (<code>PARTITION BY</code>) in the order you give. Duplicates get 1, 2, 3. Filtering to <code>rn = 1</code> keeps one row per key; <code>rn &gt; 1</code> lists the extras. It is the standard SQL Server way to de-duplicate or to pick the latest record per key (order by a date, descending).` },
        { t: 'try', id: 'trace-dupes', title: 'Duplicate keys in the product feed',
          prompt: "Before loading a product feed, check whether two rows would point to the same product after cleanup.\n\nFrom product_feed, trim spaces and uppercase raw_product_id. Return clean_id and row_count for cleaned IDs that occur more than once.",
          starter: `SELECT UPPER(TRIM(raw_product_id)) AS clean_id,\n       COUNT(*) AS row_count\nFROM product_feed\n`,
          solution: `SELECT UPPER(TRIM(raw_product_id)) AS clean_id,\n       COUNT(*) AS row_count\nFROM product_feed\nGROUP BY UPPER(TRIM(raw_product_id))\nHAVING COUNT(*) > 1;`,
          hints: ['Group by the cleaned expression, not the raw column.', 'GROUP BY UPPER(TRIM(raw_product_id))', 'HAVING COUNT(*) > 1'],
          explain: 'On SQL Server you repeat the expression in GROUP BY; the alias is not available there. Clean first, then count, or " p01 " and "P01" would look like two different keys.' },
        { t: 'try', id: 'trace-recon', title: 'Orders where the screen quantity is wrong',
          prompt: "A planner suspects the ordering screen is showing the wrong quantities.\n\nCompare only orders with both a source line total and a screen record. Return order_id, source_qty (the sum of qty_ordered in order_lines), and screen_qty (total_qty in screen_orders) where the totals differ.",
          starter: `WITH source_totals AS (\n  SELECT order_id, SUM(qty_ordered) AS source_qty\n  FROM order_lines\n  GROUP BY order_id\n)\nSELECT screen_orders.order_id, source_totals.source_qty, screen_orders.total_qty AS screen_qty\nFROM screen_orders\n`,
          solution: `WITH source_totals AS (\n  SELECT order_id, SUM(qty_ordered) AS source_qty\n  FROM order_lines\n  GROUP BY order_id\n)\nSELECT screen_orders.order_id, source_totals.source_qty, screen_orders.total_qty AS screen_qty\nFROM screen_orders\nJOIN source_totals ON source_totals.order_id = screen_orders.order_id\nWHERE source_totals.source_qty <> screen_orders.total_qty;`,
          hints: ['Join the screen rows to the source_totals totals on order_id.', 'JOIN source_totals ON source_totals.order_id = screen_orders.order_id', 'WHERE source_totals.source_qty <> screen_orders.total_qty'],
          explain: 'Only O1005 differs. Totalling the lines inside the CTE first keeps one row per order on both sides of the join.' },
        { t: 'try', id: 'trace-missing', title: 'Orders the screen never received',
          prompt: "The support team needs the source orders it should investigate for missing screen records.\n\nReturn order_id and status from orders for each order with no matching order_id in screen_orders.",
          starter: `SELECT orders.order_id, orders.status\nFROM orders\n`,
          solution: `SELECT orders.order_id, orders.status\nFROM orders\nLEFT JOIN screen_orders\n  ON screen_orders.order_id = orders.order_id\nWHERE screen_orders.order_id IS NULL;`,
          hints: ['LEFT JOIN from the table you want to keep.', 'ON screen_orders.order_id = orders.order_id', 'WHERE screen_orders.order_id IS NULL'],
          explain: 'O1006 is Cancelled. The next question is for a person, not a query: are cancelled orders meant to be hidden, or did the sync miss it?' },
        { t: 'try', id: 'trace-stale', title: 'Screen rows with the wrong status',
          prompt: "Support needs a list of status disagreements to investigate for a possible stale sync.\n\nMatch orders and screen_orders by order_id. Return order_id, source_status from orders, and screen_status from screen_orders where the two statuses differ.",
          starter: `SELECT orders.order_id,\n       orders.status AS source_status,\n       screen_orders.status AS screen_status\nFROM orders\n`,
          solution: `SELECT orders.order_id,\n       orders.status AS source_status,\n       screen_orders.status AS screen_status\nFROM orders\nJOIN screen_orders\n  ON screen_orders.order_id = orders.order_id\nWHERE orders.status <> screen_orders.status;`,
          hints: ['Join the two tables on order_id.', 'Compare the two status columns in WHERE.', 'WHERE orders.status <> screen_orders.status'],
          explain: 'O1004 only. An INNER JOIN is right here because a status can only differ where both rows exist; the missing rows are a separate check.' },
        { t: 'compare', h: 'Test the fix before you call it fixed',
          intro: 'You propose trimming product codes during the sync. Compare order totals before and after. Check the failing order and look for changes to other orders.',
          a: { label: 'Current join', sql: `SELECT order_lines.order_id,\n       SUM(order_lines.qty_ordered) AS total_qty\nFROM order_lines\nJOIN products\n  ON order_lines.product_id = products.product_id\nGROUP BY order_lines.order_id\nORDER BY order_lines.order_id;` },
          b: { label: 'With the fix', sql: `SELECT order_lines.order_id,\n       SUM(order_lines.qty_ordered) AS total_qty\nFROM order_lines\nJOIN products\n  ON TRIM(order_lines.product_id) = products.product_id\nGROUP BY order_lines.order_id\nORDER BY order_lines.order_id;` },
          diff: 'Exactly one row changes: O1005 goes from 25 to 105, which matches the source. Every other order is untouched, so the fix does what was intended and nothing else.',
          use: ['Write down the expected result before running the test', 'Test the failing case: does it now give the right answer?', 'Test the cases that were already right: did any of them change? (regression check)', 'Record what you ran and what came back, so someone else can repeat it', 'O1004 still shows 50, not 60: the unknown product P99 is a separate issue and stays on the list'] },
        { t: 'text', h: 'How to report a finding', key: "Evidence, cause, impact, next action.", html: `
<p>Use the same four parts every time: <strong>evidence, cause, impact, next action.</strong></p>
<p class="say">"I compared order totals in the source with what the screen shows. Five of six screen rows match. O1005 shows 25 against 105 in the source. I can reproduce 25 by inner-joining lines to products, and one line has a leading space in its product code, so it fails the match. That affects one order and 80 units today, and any line keyed the same way in future. I would correct that code at the source, re-run the sync for the order, and ask whether the load can trim codes on the way in."</p>
<p>If you do not know something, say what you would check next. Interviewers for a role like this are listening for the method.</p>` },
        { t: 'quiz', q: 'The source total and the screen total for an order are identical, and the store insists the quantity is double what they ordered. Where do you look first?',
          options: ['The sync job, because the screen is wrong', 'Duplicate rows in the source lines, because both copies agree', 'The ORDER BY clause'], correct: 1,
          why: 'If the copy matches the source, the sync did its job. The error is in the source itself; run GROUP BY … HAVING COUNT(*) > 1 on the line key.' }
      ]
    },
    /* ------------------------------------------------------------------ KPI */
    {
      id: 'kpi', title: 'Planning KPIs: forecast accuracy, cover and replenishment', mins: 25, priority: 'Must',
      builds: 'Compare forecast and actual sales to find where the plan missed. Then look at available stock, expected demand, and inbound receipts to decide which items need attention.',
      outcome: 'Calculate bias, WAPE, days of cover and a reorder list, say what each one means, and hand a clean extract to Excel.',
      core: [
        ["Forecast error", "actual − forecast, per row.", "Positive means under-forecast (sold more than planned). Say which way round you calculated it."],
        ["Bias", "SUM(actual − forecast) ÷ SUM(actual).", "Shows direction. Over- and under-forecasts cancel, so 0% bias is not the same as accurate."],
        ["WAPE", "SUM(ABS(actual − forecast)) ÷ SUM(actual).", "Shows size of error, weighted by volume. The usual forecast-accuracy KPI (accuracy = 1 − WAPE)."],
        ["Days of cover", "on_hand ÷ daily_demand.", "How long stock lasts. Compare it with lead time."],
        ["Inventory position", "on_hand + on_order.", "What replenishment compares with the reorder point, not on_hand alone."],
        ["Reorder point", "daily_demand × lead_time_days + safety_stock.", "Position below this means an order is due."],
        ["Fill rate / service level", "shipped ÷ ordered.", "The customer-facing result of all the planning."],
        ["Planning exception", "A row that breaks a rule and needs a person.", "Finding, explaining and clearing these is the daily job."]
      ],
      tip: "Never give a KPI bare. Give its scope with it: which rows, which dates, and what you left out. \"WAPE is 11.5% across 23 rows; one row has no actual yet.\"",
      steps: [
        { t: 'text', h: 'What the planning system does, and where you sit', key: "Inputs in, plan out. You check the inputs, watch the outputs and explain the exceptions.", html: `
<div class="tablewrap"><table><thead><tr><th>Stage</th><th>Examples</th><th>Your check</th><th>Practice table</th></tr></thead><tbody>
<tr><td><strong>Inputs</strong></td><td>Item and location master data, sales history, promotions, lead times, safety stock</td><td>Complete, unique keys, no orphans, fresh</td><td><code>products</code>, <code>locations</code>, <code>product_feed</code></td></tr>
<tr><td><strong>Forecast</strong></td><td>Units expected per item, location and day</td><td>Accuracy and bias against actuals; promotions reflected</td><td><code>daily_plan</code></td></tr>
<tr><td><strong>Replenishment</strong></td><td>What to order and when</td><td>Stock position against reorder point; late or missing receipts</td><td><code>inventory</code>, <code>receipts</code></td></tr>
<tr><td><strong>Execution</strong></td><td>Orders and shipments</td><td>Fill rate; screen matches source</td><td><code>orders</code>, <code>order_lines</code>, <code>screen_orders</code></td></tr>
</tbody></table></div>
<p>When a planner says "the forecast looks wrong" or "why did the system not order?", the answer is nearly always in one of these four places. Chapters 4 to 6 gave you the checks for the first and last rows. This chapter covers the middle two.</p>` },
        { t: 'compare', h: 'Bias shows direction. WAPE shows size.',
          intro: 'A planning lead wants to know which locations forecast consistently high or low and how large the misses were. Calculate both measures from the same rows with recorded actuals.',
          a: { label: 'Bias: errors keep their sign', sql: `SELECT location_id,\n       ROUND(100.0 * SUM(actual_units - forecast_units)\n             / SUM(actual_units), 2) AS error_pct\nFROM daily_plan\nWHERE actual_units IS NOT NULL\nGROUP BY location_id\nORDER BY location_id;` },
          b: { label: 'WAPE: errors made positive', sql: `SELECT location_id,\n       ROUND(100.0 * SUM(ABS(actual_units - forecast_units))\n             / SUM(actual_units), 2) AS error_pct\nFROM daily_plan\nWHERE actual_units IS NOT NULL\nGROUP BY location_id\nORDER BY location_id;` },
          diff: 'L02 has 0% bias and 7% WAPE. Its misses were real, and they happened to cancel. L01 is under-forecast (positive bias); L03 is over-forecast (negative).',
          use: ['"Are we consistently too high or too low?" → bias', '"How wrong are we?" → WAPE', 'Report both; a planner needs direction and size', 'Both exclude the row with no actual, so numerator and denominator cover the same rows'] },
        { t: 'run', h: 'Split a KPI to find the cause', key: "A total hides where the error is. Group by the thing you suspect.", sql: `SELECT promo,\n       COUNT(*)            AS plan_rows,\n       SUM(forecast_units) AS forecast,\n       SUM(actual_units)   AS actual,\n       ROUND(100.0 * SUM(actual_units - forecast_units)\n             / SUM(actual_units), 1) AS bias_pct\nFROM daily_plan\nWHERE actual_units IS NOT NULL\nGROUP BY promo\nORDER BY promo;`,
          note: `Non-promotional rows are close to forecast. Promotional rows sold well above it. That narrows the investigation to promotional rows. Check how promotional uplift was set before attributing the difference to it. Swap <code>promo</code> for <code>plan_date</code>, <code>product_id</code> or <code>location_id</code> to cut the same KPI a different way.` },
        { t: 'run', h: 'Days of cover against lead time', key: "If stock runs out before the next delivery can arrive, the item is at risk.", sql: `SELECT inventory.location_id, inventory.product_id, inventory.on_hand, inventory.daily_demand,\n       ROUND(1.0 * inventory.on_hand / NULLIF(inventory.daily_demand, 0), 1) AS days_cover,\n       products.lead_time_days,\n       CASE\n         WHEN products.product_id IS NULL THEN 'No master data'\n         WHEN inventory.daily_demand = 0   THEN 'No demand'\n         WHEN 1.0 * inventory.on_hand / inventory.daily_demand < products.lead_time_days THEN 'At risk'\n         ELSE 'OK'\n       END AS status\nFROM inventory\nLEFT JOIN products ON products.product_id = inventory.product_id\nORDER BY inventory.location_id, inventory.product_id;`,
          note: `Every tool from earlier chapters in one query: <code>LEFT JOIN</code> so the unknown product stays visible, <code>NULLIF</code> so zero demand does not cause a divide-by-zero, <code>1.0 *</code> for a decimal result, and <code>CASE</code> with the data-problem tests first.` },
        { t: 'compare', h: 'Reorder on inventory position, not on-hand',
          intro: 'A replenishment planner needs a reorder list. Compare checking stock on hand with checking stock on hand plus units already on order. The reorder point is daily demand × lead time + safety stock.',
          a: { label: 'On-hand only', sql: `SELECT inventory.location_id, inventory.product_id,\n       inventory.on_hand + inventory.on_order AS position,\n       inventory.daily_demand * products.lead_time_days\n         + products.safety_stock AS reorder_point\nFROM inventory\nJOIN products ON products.product_id = inventory.product_id\nWHERE inventory.on_hand\n      < inventory.daily_demand * products.lead_time_days + products.safety_stock\nORDER BY inventory.location_id, inventory.product_id;` },
          b: { label: 'On-hand + on-order', sql: `SELECT inventory.location_id, inventory.product_id,\n       inventory.on_hand + inventory.on_order AS position,\n       inventory.daily_demand * products.lead_time_days\n         + products.safety_stock AS reorder_point\nFROM inventory\nJOIN products ON products.product_id = inventory.product_id\nWHERE inventory.on_hand + inventory.on_order\n      < inventory.daily_demand * products.lead_time_days + products.safety_stock\nORDER BY inventory.location_id, inventory.product_id;` },
          diff: 'L01 / P01 is flagged on the left only. It has 80 on hand and 50 already on order, which puts it above its reorder point of 120. Ordering again would double up.',
          use: ['Deciding whether to order → inventory position (on_hand + on_order)', 'Deciding whether you can ship today → on_hand', '"Why did the system not order?" is often answered by stock already on order'] },
        { t: 'run', h: 'Receipts that are overdue', key: "An order that has not arrived is still counted in on_order. Check it is real.", sql: `SELECT receipt_id, location_id, product_id, expected_date,\n       DATEDIFF(day, expected_date, GETDATE()) AS days_overdue\nFROM receipts\nWHERE received_date IS NULL\n  AND expected_date < GETDATE()\nORDER BY days_overdue DESC;`,
          note: `These two receipts are past their expected date and have no arrival recorded. If the system is relying on them, the items they cover are more exposed than the reorder list suggests. This is a planning exception: it needs a person to chase the supplier.` },
        { t: 'text', h: 'From SQL to Excel without losing rows', key: "Pull at the grain you will analyse, and carry a control total across.", html: `
<p>The posting describes the working pattern directly: investigate in SQL, then pull the data into Excel for analysis.</p>
<ol><li><strong>Decide the grain</strong> of the extract first. Detail rows if you will pivot several ways; pre-summarised if the detail is huge.</li>
<li><strong>Name every column</strong> and filter the dates in SQL. Do not export <code>SELECT *</code>.</li>
<li><strong>Record two control numbers</strong> from SQL: the row count and one total (for example 24 rows, forecast 3,560).</li>
<li><strong>Paste and re-check</strong> in Excel with <code>COUNTA</code> and <code>SUM</code>. If they differ, rows were lost or a number arrived as text.</li>
<li><strong>Watch the blanks.</strong> SQL NULL arrives as an empty cell, and Excel will treat it as 0 (chapter on SUMIFS).</li>
<li><strong>Then analyse:</strong> PivotTable, lookups, chart.</li></ol>` },
        { t: 'try', id: 'kpi-bias', title: 'Bias in units by location',
          prompt: "Planning wants to see which locations sold more or less than they forecast.\n\nFrom daily_plan, use only rows with recorded actuals. Sum actual_units minus forecast_units per location. Return location_id and bias_units, sorted by location_id.",
          starter: `SELECT location_id,\n       \nFROM daily_plan\n`,
          solution: `SELECT location_id,\n       SUM(actual_units - forecast_units) AS bias_units\nFROM daily_plan\nWHERE actual_units IS NOT NULL\nGROUP BY location_id\nORDER BY location_id;`, ordered: true,
          hints: ['SUM(actual_units - forecast_units)', 'WHERE actual_units IS NOT NULL', 'GROUP BY location_id'],
          explain: 'L01 +200 (under-forecast), L02 exactly 0, L03 −25. The filter matters: without it SUM would still skip the NULL row here, but stating it makes the scope explicit.' },
        { t: 'try', id: 'kpi-promo', title: 'Promotion against baseline',
          prompt: "The Chicago planner wants to see whether promotions account for a forecast gap.\n\nUse L01 rows in daily_plan with recorded actuals. Group by promo and return promo, total_forecast, and total_actual. Sort by promo.",
          starter: `SELECT promo,\n       \nFROM daily_plan\n`,
          solution: `SELECT promo,\n       SUM(forecast_units) AS total_forecast,\n       SUM(actual_units)   AS total_actual\nFROM daily_plan\nWHERE location_id = 'L01'\n  AND actual_units IS NOT NULL\nGROUP BY promo\nORDER BY promo;`, ordered: true,
          hints: ['Two filters in WHERE, then GROUP BY promo.', "location_id = 'L01' AND actual_units IS NOT NULL"],
          explain: 'Promo rows: 1,435 forecast against 1,625 actual, a 190-unit shortfall in the plan. Baseline rows are within 10 units.' },
        { t: 'try', id: 'kpi-cover', title: 'Days of cover',
          prompt: "A replenishment planner needs to see how many days current stock will last.\n\nFrom inventory, use rows with daily_demand greater than zero. Return location_id, product_id, and days_cover (on_hand ÷ daily_demand) rounded to two decimals. Sort by location_id, then product_id.",
          starter: `SELECT location_id, product_id,\n       \nFROM inventory\n`,
          solution: `SELECT location_id, product_id,\n       ROUND(1.0 * on_hand / daily_demand, 2) AS days_cover\nFROM inventory\nWHERE daily_demand > 0\nORDER BY location_id, product_id;`, ordered: true,
          hints: ['Start the division with 1.0 * so it is not cut to a whole number.', 'WHERE daily_demand > 0 avoids dividing by zero.', 'ROUND(1.0 * on_hand / daily_demand, 2)'],
          explain: 'L01 / P03 has 0.63 days of cover against a 5-day lead time: the most exposed item in the data.' },
        { t: 'try', id: 'kpi-reorder', title: 'The reorder list',
          prompt: "A replenishment planner wants a list of items below their reorder point.\n\nJoin inventory to products. Keep rows where on_hand plus on_order is below daily_demand × lead_time_days plus safety_stock. Return location_id, product_id, inventory_position, and reorder_point. Sort by location_id, then product_id.",
          starter: `SELECT inventory.location_id, inventory.product_id,\n       inventory.on_hand + inventory.on_order AS inventory_position,\n       \nFROM inventory\n`,
          solution: `SELECT inventory.location_id, inventory.product_id,\n       inventory.on_hand + inventory.on_order AS inventory_position,\n       inventory.daily_demand * products.lead_time_days + products.safety_stock AS reorder_point\nFROM inventory\nJOIN products ON products.product_id = inventory.product_id\nWHERE inventory.on_hand + inventory.on_order < inventory.daily_demand * products.lead_time_days + products.safety_stock\nORDER BY inventory.location_id, inventory.product_id;`, ordered: true,
          hints: ['JOIN products ON products.product_id = inventory.product_id', 'Repeat both expressions in WHERE; SQL Server will not accept the aliases there.', 'WHERE inventory.on_hand + inventory.on_order < inventory.daily_demand * products.lead_time_days + products.safety_stock'],
          explain: 'Six items. The INNER JOIN leaves out P99, which has stock and no master data; mention it as a separate exception instead of letting it vanish.' },
        { t: 'quiz', q: 'A location reports 0% forecast bias for the week. What can you conclude?',
          options: ['The forecast was accurate', 'Over- and under-forecasts added up to zero; accuracy needs WAPE', 'No actuals were loaded'], correct: 1,
          why: 'Bias nets positive and negative errors against each other. L02 in the practice data has 0% bias and a 7% WAPE.' }
      ]
    },
    /* ------------------------------------------------------------------ 7 */
    {
      id: 'xl-lookup', title: 'Excel: lookups and clean keys', mins: 20, priority: 'Must', excel: true,
      builds: 'Start with a plan row and bring in its product name from another sheet. Follow the same product code through a missing match, a cleanup, and a duplicate check.',
      outcome: 'Write an exact-match XLOOKUP or VLOOKUP, lock ranges so the formula copies down safely, and clean and de-duplicate a key.',
      core: [["XLOOKUP", "Finds a key and returns the value beside it.", "Exact match by default. The fourth argument handles missing keys."], ["VLOOKUP", "Older lookup that returns a column by number.", "Without FALSE it approximates and returns wrong values."], ["INDEX + MATCH", "A lookup that works in every Excel version.", "The fallback when XLOOKUP is not available."], ["$ reference", "Pins a range so it does not move when copied.", "An unpinned lookup range slides and starts missing rows."], ["TRIM, UPPER, LEN", "Clean and inspect a key.", "Excel ignores case and never ignores spaces."], ["COUNTIF", "Counts how often a value occurs.", "A count above 1 flags a duplicate."], ["IFERROR", "Replaces an error with a value you choose.", "Turns #N/A into a label you can filter."]],
      tip: "Say the SQL equivalent as you work: \"this XLOOKUP is my left join.\" It shows you understand both.",
      steps: [
        { t: 'text', h: 'The same data, as sheets', key: "Three sheets, three tables you already know. Row 1 is the header.", html: `
<p>The Excel half of an assessment usually hands you an extract and asks for the same things as the SQL half: enrich, summarise, find the exceptions. The practice workbook has three sheets, which are three of the tables you already know.</p>
<div class="tablewrap"><table><thead><tr><th>Sheet</th><th>Table</th><th>Columns</th></tr></thead><tbody>
<tr><td>Plan</td><td>daily_plan</td><td>A plan_id · B plan_date · C location_id · D product_id · E forecast_units · F actual_units · G promo</td></tr>
<tr><td>Products</td><td>products</td><td>A product_id · B product_name · C category · D unit_cost · E lead_time_days · F safety_stock</td></tr>
<tr><td>Feed</td><td>product_feed</td><td>A feed_row_id · B raw_product_id · C raw_name · D loaded_date</td></tr>
</tbody></table></div>
<p>Row 1 is the header, so plan_id 1 sits in row 2. Each sheet below has a Copy button: paste into cell A1 of a blank sheet in Excel or Google Sheets and name the tab to match.</p>` },
        { t: 'sheet', h: 'Sheet: Plan', table: 'daily_plan', sheet: 'Plan' },
        { t: 'sheet', h: 'Sheet: Products', table: 'products', sheet: 'Products' },
        { t: 'compare', h: 'XLOOKUP and LEFT JOIN with a unique lookup key',
          intro: 'A planner needs names beside the codes on plan rows 1, 2, and 18. Keep all three rows and label any code missing from the catalog.',
          a: { label: 'Excel, typed in H2 and copied down', formula: `=XLOOKUP(D2, Products!A:A,\n         Products!B:B, "MISSING")`, shows: 'Row 2 → Burger buns · Row 3 → Potato fries · Row 19 (plan 18, P99) → MISSING' },
          b: { label: 'SQL', sql: `SELECT daily_plan.plan_id, daily_plan.product_id,\n       ISNULL(products.product_name, 'MISSING')\n         AS product_name\nFROM daily_plan\nLEFT JOIN products\n  ON products.product_id = daily_plan.product_id\nWHERE daily_plan.plan_id IN (1, 2, 18);` },
          diff: 'Same result. XLOOKUP reads: find D2 in Products column A, return the value beside it from column B, and if it is not there say MISSING. Every plan row is kept. The catalog has one row per product, so this lookup returns the same names as the SQL result. The fourth argument supplies the text to show when there is no match.',
          use: ['XLOOKUP(what, where to look, what to return, if not found)', 'Leave the fourth argument out and a missing key shows #N/A', 'Filter the new column for MISSING to get the exception list, the Excel version of LEFT JOIN + IS NULL', 'XLOOKUP returns the first match only. A duplicate key in the lookup sheet is hidden, where SQL would show it as an extra row'] },
        { t: 'compare', h: 'XLOOKUP and VLOOKUP',
          intro: 'You need to add a product name from the Products sheet. Compare an exact-match XLOOKUP with a VLOOKUP for a workbook that uses the older formula.',
          a: { label: 'XLOOKUP', formula: `=XLOOKUP(D2, Products!A:A,\n         Products!B:B, "MISSING")`, shows: 'Exact match by default. Lookup and return columns are named separately, so it can look left or right and survives inserted columns.' },
          b: { label: 'VLOOKUP', formula: `=VLOOKUP(D2, Products!A:F,\n         2, FALSE)`, shows: 'Looks in the first column of the range and returns column number 2. Wrap it in IFERROR(…, "MISSING") to handle missing keys.' },
          diff: 'VLOOKUP needs the key in the leftmost column, counts the return column by number, and defaults to approximate match. Leave out FALSE and it returns a wrong, plausible-looking value instead of an error.',
          use: ['Always end VLOOKUP with FALSE (or 0)', 'XLOOKUP when the Excel version has it (2021 and Microsoft 365)', 'INDEX(return_range, MATCH(key, lookup_range, 0)) is the third option and works everywhere'] },
        { t: 'compare', h: 'Lock the range before you copy the formula down',
          intro: 'The first product lookup works in H2. Fill it down to H25 while keeping the catalog range fixed and letting the product code cell move.',
          a: { label: 'Relative range', formula: `=XLOOKUP(D2, Products!A2:A7,\n         Products!B2:B7, "MISSING")`, shows: 'In H3 it has become Products!A3:A8. Each row down, the lookup range slides one row and products fall off the top, so real products start returning MISSING.' },
          b: { label: 'Absolute range', formula: `=XLOOKUP(D2, Products!$A$2:$A$7,\n         Products!$B$2:$B$7, "MISSING")`, shows: 'D2 still moves to D3, D4 … and the lookup range stays put.' },
          diff: 'A plain reference moves when copied. A $ pins the column, the row or both. Whole-column references (A:A) do not slide and need no $.',
          use: ['Lookup tables, rates, thresholds → $A$2:$A$7, or A:A', 'The cell on the current row → leave it relative (D2)', 'F4 cycles through the $ options while editing a reference'] },
        { t: 'sheet', h: 'Sheet: Feed', table: 'product_feed', sheet: 'Feed' },
        { t: 'text', h: 'Clean a key in Excel', key: "Excel ignores case. It never ignores spaces.", html: `
<p>Same idea as <code>UPPER(TRIM(x))</code> in lesson 5, in a helper column:</p>
<pre class="code">E2:  =UPPER(TRIM(B2))        clean key
F2:  =LEN(B2)                4 or 5 instead of 3 reveals a hidden space
G2:  =COUNTIF(E:E, E2)       how many times this clean key occurs</pre>
<ul><li>Excel comparisons (<code>=</code>, XLOOKUP, COUNTIF, SUMIFS) ignore upper and lower case, so <code>p03</code> matches <code>P03</code>. Use <code>EXACT(a, b)</code> when case must match.</li>
<li>Spaces always count. <code>" P04"</code> does not match <code>"P04"</code>.</li>
<li><code>TRIM</code> removes leading and trailing spaces and squeezes repeated spaces inside the text to one.</li>
<li>A number stored as text (left-aligned, green corner) will not match a real number. <code>VALUE(x)</code> converts it.</li></ul>` },
        { t: 'compare', h: 'COUNTIF flags duplicates. GROUP BY lists them.',
          intro: 'A feed validation report needs to find repeated cleaned product codes. Compare flagging the original rows in Excel with listing each repeated code once in SQL.',
          a: { label: 'Excel helper column', formula: `=COUNTIF(E:E, E2)`, shows: 'Writes a count on every row: 2 on both P02 rows, 1 on the rest. Filter for values above 1.' },
          b: { label: 'SQL', sql: `SELECT UPPER(TRIM(raw_product_id)) AS clean_id,\n       COUNT(*) AS row_count\nFROM product_feed\nGROUP BY UPPER(TRIM(raw_product_id))\nHAVING COUNT(*) > 1;` },
          diff: 'COUNTIF keeps every row and adds the count beside it. GROUP BY + HAVING collapses to one row per duplicated key.',
          use: ['See the offending rows in place → COUNTIF helper column, then filter', 'Want just the list of duplicated keys → PivotTable with Count, or SQL', 'Conditional Formatting → Duplicate Values highlights them without a formula'] },
        { t: 'try', id: 'xl-missing', title: 'Which product is unmatched?', sheets: ['daily_plan', 'products'],
          prompt: "A planner needs readable product names on the Plan sheet and wants to spot missing catalog entries.\n\nAdd the exact-match XLOOKUP to column H and fill it down. Use MISSING for an unmatched row. Enter the product ID that comes back MISSING.",
          answerSql: `SELECT DISTINCT daily_plan.product_id FROM daily_plan LEFT JOIN products ON products.product_id = daily_plan.product_id WHERE products.product_id IS NULL`, answer: 'P99',
          solution: `=XLOOKUP(D2, Products!A:A, Products!B:B, "MISSING")`,
          hints: ['Filter column H for MISSING, or scan Products column A for an ID that is not there.', 'It is on plan_id 18.'],
          explain: 'P99 is in the plan and not in the product list. Report it; do not delete the row.' },
        { t: 'try', id: 'xl-rawmatch', title: 'How many feed keys match before cleaning?', sheets: ['product_feed', 'products'],
          prompt: "You are checking whether product codes in the incoming feed work as received.\n\nLook up Feed column B against Products column A in Excel without changing the text. Enter how many of the seven feed rows find an exact match.",
          answerSql: `SELECT COUNT(*) FROM product_feed JOIN products ON UPPER(product_feed.raw_product_id) = products.product_id`, answer: 4,
          solution: `=XLOOKUP(B2, Products!A:A, Products!A:A, "MISSING")`,
          hints: ['Excel ignores case, so p03 matches.', 'Spaces still break a match, at either end.'],
          explain: 'Four: both P02 rows, p03 and P06. The three keys with spaces fail. The raw SQL join in lesson 5 matched only three because that comparison was also case-sensitive. Same data, different matching rules in each tool.' },
        { t: 'try', id: 'xl-dupe', title: 'Which cleaned key is duplicated?', sheets: ['product_feed'],
          prompt: "You need to identify repeated product codes before using the feed as a lookup.\n\nOn Feed, build a clean ID with UPPER(TRIM()) and count occurrences with COUNTIF. Enter the cleaned product ID that appears twice.",
          answerSql: `SELECT UPPER(TRIM(raw_product_id)) FROM product_feed GROUP BY UPPER(TRIM(raw_product_id)) HAVING COUNT(*) > 1`, answer: 'P02',
          solution: `E2: =UPPER(TRIM(B2))     G2: =COUNTIF(E:E, E2)`,
          hints: ['Look for the 2 in the COUNTIF column.'],
          explain: 'P02, on feed rows 2 and 3. An XLOOKUP against this sheet would quietly return the first one.' },
        { t: 'quiz', q: 'A colleague writes =VLOOKUP(D2, Products!A:F, 2) and some names look wrong. What is the most likely reason?',
          options: ['The range should start at column B', 'The fourth argument is missing, so it is doing an approximate match', 'VLOOKUP cannot return text'], correct: 1,
          why: 'Without FALSE, VLOOKUP assumes a sorted list and returns the nearest lower match. Add FALSE for an exact match.' }
      ]
    },
    /* ------------------------------------------------------------------ 8 */
    {
      id: 'xl-summary', title: 'Excel: SUMIFS, PivotTables and IF', mins: 20, priority: 'Must', excel: true,
      builds: 'Start with one forecast total, then break it out by location. Use a helper column to flag exceptions and distinguish missing actuals from actual sales of zero.',
      outcome: 'Total with several conditions, build a PivotTable summary, label exceptions with IF, and keep blanks from being read as zero.',
      core: [["SUMIFS", "Adds values where every condition is true.", "WHERE + SUM. The sum range comes first."], ["COUNTIFS, AVERAGEIFS", "Count or average with the same condition pairs.", "Conditions compare a column with a value, not with another column."], ["PivotTable", "A summary row for every group.", "GROUP BY. Refresh it after the data changes."], ["IF, IFS", "Label or calculate by condition.", "CASE. Put the blank test first."], ["Blank and zero", "Excel treats an empty cell as 0 in arithmetic.", "A missing value looks like a real shortfall."], ["COUNT, COUNTA, COUNTBLANK", "Count numbers, non-empty cells, empty cells.", "The quick completeness check."], ["Control total", "Compare a row count and one sum with the source.", "Catches rows lost to a filter or a bad paste."]],
      tip: "State a control total before you report: \"24 rows, forecast 3,560, same as the extract.\"",
      steps: [
        { t: 'compare', h: 'SUMIFS is WHERE + SUM',
          intro: 'The Chicago planner needs one number for a report: total forecast units for promotional rows at L01.',
          a: { label: 'Excel', formula: `=SUMIFS(Plan!E:E,\n        Plan!C:C, "L01",\n        Plan!G:G, 1)`, shows: 'Result: 1435' },
          b: { label: 'SQL', sql: `SELECT SUM(forecast_units)\n         AS total_forecast\nFROM daily_plan\nWHERE location_id = 'L01'\n  AND promo = 1;` },
          diff: 'Same number. The range to add comes first, then pairs of (range to test, value to match). Every pair must be true, like conditions joined by AND.',
          use: ['SUMIFS(sum_range, test_range1, value1, test_range2, value2, …)', 'COUNTIFS and AVERAGEIFS take the same pairs (COUNTIFS has no sum range)', 'Comparisons go in quotes: ">100", "<>L03". With a cell: ">" & J1', 'Dates: use DATE(2026,11,2) as the value, or a cell that holds the date', 'Older SUMIF has the arguments in a different order: SUMIF(test_range, value, sum_range)'] },
        { t: 'compare', h: 'SUMIFS answers one question. A PivotTable answers it for every group.',
          intro: 'A planning lead needs a table with one row per location and columns for total forecast and total actual units.',
          a: { label: 'PivotTable', formula: `Insert → PivotTable (select the Plan data)\nRows:    location_id\nValues:  Sum of forecast_units\n         Sum of actual_units\nFilters: promo (optional)`, shows: 'One line per location plus a Grand Total, the same grid as the SQL result.' },
          b: { label: 'SQL', sql: `SELECT location_id,\n       SUM(forecast_units) AS forecast,\n       SUM(actual_units)   AS actual\nFROM daily_plan\nGROUP BY location_id\nORDER BY location_id;` },
          diff: 'Rows is GROUP BY, Values are the aggregates, Filters is WHERE. A value filter on the pivot (Value Filters → Greater Than) is HAVING.',
          use: ['One figure for a cell in a report → SUMIFS', 'A breakdown you will slice several ways → PivotTable', 'If Values shows Count instead of Sum, the column contains text or blanks; fix the column or change Value Field Settings', 'Right-click → Refresh after the data changes; a pivot does not update itself'] },
        { t: 'compare', h: 'How a blank actual affects subtraction in Excel and SQL',
          intro: 'Calculate actual minus forecast for two plan rows. Plan 16 has a missing actual. Plan 17 recorded zero. Check whether the output keeps those cases distinct.',
          a: { label: 'Excel', formula: `H17:  =F17-E17\nH18:  =F18-E18`, shows: 'H17 → -140 (blank treated as 0) · H18 → -70. Both look like real shortfalls.' },
          b: { label: 'SQL', sql: `SELECT plan_id, forecast_units,\n       actual_units,\n       actual_units - forecast_units\n         AS variance\nFROM daily_plan\nWHERE plan_id IN (16, 17);` },
          diff: 'SQL returns NULL when either value in this subtraction is missing. Excel treats the referenced blank as zero in this formula, so a missing actual looks like a 140-unit miss. Check for blanks before subtracting.',
          use: ['Guard the formula: =IF(F17="", "", F17-E17)', 'Count the blanks before trusting a total: =COUNTBLANK(F2:F25)', 'COUNT counts numbers, COUNTA counts non-empty cells, COUNTBLANK counts empty ones'] },
        { t: 'text', h: 'IF is CASE', key: "First true test wins, so the blank check goes first.", html: `
<pre class="code">=IF(F2="", "Missing",
   IF(F2>E2, "Under-forecast", "OK"))

=IFS(F2="", "Missing", F2>E2, "Under-forecast", TRUE, "OK")</pre>
<p>Read it like CASE: first test that is true wins, so the blank check goes first for the same reason the NULL check does. <code>IFS</code> avoids nesting; its final <code>TRUE</code> is the ELSE. <code>AND(a, b)</code> and <code>OR(a, b)</code> combine tests inside IF. <code>IFERROR(formula, "fallback")</code> catches #N/A and #DIV/0!.</p>
<p>Count the labels afterwards with <code>=COUNTIF(H:H, "Missing")</code>, which is the Excel form of <code>SUM(CASE WHEN … THEN 1 ELSE 0 END)</code>.</p>` },
        { t: 'text', h: 'A ratio across rows: forecast error (WAPE)', key: "Guard the blank in a helper column, then divide two sums. Always check a control total.", html: `
<pre class="code">H2:  =IF(F2="", "", ABS(F2-E2))     copy down to H25
J1:  =SUM(H2:H25) / SUM(F2:F25)      format as a percentage</pre>
<p>The helper column leaves the missing-actual row out of the numerator, and <code>SUM</code> already skips blanks in the denominator, so both halves cover the same rows. In one cell: <code>=SUMPRODUCT((F2:F25&lt;&gt;"")*ABS(F2:F25-E2:E25))/SUM(F2:F25)</code>.</p>
<p>Before reporting any total, check it against a control: <code>=SUM(Plan!E2:E25)</code> should be 3560, and <code>=COUNTA(Plan!A2:A25)</code> should be 24. If a filter or a bad paste lost rows, this is where you find out.</p>` },
        { t: 'text', h: 'The rest of the advanced Excel toolkit', key: "The posting asks for advanced Excel. These are the features that phrase usually means.", html: `
<div class="tablewrap"><table><thead><tr><th>Feature</th><th>What it does</th><th>SQL equivalent, or when to use it</th></tr></thead><tbody>
<tr><td><strong>Table (Ctrl+T)</strong></td><td>Turns a range into a named table that grows with the data. Formulas read <code>Plan[forecast_units]</code>.</td><td>Use it on every extract. Pivots and formulas pick up new rows.</td></tr>
<tr><td><strong>Remove Duplicates</strong></td><td>Deletes repeated rows on the columns you choose.</td><td>DISTINCT. Count them with COUNTIF first so you know what you removed.</td></tr>
<tr><td><strong>Text to Columns</strong></td><td>Splits one column on a delimiter, or converts text to numbers or dates.</td><td>Fixes numbers and dates that arrived as text.</td></tr>
<tr><td><strong>Conditional Formatting</strong></td><td>Colours cells by rule: duplicates, values over a limit, top 10.</td><td>A visual WHERE. Good for exceptions.</td></tr>
<tr><td><strong>FILTER, UNIQUE, SORT</strong></td><td>Formulas that return a whole filtered, de-duplicated or sorted list.</td><td>WHERE, DISTINCT, ORDER BY as live formulas (Microsoft 365).</td></tr>
<tr><td><strong>Pivot calculated field</strong></td><td>A formula on pivot totals, such as actual ÷ forecast.</td><td>A calculation on SUMs after GROUP BY.</td></tr>
<tr><td><strong>Slicer</strong></td><td>Clickable filter buttons for a pivot or table.</td><td>An interactive WHERE for the person reading the report.</td></tr>
<tr><td><strong>Data Validation</strong></td><td>Restricts what can be typed into a cell, such as a drop-down list.</td><td>Stops dirty keys at the point of entry.</td></tr>
<tr><td><strong>EOMONTH, WEEKNUM, TEXT</strong></td><td>Month end, week number, and a date shown in a chosen format.</td><td>Group daily rows into weeks or months, like DATEPART.</td></tr>
</tbody></table></div>` },
        { t: 'try', id: 'xl-sumifs', title: 'SUMIFS with a date', sheets: ['daily_plan'],
          prompt: "The Chicago planner asks for the November 2, 2026 forecast total.\n\nOn Plan, use SUMIFS to add forecast_units for location L01 and that date. Enter the total units.",
          answerSql: `SELECT SUM(forecast_units) FROM daily_plan WHERE location_id = 'L01' AND plan_date = '2026-11-02'`, answer: 640,
          solution: `=SUMIFS(Plan!E:E, Plan!C:C, "L01", Plan!B:B, DATE(2026,11,2))`,
          hints: ['Sum range is column E. Two test pairs: column C and column B.', 'Three rows qualify: plan_id 7, 8 and 9.'],
          explain: '110 + 210 + 320. If your pasted dates are text rather than dates, use "2026-11-02" as the value instead.' },
        { t: 'try', id: 'xl-countifs', title: 'COUNTIFS with a helper column', sheets: ['daily_plan'],
          prompt: "The Denver planner wants to count the rows where actual sales beat forecast.\n\nOn Plan, add a helper column that checks whether actual_units is greater than forecast_units for each row. Use COUNTIFS to count TRUE rows at L02. Enter the count.",
          answerSql: `SELECT COUNT(*) FROM daily_plan WHERE location_id = 'L02' AND actual_units > forecast_units`, answer: 4,
          solution: `H2: =F2>E2  (copy down)     =COUNTIFS(Plan!C:C, "L02", Plan!H:H, TRUE)`,
          hints: ['COUNTIFS compares a column with a fixed value, not with another column. That is why the helper column is needed.', 'L02 has eight rows; check each one.'],
          explain: 'plan_id 4, 5, 18 and 23. Comparing two columns row by row needs a helper column (or SUMPRODUCT); in SQL it is simply WHERE actual_units > forecast_units.' },
        { t: 'try', id: 'xl-gap', title: 'Promotional gap', sheets: ['daily_plan'],
          prompt: "The Chicago planner wants the unit gap for promotions.\n\nOn Plan, keep L01 rows where promo is 1. Subtract the total forecast_units from the total actual_units. Enter the signed difference in units.",
          answerSql: `SELECT SUM(actual_units) - SUM(forecast_units) FROM daily_plan WHERE location_id = 'L01' AND promo = 1`, answer: 190,
          solution: `=SUMIFS(Plan!F:F, Plan!C:C, "L01", Plan!G:G, 1) - SUMIFS(Plan!E:E, Plan!C:C, "L01", Plan!G:G, 1)`,
          hints: ['Two SUMIFS with the same conditions, one on column F and one on column E.', 'Actual total is 1625.'],
          explain: '1625 − 1435. A PivotTable filtered to L01 and promo = 1 gives the same two totals.' },
        { t: 'try', id: 'xl-wape', title: 'Overall forecast error', sheets: ['daily_plan'],
          prompt: "A planner needs one forecast error percentage for the Plan sheet.\n\nUse the helper column to total absolute differences for rows with an actual. Divide by total actual units for those rows. Enter the percentage rounded to two decimals, such as 12.34.",
          answerSql: `SELECT ROUND(100.0 * SUM(ABS(actual_units - forecast_units)) / SUM(actual_units), 2) FROM daily_plan WHERE actual_units IS NOT NULL`, answer: 11.54, tol: 0.011,
          solution: `H2: =IF(F2="", "", ABS(F2-E2))     =SUM(H2:H25)/SUM(F2:F25)`,
          hints: ['Numerator: sum of the absolute differences, skipping the blank actual.', 'Denominator: sum of actual_units, 3595.'],
          explain: '415 ÷ 3595. Without the blank guard, row 17 adds 140 to the numerator and the answer rises to about 15.4%, which is the blank-as-zero error in action.' },
        { t: 'quiz', q: 'A PivotTable shows "Count of actual_units" when you wanted the sum. What does that tell you?',
          options: ['PivotTables cannot sum', 'The column contains blanks or text, so Excel defaulted to Count', 'The data has duplicates'], correct: 1,
          why: 'Excel picks Count when a value column is not purely numeric. Change it in Value Field Settings, and note the blank: it is the missing feed.' }
      ]
    },
    /* ------------------------------------------------------------------ 9 */
    {
      id: 'steps', title: 'Multi-step queries: subquery, CTE, window', mins: 20, priority: 'If time',
      builds: 'Break a question into a small calculation and a query that uses it. Then show an order total beside each of its detail lines, or rank lines so you can keep just one.',
      outcome: 'Break a hard question into named steps and add a group total without losing the detail rows.',
      core: [["Subquery", "A query in brackets, used as a value or a table.", "Fine for one small inner value."], ["CTE (WITH)", "A named sub-result at the top of the query.", "Lets you build and explain one step at a time."], ["Window function (OVER)", "Calculates across related rows without collapsing them.", "Detail rows and a group total in the same result."], ["PARTITION BY", "The grouping inside OVER.", "The window version of GROUP BY."], ["ROW_NUMBER", "Numbers rows within each partition.", "Latest record per key, top N per group, de-duplication."]],
      tip: "Write the CTE for step one, run it, look at it, then build step two on top.",
      steps: [
        { t: 'compare', h: 'Subquery and CTE: same answer, different readability',
          intro: 'Fulfillment wants line IDs and quantities for order lines larger than the overall average. Calculate the average once and use it as the cutoff.',
          a: { label: 'Subquery', sql: `SELECT line_id, qty_ordered\nFROM order_lines\nWHERE qty_ordered >\n      (SELECT AVG(qty_ordered)\n       FROM order_lines);` },
          b: { label: 'CTE', sql: `WITH average_line AS (\n  SELECT AVG(qty_ordered) AS avg_qty\n  FROM order_lines\n)\nSELECT order_lines.line_id, order_lines.qty_ordered\nFROM order_lines\nCROSS JOIN average_line\nWHERE order_lines.qty_ordered > average_line.avg_qty;` },
          diff: 'Identical rows. A subquery is a query in brackets used as a value or a table. A CTE gives that inner query a name at the top so the main query reads top to bottom.',
          use: ['One small inner value → subquery is fine', 'Two or more steps, or the same step reused → CTE', 'In an interview a CTE lets you explain step one before writing step two'] },
        { t: 'compare', h: 'GROUP BY collapses rows. A window function keeps them.',
          intro: 'Compare two report layouts for O1001 and O1004: one total per order, or one row per item line with its order total beside it.',
          a: { label: 'GROUP BY', sql: `SELECT order_id,\n       SUM(qty_ordered) AS order_total\nFROM order_lines\nWHERE order_id IN ('O1001','O1004')\nGROUP BY order_id;` },
          b: { label: 'SUM() OVER', sql: `SELECT line_id, order_id, qty_ordered,\n       SUM(qty_ordered) OVER (\n         PARTITION BY order_id\n       ) AS order_total\nFROM order_lines\nWHERE order_id IN ('O1001','O1004');` },
          diff: 'GROUP BY returns one row per order. OVER (PARTITION BY …) calculates the same total and writes it on every line, so you can show each line as a share of its order.',
          use: ['Only the summary needed → GROUP BY', 'Detail rows plus a group total, rank or running number → window function', 'PARTITION BY is the window version of GROUP BY'] },
        { t: 'run', h: 'Receipt with the latest expected date per location and product', key: "Sort each group by expected date and keep its first row.", sql: `WITH ranked AS (\n  SELECT receipt_id, location_id, product_id, expected_date,\n         ROW_NUMBER() OVER (\n           PARTITION BY location_id, product_id\n           ORDER BY expected_date DESC, receipt_id\n         ) AS rn\n  FROM receipts\n)\nSELECT receipt_id, location_id, product_id, expected_date\nFROM ranked\nWHERE rn = 1\nORDER BY location_id, product_id;`,
          note: `Number the receipts within each location and product by expected date, then keep number 1. Receipt ID breaks ties. To find the most recent actual arrival, use received_date and exclude receipts without an arrival.` },
        { t: 'try', id: 'steps-wape', title: 'Forecast error by location',
          prompt: "A planning lead wants to compare forecast accuracy across locations.\n\nFrom daily_plan, keep rows with recorded actuals. Per location, divide total absolute error by total actual units and multiply by 100. Return location_id and wape_pct rounded to two decimals, sorted by location_id.",
          starter: `SELECT location_id,\n       \nFROM daily_plan\n`,
          solution: `SELECT location_id,\n       ROUND(100.0 * SUM(ABS(actual_units - forecast_units)) / SUM(actual_units), 2) AS wape_pct\nFROM daily_plan\nWHERE actual_units IS NOT NULL\nGROUP BY location_id\nORDER BY location_id;`, ordered: true,
          hints: ['ABS() makes over- and under-forecasts both positive.', '100.0 * SUM(ABS(actual_units - forecast_units)) / SUM(actual_units)', 'WHERE actual_units IS NOT NULL, GROUP BY location_id'],
          explain: 'Excluding the NULL actual keeps numerator and denominator on the same rows. This metric (weighted absolute percentage error) is common in planning teams.' },
        { t: 'try', id: 'steps-top', title: 'Largest line on each order',
          prompt: "A fulfillment lead wants one line per order to review its largest item quantity.\n\nFrom order_lines, keep the line with the highest qty_ordered per order. Break ties with the lowest line_id. Return order_id, product_id, and qty_ordered, sorted by order_id.",
          starter: `WITH ranked AS (\n  SELECT order_id, product_id, qty_ordered,\n         ROW_NUMBER() OVER (\n           PARTITION BY \n           ORDER BY \n         ) AS rn\n  FROM order_lines\n)\nSELECT order_id, product_id, qty_ordered\nFROM ranked\n`,
          solution: `WITH ranked AS (\n  SELECT order_id, product_id, qty_ordered,\n         ROW_NUMBER() OVER (\n           PARTITION BY order_id\n           ORDER BY qty_ordered DESC, line_id\n         ) AS rn\n  FROM order_lines\n)\nSELECT order_id, product_id, qty_ordered\nFROM ranked\nWHERE rn = 1\nORDER BY order_id;`, ordered: true,
          hints: ['PARTITION BY order_id', 'ORDER BY qty_ordered DESC, line_id', 'WHERE rn = 1'],
          explain: 'The second ORDER BY column breaks ties, so the answer is the same every time it runs.' }
      ]
    }
,
    /* ------------------------------------------------------------------ 11 */
    {
      id: 'kinaxis', title: 'Kinaxis Maestro: what to know', mins: 10, priority: 'Know', track: 'Kinaxis',
      builds: 'Learn what a planning platform does, then connect each term to an investigation you can already explain. Use the examples to discuss transferable skills and ask how HAVI runs its process.',
      outcome: 'Describe Kinaxis Maestro in two sentences, use its vocabulary correctly, and map each term to a SQL or Excel skill you have.',
      core: [["Kinaxis Maestro", "A cloud supply chain planning platform. Formerly called RapidResponse.", "It is the planning system this role supports. Use the current name, and know the old one."], ["Concurrent planning", "Demand, supply and inventory plans share one data model and recalculate together.", "A change in one place shows its effect everywhere at once, instead of passing between separate tools."], ["Scenario", "A private what-if copy of the plan that you can change and compare with the baseline.", "How planners test a change before committing it. Same idea as testing a fix in chapter 6."], ["Workbook, worksheet", "A workbook is a set of worksheets. A worksheet is a saved view of data: chosen columns, filters, calculations.", "A worksheet is a saved query. Your SELECT, WHERE and GROUP BY thinking carries over."], ["Hierarchy, filter", "Ways to roll data up (product family, region) and to narrow it (my items, my sites).", "GROUP BY and WHERE, chosen from menus."], ["Dashboard, scorecard", "Visual summaries of KPIs against targets.", "Where forecast accuracy and service level from chapter 7 are watched."], ["Data integration", "Scheduled loads that bring master data, orders and inventory in from source systems.", "Where dirty keys, duplicates and stale loads enter. Chapter 6 is how you find them."]],
      tip: "If asked about Kinaxis experience, be exact about what you have and have not used, then bridge: \"I have not worked in Maestro itself. The work underneath it, validating inputs, tracing a wrong number, checking forecast accuracy, is what I do in SQL and Excel.\"",
      steps: [
        { t: 'text', h: 'What it is, in two sentences', key: "A planning platform where demand, supply and inventory are planned together on one data model.", html: `
<p>Kinaxis Maestro (called RapidResponse until 2024) is a cloud platform companies use to plan their supply chain: forecast demand, plan supply and inventory, and respond when something changes. Its selling point is <strong>concurrent planning</strong>: every plan runs on the same data at the same time, so a change to a forecast shows its effect on inventory and replenishment straight away, and planners can test options in <strong>scenarios</strong> before committing.</p>
<p>This summary is general product knowledge. How HAVI has configured it, and which parts this team owns, are good questions to ask them.</p>` },
        { t: 'text', h: 'Where your skills fit', key: "The system plans. Someone has to make sure what goes in is right and what comes out makes sense.", html: `
<div class="tablewrap"><table><thead><tr><th>In the planning system</th><th>What goes wrong</th><th>What you do about it</th><th>Chapter</th></tr></thead><tbody>
<tr><td><strong>Data loads</strong> from source systems</td><td>Missing items, duplicate records, dirty keys, a load that did not run</td><td>Reconcile source against loaded data; duplicate and orphan checks; check load times</td><td>4, 6</td></tr>
<tr><td><strong>Master data and parameters</strong> (lead time, safety stock)</td><td>A wrong setting produces a wrong recommendation</td><td>Query the parameters, compare with expected, test the change</td><td>6, 7</td></tr>
<tr><td><strong>Forecast</strong></td><td>Biased or inaccurate; promotions not reflected</td><td>Bias and WAPE, split by promo, item, site</td><td>7</td></tr>
<tr><td><strong>Replenishment output</strong></td><td>"Why did it not order?" "Why so much?"</td><td>Inventory position against reorder point; overdue receipts</td><td>7</td></tr>
<tr><td><strong>Reports for planners and customers</strong></td><td>A number on a screen or report looks wrong</td><td>Trace it back; extract to Excel; explain with evidence</td><td>6, 8, 9</td></tr>
</tbody></table></div>` },
        { t: 'text', h: 'Questions worth asking them', key: "Good questions show you understand the job.", html: `
<ul><li>Which data feeds into Maestro here, and how often do they load?</li>
<li>When a planner reports a wrong number, where does the investigation usually start: in Maestro, or in the source data?</li>
<li>How much of the role is configuring the system and how much is investigating data?</li>
<li>How does the team test a parameter or rule change before it goes live?</li></ul>` },
        { t: 'quiz', q: 'Which statement about a Maestro worksheet is closest to the truth?',
          options: ['It is a blank spreadsheet for typing data', 'It is a saved view of planning data with chosen columns, filters and calculations, much like a saved query', 'It is a what-if copy of the plan'], correct: 1,
          why: 'A worksheet presents data from the planning model through selected columns and filters. The what-if copy is a scenario.' },
        { t: 'quiz', q: 'What does concurrent planning mean?',
          options: ['Several planners can log in at once', 'Demand, supply and inventory plans share one model and update together when something changes', 'Plans are run one after another overnight'], correct: 1,
          why: 'It is the opposite of sequential planning, where each function plans in turn and passes the result on.' }
      ]
    }
  ],
  /* -------------------------------------------------------------------- mock */
  mock: {
    minutes: 30,
    intro: 'Seven SQL tasks and two Excel tasks, no hints, in the order an assessment tends to build: filter, total, join, missing data, calculation, investigation, a planning exception, then the spreadsheet. Say your reasoning out loud as you type. Check each answer only after you have committed to it.',
    tasks: [
      { id: 'mock-1', title: 'Filter and sort', prompt: "The Chicago team wants an order list for its daily review.\n\nFrom orders, return order_id, customer, and status for L01. Sort by order_date newest first, then order_id.",
        solution: `SELECT order_id, customer, status\nFROM orders\nWHERE location_id = 'L01'\nORDER BY order_date DESC, order_id;`, ordered: true,
        explain: 'Select, filter, sort. Two sort columns make the order unambiguous.' },
      { id: 'mock-2', title: 'Count by group', prompt: "A fulfillment lead wants a quick count of orders by status.\n\nFrom orders, return status and order_count. Count each order once and sort highest count first.",
        solution: `SELECT status, COUNT(*) AS order_count\nFROM orders\nGROUP BY status\nORDER BY order_count DESC;`, ordered: true,
        explain: 'orders has one row per order, so COUNT(*) is safe here.' },
      { id: 'mock-3', title: 'Find unmatched records', prompt: "A catalog validation report needs to flag order lines with unknown product codes.\n\nReturn line_id and product_id from order_lines when the product_id has no match in products.",
        solution: `SELECT order_lines.line_id, order_lines.product_id\nFROM order_lines\nLEFT JOIN products ON products.product_id = order_lines.product_id\nWHERE products.product_id IS NULL;`,
        explain: 'LEFT JOIN + IS NULL. One unknown code and one code with a leading space.' },
      { id: 'mock-4', title: 'Keep every row, with a condition', prompt: "Operations wants a center-by-center summary that includes centers with no orders to report.\n\nReturn location_name and total_ordered for all four locations. Sum qty_ordered on orders whose status is other than Cancelled. Show 0 for centers with no qualifying quantities. Sort by location_name.",
        solution: `SELECT locations.location_name,\n       ISNULL(SUM(order_lines.qty_ordered), 0) AS total_ordered\nFROM locations\nLEFT JOIN orders\n  ON orders.location_id = locations.location_id\n AND orders.status <> 'Cancelled'\nLEFT JOIN order_lines\n  ON order_lines.order_id = orders.order_id\nGROUP BY locations.location_name\nORDER BY locations.location_name;`, ordered: true,
        explain: "Start FROM the table you must keep. The Cancelled test goes in ON, because in WHERE it would drop Dallas. ISNULL turns Dallas's NULL total into 0." },
      { id: 'mock-5', title: 'Calculate with NULL in play', prompt: "A fulfillment lead wants to see which recorded shipments fell short.\n\nFrom order_lines, keep rows with qty_shipped below qty_ordered and a shipment quantity present. Return order_id, product_id, and short_qty (ordered minus shipped). Sort by order_id.",
        solution: `SELECT order_id, product_id,\n       qty_ordered - qty_shipped AS short_qty\nFROM order_lines\nWHERE qty_shipped < qty_ordered\nORDER BY order_id;`, ordered: true,
        explain: 'Unshipped lines hold NULL, and NULL < x is never true, so they drop out on their own. Say that out loud; it shows you thought about it.' },
      { id: 'mock-6', title: 'Investigate a mismatch', prompt: "The store says O1004 shipped, while the screen still shows Open. Support needs all cases like it.\n\nMatch orders to screen_orders by order_id. Where their statuses differ, return order_id, source_status, screen_status, and the screen synced_at timestamp.",
        solution: `SELECT orders.order_id,\n       orders.status AS source_status,\n       screen_orders.status AS screen_status,\n       screen_orders.synced_at\nFROM orders\nJOIN screen_orders ON screen_orders.order_id = orders.order_id\nWHERE orders.status <> screen_orders.status;`,
        explain: 'The older synced_at value is a clue. Check when the order shipped and whether its update was included in the sync.' },
      { id: 'mock-9', title: 'Planning exception', prompt: "A planner wants to know which stock positions cover less than one day of demand.\n\nFrom inventory, keep rows where on_hand is below daily_demand. Return location_id, product_id, on_hand, and daily_demand.",
        solution: `SELECT location_id, product_id, on_hand, daily_demand\nFROM inventory\nWHERE on_hand < daily_demand;`,
        explain: 'One item: L01 / P03, 50 on hand against 80 a day. Add what you would check next: its lead time (5 days) and whether anything is on order (nothing).' },
      { id: 'mock-7', title: 'Excel: conditional total', sheets: ['daily_plan'], prompt: "A planner needs one total for product P02 across all locations.\n\nIn Excel, use Plan to sum actual_units for P02 and enter the total units.",
        answerSql: `SELECT SUM(actual_units) FROM daily_plan WHERE product_id = 'P02'`, answer: 1190,
        solution: `=SUMIFS(Plan!F:F, Plan!D:D, "P02")`, explain: 'One condition, so SUMIF would also do. Say which rows it covers: six rows across L01 and L02.' },
      { id: 'mock-8', title: 'Excel: lookup and exceptions', sheets: ['daily_plan', 'products'], prompt: "A planner wants to know how many plan rows have a product code missing from the catalog.\n\nUse an exact-match lookup to bring Products names into Plan. Enter the count of plan rows whose product ID has no match.",
        answerSql: `SELECT COUNT(*) FROM daily_plan LEFT JOIN products ON products.product_id = daily_plan.product_id WHERE products.product_id IS NULL`, answer: 1,
        solution: `H2: =XLOOKUP(D2, Products!A:A, Products!B:B, "MISSING")     =COUNTIF(H:H, "MISSING")`, explain: 'One row, plan_id 18 with P99. In SQL this was LEFT JOIN + IS NULL.' }
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
    ['Join and keep every left row', `SELECT order_lines.line_id, products.product_name\nFROM order_lines\nLEFT JOIN products\n  ON products.product_id = order_lines.product_id;`],
    ['Records with no match', `SELECT order_lines.line_id, order_lines.product_id\nFROM order_lines\nLEFT JOIN products ON products.product_id = order_lines.product_id\nWHERE products.product_id IS NULL;`],
    ['Duplicate check', `SELECT order_id, product_id, COUNT(*) AS copies\nFROM order_lines\nGROUP BY order_id, product_id\nHAVING COUNT(*) > 1;`],
    ['Reconcile source against a copy', `WITH source_totals AS (\n  SELECT order_id, SUM(qty_ordered) AS source_qty\n  FROM order_lines GROUP BY order_id\n)\nSELECT screen_orders.order_id, source_totals.source_qty, screen_orders.total_qty\nFROM screen_orders\nJOIN source_totals ON source_totals.order_id = screen_orders.order_id\nWHERE source_totals.source_qty <> screen_orders.total_qty;`],
    ['Label rows / count by condition', `SELECT location_id,\n       SUM(CASE WHEN status = 'Open' THEN 1 ELSE 0 END) AS open_orders\nFROM orders\nGROUP BY location_id;`],
    ['Safe ratio', `SELECT ROUND(100.0 * SUM(qty_shipped) / NULLIF(SUM(qty_ordered), 0), 1) AS fill_pct\nFROM order_lines\nWHERE qty_shipped IS NOT NULL;`],
    ['One row per key (dedupe / latest)', `WITH ranked AS (\n  SELECT *, ROW_NUMBER() OVER (\n           PARTITION BY order_id, product_id ORDER BY line_id) AS rn\n  FROM order_lines\n)\nSELECT * FROM ranked WHERE rn = 1;`]
  ],
  excel: [
    ['Exact lookup (LEFT JOIN)', '=XLOOKUP(D2, Products!A:A, Products!B:B, "MISSING")'],
    ['Lookup in older Excel', '=IFERROR(VLOOKUP(D2, Products!A:F, 2, FALSE), "MISSING")'],
    ['Lookup that works everywhere', '=INDEX(Products!B:B, MATCH(D2, Products!A:A, 0))'],
    ['Conditional total (WHERE + SUM)', '=SUMIFS(Plan!E:E, Plan!C:C, "L01", Plan!G:G, 1)'],
    ['Conditional count', '=COUNTIFS(Plan!C:C, "L02", Plan!F:F, ">100")'],
    ['Clean a key', '=UPPER(TRIM(B2))'],
    ['Flag duplicates', '=COUNTIF(E:E, E2)   then filter for > 1'],
    ['Label rows (CASE)', '=IF(F2="", "Missing", IF(F2>E2, "Under-forecast", "OK"))'],
    ['Blank-safe difference', '=IF(F2="", "", F2-E2)'],
    ['Ratio across rows', '=SUMPRODUCT((F2:F25<>"")*ABS(F2:F25-E2:E25))/SUM(F2:F25)'],
    ['Lock a range when copying', '$A$2:$A$7  (F4 while editing)'],
    ['PivotTable (GROUP BY)', 'Insert → PivotTable. Rows = group, Values = Sum/Count, Filters = WHERE']
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
