CREATE TABLE `tasks` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`location` text DEFAULT '' NOT NULL,
	`assignee` text DEFAULT '' NOT NULL,
	`due_date` text DEFAULT '' NOT NULL,
	`priority` text DEFAULT '中' NOT NULL,
	`status` text DEFAULT '未着手' NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
