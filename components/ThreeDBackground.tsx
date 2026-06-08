import React, { useEffect, useRef } from 'react';

interface ThreeDBackgroundProps {
  fullPage?: boolean;
}

interface Star {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  pulseSpeed: number;
  pulsePhase: number;
}

const ThreeDBackground: React.FC<ThreeDBackgroundProps> = ({ fullPage = false }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;

    const resize = () => {
      if (fullPage) {
        width = window.innerWidth;
        height = window.innerHeight;
      } else if (canvas.parentElement) {
        width = canvas.parentElement.clientWidth;
        height = canvas.parentElement.clientHeight;
      } else {
        width = window.innerWidth;
        height = window.innerHeight;
      }
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', resize);
    resize();

    // Mouse positions for rotational camera tilt
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      // Normalize to ranges from -1 to 1
      targetMouseX = (e.clientX / window.innerWidth) * 2 - 1;
      targetMouseY = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Scroll capture for velocity boost and scroll pitch rotation
    let scrollVelocity = 0;
    let lastScrollY = window.scrollY;
    let scrollTilt = 0;
    let targetScrollTilt = 0;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const dy = currentScrollY - lastScrollY;
      
      // Calculate scroll speed spike
      if (Math.abs(dy) > 1) {
        scrollVelocity += Math.abs(dy) * 0.15;
      }
      lastScrollY = currentScrollY;

      // Project vertical page scrolling into a depth camera pitch tilt
      const docHeight = Math.max(
        document.body.scrollHeight,
        document.documentElement.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.offsetHeight
      );
      const totalScrollable = docHeight - window.innerHeight;
      if (totalScrollable > 0) {
        // Curve camera tilt up to 15 degrees (0.26 radians) as user scrolls down
        targetScrollTilt = (currentScrollY / totalScrollable) * 0.26;
      }
    };

    if (fullPage) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    // 3D Space Elements Setup
    const numStars = fullPage ? 400 : 250;
    const stars: Star[] = [];
    const focalLength = 400; // Focal camera adjustment
    const baseSpeed = 0.8; // Star drift forward velocity

    // Color Palette: High-tech Electric Blue, Deep Purple, Bright Cyan, Glowing White
    const colors = [
      'rgba(96, 165, 250, ',  // Blue (#60A5FA)
      'rgba(167, 139, 250, ', // Purple (#A78BFA)
      'rgba(34, 211, 238, ',  // Cyan (#22D3EE)
      'rgba(255, 255, 255, '  // White
    ];

    // Select color based on random index with bias towards white/blue
    const getRandomColorPrefix = () => {
      const r = Math.random();
      if (r < 0.6) return colors[3]; // 60% White
      if (r < 0.8) return colors[0]; // 20% Blue
      if (r < 0.9) return colors[2]; // 10% Cyan
      return colors[1];              // 10% Purple
    };

    // Initialize stars with a 3D bounding volume
    for (let i = 0; i < numStars; i++) {
      stars.push({
        x: (Math.random() - 0.5) * width * 3,
        y: (Math.random() - 0.5) * height * 3,
        z: Math.random() * 1000 + 50,
        color: getRandomColorPrefix(),
        size: Math.random() * 1.6 + 0.6,
        pulseSpeed: Math.random() * 0.05 + 0.01,
        pulsePhase: Math.random() * Math.PI * 2
      });
    }

    // Interactive constellation linkages (mesh tracker subset)
    // The first ~60 stars will track connections for premium grid effect
    const constellationCount = Math.min(60, numStars);
    const maxLinkDistance = 140; // 3D units

    let animationFrameId: number;
    let autoRotationOffset = 0;

    const animate = () => {
      // Clear with space-deep charcoal black
      ctx.fillStyle = '#0B1121';
      ctx.fillRect(0, 0, width, height);

      // Render cosmic background glow (Nebula simulation)
      const gradient = ctx.createRadialGradient(
        width / 2 + mouseX * 80, 
        height / 2 + mouseY * 80, 
        width * 0.1, 
        width / 2, 
        height / 2, 
        width * 0.9
      );
      gradient.addColorStop(0, 'rgba(15, 23, 42, 0.9)'); // Slate blue overlay center
      gradient.addColorStop(0.5, 'rgba(11, 17, 33, 0.95)'); // Dark deep space
      gradient.addColorStop(1, 'rgba(2, 6, 23, 1)'); // Midnight outer space limits
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw faint gaseous purple nebula cloud
      ctx.fillStyle = 'rgba(147, 51, 234, 0.035)'; // Very faint magenta/purple blur
      ctx.beginPath();
      ctx.arc(
        width / 3 - mouseX * 40,
        height / 2.5 - mouseY * 40,
        width * 0.4,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Draw faint blue gas cloud
      ctx.fillStyle = 'rgba(6, 182, 212, 0.03)'; // Faint Cyan
      ctx.beginPath();
      ctx.arc(
        width * 0.7 - mouseX * 50,
        height * 0.6 - mouseY * 50,
        width * 0.35,
        0,
        Math.PI * 2
      );
      ctx.fill();

      // Smooth interpolation of mouse positions (Spring/Lerp emulation)
      mouseX += (targetMouseX - mouseX) * 0.05;
      mouseY += (targetMouseY - mouseY) * 0.05;
      scrollTilt += (targetScrollTilt - scrollTilt) * 0.08;

      // Slow continuous orbital rotation (yaw drift) for added organic feel
      autoRotationOffset += 0.0004;

      // Compound angles for 3D state rotation
      // MouseX rotates around Y (Yaw), MouseY rotates around X (Pitch)
      const angleY = mouseX * 0.15 + autoRotationOffset; 
      const angleX = mouseY * 0.12 + scrollTilt;

      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      // Decelerate scroll speeds gracefully
      scrollVelocity *= 0.94;
      const currentForwardSpeed = baseSpeed + scrollVelocity;

      const centerX = width / 2;
      const centerY = height / 2;

      // Array to keep track of projected 2D coordinates for constellation meshes
      const projectedStars: { x2d: number; y2d: number; zProjected: number; opacity: number }[] = [];

      // Move, rotate and project all stars
      stars.forEach((star) => {
        // 1. Move star forward
        star.z -= currentForwardSpeed;

        // Reset star to outer space border if it flies past camera
        if (star.z <= 10) {
          star.z = 1000;
          star.x = (Math.random() - 0.5) * width * 3;
          star.y = (Math.random() - 0.5) * height * 3;
        }

        // Apply 3D coordinate transformations
        // Yaw (Rotation around horizontal Y-axis)
        const rx1 = star.x * cosY - star.z * sinY;
        const rz1 = star.x * sinY + star.z * cosY;

        // Pitch (Rotation around vertical X-axis)
        const ry2 = star.y * cosX - rz1 * sinX;
        const rz2 = star.y * sinX + rz1 * cosX;

        // Guard against rendering elements behind camera
        if (rz2 > 15) {
          // Perspective projection equations
          const scalingRatio = focalLength / rz2;
          const x2d = centerX + rx1 * scalingRatio;
          const y2d = centerY + ry2 * scalingRatio;

          // Star lighting parameters (Fade off in far distance and camera proximity edge)
          let opacity = (1 - rz2 / 1000);
          
          // Smooth pulse oscillation for natural shimmer
          star.pulsePhase += star.pulseSpeed;
          const shimmer = Math.sin(star.pulsePhase) * 0.15 + 0.85;
          opacity *= shimmer;

          // Clip to viewport screen window
          if (x2d >= 0 && x2d <= width && y2d >= 0 && y2d <= height) {
            const finalSize = Math.max(0.2, star.size * (1.1 - rz2 / 1000));
            
            ctx.beginPath();
            ctx.fillStyle = star.color + `${opacity})`;
            ctx.arc(x2d, y2d, finalSize, 0, Math.PI * 2);
            ctx.fill();

            // Glow flare for very bright or nearby elements
            if (rz2 < 300 && star.size > 1.4) {
              ctx.beginPath();
              ctx.fillStyle = star.color + `${opacity * 0.18})`;
              ctx.arc(x2d, y2d, finalSize * 3.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }

          // Register coordinates for constellation grid linkages (only for tracker portion)
          projectedStars.push({ x2d, y2d, zProjected: rz2, opacity });
        } else {
          projectedStars.push({ x2d: -999, y2d: -999, zProjected: rz2, opacity: 0 });
        }
      });

      // 2. Draw Constellation lines between nearby tracker stars (Grid Mesh)
      // Pick the subset and link nearby nodes
      ctx.lineWidth = 0.55;
      for (let i = 0; i < constellationCount; i++) {
        const starA = stars[i];
        const projA = projectedStars[i];

        if (!projA || projA.x2d === -999) continue;

        for (let j = i + 1; j < constellationCount; j++) {
          const starB = stars[j];
          const projB = projectedStars[j];

          if (!projB || projB.x2d === -999) continue;

          // Calculate direct 3D Euclidean distances
          const dx = starA.x - starB.x;
          const dy = starA.y - starB.y;
          const dz = starA.z - starB.z;
          const distance3D = Math.sqrt(dx * dx + dy * dy + dz * dz);

          // Connect if components are in critical proximity
          if (distance3D < maxLinkDistance) {
            // Screen space distance check to prevent bizarre stretch lines at near boundaries
            const dist2D = Math.sqrt(
              Math.pow(projA.x2d - projB.x2d, 2) + Math.pow(projA.y2d - projB.y2d, 2)
            );

            if (dist2D < 250) {
              // Smooth dynamic opacity proportional to proximity
              const linkOpacity = (1 - distance3D / maxLinkDistance) * 0.08 * Math.min(projA.opacity, projB.opacity);
              
              ctx.beginPath();
              
              // Light up constellation links as a gradient between nodes
              const lineGrad = ctx.createLinearGradient(projA.x2d, projA.y2d, projB.x2d, projB.y2d);
              lineGrad.addColorStop(0, `rgba(59, 130, 246, ${linkOpacity})`); // Cyan/Blue glow
              lineGrad.addColorStop(1, `rgba(168, 85, 247, ${linkOpacity})`); // Purple glow
              
              ctx.strokeStyle = lineGrad;
              ctx.moveTo(projA.x2d, projA.y2d);
              ctx.lineTo(projB.x2d, projB.y2d);
              ctx.stroke();
            }
          }
        }
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (fullPage) {
        window.removeEventListener('scroll', handleScroll);
      }
      cancelAnimationFrame(animationFrameId);
    };
  }, [fullPage]);

  return (
    <canvas
      ref={canvasRef}
      className={`${fullPage ? 'fixed' : 'absolute'} inset-0 w-full h-full pointer-events-none`}
      style={{ 
        zIndex: 0, 
        mixBlendMode: 'normal',
        willChange: 'transform' // GPU acceleration optimization hint
      }}
    />
  );
};

export default ThreeDBackground;
