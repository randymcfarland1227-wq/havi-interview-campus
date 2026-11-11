/* References for the SQL shown in this course. Keep the original text intact for copying. */
const SQL_REFERENCE = (() => {
  const instructions = {
    SELECT: 'Choose the columns and calculations to show in the result.',
    FROM: 'Start with this table. Its rows are the starting point for the query.',
    JOIN: 'Bring in another table. Each matching pair can produce a result row.',
    INNER: 'Keep pairs that meet the ON condition. Unmatched rows drop out.',
    LEFT: 'Keep every row from the table on the left. An unmatched row gets NULLs on the right.',
    RIGHT: 'Keep every row from the table on the right.',
    FULL: 'Keep matched rows and unmatched rows from either side.',
    OUTER: 'Include unmatched rows from the side named by LEFT, RIGHT, or FULL.',
    CROSS: 'Pair each row on the left with every row on the right.',
    ON: 'Decide which rows can pair up in this join. With a LEFT JOIN, an unmatched left row still appears.',
    WHERE: 'Filter the rows after FROM and JOIN. Only rows that pass this test remain.',
    AND: 'Both conditions must be true.',
    OR: 'Either condition can be true.',
    NOT: 'Reverse the condition that follows.',
    IN: 'Test whether the value is in the list or subquery.',
    BETWEEN: 'Test whether the value is between the two bounds, including both ends.',
    LIKE: 'Match text to a pattern. A percent sign can stand for any number of characters.',
    IS: 'Use IS NULL or IS NOT NULL to test whether a value is missing.',
    NULL: 'A missing or unknown value.',
    GROUP: 'GROUP BY collects rows into groups. A grouped result has one row per group.',
    HAVING: 'Filter groups after their totals or counts have been calculated.',
    ORDER: 'ORDER BY sorts the result or sets the order inside a window.',
    BY: 'Names the columns to group, sort, or partition by.',
    ASC: 'Sort from low to high.',
    DESC: 'Sort from high to low.',
    DISTINCT: 'Keep one copy of each distinct result row or value.',
    TOP: 'Limit the number of rows returned. Use ORDER BY to choose which rows come first.',
    UNION: 'Stack the rows from two queries with matching output columns. Plain UNION removes duplicate rows.',
    ALL: 'With UNION, keep every row, including repeats.',
    CASE: 'Return a value based on the first WHEN condition that is true.',
    WHEN: 'Test a condition inside CASE.',
    THEN: 'Return this value if the WHEN condition is true.',
    ELSE: 'Return this fallback value if no WHEN condition is true.',
    END: 'Finish the CASE expression.',
    AS: 'Give an output column a label, or introduce the query that defines a named step.',
    WITH: 'Define a named query step that the rest of this statement can use.',
    OVER: 'Calculate across related rows while keeping the detail rows.',
    PARTITION: 'PARTITION BY specifies which rows belong to the same window group.',
    COUNT: 'Count rows with COUNT(*) or count non-NULL values with COUNT(column).',
    SUM: 'Add the values in a column or expression.',
    AVG: 'Calculate the average of the values that are present.',
    MIN: 'Find the smallest value.',
    MAX: 'Find the largest value.',
    ISNULL: 'Use the second value when the first value is NULL.',
    COALESCE: 'Return the first value in the list that is present.',
    NULLIF: 'Return NULL when the two values are equal. This can guard against division by zero.',
    ROUND: 'Round a number to the specified number of decimal places.',
    ABS: 'Take the magnitude of a number, so positive and negative differences add together.',
    TRIM: 'Remove spaces from the start and end of text.',
    LTRIM: 'Remove leading spaces.',
    RTRIM: 'Remove trailing spaces.',
    UPPER: 'Convert the text to uppercase.',
    LOWER: 'Convert the text to lowercase.',
    LEN: 'Count characters. SQL Server LEN excludes trailing spaces.',
    CONCAT: 'Put the supplied text values together.',
    DATEDIFF: 'Count how many boundaries of the chosen date part the dates cross.',
    DATEADD: 'Move a date forward or back by a specified amount.',
    GETDATE: 'Get the current date and time. The course uses a fixed time for practice.',
    CAST: 'Convert a value to a different data type.',
    ROW_NUMBER: 'Number the rows within each group in the specified order.',
    YEAR: 'Get the year from a date.',
    MONTH: 'Get the month from a date.',
    DAY: 'Get the day of the month from a date. Inside DATEDIFF or DATEADD, day is the unit.'
  };

  const dataTypes = new Set(['DATE', 'DATETIME', 'INT', 'INTEGER', 'DECIMAL', 'FLOAT', 'VARCHAR', 'NVARCHAR', 'BIT']);

  const fieldNotes = {
    product_id: 'The product code.',
    raw_product_id: 'The product code as the feed received it. It may contain spaces or inconsistent casing.',
    product_name: 'The readable name of a product.',
    location_id: 'The code for a distribution center.',
    order_id: 'The order number.',
    line_id: 'The unique number for one order line.',
    plan_id: 'The unique number for one daily plan row.',
    qty_ordered: 'The units ordered on this line.',
    qty_shipped: 'The units shipped on this line. NULL means no quantity was recorded.',
    status: 'The order status recorded by this table.',
    total_qty: 'The total quantity recorded by the ordering screen.',
    synced_at: 'The last time this screen row was refreshed.',
    plan_date: 'The day covered by the plan.',
    snapshot_date: 'The day the stock levels were captured.',
    forecast_units: 'The quantity the plan expected to sell.',
    actual_units: 'The quantity recorded as sold. NULL means the actual is missing.',
    on_hand: 'Units currently in stock at the location.',
    on_order: 'Units already on order for the location.',
    daily_demand: 'Expected demand in units per day.',
    expected_date: 'The date the receipt was due.',
    received_date: 'The date the receipt arrived, if recorded.'
  };

  const steps = {
    source_totals: { columns: ['order_id', 'source_qty'], grain: 'One row per order. Totals come from order_lines.' },
    average_line: { columns: ['avg_qty'], grain: 'One row with the average quantity across order_lines.' },
    ranked: { columns: ['order_id', 'line_id', 'product_id', 'qty_ordered', 'location_id', 'receipt_id', 'expected_date', 'rn'], grain: 'One row per record from the named step above, with its row number.' }
  };

  function tableNote(name, schema) {
    return { kind: 'table', label: 'Table or query step', detail: schema[name].grain };
  }

  function columnNote(table, name, schema) {
    const meta = schema[table];
    const type = meta.types?.[meta.columns.indexOf(name)] ?? '';
    const target = { product_id: 'products', location_id: 'locations', order_id: 'orders' }[name];
    let detail = fieldNotes[name] ?? '';
    if (type.includes('PRIMARY KEY')) detail += ' Primary key for this table.';
    else if (type && target && table !== target) detail += ' Refers to a record in ' + target + '.';
    if (table === 'inventory' && ['product_id', 'location_id', 'snapshot_date'].includes(name)) {
      detail += ' Part of the inventory key, together with the other two fields.';
    }
    return { kind: 'column', label: 'Column from ' + table, detail: [detail.trim(), meta.grain].filter(Boolean).join(' ') };
  }

  function analyze(sql, tables) {
    const schema = { ...tables, ...steps };
    const tokens = (sql.match(/--[^\n]*|'(?:''|[^'\n])*'|[a-z_][a-z_0-9]*|\d+(?:\.\d+)?|<>|>=|<=|!=|[^\S\n]+|\n|./gi) ?? []).map(text => ({ text }));
    const words = tokens.filter(token => token.text.trim() && !token.text.startsWith('--'));
    const newScope = parent => ({ parent, sources: new Set(), outputs: new Set() });
    const scopes = new Map();
    const groups = [];
    let scope = newScope(null);

    words.forEach((token, index) => {
      const word = token.text.toUpperCase();
      const next = words[index + 1]?.text;
      const afterNext = words[index + 2]?.text;
      if (word === '(') {
        groups.push(scope);
        if (['SELECT', 'WITH'].includes(next?.toUpperCase())) scope = newScope(scope);
      }
      if (word === 'UNION') scope = newScope(scope.parent);
      scopes.set(token, scope);
      if (['FROM', 'JOIN', 'WITH'].includes(word) && Object.hasOwn(schema, next)) {
        words[index + 1].note = tableNote(next, schema);
        if (word !== 'WITH') scope.sources.add(next);
      }
      if (word === 'AS' && /^[a-z_]\w*$/i.test(next ?? '') && afterNext !== '(' && !dataTypes.has(next.toUpperCase())) {
        words[index + 1].note = { kind: 'column', label: 'Result column', detail: 'This is the heading for the value or calculation immediately before AS.' };
        scope.outputs.add(next);
      }
      if (word === ')') scope = groups.pop() ?? scope;
    });

    words.forEach((token, index) => {
      const word = token.text;
      const before = words[index - 1]?.text;
      const after = words[index + 1]?.text;
      if (token.note) return;
      if (after === '.' && Object.hasOwn(schema, word)) {
        token.note = tableNote(word, schema);
      } else if (before === '.' && Object.hasOwn(schema, words[index - 2]?.text)) {
        token.note = columnNote(words[index - 2].text, word, schema);
      } else if (dataTypes.has(word.toUpperCase()) && before?.toUpperCase() === 'AS') {
        token.note = { kind: 'instruction', label: 'Data type', detail: 'CAST converts the expression to this type.' };
      } else if (Object.hasOwn(instructions, word.toUpperCase())) {
        token.note = { kind: 'instruction', label: 'SQL instruction', detail: instructions[word.toUpperCase()] };
      } else if (/^[a-z_]\w*$/i.test(word)) {
        for (let current = scopes.get(token); current; current = current.parent) {
          const sources = [...current.sources].filter(name => schema[name].columns.includes(word));
          if (sources.length === 1) {
            token.note = columnNote(sources[0], word, schema);
            break;
          }
          if (current.outputs.has(word)) {
            token.note = { kind: 'column', label: 'Result column', detail: 'A column label defined by this query.' };
            break;
          }
          if (sources.length > 1) break;
        }
      }
    });
    return tokens;
  }

  return { analyze };
})();
if (typeof module !== 'undefined') module.exports = SQL_REFERENCE;
