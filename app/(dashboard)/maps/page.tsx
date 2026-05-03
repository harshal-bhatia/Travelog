"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MapsRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/itinerary");
  }, [router]);
  return null;
}
