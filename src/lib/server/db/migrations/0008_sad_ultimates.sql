PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_games` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `name` text NOT NULL,
    `system_type_id` integer NOT NULL,
    `active` integer DEFAULT true NOT NULL,
    `quantity` integer DEFAULT 1 NOT NULL,
    FOREIGN KEY (`system_type_id`) REFERENCES `system_types` (`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint
INSERT INTO
    `__new_games` (
        "id",
        "name",
        "system_type_id",
        "active",
        "quantity"
    )
SELECT
    "id",
    "name",
    "system_type_id",
    "active",
    "quantity"
FROM
    `games`;

--> statement-breakpoint
DROP TABLE `games`;

--> statement-breakpoint
ALTER TABLE `__new_games`
RENAME TO `games`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
CREATE UNIQUE INDEX `games_name_unique` ON `games` (`name`);

--> statement-breakpoint
-- ALTER TABLE `reservations` ADD `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL;
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_reservations` (
    `id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
    `user_id` integer NOT NULL,
    `start` integer NOT NULL,
    `end` integer NOT NULL,
    `game_system_id` integer NOT NULL,
    `game_id` integer NOT NULL,
    `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `user` (`id`) ON UPDATE no action ON DELETE no action,
    FOREIGN KEY (`game_system_id`) REFERENCES `game_systems` (`id`) ON UPDATE no action ON DELETE no action,
    FOREIGN KEY (`game_id`) REFERENCES `games` (`id`) ON UPDATE no action ON DELETE no action
);

--> statement-breakpoint
INSERT INTO
    `__new_reservations` (
        "id",
        "user_id",
        "start",
        "end",
        "game_system_id",
        "game_id"
    )
SELECT
    "id",
    "user_id",
    "start",
    "end",
    "game_system_id",
    "game_id"
FROM
    `reservations`;

--> statement-breakpoint
DROP TABLE `reservations`;

--> statement-breakpoint
ALTER TABLE `__new_reservations`
RENAME TO `reservations`;

PRAGMA foreign_keys = ON;
