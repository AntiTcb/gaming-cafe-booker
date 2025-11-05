<script lang="ts">
  import { getWeeklyEvent, updateWeeklyEvent } from '$lib/rpc/weekly-events.remote';
  import { onMount } from 'svelte';
  import { toast } from 'svelte-sonner';
  import { TrixEditor } from 'svelte-trix';

  let content = $state('');
  let isSaving = $state(false);

  const handleSave = async () => {
    console.log('handleSave');
    isSaving = true;

    console.log('body', content);

    const result = await updateWeeklyEvent({ content: content });

    console.log('result', result);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.message);
    }

    isSaving = false;
  };

  onMount(async () => {
    const weeklyEvent = await getWeeklyEvent();
    content = weeklyEvent?.content || '';
  });
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
    <h2 class="text-xl font-semibold">Weekly Events Editor</h2>
  </div>

  <TrixEditor bind:value={content} />

  <div class="flex items-center justify-between">
    <p class="text-sm text-base-content/70">
      Use the toolbar above to format your text. Changes are saved when you click the Save button.
    </p>
    <button
      type="button"
      class="btn btn-primary"
      onclick={() => {
        handleSave();
      }}
      disabled={isSaving}
    >
      {isSaving ? 'Saving...' : 'Save'}
    </button>
  </div>
</div>
