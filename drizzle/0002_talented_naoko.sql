CREATE TABLE `account` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_name` text NOT NULL,
	`status` text DEFAULT 'active' NOT NULL,
	`contact_id` integer NOT NULL,
	`credit_card_id` integer NOT NULL,
	FOREIGN KEY (`user_name`) REFERENCES `signon_user`(`user_name`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`contact_id`) REFERENCES `contact`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`credit_card_id`) REFERENCES `credit_card`(`id`) ON UPDATE no action ON DELETE no action,
	CONSTRAINT "account_status_check" CHECK("account"."status" in ('active', 'disabled'))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `account_user_name_unique` ON `account` (`user_name`);--> statement-breakpoint
CREATE TABLE `address` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`address1` text,
	`address2` text,
	`city` text,
	`state` text,
	`postal_code` text,
	`country` text
);
--> statement-breakpoint
CREATE TABLE `contact` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`first_name` text,
	`last_name` text,
	`phone` text,
	`email` text,
	`address_id` integer NOT NULL,
	FOREIGN KEY (`address_id`) REFERENCES `address`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `contact_address_id_unique` ON `contact` (`address_id`);--> statement-breakpoint
CREATE TABLE `credit_card` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`card_number` text,
	`card_type` text,
	`card_expiry` text
);
--> statement-breakpoint
CREATE TABLE `customer` (
	`user_name` text PRIMARY KEY NOT NULL,
	FOREIGN KEY (`user_name`) REFERENCES `signon_user`(`user_name`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `profile` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_name` text,
	`language` text NOT NULL,
	`favorite_category` text,
	`my_list` integer NOT NULL,
	`banner` integer NOT NULL,
	FOREIGN KEY (`user_name`) REFERENCES `signon_user`(`user_name`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profile_user_name_unique` ON `profile` (`user_name`);--> statement-breakpoint
CREATE TABLE `signon_user` (
	`user_name` text PRIMARY KEY NOT NULL,
	`password` text NOT NULL
);
