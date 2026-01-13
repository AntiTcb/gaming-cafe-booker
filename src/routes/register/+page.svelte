<script lang="ts">
  import { STORE_NAME } from '$lib/constants';
  import { register } from '$lib/rpc/auth.remote';
  import { page } from '$app/stores';

  let name = $state('');
  let email = $state('');
  let password = $state('');

  const redirectUrl = $derived($page.url.searchParams.get('redirect') || '/');
</script>

<svelte:head>
  <title>Register - {STORE_NAME}</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-base-100 p-4">
  <div class="card w-full max-w-md border-4 bg-base-100 shadow-xl">
    <div class="card-body">
      <div class="mb-6 text-center">
        <h1 class="mb-2 text-3xl font-bold text-primary">🎮 Welcome!</h1>
        <p class="text-base-content/70">Sign up to {STORE_NAME}</p>
      </div>

      <!-- Info Message -->
      {#if redirectUrl.includes('openModal')}
        <div class="alert alert-info mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span class="text-sm">Please create an account to book a reservation</span>
        </div>
      {/if}

      <form {...register} oninput={() => register.validate()}>
        <input type="hidden" name="redirect" value={redirectUrl} />
        <div class="space-y-4">
          <div class="form-control">
            <label class="label" for={register.fields.name.as('text').name}>
              <span class="label-text font-semibold">Name</span>
            </label>
            <input
              {...register.fields.name.as('text')}
              class={['input-bordered input w-full', register.fields.name.issues() && 'input-error']}
              bind:value={name}
            />
            {#if register.fields.name.issues()}
              <p class="text-sm text-error">
                {register.fields.name
                  .issues()!
                  .map((error) => error.message)
                  .join('\n')}
              </p>
            {/if}
          </div>
          <div class="form-control">
            <label class="label" for={register.fields.email.as('email').name}>
              <span class="label-text font-semibold">Email</span>
            </label>
            <input
              {...register.fields.email.as('email')}
              class={['input-bordered input w-full', register.fields.email.issues() && 'input-error']}
              bind:value={email}
            />
            {#if register.fields.email.issues()}
              <p class="text-sm text-error">
                {register.fields.email
                  .issues()!
                  .map((error) => error.message)
                  .join('\n')}
              </p>
            {/if}
          </div>
          <div class="form-control">
            <label class="label" for={register.fields.password.as('password').name}>
              <span class="label-text font-semibold">Password</span>
            </label>
            <input
              {...register.fields.password.as('password')}
              class={['input-bordered input w-full', register.fields.password.issues() && 'input-error']}
              bind:value={password}
            />
            {#if register.fields.password.issues()}
              <p class="text-sm text-error">
                {register.fields.password
                  .issues()!
                  .map((error) => error.message)
                  .join('\n')}
              </p>
            {/if}
          </div>
          <button
            type="submit"
            class="btn w-full btn-primary"
            disabled={!name || !email || !password || register.pending > 0}
          >
            Register
          </button>
        </div>
      </form>

      <div class="divider">OR</div>
      <div class="space-y-2 text-center">
        <p class="text-sm text-base-content/70">
          Already have an account?
          <a href={redirectUrl.includes('openModal') ? `/login?redirect=${encodeURIComponent(redirectUrl)}` : '/login'} class="link link-primary">Sign in here</a>
        </p>
      </div>
    </div>
  </div>
</div>
