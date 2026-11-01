"use client";

import React from 'react';
import { PanchangData } from '../../../src/lib/vedic-astronomy';
import { TithiMonthModal } from './TithiMonthModal';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  panchang: PanchangData;
}

/**
 * Forwarding shim to Unified Master List Calendar (TithiMonthModal).
 * Prevents calendar engine duplication while ensuring 100% backward compatibility.
 */
export function TodayFestivalModal({ isOpen, onClose, panchang }: Props) {
  return (
    <TithiMonthModal
      isOpen={isOpen}
      onClose={onClose}
      location={panchang.location}
      initialTab="vrats"
    />
  );
}
