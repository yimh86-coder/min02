import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  MapPin, 
  Building2, 
  DollarSign, 
  Layers, 
  Filter, 
  ChevronRight, 
  Info, 
  ExternalLink,
  Sparkles,
  Compass,
  Navigation,
  Globe,
  CheckCircle2,
  Share2,
  RefreshCw,
  Search
} from 'lucide-react';
import L from 'leaflet';
import { Project, ProjectCategory } from '../types';
import { formatBudget, getCategoryBadgeColor, getStatusBadge } from '../utils/formatters';

interface MapViewProps {
  projects: Project[];
  onSelectProject: (project: Project) => void;
  onOpenNewProject: () => void;
}

// Regional centers for Asan-si administrative districts GIS visualization
interface AsanDistrictNode {
  name: string;
  shortName: string;
  x: number; // 0 to 500 for SVG
  y: number;
  lat: number;
  lng: number;
  desc: string;
}

const ASAN_DISTRICT_NODES: AsanDistrictNode[] = [
  { name: '온양동', shortName: '온양원도심', x: 240, y: 270, lat: 36.7898, lng: 127.0018, desc: '온양1~6동, 시청·원도심·온천특구' },
  { name: '배방읍', shortName: '배방읍', x: 350, y: 270, lat: 36.7775, lng: 127.0528, desc: '배방신도시, KTX천안아산역 인접' },
  { name: '탕정면', shortName: '탕정면', x: 360, y: 190, lat: 36.8122, lng: 127.0545, desc: '삼성디스플레이시티, 스마트 R&D' },
  { name: '음봉면', shortName: '음봉면', x: 300, y: 160, lat: 36.8483, lng: 126.9942, desc: '아산디지털산단, 복합산업거점' },
  { name: '둔포면', shortName: '둔포면', x: 290, y: 80, lat: 36.9312, lng: 127.0378, desc: '아산테크노밸리, 경기남부 접경' },
  { name: '영인면', shortName: '영인면', x: 190, y: 120, lat: 36.8791, lng: 126.9325, desc: '영인산휴양림, 친환경 농업' },
  { name: '인주면', shortName: '인주면', x: 110, y: 130, lat: 36.8924, lng: 126.8712, desc: '인주일반산단, 서해안 관문항만' },
  { name: '선장면', shortName: '선장면', x: 100, y: 220, lat: 36.8041, lng: 126.8752, desc: '삽교호 연계 수변생태관광' },
  { name: '도고면', shortName: '도고면', x: 110, y: 310, lat: 36.7582, lng: 126.8941, desc: '도고온천 관광특구, 힐링케어' },
  { name: '신창면', shortName: '신창면', x: 170, y: 250, lat: 36.7725, lng: 126.9482, desc: '순천향대학교, 청년문화·서부권 거점' },
  { name: '염치읍', shortName: '염치읍', x: 240, y: 200, lat: 36.8202, lng: 126.9985, desc: '곡교천 은행나무길, 행정지원' },
  { name: '송악면', shortName: '송악면', x: 260, y: 380, lat: 36.7115, lng: 127.0142, desc: '외암민속마을, 광덕산 생태권역' },
];

export const MapView: React.FC<MapViewProps> = ({
  projects,
  onSelectProject,
  onOpenNewProject,
}) => {
  const [mapType, setMapType] = useState<'interactive' | 'google_embed' | 'svg_schematic'>('interactive');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [hoveredProject, setHoveredProject] = useState<Project | null>(null);

  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // Filter projects on the map
  const visibleProjects = useMemo(() => {
    return projects.filter((p) => {
      if (selectedDistrict !== 'all') {
        const matches = p.district?.includes(selectedDistrict) || 
          (selectedDistrict === '온양동' && p.district?.startsWith('온양')) ||
          p.location.address?.includes(selectedDistrict);
        if (!matches) return false;
      }
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      return true;
    });
  }, [projects, selectedDistrict, selectedCategory]);

  // Aggregate stats per district
  const districtAggregates = useMemo(() => {
    const map: Record<string, { count: number; totalBudget: number; projects: Project[] }> = {};
    ASAN_DISTRICT_NODES.forEach((node) => {
      const matched = projects.filter((p) => 
        p.district?.includes(node.name) || 
        (node.name === '온양동' && p.district?.startsWith('온양')) ||
        p.location.address?.includes(node.name)
      );
      map[node.name] = {
        count: matched.length,
        totalBudget: matched.reduce((sum, p) => sum + p.budget.total, 0),
        projects: matched,
      };
    });
    return map;
  }, [projects]);

  // SVG coordinate transformation
  const getSvgCoordinates = (lat: number, lng: number) => {
    const minLat = 36.65;
    const maxLat = 37.02;
    const minLng = 126.85;
    const maxLng = 127.15;

    const x = ((lng - minLng) / (maxLng - minLng)) * 380 + 60;
    const y = ((maxLat - lat) / (maxLat - minLat)) * 380 + 60;

    return { x: Math.max(40, Math.min(460, x)), y: Math.max(40, Math.min(460, y)) };
  };

  // Initialize and update Leaflet interactive map
  useEffect(() => {
    if (mapType !== 'interactive' || !mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const initialLat = 36.7898;
      const initialLng = 127.0018; // Asan City Hall

      const map = L.map(mapContainerRef.current, {
        center: [initialLat, initialLng],
        zoom: 12,
        zoomControl: true,
        scrollWheelZoom: true,
      });

      // OpenStreetMap Free Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | 아산시 행정망',
        maxZoom: 19,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add markers for visible projects
    const bounds = L.latLngBounds([]);

    visibleProjects.forEach((p) => {
      const lat = p.location.lat;
      const lng = p.location.lng;

      bounds.extend([lat, lng]);

      // Category color mapping
      const colorMap: Record<string, string> = {
        '복지·보건': '#10b981',
        '스마트·디지털': '#2563eb',
        '교통·도시': '#f59e0b',
        '환경·에너지': '#059669',
        '문화·관광': '#8b5cf6',
        '경제·일자리': '#ea580c',
        '안전·재난': '#dc2626',
      };
      const markerColor = colorMap[p.category] || '#2563eb';

      // Custom DivIcon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="position: relative; display: flex; align-items: center; justify-content: center;">
            <div style="width: 28px; height: 28px; border-radius: 50%; background-color: ${markerColor}; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-size: 11px; font-weight: bold;">
              ${p.status === 'completed' ? '✓' : '●'}
            </div>
            <div style="position: absolute; bottom: -4px; width: 0; height: 0; border-left: 5px solid transparent; border-right: 5px solid transparent; border-top: 6px solid ${markerColor};"></div>
          </div>
        `,
        iconSize: [28, 34],
        iconAnchor: [14, 34],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([lat, lng], { icon: customIcon }).addTo(map);

      // Popup content with Google Maps free link & AI summary
      const popupHtml = `
        <div style="font-family: Pretendard, sans-serif; padding: 4px; min-width: 220px; max-width: 280px;">
          <div style="display: flex; align-items: center; justify-content: space-between; gap: 4px; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: bold; padding: 2px 6px; border-radius: 4px; background-color: #eff6ff; color: #1e40af;">${p.category}</span>
            <span style="font-size: 10px; color: #64748b;">${p.region} ${p.district}</span>
          </div>
          <h4 style="font-size: 12px; font-weight: 800; color: #0f172a; margin: 4px 0 6px 0; line-height: 1.4;">${p.title}</h4>
          <p style="font-size: 11px; color: #475569; margin: 0 0 6px 0; line-height: 1.4;"><strong>소재지:</strong> ${p.location.address}</p>
          <div style="display: flex; justify-content: space-between; align-items: center; font-size: 11px; margin-bottom: 8px; border-top: 1px solid #f1f5f9; padding-top: 4px;">
            <span style="font-weight: 800; color: #1e3a8a;">예산: ${formatBudget(p.budget.total)}</span>
            <span style="color: #059669; font-weight: 600;">진척률 ${p.progressPercent}%</span>
          </div>
          <div style="display: flex; flex-direction: column; gap: 4px;">
            <a 
              href="https://www.google.com/maps/search/?api=1&query=${lat},${lng}" 
              target="_blank" 
              rel="noreferrer" 
              style="display: flex; align-items: center; justify-content: center; gap: 4px; padding: 5px 8px; background-color: #2563eb; color: white; border-radius: 6px; font-size: 11px; font-weight: 700; text-decoration: none;"
            >
              <span>Google 지도(무료)에서 위치/길찾기</span>
            </a>
            <button 
              id="view-detail-btn-${p.id}" 
              style="padding: 4px 8px; background-color: #f8fafc; border: 1px solid #cbd5e1; border-radius: 6px; font-size: 11px; font-weight: 600; color: #334155; cursor: pointer;"
            >
              사업 상세정보 열기
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on('click', () => {
        setActiveProject(p);
        setTimeout(() => {
          const detailBtn = document.getElementById(`view-detail-btn-${p.id}`);
          if (detailBtn) {
            detailBtn.onclick = () => onSelectProject(p);
          }
        }, 50);
      });

      markersRef.current.push(marker);
    });

    if (visibleProjects.length > 0 && bounds.isValid()) {
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }

    // Leaflet needs resize invalidate
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [mapType, visibleProjects, onSelectProject]);

  // Focus on a project when clicked from sidebar
  const handleSelectFromList = (p: Project) => {
    setActiveProject(p);
    if (mapType === 'interactive' && mapInstanceRef.current) {
      mapInstanceRef.current.setView([p.location.lat, p.location.lng], 15, { animate: true });
      // Find matching marker and open popup
      const idx = visibleProjects.findIndex((item) => item.id === p.id);
      if (idx !== -1 && markersRef.current[idx]) {
        markersRef.current[idx].openPopup();
      }
    }
  };

  const centerOnAsanCityHall = () => {
    if (mapType === 'interactive' && mapInstanceRef.current) {
      mapInstanceRef.current.setView([36.7898, 127.0018], 13, { animate: true });
    }
  };

  return (
    <div className="space-y-5" id="map-view">
      {/* Top Header Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <Compass className="w-5 h-5 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">
              아산시 사업위치 지도 및 공간정보 (무료 지도 연동)
            </h2>
            <span className="text-[11px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 mr-0.5" />
              <span>무료 지도 100% 지원</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            OpenStreetMap 및 Google 지도 무료 연동을 통해 아산시 관내 모든 사업의 위치와 길찾기를 비용 없이 바로 확인하실 수 있습니다.
          </p>
        </div>

        {/* Action Controls & External Map Links */}
        <div className="flex flex-wrap items-center gap-2">
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent('충청남도 아산시청')}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors"
            title="Google 지도에서 전체 아산시 열기"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Google 지도에서 아산시 열기</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>

          <button
            onClick={centerOnAsanCityHall}
            className="flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition-colors"
          >
            <RefreshCw className="w-3 h-3 text-slate-500" />
            <span>시청 중심 재정렬</span>
          </button>
        </div>
      </div>

      {/* Filter & View Mode Bar */}
      <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* District & Category Filters */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">관내 권역:</span>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none"
            >
              <option value="all">아산시 전역 (전체)</option>
              {ASAN_DISTRICT_NODES.map((r) => (
                <option key={r.name} value={r.name}>{r.name}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-1.5 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-2xs">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-500">분야:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-transparent font-semibold text-slate-800 focus:outline-none"
            >
              <option value="all">전체 분야</option>
              <option value="복지·보건">복지·보건</option>
              <option value="스마트·디지털">스마트·디지털</option>
              <option value="교통·도시">교통·도시</option>
              <option value="환경·에너지">환경·에너지</option>
              <option value="문화·관광">문화·관광</option>
              <option value="경제·일자리">경제·일자리</option>
              <option value="안전·재난">안전·재난</option>
            </select>
          </div>

          {(selectedDistrict !== 'all' || selectedCategory !== 'all') && (
            <button
              onClick={() => {
                setSelectedDistrict('all');
                setSelectedCategory('all');
              }}
              className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold"
            >
              필터 초기화
            </button>
          )}
        </div>

        {/* Map Type Switcher */}
        <div className="flex items-center bg-white p-1 rounded-lg border border-slate-200 shadow-2xs">
          <button
            onClick={() => setMapType('interactive')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              mapType === 'interactive'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>실시간 인터랙티브 지도 (무료)</span>
          </button>

          <button
            onClick={() => setMapType('google_embed')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              mapType === 'google_embed'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>Google 지도 무료 뷰</span>
          </button>

          <button
            onClick={() => setMapType('svg_schematic')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center space-x-1.5 ${
              mapType === 'svg_schematic'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>읍·면·동 행정망도</span>
          </button>
        </div>
      </div>

      {/* Main Grid Layout: Map View (7 cols) + District Project List (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Map Container (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col">
          {/* Header Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 mb-3 px-1">
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse"></span>
              <span className="font-semibold text-slate-800">
                아산시 관내 표시 사업: <strong className="text-blue-600">{visibleProjects.length}개소</strong>
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              마커 클릭 시 AI 요약 및 Google 지도 바로가기 제공
            </span>
          </div>

          {/* VIEW 1: Interactive OpenStreetMap / Leaflet (Default, 100% Free) */}
          {mapType === 'interactive' && (
            <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <div ref={mapContainerRef} className="w-full h-full z-0" />
              
              {/* Bottom Quick Overlay */}
              <div className="absolute bottom-3 left-3 z-[400] bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 shadow-md flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>OpenStreetMap & Google Maps 무료 연계 모드</span>
              </div>
            </div>
          )}

          {/* VIEW 2: Free Google Maps Embed View (100% Free without API Keys) */}
          {mapType === 'google_embed' && (
            <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100 flex flex-col">
              <div className="bg-slate-900 text-white text-xs px-3 py-2 flex items-center justify-between">
                <span className="flex items-center space-x-1.5">
                  <Navigation className="w-3.5 h-3.5 text-blue-400" />
                  <span>Google 지도 무료 임베드 프리뷰 ({activeProject ? activeProject.title : '아산시청 일원'})</span>
                </span>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${
                    activeProject 
                      ? `${activeProject.location.lat},${activeProject.location.lng}` 
                      : '충청남도 아산시청'
                  }`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] text-amber-300 hover:text-amber-200 flex items-center space-x-1 font-semibold"
                >
                  <span>Google 지도 큰 창에서 열기</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <iframe
                title="Google Maps Free Embed"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={`https://maps.google.com/maps?q=${
                  activeProject 
                    ? `${activeProject.location.lat},${activeProject.location.lng}` 
                    : '충청남도 아산시청 온천동'
                }&hl=ko&z=15&output=embed`}
              />
            </div>
          )}

          {/* VIEW 3: Asan-si SVG Schematic District View */}
          {mapType === 'svg_schematic' && (
            <div className="relative w-full h-[520px] rounded-xl overflow-hidden border border-slate-200 bg-slate-50 flex items-center justify-center p-3 select-none">
              <svg viewBox="0 0 500 500" className="w-full h-full max-w-[480px]">
                {/* Decorative Boundary */}
                <path
                  d="M 280 60 Q 340 90, 390 160 Q 420 250, 380 330 Q 320 420, 240 450 Q 160 430, 90 340 Q 60 250, 90 160 Q 140 80, 280 60 Z"
                  fill="#e2e8f0"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  strokeDasharray="4 2"
                  className="opacity-40"
                />
                {/* Gokgyocheon Waterway */}
                <path
                  d="M 80 180 Q 200 230, 370 230"
                  fill="none"
                  stroke="#93c5fd"
                  strokeWidth="4"
                  className="opacity-40"
                />
                <text x="140" y="210" fontSize="9" fill="#60a5fa" className="opacity-80">곡교천 수계</text>

                {/* District Nodes */}
                {ASAN_DISTRICT_NODES.map((node) => {
                  const isSelected = selectedDistrict === node.name;
                  const agg = districtAggregates[node.name];
                  const count = agg ? agg.count : 0;

                  return (
                    <g
                      key={node.name}
                      className="cursor-pointer transition-all"
                      onClick={() => setSelectedDistrict(isSelected ? 'all' : node.name)}
                    >
                      <circle
                        cx={node.x}
                        cy={node.y}
                        r={count > 0 ? 25 : 18}
                        fill={isSelected ? '#2563eb' : count > 0 ? '#3b82f6' : '#94a3b8'}
                        fillOpacity={isSelected ? 0.35 : count > 0 ? 0.18 : 0.08}
                        stroke={isSelected ? '#2563eb' : count > 0 ? '#60a5fa' : '#cbd5e1'}
                        strokeWidth={isSelected ? 2.5 : 1.2}
                      />
                      <text
                        x={node.x}
                        y={node.y - (count > 0 ? 7 : 0)}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="11"
                        fontWeight="bold"
                        fill={isSelected ? '#1d4ed8' : '#334155'}
                      >
                        {node.shortName}
                      </text>
                      {count > 0 && (
                        <text
                          x={node.x}
                          y={node.y + 8}
                          textAnchor="middle"
                          dominantBaseline="middle"
                          fontSize="10"
                          fontWeight="bold"
                          fill={isSelected ? '#1e40af' : '#2563eb'}
                        >
                          {count}건
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Project Pins */}
                {visibleProjects.map((p) => {
                  const { x, y } = getSvgCoordinates(p.location.lat, p.location.lng);
                  const isActive = activeProject?.id === p.id;
                  const isHovered = hoveredProject?.id === p.id;

                  return (
                    <g
                      key={p.id}
                      className="cursor-pointer"
                      onClick={() => handleSelectFromList(p)}
                      onMouseEnter={() => setHoveredProject(p)}
                      onMouseLeave={() => setHoveredProject(null)}
                    >
                      <circle
                        cx={x}
                        cy={y}
                        r={isActive || isHovered ? 14 : 7}
                        fill="#ef4444"
                        fillOpacity={isActive || isHovered ? 0.4 : 0.2}
                        className="animate-pulse"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={isActive || isHovered ? 6 : 4.5}
                        fill={p.status === 'completed' ? '#10b981' : '#ef4444'}
                        stroke="#ffffff"
                        strokeWidth="2"
                      />
                    </g>
                  );
                })}
              </svg>
            </div>
          )}

          {/* Active Project Highlight Banner */}
          {activeProject && (
            <div className="mt-3 p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
              <div className="min-w-0">
                <div className="flex items-center space-x-2 text-xs">
                  <span className="font-bold text-blue-900">{activeProject.title}</span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded font-semibold">
                    {activeProject.category}
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 truncate mt-0.5">
                  {activeProject.location.address} · 예산 {formatBudget(activeProject.budget.total)}
                </p>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${activeProject.location.lat},${activeProject.location.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                >
                  <Navigation className="w-3 h-3" />
                  <span>길찾기</span>
                </a>
                <button
                  onClick={() => onSelectProject(activeProject)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 rounded-lg text-xs font-semibold"
                >
                  상세보기
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: District & Project List (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {selectedDistrict === 'all' ? '아산시 전역' : `${selectedDistrict}`} 사업 위치 목록
                </h3>
                <p className="text-xs text-slate-500">
                  총 {visibleProjects.length}건 사업 표시 중 (총 예산:{' '}
                  {formatBudget(visibleProjects.reduce((acc, p) => acc + p.budget.total, 0))})
                </p>
              </div>

              {selectedDistrict !== 'all' && (
                <button
                  onClick={() => setSelectedDistrict('all')}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800"
                >
                  전체 보기
                </button>
              )}
            </div>

            {/* Project List */}
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {visibleProjects.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  해당 권역에 등록된 사업이 없습니다.
                </div>
              ) : (
                visibleProjects.map((p) => {
                  const statusInfo = getStatusBadge(p.status);
                  const isSelected = activeProject?.id === p.id;

                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectFromList(p)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50/60 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5">
                          <span className={`px-2 py-0.5 text-[10px] font-semibold rounded border ${getCategoryBadgeColor(p.category)}`}>
                            {p.category}
                          </span>
                          <span className={`px-1.5 py-0.2 text-[10px] font-medium rounded border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}>
                            {statusInfo.label}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">
                          {p.region} {p.district}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1 hover:text-blue-600">
                        {p.title}
                      </h4>

                      <div className="flex items-center text-[11px] text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-rose-500 mr-1 shrink-0" />
                        <span className="truncate">{p.location.address}</span>
                      </div>

                      {/* AI 3-line summary chip */}
                      {p.aiSummaryLines && p.aiSummaryLines.length > 0 && (
                        <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600 line-clamp-2">
                          <span className="text-indigo-600 font-bold mr-1">AI요약:</span>
                          {p.aiSummaryLines[0]}
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100">
                        <span className="font-extrabold text-slate-900">
                          {formatBudget(p.budget.total)}
                        </span>

                        <div className="flex items-center space-x-2">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${p.location.lat},${p.location.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-0.5 px-2 py-1 bg-blue-50 rounded hover:bg-blue-100"
                            title="Google 지도에서 위치 보기"
                          >
                            <Navigation className="w-3 h-3 mr-0.5" />
                            <span>Google 지도</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectProject(p);
                            }}
                            className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700"
                            title="상세 모달 열기"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="pt-2">
              <button
                onClick={onOpenNewProject}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
              >
                + 이 지역에 신규 사업 공간 등록
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
