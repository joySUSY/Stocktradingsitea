/**
 * Vercel Serverless Function - 健康检查
 * 路径: /api/stock/health
 */

module.exports = async (req, res) => {
  // 设置CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.status(200).json({
    status: 'ok',
    service: 'Stock API Server (Vercel)',
    tushare: 'connected',
    timestamp: new Date().toISOString()
  });
};
