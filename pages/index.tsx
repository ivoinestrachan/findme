import React, { useEffect, useRef, useState } from 'react';

interface Position {
  latitude: number;
  longitude: number;
}

interface Location extends Position {
  id?: number;
  createdAt?: string;
  updatedAt?: string;
}

declare global {
  interface Window {
    initMap: () => void;
  }
}

const Index = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.initMap = () => {
      setIsLoaded(true);
      fetchLastSavedLocation();
      const intervalId = setInterval(fetchLastSavedLocation, 60000);
      return () => clearInterval(intervalId);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      console.error('Google Maps script failed to load.');
      setLoadError('Google Maps script failed to load.');
    };
    document.head.appendChild(script);
  }, []);

  const fetchLastSavedLocation = async () => {
    try {
      const response = await fetch('/api/location');
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const locationData: Location = await response.json();
      updateMap(locationData);
    } catch (error) {
      console.error('Failed to fetch location:', error);
      setLoadError('Error fetching location.');
    }
  };

  const updateMap = (locationData: Location) => {
    const { latitude, longitude } = locationData;
    const mapOptions = {
      center: { lat: latitude, lng: longitude },
      zoom: 15,
      fullscreenControl: false,
      mapTypeControl: false,
    };
    if (mapContainerRef.current) {
      const map = new google.maps.Map(mapContainerRef.current, mapOptions);
      new google.maps.Marker({
        position: { lat: latitude, lng: longitude },
        map: map,
        title: 'Last Known Location!',
        icon: {
          url: 'https://res.cloudinary.com/dxmrcocqb/image/upload/v1714782499/Nexus_Suit_Sike_DM_1_sby7p2.png',
          scaledSize: new google.maps.Size(50, 50),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(25, 25)
        }
      });
    }
  };

  if (loadError) {
    return <div>Error loading maps: {loadError}</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, zIndex: 0 }}>
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default Index;
