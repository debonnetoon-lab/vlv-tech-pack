"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { useEffect, useState } from "react";
import { assetStorage } from "@/store/useDataStore";
import { ImageIcon } from "lucide-react";

interface SmartImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src?: string;
}

export default function SmartImage({ src, ...props }: SmartImageProps) {
  const [displaySrc, setDisplaySrc] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!src) return;

    if (src.startsWith("asset:")) {
      const assetId = src.split(":")[1];
      setLoading(true);
      assetStorage.get(assetId).then(data => {
        if (data) setDisplaySrc(data);
        setLoading(false);
      });
    } else {
      setDisplaySrc(src);
    }
  }, [src]);

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-slate-50 animate-pulse rounded-lg">
        <ImageIcon className="w-5 h-5 text-slate-300" />
      </div>
    );
  }

  if (!displaySrc) return null;

  return <img src={displaySrc} {...props} />;
}
