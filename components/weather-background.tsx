"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface WeatherBackgroundProps {
  weatherCode: number
  isDay: number
}

export default function WeatherBackground({ weatherCode, isDay }: WeatherBackgroundProps) {
  const [mounted, setMounted] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    try {
      setMounted(true)
    } catch (e) {
      console.error("Error mounting weather background:", e)
      setError(true)
    }
  }, [])

  // Provide a fallback background if there's an error or not mounted
  if (!mounted || error) {
    return <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-blue-500"></div>
  }

  // Determine background based on weather code and day/night
  const isDayTime = isDay === 1

  try {
    // Clear sky
    if (weatherCode === 0) {
      return (
        <div
          className={cn(
            "absolute inset-0 transition-all duration-1000",
            isDayTime ? "bg-gradient-to-b from-sky-400 to-blue-500" : "bg-gradient-to-b from-indigo-900 to-slate-900",
          )}
        >
          {isDayTime ? (
            // Day sun effect
            <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-yellow-300 blur-xl opacity-80 animate-pulse"></div>
          ) : (
            // Night stars effect
            <>
              <div className="stars-small"></div>
              <div className="stars-medium"></div>
              <div className="stars-large"></div>
              <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-gray-200 blur-sm opacity-80"></div>
            </>
          )}
        </div>
      )
    }

    // Partly cloudy
    if (weatherCode === 1 || weatherCode === 2) {
      return (
        <div
          className={cn(
            "absolute inset-0 transition-all duration-1000",
            isDayTime ? "bg-gradient-to-b from-blue-300 to-sky-500" : "bg-gradient-to-b from-slate-800 to-slate-900",
          )}
        >
          <div className="clouds-animation opacity-70"></div>
          {isDayTime ? (
            <div className="absolute top-10 right-10 w-32 h-32 rounded-full bg-yellow-300 blur-xl opacity-60 animate-pulse"></div>
          ) : (
            <div className="absolute top-10 right-10 w-24 h-24 rounded-full bg-gray-200 blur-sm opacity-60"></div>
          )}
        </div>
      )
    }

    // Overcast
    if (weatherCode === 3) {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-400 to-slate-600 transition-all duration-1000">
          <div className="clouds-animation opacity-90"></div>
        </div>
      )
    }

    // Fog
    if (weatherCode === 45 || weatherCode === 48) {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-gray-300 to-gray-500 transition-all duration-1000">
          <div className="fog-animation"></div>
        </div>
      )
    }

    // Rain
    if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(weatherCode)) {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-600 to-slate-800 transition-all duration-1000">
          <div className="clouds-animation opacity-90"></div>
          <div className="rain-animation"></div>
        </div>
      )
    }

    // Snow
    if ([71, 73, 75, 77, 85, 86].includes(weatherCode)) {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-300 to-slate-500 transition-all duration-1000">
          <div className="clouds-animation opacity-80"></div>
          <div className="snow-animation"></div>
        </div>
      )
    }

    // Thunderstorm
    if ([95, 96, 99].includes(weatherCode)) {
      return (
        <div className="absolute inset-0 bg-gradient-to-b from-slate-700 to-slate-900 transition-all duration-1000">
          <div className="clouds-animation opacity-90"></div>
          <div className="rain-animation"></div>
          <div className="lightning-animation"></div>
        </div>
      )
    }

    // Default fallback
    return (
      <div
        className={cn(
          "absolute inset-0 transition-all duration-1000",
          isDayTime ? "bg-gradient-to-b from-sky-400 to-blue-500" : "bg-gradient-to-b from-indigo-900 to-slate-900",
        )}
      ></div>
    )
  } catch (e) {
    console.error("Error rendering weather background:", e)
    // Fallback background if there's an error
    return <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-blue-500"></div>
  }
}
