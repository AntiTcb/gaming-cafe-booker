<script lang="ts">
  import { createGame, deleteGame, getGames, getSystemTypes, updateGame } from '$lib/rpc/games.remote';
  import { systemIconMap } from '$lib/utils/systemIconMap';
  import { toast } from 'svelte-sonner';
  import DeleteIcon from '~icons/mdi/delete';
  import EditIcon from '~icons/mdi/pencil';

  const games = await getGames();
  const systemTypes = await getSystemTypes();

  let editingGame: number | null = $state(null);
  let deleteModal: number | null = $state(null);
  let showCreateForm = $state(false);

  // Edit form state
  let editForm = $state({
    name: '',
    quantity: 0,
  });

  // Create form state
  let createForm = $state({
    name: '',
    systemTypeId: systemTypes[0]?.id || 0,
    quantity: 1,
  });

  const startEdit = (game: { id: number; name: string; quantity: number }) => {
    editingGame = game.id;
    editForm.name = game.name;
    editForm.quantity = game.quantity;
  };

  const cancelEdit = () => {
    editingGame = null;
    editForm = { name: '', quantity: 0 };
  };

  const saveEdit = async (gameId: number) => {
    const result = await updateGame({
      gameId,
      name: editForm.name,
      quantity: editForm.quantity,
    });

    if (result.success) {
      editingGame = null;
      editForm = { name: '', quantity: 0 };
      toast.success(result.message);
      return;
    }

    toast.error(result.message);
  };

  const handleDelete = async (gameId: number) => {
    const result = await deleteGame({ gameId });

    if (result.success) {
      toast.success(result.message);
      deleteModal = null;
      return;
    }

    toast.error(result.message);
  };

  const handleCreate = async () => {
    const result = await createGame(createForm);

    if (result.success) {
      showCreateForm = false;
      createForm = {
        name: '',
        systemTypeId: systemTypes[0]?.id || 0,
        quantity: 1,
      };
    }
  };

  const toggleGameStatus = async (gameId: number, currentStatus: boolean) => {
    const result = await updateGame({
      gameId,
      active: !currentStatus,
    });
  };
</script>

<div class="space-y-6">
  <!-- Header with Add Button -->
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">Games Management</h2>
    <button class="btn btn-primary" onclick={() => (showCreateForm = true)}>
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      Add Game
    </button>
  </div>

  <!-- Games Table -->
  <div class="max-h-[500px] overflow-x-auto rounded-md border">
    <table class="table-pin-rows table w-full table-zebra p-2">
      <thead class="bg-base-100">
        <tr class="divide-x">
          <th>Name</th>
          <th>Quantity</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each await getGames() as { games: game, system_types } (game.id)}
          {@const Icon = systemIconMap[system_types.name as keyof typeof systemIconMap]}
          <tr class="hover divide-x">
            <td>
              <div class="flex flex-col gap-1">
                {#if editingGame === game.id}
                  <input type="text" class="input-bordered input input-md w-full" bind:value={editForm.name} />
                  <span class="badge"><Icon class="size-8" /></span>
                {:else}
                  <span class="font-medium">{game.name}</span>
                  <span class="badge"><Icon class="size-8" /></span>
                {/if}
              </div>
            </td>
            <td>
              {#if editingGame === game.id}
                <input
                  type="number"
                  class="input-bordered input input-sm w-20"
                  bind:value={editForm.quantity}
                  min="0"
                />
              {:else}
                <span class="font-mono">{game.quantity}</span>
              {/if}
            </td>
            <td>
              <div class="tooltip" data-tip="Toggle Game Status">
                <button
                  class="badge {game.active ? 'badge-success' : 'badge-error'} cursor-pointer"
                  onclick={() => toggleGameStatus(game.id, game.active)}
                >
                  {game.active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </td>
            <td>
              <div class="flex gap-2">
                {#if editingGame === game.id}
                  <button class="btn btn-sm btn-success" onclick={() => saveEdit(game.id)}> Save </button>
                  <button class="btn btn-ghost btn-sm" onclick={cancelEdit}> Cancel </button>
                {:else}
                  <button class="btn btn-outline btn-sm" onclick={() => startEdit(game)} aria-label="Edit game">
                    <EditIcon class="size-6" />
                  </button>
                  <button
                    class="btn btn-outline btn-sm btn-error"
                    onclick={() => (deleteModal = game.id)}
                    aria-label="Delete game"
                  >
                    <DeleteIcon class="size-6" />
                  </button>
                {/if}
              </div>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="5" class="text-center">No games found</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Empty State -->
  {#if games.length === 0}
    <div class="py-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-3m-13 0h3m-3 0l3-3m0 0l3 3M9 7h6"
        ></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No games</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by creating a new game.</p>
    </div>
  {/if}
</div>

<!-- Create Game Modal -->
{#if showCreateForm}
  <div class="modal-open modal">
    <div class="modal-box">
      <h3 class="mb-4 text-lg font-bold">Add New Game</h3>

      <div class="space-y-4">
        <div class="form-control">
          <label class="label" for="game-name">
            <span class="label-text">Game Name</span>
          </label>
          <input
            id="game-name"
            type="text"
            class="input-bordered input"
            bind:value={createForm.name}
            placeholder="Enter game name"
          />
        </div>

        <div class="form-control">
          <label class="label" for="system-type">
            <span class="label-text">System Type</span>
          </label>
          <select id="system-type" class="select-bordered select" bind:value={createForm.systemTypeId}>
            {#each systemTypes as systemType}
              <option value={systemType.id}>{systemType.name}</option>
            {/each}
          </select>
        </div>

        <div class="form-control">
          <label class="label" for="quantity">
            <span class="label-text">Quantity</span>
          </label>
          <input id="quantity" type="number" class="input-bordered input" bind:value={createForm.quantity} min="1" />
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" onclick={handleCreate}>Create Game</button>
        <button class="btn btn-ghost" onclick={() => (showCreateForm = false)}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

<!-- Delete Confirmation Modal -->
{#if deleteModal}
  <div class="modal-open modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Confirm Deletion</h3>
      <p class="py-4">Are you sure you want to delete this game?</p>
      <div class="modal-action">
        <button class="btn btn-error" onclick={() => handleDelete(deleteModal!)}>Deactivate</button>
        <button class="btn btn-ghost" onclick={() => (deleteModal = null)}>Cancel</button>
      </div>
    </div>
  </div>
{/if}
