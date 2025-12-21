"use client";

import Image, { ImageProps } from 'next/image';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

interface LogoProps extends Omit<ImageProps, 'width' | 'height' | 'src' | 'alt'> {
  w: number;
  h: number;
}

export default function Logo({ w, h, ...props }: LogoProps) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logoSrc = mounted && theme === 'dark' ? '/logo-white.svg' : '/logo-black.svg';

  return (
    <Image 
      {...props}
      src={logoSrc} 
      alt="P"
      width={w} 
      height={h} 
    />
  );
}
