CREATE TABLE `game_reservations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_system_reservation_id` integer,
	`game_id` integer,
	FOREIGN KEY (`game_system_reservation_id`) REFERENCES `game_system_reservations`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`game_id`) REFERENCES `games`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `game_system_reservations` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`game_system_id` integer,
	`user_id` integer,
	`start_date` integer NOT NULL,
	`duration` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`game_system_id`) REFERENCES `game_systems`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `game_systems` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`system_type_id` integer,
	`active` integer DEFAULT true NOT NULL,
	FOREIGN KEY (`system_type_id`) REFERENCES `system_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `game_systems_name_unique` ON `game_systems` (`name`);--> statement-breakpoint
CREATE TABLE `games` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`system_type_id` integer,
	`active` integer DEFAULT true NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`system_type_id`) REFERENCES `system_types`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `games_name_unique` ON `games` (`name`);--> statement-breakpoint
CREATE TABLE `system_types` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`role` text DEFAULT 'guest' NOT NULL,
	CONSTRAINT "role" CHECK("users"."role" IN ('admin', 'staff', 'guest'))
);
