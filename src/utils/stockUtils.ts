export interface Stock {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  prediction: number;
  volume: string;
  marketCap: string;
  pe: number;
}

export const getPredictionLabel = (prediction: number): string => {
  return prediction >= 60 ? '买入' : prediction <= 40 ? '卖出' : '持有';
};

export const getPredictionColor = (prediction: number): string => {
  return prediction >= 60 ? 'bg-green-500' : prediction <= 40 ? 'bg-red-500' : 'bg-yellow-500';
};

export const simulateStockUpdate = (stock: Stock): Stock => ({
  ...stock,
  price: stock.price + (Math.random() - 0.5) * 2,
  change: (Math.random() - 0.5) * 10,
  changePercent: (Math.random() - 0.5) * 5,
  prediction: Math.max(0, Math.min(100, stock.prediction + (Math.random() - 0.5) * 10))
});

export const generateChartData = (basePrice: number, length: number = 30) => {
  return Array.from({ length }, (_, i) => ({
    time: i,
    price: basePrice + (Math.random() - 0.5) * 20
  }));
};

export const filterStocks = (stocks: Stock[], searchTerm: string): Stock[] => {
  return stocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
};