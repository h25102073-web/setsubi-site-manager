CREATE TABLE `documents` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`category` text DEFAULT '施工計画書' NOT NULL,
	`file_name` text NOT NULL,
	`object_key` text NOT NULL,
	`content_type` text DEFAULT 'application/pdf' NOT NULL,
	`file_size` integer DEFAULT 0 NOT NULL,
	`page_count` integer DEFAULT 0 NOT NULL,
	`extracted_text` text DEFAULT '' NOT NULL,
	`status` text DEFAULT '読取済み' NOT NULL,
	`sharing` text DEFAULT '自社のみ' NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
