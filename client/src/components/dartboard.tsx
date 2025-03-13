import React, { useState } from 'react';

const Dartboard = () => {
  const [score, setScore] = useState(null);
  const [position, setPosition] = useState({ x: null, y: null });
  
  // Dartboard properties
  const boardRadius = 200;
  const bullseyeRadius = 12.5;
  const innerBullRadius = 31.25;
  const tripleRingInner = 105;
  const tripleRingOuter = 115;
  const doubleRingInner = 170;
  const doubleRingOuter = 180;
  
  // Color schemes for the dartboard
  const boardColors = ['#000000', '#FFFFFF'];
  const ringColors = ['#008000', '#FF0000'];
  
  // Define the 20 sections of the dartboard with their angles and scores
  const sections = [];
  const scores = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];
  
  for (let i = 0; i < 20; i++) {
    const startAngle = (i * 18) * (Math.PI / 180);
    const endAngle = ((i + 1) * 18) * (Math.PI / 180);
    sections.push({ startAngle, endAngle, score: scores[i] });
  }
  
  const handleClick = (e) => {
    // Get click coordinates relative to the center of the board
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const x = e.clientX - rect.left - centerX;
    const y = e.clientY - rect.top - centerY;
    
    // Calculate distance from center and angle
    const distance = Math.sqrt(x * x + y * y);
    const angle = Math.atan2(y, x) + Math.PI / 2; // Add π/2 to align with dartboard orientation
    const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
    
    // Determine which section was clicked
    let clickedScore = 0;
    
    if (distance <= bullseyeRadius) {
      // Bullseye (Double Bull)
      clickedScore = 50;
    } else if (distance <= innerBullRadius) {
      // Single Bull
      clickedScore = 25;
    } else if (distance <= boardRadius) {
      // Find the section
      const sectionIndex = Math.floor((normalizedAngle * 180 / Math.PI) / 18) % 20;
      const baseScore = scores[sectionIndex];
      
      // Check if in triple or double ring
      if (distance >= tripleRingInner && distance <= tripleRingOuter) {
        clickedScore = baseScore * 3;
      } else if (distance >= doubleRingInner && distance <= doubleRingOuter) {
        clickedScore = baseScore * 2;
      } else {
        clickedScore = baseScore;
      }
    }
    
    setScore(clickedScore);
    setPosition({ x, y });
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">Interactive Dartboard</h1>
      
      {score !== null && (
        <div className="bg-blue-100 p-3 rounded-md shadow text-center">
          <p className="text-xl">
            You scored: <span className="font-bold text-blue-600">{score} points</span>
          </p>
        </div>
      )}
      
      <svg 
        width="450" 
        height="450" 
        viewBox="-225 -225 450 450" 
        onClick={handleClick}
        className="cursor-pointer border-2 border-gray-300 rounded-full"
      >
        {/* Board background */}
        <circle cx="0" cy="0" r={boardRadius} fill="#262626" />
        
        {/* Dartboard sections */}
        {sections.map((section, idx) => {
          const colorIndex = idx % 2;
          return (
            <g key={idx}>
              {/* Main section */}
              <path
                d={`M 0 0 
                    L ${boardRadius * Math.sin(section.startAngle)} ${-boardRadius * Math.cos(section.startAngle)} 
                    A ${boardRadius} ${boardRadius} 0 0 1 
                    ${boardRadius * Math.sin(section.endAngle)} ${-boardRadius * Math.cos(section.endAngle)} 
                    Z`}
                fill={boardColors[colorIndex]}
                stroke="none"
              />
              
              {/* Double ring */}
              <path
                d={`M ${doubleRingInner * Math.sin(section.startAngle)} ${-doubleRingInner * Math.cos(section.startAngle)} 
                    L ${doubleRingOuter * Math.sin(section.startAngle)} ${-doubleRingOuter * Math.cos(section.startAngle)} 
                    A ${doubleRingOuter} ${doubleRingOuter} 0 0 1 
                    ${doubleRingOuter * Math.sin(section.endAngle)} ${-doubleRingOuter * Math.cos(section.endAngle)} 
                    L ${doubleRingInner * Math.sin(section.endAngle)} ${-doubleRingInner * Math.cos(section.endAngle)} 
                    A ${doubleRingInner} ${doubleRingInner} 0 0 0 
                    ${doubleRingInner * Math.sin(section.startAngle)} ${-doubleRingInner * Math.cos(section.startAngle)} 
                    Z`}
                fill={ringColors[colorIndex % 2]}
                stroke="none"
              />
              
              {/* Triple ring */}
              <path
                d={`M ${tripleRingInner * Math.sin(section.startAngle)} ${-tripleRingInner * Math.cos(section.startAngle)} 
                    L ${tripleRingOuter * Math.sin(section.startAngle)} ${-tripleRingOuter * Math.cos(section.startAngle)} 
                    A ${tripleRingOuter} ${tripleRingOuter} 0 0 1 
                    ${tripleRingOuter * Math.sin(section.endAngle)} ${-tripleRingOuter * Math.cos(section.endAngle)} 
                    L ${tripleRingInner * Math.sin(section.endAngle)} ${-tripleRingInner * Math.cos(section.endAngle)} 
                    A ${tripleRingInner} ${tripleRingInner} 0 0 0 
                    ${tripleRingInner * Math.sin(section.startAngle)} ${-tripleRingInner * Math.cos(section.startAngle)} 
                    Z`}
                fill={ringColors[colorIndex % 2]}
                stroke="none"
              />
              
              {/* Section number */}
              <text
                x={160 * Math.sin((section.startAngle + section.endAngle) / 2)}
                y={-160 * Math.cos((section.startAngle + section.endAngle) / 2)}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {section.score}
              </text>
            </g>
          );
        })}
        
        {/* Bull's eye (inner and outer bull) */}
        <circle cx="0" cy="0" r={innerBullRadius} fill="#008000" />
        <circle cx="0" cy="0" r={bullseyeRadius} fill="#FF0000" />
        
        {/* Show clicked position if any */}
        {position.x !== null && (
          <circle 
            cx={position.x} 
            cy={position.y} 
            r="5" 
            fill="yellow" 
            stroke="black" 
            strokeWidth="1" 
          />
        )}
      </svg>
      
      <div className="mt-4 text-center bg-gray-100 p-4 rounded-md shadow w-full max-w-md">
        <h2 className="font-semibold mb-2">How to score in darts:</h2>
        <ul className="text-left list-disc pl-6">
          <li>Outer ring (Double): 2× the section value</li>
          <li>Middle ring (Triple): 3× the section value</li>
          <li>Outer Bull: 25 points</li>
          <li>Bullseye: 50 points</li>
        </ul>
      </div>
    </div>
  );
};

export default Dartboard;