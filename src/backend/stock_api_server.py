"""
股票数据API服务器
使用Tushare Pro接口获取A股实时数据
运行方式: python stock_api_server.py
"""

from flask import Flask, jsonify, request
from flask_cors import CORS
import tushare as ts
from datetime import datetime
import time

app = Flask(__name__)
CORS(app)  # 允许跨域请求

# 设置Tushare Token
TUSHARE_TOKEN = '42a14c557055123e9464f371c4c9ae4a12f1a864e5a47ea4433d7e34'
ts.set_token(TUSHARE_TOKEN)
pro = ts.pro_api()

# 缓存，避免频繁请求
cache = {}
CACHE_DURATION = 60  # 缓存60秒


def get_cache(key):
    """获取缓存数据"""
    if key in cache:
        data, timestamp = cache[key]
        if time.time() - timestamp < CACHE_DURATION:
            return data
    return None


def set_cache(key, data):
    """设置缓存"""
    cache[key] = (data, time.time())


def convert_ts_code(symbol):
    """
    转换股票代码格式
    600519.SH -> 600519.SH (Tushare格式)
    000001.SZ -> 000001.SZ (Tushare格式)
    """
    return symbol


def convert_to_frontend_format(ts_code):
    """
    转换Tushare代码为前端格式
    600519.SH -> 600519.SH
    000001.SZ -> 000001.SZ
    """
    return ts_code


@app.route('/api/stock/search', methods=['GET'])
def search_stocks():
    """
    搜索股票
    参数: q - 搜索关键词（股票代码或名称）
    """
    try:
        query = request.args.get('q', '').strip()
        if not query:
            return jsonify({'results': []})

        # 检查缓存
        cache_key = f'search_{query}'
        cached_data = get_cache(cache_key)
        if cached_data:
            return jsonify({'results': cached_data})

        # 获取所有A股列表
        stock_list = pro.stock_basic(
            exchange='',
            list_status='L',
            fields='ts_code,symbol,name,area,industry,market,list_date'
        )

        # 搜索匹配的股票
        query_lower = query.lower()
        matched = stock_list[
            stock_list['name'].str.contains(query, na=False) |
            stock_list['symbol'].str.contains(query, na=False) |
            stock_list['ts_code'].str.lower().str.contains(query_lower, na=False)
        ]

        # 限制返回30条结果
        matched = matched.head(30)

        # 获取实时行情（批量）
        results = []
        if not matched.empty:
            ts_codes = matched['ts_code'].tolist()
            
            # 获取今日行情
            today = datetime.now().strftime('%Y%m%d')
            try:
                daily_data = pro.daily(trade_date=today, fields='ts_code,close,pre_close,change,pct_chg')
                daily_dict = daily_data.set_index('ts_code').to_dict('index')
            except:
                daily_dict = {}

            for _, row in matched.iterrows():
                ts_code = row['ts_code']
                symbol = convert_to_frontend_format(ts_code)
                
                # 获取价格数据
                if ts_code in daily_dict:
                    price_data = daily_dict[ts_code]
                    price = float(price_data.get('close', 0))
                    change = float(price_data.get('change', 0))
                    change_percent = float(price_data.get('pct_chg', 0))
                else:
                    # 如果没有今日数据，获取最近一个交易日
                    try:
                        recent = pro.daily(ts_code=ts_code, limit=1)
                        if not recent.empty:
                            price = float(recent.iloc[0]['close'])
                            change = float(recent.iloc[0]['change'])
                            change_percent = float(recent.iloc[0]['pct_chg'])
                        else:
                            price = 0
                            change = 0
                            change_percent = 0
                    except:
                        price = 0
                        change = 0
                        change_percent = 0

                results.append({
                    'symbol': symbol,
                    'name': row['name'],
                    'price': price,
                    'change': change,
                    'changePercent': change_percent,
                    'industry': row.get('industry', ''),
                    'market': row.get('market', '')
                })

        # 缓存结果
        set_cache(cache_key, results)
        
        return jsonify({'results': results})

    except Exception as e:
        print(f"搜索错误: {str(e)}")
        return jsonify({'error': str(e), 'results': []}), 500


@app.route('/api/stock/quote', methods=['GET'])
def get_stock_quote():
    """
    获取单只股票的详细行情
    参数: symbol - 股票代码（如 600519.SH）
    """
    try:
        symbol = request.args.get('symbol', '')
        if not symbol:
            return jsonify({'error': '缺少股票代码'}), 400

        # 检查缓存
        cache_key = f'quote_{symbol}'
        cached_data = get_cache(cache_key)
        if cached_data:
            return jsonify(cached_data)

        ts_code = convert_ts_code(symbol)

        # 获取基本信息
        basic_info = pro.stock_basic(ts_code=ts_code, fields='ts_code,name,industry,market,list_date')
        if basic_info.empty:
            return jsonify({'error': '股票不存在'}), 404

        # 获取最新交易日数据
        daily_data = pro.daily(ts_code=ts_code, limit=1)
        if daily_data.empty:
            return jsonify({'error': '暂无行情数据'}), 404

        # 获取基本面数据
        try:
            basic_data = pro.daily_basic(ts_code=ts_code, limit=1, fields='pe,pb,total_mv,circ_mv')
        except:
            basic_data = None

        # 组装数据
        info = basic_info.iloc[0]
        daily = daily_data.iloc[0]

        result = {
            'symbol': convert_to_frontend_format(ts_code),
            'name': info['name'],
            'price': float(daily['close']),
            'open': float(daily['open']),
            'high': float(daily['high']),
            'low': float(daily['low']),
            'close': float(daily['close']),
            'preClose': float(daily['pre_close']),
            'change': float(daily['change']),
            'changePercent': float(daily['pct_chg']),
            'volume': f"{float(daily['vol']):.2f}万手",
            'amount': float(daily['amount']),
            'industry': info.get('industry', ''),
            'market': info.get('market', ''),
        }

        # 添加基本面数据
        if basic_data is not None and not basic_data.empty:
            basic = basic_data.iloc[0]
            result['pe'] = float(basic.get('pe', 0)) if basic.get('pe') else 0
            result['pb'] = float(basic.get('pb', 0)) if basic.get('pb') else 0
            result['marketCap'] = f"{float(basic.get('total_mv', 0)) / 10000:.2f}亿" if basic.get('total_mv') else "0"
        else:
            result['pe'] = 0
            result['pb'] = 0
            result['marketCap'] = "0"

        # 缓存结果
        set_cache(cache_key, result)

        return jsonify(result)

    except Exception as e:
        print(f"获取行情错误: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/stock/batch', methods=['GET'])
def get_batch_quotes():
    """
    批量获取股票行情
    参数: symbols - 股票代码列表，逗号分隔（如 600519.SH,000001.SZ）
    """
    try:
        symbols_str = request.args.get('symbols', '')
        if not symbols_str:
            return jsonify([])

        symbols = symbols_str.split(',')
        results = []

        today = datetime.now().strftime('%Y%m%d')
        
        for symbol in symbols[:20]:  # 限制最多20只
            try:
                ts_code = convert_ts_code(symbol.strip())
                
                # 获取最新交易日数据
                daily_data = pro.daily(ts_code=ts_code, limit=1)
                if daily_data.empty:
                    continue

                daily = daily_data.iloc[0]
                
                results.append({
                    'symbol': convert_to_frontend_format(ts_code),
                    'price': float(daily['close']),
                    'change': float(daily['change']),
                    'changePercent': float(daily['pct_chg']),
                })
            except Exception as e:
                print(f"获取{symbol}行情失败: {str(e)}")
                continue

        return jsonify(results)

    except Exception as e:
        print(f"批量获取错误: {str(e)}")
        return jsonify({'error': str(e)}), 500


@app.route('/api/health', methods=['GET'])
def health_check():
    """健康检查"""
    return jsonify({
        'status': 'ok',
        'service': 'Stock API Server',
        'tushare': 'connected',
        'timestamp': datetime.now().isoformat()
    })


@app.route('/', methods=['GET'])
def index():
    """首页"""
    return """
    <html>
    <head><title>股票API服务器</title></head>
    <body style="font-family: Arial; padding: 20px;">
        <h1>📈 股票数据API服务器</h1>
        <p>服务状态: <strong style="color: green;">运行中</strong></p>
        <h2>可用接口:</h2>
        <ul>
            <li><code>GET /api/stock/search?q=关键词</code> - 搜索股票</li>
            <li><code>GET /api/stock/quote?symbol=600519.SH</code> - 获取股票行情</li>
            <li><code>GET /api/stock/batch?symbols=600519.SH,000001.SZ</code> - 批量获取行情</li>
            <li><code>GET /api/health</code> - 健康检查</li>
        </ul>
        <h2>示例:</h2>
        <ul>
            <li><a href="/api/stock/search?q=茅台">/api/stock/search?q=茅台</a></li>
            <li><a href="/api/stock/quote?symbol=600519.SH">/api/stock/quote?symbol=600519.SH</a></li>
            <li><a href="/api/health">/api/health</a></li>
        </ul>
    </body>
    </html>
    """


if __name__ == '__main__':
    print("=" * 60)
    print("🚀 股票数据API服务器启动中...")
    print("=" * 60)
    print(f"📊 Tushare Token: {TUSHARE_TOKEN[:20]}...")
    print(f"🌐 服务地址: http://localhost:3001")
    print(f"📝 API文档: http://localhost:3001")
    print("=" * 60)
    print("按 Ctrl+C 停止服务")
    print("=" * 60)
    
    app.run(host='0.0.0.0', port=3001, debug=False)
