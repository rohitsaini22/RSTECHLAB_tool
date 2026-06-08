import React, { useEffect, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';

interface Star {
  id: number;
  x: number;
  y: number;
  size: number;
  depth: number; // 0 to 1, where 1 is closest
}

export const ParallaxBackground: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = React.useState<Star[]>([]);

  // Mouse position motion values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth spring animation for mouse movement
  const springConfig = { damping: 25, stiffness: 150 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  useEffect(() => {
    // Generate random stars
    const generateStars = () => {
      const newStars: Star[] = [];
      const count = 100; // Number of stars
      for (let i = 0; i < count; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100, // percentage
          y: Math.random() * 100, // percentage
          size: Math.random() * 3 + 1, // 1px to 4px
          depth: Math.random(), // random depth
        });
      }
      setStars(newStars);
    };

    generateStars();

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize mouse position from -0.5 to 0.5
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) - 0.5;
      const y = (e.clientY / innerHeight) - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div 
      ref={containerRef} 
      className="absolute inset-0 overflow-hidden pointer-events-none z-0"
      style={{ perspective: '1000px' }}
    >
      {/* Deep Space Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#1a2333] via-[#0B1121] to-[#000000] opacity-80" />

      {stars.map((star) => (
        <StarLayer 
          key={star.id} 
          star={star} 
          mouseX={smoothX} 
          mouseY={smoothY} 
        />
      ))}
      
      {/* Nebula / Fog Layers */}
      <NebulaLayer mouseX={smoothX} mouseY={smoothY} color="rgba(59, 130, 246, 0.1)" depth={0.2} offset={10} />
      <NebulaLayer mouseX={smoothX} mouseY={smoothY} color="rgba(147, 51, 234, 0.1)" depth={0.5} offset={-20} />
    </div>
  );
};

const StarLayer = ({ star, mouseX, mouseY }: { star: Star, mouseX: any, mouseY: any }) => {
  // Movement multiplier based on depth (closer objects move more)
  const moveFactor = 50 * star.depth; 
  
  const x = useTransform(mouseX, (value: number) => value * moveFactor * -1);
  const y = useTransform(mouseY, (value: number) => value * moveFactor * -1);

  return (
    <motion.div
      className="absolute rounded-full bg-white"
      style={{
        left: `${star.x}%`,
        top: `${star.y}%`,
        width: star.size,
        height: star.size,
        opacity: 0.3 + (star.depth * 0.7), // Closer stars are brighter
        x,
        y,
        boxShadow: star.depth > 0.8 ? `0 0 ${star.size * 2}px rgba(255, 255, 255, 0.8)` : 'none',
      }}
    />
  );
};

const NebulaLayer = ({ mouseX, mouseY, color, depth, offset }: { mouseX: any, mouseY: any, color: string, depth: number, offset: number }) => {
    const moveFactor = 100 * depth;
    const x = useTransform(mouseX, (value: number) => (value * moveFactor * -1) + offset);
    const y = useTransform(mouseY, (value: number) => (value * moveFactor * -1) + offset);
    
    return (
        <motion.div 
            className="absolute inset-0 w-[120%] h-[120%] -left-[10%] -top-[10%]"
            style={{
                background: `radial-gradient(circle at 50% 50%, ${color}, transparent 60%)`,
                x,
                y,
                opacity: 0.6,
                filter: 'blur(60px)',
            }}
        />
    )
}
