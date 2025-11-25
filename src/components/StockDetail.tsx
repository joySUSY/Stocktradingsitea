import React, { useState, useEffect } from 'react';
import { ArrowLeft, BarChart3, Activity, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { PredictionMeter } from './PredictionMeter';
import { StockPriceOverview } from './StockPriceOverview';
import { Stock, simulateStockUpdate, getPredictionLabel, getPredictionColor, generateChartData } from '../utils/stockUtils';
import { mockNews } from '../constants/mockData';

interface StockDetailProps {
  stock: Stock;
  onBack: () => void;
  onAIAssistant?: () => void;
  ownedDetails?: {
    buyPrice: number;
    quantity: number;
  };
}

export function StockDetail({ stock, onBack, onAIAssistant, ownedDetails }: StockDetailProps) {
  const [currentStock, setCurrentStock] = useState(stock);
  
  // 模拟实时更新
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStock(prev => simulateStockUpdate(prev));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const predictionLabel = getPredictionLabel(currentStock.prediction);
  const predictionColor = getPredictionColor(currentStock.prediction);
  const chartData = generateChartData(currentStock.price);

  // 计算持仓盈亏
  const profit = ownedDetails ? (currentStock.price - ownedDetails.buyPrice) * ownedDetails.quantity : 0;
  const profitPercent = ownedDetails ? ((currentStock.price - ownedDetails.buyPrice) / ownedDetails.buyPrice) * 100 : 0;
  const currentValue = ownedDetails ? currentStock.price * ownedDetails.quantity : 0;
  const costValue = ownedDetails ? ownedDetails.buyPrice * ownedDetails.quantity : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card ios-card-shadow sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onBack}
              className="rounded-full ios-button-press"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl truncate">{currentStock.symbol}</h1>
              <p className="text-sm text-muted-foreground truncate">{currentStock.name}</p>
            </div>
            <Badge variant="secondary" className="gap-1.5 shrink-0">
              <Activity className="h-4 w-4" />
              实时
            </Badge>
            {onAIAssistant && (
              <Button
                onClick={onAIAssistant}
                className="rounded-full ios-button-press gap-2 shrink-0"
                size="sm"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI分析</span>
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* 持仓信息卡片 */}
        {ownedDetails && (
          <Card className="ios-card-shadow border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-primary">
                💰 持仓详情
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">持仓数量</div>
                  <div className="text-xl font-semibold">{ownedDetails.quantity}股</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">成本价</div>
                  <div className="text-xl font-semibold">¥{ownedDetails.buyPrice.toFixed(2)}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">持仓成本</div>
                  <div className="text-xl font-semibold">¥{costValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-1">当前市值</div>
                  <div className="text-xl font-semibold">¥{currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">盈亏</span>
                  <div className={`text-2xl font-semibold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {profit >= 0 ? '+' : ''}¥{profit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                    <span className="text-lg ml-2">
                      ({profit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%)
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Price Summary */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <StockPriceOverview stock={currentStock} />

          <Card className="ios-card-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                AI预测
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">操作建议</span>
                  <Badge className={`${predictionColor} text-white`}>
                    {predictionLabel}
                  </Badge>
                </div>
                <PredictionMeter value={currentStock.prediction} />
                <div className="text-center">
                  <div className="text-3xl font-semibold">{currentStock.prediction}%</div>
                  <div className="text-sm text-muted-foreground mt-1">置信度评分</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Information */}
        <Tabs defaultValue="chart" className="space-y-4">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="chart" className="flex-1 sm:flex-none">走势图</TabsTrigger>
            <TabsTrigger value="news" className="flex-1 sm:flex-none">新闻</TabsTrigger>
            <TabsTrigger value="analysis" className="flex-1 sm:flex-none">技术分析</TabsTrigger>
          </TabsList>

          <TabsContent value="chart" className="space-y-4">
            <Card className="ios-card-shadow">
              <CardHeader>
                <CardTitle>30日价格走势</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72 flex items-end justify-between gap-1">
                  {chartData.map((point, index) => (
                    <div
                      key={index}
                      className="bg-primary/20 hover:bg-primary/40 transition-colors flex-1 rounded-t cursor-pointer"
                      style={{
                        height: `${Math.max(10, (point.price / currentStock.price) * 100)}%`
                      }}
                      title={`¥${point.price.toFixed(2)}`}
                    />
                  ))}
                </div>
                <div className="mt-4 text-sm text-muted-foreground text-center">
                  模拟过去30日价格走势
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news" className="space-y-4">
            {mockNews.map((news, index) => (
              <Card key={index} className="ios-card-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                      news.sentiment === 'positive' ? 'bg-green-500' : 
                      news.sentiment === 'negative' ? 'bg-red-500' : 'bg-yellow-500'
                    }`} />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium mb-2">{currentStock.name} {news.title}</h3>
                      <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{news.summary}</p>
                      <div className="text-xs text-muted-foreground">{news.time}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <Card className="ios-card-shadow">
              <CardHeader>
                <CardTitle>技术指标</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-4 pb-2 border-b border-border">关键指标</h4>
                    <div className="space-y-3 text-base">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">RSI (14):</span>
                        <span className="font-medium">45.7</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">MACD:</span>
                        <span className="font-medium text-green-600">+2.34</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">50日均线:</span>
                        <span className="font-medium">¥{(currentStock.price * 0.95).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">成交量比:</span>
                        <span className="font-medium">128%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-4 pb-2 border-b border-border">支撑与压力</h4>
                    <div className="space-y-3 text-base">
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">支撑位:</span>
                        <span className="font-medium">¥{(currentStock.price * 0.92).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">压力位:</span>
                        <span className="font-medium">¥{(currentStock.price * 1.08).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">目标价:</span>
                        <span className="font-medium text-green-600">¥{(currentStock.price * 1.15).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-muted-foreground">止损价:</span>
                        <span className="font-medium text-red-600">¥{(currentStock.price * 0.88).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}