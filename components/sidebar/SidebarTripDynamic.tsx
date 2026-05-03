"use client";

import dynamic from "next/dynamic";

const SidebarTrip = dynamic(() => import("./SidebarTrips"), { ssr: false });

export default function SidebarTripDynamic() {
  return <SidebarTrip />;
}
