import type { Component } from 'svelte';
import SwitchIcon from '~icons/simple-icons/nintendoswitch';
import SwitchTwoIcon from '$lib/utils/SwitchTwoIcon.svelte';
import PS4Icon from '~icons/simple-icons/playstation4';
import PS5Icon from '~icons/simple-icons/playstation5';

export const SYSTEMS = ['Nintendo Switch', 'Nintendo Switch 2', 'PlayStation 5', 'PlayStation 4'] as const;

type System = (typeof SYSTEMS)[number];

// combine switch icon and two icon

export const systemIconMap: Record<System, Component> = {
  'Nintendo Switch': SwitchIcon,
  'Nintendo Switch 2': SwitchTwoIcon,
  'PlayStation 4': PS4Icon,
  'PlayStation 5': PS5Icon,
};
