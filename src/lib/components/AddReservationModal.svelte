<script lang="ts">
  import { STORE_HOURS } from '$lib/constants';
  import { createReservation, getAvailableGames } from '$lib/rpc/reservations.remote';
  import { systemIconMap } from '$lib/utils/systemIconMap';
  import { DateTime } from 'luxon';
  import { resource } from 'runed';
  import { toast } from 'svelte-sonner';

  const { close }: { close: () => void } = $props();

  let search: string | null = $state('');

  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date().getHours() >= STORE_HOURS.CLOSE) {
      today.setDate(today.getDate() + 1);
    }
    return today.toISOString().split('T')[0];
  };

  let date: string | null = $state(getMinDate());
  let time: string | null = $state('');

  const dateTime = $derived.by(() => {
    if (!date || !time) return '';
    return `${date}T${time}`;
  });

  // Create a date object treating the input as local time, then convert to UTC
  const start = $derived.by(() => {
    if (!dateTime) return '';
    const [dateStr, timeStr] = dateTime.split('T');
    const [year, month, day] = dateStr.split('-').map(Number);
    const [hour, minute] = timeStr.split(':').map(Number);

    return DateTime.fromObject({ year, month, day, hour, minute }).setZone('America/Halifax').toUTC().toISO() ?? '';
  });

  const end = $derived.by(() => {
    if (!start) return '';
    const localDate = new Date(start);
    localDate.setHours(localDate.getHours() + 1);
    localDate.setMinutes(localDate.getMinutes() + 30);
    localDate.setSeconds(localDate.getSeconds() - 1);
    return localDate.toISOString();
  });

  const availableGamesResource = resource(
    [() => date, () => time],
    async ([date, time]) => {
      if (!date || !time) return { availableToReserve: [] };
      const availableGames = await getAvailableGames({ start, end });
      console.log(availableGames);
      return availableGames;
    },
    {
      debounce: 200,
      initialValue: { availableToReserve: [] },
      lazy: true,
    }
  );

  const currentDay = new Date();
</script>

<input type="hidden" name="start" value={start} />
<input type="hidden" name="end" value={end} />

<div class="flex items-center justify-between gap-2">
  <fieldset class="fieldset">
    <legend class="fieldset-legend text-lg">Date & Time</legend>
    <div class="join">
      <input type="date" min={getMinDate()} class="input-bordered input" name="date" bind:value={date} required />
      <select class="select-bordered select" name="time" bind:value={time}>
        <option disabled selected value="">Pick a Time</option>
        {#each Array.from({ length: STORE_HOURS.CLOSE - STORE_HOURS.OPEN }, (_, i) => STORE_HOURS.OPEN + i) as hour (hour)}
          {@const isToday = date === currentDay.toISOString().split('T')[0]}
          {@const currentHour = currentDay.getHours()}
          {@const currentMinutes = currentDay.getMinutes()}
          {@const show00 = !isToday || hour > currentHour}
          {@const show30 = !isToday || hour > currentHour || (hour === currentHour && currentMinutes < 30)}
          {#if show00}
            {@const displayHour = hour <= 12 ? hour : hour - 12}
            {@const period = hour < 12 ? 'AM' : 'PM'}
            {@const timeValue = `${hour.toString().padStart(2, '0')}:00`}
            <option value={timeValue}>{displayHour}:00 {period}</option>
          {/if}
          {#if show30}
            {@const displayHour = hour <= 12 ? hour : hour - 12}
            {@const period = hour < 12 ? 'AM' : 'PM'}
            {@const timeValue = `${hour.toString().padStart(2, '0')}:30`}
            <option value={timeValue}>{displayHour}:30 {period}</option>
          {/if}
        {/each}
      </select>
    </div>
  </fieldset>
  {#if availableGamesResource.current?.availableToReserve.length !== 0}
    <label for="search" class="input">
      <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </g>
      </svg>
      <input type="search" name="search" placeholder="Search Games" bind:value={search} />
    </label>
  {/if}
</div>

<div class="divider"></div>

{#if availableGamesResource.loading}
  <div class="loading loading-lg loading-bars"></div>
{:else}
  {@const availableToReserve = availableGamesResource.current?.availableToReserve ?? []}
  <div class="join-vertical join flex">
    {#each Object.entries(availableToReserve).filter(([_, games]) => games.length > 0) as [systemName, games] (systemName)}
      {@const filteredGames = games.filter(({ games: g }) =>
        g.name.toLowerCase().includes(search?.toLowerCase() ?? '')
      )}
      {@const SystemIcon = systemIconMap[systemName as keyof typeof systemIconMap]}
      {@const systemId = games[0].games.systemTypeId}
      <div class="collapse-arrow collapse join-item border border-base-300 bg-base-100">
        <input type="radio" name="system-collapse" checked={systemName === 'Nintendo Switch 2'} />
        <div class="collapse-title inline-flex items-center gap-2 text-lg font-semibold">
          <SystemIcon class="size-6" />
          {systemName} ({filteredGames.length}
          {filteredGames.length === 1 ? 'game' : 'games'})
        </div>
        <div class="collapse-content">
          <ul class="list max-h-72 divide-y overflow-y-auto">
            {#each filteredGames as { games: game } (game.id)}
              <li class="list-row rounded-none">
                <div></div>
                <div>{game.name}</div>
                <button
                  class="btn btn-primary"
                  onclick={async () => {
                    const { success, message, reservation } = await createReservation({
                      gameId: game.id,
                      gameSystemId: systemId,
                      start,
                      end,
                    });

                    time = '';

                    if (!success) {
                      toast.error(message);
                      return;
                    }

                    toast.success(message);
                    close();
                  }}>Reserve</button
                >
              </li>
            {/each}
          </ul>
        </div>
      </div>
    {/each}
  </div>
{/if}
