import React from 'react';

interface PredictionMeterProps {
  value: number; // 0-100 scale
}

export function PredictionMeter({ value }: PredictionMeterProps) {
  // Clamp value between 0 and 100
  const clampedValue = Math.max(0, Math.min(100, value));
  
  // Determine color based on value
  const getColor = (val: number) => {
    if (val >= 60) return 'bg-green-500';
    if (val <= 40) return 'bg-red-500';
    return 'bg-yellow-500';
  };

  const getGradient = (val: number) => {
    if (val >= 60) return 'from-green-200 to-green-500';
    if (val <= 40) return 'from-red-200 to-red-500';
    return 'from-yellow-200 to-yellow-500';
  };

  return (
    <div className="space-y-2">
      {/* Meter Bar */}
      <div className="relative h-4 bg-muted rounded-full overflow-hidden">
        <div 
          className={`h-full bg-gradient-to-r ${getGradient(clampedValue)} transition-all duration-500 ease-out`}
          style={{ width: `${clampedValue}%` }}
        />
        
        {/* Indicator marks */}
        <div className="absolute top-0 left-[40%] w-0.5 h-full bg-background/50" />
        <div className="absolute top-0 left-[60%] w-0.5 h-full bg-background/50" />
      </div>
      
      {/* Labels */}
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>SELL</span>
        <span>HOLD</span>
        <span>BUY</span>
      </div>
      
      {/* Zones */}
      <div className="flex justify-between text-xs">
        <span className="text-red-500">0-40</span>
        <span className="text-yellow-500">40-60</span>
        <span className="text-green-500">60-100</span>
      </div>
    </div>
  );
}