"use client";
import dynamic from "next/dynamic";

const MapRenderer = dynamic(() => import("@/components/map/MapRenderer"), {
  ssr: false,
});

export default function MapPage() {
  return (
    <div className="w-full h-screen bg-black">
      <div className="w-full h-full">
        <MapRenderer />
      </div>
    </div>
  );
}