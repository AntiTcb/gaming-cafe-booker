<script lang="ts">
  import { resetPassword } from '$lib/rpc/auth.remote';
  import type { PageProps } from './$types';

  const { data }: PageProps = $props();
  const { email, otp } = data;
  let password = $state('');
</script>

<div class="flex min-h-screen items-center justify-center bg-base-100 p-4">
  <div class="card w-full max-w-md border-4 bg-base-100 shadow-xl">
    <div class="card-body">
      <h1 class="card-title">Reset Password</h1>

      <form {...resetPassword} oninput={() => resetPassword.validate()}>
        <input type="hidden" name="email" value={email} />
        <input type="hidden" name="otp" value={otp} />
        <div class="space-y-4">
          <div class="form-control">
            <label class="label" for="password">New Password</label>
            <input
              {...resetPassword.fields.password.as('password')}
              class="input-bordered input w-full"
              bind:value={password}
            />
          </div>
        </div>
        <button
          type="submit"
          class="btn w-full btn-primary"
          disabled={!email || !password || resetPassword.pending > 0}
        >
          Reset Password
        </button>
      </form>
    </div>
  </div>
</div>
