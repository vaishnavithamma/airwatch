import { useEffect, useRef } from 'react';
import { MapPin, Info, Clock, Database, AlertTriangle } from 'lucide-react';
import { STATION_INFO, DATASET_META } from '../data/historicalData';
import { computeSummary } from '../utils/dataUtils';
import { HISTORICAL_DATA } from '../data/historicalData';

// Lazy-import to avoid SSR issues
let MapContainer: any, TileLayer: any, Marker: any, Popup: any, L: any;

function MapComponent() {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const summary = computeSummary(HISTORICAL_DATA);

  useEffect(() => {
    let isMounted = true;
    let mapInstance: any = null;

    async function initMap() {
      try {
        const leaflet = await import('leaflet');
        const L = leaflet.default;

        // Fix default icon paths
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        if (!mapRef.current || !isMounted) return;

        mapInstance = L.map(mapRef.current, {
          center: [STATION_INFO.latitude, STATION_INFO.longitude],
          zoom: 14,
          zoomControl: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(mapInstance);

        // Custom AQI-colored icon
        const stationIcon = L.divIcon({
          className: '',
          html: `
            <div style="
              width:44px; height:44px; border-radius:50%;
              background:#84CC16; border:3px solid white;
              box-shadow:0 2px 8px rgba(0,0,0,0.3);
              display:flex; align-items:center; justify-content:center;
              font-size:11px; font-weight:700; color:white;
              font-family:Inter,sans-serif;
            ">
              <div style="text-align:center;line-height:1.2">
                <div>62.3</div>
                <div style="font-size:7px;opacity:0.9">AQI</div>
              </div>
            </div>
            <div style="
              position:absolute; bottom:-8px; left:50%; transform:translateX(-50%);
              width:0; height:0;
              border-left:8px solid transparent; border-right:8px solid transparent;
              border-top:10px solid #84CC16;
            "></div>
          `,
          iconSize: [44, 54],
          iconAnchor: [22, 54],
          popupAnchor: [0, -56],
        });

        const marker = L.marker([STATION_INFO.latitude, STATION_INFO.longitude], {
          icon: stationIcon,
          alt: `${STATION_INFO.name} monitoring station`,
        }).addTo(mapInstance);

        marker.bindPopup(`
          <div style="font-family:Inter,sans-serif;min-width:220px;padding:4px">
            <div style="font-size:11px;font-weight:600;color:#64748B;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:6px">
              Air Quality Station
            </div>
            <div style="font-size:15px;font-weight:700;color:#0F172A;margin-bottom:2px">
              ${STATION_INFO.name}
            </div>
            <div style="font-size:11px;color:#64748B;margin-bottom:12px">
              ${STATION_INFO.city}, ${STATION_INFO.state}
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px">
              <div style="background:#F7FEE7;border:1px solid #D9F99D;border-radius:8px;padding:8px;text-align:center">
                <div style="font-size:20px;font-weight:800;color:#84CC16">${summary.meanAqi}</div>
                <div style="font-size:9px;color:#65A30D;font-weight:600;text-transform:uppercase">Mean AQI</div>
                <div style="font-size:9px;color:#84CC16;margin-top:1px">Satisfactory</div>
              </div>
              <div style="background:#F7FEE7;border:1px solid #D9F99D;border-radius:8px;padding:8px;text-align:center">
                <div style="font-size:14px;font-weight:700;color:#334155">14</div>
                <div style="font-size:9px;color:#64748B;font-weight:600;text-transform:uppercase">Days</div>
                <div style="font-size:9px;color:#94A3B8;margin-top:1px">Observed</div>
              </div>
            </div>
            <div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:6px;padding:6px 8px;font-size:10px;color:#9A3412">
              <strong>Historical data · 16–29 Sep 2026</strong>
              <br/>Not live/current readings
            </div>
            <div style="font-size:10px;color:#94A3B8;margin-top:6px">
              ${STATION_INFO.agency} · ${STATION_INFO.network}
            </div>
          </div>
        `, { maxWidth: 260 }).openPopup();

        mapInstanceRef.current = mapInstance;
      } catch (err) {
        console.error('Map init failed:', err);
      }
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      ref={mapRef}
      className="w-full h-[480px] rounded-xl border border-slate-200 overflow-hidden"
      role="application"
      aria-label="Interactive map showing Somajiguda TSPCB monitoring station location"
    />
  );
}

export function CityMapPage() {
  const summary = computeSummary(HISTORICAL_DATA);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Station Map</h1>
        <p className="text-sm text-navy-500 mt-1">
          Geolocation of the Somajiguda TSPCB air quality monitoring station
        </p>
      </div>

      {/* Scope warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex gap-2">
        <AlertTriangle size={14} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700">
          <strong>Scope limitation:</strong> Only the Somajiguda TSPCB station is represented by the supplied data.
          No measurements for other locations exist in this dataset.
          The map shows one station only and does not represent city-wide air quality.
          AQI values shown are historical 14-day means — not live readings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map */}
        <div className="lg:col-span-2">
          <MapComponent />
          <p className="text-xs text-navy-400 mt-2 text-center">
            Map tiles © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> contributors.
            Station coordinates are approximate.
          </p>
        </div>

        {/* Station info panel */}
        <div className="space-y-4">
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                <MapPin size={15} className="text-sky-600" />
              </div>
              <h2 className="text-sm font-semibold text-navy-800">Station Details</h2>
            </div>
            <div className="space-y-2 text-xs">
              {[
                { label: 'Station', value: STATION_INFO.name },
                { label: 'City', value: STATION_INFO.city },
                { label: 'State', value: STATION_INFO.state },
                { label: 'Agency', value: STATION_INFO.agency },
                { label: 'Network', value: STATION_INFO.network },
                { label: 'Coordinates', value: `${STATION_INFO.latitude}°N, ${STATION_INFO.longitude}°E` },
              ].map(row => (
                <div key={row.label} className="flex justify-between gap-2">
                  <span className="font-medium text-navy-500">{row.label}</span>
                  <span className="text-navy-800 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Historical data summary */}
          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                <Clock size={15} className="text-amber-600" />
              </div>
              <h2 className="text-sm font-semibold text-navy-800">Historical Summary</h2>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Mean AQI', value: `${summary.meanAqi}`, sub: 'Satisfactory' },
                { label: 'Max AQI', value: `${summary.maxAqi}`, sub: '21 Sep 2026' },
                { label: 'Min AQI', value: `${summary.minAqi}`, sub: '27 Sep 2026' },
                { label: 'Days', value: `${summary.count}`, sub: '16–29 Sep 2026' },
              ].map(item => (
                <div key={item.label} className="bg-slate-50 rounded-lg p-2.5 border border-slate-100 text-center">
                  <div className="text-lg font-bold text-navy-800">{item.value}</div>
                  <div className="text-xs text-navy-500 font-medium">{item.label}</div>
                  <div className="text-xs text-navy-400">{item.sub}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
                <Database size={15} className="text-blue-600" />
              </div>
              <h2 className="text-sm font-semibold text-navy-800">Data Provenance</h2>
            </div>
            <div className="text-xs text-navy-600 space-y-1">
              <p><strong>Source:</strong> CPCB CCR Data Repository</p>
              <p><strong>Period:</strong> 16–29 September 2026</p>
              <p><strong>Access date:</strong> 15 October 2026</p>
              <p className="text-navy-400 pt-1">
                This is historical data. No live station connection exists in this application.
              </p>
            </div>
          </div>

          {/* Legend */}
          <div className="card p-4">
            <h2 className="text-sm font-semibold text-navy-800 mb-3">AQI Marker Legend</h2>
            <div className="space-y-2">
              {[
                { color: '#22C55E', label: 'Good', range: '0–50' },
                { color: '#84CC16', label: 'Satisfactory', range: '51–100' },
                { color: '#F59E0B', label: 'Moderate', range: '101–200' },
                { color: '#F97316', label: 'Poor', range: '201–300' },
                { color: '#EF4444', label: 'Very Poor', range: '301–400' },
                { color: '#7C3AED', label: 'Severe', range: '401–500' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-medium text-navy-700 w-24">{item.label}</span>
                  <span className="text-xs font-mono text-navy-400">{item.range}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
