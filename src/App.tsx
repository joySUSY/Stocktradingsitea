import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, Activity, Sparkles, Plus, Eye, Wallet } from 'lucide-react';
import { StockCard } from './components/StockCard';
import { StockDetail } from './components/StockDetail';
import { MarketSummary } from './components/MarketSummary';
import { AIAssistant } from './components/AIAssistant';
import { AddStockModal } from './components/AddStockModal';
import { Input } from './components/ui/input';
import { Badge } from './components/ui/badge';
import { Button } from './components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { mockStocks, initialMarketSummary } from './constants/mockData';
import { simulateStockUpdate, filterStocks, Stock } from './utils/stockUtils';

interface OwnedStock extends Stock {
  buyPrice: number;
  quantity: number;
}

type WatchStock = Stock;

export default function App() {
  const [allStocks, setAllStocks] = useState<Stock[]>(mockStocks);
  const [watchStocks, setWatchStocks] = useState<WatchStock[]>([]);
  const [ownedStocks, setOwnedStocks] = useState<OwnedStock[]>([]);
  const [selectedStock, setSelectedStock] = useState<Stock | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [marketSummary, setMarketSummary] = useState(initialMarketSummary);
  const [showAI, setShowAI] = useState(false);
  const [aiStock, setAiStock] = useState<{ symbol: string; name: string } | undefined>();
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTab, setActiveTab] = useState('watch');

  // 从localStorage加载自选股数据
  useEffect(() => {
    const savedWatch = localStorage.getItem('watchStocks');
    const savedOwned = localStorage.getItem('ownedStocks');
    
    if (savedWatch) {
      setWatchStocks(JSON.parse(savedWatch));
    }
    if (savedOwned) {
      setOwnedStocks(JSON.parse(savedOwned));
    }
  }, []);

  // 保存到localStorage
  useEffect(() => {
    localStorage.setItem('watchStocks', JSON.stringify(watchStocks));
  }, [watchStocks]);

  useEffect(() => {
    localStorage.setItem('ownedStocks', JSON.stringify(ownedStocks));
  }, [ownedStocks]);

  // 模拟实时股票数据更新
  useEffect(() => {
    const interval = setInterval(() => {
      setAllStocks(prevStocks => prevStocks.map(simulateStockUpdate));
      setWatchStocks(prevStocks => prevStocks.map(simulateStockUpdate));
      setOwnedStocks(prevStocks => prevStocks.map(stock => ({
        ...simulateStockUpdate(stock),
        buyPrice: stock.buyPrice,
        quantity: stock.quantity
      })));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleAddStock = (stock: Stock, type: 'watch' | 'owned', ownedDetails?: { buyPrice: number; quantity: number }) => {
    if (type === 'watch') {
      // 检查是否已存在
      if (watchStocks.some(s => s.symbol === stock.symbol)) {
        alert('该股票已在关注列表中');
        return;
      }
      setWatchStocks([...watchStocks, stock]);
    } else {
      // 检查是否已存在
      if (ownedStocks.some(s => s.symbol === stock.symbol)) {
        alert('该股票已在持仓列表中');
        return;
      }
      if (ownedDetails) {
        setOwnedStocks([...ownedStocks, {
          ...stock,
          buyPrice: ownedDetails.buyPrice,
          quantity: ownedDetails.quantity
        }]);
      }
    }
  };

  const handleRemoveStock = (symbol: string, type: 'watch' | 'owned') => {
    if (confirm('确定要删除这只股票吗？')) {
      if (type === 'watch') {
        setWatchStocks(watchStocks.filter(s => s.symbol !== symbol));
      } else {
        setOwnedStocks(ownedStocks.filter(s => s.symbol !== symbol));
      }
    }
  };

  const handleEditOwned = (symbol: string, buyPrice: number, quantity: number) => {
    setOwnedStocks(ownedStocks.map(stock =>
      stock.symbol === symbol
        ? { ...stock, buyPrice, quantity }
        : stock
    ));
  };

  const handleAIAssistant = (stock?: Stock) => {
    if (stock) {
      setAiStock({ symbol: stock.symbol, name: stock.name });
    } else {
      setAiStock(undefined);
    }
    setShowAI(true);
  };

  const filteredWatchStocks = filterStocks(watchStocks, searchTerm);
  const filteredOwnedStocks = ownedStocks.filter(stock =>
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // 计算持仓统计
  const totalPosition = ownedStocks.reduce((sum, stock) => sum + (stock.buyPrice * stock.quantity), 0);
  const currentValue = ownedStocks.reduce((sum, stock) => sum + (stock.price * stock.quantity), 0);
  const totalProfit = currentValue - totalPosition;
  const totalProfitPercent = totalPosition > 0 ? (totalProfit / totalPosition) * 100 : 0;

  if (selectedStock) {
    const isOwned = ownedStocks.find(s => s.symbol === selectedStock.symbol);
    return (
      <StockDetail 
        stock={selectedStock} 
        onBack={() => setSelectedStock(null)}
        onAIAssistant={() => handleAIAssistant(selectedStock)}
        ownedDetails={isOwned ? { buyPrice: isOwned.buyPrice, quantity: isOwned.quantity } : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card ios-card-shadow sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl">股票盯盘</h1>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1.5 px-3 py-1.5">
                <Activity className="h-4 w-4" />
                实时行情
              </Badge>
              <Button
                onClick={() => handleAIAssistant()}
                className="rounded-full ios-button-press gap-2"
                size="sm"
              >
                <Sparkles className="h-4 w-4" />
                <span className="hidden sm:inline">AI助手</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Market Summary */}
        <MarketSummary stocks={[...watchStocks, ...ownedStocks]} marketSummary={marketSummary} />

        {/* 持仓盈亏统计 */}
        {ownedStocks.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-card rounded-2xl p-5 border border-border ios-card-shadow">
              <div className="text-sm text-muted-foreground mb-1">持仓市值</div>
              <div className="text-2xl font-semibold">¥{currentValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border ios-card-shadow">
              <div className="text-sm text-muted-foreground mb-1">持仓成本</div>
              <div className="text-2xl font-semibold">¥{totalPosition.toLocaleString(undefined, { maximumFractionDigits: 2 })}</div>
            </div>
            <div className="bg-card rounded-2xl p-5 border border-border ios-card-shadow">
              <div className="text-sm text-muted-foreground mb-1">盈亏</div>
              <div className={`text-2xl font-semibold ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {totalProfit >= 0 ? '+' : ''}¥{totalProfit.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                <span className="text-base ml-2">({totalProfit >= 0 ? '+' : ''}{totalProfitPercent.toFixed(2)}%)</span>
              </div>
            </div>
          </div>
        )}

        {/* Search and Add Button */}
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="搜索股票代码或名称..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-xl border-border bg-card text-base"
            />
          </div>
          <Button
            onClick={() => setShowAddModal(true)}
            className="h-12 px-6 rounded-xl ios-button-press gap-2 shrink-0"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">添加自选</span>
          </Button>
        </div>

        {/* Tabs for Watch and Owned */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-2 p-1">
            <TabsTrigger value="watch" className="gap-2">
              <Eye className="h-4 w-4" />
              关注股票 ({watchStocks.length})
            </TabsTrigger>
            <TabsTrigger value="owned" className="gap-2">
              <Wallet className="h-4 w-4" />
              持仓股票 ({ownedStocks.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="watch" className="mt-6">
            {filteredWatchStocks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredWatchStocks.map((stock) => (
                  <StockCard
                    key={stock.symbol}
                    stock={stock}
                    onClick={() => setSelectedStock(stock)}
                    onAIClick={() => handleAIAssistant(stock)}
                    onRemove={() => handleRemoveStock(stock.symbol, 'watch')}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border ios-card-shadow">
                <Eye className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-lg text-muted-foreground mb-2">
                  {searchTerm ? '未找到匹配的关注股票' : '还没有关注的股票'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 rounded-xl ios-button-press gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    添加关注股票
                  </Button>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="owned" className="mt-6">
            {filteredOwnedStocks.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredOwnedStocks.map((stock) => (
                  <StockCard
                    key={stock.symbol}
                    stock={stock}
                    onClick={() => setSelectedStock(stock)}
                    onAIClick={() => handleAIAssistant(stock)}
                    onRemove={() => handleRemoveStock(stock.symbol, 'owned')}
                    onEdit={(buyPrice, quantity) => handleEditOwned(stock.symbol, buyPrice, quantity)}
                    ownedDetails={{ buyPrice: stock.buyPrice, quantity: stock.quantity }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card rounded-2xl border border-border ios-card-shadow">
                <Wallet className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-30" />
                <p className="text-lg text-muted-foreground mb-2">
                  {searchTerm ? '未找到匹配的持仓股票' : '还没有持仓股票'}
                </p>
                {!searchTerm && (
                  <Button
                    onClick={() => setShowAddModal(true)}
                    className="mt-4 rounded-xl ios-button-press gap-2"
                  >
                    <Plus className="h-5 w-5" />
                    添加持仓股票
                  </Button>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* AI Assistant Modal */}
      <AIAssistant
        isOpen={showAI}
        onClose={() => setShowAI(false)}
        stockSymbol={aiStock?.symbol}
        stockName={aiStock?.name}
      />

      {/* Add Stock Modal */}
      <AddStockModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddStock}
        availableStocks={allStocks}
      />
    </div>
  );
}
