# Unit ddl-export-default-001

Read through the DDL export adapter (ddl-export@1.0.0). 20 item(s). Cite each requirement with the trace kind, path and anchor given for its item.

## table category

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `category`
- lines: 13-15

```sql
CREATE TABLE category (
  catid varchar2(10) not null,
  constraint pk_category primary key (catid));
```

## table category_details

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `category_details`
- lines: 19-26

```sql
CREATE TABLE category_details (
  catid varchar2(10) not null,
  name varchar2(80) not null,
  image varchar2(255),
  descn varchar2(255),
  locale varchar2(10) not null,
  constraint pk_category_details primary key (catid, locale),
  constraint fk_category_details_1 foreign key (catid) references category (catid));
```

## table product

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `product`
- lines: 30-34

```sql
CREATE TABLE product (
  productid varchar2(10) not null,
  catid varchar2(10) not null,
  constraint pk_product primary key (productid),
  constraint fk_product_1 foreign key (catid) references category (catid));
```

## table product_details

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `product_details`
- lines: 38-45

```sql
CREATE TABLE product_details (
  productid varchar2(10) not null,
  locale varchar2(10) not null,
  name varchar2(80) not null,
  image varchar2(255),
  descn varchar2(255),
  constraint pk_product_details primary key (productid, locale),
  constraint fk_product_details_1 foreign key (productid) references product (productid));
```

## table item

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `item`
- lines: 49-53

```sql
CREATE TABLE item (
  itemid varchar2(10) not null,
  productid varchar2(10) not null,
  constraint pk_item primary key (itemid),
  constraint fk_item_1 foreign key (productid) references product (productid));
```

## table item_details

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `item_details`
- lines: 57-70

```sql
CREATE TABLE item_details (
  itemid varchar2(10) not null,
  listprice decimal(10,2) not null,
  unitcost decimal(10,2) not null,
  locale varchar2(10) not null,
  image varchar2(255) not null,
  descn varchar2(255) not null,
  attr1 varchar2(80),
  attr2 varchar2(80),
  attr3 varchar2(80),
  attr4 varchar2(80),
  attr5 varchar2(80),
  constraint pk_item_details primary key (itemid, locale),
  constraint fk_item_details_1 foreign key (itemid) references item (itemid));
```

## table address

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `address`
- lines: 81-89

```sql
CREATE TABLE address (
  address_id varchar2(40) not null,
  street_name1 varchar2(80) not null,
  street_name2 varchar2(80),
  city varchar2(80) not null,
  state varchar2(40) not null,
  zip_code varchar2(20) not null,
  country varchar2(40) not null,
  constraint pk_address primary key (address_id));
```

## table contact_info

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `contact_info`
- lines: 93-101

```sql
CREATE TABLE contact_info (
  contact_id varchar2(40) not null,
  family_name varchar2(80) not null,
  given_name varchar2(80) not null,
  telephone varchar2(40) not null,
  email varchar2(120) not null,
  address_id varchar2(40) not null,
  constraint pk_contact_info primary key (contact_id),
  constraint fk_contact_info_1 foreign key (address_id) references address (address_id));
```

## table credit_card

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `credit_card`
- lines: 105-110

```sql
CREATE TABLE credit_card (
  card_id varchar2(40) not null,
  card_number varchar2(40) not null,
  card_type varchar2(40) not null,
  expiry_date varchar2(10) not null,
  constraint pk_credit_card primary key (card_id));
```

## table account

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `account`
- lines: 114-121

```sql
CREATE TABLE account (
  account_id varchar2(40) not null,
  status varchar2(20) not null,
  contact_id varchar2(40) not null,
  card_id varchar2(40) not null,
  constraint pk_account primary key (account_id),
  constraint fk_account_1 foreign key (contact_id) references contact_info (contact_id),
  constraint fk_account_2 foreign key (card_id) references credit_card (card_id));
```

## table customer

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `customer`
- lines: 135-142

```sql
CREATE TABLE customer (
  user_id varchar2(50) not null,
  account_id varchar2(40) not null,
  profile_id varchar2(40) not null,
  constraint pk_customer primary key (user_id),
  constraint fk_customer_1 foreign key (user_id) references signon_user (username),
  constraint fk_customer_2 foreign key (account_id) references account (account_id),
  constraint fk_customer_3 foreign key (profile_id) references profile (profile_id));
```

## table po_line_item

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `po_line_item`
- lines: 161-171

```sql
CREATE TABLE po_line_item (
  po_id varchar2(40) not null,
  line_number varchar2(10) not null,
  category_id varchar2(10) not null,
  product_id varchar2(10) not null,
  item_id varchar2(10) not null,
  quantity integer not null,
  unit_price number(12,2) not null,
  quantity_shipped integer not null,
  constraint pk_po_line_item primary key (po_id, line_number),
  constraint fk_po_line_item_1 foreign key (po_id) references purchase_order (po_id));
```

## table order_manager

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `order_manager`
- lines: 175-178

```sql
CREATE TABLE order_manager (
  order_id varchar2(40) not null,
  status varchar2(20) not null,
  constraint pk_order_manager primary key (order_id));
```

## table inventory

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `inventory`
- lines: 206-209

```sql
CREATE TABLE inventory (
  item_id varchar2(10) not null,
  quantity integer not null,
  constraint pk_inventory primary key (item_id));
```

## table counter

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `counter`
- lines: 213-216

```sql
CREATE TABLE counter (
  name varchar2(40) not null,
  counter integer not null,
  constraint pk_counter primary key (name));
```

## index ix_product_catid

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `ix_product_catid`
- lines: 219-219
- touches: reads product

```sql
CREATE INDEX ix_product_catid ON product (catid);
```

## index ix_item_productid

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `ix_item_productid`
- lines: 220-220
- touches: reads item

```sql
CREATE INDEX ix_item_productid ON item (productid);
```

## index ix_po_user

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `ix_po_user`
- lines: 221-221
- touches: reads purchase_order

```sql
CREATE INDEX ix_po_user ON purchase_order (po_user_id);
```

## index ix_po_date

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `ix_po_date`
- lines: 222-222
- touches: reads purchase_order

```sql
CREATE INDEX ix_po_date ON purchase_order (po_date);
```

## index ix_order_manager_status

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `ix_order_manager_status`
- lines: 223-223
- touches: reads order_manager

```sql
CREATE INDEX ix_order_manager_status ON order_manager (status);
```
