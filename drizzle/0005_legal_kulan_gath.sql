CREATE TABLE `supplier_contact` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text,
	`last_name` text,
	`email` text,
	`phone` text,
	`address1` text,
	`address2` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`country` text
);
--> statement-breakpoint
CREATE TABLE `supplier_line_item` (
	`supplier_order_id` integer NOT NULL,
	`line_number` integer NOT NULL,
	`category` text NOT NULL,
	`product` text NOT NULL,
	`item` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`shipped` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`supplier_order_id`, `line_number`),
	FOREIGN KEY (`supplier_order_id`) REFERENCES `supplier_order`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `supplier_order` (
	`id` integer PRIMARY KEY NOT NULL,
	`user_id` text,
	`order_date` integer NOT NULL,
	`status` text DEFAULT 'PENDING' NOT NULL,
	`contact_id` integer NOT NULL,
	FOREIGN KEY (`contact_id`) REFERENCES `supplier_contact`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "supplier_order_status_check" CHECK("supplier_order"."status" in ('PENDING', 'COMPLETED'))
);
--> statement-breakpoint
CREATE TABLE `user_role` (
	`user_name` text NOT NULL,
	`role` text NOT NULL,
	PRIMARY KEY(`user_name`, `role`),
	FOREIGN KEY (`user_name`) REFERENCES `signon_user`(`user_name`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_inventory` (
	`item_id` text PRIMARY KEY NOT NULL,
	`qty` integer NOT NULL,
	CONSTRAINT "inventory_quantity_check" CHECK("__new_inventory"."qty" >= 0)
);
--> statement-breakpoint
INSERT INTO `__new_inventory`("item_id", "qty") SELECT "item_id", "qty" FROM `inventory`;--> statement-breakpoint
DROP TABLE `inventory`;--> statement-breakpoint
ALTER TABLE `__new_inventory` RENAME TO `inventory`;--> statement-breakpoint
PRAGMA foreign_keys=ON;