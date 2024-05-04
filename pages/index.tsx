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
      fetchPosition();
      const intervalId = setInterval(fetchPosition, 60000);
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

  const fetchPosition = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const currentPosition: Position = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };

          try {
            const postResponse = await fetch('/api/location', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify(currentPosition),
            });

            if (!postResponse.ok) {
              throw new Error(`HTTP error! Status: ${postResponse.status}`);
            }

            console.log('Location updated successfully');
          } catch (error) {
            console.error('Failed to update location:', error);
            setLoadError('Error updating your location.');
          }

          try {
            const getResponse = await fetch('/api/location');
            if (!getResponse.ok) {
              throw new Error(`HTTP error! Status: ${getResponse.status}`);
            }
            const locationData: Location = await getResponse.json();
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
