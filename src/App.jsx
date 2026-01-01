import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import Map from './components/Map';
import FlightBoard from './components/FlightBoard';
import WeatherWidget from './components/WeatherWidget';
import SplashScreen from './components/SplashScreen';
import { fetchFlights, translateStatus, getStatusType } from './api';

function App() {
  const [hoveredFlight, setHoveredFlight] = useState(null);
  const [showSplash, setShowSplash] = useState(true); // Start true
  const [flightSchedule, setFlightSchedule] = useState([]);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    // Centralized Flight Fetching (AviationStack)
    // We fetch here so we can share data between Map (enrich popups) and Board
    const getData = async () => {
      const data = await fetchFlights();
      if (data) {
        // Transform AviationStack data to our format
        const realFlights = data.map((f, i) => {
          const isArrival = f.arrival.iata === 'OVD';
          return {
            id: i,
            rawIata: f.flight.iata,
            rawIcao: f.flight.icao,
            type: isArrival ? 'arrival' : 'departure',
            flight: f.flight.iata,
            airline: f.airline.name,
            time: isArrival ? f.arrival.scheduled.substr(11, 5) : f.departure.scheduled.substr(11, 5),
            city: isArrival ? f.departure.airport : f.arrival.airport,
            terminal: isArrival ? f.arrival.terminal : f.departure.terminal,
            gate: isArrival ? f.arrival.gate : f.departure.gate,
            aircraft: f.aircraft ? f.aircraft.registration || f.aircraft.iata : null,
            status: translateStatus(f.flight_status),
            statusType: getStatusType(f.flight_status)
          };
        });
        setFlightSchedule(realFlights);
        setIsLive(true);
      }
    };
    getData();
  }, []);

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <div className="app-container">
      <Header />

      <main className="main-grid">
        {/* Map Section - Primary Focus */}
        <Map
          onPlaneHover={setHoveredFlight}
          schedule={flightSchedule}
        />

        {/* Info Sidebar */}
        <div className="info-section">
          <WeatherWidget />
          {/* Note: FlightBoard will gracefully fallback to mocks if schedule is empty, 
              but since we lifted state, let's pass it or null */}
          <FlightBoard
            highlightedFlight={hoveredFlight}
            externalFlights={flightSchedule}
            isLive={isLive}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
