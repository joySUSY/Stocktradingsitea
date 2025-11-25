import React, { useState, useEffect } from 'react';
import { X, Search, Plus, TrendingUp, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';
import { Stock } from '../utils/stockUtils';
import { searchStocks as apiSearchStocks } from '../utils/stockApi';

interface AddStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (stock: Stock, type: 'watch' | 'owned', ownedDetails?: { buyPrice: number; quantity: number }) => void;
  availableStocks: Stock[];
}

interface SearchResult {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
}

export function AddStockModal({ isOpen, onClose, onAdd }: AddStockModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [stockType, setStockType] = useState<'watch' | 'owned'>('watch');
  const [buyPrice, setBuyPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 防抖搜索
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      await performSearch(searchQuery);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const performSearch = async (query: string) => {
    setIsSearching(true);

    try {
      // 使用真实的Tushare API
      const results = await apiSearchStocks(query);
      setSearchResults(results);
    } catch (error) {
      console.error('搜索失败:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdd = () => {
    if (!selectedStock) return;
    
    if (stockType === 'owned') {
      const price = parseFloat(buyPrice);
      const qty = parseInt(quantity);
      if (isNaN(price) || isNaN(qty) || price <= 0 || qty <= 0) {
        alert('请输入有效的购买价格和数量');
        return;
      }
      onAdd(selectedStock, stockType, { buyPrice: price, quantity: qty });
    } else {
      onAdd(selectedStock, stockType);
    }
    
    // Reset form
    setSelectedStock(null);
    setSearchQuery('');
    setBuyPrice('');
    setQuantity('');
    setStockType('watch');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-card rounded-t-3xl sm:rounded-3xl w-full sm:max-w-2xl max-h-[90vh] overflow-hidden ios-card-shadow"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Plus className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl">添加自选股</h2>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-full ios-button-press"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
            {!selectedStock ? (
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="搜索股票代码或名称..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-base"
                    autoFocus
                  />
                </div>

                {/* Stock List */}
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {isSearching ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <Loader2 className="w-12 h-12 mx-auto mb-3 animate-spin" />
                      <p>搜索中...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((stock) => (
                      <div
                        key={stock.symbol}
                        onClick={() => setSelectedStock(stock as Stock)}
                        className="p-4 rounded-xl border border-border bg-card hover:bg-accent cursor-pointer transition-colors ios-button-press"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{stock.symbol}</div>
                            <div className="text-sm text-muted-foreground">{stock.name}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">¥{stock.price.toFixed(2)}</div>
                            <div className={`text-sm ${stock.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {stock.change >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>未找到匹配的股票</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Selected Stock */}
                <div className="p-5 rounded-2xl border border-border bg-accent/50">
                  <div className="flex items-center gap-3 mb-2">
                    <TrendingUp className="w-5 h-5 text-primary" />
                    <span className="text-sm text-muted-foreground">已选择</span>
                  </div>
                  <div className="font-medium text-lg">{selectedStock.symbol}</div>
                  <div className="text-muted-foreground">{selectedStock.name}</div>
                  <div className="mt-3 text-2xl font-semibold">¥{selectedStock.price.toFixed(2)}</div>
                </div>

                {/* Stock Type Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3">添加到</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setStockType('watch')}
                      className={`p-4 rounded-xl border-2 transition-all ios-button-press ${
                        stockType === 'watch'
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:bg-accent'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">👀</div>
                        <div className="font-medium">关注列表</div>
                        <div className="text-xs text-muted-foreground mt-1">仅观察不持仓</div>
                      </div>
                    </button>
                    <button
                      onClick={() => setStockType('owned')}
                      className={`p-4 rounded-xl border-2 transition-all ios-button-press ${
                        stockType === 'owned'
                          ? 'border-primary bg-primary/10'
                          : 'border-border bg-card hover:bg-accent'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-2">💰</div>
                        <div className="font-medium">持仓列表</div>
                        <div className="text-xs text-muted-foreground mt-1">已购买持仓中</div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Owned Stock Details */}
                {stockType === 'owned' && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium mb-2">购买价格 (元)</label>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="例如：156.80"
                        value={buyPrice}
                        onChange={(e) => setBuyPrice(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-base"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">持仓数量 (股)</label>
                      <input
                        type="number"
                        step="100"
                        placeholder="例如：1000"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-base"
                      />
                    </div>
                    {buyPrice && quantity && (
                      <div className="p-4 rounded-xl bg-muted/50">
                        <div className="text-sm text-muted-foreground mb-1">持仓成本</div>
                        <div className="text-xl font-semibold">
                          ¥{(parseFloat(buyPrice) * parseInt(quantity)).toLocaleString()}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <Button
                    onClick={() => {
                      setSelectedStock(null);
                      setBuyPrice('');
                      setQuantity('');
                    }}
                    variant="outline"
                    className="flex-1 rounded-xl ios-button-press"
                  >
                    重新选择
                  </Button>
                  <Button
                    onClick={handleAdd}
                    className="flex-1 rounded-xl ios-button-press"
                  >
                    确认添加
                  </Button>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}