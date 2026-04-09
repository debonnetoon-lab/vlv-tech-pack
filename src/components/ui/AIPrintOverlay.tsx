"use client";

import React from "react";
import { AIResult } from "@/types/tech-pack";

interface Props {
  measurement: AIResult;
}

export default function AIPrintOverlay({ measurement }: Props) {
  const { pixel_box } = measurement;
  
  // We calculate percentages if we had the original image dimensions, 
  // but since we are in a responsive container, we'll use the box as provided.
  // In a real implementation, we'd map pixel_box to the current image container.
  
  // For the demonstration, we'll assume the base image is 1200x1200px (standardized).
  const left = (pixel_box.left_px / 1200) * 100;
  const top = (pixel_box.top_px / 1200) * 100;
  const width = ((pixel_box.right_px - pixel_box.left_px) / 1200) * 100;
  const height = ((pixel_box.bottom_px - pixel_box.top_px) / 1200) * 100;

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      <div 
        className="absolute border-2 border-orange-500 bg-orange-500/10 rounded-sm shadow-[0_0_15px_rgba(249,115,22,0.5)] flex items-center justify-center animate-in zoom-in-95 duration-500"
        style={{
          left: `${left}%`,
          top: `${top}%`,
          width: `${width}%`,
          height: `${height}%`,
        }}
      >
        <div className="bg-orange-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded-full -top-3 absolute shadow-lg uppercase tracking-tighter">
          AI PRINT AREA ({measurement.width_cm} x {measurement.height_cm}cm)
        </div>
        
        {/* Corner markers */}
        <div className="absolute -top-1 -left-1 w-2 h-2 bg-white border border-orange-500 rounded-full shadow-sm" />
        <div className="absolute -top-1 -right-1 w-2 h-2 bg-white border border-orange-500 rounded-full shadow-sm" />
        <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-white border border-orange-500 rounded-full shadow-sm" />
        <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-white border border-orange-500 rounded-full shadow-sm" />
      </div>

      {/* Neck reference marker */}
      <div 
        className="absolute w-2 h-2 bg-blue-500 rounded-full border border-white shadow-lg animate-pulse"
        style={{
          left: `50%`,
          top: `${(pixel_box.top_px - (measurement.pos_under_neck_cm * (1200 / 54))) / 1200 * 100}%`,
          transform: 'translateX(-50%)'
        }}
      >
        <div className="bg-blue-500 text-white text-[6px] font-bold px-1 rounded-full absolute -top-4 left-1/2 -translate-x-1/2 whitespace-nowrap shadow-sm">
          NECK POINT
        </div>
      </div>
    </div>
  );
}
