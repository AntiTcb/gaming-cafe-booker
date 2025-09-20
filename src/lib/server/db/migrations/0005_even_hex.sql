PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`role` text DEFAULT 'user' NOT NULL,
	CONSTRAINT "role" CHECK("__new_users"."role" IN ('admin', 'staff', 'user'))
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "email", "email_verified", "image", "created_at", "updated_at", "role") SELECT "id", "name", "email", "email_verified", "image", "created_at", "updated_at", "role" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);