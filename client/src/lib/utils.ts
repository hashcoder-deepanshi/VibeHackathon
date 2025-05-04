import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format date
export function formatDate(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

// Format time
export function formatTime(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}

// Get abbreviated day name
export function getDayName(dateString: string | Date): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat("en-IN", { weekday: "short" }).format(date);
}

// Calculate delivery time
export function calculateDeliveryTime(
  distance: number,
  baseTime: number = 30
): number {
  // Assuming distance is in km and baseTime is in minutes
  const timePerKm = 2; // 2 minutes per km
  return Math.round(baseTime + distance * timePerKm);
}

// Truncate text with ellipsis
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

// Convert distance to readable format
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${meters}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

// Generate a random color based on a string
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  let color = "#";
  for (let i = 0; i < 3; i++) {
    const value = (hash >> (i * 8)) & 0xff;
    color += ("00" + value.toString(16)).substr(-2);
  }
  return color;
}

// Get initial from name
export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .substring(0, 2);
}

// Check if a string is a valid URL
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
}

// Get rating color based on rating value
export function getRatingColor(rating: number): string {
  if (rating >= 4.5) return "#4CAF50"; // Green
  if (rating >= 4.0) return "#8BC34A"; // Light Green
  if (rating >= 3.5) return "#FFC107"; // Amber
  if (rating >= 3.0) return "#FF9800"; // Orange
  return "#F44336"; // Red
}
