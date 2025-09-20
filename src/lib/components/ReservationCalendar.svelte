<script lang="ts">
  import AddReservationModal from '$lib/components/AddReservationModal.svelte';
  import { getAvailableGames } from '$lib/rpc/reservations.remote';
  import { Calendar } from '@fullcalendar/core';
  import dayGridPlugin from '@fullcalendar/daygrid';
  import interactionPlugin from '@fullcalendar/interaction';
  import listPlugin from '@fullcalendar/list';
  import timeGridPlugin from '@fullcalendar/timegrid';
  import { onMount } from 'svelte';

  let calendarElement: HTMLElement;
  let calendar: Calendar | null = $state(null);

  onMount(async () => {
    const start = new Date();
    start.setHours(9, 0, 0, 0);
    const end = new Date();
    end.setHours(20, 0, 0, 0);

    calendar = new Calendar(calendarElement, {
      plugins: [timeGridPlugin, interactionPlugin, listPlugin, dayGridPlugin],
      initialView: 'timeGridDay',
      headerToolbar: {
        start: 'timeGridDay,listDay',
        center: 'add',
        end: 'today prev,next',
      },
      dayHeaderFormat: { year: 'numeric', day: 'numeric', month: 'short', weekday: 'short' },
      titleFormat: { year: 'numeric', day: 'numeric', month: 'short' },
      listDayFormat: { year: 'numeric', day: 'numeric', month: 'long' },
      buttonText: {
        today: 'Today',
        day: 'Grid',
        list: 'List',
      },
      customButtons: {
        add: {
          text: 'Add Reservation',
          click: function () {
            (document.getElementById('modal') as HTMLDialogElement)?.showModal();
          },
        },
      },
      eventMinHeight: 30,
      expandRows: true,
      dateClick: async function (info) {
        // end is 1 hour after start
        const end = new Date(info.date);
        end.setHours(end.getHours() + 1);
        const availableGames = await getAvailableGames({ start: info.date.toISOString(), end: end.toISOString() });
      },
      eventSources: ['/api/reservations'],
      eventDidMount: function (info) {
        const { system } = info.event.extendedProps;

        switch (system) {
          case 'Nintendo Switch 2':
            info.el.classList.add('nintendo-switch-2');
            break;
          case 'PlayStation 5':
            info.el.classList.add('playstation-5');
            break;
          case 'PlayStation 4':
            info.el.classList.add('playstation-4');
            break;
        }
      },
      views: {
        listDay: {
          type: 'list',
          slotDuration: '01:00:00',
          slotMinTime: '09:00:00',
          slotMaxTime: '20:00:00',
          slotEventOverlap: false,
          nowIndicator: true,
          allDaySlot: false,
        },
        timeGridDay: {
          type: 'timeGrid',
          slotDuration: '01:00:00',
          slotMinTime: '09:00:00',
          slotMaxTime: '20:00:00',
          slotEventOverlap: false,
          nowIndicator: true,
          allDaySlot: false,
        },
      },
    });
    calendar.render();
  });
</script>

<dialog id="modal" class="modal">
  <div class="modal-box-wide modal-box">
    <AddReservationModal
      close={async () => {
        (document.getElementById('modal') as HTMLDialogElement)?.close();
        calendar?.refetchEvents();
      }}
    />
  </div>
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>

<div class="card bg-base-100 shadow-sm">
  <div bind:this={calendarElement}>
    <div class="h-96 skeleton bg-base-200"></div>
  </div>
</div>
