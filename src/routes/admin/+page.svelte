<script lang="ts">
  import AdminGameList from './AdminGameList.svelte';
  import AdminReservationsList from './AdminReservationsList.svelte';
  import AdminSystemsList from './AdminSystemsList.svelte';
  import AdminUsersList from './AdminUsersList.svelte';
</script>

<h1 class="mb-4 text-2xl font-bold">Admin Panel</h1>

<div class="tabs-lift tabs">
  <input type="radio" name="admin_tabs" class="tab" aria-label="Games" checked />
  <div class="tab-content border-base-300 bg-base-100 p-6">
    <AdminGameList />
  </div>

  <input type="radio" name="admin_tabs" class="tab" aria-label="Systems" />
  <div class="tab-content border-base-300 bg-base-100 p-6">
    <AdminSystemsList />
  </div>

  <input type="radio" name="admin_tabs" class="tab" aria-label="Reservations" />
  <div class="tab-content border-base-300 bg-base-100 p-6">
    <AdminReservationsList />
  </div>

  <input type="radio" name="admin_tabs" class="tab" aria-label="Users" />
  <div class="tab-content border-base-300 bg-base-100 p-6">
    <AdminUsersList />
  </div>
</div>
