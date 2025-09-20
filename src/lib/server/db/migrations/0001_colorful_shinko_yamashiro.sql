PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text,
	`role` text DEFAULT 'guest' NOT NULL,
	CONSTRAINT "role" CHECK("__new_users"."role" IN ('admin', 'staff', 'guest'))
);
--> statement-breakpoint
INSERT INTO `__new_users`("id", "name", "phone", "role") SELECT "id", "name", "phone", "role" FROM `users`;--> statement-breakpoint
DROP TABLE `users`;--> statement-breakpoint
ALTER TABLE `__new_users` RENAME TO `users`;--> statement-breakpoint
PRAGMA foreign_keys=ON;