import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix default marker icons broken by webpack/vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom green marker for available workers
const createWorkerIcon = (availability) => {
  const colors = {
    available: '#16a34a',
    busy: '#ca8a04',
    offline: '#6b7280',
  };
  const color = colors[availability] || colors.offline;

  return L.divIcon({
    className: '',
    html: `
      <div style="
        width: 36px; height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          width: 14px; height: 14px;
          background: white;
          border-radius: 50%;
          position: absolute;
          top: 50%; left: 50%;
          transform: translate(-50%, -50%);
        "></div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

// Auto-fit map bounds when workers change
function FitBounds({ workers }) {
  const map = useMap();

  useEffect(() => {
    const validWorkers = workers.filter(
      (w) =>
        w.location?.coordinates?.coordinates?.[0] !== 0 ||
        w.location?.coordinates?.coordinates?.[1] !== 0
    );

    if (validWorkers.length === 0) return;

    const bounds = validWorkers.map((w) => [
      w.location.coordinates.coordinates[1],
      w.location.coordinates.coordinates[0],
    ]);

    if (bounds.length === 1) {
      map.setView(bounds[0], 12);
    } else {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [workers, map]);

  return null;
}

// City center coordinates fallback when worker has no GPS
const CITY_COORDS = {
  'delhi':      [28.6139, 77.2090],
  'mumbai':     [19.0760, 72.8777],
  'bangalore':  [12.9716, 77.5946],
  'hyderabad':  [17.3850, 78.4867],
  'chennai':    [13.0827, 80.2707],
  'kolkata':    [22.5726, 88.3639],
  'pune':       [18.5204, 73.8567],
  'ahmedabad':  [23.0225, 72.5714],
  'jaipur':     [26.9124, 75.7873],
  'lucknow':    [26.8467, 80.9462],
  'noida':      [28.5355, 77.3910],
  'surat':      [21.1702, 72.8311],
  'kochi':      [9.9312,  76.2673],
  'chandigarh': [30.7333, 76.7794],
  'indore':     [22.7196, 75.8577],
  'bhopal':     [23.2599, 77.4126],
  'patna':      [25.5941, 85.1376],
  'kanpur':     [26.4499, 80.3319],
  'varanasi':   [25.3176, 82.9739],
  'coimbatore': [11.0168, 76.9558],
  'nashik':     [19.9975, 73.7898],
  'agra':       [27.1767, 78.0081],
  'dehradun':   [30.3165, 78.0322],
};

const getWorkerCoords = (worker) => {
  const [lng, lat] = worker.location?.coordinates?.coordinates || [0, 0];
  if (lat !== 0 || lng !== 0) return [lat, lng];

  // Fall back to city center
  const city = worker.location?.city?.toLowerCase();
  return CITY_COORDS[city] || [20.5937, 78.9629]; // India center
};

export default function WorkerMap({ workers }) {
  if (!workers || workers.length === 0) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-100 dark:bg-[#0f1f35] rounded-2xl">
        <div className="text-center">
          <p className="text-4xl mb-3">🗺️</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">No workers to show on map</p>
          <p className="text-xs text-gray-400 mt-1">Try adjusting your filters</p>
        </div>
      </div>
    );
  }

  // Default center — India
  const defaultCenter = [20.5937, 78.9629];

  return (
    <div className="h-full rounded-2xl overflow-hidden border border-gray-100 dark:border-white/10 shadow-card">
      <MapContainer
        center={defaultCenter}
        zoom={5}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitBounds workers={workers} />

        {workers.map((worker) => {
          const coords = getWorkerCoords(worker);
          const icon = createWorkerIcon(worker.availability);

          return (
            <Marker key={worker._id} position={coords} icon={icon}>
              <Popup className="worker-popup" maxWidth={220}>
                <div className="p-1">
                  <div className="flex items-center gap-2 mb-2">
                    <img
                      src={worker.user?.avatar?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(worker.user?.name || 'W')}&background=16a34a&color=fff&size=64`}
                      alt={worker.user?.name}
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                    <div>
                      <p className="font-bold text-gray-900 text-sm leading-tight">{worker.user?.name}</p>
                      <p className="text-xs text-gray-500">{worker.profession}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="text-yellow-600 font-semibold">⭐ {worker.ratingAvg?.toFixed(1)}</span>
                    <span className="font-bold text-gray-900">₹{worker.rateAmount}/{worker.rateType === 'hourly' ? 'hr' : 'day'}</span>
                  </div>

                  <Link
                    to={`/workers/${worker._id}`}
                    className="block w-full text-center text-xs font-bold text-white bg-green-600 hover:bg-green-700 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    View Profile →
                  </Link>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}
