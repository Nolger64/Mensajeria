import { PartnerStore, Coworker, DriverProfile, DeliveryOrder } from '../../types';

interface AdminMapHtmlParams {
  driver: DriverProfile;
  coworkers: Coworker[];
  stores: PartnerStore[];
  activeOrders: DeliveryOrder[];
}

export function generateAdminMapHtml({
  driver,
  coworkers,
  stores,
  activeOrders,
}: AdminMapHtmlParams): string {
  const allWorkers = [
    {
      id: driver.id,
      name: `${driver.name} (Tú)`,
      nickname: driver.alias,
      vehicle: driver.vehicle,
      status: driver.isOnline ? 'disponible' : 'descanso',
      rating: driver.rating,
      completedOrdersToday: driver.totalOrdersToday,
      batteryLevel: 95,
      coordinates: driver.coordinates,
      isMainDriver: true,
    },
    ...coworkers.map((c) => ({ ...c, isMainDriver: false })),
  ];

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>FHS Admin Dispatch Fleet</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" crossorigin="" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <script>
    if (typeof L === 'undefined') {
      document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.css" />');
      document.write('<script src="https://cdn.jsdelivr.net/npm/leaflet@1.9.4/dist/leaflet.js"><\\/script>');
    }
  </script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body, #map { width: 100%; height: 100%; background: #121418; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    
    /* Fleet Worker Marker */
    .admin-worker-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .admin-worker-marker:hover {
      transform: scale(1.2) translateY(-4px);
    }
    .worker-badge-box {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      border: 3px solid #00C853;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      position: relative;
    }
    .worker-badge-box.en_ruta { border-color: #2979FF; }
    .worker-badge-box.en_tienda { border-color: #FF9100; }
    .worker-badge-box.descanso { border-color: #757575; }

    .battery-pip {
      position: absolute;
      bottom: -4px;
      right: -4px;
      background: #1A1D20;
      color: #00C853;
      font-size: 8px;
      font-weight: 800;
      border-radius: 6px;
      padding: 1px 3px;
      border: 1px solid #333;
    }

    .worker-name-tag {
      background: rgba(18, 20, 24, 0.95);
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 8px;
      margin-top: 3px;
      white-space: nowrap;
      border: 1px solid #2C323B;
      box-shadow: 0 2px 6px rgba(0,0,0,0.5);
    }

    /* Store Marker */
    .admin-store-marker {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
    }
    .admin-store-box {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: #FFFFFF;
      border: 2px solid #FF441F;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
    }
    .admin-store-tag {
      background: #FF441F;
      color: white;
      font-size: 9px;
      font-weight: 800;
      padding: 1px 5px;
      border-radius: 6px;
      margin-top: 2px;
      white-space: nowrap;
    }
  </style>
</head>
<body>
  <div id="map"></div>

  <script>
    function sendToHost(data) {
      if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
        window.ReactNativeWebView.postMessage(JSON.stringify(data));
      } else if (window.parent && window.parent.postMessage) {
        window.parent.postMessage(JSON.stringify(data), '*');
      }
    }

    const workers = ${JSON.stringify(allWorkers)};
    const stores = ${JSON.stringify(stores)};
    const activeOrders = ${JSON.stringify(activeOrders)};

    // Admin Dark theme map using CartoDB Dark Matter
    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([4.6750, -74.0550], 14);

    // OpenStreetMap 100% público, libre de API Keys
    const baseTile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    });

    baseTile.on('tileerror', function(error) {
      if (error && error.tile) {
        error.tile.src = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/' + error.coords.z + '/' + error.coords.y + '/' + error.coords.x;
      }
    });

    baseTile.addTo(map);

    // High Demand Polygon
    L.polygon([
      [4.6710, -74.0580],
      [4.6810, -74.0580],
      [4.6810, -74.0500],
      [4.6710, -74.0500]
    ], {
      color: '#FF441F',
      weight: 1.5,
      dashArray: '5, 5',
      fillColor: '#FF441F',
      fillOpacity: 0.08
    }).addTo(map);

    // Render Stores
    stores.forEach(st => {
      const storeHtml = \`
        <div class="admin-store-marker">
          <div class="admin-store-box">
            <span>\${st.logo}</span>
          </div>
          <div class="admin-store-tag">\${st.name.split('-')[0].trim()}</div>
        </div>
      \`;

      const icon = L.divIcon({
        className: 'adm-st',
        html: storeHtml,
        iconSize: [60, 50],
        iconAnchor: [30, 25]
      });

      const marker = L.marker([st.coordinates.latitude, st.coordinates.longitude], { icon }).addTo(map);
      marker.on('click', () => {
        sendToHost({ type: 'SELECT_STORE', id: st.id });
      });
    });

    // Render Workers
    workers.forEach(w => {
      const vehicleEmoji = w.vehicle === 'moto' ? '🏍️' : w.vehicle === 'bici' ? '🚲' : '🚗';
      const statusClass = w.status;
      const workerHtml = \`
        <div class="admin-worker-marker">
          <div class="worker-badge-box \${statusClass}">
            <span>\${vehicleEmoji}</span>
            <div class="battery-pip">\${w.batteryLevel}%</div>
          </div>
          <div class="worker-name-tag">
            \${w.name}
          </div>
        </div>
      \`;

      const icon = L.divIcon({
        className: 'adm-wrk',
        html: workerHtml,
        iconSize: [60, 55],
        iconAnchor: [30, 27]
      });

      const marker = L.marker([w.coordinates.latitude, w.coordinates.longitude], { icon, zIndexOffset: 500 }).addTo(map);
      marker.on('click', () => {
        sendToHost({ type: 'SELECT_WORKER', id: w.id });
      });
    });

    // Render Active Order Polylines (Admin Route Tracking)
    activeOrders.forEach(ord => {
      if (ord.store && ord.customerCoordinates) {
        const storePos = [ord.store.coordinates.latitude, ord.store.coordinates.longitude];
        const custPos = [ord.customerCoordinates.latitude, ord.customerCoordinates.longitude];

        // Draw animated delivery route line
        L.polyline([storePos, custPos], {
          color: '#2979FF',
          weight: 4,
          opacity: 0.8,
          dashArray: '8, 8'
        }).addTo(map);
      }
    });

    // Recenter helper
    window.centerOnLocation = function(lat, lng) {
      map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
    };

    sendToHost({ type: 'MAP_READY' });
  </script>
</body>
</html>
  `;
}
