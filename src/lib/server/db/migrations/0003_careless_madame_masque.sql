CREATE TABLE `reservations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer NOT NULL,
	`start` integer NOT NULL,
	`end` integer NOT NULL,
	`game_system_id` integer NOT NULL,
	`game_id` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_system_id`) REFERENCES `game_systems`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
DROP TABLE `game_reservations`;--> statement-breakpoint
DROP TABLE `game_system_reservations`;