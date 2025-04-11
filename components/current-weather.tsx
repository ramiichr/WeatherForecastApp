"use client"

import { formatDate, getWeatherIcon, getWeatherDescription, celsiusToFahrenheit } from "@/lib/utils"
import { motion } from "framer-motion"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

interface CurrentWeatherProps {
  data: {
    temperature: number
    weathercode: number
    windspeed: number
    winddirection: number
    time: string
    is_day: number
  }
  location: {
    name: string
  }
  tempUnit: "celsius" | "fahrenheit"
  onTempUnitChange: (unit: "celsius" | "fahrenheit") => void
}

export default function CurrentWeather({ data, location, tempUnit, onTempUnitChange }: CurrentWeatherProps) {
  const WeatherIcon = getWeatherIcon(data.weathercode, data.is_day)
  const weatherDescription = getWeatherDescription(data.weathercode)

  const temperature =
    tempUnit === "celsius" ? Math.round(data.temperature) : Math.round(celsiusToFahrenheit(data.temperature))

  // Check if location name is in coordinate format and display a nicer message
  const displayLocation = location.name.startsWith("Location (") ? "Current Location" : location.name

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white/20 backdrop-blur-md rounded-xl shadow-lg overflow-hidden border border-white/30"
    >
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-4 md:mb-0">
            <h2 className="text-3xl font-bold text-white">{displayLocation}</h2>
            <p className="text-white/80">{formatDate(data.time)}</p>
            <div className="mt-2">
              <p className="text-white/90 text-lg">{weatherDescription}</p>
            </div>
          </div>

          <div className="flex flex-col items-end">
            <div className="flex items-center">
              <motion.div
                animate={{ rotate: [0, 5, 0, -5, 0] }}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5, ease: "easeInOut" }}
              >
                <WeatherIcon className="h-20 w-20 text-amber-300 drop-shadow-lg" />
              </motion.div>
              <div className="ml-4">
                <span className="text-6xl font-bold text-white drop-shadow-md">
                  {temperature}
                  {tempUnit === "celsius" ? "°C" : "°F"}
                </span>
              </div>
            </div>

            <ToggleGroup
              type="single"
              value={tempUnit}
              onValueChange={(value) => {
                if (value) onTempUnitChange(value as "celsius" | "fahrenheit")
              }}
              className="mt-2 bg-white/10 rounded-lg p-1"
            >
              <ToggleGroupItem
                value="celsius"
                className="text-xs data-[state=on]:bg-white/20 data-[state=on]:text-white text-white/70 rounded px-2 py-1"
              >
                °C
              </ToggleGroupItem>
              <ToggleGroupItem
                value="fahrenheit"
                className="text-xs data-[state=on]:bg-white/20 data-[state=on]:text-white text-white/70 rounded px-2 py-1"
              >
                °F
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
