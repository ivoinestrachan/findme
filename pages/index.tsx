import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios';

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

      const fetchPosition = () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const currentPosition: Position = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              };

              
              try {
                await axios.post('/api/location', currentPosition);
                console.log('Location updated successfully');
              } catch (error) {
                console.error('Failed to update location:', error);
                setLoadError('Error updating your location.');
                return;
              }

             
              try {
                const response = await axios.get<Location>('/api/location');
                const { latitude, longitude } = response.data;

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
                    title: 'Current Location!',
                    icon: {
                      url: 'https://res.cloudinary.com/dxmrcocqb/image/upload/v1714782499/Nexus_Suit_Sike_DM_1_sby7p2.png',
                      scaledSize: new google.maps.Size(50, 50),
                      origin: new google.maps.Point(0, 0),
                      anchor: new google.maps.Point(25, 25)
                    }
                  });
                }
              } catch (error) {
                console.error('Failed to fetch location:', error);
                setLoadError('Error fetching location.');
              }
            },
            (error) => {
              console.error('Geolocation error:', error);
              setLoadError('Geolocation is not supported by this browser.');
            },
            { timeout: 5000 }
          );
        } else {
          setLoadError('Geolocation is not supported by this browser.');
        }
      };

      fetchPosition();
      const intervalId = setInterval(fetchPosition, 60000);

      return () => clearInterval(intervalId);
    };

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.API_KEY}&callback=initMap`;
    script.async = true;
    script.defer = true;
    document.head.appendChild(script);

    script.onerror = () => {
      console.error('Google Maps script failed to load.');
      setLoadError('Google Maps script failed to load.');
    };
  }, []);

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
