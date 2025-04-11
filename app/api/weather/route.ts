import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const location = searchParams.get("location")

  if (!location) {
    return NextResponse.json({ error: "Location parameter is required" }, { status: 400 })
  }

  try {
    // First, geocode the location to get coordinates
    let latitude, longitude, locationName

    // Check if location is already coordinates (lat,lon format)
    if (/^-?\d+(\.\d+)?,-?\d+(\.\d+)?$/.test(location)) {
      const [lat, lon] = location.split(",")
      latitude = Number.parseFloat(lat)
      longitude = Number.parseFloat(lon)

      // For reverse geocoding, we'll use a more reliable approach
      try {
        // Use the Nominatim OpenStreetMap API for reverse geocoding
        // This is more reliable for getting location names from coordinates
        const nominatimResponse = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10`,
          {
            headers: {
              "User-Agent": "WeatherApp/1.0",
              "Accept-Language": "en-US,en;q=0.9",
            },
          },
        )

        if (!nominatimResponse.ok) {
          throw new Error(`Nominatim API error: ${nominatimResponse.status}`)
        }

        const nominatimData = await nominatimResponse.json()

        // Extract location information from Nominatim response
        if (nominatimData && nominatimData.address) {
          // Try to get the most appropriate name for the location
          const address = nominatimData.address

          // Prioritize city, town, village, etc.
          const cityName =
            address.city ||
            address.town ||
            address.village ||
            address.suburb ||
            address.county ||
            address.state ||
            "Unknown Location"

          // Add country for context if available
          const countryName = address.country || ""

          locationName = countryName ? `${cityName}, ${countryName}` : cityName
        } else {
          // Fallback to formatted coordinates
          locationName = `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
        }
      } catch (geocodeError) {
        console.error("Reverse geocoding error:", geocodeError)

        // Try Open-Meteo as a fallback
        try {
          const geocodeResponse = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${latitude},${longitude}&count=1`,
          )

          if (geocodeResponse.ok) {
            const geocodeData = await geocodeResponse.json()
            if (geocodeData.results && geocodeData.results.length > 0) {
              locationName = geocodeData.results[0].name

              if (geocodeData.results[0].country) {
                locationName += `, ${geocodeData.results[0].country}`
              }
            } else {
              locationName = `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
            }
          } else {
            locationName = `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
          }
        } catch (fallbackError) {
          console.error("Fallback geocoding error:", fallbackError)
          locationName = `Location (${latitude.toFixed(2)}, ${longitude.toFixed(2)})`
        }
      }
    } else {
      // Geocode the location name to get coordinates
      const geocodeResponse = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(location)}&count=1`,
      )

      if (!geocodeResponse.ok) {
        return NextResponse.json({ error: `Geocoding API error: ${geocodeResponse.status}` }, { status: 502 })
      }

      const geocodeData = await geocodeResponse.json()

      if (!geocodeData.results || geocodeData.results.length === 0) {
        return NextResponse.json({ error: "Location not found" }, { status: 404 })
      }

      const result = geocodeData.results[0]
      latitude = result.latitude
      longitude = result.longitude

      // Format location name with country/state if available
      locationName = result.name
      if (result.country) {
        locationName += `, ${result.country}`
      } else if (result.admin1) {
        locationName += `, ${result.admin1}`
      }
    }

    // Fetch weather data from Open-Meteo API
    const weatherResponse = await fetch(
      `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${latitude}&longitude=${longitude}` +
        `&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,pressure_msl,surface_pressure,wind_speed_10m,wind_direction_10m,visibility` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,precipitation_probability_max` +
        `&timezone=auto`,
    )

    if (!weatherResponse.ok) {
      return NextResponse.json({ error: `Weather API error: ${weatherResponse.status}` }, { status: 502 })
    }

    const weatherData = await weatherResponse.json()

    // Validate the required data is present
    if (!weatherData.current || !weatherData.daily) {
      return NextResponse.json({ error: "Invalid weather data received from provider" }, { status: 502 })
    }

    // Format the response
    const formattedResponse = {
      current: {
        temperature: weatherData.current.temperature_2m,
        weathercode: weatherData.current.weather_code,
        windspeed: weatherData.current.wind_speed_10m,
        winddirection: weatherData.current.wind_direction_10m,
        time: weatherData.current.time,
        humidity: weatherData.current.relative_humidity_2m,
        apparent_temperature: weatherData.current.apparent_temperature,
        precipitation: weatherData.current.precipitation,
        pressure: weatherData.current.surface_pressure || weatherData.current.pressure_msl,
        visibility: weatherData.current.visibility,
        is_day: weatherData.current.is_day,
      },
      daily: {
        time: weatherData.daily.time,
        weathercode: weatherData.daily.weather_code,
        temperature_2m_max: weatherData.daily.temperature_2m_max,
        temperature_2m_min: weatherData.daily.temperature_2m_min,
        precipitation_sum: weatherData.daily.precipitation_sum,
        precipitation_probability_max: weatherData.daily.precipitation_probability_max,
      },
      location: {
        name: locationName,
        latitude,
        longitude,
      },
    }

    return NextResponse.json(formattedResponse)
  } catch (error) {
    console.error("Error fetching weather data:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch weather data" },
      { status: 500 },
    )
  }
}
