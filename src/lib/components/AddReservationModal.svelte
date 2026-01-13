<script lang="ts">
  import { STORE_HOURS } from '$lib/constants';
  import { createReservation, getAvailableGames } from '$lib/rpc/reservations.remote';
  import { systemIconMap } from '$lib/utils/systemIconMap';
  import { DateTime } from 'luxon';
  import { resource } from 'runed';
  import { toast } from 'svelte-sonner';

  const { close }: { close: () => void } = $props();

  let search: string | null = $state('');

  const handleClose = () => {
    close();
  };

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

  const currentDay = DateTime.now().setZone('America/Halifax');

  $inspect('date', date);
  $inspect('currentDay', currentDay.toLocal().toLocaleString());
  $inspect('isTodaySelected', DateTime.fromISO(`${date}T00:00:00`).toLocaleString() === currentDay.toLocaleString());
</script>

<input type="hidden" name="start" value={start} />
<input type="hidden" name="end" value={end} />

<div class="relative mb-4">
  <h2 class="text-xl font-bold">Add Reservation</h2>
  <button
    type="button"
    onclick={handleClose}
    class="btn absolute top-0 right-0 btn-circle btn-ghost btn-sm"
    aria-label="Close modal"
  >
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
    </svg>
  </button>
</div>

<div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <fieldset class="fieldset w-full sm:w-auto">
    <legend class="fieldset-legend text-base sm:text-lg">Date & Time</legend>
    <div class="join w-full sm:w-auto">
      <input
        type="date"
        min={getMinDate()}
        class="input-bordered input text-sm sm:text-base"
        name="date"
        bind:value={date}
        required
      />
      <select class="select-bordered select text-sm sm:text-base" name="time" bind:value={time}>
        <option disabled selected value="">Pick a Time</option>
        {#each Array.from({ length: STORE_HOURS.CLOSE - STORE_HOURS.OPEN }, (_, i) => STORE_HOURS.OPEN + i) as hour (hour)}
          {@const isTodaySelected =
            DateTime.fromISO(`${date}T00:00:00`).toLocaleString() === currentDay.toLocal().toLocaleString()}
          {@const currentHour = currentDay.hour}
          {@const currentMinutes = currentDay.minute}
          {@const show00 = !isTodaySelected || hour > currentHour}
          {@const show30 = !isTodaySelected || hour > currentHour || (hour === currentHour && currentMinutes < 30)}
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
    <label for="search" class="input w-full sm:w-auto sm:min-w-[200px]">
      <svg class="h-[1em] shrink-0 opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <g stroke-linejoin="round" stroke-linecap="round" stroke-width="2.5" fill="none" stroke="currentColor">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="m21 21-4.3-4.3"></path>
        </g>
      </svg>
      <input type="search" name="search" placeholder="Search Games" class="text-sm sm:text-base" bind:value={search} />
    </label>
  {/if}
</div>

<div class="divider"></div>

{#if availableGamesResource.loading}
  <div class="loading loading-lg loading-bars"></div>
{:else}
  {@const availableToReserve = availableGamesResource.current?.availableToReserve ?? []}
  <div class="join join-vertical flex">
    {#each Object.entries(availableToReserve).filter(([_, games]) => games.length > 0) as [systemName, games] (systemName)}
      {@const filteredGames = games.filter(({ games: g }) =>
        g.name.toLowerCase().includes(search?.toLowerCase() ?? '')
      )}
      {@const SystemIcon = systemIconMap[systemName as keyof typeof systemIconMap]}
      {@const systemId = games[0].games.systemTypeId}
      <div class="collapse-arrow collapse join-item border border-base-300 bg-base-100">
        <input type="radio" name="system-collapse" checked={systemName === 'Nintendo Switch 2'} />
        <div
          class="collapse-title inline-flex items-center gap-2 px-3 py-2 text-base font-semibold sm:px-4 sm:py-3 sm:text-lg"
        >
          <SystemIcon class="size-5 shrink-0 sm:size-6" />
          <span class="truncate"
            >{systemName} ({filteredGames.length}
            {filteredGames.length === 1 ? 'game' : 'games'})</span
          >
        </div>
        <div class="collapse-content">
          <ul class="list max-h-60 divide-y overflow-y-auto sm:max-h-72">
            {#each filteredGames as { games: game } (game.id)}
              <li class="list-row rounded-none px-2 py-2 sm:px-4 sm:py-3">
                <div></div>
                <div class="truncate pr-2 text-sm sm:text-base">{game.name}</div>
                <button
                  class="btn shrink-0 btn-sm btn-primary sm:btn-md"
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
