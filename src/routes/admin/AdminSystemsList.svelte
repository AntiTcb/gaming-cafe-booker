<script lang="ts">
  import { createSystem, deleteSystem, getSystems, getSystemTypes, updateSystem } from '$lib/rpc/systems.remote';
  import { systemIconMap } from '$lib/utils/systemIconMap';
  import { toast } from 'svelte-sonner';
  import DeleteIcon from '~icons/mdi/delete';
  import EditIcon from '~icons/mdi/pencil';

  const systems = await getSystems();
  const systemTypes = await getSystemTypes();

  let editingSystem: number | null = $state(null);
  let deleteModal: number | null = $state(null);
  let showCreateForm = $state(false);

  // Edit form state
  let editForm = $state({
    name: '',
  });

  // Create form state
  let createForm = $state({
    name: '',
    systemTypeId: systemTypes[0]?.id || 0,
  });

  const startEdit = (system: { id: number; name: string }) => {
    editingSystem = system.id;
    editForm.name = system.name;
  };

  const cancelEdit = () => {
    editingSystem = null;
    editForm = { name: '' };
  };

  const saveEdit = async (systemId: number) => {
    const result = await updateSystem({
      systemId,
      name: editForm.name,
    });

    if (result.success) {
      editingSystem = null;
      editForm = { name: '' };
      toast.success(result.message);
      return;
    }

    toast.error(result.message);
  };

  const handleDelete = async (systemId: number) => {
    const result = await deleteSystem({ systemId });

    if (result.success) {
      toast.success(result.message);
      deleteModal = null;
      return;
    }

    toast.error(result.message);
  };

  const handleCreate = async () => {
    const result = await createSystem(createForm);

    if (result.success) {
      showCreateForm = false;
      createForm = {
        name: '',
        systemTypeId: systemTypes[0]?.id || 0,
      };
      toast.success(result.message);
      return;
    }

    toast.error(result.message);
  };

  const toggleSystemStatus = async (systemId: number, currentStatus: boolean) => {
    const result = await updateSystem({
      systemId,
      active: !currentStatus,
    });

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }
  };
</script>

<div class="space-y-6">
  <!-- Header with Add Button -->
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">Gaming Systems Management</h2>
    <button class="btn btn-primary" onclick={() => (showCreateForm = true)}>
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      Add System
    </button>
  </div>

  <!-- Systems Table -->
  <div class="max-h-[500px] overflow-x-auto rounded-md border">
    <table class="table w-full table-zebra p-2">
      <thead class="bg-base-100">
        <tr class="divide-x">
          <th>System Name</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each await getSystems() as { game_systems: system, system_types } (system.id)}
          {@const Icon = systemIconMap[system_types.name as keyof typeof systemIconMap]}
          <tr class="hover divide-x">
            <td>
              <div class="flex flex-col gap-2">
                {#if editingSystem === system.id}
                  <input type="text" class="input-bordered input input-md w-full" bind:value={editForm.name} />
                {:else}
                  <span class="font-medium">{system.name}</span>
                  <Icon class="size-6" />
                {/if}
              </div>
            </td>
            <td>
              <div class="tooltip" data-tip="Toggle System Status">
                <button
                  class="badge {system.active ? 'badge-success' : 'badge-error'} cursor-pointer"
                  onclick={() => toggleSystemStatus(system.id, system.active)}
                >
                  {system.active ? 'Active' : 'Inactive'}
                </button>
              </div>
            </td>
            <td>
              <div class="flex gap-2">
                {#if editingSystem === system.id}
                  <button class="btn btn-sm btn-success" onclick={() => saveEdit(system.id)}> Save </button>
                  <button class="btn btn-ghost btn-sm" onclick={cancelEdit}> Cancel </button>
                {:else}
                  <button class="btn btn-outline btn-sm" onclick={() => startEdit(system)} aria-label="Edit system">
                    <EditIcon class="size-6" />
                  </button>
                  <button
                    class="btn btn-outline btn-sm btn-error"
                    onclick={() => (deleteModal = system.id)}
                    aria-label="Delete system"
                  >
                    <DeleteIcon class="size-6" />
                  </button>
                {/if}
              </div>
            </td>
          </tr>
        {:else}
          <tr>
            <td colspan="4" class="text-center">No systems found</td>
          </tr>
        {/each}
      </tbody>
    </table>
  </div>

  <!-- Empty State -->
  {#if systems.length === 0}
    <div class="py-12 text-center">
      <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
        ></path>
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">No gaming systems</h3>
      <p class="mt-1 text-sm text-gray-500">Get started by adding a new gaming system.</p>
    </div>
  {/if}
</div>

<!-- Create System Modal -->
{#if showCreateForm}
  <div class="modal-open modal">
    <div class="modal-box">
      <h3 class="mb-4 text-lg font-bold">Add New Gaming System</h3>

      <div class="space-y-4">
        <div class="form-control">
          <label class="label" for="system-name">
            <span class="label-text">System Name</span>
          </label>
          <input
            id="system-name"
            type="text"
            class="input-bordered input"
            bind:value={createForm.name}
            placeholder="Enter system name (e.g., PlayStation 5 #1)"
          />
        </div>

        <div class="form-control">
          <label class="label" for="system-type-select">
            <span class="label-text">System Type</span>
          </label>
          <select id="system-type-select" class="select-bordered select" bind:value={createForm.systemTypeId}>
            {#each systemTypes as systemType}
              <option value={systemType.id}>{systemType.name}</option>
            {/each}
          </select>
        </div>
      </div>

      <div class="modal-action">
        <button class="btn btn-primary" onclick={handleCreate}>Create System</button>
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
      <p class="py-4">Are you sure you want to delete this gaming system? This action cannot be undone.</p>
      <div class="modal-action">
        <button class="btn btn-error" onclick={() => handleDelete(deleteModal!)}>Delete</button>
        <button class="btn btn-ghost" onclick={() => (deleteModal = null)}>Cancel</button>
      </div>
    </div>
  </div>
{/if}
