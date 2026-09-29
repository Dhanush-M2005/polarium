"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Globe from "globe.gl";
import { MapPin, Radio, Compass, Layers, Globe as GlobeIcon, ExternalLink } from "lucide-react";
import { StationData, fetchStationDataHybrid } from "@/lib/data/station-service";
import { StationSlideOver } from "./StationSlideOver";
import { useLanguage } from "@/context/LanguageContext";

type RegionMode = "Global" | "Antarctica" | "Arctic" | "Himalaya";

export default function GlobeInner() {
  const { language, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const globeInstanceRef = useRef<any>(null);

  const [stations, setStations] = useState<StationData[]>([]);
  const [activeRegion, setActiveRegion] = useState<RegionMode>("Global");
  const [selectedStation, setSelectedStation] = useState<StationData | null>(null);
  const [isReady, setIsReady] = useState(false);

  const regionConfigs: Record<RegionMode, { label: string; lat: number; lng: number; altitude: number }> = {
    Global: {
      label: t("Global Polar Network", "वैश्विक ध्रुवीय नेटवर्क"),
      lat: 20,
      lng: 70,
      altitude: 2.5,
    },
    Antarctica: {
      label: t("Antarctica", "अंटार्कटिका"),
      lat: -78,
      lng: 45,
      altitude: 1.45,
    },
    Arctic: {
      label: t("Arctic", "आर्कटिक"),
      lat: 78.9,
      lng: 15,
      altitude: 1.4,
    },
    Himalaya: {
      label: t("Himalayan Region", "हिमालयी क्षेत्र"),
      lat: 32.4,
      lng: 77.6,
      altitude: 1.25,
    },
  };

  // 1. Fetch Station Data with Fault-Tolerant Hybrid Strategy
  useEffect(() => {
    let isMounted = true;
    fetchStationDataHybrid().then((data) => {
      if (isMounted) {
        setStations(data);
      }
    });
    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Fly to specific region coordinates
  const flyToRegion = useCallback((region: RegionMode) => {
    setActiveRegion(region);
    const config = regionConfigs[region];
    if (globeInstanceRef.current) {
      globeInstanceRef.current.pointOfView(
        { lat: config.lat, lng: config.lng, altitude: config.altitude },
        1200
      );
    }
  }, [regionConfigs]);

  // 3. Fly to specific station when clicked
  const handleStationClick = useCallback((station: StationData) => {
    setSelectedStation(station);
    if (globeInstanceRef.current) {
      globeInstanceRef.current.pointOfView(
        { lat: station.latitude, lng: station.longitude, altitude: 1.2 },
        1000
      );
    }
  }, []);

  // 4. Initialize Globe.gl WebGL Canvas
  useEffect(() => {
    if (!containerRef.current) return;

    // Destroy existing instance if any
    if (globeInstanceRef.current) {
      containerRef.current.innerHTML = "";
    }

    const width = containerRef.current.clientWidth || 900;
    const height = containerRef.current.clientHeight || 480;

    // Instantiate Globe
    const globe = (new (Globe as any)(containerRef.current))
      .width(width)
      .height(height)
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
      .showAtmosphere(true)
      .atmosphereColor("#7dd3fc")
      .atmosphereAltitude(0.2)
      .htmlLat("latitude")
      .htmlLng("longitude")
      .htmlElementsData(stations)
      .htmlElement((d: any) => {
        const station = d as StationData;
        const el = document.createElement("div");
        el.className = "station-marker-wrapper relative cursor-pointer select-none";
        el.style.pointerEvents = "auto";

        // Light-Themed Government Tooltip + Pulsing Marker
        el.innerHTML = `
          <div class="relative group" style="transform: translate(-50%, -50%);">
            <!-- Pulsing Radar Ring -->
            <div class="relative flex items-center justify-center">
              <span class="animate-ping absolute inline-flex h-5 w-5 rounded-full bg-amber-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-brand-orange border-2 border-white shadow-lg"></span>
            </div>

            <!-- Stationary Clean Station Tag -->
            <div class="absolute left-4 top-1/2 -translate-y-1/2 bg-brand-dark/90 text-white border border-[#315875] text-[10px] font-bold px-2 py-0.5 rounded-sm shadow-md whitespace-nowrap pointer-events-none hidden sm:block">
              ${station.name}
            </div>

            <!-- Light-Themed Government UI Hover Tooltip -->
            <div class="station-tooltip pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 bg-white text-brand-dark border border-slate-300 shadow-xl rounded-sm p-3 min-w-[210px] whitespace-nowrap font-sans">
              <div class="flex items-center justify-between gap-3 border-b border-slate-200 pb-1.5 mb-1.5">
                <span class="font-bold text-xs text-brand-dark tracking-tight">${station.name}</span>
                <span class="text-[9px] font-bold font-mono uppercase px-1.5 py-0.5 rounded-sm bg-emerald-100 text-emerald-800">
                  ${language === 'hi' && station.status === 'Active' ? 'सक्रिय' : station.status}
                </span>
              </div>
              
              <div class="space-y-1 text-[11px]">
                <div class="flex items-center justify-between text-slate-600">
                  <span>${t('Region:', 'क्षेत्र:')}</span>
                  <strong class="text-slate-800 font-semibold">${station.region}</strong>
                </div>
                <div class="flex items-center justify-between text-slate-600">
                  <span>${t('Expeditions:', 'अभियान:')}</span>
                  <strong class="text-brand-navylight font-bold">${station.totalExpeditions} ${t('Expeditions', 'अभियान')}</strong>
                </div>
                <div class="flex items-center justify-between text-slate-500 font-mono text-[10px] pt-1 border-t border-slate-100">
                  <span>${station.latitude > 0 ? `${station.latitude}°N` : `${Math.abs(station.latitude)}°S`}</span>
                  <span>${station.longitude > 0 ? `${station.longitude}°E` : `${Math.abs(station.longitude)}°W`}</span>
                </div>
              </div>

              <div class="mt-2 pt-1 border-t border-slate-100 text-[10px] font-bold text-brand-navylight flex items-center justify-center gap-1">
                ${t('Click to open Station View →', 'स्टेशन विवरण हेतु क्लिक करें →')}
              </div>
            </div>
          </div>
        `;

        el.onclick = (e) => {
          e.stopPropagation();
          handleStationClick(station);
        };

        return el;
      });

    // Camera initial position: Centered on India & Global polar network
    const initialConfig = regionConfigs[activeRegion];
    globe.pointOfView(
      { lat: initialConfig.lat, lng: initialConfig.lng, altitude: initialConfig.altitude },
      1000
    );

    // Controls
    const controls = globe.controls();
    if (controls) {
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = true;
      controls.minDistance = 150;
      controls.maxDistance = 500;
    }

    // Dismiss slide over on background globe click
    globe.onGlobeClick(() => {
      // Don't deselect automatically if user wants to examine station
    });

    globeInstanceRef.current = globe;
    setIsReady(true);

    // Responsive container resize observer
    const handleResize = () => {
      if (containerRef.current && globeInstanceRef.current) {
        const newW = containerRef.current.clientWidth;
        const newH = containerRef.current.clientHeight;
        if (newW && newH) {
          globeInstanceRef.current.width(newW).height(newH);
        }
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (globeInstanceRef.current) {
        if (typeof globeInstanceRef.current.pauseAnimation === 'function') {
          globeInstanceRef.current.pauseAnimation();
        }
        if (typeof globeInstanceRef.current._destructor === 'function') {
          globeInstanceRef.current._destructor();
        }
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
      globeInstanceRef.current = null;
    };
  }, [handleStationClick, regionConfigs]);

  // Reactive update for station HTML markers without re-creating WebGL canvas
  useEffect(() => {
    if (globeInstanceRef.current && stations.length > 0) {
      globeInstanceRef.current.htmlElementsData(stations);
    }
  }, [stations, language, t]);

  // Active station for live telemetry card: selected or first station
  const currentStation = selectedStation || stations[0] || null;

  return (
    <div className="relative w-full h-[520px] overflow-hidden border border-[#cad5e2] bg-[#07111c] shadow-md rounded-sm select-none">
      {/* 1. TOP CONTROL BAR: Live Badge & 4 Government Region Toggles */}
      <div className="absolute top-4 inset-x-4 z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pointer-events-none">
        {/* Live Geospatial View Indicator */}
        <div className="inline-flex items-center gap-2 border border-[#51718b] bg-white/95 px-3.5 py-1.5 text-[11px] font-bold tracking-[0.16em] text-brand-dark shadow-md pointer-events-auto rounded-sm">
          <MapPin size={13} className="text-brand-orange transition-colors duration-300" />
          <span>{t('LIVE GEOSPATIAL VIEW', 'प्रत्यक्ष भू-स्थानिक दृश्य')}</span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse ml-1" />
        </div>

        {/* 4 Sleek, Government-Styled Toggle Buttons */}
        <div className="inline-flex flex-wrap items-center bg-white/90 p-1 border border-[#cad5e2] shadow-lg pointer-events-auto rounded-sm">
          {(["Global", "Antarctica", "Arctic", "Himalaya"] as RegionMode[]).map((mode) => {
            const isSelected = activeRegion === mode;
            return (
              <button
                key={mode}
                onClick={() => flyToRegion(mode)}
                className={`px-3 py-1.5 text-xs font-bold transition-all rounded-sm ${ isSelected ? "bg-brand-navylight text-white shadow-sm ring-1 ring-brand-navylight" : "text-[#24445d] hover:bg-slate-200/80 hover:text-brand-dark" }`}
              >
                {regionConfigs[mode].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. WebGL 3D Globe Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* 3. BOTTOM-LEFT: Live Station Telemetry Readout Card */}
      {currentStation && (
        <div className="absolute bottom-4 left-4 z-20 border-l-4 border-brand-orange bg-white/95 px-5 py-3.5 shadow-xl border border-slate-200 max-w-sm rounded-sm transition-colors duration-300">
          <div className="mb-1.5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-navylight transition-colors duration-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
              {t('Live telemetry', 'प्रत्यक्ष टेलीमीटरी')}
            </div>
            <span className="text-[10px] font-mono text-slate-500">{currentStation.telemetry.updatedUtc}</span>
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => handleStationClick(currentStation)}
              className="text-left group hover:text-brand-navylight transition-colors"
            >
              <div className="text-sm font-bold text-brand-dark group-hover:text-brand-navylight transition-colors duration-300">
                {currentStation.name}
              </div>
              <div className="text-[11px] text-slate-600 mt-0.5">
                {currentStation.telemetry.temp} <span className="px-1 text-slate-300">|</span> {t('Wind:', 'पवन:')} {currentStation.telemetry.wind} <span className="px-1 text-slate-300">|</span> <span className="font-semibold text-emerald-700">{t('Status: Active', 'स्थिति: सक्रिय')}</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 4. BOTTOM-RIGHT: Station Legend & Map Navigation Link */}
      <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-3 bg-white/90 border border-slate-200 px-3.5 py-2 rounded-sm shadow-md text-[11px] font-semibold text-slate-700 transition-colors duration-300">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-brand-orange ring-2 ring-brand-orange/30" />
          <span>{t('Active Station', 'सक्रिय स्टेशन')}</span>
        </span>
        <span className="text-slate-300">|</span>
        <span>{stations.length} {t('Monitored Observatories', 'निरीक्षित वेधशालाएं')}</span>
      </div>

      {/* 5. Sleek Right-Side Slide-Over Panel (Station Detail View) */}
      <StationSlideOver
        station={selectedStation}
        onClose={() => setSelectedStation(null)}
      />
    </div>
  );
}
