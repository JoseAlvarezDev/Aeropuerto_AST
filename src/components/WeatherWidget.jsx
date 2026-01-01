import React, { useEffect, useState } from 'react';
import { CloudFog, Wind, Droplets, Thermometer, Sun, CloudRain, CloudSnow, Moon } from 'lucide-react';
import { fetchWeather, getWeatherCondition } from '../api';

export default function WeatherWidget() {
    const [weather, setWeather] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadWeather = async () => {
            const data = await fetchWeather();
            if (data && data.current) {
                setWeather({
                    temp: Math.round(data.current.temperature_2m),
                    condition: getWeatherCondition(data.current.weather_code),
                    wind: Math.round(data.current.wind_speed_10m),
                    humidity: data.current.relative_humidity_2m,
                    visibility: data.current.visibility,
                    isDay: data.current.is_day === 1,
                    code: data.current.weather_code
                });
            }
            setLoading(false);
        };
        loadWeather();
        // Refresh every 10 mins
        const interval = setInterval(loadWeather, 600000);
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="glass-panel" style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Cargando clima...</div>;
    if (!weather) return null;

    // Dynamic icon based on code
    const getWeatherIcon = () => {
        const code = weather.code;
        if (code >= 95) return <CloudRain size={32} color="var(--accent-amber)" />;
        if (code >= 71) return <CloudSnow size={32} color="white" />;
        if (code >= 51) return <CloudRain size={32} color="var(--accent-cyan)" />;
        if (code >= 45) return <CloudFog size={32} color="#94a3b8" />;
        if (code <= 3 && !weather.isDay) return <Moon size={32} color="var(--accent-cyan)" />;
        if (code <= 2) return <Sun size={32} color="var(--accent-amber)" />;
        return <CloudFog size={32} color="#94a3b8" />; // Default cloud
    };

    const isIFR = weather.visibility < 5000 || weather.code >= 45; // Low visibility logic

    return (
        <div className="glass-panel" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {getWeatherIcon()}
                    <div>
                        <div style={{ fontSize: '2rem', fontWeight: '800', lineHeight: 1 }}>{weather.temp}°</div>
                        <div style={{ fontSize: '0.9rem', color: '#94a3b8' }}>{weather.condition}</div>
                    </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                    {isIFR && <div style={{
                        background: 'rgba(239, 68, 68, 0.2)',
                        color: 'var(--accent-red)',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.75rem',
                        fontWeight: 'bold',
                        display: 'inline-block',
                        marginBottom: '0.25rem'
                    }}>IFR</div>}
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Santiago del Monte / LEAS</div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem' }}>
                <WeatherMetric icon={<Wind size={16} />} label="Viento" value={`${weather.wind} km/h`} />
                <WeatherMetric icon={<Droplets size={16} />} label="Humedad" value={`${weather.humidity}%`} />
                <WeatherMetric icon={<Thermometer size={16} />} label="Visibilidad" value={`${(weather.visibility / 1000).toFixed(1)} km`} />
            </div>
        </div>
    );
}

function WeatherMetric({ icon, label, value }) {
    return (
        <div style={{ textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem', color: 'var(--accent-cyan)' }}>{icon}</div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginBottom: '0.1rem' }}>{label}</div>
            <div style={{ fontSize: '0.9rem', fontWeight: '600' }}>{value}</div>
        </div>
    );
}
