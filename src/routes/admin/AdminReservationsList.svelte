<script lang="ts">
  import { STORE_HOURS } from '$lib/constants';
  import { listUsers } from '$lib/rpc/auth.remote';
  import {
    cancelReservation,
    createReservation,
    getAdminReservations,
    getAvailableGames,
  } from '$lib/rpc/reservations.remote';
  import { systemIconMap } from '$lib/utils/systemIconMap';
  import { DateTime } from 'luxon';
  import { resource } from 'runed';
  import { toast } from 'svelte-sonner';
  import DeleteIcon from '~icons/mdi/delete';

  const { users } = await listUsers({ limit: 100, offset: 0 });

  let showCreateModal = $state(false);
  let deleteModal: number | null = $state(null);
  let createForm = $state({
    userId: '',
  });

  const getMinDate = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (new Date().getHours() >= STORE_HOURS.CLOSE) {
      today.setDate(today.getDate() + 1);
    }
    return today.toISOString().split('T')[0];
  };

  let date: string | null = $state(getMinDate());
  let time: number | null = $state(0);
  let search: string | null = $state('');

  const dateTime = $derived.by(() => {
    if (!date || !time) return '';
    const hour = time < 10 ? `0${time}` : time;
    return `${date}T${hour}:00`;
  });

  // Create a date object treating the input as local time, then convert to UTC
  const start = $derived.by(() => {
    if (!dateTime) return '';
    const [dateStr, timeStr] = dateTime.split('T');
    const [year, month, day] = dateStr.split('-').map(Number);
    const hour = parseInt(timeStr.split(':')[0]);

    return DateTime.fromObject({ year, month, day, hour }).setZone('America/Halifax').toUTC().toISO() ?? '';
  });

  const end = $derived.by(() => {
    if (!start) return '';
    const localDate = new Date(start);
    localDate.setHours(localDate.getHours() + 1);
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

  const handleDelete = async (reservationId: number) => {
    const result = await cancelReservation({ reservationId });
    if (result.success) {
      toast.success(result.message);
      deleteModal = null;
      await getAdminReservations().refresh();
      return;
    }
    toast.error(result.message);
  };
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">Reservations Management</h2>
    <button class="btn btn-primary" onclick={() => (showCreateModal = true)}>
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      Add Reservation
    </button>
  </div>

  <div class="h-full overflow-x-auto rounded-md border">
    <table class="table-pin-rows table w-full bg-base-200 p-2">
      {#await getAdminReservations() then reservations}
        {@const groupedByStartDate = reservations.reduce(
          (acc, reservation) => {
            acc[reservation.start.toDateString()] = [...(acc[reservation.start.toDateString()] || []), reservation];
            return acc;
          },
          {} as Record<string, (typeof reservations)[number][]>
        )}
        {#each Object.entries(groupedByStartDate).reverse() as [startDate, reservation] (startDate)}
          <thead>
            <tr class="z-20">
              <th colspan="7"
                >{new Date(startDate).toLocaleString('en-US', {
                  dateStyle: 'full',
                })}</th
              >
            </tr>
            <tr class="z-10">
              <th></th>
              <th>Name</th>
              <th>Game</th>
              <th>System Type</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {#each reservation as r}
              <tr>
                <td></td>
                <td>{r.user.name}</td>
                <td>{r.game.name}</td>
                <td>{r.systemType.name}</td>
                <td
                  >{r.start.toLocaleString('en-US', {
                    timeStyle: 'short',
                  })} - {r.end.toLocaleString('en-US', {
                    timeStyle: 'short',
                  })}</td
                >
                <td>
                  <button class="btn btn-error" onclick={() => (deleteModal = r.id)}>
                    <DeleteIcon class="size-6" />
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        {/each}
      {/await}
    </table>
  </div>
</div>

{#if showCreateModal}
  <div class="modal-open modal">
    <div class="modal-box">
      <h3 class="mb-4 text-lg font-bold">Add New Reservation</h3>

      <div class="space-y-4">
        <div class="form-control">
          <label class="label" for="user-select">
            <span class="label-text">User</span>
            <select id="user-select" class="select-bordered select" bind:value={createForm.userId}>
              {#each users as user}
                <option value={user.id}>{user.name}</option>
              {/each}
            </select>
          </label>
        </div>

        {#if createForm.userId}
          <div class="form-control">
            <fieldset class="fieldset">
              <legend class="fieldset-legend text-lg">Date & Time</legend>
              <div class="join">
                <input
                  type="date"
                  min={getMinDate()}
                  class="input-bordered input"
                  name="date"
                  bind:value={date}
                  required
                />
                <select class="select-bordered select" name="time" bind:value={time}>
                  <option disabled selected value={0}>Pick a Time</option>
                  {#each Array.from({ length: STORE_HOURS.CLOSE - STORE_HOURS.OPEN }, (_, i) => STORE_HOURS.OPEN + i) as hour (hour)}
                    {@const disabled = hour < currentDay.getHours() + 1 && currentDay.getHours() < STORE_HOURS.CLOSE}
                    <option value={hour} {disabled}>{hour <= 12 ? hour : hour - 12}:00 {hour < 12 ? 'AM' : 'PM'}</option
                    >
                  {/each}
                </select>
              </div>
            </fieldset>
            {#if availableGamesResource.current?.availableToReserve.length !== 0}
              <label for="search" class="input">
                <svg class="h-[1em] opacity-50" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                  <g
                    stroke-linejoin="round"
                    stroke-linecap="round"
                    stroke-width="2.5"
                    fill="none"
                    stroke="currentColor"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </g>
                </svg>
                <input type="search" name="search" placeholder="Search Games" bind:value={search} />
              </label>
            {/if}
          </div>
        {/if}

        {#if start && end}
          <div class="form-control">
            {#if availableGamesResource.loading}
              <div class="loading loading-lg loading-bars"></div>
            {:else}
              {@const availableToReserve = availableGamesResource.current?.availableToReserve ?? []}
              <div class="join-vertical join flex">
                {#each Object.entries(availableToReserve) as [systemName, games] (systemName)}
                  {@const filteredGames = games.filter(({ games: g }) =>
                    g.name.toLowerCase().includes(search?.toLowerCase() ?? '')
                  )}
                  {@const SystemIcon = systemIconMap[systemName as keyof typeof systemIconMap]}
                  {@const systemId = games[0]?.games.systemTypeId}
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
                                  userId: createForm.userId,
                                  gameId: game.id,
                                  gameSystemId: systemId,
                                  start,
                                  end,
                                });

                                if (!success) {
                                  toast.error(message);
                                  return;
                                }

                                await getAdminReservations().refresh();

                                toast.success(message);
                                showCreateModal = false;
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
          </div>
        {/if}
      </div>

      <div class="modal-action">
        <!-- <button class="btn btn-primary" onclick={() => (showCreateForm = false)}>Add Reservation</button> -->
        <button class="btn btn-ghost" onclick={() => (showCreateModal = false)}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

{#if deleteModal}
  <div class="modal-open modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Confirm Deletion</h3>
      <p class="py-4">Are you sure you want to delete this reservation?</p>
      <div class="modal-action">
        <button class="btn btn-error" onclick={() => handleDelete(deleteModal!)}>Delete</button>
        <button class="btn btn-ghost" onclick={() => (deleteModal = null)}>Cancel</button>
      </div>
    </div>
  </div>
{/if}
