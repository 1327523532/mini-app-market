#!/bin/bash
echo "🚀 启动 Mini-Application 服务器..."
cd "$(dirname "$0")"
python3 -m http.server 8080 &
echo "✅ 服务器已启动: http://localhost:8080"
echo "📱 手机访问: http://$(hostname -I | awk '{print $1}'):8080"
