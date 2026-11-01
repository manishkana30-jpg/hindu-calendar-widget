"use client";

import React from 'react';
import { LocationCoordinates, PRESET_LOCATIONS } from '../../../src/lib/vedic-astronomy';
import { TithiMonthModal } from './TithiMonthModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  location?: LocationCoordinates;
  currentDate?: Date;
}

/**
 * Forwarding shim to Unified Master List Calendar (TithiMonthModal).
 * Prevents calendar engine duplication while ensuring 100% backward compatibility.
 */
export function UpcomingFestivalsModal({ isOpen, onClose, location }: Props) {
  return (
    <TithiMonthModal
      isOpen={isOpen}
      onClose={onClose}
      location={location || PRESET_LOCATIONS[0]}
      initialTab="vrats"
    />
  );
}
