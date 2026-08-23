CREATE TABLE `materials` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`pipe_type` text DEFAULT '' NOT NULL,
	`size` text DEFAULT '' NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`unit` text DEFAULT '個' NOT NULL,
	`vendor` text DEFAULT '' NOT NULL,
	`status` text DEFAULT '未発注' NOT NULL,
	`needed_date` text DEFAULT '' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
--> statement-breakpoint
CREATE TABLE `schedules` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`unit` text DEFAULT 'm' NOT NULL,
	`quantity` integer DEFAULT 0 NOT NULL,
	`labor_rate` integer DEFAULT 0 NOT NULL,
	`factor` integer DEFAULT 100 NOT NULL,
	`crew` integer DEFAULT 1 NOT NULL,
	`utilization` integer DEFAULT 85 NOT NULL,
	`start_date` text DEFAULT '' NOT NULL,
	`actual_quantity` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
