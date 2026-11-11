/* All practice records are synthetic. Nothing here is HAVI or customer operational data. */
const DATA = {
 orders: {
  columns: ["order_id","order_date","location_id","customer","status"],
  types: ["TEXT PRIMARY KEY","TEXT","TEXT","TEXT","TEXT"],
  grain: "One row per store order (the order header). order_id is unique. This is the system of record for status.",
  rows: [
   ["O1001","2026-11-02","L01","Store 114","Shipped"],
   ["O1002","2026-11-02","L01","Store 207","Shipped"],
   ["O1003","2026-11-03","L02","Store 311","Open"],
   ["O1004","2026-11-03","L03","Store 402","Shipped"],
   ["O1005","2026-11-04","L01","Store 114","Open"],
   ["O1006","2026-11-04","L02","Store 311","Cancelled"]
  ]
 },
 order_lines: {
  columns: ["line_id","order_id","product_id","qty_ordered","qty_shipped"],
  types: ["INTEGER PRIMARY KEY","TEXT","TEXT","INTEGER","INTEGER"],
  grain: "One row per product on an order (the order detail). Many lines per order. qty_shipped is NULL until the line ships.",
  rows: [
   [1,"O1001","P01",40,40],
   [2,"O1001","P02",60,60],
   [3,"O1002","P03",100,100],
   [4,"O1002","P03",100,100],
   [5,"O1003","P01",30,null],
   [6,"O1003","P05",20,null],
   [7,"O1004","P04",50,45],
   [8,"O1004","P99",10,10],
   [9,"O1005"," P02",80,null],
   [10,"O1005","P01",25,null],
   [11,"O1007","P03",50,50],
   [12,"O1006","P02",70,0]
  ]
 },
 screen_orders: {
  columns: ["order_id","status","total_qty","synced_at"],
  types: ["TEXT","TEXT","INTEGER","TEXT"],
  grain: "One row per order as the ordering screen displays it. A downstream copy that is refreshed by a sync job, so it can be stale, incomplete or wrong.",
  rows: [
   ["O1001","Shipped",100,"2026-11-04 06:00"],
   ["O1002","Shipped",200,"2026-11-04 06:00"],
   ["O1003","Open",50,"2026-11-04 06:00"],
   ["O1004","Open",60,"2026-11-02 06:00"],
   ["O1005","Open",25,"2026-11-04 06:00"],
   ["O1007","Shipped",50,"2026-11-04 06:00"]
  ]
 },
 products: {
  columns: ["product_id","product_name","category","unit_cost","lead_time_days","safety_stock"],
  types: ["TEXT PRIMARY KEY","TEXT","TEXT","REAL","INTEGER","INTEGER"],
  grain: "One row per product. product_id is unique.",
  rows: [
   ["P01","Burger buns","Bakery",0.35,2,40],
   ["P02","Potato fries","Frozen",0.8,3,60],
   ["P03","Drink cups","Packaging",0.12,5,100],
   ["P04","Chicken portions","Frozen",1.2,2,50],
   ["P05","Salad packs","Fresh",1.5,1,20],
   ["P06","Promo cartons","Packaging",0.25,7,80]
  ]
 },
 locations: {
  columns: ["location_id","location_name","region"],
  types: ["TEXT PRIMARY KEY","TEXT","TEXT"],
  grain: "One row per distribution center. location_id is unique.",
  rows: [
   ["L01","Chicago DC","Midwest"],
   ["L02","Denver DC","West"],
   ["L03","Atlanta DC","South"],
   ["L04","Dallas DC","South"]
  ]
 },
 product_feed: {
  columns: ["feed_row_id","raw_product_id","raw_name","loaded_date"],
  types: ["INTEGER PRIMARY KEY","TEXT","TEXT","TEXT"],
  grain: "One row per incoming feed record. This is a dirty source: the normalized product ID is not unique.",
  rows: [
   [1," p01 ","Burger buns","2026-11-03"],
   [2,"P02","Potato fries","2026-11-03"],
   [3,"P02","Potato fries duplicate","2026-11-03"],
   [4,"p03","Drink cups","2026-11-03"],
   [5," P04","Chicken portions","2026-11-03"],
   [6,"P05 ","Salad packs","2026-11-03"],
   [7,"P06","Promo cartons","2026-11-03"]
  ]
 },
 daily_plan: {
  columns: ["plan_id","plan_date","location_id","product_id","forecast_units","actual_units","promo"],
  types: ["INTEGER PRIMARY KEY","TEXT","TEXT","TEXT","INTEGER","INTEGER","INTEGER"],
  grain: "One row per date + distribution center + product. The combination of all three is the business key. actual_units can be NULL when a feed is missing.",
  rows: [
   [1,"2026-11-01","L01","P01",100,120,0],
   [2,"2026-11-01","L01","P02",200,180,0],
   [3,"2026-11-01","L01","P03",300,310,0],
   [4,"2026-11-01","L02","P01",90,100,0],
   [5,"2026-11-01","L02","P02",150,160,0],
   [6,"2026-11-01","L03","P04",120,120,0],
   [7,"2026-11-02","L01","P01",110,140,1],
   [8,"2026-11-02","L01","P02",210,250,1],
   [9,"2026-11-02","L01","P03",320,330,1],
   [10,"2026-11-02","L02","P01",95,90,0],
   [11,"2026-11-02","L02","P05",60,45,0],
   [12,"2026-11-02","L03","P04",130,150,1],
   [13,"2026-11-03","L01","P01",120,150,1],
   [14,"2026-11-03","L01","P02",220,270,1],
   [15,"2026-11-03","L02","P02",160,155,0],
   [16,"2026-11-03","L03","P04",140,null,1],
   [17,"2026-11-03","L03","P05",70,0,0],
   [18,"2026-11-03","L02","P99",50,55,0],
   [19,"2026-11-04","L01","P01",125,145,1],
   [20,"2026-11-04","L01","P03",330,340,1],
   [21,"2026-11-04","L02","P05",65,60,0],
   [22,"2026-11-04","L03","P04",145,165,1],
   [23,"2026-11-04","L02","P02",170,175,0],
   [24,"2026-11-04","L03","P01",80,85,0]
  ]
 },
 inventory: {
  columns: ["snapshot_date","location_id","product_id","on_hand","on_order","daily_demand"],
  types: ["TEXT","TEXT","TEXT","INTEGER","INTEGER","REAL"],
  grain: "One row per snapshot date + distribution center + product. Snapshot quantities are not additive across dates.",
  rows: [
   ["2026-11-04","L01","P01",80,50,40],
   ["2026-11-04","L01","P02",300,100,70],
   ["2026-11-04","L01","P03",50,0,80],
   ["2026-11-04","L02","P01",120,0,30],
   ["2026-11-04","L02","P02",70,90,50],
   ["2026-11-04","L02","P05",25,0,20],
   ["2026-11-04","L03","P04",60,40,45],
   ["2026-11-04","L03","P05",0,0,0],
   ["2026-11-04","L03","P06",80,0,15],
   ["2026-11-04","L02","P99",10,0,5]
  ]
 },
 receipts: {
  columns: ["receipt_id","location_id","product_id","expected_date","received_date","received_units"],
  types: ["INTEGER PRIMARY KEY","TEXT","TEXT","TEXT","TEXT","INTEGER"],
  grain: "One row per receipt, with multiple receipts possible per location + product.",
  rows: [
   [1,"L01","P01","2026-11-02","2026-11-03",50],
   [2,"L01","P01","2026-11-04","2026-11-04",75],
   [3,"L01","P02","2026-11-03","2026-11-05",100],
   [4,"L02","P02","2026-11-04",null,0],
   [5,"L03","P04","2026-11-02","2026-11-02",40],
   [6,"L02","P01","2026-11-03","2026-11-04",60],
   [7,"L03","P06","2026-11-04",null,0]
  ]
 }
};
if (typeof module !== "undefined") module.exports = DATA;
