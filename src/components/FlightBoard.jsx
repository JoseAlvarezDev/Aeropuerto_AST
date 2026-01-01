import React, { useState } from 'react';
import { PlaneTakeoff, PlaneLanding, Clock, AlertCircle } from 'lucide-react';

const MOCK_FLIGHTS = [
    { id: 1, type: 'arrival', flight: 'IB478', airline: 'Iberia', time: '18:45', city: 'Madrid (MAD)', status: 'Aterrizado', statusType: 'success' },
    { id: 2, type: 'arrival', flight: 'VY1562', airline: 'Vueling', time: '19:10', city: 'Barcelona (BCN)', status: 'En Aproximación', statusType: 'info' },
    { id: 3, type: 'departure', flight: 'IB479', airline: 'Iberia', time: '19:30', city: 'Madrid (MAD)', status: 'Embarcando', statusType: 'warning' },
    { id: 4, type: 'departure', flight: 'V73510', airline: 'Volotea', time: '20:00', city: 'Alicante (ALC)', status: 'Programado', statusType: 'neutral' },
    { id: 5, type: 'arrival', flight: 'RYR231', airline: 'Ryanair', time: '20:15', city: 'Londres (STN)', status: 'Retrasado 20m', statusType: 'error' },
];

export default function FlightBoard({ highlightedFlight, externalFlights, isLive }) {
    const [view, setView] = useState('all'); // 'all', 'arrival', 'departure'

    // Use external data if available, otherwise mock
    const flights = (externalFlights && externalFlights.length > 0) ? externalFlights : MOCK_FLIGHTS;

    const filteredFlights = view === 'all'
        ? flights
        : flights.filter(f => f.type === view);

    return (
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%' }}>
            <div style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid var(--glass-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <TabButton active={view === 'all'} onClick={() => setView('all')}>Todos</TabButton>
                    <TabButton active={view === 'arrival'} onClick={() => setView('arrival')}>Llegadas</TabButton>
                    <TabButton active={view === 'departure'} onClick={() => setView('departure')}>Salidas</TabButton>
                </div>
                {isLive && <div style={{ fontSize: '0.75rem', color: 'var(--accent-green)', fontWeight: 'bold' }}>● DATA LIVE</div>}
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', color: '#94a3b8', textAlign: 'left' }}>
                            <th style={{ padding: '1rem' }}>Vuelo</th>
                            <th style={{ padding: '1rem' }}>Destino / Origen</th>
                            <th style={{ padding: '1rem' }}>Hora</th>
                            <th style={{ padding: '1rem', textAlign: 'right' }}>Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredFlights.map(flight => {
                            // Matching logic: OpenSky usually returns ICAO (e.g., VLG1234). AviationStack has IATA (VY1234).
                            // We check if highlightedFlight (from Map) is contained in flight number or vice versa, 
                            // or match numerically to capture "1234".
                            const isHighlighted = highlightedFlight && (
                                flight.flight === highlightedFlight ||
                                (flight.rawIcao && flight.rawIcao === highlightedFlight) ||
                                // Fuzzy match for demo: check if flight number digits match
                                (highlightedFlight.match(/\d+/) && flight.flight && flight.flight.includes(highlightedFlight.match(/\d+/)[0]))
                            );

                            return (
                                <tr key={flight.id} style={{
                                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    background: isHighlighted ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                                    transition: 'background 0.3s ease',
                                    borderLeft: isHighlighted ? '4px solid var(--accent-cyan)' : '4px solid transparent'
                                }}>
                                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)', fontWeight: '700', color: 'white' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            {flight.type === 'departure'
                                                ? <PlaneTakeoff size={16} color="var(--accent-cyan)" />
                                                : <PlaneLanding size={16} color="var(--accent-green)" />
                                            }
                                            {flight.flight}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '1.5rem', fontWeight: '400' }}>{flight.airline}</div>
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div>{flight.city}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', gap: '0.75rem', marginTop: '0.2rem' }}>
                                            {(flight.terminal || flight.gate) && (
                                                <span style={{ color: 'var(--accent-amber)' }}>
                                                    {flight.terminal ? `T${flight.terminal}` : ''}{flight.gate ? ` • G${flight.gate}` : ''}
                                                </span>
                                            )}
                                            {flight.aircraft && (
                                                <span style={{ fontFamily: 'var(--font-mono)' }}>#{flight.aircraft}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', fontFamily: 'var(--font-mono)' }}>{flight.time}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <StatusBadge status={flight.status} type={flight.statusType} />
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function TabButton({ children, active, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                background: active ? 'white' : 'transparent',
                color: active ? 'var(--bg-darker)' : '#94a3b8',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '20px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s'
            }}
        >
            {children}
        </button>
    );
}

function StatusBadge({ status, type }) {
    const colors = {
        success: 'var(--accent-green)',
        warning: 'var(--accent-amber)',
        error: 'var(--accent-red)',
        info: 'var(--accent-cyan)',
        neutral: '#94a3b8'
    };

    return (
        <span style={{
            color: colors[type],
            fontWeight: '600',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: `color - mix(in srgb, ${colors[type]}, transparent 90 %)`,
            padding: '0.25rem 0.75rem',
            borderRadius: '4px',
            fontSize: '0.8rem'
        }}>
            {type === 'error' && <AlertCircle size={12} />}
            {type === 'warning' && <Clock size={12} />}
            {status}
        </span>
    );
}
