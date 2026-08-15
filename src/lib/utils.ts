import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AqiCategory } from '../types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAqiCategory(aqi: number): {
  category: AqiCategory;
  color: string;
  bgColor: string;
  borderColor: string;
  textColor: string;
  description: string;
} {
  if (aqi <= 50) {
    return {
      category: 'Good',
      color: '#22c55e',
      bgColor: 'bg-emerald-500/10',
      borderColor: 'border-emerald-500/30',
      textColor: 'text-emerald-400',
      description: 'Minimal impact. Air quality is considered satisfactory.',
    };
  } else if (aqi <= 100) {
    return {
      category: 'Satisfactory',
      color: '#84cc16',
      bgColor: 'bg-lime-500/10',
      borderColor: 'border-lime-500/30',
      textColor: 'text-lime-400',
      description: 'Minor breathing discomfort to sensitive people.',
    };
  } else if (aqi <= 200) {
    return {
      category: 'Moderate',
      color: '#eab308',
      bgColor: 'bg-amber-500/10',
      borderColor: 'border-amber-500/30',
      textColor: 'text-amber-400',
      description: 'Breathing discomfort to the people with lungs, asthma and heart diseases.',
    };
  } else if (aqi <= 300) {
    return {
      category: 'Poor',
      color: '#f97316',
      bgColor: 'bg-orange-500/10',
      borderColor: 'border-orange-500/30',
      textColor: 'text-orange-400',
      description: 'Breathing discomfort to most people on prolonged exposure.',
    };
  } else if (aqi <= 400) {
    return {
      category: 'Very Poor',
      color: '#ef4444',
      bgColor: 'bg-red-500/10',
      borderColor: 'border-red-500/30',
      textColor: 'text-red-400',
      description: 'Respiratory illness on prolonged exposure.',
    };
  } else {
    return {
      category: 'Severe',
      color: '#8b5cf6',
      bgColor: 'bg-purple-500/10',
      borderColor: 'border-purple-500/30',
      textColor: 'text-purple-400',
      description: 'Affects healthy people and seriously impacts those with existing diseases.',
    };
  }
}
