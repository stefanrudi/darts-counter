import React, { useState } from "react";
import { Position } from "../utils/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DartboardProps {
  onScore: (score: number, multiplier: number) => void;
  disabled?: boolean;
}

export function Dartboard({ onScore, disabled = false }: DartboardProps) {
  const [lastPosition, setLastPosition] = useState<Position | null>(null);

  // Dartboard properties
  const bullseyeRadius = 12.5;
  const singleBullRadius = 31.25;
  const tripleRingInner = 107;
  const tripleRingOuter = 115;
  const doubleRingInner = 162;
  const doubleRingOuter = 170;
  const boardEdge = 175;
  const missableArea = 240;

  // Dartboard colors
  const boardColors = ["#181818", "#F0F0F0"];
  const ringColors = ["#0AAA22", "#B91622"];

  // Define the 20 sections of the dartboard - starting with 20 at the top (clockwise order)
  const scores = [
    20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5
  ];

  // Precompute sections for the dartboard
  const sections = React.useMemo(() => {
    return scores.map((score, index) => {
      const startAngle = (index * 18 - 9) * (Math.PI / 180);
      const endAngle = ((index + 1) * 18 - 9) * (Math.PI / 180);
      return { startAngle, endAngle, score };
    });
  }, [scores]);

  const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
    // Get click coordinates relative to the center of the board
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;

    // Check if the click was inside the missable area
    const distance = Math.sqrt(x * x + y * y);
    if (distance <= missableArea) {
      const position: Position = { x, y };
      setLastPosition(position);

      // Calculate the score and multiplier
      const { score, multiplier } = calculateSegment(position);

      // Pass the score and multiplier to the parent component
      onScore(score, multiplier);
    }
  };

  const calculateSegment = (
    position: Position
  ): { score: number; multiplier: number } => {
    const { x, y } = position;
    const distance = Math.sqrt(x * x + y * y);

    // Calculate angle in radians, adjust to make 20 at top
    let angle = Math.atan2(y, x) + Math.PI / 2; // Add π/2 to align with dartboard orientation
    if (angle < 0) angle += 2 * Math.PI;

    // Adjust angle to match the section orientation
    angle = (angle + (9 * Math.PI) / 180) % (2 * Math.PI);

    // Determine section (0-19)
    const sectionIndex = Math.floor((angle * 180) / Math.PI / 18) % 20;
    const baseScore = scores[sectionIndex];

    // Determine score multiplier based on distance from center
    if (distance <= bullseyeRadius) {
      return { score: 25, multiplier: 2 };
    } else if (distance <= singleBullRadius) {
      return { score: 25, multiplier: 1 };
    } else if (distance <= boardEdge) {
      if (distance >= tripleRingInner && distance <= tripleRingOuter) {
        return { score: baseScore, multiplier: 3 };
      } else if (distance >= doubleRingInner && distance <= doubleRingOuter) {
        return { score: baseScore, multiplier: 2 };
      } else {
        return { score: baseScore, multiplier: 1 };
      }
    }

    return { score: 0, multiplier: 0 };
  };

  return (
    <Card className={disabled ? "opacity-70" : ""}>
      <CardHeader>
        <CardTitle>Dartboard {disabled && "- Waiting for your turn"}</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="dartboard-container">
          <svg
            width="500"
            height="500"
            viewBox="-250 -250 500 500"
            onClick={handleClick}
          >
            {/* Missable area background */}
            <circle
              cx="0"
              cy="0"
              r={missableArea}
              fill="#4C3A32"
              stroke="#000"
              strokeWidth="2"
            />

            {/* Board edge (surround) */}
            <circle
              cx="0"
              cy="0"
              r={boardEdge}
              fill="#321A10"
              stroke="#000"
              strokeWidth="2"
            />

            {/* Number label ring */}
            <circle
              cx="0"
              cy="0"
              r="210"
              fill="none"
              stroke="#321A10"
              strokeWidth="0"
            />

            {/* Dartboard sections */}
            {sections.map((section, idx) => {
              const colorIndex = idx % 2;
              return (
                <g key={idx}>
                  {/* Main section */}
                  <path
                    d={`M 0 0 
                    L ${doubleRingOuter * Math.sin(section.startAngle)} ${
                      -doubleRingOuter * Math.cos(section.startAngle)
                    } 
                    A ${doubleRingOuter} ${doubleRingOuter} 0 0 1 
                    ${doubleRingOuter * Math.sin(section.endAngle)} ${
                      -doubleRingOuter * Math.cos(section.endAngle)
                    } 
                    Z`}
                    fill={boardColors[colorIndex]}
                    stroke="#333"
                    strokeWidth="0.5"
                  />

                  {/* Double ring */}
                  <path
                    d={`M ${doubleRingInner * Math.sin(section.startAngle)} ${
                      -doubleRingInner * Math.cos(section.startAngle)
                    } 
                    L ${doubleRingOuter * Math.sin(section.startAngle)} ${
                      -doubleRingOuter * Math.cos(section.startAngle)
                    } 
                    A ${doubleRingOuter} ${doubleRingOuter} 0 0 1 
                    ${doubleRingOuter * Math.sin(section.endAngle)} ${
                      -doubleRingOuter * Math.cos(section.endAngle)
                    } 
                    L ${doubleRingInner * Math.sin(section.endAngle)} ${
                      -doubleRingInner * Math.cos(section.endAngle)
                    } 
                    A ${doubleRingInner} ${doubleRingInner} 0 0 0 
                    ${doubleRingInner * Math.sin(section.startAngle)} ${
                      -doubleRingInner * Math.cos(section.startAngle)
                    } 
                    Z`}
                    fill={ringColors[colorIndex % 2]}
                    stroke="#333"
                    strokeWidth="0.5"
                  />

                  {/* Triple ring */}
                  <path
                    d={`M ${tripleRingInner * Math.sin(section.startAngle)} ${
                      -tripleRingInner * Math.cos(section.startAngle)
                    } 
                    L ${tripleRingOuter * Math.sin(section.startAngle)} ${
                      -tripleRingOuter * Math.cos(section.startAngle)
                    } 
                    A ${tripleRingOuter} ${tripleRingOuter} 0 0 1 
                    ${tripleRingOuter * Math.sin(section.endAngle)} ${
                      -tripleRingOuter * Math.cos(section.endAngle)
                    } 
                    L ${tripleRingInner * Math.sin(section.endAngle)} ${
                      -tripleRingInner * Math.cos(section.endAngle)
                    } 
                    A ${tripleRingInner} ${tripleRingInner} 0 0 0 
                    ${tripleRingInner * Math.sin(section.startAngle)} ${
                      -tripleRingInner * Math.cos(section.startAngle)
                    } 
                    Z`}
                    fill={ringColors[colorIndex % 2]}
                    stroke="#333"
                    strokeWidth="0.5"
                  />

                  {/* Improved section number labels - outer ring with better visibility */}
                  <g>
                    {/* Section number */}
                    <text
                      x={
                        190 *
                        Math.sin((section.startAngle + section.endAngle) / 2)
                      }
                      y={
                        -190 *
                        Math.cos((section.startAngle + section.endAngle) / 2)
                      }
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                    >
                      {section.score}
                    </text>
                  </g>
                </g>
              );
            })}

            {/* Bull's eye (inner and outer bull) */}
            <circle
              cx="0"
              cy="0"
              r={singleBullRadius}
              fill={ringColors[0]}
              stroke="#333"
              strokeWidth="0.5"
            />
            <circle
              cx="0"
              cy="0"
              r={bullseyeRadius}
              fill={ringColors[1]}
              stroke="#333"
              strokeWidth="0.5"
            />

            {/* Show last throw position if any */}
            {lastPosition && (
              <>
                {/* Dart head */}
                <circle
                  cx={lastPosition.x}
                  cy={lastPosition.y}
                  r="5"
                  fill="yellow"
                  stroke="black"
                  strokeWidth="1"
                />
              </>
            )}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}

export default Dartboard;
