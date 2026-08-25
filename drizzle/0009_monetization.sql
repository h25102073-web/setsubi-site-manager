CREATE TABLE `subscriptions` (
	`email` text PRIMARY KEY NOT NULL,
	`plan` text DEFAULT 'free' NOT NULL,
	`status` text DEFAULT 'inactive' NOT NULL,
	`billing_interval` text DEFAULT 'month' NOT NULL,
	`stripe_customer_id` text DEFAULT '' NOT NULL,
	`stripe_subscription_id` text DEFAULT '' NOT NULL,
	`current_period_end` text DEFAULT '' NOT NULL,
	`cancel_at_period_end` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscription_customer_unique` ON `subscriptions` (`stripe_customer_id`);
--> statement-breakpoint
CREATE UNIQUE INDEX `subscription_stripe_unique` ON `subscriptions` (`stripe_subscription_id`);
