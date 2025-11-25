import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Stock } from '../utils/stockUtils';

interface MarketSummaryProps {
  stocks: Stock[];
  marketSummary: {
    totalValue: number;
    dailyChange: number;
    dailyChangePercent: number;
  };
}

export function MarketSummary({ stocks, marketSummary }: MarketSummaryProps) {
  const gainers = stocks.filter(stock => stock.change > 0).length;
  const losers = stocks.filter(stock => stock.change < 0).length;

  // 模拟上证和深证指数
  const shanghaiIndex = { value: 3245.67, change: 1.20 };
  const shenzhenIndex = { value: 10876.42, change: 0.85 };

  return (
    <div className="space-y-4">
      {/* 主要指数 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="bg-card ios-card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">上证指数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold">{shanghaiIndex.value.toFixed(2)}</div>
                <div className={`flex items-center gap-1 text-base mt-1 ${shanghaiIndex.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {shanghaiIndex.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {shanghaiIndex.change >= 0 ? '+' : ''}{shanghaiIndex.change.toFixed(2)}%
                </div>
              </div>
              <div className="text-4xl opacity-10">📈</div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-card ios-card-shadow">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">深证成指</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between">
              <div>
                <div className="text-3xl font-semibold">{shenzhenIndex.value.toFixed(2)}</div>
                <div className={`flex items-center gap-1 text-base mt-1 ${shenzhenIndex.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {shenzhenIndex.change >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                  {shenzhenIndex.change >= 0 ? '+' : ''}{shenzhenIndex.change.toFixed(2)}%
                </div>
              </div>
              <div className="text-4xl opacity-10">📊</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 持仓统计 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card ios-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">关注股票</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{stocks.length}</div>
            <div className="text-xs text-muted-foreground mt-1">只</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card ios-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">上涨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-green-600">{gainers}</div>
            <div className="text-xs text-muted-foreground mt-1">只</div>
          </CardContent>
        </Card>
        
        <Card className="bg-card ios-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">下跌</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-red-600">{losers}</div>
            <div className="text-xs text-muted-foreground mt-1">只</div>
          </CardContent>
        </Card>

        <Card className="bg-card ios-card-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">持平</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-muted-foreground">{stocks.length - gainers - losers}</div>
            <div className="text-xs text-muted-foreground mt-1">只</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
