import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function getDefaultAvatar(name: string = "User"): string {
  const cleanName = name.trim() || "User";
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(cleanName)}&background=00458B&color=fff&bold=true`;
}
