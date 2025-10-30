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
        <ul class="dropdown-content menu z-1 mt-3 w-52 menu-sm rounded-box bg-base-200 p-2">
          <li><a href="/">Home</a></li>
          <li><a href="/birthday-packages">Birthday Packages</a></li>
          {#if user?.role === 'admin'}
            <li><a href="/admin">Admin</a></li>
          {/if}
        </ul>
      </div>
      <a href="/" class="btn text-xl btn-ghost">🎮 Passage Gaming Pros</a>
    </div>
    <div class="navbar-center hidden lg:flex">
      <ul class="menu menu-horizontal px-1">
        <li><a href="/">Home</a></li>
        <li><a href="/birthday-packages">Birthday Packages</a></li>

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

  <main class="max-w-8xl container mx-auto p-4 pb-24">
    {@render children?.()}
  </main>

  <!-- Footer -->
  <footer class="fixed right-0 bottom-0 left-0 z-10 border-t border-base-300 bg-base-200 p-2 text-base-content">
    <div class="flex items-center justify-around gap-4 text-sm md:gap-8">
      <div class="text-center">
        <h3 class="text-sm font-bold">Location</h3>
        <p class="text-xs text-base-content/70">143 Cow Bay Rd, Eastern Passage, NS B3G 1C2</p>
      </div>
      <div class="text-center">
        <h3 class="text-sm font-bold">Contact</h3>
        <a href="tel:902-495-7605" class="link text-xs link-primary">902-495-7605</a> |
        <a href="mailto:info@passagegamingpros.ca" class="link text-xs link-primary">info@passagegamingpros.ca</a>
      </div>
      <!-- <div>
        <h3 class="text-sm font-bold">Hours</h3>
        <p class="text-xs text-base-content/70">9am - 8pm</p>
        </div> -->
    </div>
    <!-- <div class="border-base-300 text-center">
      <p class="text-xs text-base-content/70">
        © {new Date().getFullYear()} Passage Gaming Pros. All rights reserved.
      </p>
    </div> -->
  </footer>

  <Toaster richColors position="bottom-right" duration={2000} />
  {#snippet pending()}
    <div
      class="loading mx-auto flex h-svh max-h-svh loading-lg items-center justify-center loading-spinner text-4xl"
    ></div>
  {/snippet}
</svelte:boundary>
