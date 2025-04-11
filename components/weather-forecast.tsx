"use client"

import { Card, CardContent } from "@/components/ui/card"
import { getWeatherIcon, getWeatherDescription, formatDay, celsiusToFahrenheit } from "@/lib/utils"
import { motion } from "framer-motion"

interface WeatherForecastProps {
  data: {
    time: string[]
    weathercode: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_probability_max: number[]
  }
  tempUnit: "celsius" | "fahrenheit"
}

export default function WeatherForecast({ data, tempUnit }: WeatherForecastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-semibold text-white drop-shadow-md">7-Day Forecast</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-4">
        {data.time.map((time, index) => {
          const WeatherIcon = getWeatherIcon(data.weathercode[index], 1) // Assuming day time for forecast

          // Convert temperatures based on selected unit
          const maxTemp =
            tempUnit === "celsius"
              ? Math.round(data.temperature_2m_max[index])
              : Math.round(celsiusToFahrenheit(data.temperature_2m_max[index]))

          const minTemp =
            tempUnit === "celsius"
              ? Math.round(data.temperature_2m_min[index])
              : Math.round(celsiusToFahrenheit(data.temperature_2m_min[index]))

          return (
            <motion.div
              key={time}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <Card className="overflow-hidden bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30 transition-all duration-300 h-full">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="font-medium text-white">{formatDay(time)}</p>
                    <div className="my-3 flex justify-center">
                      <motion.div
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        transition={{ type: "spring", stiffness: 400, damping: 10 }}
                      >
                        <WeatherIcon className="h-12 w-12 text-amber-300 drop-shadow-lg" />
                      </motion.div>
                    </div>
                    <p className="text-xs text-white/80 h-8 overflow-hidden">
                      {getWeatherDescription(data.weathercode[index])}
                    </p>
                    <div className="mt-3 flex justify-between items-center text-sm">
                      <span className="font-medium text-white">
                        {maxTemp}
                        {tempUnit === "celsius" ? "°C" : "°F"}
                      </span>
                      <span className="text-white/70">
                        {minTemp}
                        {tempUnit === "celsius" ? "°C" : "°F"}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-white/80 flex items-center justify-center">
                      <div className="h-1 w-full bg-white/30 rounded-full overflow-hidden" style={{ maxWidth: "80px" }}>
                        <div
                          className="h-full bg-blue-400 rounded-full"
                          style={{ width: `${data.precipitation_probability_max[index]}%` }}
                        ></div>
                      </div>
                      <span className="ml-2">{data.precipitation_probability_max[index]}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
