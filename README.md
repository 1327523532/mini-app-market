# 🚀 Mini-Application 微应用市场

> 让好工具被发现，让好经验被分享，让需求被精准对接

## 📁 项目结构

```
mini-application/
├── index.html          # 入口文件
├── README.md           # 项目说明
├── src/                # 源代码
│   ├── main.js         # 入口
│   ├── pages/          # 页面模块
│   │   ├── index/      # 首页
│   │   ├── app/        # 应用详情
│   │   ├── create/     # 创建应用
│   │   ├── demands/    # 需求广场
│   │   ├── articles/   # 经验分享
│   │   ├── profile/    # 用户主页
│   │   ├── login/      # 登录页
│   │   └── stats/      # 统计页
│   ├── components/     # 公共组件
│   ├── services/       # 业务逻辑
│   ├── utils/          # 工具函数
│   └── styles/         # 样式文件
├── data/               # 数据文件
│   ├── apps.json       # 应用数据
│   ├── ai-apps.json    # AI应用
│   ├── articles.json   # 文章数据
│   └── demands.json    # 需求数据
└── docs/               # 文档
    └── REFACTORING_REPORT.md
```

## ✨ 核心功能

1. **应用市场** - 发现优质工具和应用
2. **应用托管** - 发布和管理自己的应用
3. **需求广场** - 发布和匹配需求
4. **经验分享** - 技术文章和教程

## 🚀 快速开始

```bash
cd /root/clawd/code_space/mini-application
python3 -m http.server 8080
# 访问 http://localhost:8080
```

## 🔧 技术栈

- 纯 HTML/CSS/JavaScript (ES6+)
- 模块化开发 (ES Modules)
- localStorage 数据持久化
- 静态服务器部署

## 📝 数据格式

```json
{
  "id": "unique-id",
  "name": "应用名称",
  "description": "一句话描述",
  "type": "tool|game|utility|other",
  "tags": ["标签1", "标签2"],
  "code": "应用代码",
  "views": 100,
  "likes": 10,
  "createdAt": "2026-01-29T23:00:00Z"
}
```

## 🤖 AI应用

- AI密码生成器
- AI文本摘要
- AI情感分析
- AI关键词提取
- AI语言转换
