import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function for merging Tailwind classes in a semantically logical way.
 *
 * See [this](https://youtu.be/re2JFITR7TI?si=QRndwH5QAgfOCenW) video for an explanation (in React, but concept translates to Svelte(Kit))
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
