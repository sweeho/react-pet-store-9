CREATE TABLE `id_counter` (
	`name` text PRIMARY KEY NOT NULL,
	`value` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_contact` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text,
	`last_name` text,
	`phone` text,
	`email` text,
	`address1` text,
	`address2` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`country` text
);
--> statement-breakpoint
CREATE TABLE `order_credit_card` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_number` text NOT NULL,
	`card_type` text NOT NULL,
	`expiry_date` text NOT NULL,
	CONSTRAINT "order_credit_card_expiry_len" CHECK(length("order_credit_card"."expiry_date") <= 10)
);
--> statement-breakpoint
CREATE TABLE `order_line_item` (
	`order_id` text NOT NULL,
	`line_number` integer NOT NULL,
	`category_id` text NOT NULL,
	`product_id` text NOT NULL,
	`item_id` text NOT NULL,
	`quantity` integer NOT NULL,
	`unit_price` real NOT NULL,
	`quantity_shipped` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`order_id`, `line_number`),
	FOREIGN KEY (`order_id`) REFERENCES `purchase_order`(`order_id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "order_line_item_quantity_check" CHECK("order_line_item"."quantity" > 0),
	CONSTRAINT "order_line_item_shipped_check" CHECK("order_line_item"."quantity_shipped" <= "order_line_item"."quantity")
);
--> statement-breakpoint
CREATE TABLE `order_message` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` text NOT NULL,
	`body` text NOT NULL,
	`status` text NOT NULL,
	`session_id` text,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_status` (
	`order_id` text PRIMARY KEY NOT NULL,
	`status` text NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `purchase_order`(`order_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `purchase_order` (
	`order_id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`email` text,
	`order_date` integer NOT NULL,
	`locale` text NOT NULL,
	`total` real NOT NULL,
	`bill_contact_id` integer NOT NULL,
	`ship_contact_id` integer NOT NULL,
	`credit_card_id` integer NOT NULL,
	FOREIGN KEY (`bill_contact_id`) REFERENCES `order_contact`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`ship_contact_id`) REFERENCES `order_contact`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`credit_card_id`) REFERENCES `order_credit_card`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `purchase_order_user_idx` ON `purchase_order` (`user_id`);--> statement-breakpoint
CREATE INDEX `purchase_order_date_idx` ON `purchase_order` (`order_date`);