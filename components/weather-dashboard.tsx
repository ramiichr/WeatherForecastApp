"use client"

import { useState, useEffect } from "react"
import { Loader2, CloudOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import CurrentWeather from "@/components/current-weather"
import WeatherForecast from "@/components/weather-forecast"
import WeatherDetails from "@/components/weather-details"
import WeatherBackground from "@/components/weather-background"
import CitySearch from "@/components/city-search"
import { useToast } from "@/hooks/use-toast"

interface WeatherData {
  current: {
    temperature: number
    weathercode: number
    windspeed: number
    winddirection: number
    time: string
    humidity: number
    apparent_temperature: number
    precipitation: number
    pressure: number
    visibility: number
    is_day: number
  }
  daily: {
    time: string[]
    weathercode: number[]
    temperature_2m_max: number[]
    temperature_2m_min: number[]
    precipitation_sum: number[]
    precipitation_probability_max: number[]
  }
  location: {
    name: string
    latitude: number
    longitude: number
  }
}

export default function WeatherDashboard() {
  const [location, setLocation] = useState("London")
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(false)
  const [isClient, setIsClient] = useState(false)
  const [fetchError, setFetchError] = useState<string | null>(null)
  // Lift temperature unit state up to share between components
  const [tempUnit, setTempUnit] = useState<"celsius" | "fahrenheit">("celsius")
  const { toast } = useToast()

  // Handle hydration mismatch by confirming we're on the client
  useEffect(() => {
    setIsClient(true)
  }, [])

  // Add this function to handle fetch errors
  const handleFetchError = (error: unknown) => {
    console.error("Weather data fetch error:", error)
    setFetchError(error instanceof Error ? error.message : "Unknown error occurred")

    toast({
      title: "Error Fetching Weather",
      description: error instanceof Error ? error.message : "Failed to fetch weather data. Please try again.",
      variant: "destructive",
    })
  }

  const fetchWeatherData = async (searchLocation: string) => {
    try {
      setLoading(true)
      setFetchError(null)

      const response = await fetch(`/api/weather?location=${encodeURIComponent(searchLocation)}`)

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("API Error Response:", response.status, errorData)
        throw new Error(`Failed to fetch weather data: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      // Validate the response data structure
      if (!data || !data.current || !data.daily || !data.location) {
        console.error("Invalid API response structure:", data)
        throw new Error("Invalid weather data format received")
      }

      setWeatherData(data)
      setLocation(data.location.name)
    } catch (error) {
      console.error("Weather data fetch error:", error)

      // Show more detailed error message to the user
      toast({
        title: "Error Fetching Weather",
        description: error instanceof Error ? error.message : "Failed to fetch weather data. Please try again.",
        variant: "destructive",
      })

      // Don't set weatherData to null if we already have data
      // This prevents the UI from flashing empty state on error
      if (!weatherData) {
        setWeatherData(null)
      }

      setFetchError(error instanceof Error ? error.message : "Unknown error occurred")
    } finally {
      setLoading(false)
    }
  }

  // Update the useEffect to use the new error handler
  useEffect(() => {
    if (isClient) {
      fetchWeatherData(location).catch(handleFetchError)
    }
  }, [isClient])

  // Save temperature unit preference to localStorage when it changes
  useEffect(() => {
    if (isClient) {
      localStorage.setItem("tempUnit", tempUnit)
    }
  }, [tempUnit, isClient])

  // Load temperature unit preference from localStorage on initial load
  useEffect(() => {
    if (isClient) {
      const savedTempUnit = localStorage.getItem("tempUnit") as "celsius" | "fahrenheit" | null
      if (savedTempUnit) {
        setTempUnit(savedTempUnit)
      }
    }
  }, [isClient])

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Not Supported",
        description: "Geolocation is not supported by your browser.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    toast({
      title: "Getting Location",
      description: "Fetching your current location...",
    })

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        console.log("Got coordinates:", latitude, longitude)
        // Format coordinates with more precision to ensure accuracy
        const formattedCoords = `${latitude.toFixed(6)},${longitude.toFixed(6)}`
        fetchWeatherData(formattedCoords)
      },
      (error) => {
        setLoading(false)
        console.error("Geolocation error:", error)

        let errorMessage = "Unable to get your current location."
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access was denied. Please enable location services in your browser settings."
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable."
            break
          case error.TIMEOUT:
            errorMessage = "The request to get your location timed out."
            break
        }

        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        })
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    )
  }

  if (!isClient) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    )
  }

  const weatherCode = weatherData?.current?.weathercode || 0
  const isDay = weatherData?.current?.is_day || 1

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Show a default background if no weather data */}
      {weatherData ? (
        <WeatherBackground weatherCode={weatherData.current.weathercode} isDay={weatherData.current.is_day} />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-b from-sky-400 to-blue-500"></div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold text-white drop-shadow-md">
              Weather <span className="text-amber-300">Forecast</span>
            </h1>

            <CitySearch
              onSearch={fetchWeatherData}
              onGetCurrentLocation={handleGetCurrentLocation}
              loading={loading}
              initialLocation={location}
            />
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="p-8 rounded-xl bg-white/10 backdrop-blur-md">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
                <p className="text-white mt-4">Loading weather data...</p>
              </div>
            </div>
          ) : fetchError ? (
            <div className="flex justify-center items-center h-64">
              <div className="p-8 rounded-xl bg-white/10 backdrop-blur-md max-w-md text-center">
                <div className="text-amber-300 mb-4">
                  <CloudOff className="h-16 w-16 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Unable to fetch weather data</h3>
                <p className="text-white/80 mb-4">{fetchError}</p>
                <Button
                  onClick={() => {
                    setFetchError(null)
                    fetchWeatherData(location)
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : weatherData ? (
            <>
              <CurrentWeather
                data={weatherData.current}
                location={weatherData.location}
                tempUnit={tempUnit}
                onTempUnitChange={setTempUnit}
              />
              <WeatherForecast data={weatherData.daily} tempUnit={tempUnit} />
              <WeatherDetails data={weatherData.current} />
            </>
          ) : (
            <div className="flex justify-center items-center h-64">
              <div className="p-8 rounded-xl bg-white/10 backdrop-blur-md">
                <Loader2 className="h-12 w-12 animate-spin text-white" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
