import React from 'react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface MiniTrendChartProps {
  data?: Array<{ value: number }>;
  isPositive: boolean;
}

/**
 * 迷你趋势图 - 用于股票卡片
 * 显示简单的价格走势线
 */
export function MiniTrendChart({ data, isPositive }: MiniTrendChartProps) {
  // 如果没有数据，生成模拟的趋势数据
  const chartData = data || generateMockTrendData(isPositive);

  return (
    <div className="h-16 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={isPositive ? '#16a34a' : '#dc2626'}
            strokeWidth={1.5}
            dot={false}
            animationDuration={300}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/**
 * 生成模拟的趋势数据
 * @param isPositive 是否为上涨趋势
 * @returns 30个数据点的模拟走势
 */
function generateMockTrendData(isPositive: boolean) {
  const points = 30;
  const data = [];
  let value = 100;
  
  for (let i = 0; i < points; i++) {
    // 添加随机波动
    const randomChange = (Math.random() - 0.5) * 3;
    // 如果是上涨趋势，整体向上；否则向下
    const trendChange = isPositive ? 0.3 : -0.3;
    value = value + randomChange + trendChange;
    
    data.push({ value });
  }
  
  return data;
}
