"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Droplets, Wind, Thermometer, Compass, Eye, Gauge } from "lucide-react"
import { motion } from "framer-motion"

interface WeatherDetailsProps {
  data: {
    humidity: number
    windspeed: number
    winddirection: number
    apparent_temperature: number
    visibility: number
    pressure: number
  }
}

export default function WeatherDetails({ data }: WeatherDetailsProps) {
  const details = [
    {
      title: "Humidity",
      value: `${data.humidity}%`,
      icon: Droplets,
      color: "from-blue-400 to-blue-600",
    },
    {
      title: "Wind",
      value: `${data.windspeed} km/h`,
      icon: Wind,
      color: "from-teal-400 to-teal-600",
    },
    {
      title: "Feels Like",
      value: `${Math.round(data.apparent_temperature)}°`,
      icon: Thermometer,
      color: "from-amber-400 to-amber-600",
    },
    {
      title: "Wind Direction",
      value: `${data.winddirection}°`,
      icon: Compass,
      color: "from-indigo-400 to-indigo-600",
    },
    {
      title: "Visibility",
      value: `${(data.visibility / 1000).toFixed(1)} km`,
      icon: Eye,
      color: "from-purple-400 to-purple-600",
    },
    {
      title: "Pressure",
      value: `${data.pressure} hPa`,
      icon: Gauge,
      color: "from-rose-400 to-rose-600",
    },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="space-y-4"
    >
      <h2 className="text-2xl font-semibold text-white drop-shadow-md">Weather Details</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {details.map((detail, index) => (
          <motion.div
            key={detail.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4 + index * 0.05 }}
            whileHover={{ y: -5, scale: 1.03 }}
          >
            <Card className="overflow-hidden bg-white/20 backdrop-blur-md border-white/30 h-full">
              <CardContent className="p-0">
                <div className="flex flex-col items-center text-center h-full">
                  <div className={`w-full py-3 bg-gradient-to-r ${detail.color}`}>
                    <detail.icon className="h-6 w-6 text-white mx-auto" />
                  </div>
                  <div className="p-4 flex-1 flex flex-col justify-center">
                    <p className="text-sm font-medium text-white/80">{detail.title}</p>
                    <p className="text-xl font-semibold text-white mt-1">{detail.value}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
