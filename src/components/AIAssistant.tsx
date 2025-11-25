import React, { useState } from 'react';
import { X, Sparkles, TrendingUp, TrendingDown, AlertCircle, Send } from 'lucide-react';
import { Button } from './ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface AIAssistantProps {
  isOpen: boolean;
  onClose: () => void;
  stockSymbol?: string;
  stockName?: string;
}

type AnalysisMode = 'short_update' | 'buy_sell' | 'explain' | null;

export function AIAssistant({ isOpen, onClose, stockSymbol, stockName }: AIAssistantProps) {
  const [mode, setMode] = useState<AnalysisMode>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [customQuestion, setCustomQuestion] = useState('');

  const handleModeSelect = async (selectedMode: AnalysisMode) => {
    setMode(selectedMode);
    setIsAnalyzing(true);
    
    // 模拟AI分析（未来将连接真实AI接口）
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const mockResults = {
      short_update: {
        summary: `${stockName || '该股'}今日涨幅适中，技术面显示多头排列。`,
        suggestion: '可以考虑持有，关注成交量变化。',
        risk: '注意大盘整体走势，建议设置止损位。'
      },
      buy_sell: {
        summary: `${stockName || '该股'}目前处于上升通道，MACD金叉。`,
        suggestion: '建议分批建仓，入场价位建议在回调时介入。',
        risk: '市场波动较大，建议控制仓位在30%以内。'
      },
      explain: {
        summary: `${stockName || '该股'}属于行业龙头，基本面良好。`,
        suggestion: '适合中长期持有，短期可能有波动。',
        risk: '关注行业政策变化和公司公告。'
      }
    };
    
    setAnalysisResult(mockResults[selectedMode!]);
    setIsAnalyzing(false);
  };

  const handleCustomQuestion = async () => {
    if (!customQuestion.trim()) return;
    
    setIsAnalyzing(true);
    setMode('explain');
    
    // 模拟AI回答
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setAnalysisResult({
      summary: `关于"${customQuestion}"的分析：这是一个很好的问题。`,
      suggestion: '建议结合个人风险承受能力做决策。',
      risk: '投资有风险，建议咨询专业人士。'
    });
    
    setIsAnalyzing(false);
    setCustomQuestion('');
  };

  const reset = () => {
    setMode(null);
    setAnalysisResult(null);
    setCustomQuestion('');
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
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h2 className="text-xl">AI 投资助手</h2>
                {stockSymbol && (
                  <p className="text-sm text-muted-foreground">
                    {stockName} ({stockSymbol})
                  </p>
                )}
              </div>
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
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {!mode && !analysisResult && (
              <div className="space-y-4">
                <p className="text-muted-foreground text-center mb-6">
                  我能帮您分析什么？
                </p>
                
                <div className="grid gap-3">
                  <Button
                    onClick={() => handleModeSelect('short_update')}
                    className="h-auto py-4 px-5 flex items-start gap-4 bg-card hover:bg-accent border border-border ios-button-press"
                    variant="outline"
                  >
                    <TrendingUp className="w-6 h-6 text-primary shrink-0 mt-1" />
                    <div className="text-left">
                      <div className="font-medium mb-1">今日行情分析</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        查看今日走势和技术指标分析
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleModeSelect('buy_sell')}
                    className="h-auto py-4 px-5 flex items-start gap-4 bg-card hover:bg-accent border border-border ios-button-press"
                    variant="outline"
                  >
                    <TrendingDown className="w-6 h-6 text-destructive shrink-0 mt-1" />
                    <div className="text-left">
                      <div className="font-medium mb-1">买卖建议</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        获取入场价位和止损建议
                      </div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleModeSelect('explain')}
                    className="h-auto py-4 px-5 flex items-start gap-4 bg-card hover:bg-accent border border-border ios-button-press"
                    variant="outline"
                  >
                    <AlertCircle className="w-6 h-6 text-chart-3 shrink-0 mt-1" />
                    <div className="text-left">
                      <div className="font-medium mb-1">基本面分析</div>
                      <div className="text-sm text-muted-foreground font-normal">
                        了解公司基本情况和投资价值
                      </div>
                    </div>
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-3">
                    或者直接提问：
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="例如：这只股票适合长期持有吗？"
                      value={customQuestion}
                      onChange={(e) => setCustomQuestion(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleCustomQuestion()}
                      className="flex-1 px-4 py-3 rounded-xl border border-border bg-input-background focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <Button
                      onClick={handleCustomQuestion}
                      disabled={!customQuestion.trim()}
                      className="rounded-xl ios-button-press"
                      size="icon"
                    >
                      <Send className="w-5 h-5" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-12">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  className="w-16 h-16 rounded-full border-4 border-primary/20 border-t-primary mb-4"
                />
                <p className="text-muted-foreground">AI 正在分析中...</p>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="bg-primary/5 rounded-2xl p-5 border border-primary/10">
                  <h3 className="font-medium mb-2 text-primary">📊 分析摘要</h3>
                  <p className="text-foreground leading-relaxed">{analysisResult.summary}</p>
                </div>

                <div className="bg-success/5 rounded-2xl p-5 border border-success/10">
                  <h3 className="font-medium mb-2" style={{ color: 'var(--success)' }}>💡 操作建议</h3>
                  <p className="text-foreground leading-relaxed">{analysisResult.suggestion}</p>
                </div>

                <div className="bg-destructive/5 rounded-2xl p-5 border border-destructive/10">
                  <h3 className="font-medium mb-2 text-destructive">⚠️ 风险提示</h3>
                  <p className="text-foreground leading-relaxed">{analysisResult.risk}</p>
                </div>

                <div className="pt-4 flex gap-3">
                  <Button
                    onClick={reset}
                    variant="outline"
                    className="flex-1 rounded-xl ios-button-press"
                  >
                    继续提问
                  </Button>
                  <Button
                    onClick={onClose}
                    className="flex-1 rounded-xl ios-button-press"
                  >
                    完成
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground text-center pt-2">
                  *以上内容仅供参考，不构成投资建议
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
