CREATE TABLE `knowledge_reports` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`subject` text NOT NULL,
	`category` text DEFAULT '施工ルール' NOT NULL,
	`report_type` text DEFAULT '誤りの可能性' NOT NULL,
	`detail` text NOT NULL,
	`source_url` text DEFAULT '' NOT NULL,
	`status` text DEFAULT '未確認' NOT NULL,
	`resolution` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT '' NOT NULL,
	`updated_at` text DEFAULT '' NOT NULL
);
