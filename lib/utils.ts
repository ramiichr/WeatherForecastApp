import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSnow,
  Sun,
  Moon,
  CloudSun,
  CloudMoon,
} from "lucide-react"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  })
}

export function formatDay(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    weekday: "short",
  })
}

export function getWeatherIcon(code: number, isDay: number) {
  // WMO Weather interpretation codes (WW)
  // https://open-meteo.com/en/docs

  const isDayTime = isDay === 1

  if (code === 0) {
    // Clear sky
    return isDayTime ? Sun : Moon
  } else if (code === 1) {
    // Mainly clear
    return isDayTime ? CloudSun : CloudMoon
  } else if (code === 2 || code === 3) {
    // Partly cloudy, overcast
    return Cloud
  } else if ([45, 48].includes(code)) {
    // Fog and depositing rime fog
    return CloudFog
  } else if ([51, 53, 55, 56, 57].includes(code)) {
    // Drizzle
    return CloudDrizzle
  } else if ([61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    // Rain
    return CloudRain
  } else if ([71, 73, 75, 77, 85, 86].includes(code)) {
    // Snow
    return CloudSnow
  } else if ([95, 96, 99].includes(code)) {
    // Thunderstorm
    return CloudLightning
  }

  // Default
  return isDayTime ? Sun : Moon
}

export function getWeatherDescription(code: number): string {
  // WMO Weather interpretation codes (WW)
  const descriptions: Record<number, string> = {
    0: "Clear sky",
    1: "Mainly clear",
    2: "Partly cloudy",
    3: "Overcast",
    45: "Fog",
    48: "Depositing rime fog",
    51: "Light drizzle",
    53: "Moderate drizzle",
    55: "Dense drizzle",
    56: "Light freezing drizzle",
    57: "Dense freezing drizzle",
    61: "Slight rain",
    63: "Moderate rain",
    65: "Heavy rain",
    66: "Light freezing rain",
    67: "Heavy freezing rain",
    71: "Slight snow fall",
    73: "Moderate snow fall",
    75: "Heavy snow fall",
    77: "Snow grains",
    80: "Slight rain showers",
    81: "Moderate rain showers",
    82: "Violent rain showers",
    85: "Slight snow showers",
    86: "Heavy snow showers",
    95: "Thunderstorm",
    96: "Thunderstorm with slight hail",
    99: "Thunderstorm with heavy hail",
  }

  return descriptions[code] || "Unknown"
}

// Convert Celsius to Fahrenheit
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9) / 5 + 32
}

// Debounce function for search input
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}
