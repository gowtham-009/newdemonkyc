export function useGeolocation() {
  const coords = ref({ latitude: null, longitude: null })
  const error = ref(null)
  const isLoaded = ref(false)
  const getLocation = () => {
    if (!navigator.geolocation) {
      error.value = 'Geolocation is not supported'
      return
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        coords.value.latitude = position.coords.latitude
        coords.value.longitude = position.coords.longitude
        isLoaded.value = true
      },
      (err) => {
        error.value = err.message
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }

  return {
    coords,
    error,
    isLoaded,
    getLocation
  }
}
