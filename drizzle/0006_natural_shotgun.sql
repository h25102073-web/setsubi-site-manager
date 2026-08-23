CREATE TABLE `meeting_minutes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`meeting_date` text DEFAULT '' NOT NULL,
	`participants` text DEFAULT '' NOT NULL,
	`duration` integer DEFAULT 0 NOT NULL,
	`transcript` text NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`decisions` text DEFAULT '[]' NOT NULL,
	`actions` text DEFAULT '[]' NOT NULL,
	`pending` text DEFAULT '[]' NOT NULL,
	`speakers` text DEFAULT '[]' NOT NULL,
	`analysis_source` text DEFAULT 'local' NOT NULL,
	`audio_object_key` text DEFAULT '' NOT NULL,
	`audio_content_type` text DEFAULT '' NOT NULL,
	`created_at` text DEFAULT '' NOT NULL
);
