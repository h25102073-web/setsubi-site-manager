CREATE TABLE `audit_logs` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`actor_email` text NOT NULL,
	`action` text NOT NULL,
	`entity_type` text NOT NULL,
	`entity_id` text DEFAULT '' NOT NULL,
	`summary` text DEFAULT '' NOT NULL,
	`before_json` text DEFAULT '' NOT NULL,
	`after_json` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `audit_project_idx` ON `audit_logs` (`project_id`);--> statement-breakpoint
CREATE TABLE `feedback` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`user_email` text NOT NULL,
	`category` text DEFAULT '改善提案' NOT NULL,
	`screen` text DEFAULT '' NOT NULL,
	`detail` text NOT NULL,
	`rating` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT '未対応' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `feedback_project_idx` ON `feedback` (`project_id`);--> statement-breakpoint
CREATE TABLE `knowledge_revisions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`subject` text NOT NULL,
	`category` text NOT NULL,
	`change_summary` text NOT NULL,
	`basis_type` text DEFAULT '一般的な目安' NOT NULL,
	`source_url` text DEFAULT '' NOT NULL,
	`checked_at` text DEFAULT '' NOT NULL,
	`actor_email` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE INDEX `revision_project_idx` ON `knowledge_revisions` (`project_id`);--> statement-breakpoint
CREATE TABLE `project_members` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`project_id` text NOT NULL,
	`email` text NOT NULL,
	`role` text DEFAULT 'viewer' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `project_member_unique` ON `project_members` (`project_id`,`email`);--> statement-breakpoint
CREATE INDEX `member_email_idx` ON `project_members` (`email`);--> statement-breakpoint
CREATE TABLE `project_settings` (
	`project_id` text PRIMARY KEY NOT NULL,
	`adopted_systems` text DEFAULT '{}' NOT NULL,
	`favorite_materials` text DEFAULT '{}' NOT NULL,
	`manufacturers` text DEFAULT '{}' NOT NULL,
	`onboarding_completed` integer DEFAULT false NOT NULL,
	`meeting_audio_retention_days` integer DEFAULT 90 NOT NULL,
	`recording_consent_required` integer DEFAULT true NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `projects` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_email` text NOT NULL,
	`name` text NOT NULL,
	`company` text DEFAULT '' NOT NULL,
	`site_code` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `user_settings` (
	`email` text PRIMARY KEY NOT NULL,
	`active_project_id` text DEFAULT '' NOT NULL,
	`accepted_terms_version` text DEFAULT '' NOT NULL,
	`accepted_at` text DEFAULT '' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `documents` ADD `project_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `documents_project_idx` ON `documents` (`project_id`);--> statement-breakpoint
ALTER TABLE `knowledge_reports` ADD `project_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `knowledge_project_idx` ON `knowledge_reports` (`project_id`);--> statement-breakpoint
ALTER TABLE `materials` ADD `project_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `materials_project_idx` ON `materials` (`project_id`);--> statement-breakpoint
ALTER TABLE `meeting_minutes` ADD `project_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE `meeting_minutes` ADD `consent_confirmed` integer DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `meeting_minutes` ADD `retention_until` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `minutes_project_idx` ON `meeting_minutes` (`project_id`);--> statement-breakpoint
ALTER TABLE `penetrations` ADD `project_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `penetrations_project_idx` ON `penetrations` (`project_id`);--> statement-breakpoint
ALTER TABLE `schedules` ADD `project_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `schedules_project_idx` ON `schedules` (`project_id`);--> statement-breakpoint
ALTER TABLE `tasks` ADD `project_id` text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE INDEX `tasks_project_idx` ON `tasks` (`project_id`);