/// <reference types="./worker-configuration" />
import type { DrizzleClient } from '$lib/server/db';
import 'unplugin-icons/types/svelte';
import type { BetterAuth } from './auth';

declare global {
  namespace App {
    interface Platform {
      env: Env;
      cf: CfProperties;
      ctx: ExecutionContext;
    }
    interface Locals {
      db: DrizzleClient;
      auth: BetterAuth;
    }
  }
}

export {};
