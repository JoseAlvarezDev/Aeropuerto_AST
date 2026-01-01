import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { fetchLiveAircrafts } from '../api';

// Fix for default marker icons in React Leaflet - REMOVED (using custom icons)
// import icon from 'leaflet/dist/images/marker-icon.png';
// import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Custom Plane Icon Component
const createPlaneIcon = (heading) => L.divIcon({
    html: `<div style="transform: rotate(${heading}deg); width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.8));">
    <svg width="36" height="36" viewBox="0 0 24 24" fill="#06b6d4" stroke="#e0f2fe" stroke-width="1.5">
      <path d="M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5l-2-1.5v-5.5l8 2.5z"/>
    </svg>
  </div>`,
    className: 'plane-icon',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18]
});



export default function Map({ onPlaneHover, schedule = [] }) {
    const OVD_COORDS = [43.5636, -6.0347];
    const [planes, setPlanes] = useState([]);
    const [history, setHistory] = useState({}); // { icao24: [ [lat,lng], ... ] }

    // Fetch Live Data
    useEffect(() => {
        const getData = async () => {
            const data = await fetchLiveAircrafts();
            if (data) {
                // Update History
                setHistory(prev => {
                    const newHistory = { ...prev };
                    data.forEach(p => {
                        const id = p.callsign || p.id;
                        if (!newHistory[id]) newHistory[id] = [];
                        const lastPoint = newHistory[id][newHistory[id].length - 1];
                        // Only add if position changed significantly
                        if (!lastPoint || (lastPoint[0] !== p.lat || lastPoint[1] !== p.lng)) {
                            newHistory[id] = [...newHistory[id], [p.lat, p.lng]].slice(-10); // Keep last 10 points
                        }
                    });
                    return newHistory;
                });

                // Transform for map
                const mapPlanes = data.map(p => {
                    const id = p.callsign || p.id;
                    // ... (rest of logic same)
                    // Try to find matching schedule info
                    const flightInfo = schedule.find(s =>
                        (s.rawIcao && s.rawIcao === p.callsign) ||
                        (s.flight && p.callsign && s.flight.includes(p.callsign.replace(/\D/g, ''))) // Fallback digit match
                    );

                    return {
                        id: id,
                        airline: p.airline,
                        country: p.country,
                        pos: [p.lat, p.lng],
                        heading: p.heading,
                        speed: Math.round(p.velocity * 3.6),
                        alt: Math.round(p.altitude),
                        callsign: p.callsign,
                        // Enhanced info from schedule
                        route: flightInfo ? flightInfo.city : null,
                        routeLabel: flightInfo ? (flightInfo.type === 'arrival' ? 'Origen' : 'Destino') : null,
                        aircraft: flightInfo ? flightInfo.aircraft : null
                    };
                });
                setPlanes(mapPlanes);
            }
        };

        getData(); // Initial fetch
        const interval = setInterval(getData, 10000); // 10s polling (OpenSky limit)
        return () => clearInterval(interval);
    }, [schedule]); // Re-run when schedule updates

    return (
        <div className="glass-panel map-section" style={{ height: '100%', minHeight: '400px', position: 'relative' }}>
            <MapContainer
                center={OVD_COORDS}
                zoom={9} // Zoomed out a bit to see the approach
                style={{ height: '100%', width: '100%', borderRadius: '16px' }}
                zoomControl={false}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                />

                {/* Airport Marker */}
                <Marker position={OVD_COORDS} icon={L.divIcon({
                    html: '<div style="background: rgba(16, 185, 129, 0.2); width: 24px; height: 24px; border-radius: 50%; border: 2px solid var(--accent-green);"></div>',
                    className: 'airport-marker'
                })}>
                    <Popup className="glass-popup">Aeropuerto de Asturias (OVD)</Popup>
                </Marker>

                {/* Flight Trails */}
                {Object.entries(history).map(([id, points]) => (
                    <Polyline
                        key={`trail-${id}`}
                        positions={points}
                        pathOptions={{
                            color: '#06b6d4',
                            weight: 2,
                            opacity: 0.4,
                            dashArray: '5, 10'
                        }}
                    />
                ))}

                {/* Planes */}
                {planes.map(plane => (
                    <Marker
                        key={plane.id}
                        position={plane.pos}
                        icon={createPlaneIcon(plane.heading)}
                        eventHandlers={{
                            mouseover: () => onPlaneHover && onPlaneHover(plane.id),
                            mouseout: () => onPlaneHover && onPlaneHover(null)
                        }}
                    >
                        <Popup className="glass-popup" minWidth={200}>
                            <div style={{ padding: '0.5rem', minWidth: '180px' }}>
                                <div style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.1)',
                                    paddingBottom: '0.5rem',
                                    marginBottom: '0.5rem',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)', color: 'white' }}>
                                        {plane.callsign || 'N/A'}
                                    </span>
                                    <span style={{ fontSize: '1.5rem', lineHeight: 1 }}>✈️</span>
                                </div>

                                <div style={{ fontSize: '0.9rem', fontWeight: '600', color: 'var(--accent-cyan)', marginBottom: '0.25rem' }}>
                                    {plane.airline}
                                </div>
                                {plane.aircraft && (
                                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.5rem', fontFamily: 'var(--font-mono)' }}>
                                        #{plane.aircraft}
                                    </div>
                                )}

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.8rem', color: '#94a3b8' }}>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Altitud</div>
                                        <div style={{ color: 'white', fontFamily: 'var(--font-mono)' }}>{plane.alt}m</div>
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Velocidad</div>
                                        <div style={{ color: 'white', fontFamily: 'var(--font-mono)' }}>{plane.speed} km/h</div>
                                    </div>
                                    {plane.route && (
                                        <div style={{ gridColumn: 'span 2', marginTop: '0.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '0.5rem' }}>
                                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--accent-green)' }}>{plane.routeLabel}</div>
                                            <div style={{ color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>{plane.route}</div>
                                        </div>
                                    )}
                                    {!plane.route && (
                                        <div style={{ gridColumn: 'span 2' }}>
                                            <div style={{ fontSize: '0.7rem', textTransform: 'uppercase' }}>Origen Pais</div>
                                            <div style={{ color: 'white' }}>{plane.country}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

            {/* Overlay Title */}
            <div style={{
                position: 'absolute',
                top: '1rem',
                left: '1rem',
                zIndex: 1000,
                background: 'rgba(0,0,0,0.5)',
                padding: '0.5rem 1rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#fff',
                backdropFilter: 'blur(4px)'
            }}>
                LIVE TRAFFIC MAP
            </div>
        </div>
    );
}
