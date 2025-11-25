import React, { useState, useEffect } from 'react';
import { X, Edit } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface EditOwnedStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (buyPrice: number, quantity: number) => void;
  stockName: string;
  stockSymbol: string;
  currentBuyPrice: number;
  currentQuantity: number;
}

export function EditOwnedStockModal({
  isOpen,
  onClose,
  onSave,
  stockName,
  stockSymbol,
  currentBuyPrice,
  currentQuantity
}: EditOwnedStockModalProps) {
  const [buyPrice, setBuyPrice] = useState(currentBuyPrice.toString());
  const [quantity, setQuantity] = useState(currentQuantity.toString());

  useEffect(() => {
    setBuyPrice(currentBuyPrice.toString());
    setQuantity(currentQuantity.toString());
  }, [currentBuyPrice, currentQuantity, isOpen]);

  const handleSave = () => {
    const price = parseFloat(buyPrice);
    const qty = parseInt(quantity);
    
    if (isNaN(price) || isNaN(qty) || price <= 0 || qty <= 0) {
      alert('请输入有效的购买价格和数量');
      return;
    }
    
    onSave(price, qty);
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
          className="bg-card rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg overflow-hidden ios-card-shadow"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Edit className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl">编辑持仓</h2>
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
          <div className="p-6 space-y-6">
            {/* Stock Info */}
            <div className="p-4 rounded-2xl bg-accent/50 border border-border">
              <div className="font-medium text-lg">{stockSymbol}</div>
              <div className="text-muted-foreground">{stockName}</div>
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">购买价格 (元)</label>
                <input
                  type="number"
                  step="0.01"
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
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary text-base"
                />
              </div>
              {buyPrice && quantity && !isNaN(parseFloat(buyPrice)) && !isNaN(parseInt(quantity)) && (
                <div className="p-4 rounded-xl bg-muted/50">
                  <div className="text-sm text-muted-foreground mb-1">持仓成本</div>
                  <div className="text-xl font-semibold">
                    ¥{(parseFloat(buyPrice) * parseInt(quantity)).toLocaleString()}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button
                onClick={onClose}
                variant="outline"
                className="flex-1 rounded-xl ios-button-press"
              >
                取消
              </Button>
              <Button
                onClick={handleSave}
                className="flex-1 rounded-xl ios-button-press"
              >
                保存
              </Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
