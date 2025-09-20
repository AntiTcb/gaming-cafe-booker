<script lang="ts">
  import type { GameSystem, SystemType } from '$lib/server/db/schema';

  let { system }: { system: GameSystem & { systemType: SystemType } } = $props();

  const nameToInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('');
  };
</script>

<div class="collapse-arrow collapse border border-base-300">
  <input type="checkbox" />
  <div class="collapse-title">
    <div class="flex items-center gap-3 md:gap-4">
      <div
        class="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-red-500 text-lg font-bold text-white md:h-16 md:w-16 md:text-xl"
      >
        {nameToInitials(system.systemType.name)}
      </div>
      <div class="min-w-0 flex-1">
        <div class="flex flex-col items-start gap-1 md:flex-row md:items-center md:gap-2">
          <h3 class="text-sm font-bold text-primary md:text-base">{system.name}</h3>
          <span class="badge badge-sm badge-success">Available</span>
        </div>
      </div>
    </div>
  </div>
  <div class="collapse-content">
    <div class="space-y-4 pt-2">
      <div class="flex items-center gap-3">
        <div class="flex h-8 w-8 items-center justify-center rounded bg-red-500 text-sm font-bold text-white">
          {system.name}
        </div>
        <p class="text-sm text-base-content/80">
          Latest Nintendo titles • 4K gaming experience • Multiplayer support • Pro controllers included
        </p>
      </div>
      <div class="grid grid-cols-2 gap-4 text-sm">
        <div>
          <h4 class="font-semibold text-primary">Features:</h4>
          <ul class="mt-2 space-y-1 text-base-content/80">
            <li>• 4K resolution support</li>
            <li>• Enhanced performance</li>
            <li>• Backwards compatibility</li>
            <li>• Pro controller included</li>
          </ul>
        </div>
        <div>
          <h4 class="font-semibold text-primary">Popular Games:</h4>
          <ul class="mt-2 space-y-1 text-base-content/80">
            <li>• The Legend of Zelda</li>
            <li>• Super Mario Odyssey 2</li>
            <li>• Mario Kart 8 Deluxe</li>
            <li>• Super Smash Bros.</li>
          </ul>
        </div>
      </div>
      <div class="flex justify-end">
        <button class="btn btn-primary">Reserve {system.name}</button>
      </div>
    </div>
  </div>
</div>
