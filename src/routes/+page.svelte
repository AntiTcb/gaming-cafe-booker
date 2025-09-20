<script lang="ts">
  import ReservationCalendar from '$lib/components/ReservationCalendar.svelte';
</script>

<div class="container mx-auto max-w-sm space-y-6 p-4 md:max-w-4xl md:p-8">
  <!-- Gaming Systems Section -->
  <div class="mb-4 text-center md:mb-8">
    <h2 class="mb-2 text-2xl font-bold text-primary md:text-3xl">Daily Calendar</h2>
    <p class="text-sm text-base-content/70 md:text-base">Reserve a time slot and come game!</p>
  </div>

  <!-- Booking Information -->
  <div class="card space-y-2 border-4 border-base-300 bg-base-100 p-4">
    <div class="card-body p-4 md:p-6">
      <div class="flex flex-col justify-between gap-2 md:flex-row">
        <div class="flex flex-row items-center gap-2">
          <div class="text-xl md:text-2xl">1️⃣</div>
          <div>
            <h4 class="text-sm font-semibold md:text-base">Choose Time</h4>
            <p class="text-xs text-base-content/70 md:text-sm">Select an available time slot</p>
          </div>
        </div>
        <div class="flex flex-row items-center gap-2">
          <div class="text-xl md:text-2xl">2️⃣</div>
          <div>
            <h4 class="text-sm font-semibold md:text-base">Choose Game & System</h4>
            <p class="text-xs text-base-content/70 md:text-sm">Select your game and system</p>
          </div>
        </div>
        <div class="flex flex-row items-center gap-2">
          <div class="text-xl md:text-2xl">3️⃣</div>
          <div>
            <h4 class="text-sm font-semibold md:text-base">Show Up!</h4>
            <p class="text-xs text-base-content/70 md:text-sm">Show up at the cafe and play!</p>
          </div>
        </div>
      </div>
    </div>
  </div>

  <ReservationCalendar />
</div>
