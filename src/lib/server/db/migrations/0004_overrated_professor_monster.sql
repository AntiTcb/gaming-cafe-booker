CREATE TABLE `accounts` (
    `id` text PRIMARY KEY NOT NULL,
    `account_id` text NOT NULL,
    `provider_id` text NOT NULL,
    `user_id` text NOT NULL,
    `access_token` text,
    `refresh_token` text,
    `id_token` text,
    `access_token_expires_at` integer,
    `refresh_token_expires_at` integer,
    `scope` text,
    `password` text,
    `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` integer NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint
CREATE TABLE `sessions` (
    `id` text PRIMARY KEY NOT NULL,
    `expires_at` integer NOT NULL,
    `token` text NOT NULL,
    `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `ip_address` text,
    `user_agent` text,
    `user_id` text NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE no action ON DELETE cascade
);

--> statement-breakpoint
CREATE UNIQUE INDEX `sessions_token_unique` ON `sessions` (`token`);

--> statement-breakpoint
CREATE TABLE `verifications` (
    `id` text PRIMARY KEY NOT NULL,
    `identifier` text NOT NULL,
    `value` text NOT NULL,
    `expires_at` integer NOT NULL,
    `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL
);

--> statement-breakpoint
PRAGMA foreign_keys = OFF;

--> statement-breakpoint
CREATE TABLE `__new_users` (
    `id` text PRIMARY KEY NOT NULL,
    `name` text NOT NULL,
    `email` text NOT NULL,
    `email_verified` integer DEFAULT false NOT NULL,
    `image` text,
    `created_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `updated_at` integer DEFAULT CURRENT_TIMESTAMP NOT NULL,
    `role` text DEFAULT 'guest' NOT NULL,
    CONSTRAINT "role" CHECK (
        "__new_users"."role" IN ('admin', 'staff', 'guest')
    )
);

--> statement-breakpoint
INSERT INTO
    `__new_users` (
        "id",
        "name",
        "email",
        "email_verified",
        "image",
        "role"
    )
SELECT
    "id",
    "name",
    "email",
    1,
    NULL,
    "role"
FROM
    `users`;

--> statement-breakpoint
DROP TABLE `users`;

--> statement-breakpoint
ALTER TABLE `__new_users`
RENAME TO `users`;

--> statement-breakpoint
PRAGMA foreign_keys = ON;

--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
