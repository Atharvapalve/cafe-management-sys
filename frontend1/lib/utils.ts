// frontend1/lib/utils.ts

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Add the hasUniqueIds function here
export function hasUniqueIds(items: { id: string }[]): boolean {
  // Extract all IDs into an array
  const ids = items.map((item) => item.id);
  // Use a Set to find unique IDs
  const uniqueIds = new Set(ids);
  // Compare the size of the Set with the original array length
  if (uniqueIds.size === ids.length) {
    console.log("All IDs are unique.");
    return true;
  } else {
    console.log("Duplicate IDs found.");
    // Find and log the duplicate IDs
    const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
    console.log("Duplicate IDs:", [...new Set(duplicates)]);
    return false;
  }
}