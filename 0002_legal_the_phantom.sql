CREATE TABLE `penetrations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`penetration_no` text NOT NULL,
	`floor` text DEFAULT '' NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`compartment_type` text DEFAULT '防火区画' NOT NULL,
	`penetrating_item` text DEFAULT '配管' NOT NULL,
	`pipe_type` text DEFAULT '' NOT NULL,
	`size` text DEFAULT '' NOT NULL,
	`opening_size` text DEFAULT '' NOT NULL,
	`method` text DEFAULT '' NOT NULL,
	`approval_no` text DEFAULT '' NOT NULL,
	`construction_date` text DEFAULT '' NOT NULL,
	`inspection_date` text DEFAULT '' NOT NULL,
	`photo_no` text DEFAULT '' NOT NULL,
	`status` text DEFAULT '未施工' NOT NULL,
	`note` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
