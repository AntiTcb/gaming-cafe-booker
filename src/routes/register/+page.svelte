<script lang="ts">
  import { STORE_NAME } from '$lib/constants';
  import { register } from '$lib/rpc/auth.remote';

  let name = $state('');
  let email = $state('');
  let password = $state('');
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

      <form {...register} oninput={() => register.validate()}>
        <div class="space-y-4">
          <div class="form-control">
            <label class="label" for={register.field('name')}>
              <span class="label-text font-semibold">Name</span>
            </label>
            <input
              type="text"
              name={register.field('name')}
              class={['input-bordered input w-full', register.issues?.name && 'input-error']}
              bind:value={name}
            />
            {#if register.issues?.name}
              <p class="text-sm text-error">{register.issues?.name.map((error) => error.message).join('\n')}</p>
            {/if}
          </div>
          <div class="form-control">
            <label class="label" for={register.field('email')}>
              <span class="label-text font-semibold">Email</span>
            </label>
            <input
              type="email"
              name={register.field('email')}
              class={['input-bordered input w-full', register.issues?.email && 'input-error']}
              bind:value={email}
            />
            {#if register.issues?.email}
              <p class="text-sm text-error">{register.issues?.email.map((error) => error.message).join('\n')}</p>
            {/if}
          </div>
          <div class="form-control">
            <label class="label" for={register.field('password')}>
              <span class="label-text font-semibold">Password</span>
            </label>
            <input
              type="password"
              name={register.field('password')}
              class={['input-bordered input w-full', register.issues?.password && 'input-error']}
              bind:value={password}
            />
            {#if register.issues?.password}
              <p class="text-sm text-error">{register.issues?.password.map((error) => error.message).join('\n')}</p>
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
          <a href="/login" class="link link-primary">Sign in here</a>
        </p>
      </div>
    </div>
  </div>
</div>
