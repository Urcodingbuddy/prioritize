import Image, { ImageProps } from 'next/image';
interface LogoProps extends Omit<ImageProps, 'width' | 'height' | 'src' | 'alt'> {
  w: number;
  h: number;
}
export default function Logo({ w, h, ...props }: LogoProps) {
  return (
    <Image 
      {...props}
      src="/logo.svg" 
      alt="Logo"
      width={w} 
      height={h} 
    />
  );
}
