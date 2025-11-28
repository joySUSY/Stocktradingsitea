import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, Sparkles, Trash2, Edit, MoreVertical } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { PredictionMeter } from './PredictionMeter';
import { EditOwnedStockModal } from './EditOwnedStockModal';
import { MiniTrendChart } from './MiniTrendChart';
import { Stock, getPredictionLabel, getPredictionColor } from '../utils/stockUtils';

interface StockCardProps {
  stock: Stock;
  onClick: () => void;
  onAIClick?: () => void;
  onRemove?: () => void;
  onEdit?: (buyPrice: number, quantity: number) => void;
  ownedDetails?: {
    buyPrice: number;
    quantity: number;
  };
}

export function StockCard({ stock, onClick, onAIClick, onRemove, onEdit, ownedDetails }: StockCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const isPositive = stock.change >= 0;
  const predictionLabel = getPredictionLabel(stock.prediction);
  const predictionColor = getPredictionColor(stock.prediction);

  const handleAIClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAIClick?.();
  };

  const handleMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(!showMenu);
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    onRemove?.();
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    setShowEditModal(true);
  };

  // 计算盈亏
  const profit = ownedDetails ? (stock.price - ownedDetails.buyPrice) * ownedDetails.quantity : 0;
  const profitPercent = ownedDetails ? ((stock.price - ownedDetails.buyPrice) / ownedDetails.buyPrice) * 100 : 0;

  return (
    <>
      <Card 
        className="cursor-pointer hover:shadow-lg transition-all duration-300 border-border bg-card ios-card-shadow hover:-translate-y-1 relative"
        onClick={onClick}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg truncate">{stock.symbol}</CardTitle>
              <p className="text-sm text-muted-foreground truncate">{stock.name}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant="secondary" className="gap-1.5 shrink-0">
                <Activity className="h-3 w-3" />
                实时
              </Badge>
              <div className="flex gap-1">
                {onAIClick && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleAIClick}
                    className="h-7 w-7 p-0 text-primary hover:text-primary hover:bg-primary/10 ios-button-press"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                  </Button>
                )}
                {(onRemove || onEdit) && (
                  <div className="relative">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleMenuClick}
                      className="h-7 w-7 p-0 hover:bg-accent ios-button-press"
                    >
                      <MoreVertical className="h-3.5 w-3.5" />
                    </Button>
                    {showMenu && (
                      <div className="absolute right-0 top-8 bg-card border border-border rounded-xl shadow-lg overflow-hidden z-10 min-w-[120px]">
                        {onEdit && ownedDetails && (
                          <button
                            onClick={handleEdit}
                            className="w-full px-4 py-2.5 text-left hover:bg-accent flex items-center gap-2 text-sm"
                          >
                            <Edit className="h-4 w-4" />
                            编辑持仓
                          </button>
                        )}
                        {onRemove && (
                          <button
                            onClick={handleRemove}
                            className="w-full px-4 py-2.5 text-left hover:bg-accent flex items-center gap-2 text-sm text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            删除
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Price Information */}
          <div className="space-y-1">
            <div className="text-3xl font-semibold">
              ¥{stock.price.toFixed(2)}
            </div>
            <div className={`flex items-center gap-1.5 text-base ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {isPositive ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
              {isPositive ? '+' : ''}¥{stock.change.toFixed(2)} ({isPositive ? '+' : ''}{stock.changePercent.toFixed(2)}%)
            </div>
          </div>

          {/* 持仓盈亏信息 */}
          {ownedDetails && (
            <div className="p-3 rounded-xl bg-muted/50 space-y-1.5">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">持仓</span>
                <span className="font-medium">{ownedDetails.quantity}股</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">成本</span>
                <span className="font-medium">¥{ownedDetails.buyPrice.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-1.5 border-t border-border/50">
                <span className="text-muted-foreground">盈亏</span>
                <span className={`font-medium ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {profit >= 0 ? '+' : ''}¥{profit.toFixed(2)} ({profit >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%)
                </span>
              </div>
            </div>
          )}

          {/* Prediction Meter */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">AI预测</span>
              <Badge className={`${predictionColor} text-white`}>
                {predictionLabel}
              </Badge>
            </div>
            <PredictionMeter value={stock.prediction} />
            <div className="text-xs text-muted-foreground text-center">
              置信度 {stock.prediction}%
            </div>
          </div>

          {/* Trend Chart - 趋势图 */}
          <div className="pt-2 border-t border-border">
            <div className="text-sm text-muted-foreground mb-2">今日走势</div>
            <MiniTrendChart isPositive={isPositive} />
          </div>

          {/* Additional Stats */}
          {!ownedDetails && (
            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
              <div>
                <span className="text-sm text-muted-foreground block">成交量</span>
                <div className="font-medium">{stock.volume || '-'}</div>
              </div>
              <div>
                <span className="text-sm text-muted-foreground block">市盈率</span>
                <div className="font-medium">{stock.pe ? stock.pe.toFixed(2) : '-'}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 点击外部关闭菜单 */}
      {showMenu && (
        <div
          className="fixed inset-0 z-[5]"
          onClick={(e) => {
            e.stopPropagation();
            setShowMenu(false);
          }}
        />
      )}

      {/* Edit Modal */}
      {ownedDetails && onEdit && (
        <EditOwnedStockModal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSave={onEdit}
          stockName={stock.name}
          stockSymbol={stock.symbol}
          currentBuyPrice={ownedDetails.buyPrice}
          currentQuantity={ownedDetails.quantity}
        />
      )}
    </>
  );
}
