"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Search, MapPin, X, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { debounce } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface CitySearchProps {
  onSearch: (location: string) => void
  onGetCurrentLocation: () => void
  loading: boolean
  initialLocation?: string
}

interface City {
  name: string
  country: string
  latitude: number
  longitude: number
}

export default function CitySearch({ onSearch, onGetCurrentLocation, loading, initialLocation = "" }: CitySearchProps) {
  const [location, setLocation] = useState(initialLocation)
  const [suggestions, setSuggestions] = useState<City[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [fetchingSuggestions, setFetchingSuggestions] = useState(false)
  const [currentButtonHover, setCurrentButtonHover] = useState(false)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  // Update location when initialLocation changes
  useEffect(() => {
    if (initialLocation) {
      setLocation(initialLocation)
    }
  }, [initialLocation])

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Fetch city suggestions
  const fetchSuggestions = debounce(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    try {
      setFetchingSuggestions(true)
      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5`,
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch suggestions: ${response.status}`)
      }

      const data = await response.json()

      if (data.results && data.results.length > 0) {
        setSuggestions(
          data.results.map((city: any) => ({
            name: city.name,
            country: city.country || "Unknown",
            latitude: city.latitude,
            longitude: city.longitude,
          })),
        )
        setShowSuggestions(true)
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error("Error fetching city suggestions:", error)
      setSuggestions([])
      setShowSuggestions(false)
    } finally {
      setFetchingSuggestions(false)
    }
  }, 300)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setLocation(value)
    fetchSuggestions(value)
  }

  const handleSelectCity = (city: City) => {
    setLocation(city.name)
    setShowSuggestions(false)
    onSearch(`${city.latitude},${city.longitude}`)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (location.trim()) {
      setShowSuggestions(false)
      onSearch(location)
    }
  }

  const handleClearInput = () => {
    setLocation("")
    setSuggestions([])
    setShowSuggestions(false)
  }

  return (
    <div className="relative w-full">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder="Search for a city..."
            value={location}
            onChange={handleInputChange}
            onFocus={() => location.length >= 2 && setSuggestions.length > 0 && setShowSuggestions(true)}
            className="pr-16 bg-white/20 backdrop-blur-md border-white/30 text-white placeholder:text-white/70"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
            {location && (
              <button type="button" onClick={handleClearInput} className="text-white/70 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            )}
            <Search className="text-white h-4 w-4 ml-1" />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="bg-amber-500 hover:bg-amber-600 text-white">
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
        </Button>

        {/* Redesigned Current Location Button */}
        <motion.button
          type="button"
          onClick={onGetCurrentLocation}
          disabled={loading}
          onMouseEnter={() => setCurrentButtonHover(true)}
          onMouseLeave={() => setCurrentButtonHover(false)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`relative overflow-hidden rounded-md px-4 py-2 font-medium text-white transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 disabled:opacity-50 ${
            loading ? "bg-gray-500" : "bg-gradient-to-r from-amber-500 to-amber-600"
          }`}
        >
          {/* Background animation */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500"
            initial={{ x: "-100%" }}
            animate={{ x: currentButtonHover ? "0%" : "-100%" }}
            transition={{ duration: 0.3 }}
          />

          {/* Content */}
          <div className="relative flex items-center justify-center">
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <motion.div
                animate={currentButtonHover ? { y: [0, -2, 0, 2, 0] } : {}}
                transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5 }}
              >
                <MapPin className="h-4 w-4 mr-2" />
              </motion.div>
            )}
            <span>Current</span>
          </div>
        </motion.button>
      </form>

      {/* City suggestions dropdown */}
      <div className="relative" ref={suggestionsRef}>
        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 mt-1 w-full bg-white/20 backdrop-blur-md border border-white/30 rounded-md shadow-lg overflow-hidden"
            >
              <ul className="py-1 max-h-60 overflow-auto">
                {suggestions.map((city, index) => (
                  <li key={`${city.name}-${city.latitude}-${index}`}>
                    <button
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className="w-full text-left px-4 py-2 text-white hover:bg-white/30 transition-colors flex items-center"
                    >
                      <MapPin className="h-4 w-4 mr-2 text-amber-300" />
                      <span>
                        {city.name}, <span className="text-white/70">{city.country}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
