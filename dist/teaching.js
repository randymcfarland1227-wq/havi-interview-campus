/* Expanded teaching: preserve dataset, lab IDs, stored progress and verified answers. */
(() => {
const e=s=>String(s??'NULL').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
const p=s=>`<p>${s}</p>`;
const t=(headers,rows,caption='')=>`${caption?`<p class="example-caption">${caption}</p>`:''}<div class="tablewrap teaching-table"><table><thead><tr>${headers.map(h=>`<th>${e(h)}</th>`).join('')}</tr></thead><tbody>${rows.map(r=>`<tr>${r.map(c=>`<td>${e(c)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const code=s=>`<pre class="code">${e(s)}</pre>`;
const note=s=>`<div class="callout">${s}</div>`;
const compare=rows=>t(['Choose this','When it answers the question','Familiar comparison'],rows);
const reasoning=(q,why,action)=>`<div class="reasoning"><div class="eyebrow">THINK LIKE THE ANALYST</div><p><strong>Question:</strong> ${q}</p><p><strong>Reasoning:</strong> ${why}</p><p><strong>What I would do:</strong> ${action}</p></div>`;
const steps=rows=>t(['SQL or formula','What it means in plain English'],rows);
const teach={};

teach.foundation={
 outcome:'Explain a table, a key and the meaning of a row; choose between filtering, joining, stacking and summarizing.',
 blocks:[
 ['Start with the work you already understand',
 p('Imagine a planner asks: <strong>“Which Chicago items sold more than we expected, and do we have enough stock to cover the next delivery?”</strong> You would not start by calculating every metric. You would locate the right files, check the dates, match product IDs and compare the numbers.')+
 p('SQL is a language for asking a database to do those same steps. A <strong>database</strong> holds related tables. A <strong>query</strong> is the written request you give it. The database returns an answer table called a <strong>result set</strong>.')+
 compare([['Excel','Small extracts, formulas and a report someone can inspect','Filter, XLOOKUP, SUMIFS, PivotTable'],['Alteryx','Repeatable data preparation across sources','Input Data → Filter → Join → Summarize'],['SQL','Ask for the relevant records directly from database tables','SELECT → WHERE → JOIN → GROUP BY']])+
 note('You are learning a different way to express analysis you already do. In this campus, SELECT queries read the data and return results; they do not edit the source tables.')],
 ['Read a table before trying to query it',
 p('Think of <code>daily_plan</code> as a worksheet tab. The headings are <strong>columns</strong>; each horizontal record is a <strong>row</strong>. The table name tells SQL where to look; the column names tell it which information you want.')+
 t(['plan_id','plan_date','location_id','product_id','forecast_units','actual_units'],[[1,'2026-11-01','L01','P01',100,120],[7,'2026-11-02','L01','P01',110,140],[18,'2026-11-03','L02','P99',50,55]],'Three selected rows from daily_plan')+
 p('<strong>Forecast</strong> means expected demand; <strong>actual</strong> means observed demand. In row 1, we expected 100 units and observed 120: demand was 20 above forecast. L01 means Chicago DC. P01 means Burger buns. The IDs are short codes; the descriptive names live in other tables.')+
 p('A field can store text, a number, a date or a missing value. P01 is text even though part of it contains digits. Actual demand is numeric. The lab stores dates in year-month-day form so they sort consistently.')],
 ['Why does the same product appear more than once?',
 p('<strong>Grain</strong> means what one row represents. Say it as an ordinary sentence: “One row is one product at one location on one day.” This tells you which repeats are normal.')+
 t(['Date','Location','Product','Forecast'],[['Nov 1','Chicago','Buns',100],['Nov 2','Chicago','Buns',110],['Nov 1','Denver','Buns',90]],'Same product, three different planning records')+
 p('These are not three copies of the same record. They represent different days or places. To identify the business record, we need <strong>date + location + product</strong>. A key made of several columns is a <strong>composite key</strong>.')+
 p('<code>plan_id</code> is a separate unique row identifier. <code>product_id</code> is unique in the product master, but repeats in the daily plan. Uniqueness depends on the table, not just the column name.')+
 reasoning('Could I match stock to a plan using only product_id?','The same product can be stocked in Chicago and Denver, on different dates. Product alone does not tell me which stock record belongs to the plan.','Match product, location and the intended snapshot date.')],
 ['Choose the operation from the question',
 compare([['WHERE / filter','Keep Chicago rows; exclude other locations','Excel Filter; Alteryx Filter'],['SELECT / choose columns','Show only product ID, forecast and actual','Choose columns for an export; Alteryx Select'],['JOIN / match tables','Attach product names to planning records','XLOOKUP; Alteryx Join'],['UNION ALL / stack rows','Append two monthly files with matching columns','Power Query Append; Alteryx Union'],['GROUP BY / summarize','One total per distribution center','PivotTable; Alteryx Summarize'],['ORDER BY / sort','Show the largest forecast first','Excel Sort; Alteryx Sort']])+
 p('If an interviewer says “join the rows,” clarify whether they mean <strong>match related records</strong> or <strong>append datasets</strong>. Those produce different shapes of output.')+
 note('Ask yourself: Am I removing rows, adding descriptive columns, stacking new rows, or reducing records to totals? That question often identifies the SQL operation.')],
 ['Your first query, without unexplained punctuation',
 code('SELECT product_id, forecast_units\nFROM daily_plan\nWHERE plan_id = 1;')+
 steps([['SELECT product_id, forecast_units','Show these two columns. The comma separates requested columns.'],['FROM daily_plan','Read the table named daily_plan.'],['WHERE plan_id = 1','Keep the row whose plan_id equals the number 1.'],[';','The semicolon ends the statement.']])+
 t(['product_id','forecast_units'],[['P01',100]],'The returned result')+
 p('SQL keywords are usually capitalized for readability. Spaces and line breaks make the query easier to read; the database does not require this exact layout. A comment beginning with <code>--</code> explains the query to a person and is ignored until the next line.')+
 note('Your learning routine: read one idea → inspect the worked example → run the walkthrough → try the exercise. You do not need to memorize a full query yet.')]
 ],
 walkthrough:[
  {title:'Read the product table',why:'We first inspect the available records. SELECT * means all columns, which is useful for exploration.',sql:'SELECT * FROM products;',columns:['product_id','product_name','category','unit_cost','lead_time_days','safety_stock'],rows:window.CAMPUS_DATA.products.rows},
  {title:'Request just the columns we need',why:'Choosing two columns changes the output width, not the number of source products.',sql:'SELECT product_id, product_name FROM products;',columns:['product_id','product_name'],rows:window.CAMPUS_DATA.products.rows.map(r=>r.slice(0,2))},
  {title:'Find one known product',why:'WHERE narrows the rows. P01 is text, so the value goes in single quotes. The source still contains all six products.',sql:"SELECT product_id, product_name\nFROM products\nWHERE product_id = 'P01';",columns:['product_id','product_name'],rows:[['P01','Burger buns']]}
 ]};

teach.select={
 outcome:'Translate a plain-English request into SELECT, FROM, WHERE and ORDER BY, and explain the output.',
 blocks:[
 ['Begin with the question, not the syntax',
 reasoning('Show me our frozen items, with the most expensive first.','The product master has the name, category and cost. I need individual products, so I do not need grouping or a join.','Choose the product columns, keep category Frozen, then sort cost from highest to lowest.')+
 t(['product_id','product_name','category','unit_cost'],[['P01','Burger buns','Bakery',.35],['P02','Potato fries','Frozen',.8],['P04','Chicken portions','Frozen',1.2]],'Selected source rows from products')+
 code("SELECT product_id, product_name, unit_cost\nFROM products\nWHERE category = 'Frozen'\nORDER BY unit_cost DESC;")+
 t(['product_id','product_name','unit_cost'],[['P04','Chicken portions',1.2],['P02','Potato fries',.8]],'Two rows qualify; the larger cost comes first')],
 ['Read the query one line at a time',
 steps([['SELECT product_id, product_name, unit_cost','Return these three columns, in this order.'],['FROM products','The values come from the product master.'],["WHERE category = 'Frozen'","Test each row. Keep it only if its category equals Frozen."],['ORDER BY unit_cost DESC','Sort the remaining rows by cost, highest first.']])+
 p('<code>ASC</code> means ascending, or smallest to largest; it is the default. <code>DESC</code> means descending. Without ORDER BY, SQL does not promise a useful or consistent row order.')+
 p('Notice that category can be used to filter without appearing in SELECT. The database reads the source table, applies the row condition, and then returns the columns requested.')+
 note('SQL’s written order starts SELECT, but your reasoning often starts FROM: Which table contains the information? Then decide the rows and columns you need.')],
 ['Use comparisons deliberately',
 t(['Expression','Meaning','Planning example'],[["location_id = 'L01'",'Equals','Chicago only'],['actual_units > forecast_units','Greater than','Demand exceeded forecast'],['actual_units <= forecast_units','Less than or equal','Demand did not exceed forecast'],["category <> 'Frozen'",'Not equal','Everything except Frozen, excluding unknown categories'],["location_id IN ('L01','L02')",'Matches any listed value','Chicago or Denver'],["product_name LIKE 'Burger%'",'Starts with this text pattern','Names beginning Burger'],['actual_units IS NULL','Value is missing','Feed has not reported actuals']])+
 p('Put text in single quotes. Compare numeric quantities without quotes. <code>%</code> inside a LIKE pattern means any sequence of characters; it is not a percentage calculation.')+
 p('Use <code>IS NOT NULL</code> to require a reported value. A measured zero passes that check.')],
 ['AND and OR: write the business rule first',
 p('<strong>AND</strong> requires every condition. <strong>OR</strong> requires at least one. Parentheses make combined conditions unambiguous.')+
 code("WHERE (location_id = 'L01' OR location_id = 'L02')\n  AND promo = 1")+
 p('This means: Chicago or Denver, but only their promotional rows. Without the parentheses, AND takes priority, which can accidentally include all Chicago rows even when promo is 0.')+
 t(['Location','Promo?','Keep?'],[['L01',0,'No — not promotional'],['L01',1,'Yes'],['L02',1,'Yes'],['L03',1,'No — not one of the selected centers']])+
 reasoning('Which Chicago promotional rows exceeded forecast?','Three tests must hold on the same row: location L01, promo 1, and actual greater than forecast.','Connect all three tests with AND.')],
 ['Date ranges and calculated columns',
 p('To cover November 2 and 3, start at November 2 and stop before November 4. The upper boundary is excluded. This pattern also handles timestamp fields without accidentally excluding late-night records.')+
 code("SELECT plan_id, actual_units - forecast_units AS variance_units\nFROM daily_plan\nWHERE plan_date >= '2026-11-02'\n  AND plan_date < '2026-11-04'\nORDER BY plan_id;")+
 p('<code>AS variance_units</code> labels the calculated result. It does not rename a source column or change the database. In this course, positive actual-minus-forecast means demand was higher than expected.')+
 p('Dates in these examples are ISO-formatted text. The employer may use a proper DATE or timestamp type; ask which dialect and time zone the exercise uses.')],
 ['Use it, avoid it, explain it',
 compare([['WHERE','You want fewer individual source records','Filter rows in Excel'],['ORDER BY','You want the results in a useful sequence','Sort an Excel range'],['GROUP BY later','You want a total per item, rather than each record','Build a PivotTable'],['LIMIT 5 in this lab','You want a small sample to inspect','Preview the first five records']])+
 p('SQL Server often writes <code>SELECT TOP (5)</code> instead of a trailing LIMIT. The logic is the same, but the syntax differs. HAVI has not confirmed its platform.')+
 note('Interview explanation: “I selected the three output columns, filtered the relevant category, and sorted the matching records by cost. This query reports product records; it does not aggregate them.”')]
 ],
 walkthrough:[
 {title:'Choose the output',why:'Get product IDs, names and costs. We still have all six products.',sql:'SELECT product_id, product_name, unit_cost FROM products;',columns:['product_id','product_name','unit_cost'],rows:window.CAMPUS_DATA.products.rows.map(r=>[r[0],r[1],r[3]])},
 {title:'Keep the right category',why:'WHERE checks category on each source row. Only P02 and P04 match.',sql:"SELECT product_id, product_name, unit_cost\nFROM products\nWHERE category = 'Frozen';",columns:['product_id','product_name','unit_cost'],rows:[['P02','Potato fries',.8],['P04','Chicken portions',1.2]]},
 {title:'Set the requested order',why:'DESC puts 1.20 ahead of 0.80. Sorting changes presentation, not which records qualify.',sql:"SELECT product_id, product_name, unit_cost\nFROM products\nWHERE category = 'Frozen'\nORDER BY unit_cost DESC;",columns:['product_id','product_name','unit_cost'],rows:[['P04','Chicken portions',1.2],['P02','Potato fries',.8]]}
 ]};

teach.joins={
 outcome:'Choose INNER or LEFT JOIN from the business need, match complete keys, and predict the result before running it.',
 blocks:[
 ['Why would you need a join?',
 p('A planning record has product_id and demand numbers. The product master has the readable product name. Keeping the name in one master table avoids typing and maintaining it in every planning row. A join brings the attributes together when you need a report.')+
 `<div class="before-after">${t(['plan_id','product_id','forecast_units'],[[1,'P01',100],[2,'P02',200],[18,'P99',50]],'LEFT SOURCE: selected planning rows')}${t(['product_id','product_name'],[['P01','Burger buns'],['P02','Potato fries']],'RIGHT SOURCE: relevant master records')}</div>`+
 p('Read the match in ordinary language: “For each planning row, find product records with the same product_id. Add the product_name from each matching record.” P99 has no matching master record.')+
 note('A join does not glue adjacent spreadsheet rows together. Row position does not matter. Matching key values do.')],
 ['Aliases and ON: remove the mystery from the dots',
 code('SELECT d.plan_id, d.product_id, p.product_name\nFROM daily_plan AS d\nLEFT JOIN products AS p\n  ON d.product_id = p.product_id\nWHERE d.plan_id IN (1, 2, 18)\nORDER BY d.plan_id;')+
 steps([['daily_plan AS d','Use d as a short nickname for daily_plan in this query.'],['products AS p','Use p as a short nickname for products.'],['d.product_id','The product_id column from daily_plan. The dot means “from this table.”'],['p.product_name','The product_name column from products.'],['ON d.product_id = p.product_id','Pair rows when these two IDs have equal values.'],['WHERE d.plan_id IN (1, 2, 18)','Use three known plan rows so we can inspect the matching by hand.']])+
 p('SQL also allows <code>FROM daily_plan d</code> without AS. The table nickname is still d. Aliases only exist inside this statement.')],
 ['INNER JOIN: keep only matched pairs',
 p('Choose INNER JOIN when the report should include only records with a matching product. If the product master has no match, that left record is absent from the result.')+
 t(['plan_id','product_id','product_name'],[[1,'P01','Burger buns'],[2,'P02','Potato fries']],'INNER JOIN output for the same three planning rows')+
 p('There are two output rows, not three. P99 did not become blank; its entire planning record is missing from the result. This is fine for a deliberately matched-only report, but dangerous if the task is to audit missing mappings.')+
 reasoning('Show matched planning records for recognized products.','An unmatched product is outside this explicitly defined report.','Use INNER JOIN, and separately count or report excluded records if completeness matters.')],
 ['LEFT JOIN: keep all rows from the left source',
 p('Choose LEFT JOIN when the planning table defines the population you must preserve. Rows with no product match remain, and the added product fields are NULL.')+
 t(['plan_id','product_id','product_name'],[[1,'P01','Burger buns'],[2,'P02','Potato fries'],[18,'P99',null]],'LEFT JOIN output for the same three planning rows')+
 p('“Left” means the table written after FROM, not a physical position on the screen. Here it is daily_plan. Writing FROM products LEFT JOIN daily_plan asks a different question: keep every product, whether or not it has a plan.')+
 note('INNER gives the two matches. LEFT gives the same two matches plus the unmatched planning record. Switch between both in the walkthrough and watch the output.')],
 ['Turn an unmatched row into a useful exception list',
 code('SELECT d.plan_id, d.product_id\nFROM daily_plan d\nLEFT JOIN products p ON d.product_id = p.product_id\nWHERE p.product_id IS NULL;')+
 p('The LEFT JOIN first preserves all planning rows. Then WHERE keeps only rows with no product master key. Since a real product master key cannot be NULL, its absence tells us no match was found.')+
 t(['plan_id','product_id'],[[18,'P99']],'Only the unmapped record remains')+
 p('Why not test d.product_id IS NULL? P99 is present in the planning record. The missing thing is a match on the right, so inspect the right-side key.')+
 reasoning('Which planning records might be using invalid or unconfigured products?','Dropping unmatched records would hide the issue.','Keep the plans, identify missing master keys, confirm the mapping and feed timing, then resolve or escalate.')],
 ['Use every field needed for the match',
 p('Product P01 exists in Chicago and Denver. Inventory can also change every day. Joining on product alone could attach Denver stock to a Chicago plan or repeat a plan for multiple snapshots.')+
 t(['Plan needs','Correct inventory match','Wrong match'],[['Nov 4 / Chicago / P01','Nov 4 / Chicago / P01','Nov 4 / Denver / P01'],['Nov 4 / Chicago / P01','Nov 4 / Chicago / P01','Nov 3 / Chicago / P01']])+
 code('ON d.product_id = i.product_id\nAND d.location_id = i.location_id\nAND d.plan_date = i.snapshot_date')+
 p('Three conditions are needed because three attributes define the intended inventory record. Matching product alone is a syntax-valid query with incorrect business logic.')+
 note('A many-to-one enrichment should preserve the source row count when the right-side key is unique. The next module shows why a non-unique key inflates totals.')],
 ['How to choose and how to explain it',
 compare([['INNER JOIN','Only matched pairs belong in this result','Alteryx Join J output'],['LEFT JOIN','Keep every row in the primary dataset','Alteryx J plus unmatched-left records with blank right fields'],['XLOOKUP','Attach one result from a lookup table','Returns the first match; it does not reveal all duplicated matches'],['UNION ALL','Stack another dataset underneath this one','Alteryx Union; Power Query Append']])+
 p('A common mistake is <code>LEFT JOIN ... WHERE p.category = \'Frozen\'</code> when you still want unmatched plans. That WHERE condition removes NULL matches. Put the Frozen condition in ON if you want every plan retained but only Frozen attributes matched.')+
 note('Interview explanation: “I used a LEFT JOIN because the planning rows define the population. I matched the product key, checked that it is unique in the master, and kept unmatched IDs visible as data-quality exceptions.”')]
 ],
 walkthrough:[
 {title:'Inspect three plans',why:'These are the exact rows we will follow. Notice that P99 exists in the plan, but not in the product master.',sql:'SELECT plan_id, product_id, forecast_units\nFROM daily_plan\nWHERE plan_id IN (1, 2, 18)\nORDER BY plan_id;',columns:['plan_id','product_id','forecast_units'],rows:[[1,'P01',100],[2,'P02',200],[18,'P99',50]]},
 {title:'Keep matches with INNER JOIN',why:'P01 matches Burger buns; P02 matches Potato fries. P99 has no partner, so the plan 18 record disappears.',sql:'SELECT d.plan_id, d.product_id, p.product_name\nFROM daily_plan d\nINNER JOIN products p ON d.product_id = p.product_id\nWHERE d.plan_id IN (1, 2, 18)\nORDER BY d.plan_id;',columns:['plan_id','product_id','product_name'],rows:[[1,'P01','Burger buns'],[2,'P02','Potato fries']]},
 {title:'Keep all plans with LEFT JOIN',why:'Now the left planning population is preserved. Plan 18 remains; product_name is NULL because there was no match.',sql:'SELECT d.plan_id, d.product_id, p.product_name\nFROM daily_plan d\nLEFT JOIN products p ON d.product_id = p.product_id\nWHERE d.plan_id IN (1, 2, 18)\nORDER BY d.plan_id;',columns:['plan_id','product_id','product_name'],rows:[[1,'P01','Burger buns'],[2,'P02','Potato fries'],[18,'P99',null]]},
 {title:'Keep only the missing match',why:'Filtering the right-hand key to NULL leaves only the record that needs master-data investigation. This is sometimes called an anti-join pattern.',sql:'SELECT d.plan_id, d.product_id\nFROM daily_plan d\nLEFT JOIN products p ON d.product_id = p.product_id\nWHERE p.product_id IS NULL;',columns:['plan_id','product_id'],rows:[[18,'P99']]}
 ]};

teach.quality={outcome:'Explain why a join can multiply rows and find duplicates without hiding them with DISTINCT.',blocks:[
 ['A result can be wrong even when SQL runs',
 p('Suppose you join one Chicago/P01 inventory row to its receipts. There are two matching receipts: 50 units and 75 units. SQL returns every matching pair, so the inventory row appears twice.')+
 t(['Location','Product','on_hand','receipt_id','received_units'],[['L01','P01',80,1,50],['L01','P01',80,2,75]],'One stock snapshot, two matching receipts')+
 p('Summing on_hand now gives 160 even though stock is 80. The receipt total of 125 is valid; the repeated stock total is not. The values belong to different levels of detail.')+
 note('In Excel, XLOOKUP might show just the first receipt, hiding the second. In SQL, the join exposes both matches and repeats the left fields. Neither behavior means you can skip checking key uniqueness.')],
 ['Check counts at the key you intend to join on',
 code('SELECT location_id, product_id, COUNT(*) AS receipt_count\nFROM receipts\nGROUP BY location_id, product_id\nHAVING COUNT(*) > 1;')+
 steps([['GROUP BY location_id, product_id','Put receipts into one bucket for each location/product pair.'],['COUNT(*)','Count how many receipt rows are in each bucket.'],['HAVING COUNT(*) > 1','Show buckets where the intended join key repeats.']])+
 t(['location_id','product_id','receipt_count'],[['L01','P01',2]],'This pair has two matches')+
 p('Multiple receipts are not necessarily bad source data. They are normal receipt-level detail. They become a problem if you join them to stock and treat every joined row as a new stock record.')],
 ['Normalize a dirty key and inspect the result',
 t(['raw_product_id','After TRIM','After UPPER(TRIM(...))'],[[' p01 ','p01','P01'],['p03','p03','P03'],['P05 ','P05','P05']])+
 code('SELECT UPPER(TRIM(raw_product_id)) AS clean_id,\n       COUNT(*) AS row_count\nFROM product_feed\nGROUP BY UPPER(TRIM(raw_product_id))\nHAVING COUNT(*) > 1;')+
 p('TRIM removes surrounding spaces. UPPER normalizes case. Use this when IDs are intended to be case-insensitive. After cleaning, P02 still occurs twice: formatting and duplicate records are separate issues.')+
 p('Do not automatically remove one of the P02 rows. Determine which version is authoritative, whether a timestamp is needed, and whether both records represent legitimate detail.')],
 ['DISTINCT versus fixing the join',
 compare([['DISTINCT','You deliberately want unique combinations of selected result columns','Excel unique list'],['GROUP BY','You want a summary at a chosen business grain','PivotTable'],['Fix the join keys','Rows matched the wrong location or date','Correct the lookup conditions'],['Aggregate the right table first','Several detail rows must become one summary before joining','Summarize receipts, then lookup the totals']])+
 p('DISTINCT removes identical output rows. It does not know which business record is correct. If receipt IDs differ, the two duplicated stock rows are not even identical, so DISTINCT may change nothing.')+
 note('Interview explanation: “I would compare the source and joined row counts and test the right-side key for multiple matches. I would fix the grain before trusting any totals.”')]
 ],walkthrough:[
 {title:'Inspect the stock record',why:'There is one L01/P01 inventory snapshot with 80 units on hand.',sql:"SELECT location_id, product_id, on_hand\nFROM inventory\nWHERE location_id='L01' AND product_id='P01';",columns:['location_id','product_id','on_hand'],rows:[['L01','P01',80]]},
 {title:'See the one-to-many join',why:'The same stock record matches two receipts. Read the repeated 80 as the same stock value appearing twice, not two piles of stock.',sql:"SELECT i.location_id, i.product_id, i.on_hand, r.receipt_id, r.received_units\nFROM inventory i JOIN receipts r\n ON i.location_id=r.location_id AND i.product_id=r.product_id\nWHERE i.location_id='L01' AND i.product_id='P01'\nORDER BY r.receipt_id;",columns:['location_id','product_id','on_hand','receipt_id','received_units'],rows:[['L01','P01',80,1,50],['L01','P01',80,2,75]]},
 {title:'Inspect the duplicate source key',why:'This separate source-quality check finds P02 twice after normalization. The aggregate module explains the grouping syntax in more depth.',sql:'SELECT UPPER(TRIM(raw_product_id)) AS clean_id, COUNT(*) AS row_count\nFROM product_feed\nGROUP BY UPPER(TRIM(raw_product_id))\nHAVING COUNT(*) > 1;',columns:['clean_id','row_count'],rows:[['P02',2]]}
 ]};

teach.aggregate={outcome:'Use GROUP BY to control output grain; distinguish COUNT(*) from COUNT(column), and WHERE from HAVING.',blocks:[
 ['Many source rows become one summary row',
 p('A planner wants one line per location, not every daily product record. Group the records by location and add the quantities inside each group. That is the same decision you make when building a PivotTable.')+
 t(['plan_id','location_id','forecast_units'],[[1,'L01',100],[2,'L01',200],[4,'L02',90]],'A tiny slice: plans 1, 2 and 4')+
 code('SELECT location_id, SUM(forecast_units) AS forecast_total\nFROM daily_plan\nWHERE plan_id IN (1,2,4)\nGROUP BY location_id\nORDER BY location_id;')+
 t(['location_id','forecast_total'],[['L01',300],['L02',90]],'L01 gets one row: 100 + 200. L02 gets one row: 90.')+
 p('The output grain is now one row per location. You cannot treat it as one row per plan anymore. The result has no individual plan_id because several plan IDs contribute to each total.')],
 ['Why GROUP BY needs the selected labels',
 steps([['SELECT location_id','Return the group label.'],['SUM(forecast_units) AS forecast_total','Calculate a total for each group.'],['GROUP BY location_id','Build the groups using the same label.']])+
 p('If you also select product_id, ask what one output row should mean. For one row per location/product, add product_id to GROUP BY. For one row per location only, leave individual product_id out.')+
 t(['Group by','Output grain','Excel PivotTable Rows'],[['location_id','One row per center','location_id'],['product_id','One row per product','product_id'],['location_id, product_id','One row per center/product combination','location_id, then product_id']])+
 note('Do not mix detail columns and totals unless you can explain which group each detail value represents. Portable SQL includes every non-aggregated selected column in GROUP BY.')],
 ['Choose the right aggregate',
 t(['Function','Question answered','Missing-value behavior'],[['SUM(actual_units)','How many units in total?','Ignores NULL'],['AVG(actual_units)','What is the average reported quantity?','Ignores NULL; zero is included'],['COUNT(*)','How many records?','Counts every row'],['COUNT(actual_units)','How many actual values were reported?','Skips NULL; counts zero'],['COUNT(DISTINCT product_id)','How many different product IDs?','Counts unique non-null values'],['MIN(...) / MAX(...)','Smallest / largest value?','Ignores NULL']])+
 t(['plan_id','actual_units'],[[16,null],[17,0],[18,55]],'Three records: two values are reported')+
 p('For these three rows: COUNT(*) = 3, COUNT(actual_units) = 2, SUM(actual_units) = 55 and AVG(actual_units) = 27.5. Treating missing as zero would change the average to 18.33 and tell a different story.')],
 ['WHERE filters records; HAVING filters summaries',
 reasoning('Which locations have more than 100 forecast units among plans 1, 2 and 4?','First choose the three source records. Next total each center. Only then can we know whether the center total exceeds 100.','Use WHERE for the record selection and HAVING for the group total.')+
 code('SELECT location_id, SUM(forecast_units) AS forecast_total\nFROM daily_plan\nWHERE plan_id IN (1,2,4)\nGROUP BY location_id\nHAVING SUM(forecast_units) > 100\nORDER BY location_id;')+
 t(['location_id','forecast_total'],[['L01',300]],'L02 totals 90, so HAVING removes its summary row')+
 p('WHERE forecast_units > 100 would ask a different question: discard individual small forecasts before totaling. In the tiny example, that would discard the 100-unit row and leave an L01 total of 200.')],
 ['Validate what your total includes',
 p('In the full dataset, L03 has 685 forecast units but only 520 known actual units. One actual is missing. A report that labels the difference as pure forecast error would confuse missing data with demand performance.')+
 p('Add a coverage count or filter both forecast and actual to the same known-actual rows. State your choice. For a source-control report, keep the full forecast total and show the incomplete actual count. For forecast-error metrics, use comparable rows with reported actuals.')+
 note('Interview explanation: “I grouped by the requested reporting grain and used SUM for the units. I also counted reported actuals, because a total can look reasonable while one input feed is missing.”')]
 ],walkthrough:[
 {title:'Look at the detail rows',why:'The tiny sample has three records but only two location groups.',sql:'SELECT plan_id, location_id, forecast_units FROM daily_plan\nWHERE plan_id IN (1,2,4) ORDER BY plan_id;',columns:['plan_id','location_id','forecast_units'],rows:[[1,'L01',100],[2,'L01',200],[4,'L02',90]]},
 {title:'Collapse into location totals',why:'L01 combines two records; L02 has one. The result now describes centers, not individual plans.',sql:'SELECT location_id, SUM(forecast_units) AS forecast_total\nFROM daily_plan WHERE plan_id IN (1,2,4)\nGROUP BY location_id ORDER BY location_id;',columns:['location_id','forecast_total'],rows:[['L01',300],['L02',90]]},
 {title:'Keep only large totals',why:'HAVING tests the calculated group totals. Only L01 is above 100.',sql:'SELECT location_id, SUM(forecast_units) AS forecast_total\nFROM daily_plan WHERE plan_id IN (1,2,4)\nGROUP BY location_id\nHAVING SUM(forecast_units)>100 ORDER BY location_id;',columns:['location_id','forecast_total'],rows:[['L01',300]]}
 ]};

teach.functions={outcome:'Use CASE for business rules and handle missing observations, zero demand and percentages correctly.',blocks:[
 ['NULL, zero and empty text mean different things',
 t(['Value','What it means','Planning implication'],[['NULL','We do not know the actual quantity','Check whether the feed is missing'],[0,'The observed quantity is zero','Could be zero demand or a business exception'],["''",'An empty text string','May need source cleanup; not a numeric zero']])+
 p('SQL uses NULL for unknown or absent data. Comparing unknown to 0 or to another value does not evaluate as true. To find it, use IS NULL. To require known values, use IS NOT NULL.')+
 p('COALESCE(actual_units,0) says, “If the actual is missing, treat it as zero.” That is a business assumption. Use it when absence is defined as zero, such as a complete receipt extract with no matching receipt. Avoid it when a demand feed is merely late.')+
 note('In our data, plan 16 has a missing actual; plan 17 has a measured zero. They should not receive the same label or treatment.')],
 ['CASE is SQL’s version of IF / IFS',
 code("SELECT plan_id,\n CASE WHEN actual_units IS NULL THEN 'Missing'\n      WHEN actual_units > forecast_units THEN 'Underforecast'\n      WHEN actual_units < forecast_units THEN 'Overforecast'\n      ELSE 'On target' END AS status\nFROM daily_plan\nWHERE plan_id IN (16,17,18)\nORDER BY plan_id;")+
 steps([['CASE','Begin choosing a result based on conditions.'],["WHEN condition THEN 'Label'",'Use this label for the first condition that is true.'],['ELSE','Use this result if none of the earlier conditions matched.'],['END AS status','Finish the rule and name the output column status.']])+
 t(['plan_id','forecast','actual','status'],[[16,140,null,'Missing'],[17,70,0,'Overforecast'],[18,50,55,'Underforecast']])+
 p('Evaluate the missing case first. Then compare actual to forecast. Underforecast means the forecast was too low, so actual is greater than forecast.')],
 ['Ratios: say the units before dividing',
 p('Inventory cover asks: how many days could the current stock support at the assumed daily demand? Divide units on hand by units per day. The units cancel and leave days.')+
 t(['on_hand','daily_demand','Calculation','Interpretation'],[[50,80,'50 / 80 = 0.625','Less than one day of cover'],[120,30,'120 / 30 = 4','Four days of cover'],[0,0,'0 / 0 is undefined','Review zero-demand treatment']])+
 code('SELECT location_id, product_id,\n ROUND(1.0 * on_hand / NULLIF(daily_demand,0), 2) AS days_of_cover\nFROM inventory;')+
 p('NULLIF(daily_demand,0) substitutes NULL if demand is zero. That prevents an undefined denominator from masquerading as a useful number. The 1.0 asks for decimal arithmetic. ROUND(...,2) keeps two decimal places.')+
 note('Reporting 0.625 as 62.5% would be a unit error. It is 0.625 days, not a percentage.')],
 ['Forecast error: make the comparison fair',
 t(['Forecast','Actual','actual − forecast','Absolute error'],[[100,120,20,20],[200,180,-20,20]])+
 p('The signed errors cancel to 0, but the total absolute error is 40. Those answer different questions. Signed variance describes direction; absolute error describes magnitude.')+
 p('<strong>WAPE</strong> = sum of absolute errors / sum of actuals. In this tiny example: 40 / 300 = 13.33%. Do not average 20/120 and 20/180; that gives a different weighting. If actuals are missing, exclude the same rows from both sides.')+
 p('<strong>Bias convention here</strong> = sum(actual − forecast) / sum(actual). Positive means underforecast. Some companies reverse the sign or use a different denominator; confirm their definition.')+
 note('For the interview sprint, prioritize CASE and NULL first. Read WAPE as an application of SUM and safe division; you do not need an advanced forecasting course.')],
 ['Date checks and likely mistakes',
 p('A completed receipt is late when received_date is after expected_date. An open receipt needs a separate rule: it is overdue only if expected_date is before the agreed as-of date and nothing has been received.')+
 code("SELECT receipt_id, product_id\nFROM receipts\nWHERE received_date IS NOT NULL\n  AND received_date > expected_date;")+
 compare([['IS NULL','Find a missing value','Do not use = NULL'],['NULLIF(denominator,0)','Avoid division by zero','An IF check around a denominator'],['COALESCE(value,0)','Replace missing with zero when justified','A deliberate blank-handling rule'],['CASE','Turn conditions into labels','IF/IFS'],['ROUND(value,2)','Present a decimal consistently','Excel ROUND']])+
 note('Interview explanation: “I separated missing input data from measured zero, applied the business rule with CASE, and protected the denominator so the ratio remains meaningful.”')]
 ],walkthrough:[
 {title:'Inspect the three observations',why:'The first actual is missing, the second is zero, and the third is higher than forecast.',sql:'SELECT plan_id, forecast_units, actual_units FROM daily_plan\nWHERE plan_id IN (16,17,18) ORDER BY plan_id;',columns:['plan_id','forecast_units','actual_units'],rows:[[16,140,null],[17,70,0],[18,50,55]]},
 {title:'Label the observations',why:'CASE maps each condition to a useful business label. Missing comes before the numeric comparisons.',sql:"SELECT plan_id,\n CASE WHEN actual_units IS NULL THEN 'Missing'\n      WHEN actual_units > forecast_units THEN 'Underforecast'\n      WHEN actual_units < forecast_units THEN 'Overforecast'\n      ELSE 'On target' END AS status\nFROM daily_plan WHERE plan_id IN (16,17,18) ORDER BY plan_id;",columns:['plan_id','status'],rows:[[16,'Missing'],[17,'Overforecast'],[18,'Underforecast']]}
 ]};

teach.analysis={outcome:'Combine the basics into a readable investigation; use a CTE only when it makes the steps clearer.',blocks:[
 ['Turn the request into a plan before coding',
 reasoning('Compare forecast error across locations.','We need a location summary, comparable actuals and forecasts, a clear error definition, and a way to flag incomplete inputs.','Inspect coverage → keep reported actuals for the metric → group by location → calculate WAPE → check exceptions before explaining the ranking.')+
 p('We are not trying to learn every planning model. We are practicing a common analyst workflow: pull the right data, validate it, calculate a defensible summary and suggest what to investigate next.')+
 p('Use a plain SELECT when it is enough. The task does not earn extra credit simply because the query is more complicated.')],
 ['A CTE is a named intermediate result',
 code('WITH reported_plan AS (\n SELECT location_id, forecast_units, actual_units\n FROM daily_plan\n WHERE actual_units IS NOT NULL\n)\nSELECT location_id, SUM(actual_units-forecast_units) AS variance_units\nFROM reported_plan\nGROUP BY location_id;')+
 steps([['WITH reported_plan AS (...)','Give the inner SELECT result the temporary name reported_plan.'],['Inner WHERE','Keep rows whose actuals are reported.'],['Final FROM reported_plan','Analyze that prepared result as if it were a table.']])+
 p('The name exists only for this statement. It is like an intermediate Alteryx stream or a named Power Query step. A CTE can make a multi-step query readable; it is not automatically faster.')+
 p('For joins with multiple receipts, use a CTE to group receipts by location/product first. Then join the summary to the stock snapshot. That avoids repeating stock values.')],
 ['Explain evidence, implication and next action separately',
 t(['Part of the answer','Example'],[['Evidence','L01 promotional actual demand exceeds forecast by 190 units.'],['Validation','I checked the product keys, scope and totals against the extract.'],['Implication','This may create pressure on replenishment during the promotion.'],['Hypothesis to test','The promotional setup or input timing might need review.'],['Next action','Confirm the promo assumptions and inbound timing with the planner; test and document a change if warranted.']])+
 p('A difference is not a root cause. Do not say “the promo parameter is wrong” just because the promo-period actual is higher. Investigate feed quality, dates, units, location scope and settings before reaching that conclusion.')+
 note('You can demonstrate sound analyst reasoning before becoming fluent in every SQL function. Narrate your assumptions and validate the output.')]
 ],walkthrough:[
 {title:'Filter to comparable records',why:'This is the intermediate result. We exclude one missing actual, preserving measured zero.',sql:'SELECT plan_id, location_id, forecast_units, actual_units\nFROM daily_plan WHERE actual_units IS NOT NULL\nORDER BY plan_id LIMIT 5;',columns:['plan_id','location_id','forecast_units','actual_units'],rows:[[1,'L01',100,120],[2,'L01',200,180],[3,'L01',300,310],[4,'L02',90,100],[5,'L02',150,160]]},
 {title:'Report location-level error',why:'WAPE uses the same reported-actual population for numerator and denominator. L03 also has a coverage exception, so its metric needs context.',sql:'SELECT location_id,\n ROUND(100.0*SUM(ABS(actual_units-forecast_units))\n / NULLIF(SUM(actual_units),0),2) AS wape_pct\nFROM daily_plan WHERE actual_units IS NOT NULL\nGROUP BY location_id ORDER BY location_id;',columns:['location_id','wape_pct'],rows:[['L01',10.74],['L02',7.14],['L03',22.12]]}
 ]};

teach['excel-lookups']={outcome:'Import the practice extracts, create named tables, and explain what an exact lookup does when a key is missing or repeated.',blocks:[
 ['Prepare the Excel environment once',
 p('Open Data desk and download daily_plan.csv, products.csv and product_feed.csv. In Excel, place each dataset on a separate sheet. Select its data and use <strong>Insert → Table</strong>, with headers checked. Under Table Design, rename the tables <strong>Plan</strong>, <strong>Products</strong> and <strong>Feed</strong>.')+
 p('Structured references such as Plan[product_id] mean a whole named table column. [@product_id] means the product_id in the current row of that table. Excel copies a table formula down automatically.')+
 t(['Notation','Meaning'],[['Products[product_name]','All values under product_name in the Products table'],['[@product_id]','This row’s product ID'],['$A$2','Always cell A2 when copied'],['A2','A relative reference that can move when copied']])+
 p('If CSV dates import as text, use Data → Text to Columns or a controlled conversion before date calculations. Save the working file as .xlsx so formulas and tables are preserved.')],
 ['Read XLOOKUP from left to right',
 code('=XLOOKUP([@product_id],Products[product_id],\n         Products[product_name],"MISSING",0)')+
 steps([['[@product_id]','The ID I am looking for in this plan row.'],['Products[product_id]','The master column in which to find that ID.'],['Products[product_name]','The aligned column containing the answer.'],['"MISSING"','The visible result if no ID matches.'],['0','Use an exact match.']])+
 t(['Plan product','Lookup result'],[['P01','Burger buns'],['P02','Potato fries'],['P99','MISSING']])+
 p('This plays a similar role to a LEFT JOIN when the master key is unique: every Plan row remains and a matching name is added. Unlike SQL, XLOOKUP returns the first matching row if the lookup key repeats.')+
 p('If XLOOKUP is unavailable, INDEX/MATCH provides an exact lookup:')+code('=IFERROR(INDEX(Products[product_name],\n MATCH([@product_id],Products[product_id],0)),"MISSING")')],
 ['Clean the key, then test the assumption',
 code('=UPPER(TRIM([@raw_product_id]))')+
 p('Add that as clean_id in Feed. TRIM removes surrounding spaces; UPPER gives a consistent case. Then count occurrences of the cleaned ID:')+code('=COUNTIF(Feed[clean_id],[@clean_id])')+
 t(['Raw ID','Clean ID','Count in Feed'],[[' p01 ','P01',1],['P02','P02',2],['P02','P02',2]])+
 p('The two P02 records require a source decision. XLOOKUP could conceal this by returning one answer. A join could repeat your Plan row. Neither is a substitute for inspecting the source key.')+
 note('Do not clean every field automatically. If case or leading zeroes are meaningful in the source system, preserve them and agree the normalization rule.')],
 ['Validate the enrichment before using it',
 t(['Control','Expected result','Why'],[['Plan row count',24,'A lookup should not add or remove planning records'],['Full forecast control total',3560,'Enriching a record should not change its quantity'],['Unmatched Plan product','P99','A visible master-data exception'],['Repeated cleaned feed key','P02','A lookup uniqueness exception']])+
 p('Use SUM(Plan[forecast_units]) to check the full source total. Do this on the complete source population. A filtered subtotal is a separate control and should be labeled with its scope.')+
 note('Interview explanation: “I used an exact product lookup with an explicit missing flag, normalized the intended key, tested duplicate IDs, and checked the row count and forecast total after adding the attributes.”')]
 ]};

teach['excel-summary']={outcome:'Choose SUMIFS or a PivotTable for the question, build the summary, and explain the result with correct units and coverage.',blocks:[
 ['SUMIFS is an answer to a specific question',
 p('Question: “What was the Chicago forecast on November 2?” We need to add forecast_units only where location is L01 and date is November 2. SUMIFS sums one range while testing aligned criteria ranges.')+
 code('=SUMIFS(Plan[forecast_units],\n        Plan[location_id],"L01",\n        Plan[plan_date],DATE(2026,11,2))')+
 steps([['Plan[forecast_units]','Add numbers from this column.'],['Plan[location_id],"L01"','Keep rows where the location matches L01.'],['Plan[plan_date],DATE(2026,11,2)','Also require this date; this version assumes real Excel date values.']])+
 t(['Matching product','Forecast'],[['P01',110],['P02',210],['P03',320],['Total',640]])+
 p('If Plan[plan_date] is text rather than a real date, DATE(...) will not match it as intended. Convert the column, or use matching text criteria consistently. The SQL equivalent is WHERE both conditions, then SUM(forecast_units).')],
 ['A PivotTable answers the question for every location',
 p('Use SUMIFS when you need a specified cell or a repeatable custom summary. Use a PivotTable when you want an interactive overview of groups, totals and filters.')+
 `<ol><li>Click a cell in Plan. Choose Insert → PivotTable → New Worksheet.</li><li>Drag location_id into Rows.</li><li>Drag forecast_units and actual_units into Values.</li><li>Open Value Field Settings and choose SUM for both.</li><li>Drag promo into Filters. Select 1 to examine promotional rows.</li></ol>`+
 t(['Location','Forecast SUM','Known actual SUM'],[['L01',2035,2235],['L02',840,840],['L03',685,520]],'Unfiltered source summary')+
 p('L03 has one missing actual, so its displayed difference combines a coverage problem with demand variation. Add a reported-actual count or filter both measures to comparable observations before measuring forecast error.')+
 note('SQL equivalent: SELECT location_id, SUM(forecast_units), SUM(actual_units) FROM daily_plan GROUP BY location_id.')],
 ['Use IF, COUNTIFS and anchored cells for exceptions',
 p('You may be asked for a usable exception report, not just a total. Add a label that keeps missing actuals separate:')+
 code('=IF([@actual_units]="","Missing",\n IF([@actual_units]>[@forecast_units],"Underforecast","Other"))')+
 p('Count scoped exception rows with COUNTIFS, using that label rather than treating blanks as numeric observations:')+
 code('=COUNTIFS(Plan[location_id],"L01",Plan[status],"Underforecast")')+
 p('In a summary matrix, use $A2 for a location label fixed to column A and B$1 for a date fixed to row 1. That lets one SUMIFS formula copy across and down correctly. $A$2 fixes both row and column.')+
 compare([['SUMIFS','One or more conditions, add quantities','SQL SUM with WHERE'],['COUNTIFS','One or more conditions, count qualifying records','SQL COUNT with WHERE'],['PivotTable','Explore multiple groups and measures','SQL GROUP BY'],['IF / IFS','Label each row','SQL CASE']])],
 ['Turn the metric into an operational explanation',
 p('For L01/P03, on_hand is 50 and daily_demand is 80. Stock cover is 50/80 = 0.625 days. The master lead time is 5 days. That gap warrants a check of inbound timing, demand assumptions and available supply.')+
 p('For the simplified reorder point, daily_demand × lead_time + safety_stock = 80 × 5 + 100 = 500 units. Inventory position is on_hand + on_order = 50 units in this exercise. Confirm backorders, allocations and units before using this as real policy.')+
 p('For WAPE, add a blank-safe absolute error column:')+
 code('=IF([@actual_units]="","",ABS([@actual_units]-[@forecast_units]))')+
 p('Then divide SUM(Plan[abs_error]) by SUM(Plan[actual_units]) with a zero-denominator check. The full dataset produces 415/3595 = 11.54%. Format the ratio as a percentage. Do not multiply by 100 and also apply percentage formatting.')+
 note('Interview explanation: “The result is a priority signal. I would validate missing inputs and inbound supply with the planner before recommending a settings change.”')]
 ]};

// Keep the rehearsal brief, but make the route through it explicit.
teach.mock={outcome:'Complete a small investigation with limited guidance, validate it and explain your reasoning aloud.',blocks:[
 ['What to do in the 30-minute rehearsal',
 p('You are investigating a report that Chicago promotional demand is higher than forecast. Work in this order:')+
 `<ol><li><strong>Minutes 0–3:</strong> state the grain and reporting scope. Identify the plan, product and inventory tables.</li><li><strong>Minutes 3–15:</strong> find missing product mappings, then summarize Chicago promotional forecast and actual quantities by product.</li><li><strong>Minutes 15–25:</strong> reproduce the promotional totals in Excel and inspect stock cover for the drink cups.</li><li><strong>Minutes 25–30:</strong> explain evidence, one quality check, the operational implication and your next action.</li></ol>`+
 p('The mock uses synthetic data. It is practice for the type of work, not HAVI’s actual assessment. The employer’s exact SQL/Excel split is unconfirmed.')],
 ['What a useful answer sounds like',
 t(['Say this','Why it helps'],[['“What does one row represent, and which date range should I use?”','Clarifies scope before coding'],['“I chose LEFT JOIN to keep unmapped planning records visible.”','Explains the join decision'],['“I will check whether this key repeats before summing.”','Prevents inflated totals'],['“This is missing data, not a measured zero.”','Protects the interpretation'],['“The gap suggests a planning risk; I would check promo setup and inbound timing.”','Separates evidence from a root-cause claim']])+
 p('If stuck, simplify to SELECT columns FROM table. Run that, then add one filter or join at a time. Talk through the assumption you are testing. An honest, methodical approach is more credible than claiming production SQL experience you have not had.')]
 ]};

teach['excel-lookups'].walkthrough=[
 {title:'Look up a recognized product',why:'In the Plan row containing P01, XLOOKUP searches Products[product_id], finds P01, and returns Burger buns from the same master row.',formula:'=XLOOKUP([@product_id],Products[product_id],\n Products[product_name],"MISSING",0)',csv:'daily_plan',columns:['Plan product_id','product_name'],rows:[['P01','Burger buns']]},
 {title:'See what an unmatched ID returns',why:'The same formula runs on the Plan row containing P99. No master ID matches, so the explicit fallback MISSING appears. The original planning record remains visible.',formula:'=XLOOKUP([@product_id],Products[product_id],\n Products[product_name],"MISSING",0)',csv:'products',columns:['Plan product_id','product_name'],rows:[['P99','MISSING']]},
 {title:'Normalize and count a raw key',why:'First create clean_id. Then count that cleaned value across the Feed table. Both P02 source records receive a count of 2; the first matching lookup answer would conceal that fact.',formula:'clean_id:\n=UPPER(TRIM([@raw_product_id]))\n\nduplicate_count:\n=COUNTIF(Feed[clean_id],[@clean_id])',csv:'product_feed',columns:['raw_product_id','clean_id','duplicate_count'],rows:[[' p01 ','P01',1],['P02','P02',2],['P02','P02',2]]}
];
teach['excel-summary'].walkthrough=[
 {title:'Identify the rows that meet both criteria',why:'For Chicago on November 2, the Plan table has three qualifying products. The location and date tests must both match on the same record.',formula:'Criteria:\nlocation_id = L01\nplan_date = November 2, 2026',csv:'daily_plan',columns:['Product','Forecast units'],rows:[['P01',110],['P02',210],['P03',320]]},
 {title:'Add those quantities with SUMIFS',why:'SUMIFS adds the forecast column only for the three qualifying records. 110 + 210 + 320 gives 640. This formula assumes plan_date contains actual Excel dates.',formula:'=SUMIFS(Plan[forecast_units],\n Plan[location_id],"L01",\n Plan[plan_date],DATE(2026,11,2))',csv:'daily_plan',columns:['Location','Date','Total forecast'],rows:[['L01','2026-11-02',640]]},
 {title:'Use a PivotTable for all centers',why:'A PivotTable repeats the grouping and summing for each center. Add location_id to Rows and the two measures to Values as SUM. The L03 actual total is incomplete because one input is missing.',formula:'Rows: location_id\nValues: SUM of forecast_units\n        SUM of actual_units\nOptional filter: promo',csv:'daily_plan',columns:['Location','Forecast','Known actual'],rows:[['L01',2035,2235],['L02',840,840],['L03',685,520]]}
];

const fastTimes=[10,15,30,12,18,15,10,15,15,30];
const fullTimes=[25,40,65,35,45,40,40,40,45,60];
for(const [i,m] of window.CAMPUS_MODULES.entries()){
 const x=teach[m.id];if(!x)continue;
 m.outcome=x.outcome;m.blocks=x.blocks;m.walkthrough=x.walkthrough||null;
 m.fast=fastTimes[i];m.full=fullTimes[i];
}

// A progression of guided questions before the existing graded labs.
window.CAMPUS_GUIDED={
 foundation:{q:'You have one file for October and one for November, with the same columns. You want a longer dataset containing both months. What operation fits?',options:['JOIN to add columns','UNION ALL to stack records','GROUP BY to total the files'],correct:1,why:'The goal is to add more rows with the same structure. JOIN would match related records and add attributes; grouping would reduce detail.'},
 select:{q:'Before writing SQL for “Chicago promotional rows where actual demand exceeded forecast,” which plan matches the question?',options:['Filter L01 AND promo=1 AND actual>forecast','Sort all rows by product_name','Group every location together first'],correct:0,why:'All three conditions must be true on an individual row. No join or aggregation is needed yet.'},
 joins:{q:'Predict the output: the selected plans use P01, P02 and P99. Only P01 and P02 exist in products. How many rows does each join produce if master IDs are unique?',options:['INNER: 3; LEFT: 2','INNER: 2; LEFT: 3','Both: 2'],correct:1,why:'INNER removes the unmatched P99 plan; LEFT preserves it and leaves the added product fields NULL.'},
 quality:{q:'An 80-unit stock record matches two receipts. The joined result has two rows with on_hand=80. What stock total should you report?',options:['160, because there are two rows','80, because the same snapshot was repeated','0, until DISTINCT is added'],correct:1,why:'A join can repeat a fact without creating another real-world fact. Fix the output grain before totaling stock.'},
 aggregate:{q:'Three actual values are NULL, 0 and 55. What are COUNT(*) and COUNT(actual_units)?',options:['3 and 3','3 and 2','2 and 1'],correct:1,why:'COUNT(*) counts all three rows. COUNT(actual_units) skips NULL but includes the measured zero.'},
 functions:{q:'For 50 units on hand and demand of 80 units per day, what does 50/80 represent?',options:['62.5% forecast accuracy','0.625 days of stock cover','A shortage of 30 days'],correct:1,why:'Units divided by units/day gives days. Be explicit about the business unit before interpreting the number.'},
 analysis:{q:'You find actual demand above forecast during a promotion. Which conclusion is justified by that fact alone?',options:['The promo parameter definitely caused the error','There is a variance to investigate; check inputs and settings before assigning a cause'],correct:1,why:'The comparison establishes a variance. It does not establish a root cause.'},
 'excel-lookups':{q:'Why put "MISSING" in XLOOKUP instead of returning a blank?',options:['It makes unmatched keys visible for review','It fixes the product master automatically'],correct:0,why:'A visible flag helps separate failed matches from valid blank attributes. It does not repair the source.'},
 'excel-summary':{q:'A PivotTable shows COUNT of forecast_units when you intended SUM. What should you check?',options:['Whether the source units imported as text, then the Value Field Settings','Whether the table needs more colors'],correct:0,why:'A text import can lead to COUNT instead of SUM. Check the source type and set the intended aggregation explicitly.'}
};

// Clearer instructions and readable starting points; existing draft answers are preserved.
for(const m of window.CAMPUS_MODULES)for(const l of m.labs){
 if(!l.type&&l.starter.includes('WHERE --'))l.starter=l.starter.replace('WHERE --','WHERE\n  --');
}
})();
