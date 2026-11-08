-- =====================================================================
-- Java Pet Store 1.3.2 database schema (Cloudscape 3.5 / Derby, runtime)
-- Database: PetStoreDB   Schema: ESTOREUSER
-- Catalog tables (CATEGORY .. ITEM_DETAILS) come from
--   app/src/apps/petstore/src/docroot/populate/PopulateSQL.xml
-- All other tables are the relational form of the CMP entity beans. The J2EE 1.3
-- reference implementation creates those tables at deploy time, so no DDL ships
-- in the source. Names and columns follow cmp-field and cmr-field in each ejb-jar.xml.
-- =====================================================================

-- CATEGORY: Pet category (FISH, DOGS, REPTILES, CATS, BIRDS). Key only; text is in CATEGORY_DETAILS.
-- Source: PopulateSQL.xml
CREATE TABLE category (
  catid char(10) not null,
  constraint pk_category primary key (catid));

-- CATEGORY_DETAILS: Localised name, image and description of a category. One row per category and locale.
-- Source: PopulateSQL.xml
CREATE TABLE category_details (
  catid char(10) not null,
  name varchar(80) not null,
  image varchar(255),
  descn varchar(255),
  locale char(10) not null,
  constraint pk_category_details primary key (catid, locale),
  constraint fk_category_details_1 foreign key (catid) references category (catid));

-- PRODUCT: A kind of pet within a category, for example K9-BD-01 Bulldog in DOGS.
-- Source: PopulateSQL.xml
CREATE TABLE product (
  productid char(10) not null,
  catid char(10) not null,
  constraint pk_product primary key (productid),
  constraint fk_product_1 foreign key (catid) references category (catid));

-- PRODUCT_DETAILS: Localised name, image and description of a product.
-- Source: PopulateSQL.xml
CREATE TABLE product_details (
  productid char(10) not null,
  locale char(10) not null,
  name varchar(80) not null,
  image varchar(255),
  descn varchar(255),
  constraint pk_product_details primary key (productid, locale),
  constraint fk_product_details_1 foreign key (productid) references product (productid));

-- ITEM: A sellable pet, for example EST-6 Male Adult Bulldog. Key and product only; text and prices are in ITEM_DETAILS.
-- Source: PopulateSQL.xml
CREATE TABLE item (
  itemid char(10) not null,
  productid char(10) not null,
  constraint pk_item primary key (itemid),
  constraint fk_item_1 foreign key (productid) references product (productid));

-- ITEM_DETAILS: Localised price, image, description and up to five attributes of an item. LISTPRICE is the shelf price, UNITCOST the supplier cost.
-- Source: PopulateSQL.xml
CREATE TABLE item_details (
  itemid char(10) not null,
  listprice decimal(10,2) not null,
  unitcost decimal(10,2) not null,
  locale char(10) not null,
  image varchar(255) not null,
  descn varchar(255) not null,
  attr1 varchar(80),
  attr2 varchar(80),
  attr3 varchar(80),
  attr4 varchar(80),
  attr5 varchar(80),
  constraint pk_item_details primary key (itemid, locale),
  constraint fk_item_details_1 foreign key (itemid) references item (itemid));

-- SIGNON_USER: Sign-on credentials. One row per user name. PASSWORD is plain text.
-- Source: CMP bean UserEJB (signon)
CREATE TABLE signon_user (
  username varchar(50) not null,
  password varchar(50) not null,
  constraint pk_signon_user primary key (username));

-- ADDRESS: Postal address. Shared by contact information on accounts, orders and supplier orders.
-- Source: CMP bean AddressEJB (address)
CREATE TABLE address (
  address_id varchar(40) not null,
  street_name1 varchar(80) not null,
  street_name2 varchar(80),
  city varchar(80) not null,
  state varchar(40) not null,
  zip_code varchar(20) not null,
  country varchar(40) not null,
  constraint pk_address primary key (address_id));

-- CONTACT_INFO: Name, e-mail, telephone and address of a person.
-- Source: CMP bean ContactInfoEJB (contactinfo)
CREATE TABLE contact_info (
  contact_id varchar(40) not null,
  family_name varchar(80) not null,
  given_name varchar(80) not null,
  telephone varchar(40) not null,
  email varchar(120) not null,
  address_id varchar(40) not null,
  constraint pk_contact_info primary key (contact_id),
  constraint fk_contact_info_1 foreign key (address_id) references address (address_id));

-- CREDIT_CARD: Payment card. CARDNUMBER is stored in clear. EXPIRYDATE is text such as 04/04.
-- Source: CMP bean CreditCardEJB (creditcard)
CREATE TABLE credit_card (
  card_id varchar(40) not null,
  card_number varchar(40) not null,
  card_type varchar(40) not null,
  expiry_date varchar(10) not null,
  constraint pk_credit_card primary key (card_id));

-- ACCOUNT: Customer account: contact information, payment card and status.
-- Source: CMP bean AccountEJB (customer)
CREATE TABLE account (
  account_id varchar(40) not null,
  status varchar(20) not null,
  contact_id varchar(40) not null,
  card_id varchar(40) not null,
  constraint pk_account primary key (account_id),
  constraint fk_account_1 foreign key (contact_id) references contact_info (contact_id),
  constraint fk_account_2 foreign key (card_id) references credit_card (card_id));

-- PROFILE: Storefront preferences of a customer.
-- Source: CMP bean ProfileEJB (customer)
CREATE TABLE profile (
  profile_id varchar(40) not null,
  preferred_language varchar(10) not null,
  favorite_category char(10),
  my_list_preference smallint not null,
  banner_preference smallint not null,
  constraint pk_profile primary key (profile_id));

-- CUSTOMER: A registered shopper. USERID equals SIGNON_USER.USERNAME.
-- Source: CMP bean CustomerEJB (customer)
CREATE TABLE customer (
  user_id varchar(50) not null,
  account_id varchar(40) not null,
  profile_id varchar(40) not null,
  constraint pk_customer primary key (user_id),
  constraint fk_customer_1 foreign key (user_id) references signon_user (username),
  constraint fk_customer_2 foreign key (account_id) references account (account_id),
  constraint fk_customer_3 foreign key (profile_id) references profile (profile_id));

-- PURCHASE_ORDER: Order received by the Order Processing Center (OPC). PODATE is epoch milliseconds. POVALUE is the order total.
-- Source: CMP bean PurchaseOrderEJB (purchaseorder)
CREATE TABLE purchase_order (
  po_id varchar(40) not null,
  po_user_id varchar(50) not null,
  po_email_id varchar(120) not null,
  po_date bigint not null,
  po_locale varchar(10) not null,
  po_value double not null,
  contact_id varchar(40) not null,
  card_id varchar(40) not null,
  constraint pk_purchase_order primary key (po_id),
  constraint fk_purchase_order_1 foreign key (contact_id) references contact_info (contact_id),
  constraint fk_purchase_order_2 foreign key (card_id) references credit_card (card_id));

-- PO_LINE_ITEM: Line of a purchase order. QUANTITYSHIPPED is updated when the supplier invoices.
-- Source: CMP bean LineItemEJB (lineitem) under PurchaseOrderEJB
CREATE TABLE po_line_item (
  po_id varchar(40) not null,
  line_number varchar(10) not null,
  category_id char(10) not null,
  product_id char(10) not null,
  item_id char(10) not null,
  quantity integer not null,
  unit_price double not null,
  quantity_shipped integer not null,
  constraint pk_po_line_item primary key (po_id, line_number),
  constraint fk_po_line_item_1 foreign key (po_id) references purchase_order (po_id));

-- ORDER_MANAGER: OPC process manager state of an order. STATUS is PENDING, APPROVED, DENIED or COMPLETED.
-- Source: CMP bean ManagerEJB (processmanager)
CREATE TABLE order_manager (
  order_id varchar(40) not null,
  status varchar(20) not null,
  constraint pk_order_manager primary key (order_id));

-- SUPPLIER_ORDER: Order the supplier received from the OPC. POSTATUS is PENDING or COMPLETED.
-- Source: CMP bean SupplierOrderEJB (supplierpo)
CREATE TABLE supplier_order (
  po_id varchar(40) not null,
  po_date bigint not null,
  po_status varchar(20) not null,
  contact_id varchar(40) not null,
  constraint pk_supplier_order primary key (po_id),
  constraint fk_supplier_order_1 foreign key (contact_id) references contact_info (contact_id));

-- SUPPLIER_LINE_ITEM: Line of a supplier order.
-- Source: CMP bean LineItemEJB (lineitem) under SupplierOrderEJB
CREATE TABLE supplier_line_item (
  po_id varchar(40) not null,
  line_number varchar(10) not null,
  category_id char(10) not null,
  product_id char(10) not null,
  item_id char(10) not null,
  quantity integer not null,
  unit_price double not null,
  quantity_shipped integer not null,
  constraint pk_supplier_line_item primary key (po_id, line_number),
  constraint fk_supplier_line_item_1 foreign key (po_id) references supplier_order (po_id));

-- INVENTORY: Supplier stock level per item.
-- Source: CMP bean InventoryEJB (supplier)
CREATE TABLE inventory (
  item_id char(10) not null,
  quantity integer not null,
  constraint pk_inventory primary key (item_id));

-- COUNTER: Named sequence used by UniqueIdGeneratorEJB for order and PO identifiers.
-- Source: CMP bean CounterEJB (uidgen)
CREATE TABLE counter (
  name varchar(40) not null,
  counter integer not null,
  constraint pk_counter primary key (name));

-- Indexes on foreign keys and the columns the batch jobs filter by.
CREATE INDEX ix_product_catid ON product (catid);
CREATE INDEX ix_item_productid ON item (productid);
CREATE INDEX ix_po_user ON purchase_order (po_user_id);
CREATE INDEX ix_po_date ON purchase_order (po_date);
CREATE INDEX ix_order_manager_status ON order_manager (status);

-- Order status view used by operations: one row per order with its OPC status and value.
CREATE VIEW v_order_status AS
  SELECT p.po_id, p.po_user_id, p.po_date, p.po_value, m.status
  FROM purchase_order p JOIN order_manager m ON m.order_id = p.po_id;

-- Business checks the schema cannot express as keys. No price check on ITEM_DETAILS:
-- the shipped sample data has an item priced below cost (EST-26, ja_JP), see batch/ps_catalog_check.sh.
ALTER TABLE po_line_item ADD CONSTRAINT ck_po_line_qty CHECK (quantity > 0);
ALTER TABLE po_line_item ADD CONSTRAINT ck_po_line_shipped CHECK (quantity_shipped <= quantity);
ALTER TABLE order_manager ADD CONSTRAINT ck_order_manager_status CHECK (status in ('PENDING','APPROVED','DENIED','COMPLETED'));
ALTER TABLE supplier_order ADD CONSTRAINT ck_supplier_order_status CHECK (po_status in ('PENDING','COMPLETED'));
ALTER TABLE inventory ADD CONSTRAINT ck_inventory_qty CHECK (quantity >= 0);
