<script lang="ts">
  import { STORE_NAME } from '$lib/constants';
  import { getWeeklyEvent } from '$lib/rpc/weekly-events.remote';

  const weeklyEvent = await getWeeklyEvent();
</script>

<svelte:head>
  <title>Weekly Events - {STORE_NAME}</title>
</svelte:head>

<div class="container mx-auto max-w-4xl space-y-6 p-4 md:p-8">
  <div class="mb-4 text-center md:mb-8">
    <h1 class="mb-2 text-3xl font-bold text-primary md:text-4xl">Weekly Events</h1>
    <p class="text-sm text-base-content/70 md:text-base">Check out what's happening this week!</p>
  </div>

  {#if weeklyEvent?.content}
    <div class="card border-4 border-base-300 bg-base-100 p-6">
      <div class="prose prose-sm max-w-none">{@html weeklyEvent.content}</div>
      {#if weeklyEvent.updatedAt}
        <div class="mt-4 text-right text-xs text-base-content/50">
          Last updated: {new Date(weeklyEvent.updatedAt).toLocaleDateString()}
        </div>
      {/if}
    </div>
  {:else}
    <div class="card border-4 border-base-300 bg-base-100 p-6">
      <div class="py-12 text-center">
        <p class="text-base-content/70">No weekly events posted yet. Check back soon!</p>
      </div>
    </div>
  {/if}
</div>
