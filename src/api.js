import axios from 'axios';

// Bounding box for Asturias/Cantabrian Sea area
// minLat, minLon, maxLat, maxLon
const BB_NORTH = 44.5;
const BB_SOUTH = 43.0; // Inland
const BB_WEST = -7.5;  // West Asturias/Galicia border
const BB_EAST = -4.5;  // East Asturias/Cantabria

export const fetchLiveAircrafts = async () => {
    try {
        // OpenSky API (Anonymous users: 10s update limit, limited credits)
        const response = await axios.get('https://opensky-network.org/api/states/all', {
            params: {
                lamin: BB_SOUTH,
                lomin: BB_WEST,
                lamax: BB_NORTH,
                lomax: BB_EAST
            }
        });

        if (!response.data || !response.data.states) {
            return [];
        }

        // Airline Codes Mapping
        const airlines = {
            'VLG': 'Vueling',
            'RYR': 'Ryanair',
            'IBE': 'Iberia',
            'IBS': 'Iberia Express',
            'ANE': 'Air Nostrum',
            'AEA': 'Air Europa',
            'EZY': 'EasyJet',
            'BAW': 'British Airways',
            'DLH': 'Lufthansa',
            'VOE': 'Volotea',
            'TAP': 'TAP Portugal',
            'TRA': 'Transavia'
        };

        // Map raw data to our app structure
        return response.data.states.map(state => {
            const callsign = state[1].trim();
            const airlineCode = callsign.substring(0, 3);
            const airline = airlines[airlineCode] || 'Privado / Desconocido';

            return {
                id: state[0], // icao24
                callsign: callsign,
                airline: airline,
                country: state[2],
                lng: state[5],
                lat: state[6],
                onGround: state[8],
                velocity: state[9],
                heading: state[10],
                altitude: state[13]
            };
        }).filter(p => !p.onGround); // Only show flying planes for the map

    } catch (error) {
        console.error("Error fetching OpenSky data:", error);
        return [];
    }
};

// AviationStack API (Requires Key)
// Get your free key at https://aviationstack.com/
const AVIATION_STACK_KEY = import.meta.env.VITE_AVIATION_STACK_KEY || '6f09b5a4a92cdc30b3f7d4e78f63d9e6';

export const fetchFlights = async () => {
    if (AVIATION_STACK_KEY === 'YOUR_API_KEY_HERE') {
        console.warn("AviationStack Key missing. Using mock data.");
        return null;
    }

    // CORS Proxy for GitHub Pages (allows HTTP API calls from HTTPS site)
    const PROXY = 'https://api.allorigins.win/raw?url=';

    try {
        const arrivalsUrl = `${PROXY}${encodeURIComponent(`http://api.aviationstack.com/v1/flights?access_key=${AVIATION_STACK_KEY}&arr_iata=OVD`)}`;
        const departuresUrl = `${PROXY}${encodeURIComponent(`http://api.aviationstack.com/v1/flights?access_key=${AVIATION_STACK_KEY}&dep_iata=OVD`)}`;

        // Fetch arrivals and departures in parallel
        const [arrivals, departures] = await Promise.all([
            axios.get(arrivalsUrl),
            axios.get(departuresUrl)
        ]);

        return [
            ...(arrivals.data.data || []),
            ...(departures.data.data || [])
        ];
    } catch (error) {
        console.error("Error fetching flight data via proxy:", error);
        return null;
    }
};

// Open-Meteo (Free, No Key)
export const fetchWeather = async () => {
    try {
        const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
            params: {
                latitude: 43.5636, // OVD Custom Coords
                longitude: -6.0347,
                current: 'temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m,wind_direction_10m,visibility',
                timezone: 'auto'
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error fetching weather:", error);
        return null;
    }
};

export const getWeatherCondition = (code) => {
    // WMO Weather interpretation codes (WW)
    const codes = {
        0: 'Despejado',
        1: 'Mayormente Despejado',
        2: 'Parcialmente Nublado',
        3: 'Nublado',
        45: 'Niebla',
        48: 'Niebla con escarcha',
        51: 'Llovizna Ligera',
        53: 'Llovizna Moderada',
        55: 'Llovizna Densa',
        61: 'Lluvia Leve',
        63: 'Lluvia Moderada',
        65: 'Lluvia Fuerte',
        71: 'Nieve Ligera',
        73: 'Nieve Moderada',
        75: 'Nieve Fuerte',
        95: 'Tormenta',
    };
    return codes[code] || 'Desconocido';
};

export const translateStatus = (status) => {
    const map = {
        'scheduled': 'Programado',
        'active': 'En Vuelo',
        'landed': 'Aterrizado',
        'cancelled': 'Cancelado',
        'incident': 'Incidente',
        'diverted': 'Desviado'
    };
    return map[status] || status;
};

export const getStatusType = (status) => {
    if (status === 'landed') return 'success';
    if (status === 'active') return 'info';
    if (status === 'cancelled' || status === 'diverted') return 'error';
    return 'neutral';
};
