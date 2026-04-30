import type { SyntheticEvent } from 'react';

export const PLACEHOLDER_CAR = '/img/placeholder-car.jpg';
export const PLACEHOLDER_LOGO = '/vozilahrlogo.svg';

export const onImgError = (
  e: SyntheticEvent<HTMLImageElement>,
  fallback: string = PLACEHOLDER_CAR,
) => {
  const img = e.currentTarget;
  if (img.dataset.fallback === '1') return;
  img.dataset.fallback = '1';
  img.src = fallback;
};
