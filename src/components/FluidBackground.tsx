"use client";

import React, { useEffect, useRef } from "react";
import { useTheme } from "@/context/ThemeContext";

const FluidBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { theme } = useTheme();
  const animationRef = useRef<number>();
  const mouseRef = useRef({ x: 0, y: 0 });
  const pointsRef = useRef<
    Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      targetX: number;
      targetY: number;
    }>
  >([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log("❌ FluidBackground: Canvas not found");
      return;
    }

    console.log("✅ FluidBackground: Canvas found, initializing...");

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const initPoints = () => {
      const points = [];
      const numPoints = 8;

      for (let i = 0; i < numPoints; i++) {
        points.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          vx: (Math.random() - 0.5) * 1.0,
          vy: (Math.random() - 0.5) * 1.0,
          targetX: Math.random() * canvas.width,
          targetY: Math.random() * canvas.height,
        });
      }

      pointsRef.current = points;
      console.log(
        `✅ FluidBackground: Initialized ${numPoints} points`,
        points
      );
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Debug: Log animation frame occasionally
      if (Math.random() < 0.01) {
        // 1% chance to log
        console.log(
          "🎬 FluidBackground: Animation running, points:",
          pointsRef.current.length
        );
      }

      // Update points based on mouse position
      pointsRef.current.forEach((point) => {
        const mouseDistance = Math.sqrt(
          Math.pow(mouseRef.current.x - point.x, 2) +
            Math.pow(mouseRef.current.y - point.y, 2)
        );

        // Attraction to mouse when close
        if (mouseDistance < 200) {
          const force = ((200 - mouseDistance) / 200) * 0.02;
          const angle = Math.atan2(
            mouseRef.current.y - point.y,
            mouseRef.current.x - point.x
          );
          point.vx += Math.cos(angle) * force;
          point.vy += Math.sin(angle) * force;
        }

        // Move towards target with some randomness
        point.vx += (point.targetX - point.x) * 0.001;
        point.vy += (point.targetY - point.y) * 0.001;

        // Add some drift
        point.vx += (Math.random() - 0.5) * 0.01;
        point.vy += (Math.random() - 0.5) * 0.01;


        // Apply velocity
        point.x += point.vx;
        point.y += point.vy;

        // Damping
        point.vx *= 0.995;
        point.vy *= 0.995;

        // Update target occasionally
        if (Math.random() < 0.005) {
          point.targetX = Math.random() * canvas.width;
          point.targetY = Math.random() * canvas.height;
        }

        // Keep points within bounds
        if (point.x < 0 || point.x > canvas.width) point.vx *= -0.5;
        if (point.y < 0 || point.y > canvas.height) point.vy *= -0.5;

        point.x = Math.max(0, Math.min(canvas.width, point.x));
        point.y = Math.max(0, Math.min(canvas.height, point.y));
      });

      // Create gradient based on theme
      const isDark = theme === "dark";

      // Draw fluid shapes
      pointsRef.current.forEach((point, index) => {
        const gradient = ctx.createRadialGradient(
          point.x,
          point.y,
          0,
          point.x,
          point.y,
          300 + Math.sin(Date.now() * 0.001 + index) * 50
        );

        if (isDark) {
          gradient.addColorStop(
            0,
            `rgba(139, 92, 246, ${
              0.6 + Math.sin(Date.now() * 0.002 + index) * 0.2
            })`
          );
          gradient.addColorStop(
            0.5,
            `rgba(37, 99, 235, ${
              0.4 + Math.sin(Date.now() * 0.002 + index) * 0.1
            })`
          );
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        } else {
          gradient.addColorStop(
            0,
            `rgba(139, 92, 246, ${
              0.5 + Math.sin(Date.now() * 0.002 + index) * 0.15
            })`
          );
          gradient.addColorStop(
            0.5,
            `rgba(37, 99, 235, ${
              0.3 + Math.sin(Date.now() * 0.002 + index) * 0.1
            })`
          );
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
        }

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 300, 0, Math.PI * 2);
        ctx.fill();
      });

      // Add connecting lines between nearby points
      pointsRef.current.forEach((point1, i) => {
        pointsRef.current.slice(i + 1).forEach((point2) => {
          const distance = Math.sqrt(
            Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
          );

          if (distance < 400) {
            const opacity = (1 - distance / 400) * 0.3;
            ctx.strokeStyle = isDark
              ? `rgba(139, 92, 246, ${opacity})`
              : `rgba(139, 92, 246, ${opacity * 0.7})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(point1.x, point1.y);
            ctx.lineTo(point2.x, point2.y);
            ctx.stroke();
          }
        });
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    resizeCanvas();
    initPoints();

    window.addEventListener("resize", () => {
      resizeCanvas();
      initPoints();
    });
    window.addEventListener("mousemove", handleMouseMove);

    animate();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[-1]"
      style={{
        background:
          theme === "dark"
            ? "linear-gradient(135deg, #000000 0%, #111827 50%, #1f2937 100%)"
            : "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 50%, #e5e7eb 100%)",
      }}
    />
  );
};

export default FluidBackground;
