"use client";

import { LocationCoordinates } from '@/src/lib/vedic-astronomy';

export interface FloatingActionDockProps {
  location?: LocationCoordinates;
  className?: string;
}

/**
 * FloatingActionDock Component (Deprecated & Decommissioned)
 * 
 * In accordance with Phase Architecture:
 * - Share functionality has been relocated directly to the top consolidated header row in HinduPanchangWidget.tsx.
 * - PWA Install trigger has been relocated to PWAInstallButton with bulletproof detection.
 * - Floating share action dock is completely removed to prevent screen crowding and modal collision.
 */
export function FloatingActionDock({}: FloatingActionDockProps) {
  return null;
}

export default FloatingActionDock;
