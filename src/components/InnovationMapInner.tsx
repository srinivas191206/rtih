'use client';

import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { getDb, Outpost } from '@/lib/mockDb';
import { Building2, Users, Network, TrendingUp, ShieldCheck } from 'lucide-react';

// Fixing Leaflet default marker icons in Next.js
const createIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-icon',
    html: `<div style="background-color: ${color}; width: 14px; height: 14px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 10px rgba(0,0,0,0.3); animation: pulse 2s infinite;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7]
  });
};

const HUB_COLOR = '#00A86B'; // Emerald Green
const SPOKE_COLOR = '#3A86C8'; // Professional Blue

interface CenterInfo {
  name: string;
  lat: number;
  lng: number;
  type: 'Hub' | 'Spoke';
  incubated: number;
  programs: number;
  engagement: number;
  lead: string;
}

export default function InnovationMapInner() {
  const [selectedCenter, setSelectedCenter] = useState<CenterInfo | null>(null);
  const [centers, setCenters] = useState<CenterInfo[]>([]);

  useEffect(() => {
    try {
      const db = getDb();
      const outposts = db.getOutposts();
      
      const amaravatiStartups = db.getStartups().filter(s => s.district === 'Krishna' || s.district === 'Guntur').length;

      // Coordinate mappings
      const coords: Record<string, { lat: number; lng: number }> = {
        'Amaravati': { lat: 16.5062, lng: 80.6480 },
        'Visakhapatnam': { lat: 17.6868, lng: 83.2185 },
        'Vijayawada': { lat: 16.5150, lng: 80.5200 }, // offset slightly from Amaravati
        'Rajamahendravaram': { lat: 17.0005, lng: 81.8040 },
        'Tirupati': { lat: 13.6288, lng: 79.4192 },
        'Ananthapuramu': { lat: 14.6819, lng: 77.6006 }
      };

      const items: CenterInfo[] = [
        {
          name: 'Amaravati (Central Hub)',
          lat: coords['Amaravati'].lat,
          lng: coords['Amaravati'].lng,
          type: 'Hub',
          incubated: amaravatiStartups + 45,
          programs: 88,
          engagement: 96,
          lead: 'Sri L. Premchandra Reddy, IAS'
        }
      ];

      outposts.forEach(o => {
        const coord = coords[o.name] || { lat: 16.0, lng: 80.0 };
        items.push({
          name: o.name,
          lat: coord.lat,
          lng: coord.lng,
          type: 'Spoke',
          incubated: o.incubatedCount + 10,
          programs: o.programsCount,
          engagement: o.mentorEngagement,
          lead: o.leadName
        });
      });

      setCenters(items);
      setSelectedCenter(items[0]);
    } catch (e) {
      console.error('Failed to load outpost stats', e);
    }
  }, []);

  const hub = centers.find(c => c.type === 'Hub');
  const spokes = centers.filter(c => c.type === 'Spoke');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
      {/* Map Element */}
      <div className="lg:col-span-3 h-[400px] md:h-[500px] relative z-10">
        <MapContainer
          center={[16.0, 80.2]} // centered in AP
          zoom={7}
          scrollWheelZoom={false}
          style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {centers.map(center => (
            <Marker
              key={center.name}
              position={[center.lat, center.lng]}
              icon={createIcon(center.type === 'Hub' ? HUB_COLOR : SPOKE_COLOR)}
              eventHandlers={{
                click: () => {
                  setSelectedCenter(center);
                }
              }}
            >
              <Popup>
                <div className="text-xs p-1">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{center.name}</p>
                  <p className="text-slate-500">{center.type} Center</p>
                  <p className="font-semibold text-emerald-600 mt-1">Startups: {center.incubated}</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Polyline connections linking spokes to the central hub */}
          {hub && spokes.map(spoke => (
            <Polyline
              key={`line-${spoke.name}`}
              positions={[
                [hub.lat, hub.lng],
                [spoke.lat, spoke.lng]
              ]}
              pathOptions={{
                color: SPOKE_COLOR,
                weight: 2,
                dashArray: '5, 8',
                opacity: 0.7
              }}
            />
          ))}
        </MapContainer>
      </div>

      {/* Sidebar Details Panel */}
      <div className="flex flex-col justify-between h-full bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 rounded-lg p-5">
        {selectedCenter ? (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded ${
                selectedCenter.type === 'Hub' 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
              }`}>
                {selectedCenter.type}
              </span>
              <p className="text-[10px] font-bold text-slate-400">RTIH NETWORK</p>
            </div>
            
            <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight mb-4">
              {selectedCenter.name}
            </h3>

            <div className="space-y-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded bg-white dark:bg-slate-800 text-emerald-500 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Incubated Startups</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCenter.incubated}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded bg-white dark:bg-slate-800 text-blue-500 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Network className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Regional Programs</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCenter.programs}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded bg-white dark:bg-slate-800 text-purple-500 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Ecosystem Engagement</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white">{selectedCenter.engagement}%</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-sm">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Outpost Lead</p>
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-300 leading-tight">
                    {selectedCenter.lead}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-[10px] text-slate-500 leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-500 inline mr-1" />
              Verified RTIH facility active within local AP district limits.
            </div>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-400">
            Click on a marker to view outpost details.
          </div>
        )}

        <div className="text-[9px] text-slate-400 border-t border-slate-200 dark:border-slate-700/60 pt-4 mt-6">
          RTIH utilizes the Amaravati Central Hub to orchestrate specialized programmatic resources to local outposts.
        </div>
      </div>
    </div>
  );
}
