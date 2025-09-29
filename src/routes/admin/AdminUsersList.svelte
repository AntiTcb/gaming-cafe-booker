<script lang="ts">
  import { createUser, deleteUser, listUsers } from '$lib/rpc/auth.remote';
  import { toast } from 'svelte-sonner';

  let limit = $state(100);
  let offset = $state(0);
  let showCreateForm = $state(false);
  let deleteModal: string | null = $state(null);

  let createForm: { name: string; email: string; role: 'user' | 'staff' | 'admin' } = $state({
    name: '',
    email: '',
    role: 'user',
  });

  const handleCreate = async () => {
    const result = await createUser(createForm);
    await listUsers({ limit, offset }).refresh();
    if (result.success) {
      showCreateForm = false;
      createForm = { name: '', email: '', role: 'user' };
      toast.success(result.message);
      return;
    }

    toast.error(result.message);
  };

  const handleDelete = async (userId: string) => {
    const result = await deleteUser({ userId });
    await listUsers({ limit, offset }).refresh();
    if (result.success) {
      deleteModal = null;
      toast.success(result.message);
      return;
    }

    toast.error(result.message);
  };
</script>

<div class="space-y-6">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">Users Management</h2>
    <button class="btn btn-primary" onclick={() => (showCreateForm = true)}>
      <svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path>
      </svg>
      Add User
    </button>
  </div>

  <!-- Users Table -->
  <div class="max-h-[500px] overflow-x-auto rounded-md border">
    <table class="table-pin-rows table w-full table-zebra p-2">
      <thead class="bg-base-100">
        <tr class="divide-x">
          <th>Name</th>
          <th>Email</th>
          <th>Role</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {#await listUsers({ limit, offset }) then { users }}
          {#each users as user}
            <tr class="hover divide-x">
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td class="capitalize">{user.role}</td>
              <td>
                <button class="btn btn-primary">Edit</button>
                <button class="btn btn-error" onclick={() => (deleteModal = user.id)}>Delete</button>
              </td>
            </tr>
          {/each}
        {/await}
      </tbody>
    </table>
  </div>
</div>

{#if showCreateForm}
  <div class="modal-open modal">
    <div class="modal-box">
      <h3 class="mb-4 text-lg font-bold">Add New User</h3>

      <div class="space-y-4">
        <div class="form-control">
          <label class="label" for="name">
            <span class="label-text">Name</span>
          </label>
          <input type="text" id="name" class="input-bordered input" bind:value={createForm.name} />
        </div>
        <div class="form-control">
          <label class="label" for="email">
            <span class="label-text">Email</span>
          </label>
          <input type="email" id="email" class="input-bordered input" bind:value={createForm.email} />
        </div>
        <div class="form-control">
          <label class="label" for="role">
            <span class="label-text">Role</span>
          </label>
          <select id="role" class="select-bordered select" bind:value={createForm.role}>
            <option value="user">User</option>
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>
      <div class="modal-action">
        <button class="btn btn-primary" onclick={() => handleCreate()}>Add</button>
        <button class="btn btn-ghost" onclick={() => (showCreateForm = false)}>Cancel</button>
      </div>
    </div>
  </div>
{/if}

{#if deleteModal}
  <div class="modal-open modal">
    <div class="modal-box">
      <h3 class="text-lg font-bold">Confirm Deletion</h3>
      <p class="py-4">Are you sure you want to delete this user?</p>
      <div class="modal-action">
        <button class="btn btn-error" onclick={() => handleDelete(deleteModal!)}>Delete</button>
        <button class="btn btn-ghost" onclick={() => (deleteModal = null)}>Cancel</button>
      </div>
    </div>
  </div>
{/if}
