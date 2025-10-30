export const STORE_NAME = 'Passage Gaming Pros';

export const STORE_HOURS = {
  OPEN: 9,
  CLOSE: 20,
} as const;

export const STORE_HOURS_STRING = {
  OPEN: `${STORE_HOURS.OPEN}:00`,
  CLOSE: `${STORE_HOURS.CLOSE}:00`,
} as const;
