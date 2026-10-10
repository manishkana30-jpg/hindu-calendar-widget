import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Daily Tithi Live Vedic Panchang Embed Widget',
  description: 'Embeddable real-time Vedic Panchang, Udaya Tithi, and dynamic Muhurat widget for websites and blogs.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full min-h-screen bg-transparent flex items-center justify-center p-2 sm:p-3 overflow-hidden">
      {children}
    </div>
  );
}
