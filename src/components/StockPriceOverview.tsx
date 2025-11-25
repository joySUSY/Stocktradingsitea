import React from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Stock } from '../utils/stockUtils';

interface StockPriceOverviewProps {
  stock: Stock;
}

export function StockPriceOverview({ stock }: StockPriceOverviewProps) {
  const isPositive = stock.change >= 0;

  return (
    <Card className="lg:col-span-2 ios-card-shadow">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          价格概览
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-4 flex-wrap">
            <div className="text-5xl font-semibold">
              ¥{stock.price.toFixed(2)}
            </div>
            <div className={`flex items-center gap-2 text-xl ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-6 w-6" /> : <TrendingDown className="h-6 w-6" />}
              {isPositive ? '+' : ''}¥{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-border">
            <div>
              <span className="text-sm text-muted-foreground block mb-1">成交量</span>
              <div className="font-medium text-base">{stock.volume}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block mb-1">总市值</span>
              <div className="font-medium text-base">{stock.marketCap}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block mb-1">市盈率</span>
              <div className="font-medium text-base">{stock.pe}</div>
            </div>
            <div>
              <span className="text-sm text-muted-foreground block mb-1">52周范围</span>
              <div className="font-medium text-base">¥{(stock.price * 0.8).toFixed(2)} - ¥{(stock.price * 1.2).toFixed(2)}</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
