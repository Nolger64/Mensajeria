import { PartnerStore, Coworker, Coordinates, DeliveryOrder, DeliveryStar } from '../../types';

interface MapHtmlParams {
  driverLocation: Coordinates;
  stores: PartnerStore[];
  coworkers: Coworker[];
  deliveryStars?: DeliveryStar[];
  showStores: boolean;
  showCoworkers: boolean;
  showDemandZones: boolean;
  showStars?: boolean;
  activeOrder: DeliveryOrder | null;
}

export function generateMapHtml({
  driverLocation,
  stores,
  coworkers,
  deliveryStars = [],
  showStores,
  showCoworkers,
  showDemandZones,
  showStars = true,
  activeOrder,
}: MapHtmlParams): string {
  const storesJson = JSON.stringify(showStores ? stores : []);
  const coworkersJson = JSON.stringify(showCoworkers ? coworkers : []);
  const starsJson = JSON.stringify(showStars ? deliveryStars : []);
  const activeOrderJson = JSON.stringify(activeOrder);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>FHS Driver Radar</title>
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
    html, body, #map { width: 100%; height: 100%; background: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; }
    
    /* Driver Pulse Marker */
    .driver-outer-pulse {
      position: relative;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .driver-pulse-ring {
      position: absolute;
      width: 48px;
      height: 48px;
      border-radius: 50%;
      background: rgba(255, 68, 31, 0.25);
      animation: pulse-animation 2s infinite ease-out;
    }
    .driver-core-badge {
      position: relative;
      width: 32px;
      height: 32px;
      background: #FF441F;
      border: 3px solid #FFFFFF;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(255, 68, 31, 0.45);
      font-size: 16px;
      color: white;
    }
    @keyframes pulse-animation {
      0% { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(1.6); opacity: 0; }
    }

    /* Store Marker */
    .store-marker-pin {
      position: relative;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .store-marker-pin:hover {
      transform: scale(1.15) translateY(-4px);
    }
    .store-icon-bubble {
      width: 40px;
      height: 40px;
      border-radius: 12px;
      background: #FFFFFF;
      border: 2px solid #FF441F;
      box-shadow: 0 6px 14px rgba(0, 0, 0, 0.16);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      position: relative;
    }
    .partner-diamond-badge {
      position: absolute;
      top: -6px;
      right: -6px;
      background: #00C853;
      color: white;
      border-radius: 8px;
      padding: 1px 4px;
      font-size: 9px;
      font-weight: 800;
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
    .store-name-tag {
      background: rgba(26, 29, 32, 0.92);
      color: white;
      font-size: 11px;
      font-weight: 700;
      padding: 3px 7px;
      border-radius: 10px;
      white-space: nowrap;
      margin-top: 4px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.25);
    }
    .store-orders-count {
      color: #FFB300;
      margin-left: 3px;
    }

    /* Coworker Marker */
    .coworker-marker-pin {
      position: relative;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      transition: transform 0.2s ease;
    }
    .coworker-marker-pin:hover {
      transform: scale(1.15) translateY(-3px);
    }
    .coworker-bubble {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: #FFFFFF;
      box-shadow: 0 4px 10px rgba(0,0,0,0.18);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      border: 3px solid #00C853;
    }
    .coworker-bubble.en_ruta { border-color: #2979FF; }
    .coworker-bubble.en_tienda { border-color: #FF9100; }
    .coworker-label {
      background: #FFFFFF;
      color: #1A1D20;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 8px;
      margin-top: 3px;
      border: 1px solid #E0E0E0;
      box-shadow: 0 2px 4px rgba(0,0,0,0.12);
      white-space: nowrap;
      display: flex;
      align-items: center;
      gap: 3px;
    }
    .status-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: #00C853;
    }
    .status-dot.en_ruta { background: #2979FF; }
    .status-dot.en_tienda { background: #FF9100; }

    /* Golden Delivery Star Pin (Estrellita para compañeros) */
    .delivery-star-pin {
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform 0.2s ease;
    }
    .delivery-star-pin:hover {
      transform: scale(1.25) translateY(-3px);
    }
    .star-bubble-box {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #FFF9C4;
      border: 2px solid #FBC02D;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      box-shadow: 0 4px 10px rgba(251, 192, 45, 0.45);
    }
    .star-tag-label {
      background: rgba(26, 29, 32, 0.9);
      color: #FFD54F;
      font-size: 9px;
      font-weight: 800;
      padding: 2px 6px;
      border-radius: 8px;
      margin-top: 2px;
      white-space: nowrap;
      border: 1px solid #FBC02D;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    }

    /* Customer Pin */
    .customer-marker-pin {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .customer-bubble {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      background: #1A1D20;
      border: 3px solid #FFFFFF;
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 18px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .customer-tag {
      background: #1A1D20;
      color: white;
      font-size: 11px;
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 10px;
      margin-top: 3px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    }

    /* Demand Heat Zone */
    .leaflet-interactive.demand-zone {
      animation: pulse-zone 3s infinite alternate ease-in-out;
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

    const driverLat = ${driverLocation.latitude};
    const driverLng = ${driverLocation.longitude};
    const stores = ${storesJson};
    const coworkers = ${coworkersJson};
    const stars = ${starsJson};
    const activeOrder = ${activeOrderJson};
    const showDemandZones = ${showDemandZones};

    const map = L.map('map', {
      zoomControl: false,
      attributionControl: false
    }).setView([driverLat, driverLng], 15);

    // OpenStreetMap 100% público, libre de API Keys
    const baseTile = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    });

    baseTile.on('tileerror', function(error) {
      if (error && error.tile) {
        // Fallback inmediato a servidor alternativo sin requerir API key
        error.tile.src = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/' + error.coords.z + '/' + error.coords.y + '/' + error.coords.x;
      }
    });

    baseTile.addTo(map);

    if (showDemandZones) {
      const demandCircle = L.circle([4.6760, -74.0540], {
        color: '#FF441F',
        fillColor: '#FF441F',
        fillOpacity: 0.12,
        weight: 2,
        dashArray: '6, 6',
        radius: 650,
        className: 'demand-zone'
      }).addTo(map);

      demandCircle.bindTooltip('<b style="color:#FF441F">⚡ Zona Alta Demanda</b><br>Multiplicador x1.3', {
        direction: 'top'
      });
    }

    // Driver Marker
    const driverIcon = L.divIcon({
      className: 'driver-div-icon',
      html: \`
        <div class="driver-outer-pulse">
          <div class="driver-pulse-ring"></div>
          <div class="driver-core-badge">🛵</div>
        </div>
      \`,
      iconSize: [50, 50],
      iconAnchor: [25, 25]
    });
    L.marker([driverLat, driverLng], { icon: driverIcon, zIndexOffset: 1000 }).addTo(map);

    // Stores
    stores.forEach(store => {
      const isDiamond = store.partnerTier === 'diamond';
      const storeHtml = \`
        <div class="store-marker-pin">
          <div class="store-icon-bubble" style="border-color: \${store.bannerColor};">
            <span>\${store.logo}</span>
            \${isDiamond ? '<span class="partner-diamond-badge">DIAMOND</span>' : ''}
          </div>
          <div class="store-name-tag">
            \${store.name.split('-')[0].trim()}
            <span class="store-orders-count">(\${store.activeOrdersWaiting || 2} 📦)</span>
          </div>
        </div>
      \`;
      const icon = L.divIcon({ className: 'st-icon', html: storeHtml, iconSize: [80, 60], iconAnchor: [40, 30] });
      const m = L.marker([store.coordinates.latitude, store.coordinates.longitude], { icon, zIndexOffset: 500 }).addTo(map);
      m.on('click', () => sendToHost({ type: 'SELECT_STORE', id: store.id }));
    });

    // Coworkers
    coworkers.forEach(cw => {
      const vehicleEmoji = cw.vehicle === 'moto' ? '🏍️' : cw.vehicle === 'bici' ? '🚲' : '🚗';
      const coworkerHtml = \`
        <div class="coworker-marker-pin">
          <div class="coworker-bubble \${cw.status}">
            <span>\${vehicleEmoji}</span>
          </div>
          <div class="coworker-label">
            <span class="status-dot \${cw.status}"></span>
            <span>\${cw.nickname}</span>
          </div>
        </div>
      \`;
      const icon = L.divIcon({ className: 'cw-icon', html: coworkerHtml, iconSize: [60, 50], iconAnchor: [30, 25] });
      const m = L.marker([cw.coordinates.latitude, cw.coordinates.longitude], { icon, zIndexOffset: 300 }).addTo(map);
      m.on('click', () => sendToHost({ type: 'SELECT_COWORKER', id: cw.id }));
    });

    // Delivery Stars Pins (⭐ Marcadas por domiciliarios para guiar a compañeros)
    stars.forEach(st => {
      const starHtml = \`
        <div class="delivery-star-pin">
          <div class="star-bubble-box">⭐</div>
          <div class="star-tag-label">\${st.address.split('(')[0].trim()}</div>
        </div>
      \`;
      const icon = L.divIcon({ className: 'star-icon', html: starHtml, iconSize: [70, 45], iconAnchor: [35, 22] });
      const m = L.marker([st.coordinates.latitude, st.coordinates.longitude], { icon, zIndexOffset: 400 }).addTo(map);
      
      m.bindTooltip(\`
        <div style="font-family:sans-serif; max-width:220px; font-size:12px;">
          <b style="color:#F57F17;">⭐ Tip de Entrega Verificado</b><br>
          <b>\${st.address}</b><br>
          <p style="margin:4px 0; color:#333;">\${st.notes}</p>
          <small style="color:#777;">Dejado por: \${st.createdBy}</small>
        </div>
      \`, { direction: 'top' });

      m.on('click', () => sendToHost({ type: 'SELECT_STAR', id: st.id, notes: st.notes, address: st.address }));
    });

    // Active order routing
    if (activeOrder && activeOrder.store && activeOrder.customerCoordinates) {
      const storePos = [activeOrder.store.coordinates.latitude, activeOrder.store.coordinates.longitude];
      const customerPos = [activeOrder.customerCoordinates.latitude, activeOrder.customerCoordinates.longitude];
      const driverPos = [driverLat, driverLng];

      if (activeOrder.status === 'rumbo_tienda') {
        L.polyline([driverPos, storePos], { color: '#FF441F', weight: 5, opacity: 0.85, dashArray: '10, 8' }).addTo(map);
        map.fitBounds([driverPos, storePos], { padding: [60, 60] });
      } else if (activeOrder.status === 'en_tienda' || activeOrder.status === 'rumbo_cliente') {
        L.polyline([storePos, customerPos], { color: '#00C853', weight: 5, opacity: 0.85 }).addTo(map);
        const custIcon = L.divIcon({
          className: 'cust-icon',
          html: \`<div class="customer-marker-pin"><div class="customer-bubble">📍</div><div class="customer-tag">\${activeOrder.customerName}</div></div>\`,
          iconSize: [80, 60],
          iconAnchor: [40, 30]
        });
        L.marker(customerPos, { icon: custIcon, zIndexOffset: 900 }).addTo(map);
        map.fitBounds([storePos, customerPos], { padding: [60, 60] });
      }
    }

    window.centerOnLocation = function(lat, lng) {
      map.flyTo([lat, lng], 16, { animate: true, duration: 1.2 });
    };

    sendToHost({ type: 'MAP_READY' });
  </script>
</body>
</html>
  `;
}
