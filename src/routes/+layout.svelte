<script lang="ts">
  import { afterNavigate, invalidateAll } from '$app/navigation';
  import favicon from '$lib/assets/favicon.svg';
  import { logout } from '$lib/rpc/auth.remote';
  import { Toaster } from 'svelte-sonner';
  import '../app.css';
  import type { LayoutProps } from './$types';

  let { children, data }: LayoutProps = $props();
  const { session, user } = $derived(data);

  afterNavigate(() => {
    invalidateAll();
  });
</script>

<svelte:head>
  <link rel="icon" href={favicon} />
</svelte:head>

<svelte:boundary>
  <!-- Navigation -->
  <div class="navbar bg-base-200">
    <div class="navbar-start">
      <div class="dropdown">
        <div tabindex="0" role="button" class="btn btn-ghost lg:hidden">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
        </div>
        <ul class="dropdown-content menu z-[1] mt-3 w-52 menu-sm rounded-box bg-base-200 p-2">
          <li><a href="/">Home</a></li>
          <li><a href="/about">About</a></li>
          {#if user?.role === 'admin'}
            <li><a href="/admin">Admin</a></li>
          {/if}
        </ul>
      </div>
      <a href="/" class="btn text-xl btn-ghost">🎮 Level Up Gaming Cafe</a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li><a href="/">Home</a></li>
        <li><a href="/about">About</a></li>

        {#if user?.role === 'admin'}
          <li><a href="/admin">Admin</a></li>
        {/if}
      </ul>
    </div>
    <div class="navbar-end">
      {#if session}
        <span class="mr-4 text-sm text-base-content/70">Hi {user?.name}!</span>
        <button class="btn btn-primary" onclick={() => logout().then(() => invalidateAll())}>Logout</button>
      {:else}
        <a href="/login" class="btn btn-primary">Login</a>
      {/if}
    </div>
  </div>

  {@render children?.()}

  <Toaster richColors position="top-center" closeButton />
  {#snippet pending()}
    <div class="loading mx-auto block loading-lg loading-spinner text-4xl"></div>
  {/snippet}
</svelte:boundary>
