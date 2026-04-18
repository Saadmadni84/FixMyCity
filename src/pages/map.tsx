import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Filter, RefreshCw, Zap, Building2, Trees, Droplets, Trash2, Droplet, HelpCircle, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { apiFetch } from '@/lib/api-client';

// Leaflet CSS
import 'leaflet/dist/leaflet.css';

interface Issue {
  id: number;
  ticketId: string;
  title: string;
  category: string;
  status: string;
  department: string;
  address: string;
  ward: string;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  submitted:    '#6366f1',
  under_review: '#f59e0b',
  assigned:     '#3b82f6',
  in_progress:  '#8b5cf6',
  fixed:        '#22c55e',
  resolved:     '#22c55e',
  rejected:     '#ef4444',
};

const STATUS_LABELS: Record<string, string> = {
  submitted:    'Submitted',
  under_review: 'Under Review',
  assigned:     'Assigned',
  in_progress:  'In Progress',
  fixed:        'Fixed',
  resolved:     'Resolved',
  rejected:     'Rejected',
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  streetlight:  Zap,
  damaged_wall: Building2,
  park:         Trees,
  drainage:     Droplets,
  road:         Building2,
  garbage:      Trash2,
  water_supply: Droplet,
  other:        HelpCircle,
};

const CATEGORY_LABELS: Record<string, string> = {
  streetlight:  'Streetlight',
  damaged_wall: 'Damaged Wall',
  park:         'Park / Garden',
  drainage:     'Drainage',
  road:         'Road / Pothole',
  garbage:      'Garbage',
  water_supply: 'Water Supply',
  other:        'Other',
};

function StatusBadge({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    submitted:    'bg-indigo-100 text-indigo-700',
    under_review: 'bg-amber-100 text-amber-700',
    assigned:     'bg-blue-100 text-blue-700',
    in_progress:  'bg-purple-100 text-purple-700',
    fixed:        'bg-green-100 text-green-700',
    resolved:     'bg-green-100 text-green-700',
    rejected:     'bg-red-100 text-red-700',
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${colorMap[status] || 'bg-muted text-muted-foreground'}`}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<import('leaflet').Marker[]>([]);

  const [issues, setIssues] = useState<Issue[]>([]);
  const [filtered, setFiltered] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Issue | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');
  const [mapReady, setMapReady] = useState(false);

  // Fetch issues
  const fetchIssues = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/api/issues');
      const data = await res.json();
      setIssues(data.issues || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIssues(); }, []);

  // Apply filters
  useEffect(() => {
    let result = issues;
    if (filterStatus !== 'all') result = result.filter(i => i.status === filterStatus);
    if (filterCategory !== 'all') result = result.filter(i => i.category === filterCategory);
    setFiltered(result);
  }, [issues, filterStatus, filterCategory]);

  // Init Leaflet map
  useEffect(() => {
    if (!mapRef.current || leafletMapRef.current) return;

    import('leaflet').then((L) => {
      // Fix default marker icon paths broken by bundlers
      delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapRef.current!, {
        center: [28.6139, 77.2090],
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
      setMapReady(true);
    });

    return () => {
      leafletMapRef.current?.remove();
      leafletMapRef.current = null;
    };
  }, []);

  // Update markers when filtered issues or map changes
  useEffect(() => {
    if (!mapReady || !leafletMapRef.current) return;

    import('leaflet').then((L) => {
      const map = leafletMapRef.current!;

      // Clear old markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      const mappable = filtered.filter(i => i.latitude != null && i.longitude != null);

      mappable.forEach((issue) => {
        const color = STATUS_COLORS[issue.status] || '#6366f1';

        // Custom SVG pin marker
        const svgIcon = L.divIcon({
          className: '',
          html: `
            <div style="position:relative;width:32px;height:40px;">
              <svg viewBox="0 0 32 40" width="32" height="40" xmlns="http://www.w3.org/2000/svg">
                <path d="M16 0C7.163 0 0 7.163 0 16c0 10 16 24 16 24s16-14 16-24C32 7.163 24.837 0 16 0z"
                  fill="${color}" stroke="white" stroke-width="2"/>
                <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
              </svg>
            </div>`,
          iconSize: [32, 40],
          iconAnchor: [16, 40],
          popupAnchor: [0, -42],
        });

        const marker = L.marker([issue.latitude!, issue.longitude!], { icon: svgIcon })
          .addTo(map)
          .bindPopup(`
            <div style="min-width:200px;font-family:system-ui,sans-serif;">
              <div style="font-weight:600;font-size:13px;margin-bottom:4px;">${issue.title}</div>
              <div style="font-size:11px;color:#666;margin-bottom:6px;">${issue.address}</div>
              <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                <span style="background:${color};color:white;font-size:10px;padding:2px 8px;border-radius:999px;">
                  ${STATUS_LABELS[issue.status] || issue.status}
                </span>
                <span style="font-size:10px;color:#888;">${CATEGORY_LABELS[issue.category] || issue.category}</span>
              </div>
              <div style="margin-top:8px;">
                <a href="/track?id=${issue.ticketId}" style="font-size:11px;color:#6366f1;font-weight:500;">
                  View ${issue.ticketId} →
                </a>
              </div>
            </div>
          `);

        marker.on('click', () => setSelected(issue));
        markersRef.current.push(marker);
      });

      // Fit bounds if we have markers
      if (mappable.length > 0) {
        const bounds = L.latLngBounds(mappable.map(i => [i.latitude!, i.longitude!]));
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      }
    });
  }, [filtered, mapReady]);

  const mappableCount = filtered.filter(i => i.latitude != null && i.longitude != null).length;
  const unmappableCount = filtered.length - mappableCount;

  return (
    <>
      <title>Live Issue Map — FixMyCity</title>
      <meta name="description" content="View all reported civic issues on a live map." />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="outline">Live Map</Badge>
          </div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="w-7 h-7 text-primary" />
            Issue Map
          </h1>
          <p className="text-muted-foreground mt-1">
            Live view of all reported civic issues across the city. Click any pin for details.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44">
              <Filter className="w-3.5 h-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All Statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="assigned">Assigned</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="fixed">Fixed</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="streetlight">Streetlight</SelectItem>
              <SelectItem value="road">Road / Pothole</SelectItem>
              <SelectItem value="drainage">Drainage</SelectItem>
              <SelectItem value="garbage">Garbage</SelectItem>
              <SelectItem value="water_supply">Water Supply</SelectItem>
              <SelectItem value="park">Park / Garden</SelectItem>
              <SelectItem value="damaged_wall">Damaged Wall</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={fetchIssues} disabled={loading} className="gap-1.5">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <span className="text-sm text-muted-foreground ml-auto">
            {mappableCount} issue{mappableCount !== 1 ? 's' : ''} on map
            {unmappableCount > 0 && ` · ${unmappableCount} without location`}
          </span>
        </div>

        {/* Map + Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="relative z-0 rounded-xl overflow-hidden border border-border shadow-sm" style={{ height: '520px' }}>
              <div ref={mapRef} className="relative z-0" style={{ width: '100%', height: '100%' }} />
            </div>

            {/* Legend */}
            <div className="mt-3 flex flex-wrap gap-3">
              {Object.entries(STATUS_COLORS).map(([status, color]) => (
                <div key={status} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  {STATUS_LABELS[status]}
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar: issue list */}
          <div className="flex flex-col gap-3 overflow-y-auto" style={{ maxHeight: '560px' }}>
            {loading ? (
              <div className="flex items-center justify-center h-40 text-muted-foreground text-sm">
                <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Loading issues...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center text-muted-foreground text-sm py-12">
                No issues match the selected filters.
              </div>
            ) : (
              filtered.map((issue) => {
                const Icon = CATEGORY_ICONS[issue.category] || HelpCircle;
                const isSelected = selected?.ticketId === issue.ticketId;
                return (
                  <Card
                    key={issue.ticketId}
                    className={`cursor-pointer transition-all hover:shadow-md ${isSelected ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => {
                      setSelected(issue);
                      if (issue.latitude && issue.longitude && leafletMapRef.current) {
                        leafletMapRef.current.setView([issue.latitude, issue.longitude], 16);
                      }
                    }}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm leading-tight truncate">{issue.title}</div>
                          <div className="text-xs text-muted-foreground mt-0.5 truncate">{issue.address}</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <StatusBadge status={issue.status} />
                            {issue.latitude == null && (
                              <span className="text-xs text-muted-foreground/60">No GPS</span>
                            )}
                          </div>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="mt-2 pt-2 border-t border-border flex items-center justify-between">
                          <span className="text-xs text-muted-foreground font-mono">{issue.ticketId}</span>
                          <Link
                            to={`/track?id=${issue.ticketId}`}
                            className="text-xs text-primary font-medium flex items-center gap-1 hover:underline"
                            onClick={e => e.stopPropagation()}
                          >
                            Track <ExternalLink className="w-3 h-3" />
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>
      </div>
    </>
  );
}
