# Unit ddl-export-default-002

Read through the DDL export adapter (ddl-export@1.0.0). 6 item(s). Cite each requirement with the trace kind, path and anchor given for its item.

## table signon_user

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `signon_user`
- lines: 74-77

```sql
CREATE TABLE signon_user (
  username varchar2(50) not null,
  password varchar2(50) not null,
  constraint pk_signon_user primary key (username));
```

## table profile

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `profile`
- lines: 125-131

```sql
CREATE TABLE profile (
  profile_id varchar2(40) not null,
  preferred_language varchar2(10) not null,
  favorite_category varchar2(10),
  my_list_preference number(1) not null,
  banner_preference number(1) not null,
  constraint pk_profile primary key (profile_id));
```

## table purchase_order

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `purchase_order`
- lines: 146-157

```sql
CREATE TABLE purchase_order (
  po_id varchar2(40) not null,
  po_user_id varchar2(50) not null,
  po_email_id varchar2(120) not null,
  po_date number(19) not null,
  po_locale varchar2(10) not null,
  po_value number(12,2) not null,
  contact_id varchar2(40) not null,
  card_id varchar2(40) not null,
  constraint pk_purchase_order primary key (po_id),
  constraint fk_purchase_order_1 foreign key (contact_id) references contact_info (contact_id),
  constraint fk_purchase_order_2 foreign key (card_id) references credit_card (card_id));
```

## table supplier_order

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `supplier_order`
- lines: 182-188

```sql
CREATE TABLE supplier_order (
  po_id varchar2(40) not null,
  po_date number(19) not null,
  po_status varchar2(20) not null,
  contact_id varchar2(40) not null,
  constraint pk_supplier_order primary key (po_id),
  constraint fk_supplier_order_1 foreign key (contact_id) references contact_info (contact_id));
```

## table supplier_line_item

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `supplier_line_item`
- lines: 192-202

```sql
CREATE TABLE supplier_line_item (
  po_id varchar2(40) not null,
  line_number varchar2(10) not null,
  category_id varchar2(10) not null,
  product_id varchar2(10) not null,
  item_id varchar2(10) not null,
  quantity integer not null,
  unit_price number(12,2) not null,
  quantity_shipped integer not null,
  constraint pk_supplier_line_item primary key (po_id, line_number),
  constraint fk_supplier_line_item_1 foreign key (po_id) references supplier_order (po_id));
```

## view v_order_status

- trace kind: `db_object`
- path: `petstore_oracle.sql`
- anchor: `v_order_status`
- lines: 226-228
- touches: reads purchase_order, reads order_manager

```sql
CREATE VIEW v_order_status AS
  SELECT p.po_id, p.po_user_id, p.po_date, p.po_value, m.status
  FROM purchase_order p JOIN order_manager m ON m.order_id = p.po_id;
```
