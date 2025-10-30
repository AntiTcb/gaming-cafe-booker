<script lang="ts">
  import { STORE_NAME } from '$lib/constants';
  import { login } from '$lib/rpc/auth.remote';
  import { sendForgotPasswordEmail } from '$lib/rpc/email.remote';
  import { toast } from 'svelte-sonner';
  import { fade } from 'svelte/transition';

  let email = $state('');
  let password = $state('');
</script>

<svelte:head>
  <title>Login - {STORE_NAME}</title>
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-base-100 p-4">
  <div class="card w-full max-w-md border-4 bg-base-100 shadow-xl">
    <div class="card-body">
      <!-- Header -->
      <div class="mb-6 text-center">
        <h1 class="mb-2 text-3xl font-bold text-primary">🎮 Welcome Back!</h1>
        <p class="text-base-content/70">Sign in to {STORE_NAME}</p>
      </div>

      <!-- Login Form -->
      <form
        {...login.enhance(async ({ form, data, submit }) => {
          await submit();
        })}
        oninput={() => login.validate()}
      >
        <div class="space-y-4">
          <!-- Email Field -->
          <div class="form-control">
            <label class="label" for="email">
              <span class="label-text font-semibold">Email</span>
            </label>
            <input
              {...login.fields.email.as('email')}
              type="email"
              placeholder="Enter your email"
              aria-invalid={!!login.fields.email.issues}
              class={['input-bordered input w-full', login.fields.email.issues() && 'input-error']}
              bind:value={email}
              autocomplete="email"
              required
            />
            {#if login.fields.email.issues()}
              <p class="text-sm text-error">
                {login.fields.email
                  .issues()!
                  .map((error) => error.message)
                  .join('\n')}
              </p>
            {/if}
          </div>

          <!-- Password Field -->
          <div class="form-control">
            <label class="label" for="password">
              <span class="label-text font-semibold">Password</span>
            </label>
            <input
              {...login.fields.password.as('password')}
              type="password"
              placeholder="Enter your password"
              aria-invalid={!!login.fields.password.issues()}
              class={['input-bordered input w-full', login.fields.password.issues() && 'input-error']}
              bind:value={password}
              autocomplete="current-password"
              required
            />
            {#if login.fields.password.issues()}
              <p class="text-sm text-error">
                {login.fields.password
                  .issues()!
                  .map((error) => error.message)
                  .join('\n')}
              </p>
            {/if}
          </div>

          <!-- Error Message -->
          {#if login.result?.error}
            <div class="alert alert-error">
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
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span class="text-sm">{login.result?.error}</span>
            </div>
          {/if}

          <!-- Login Button -->
          <button type="submit" class="btn w-full btn-primary" disabled={!email || !password || login.pending > 0}>
            Sign In
          </button>
        </div>
      </form>

      <!-- Footer Links -->
      <div class="divider">OR</div>

      <div class="space-y-2 text-center">
        {#if email}
          <p class="text-sm text-base-content/70" transition:fade>
            Forgot your password?
            <button
              type="button"
              class="link link-primary"
              onclick={async () =>
                await sendForgotPasswordEmail({ email }).then((r) => toast.success('Password reset email sent!'))}
              >Send password reset email</button
            >
          </p>
        {/if}
        <p class="text-sm text-base-content/70">
          Don't have an account?
          <a href="/register" class="link link-primary">Sign up here</a>
        </p>
      </div>
    </div>
  </div>
</div>
