"use client";

import { useRouter } from "next/navigation";
import ShopOverlay from "@/components/shop/ShopOverlay";

export default function ShopPage() {
  const router = useRouter();
  return <ShopOverlay onClose={() => router.back()} />;
}
