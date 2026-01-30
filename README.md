# 🚀 Mini-Application 微应用市场

> 让好工具被发现，让好经验被分享，让需求被精准对接

## 💡 项目愿景

Mini-Application 是一个微应用市场平台，让每个人都能：
- 🔍 **发现** 优质工具和应用
- 📚 **分享** 自己的经验和作品
- 🤝 **对接** 用户需求与服务提供者
- 🏠 **托管** 自己的微应用

## ✨ 核心功能

### 1️⃣ 应用市场
- 📋 应用列表展示（卡片形式）
- 🔍 搜索和筛选
- 🏷️ 分类浏览（工具、游戏、效率、其他）
- ⭐ 热门推荐
- 📈 最新发布

### 2️⃣ 应用托管
- 📤 发布自己的应用
- 🔧 编辑和管理应用
- 🗑️ 删除应用
- 📊 使用数据分析

### 3️⃣ 需求广场
- 💬 发布需求
- 🤝 匹配服务者
- ✅ 需求完成

### 4️⃣ 经验分享
- 📝 技术文章
- 💡 经验教程
- 🎓 最佳实践

## 📁 项目结构

```
mini-application/
├── index.html          # 首页（应用市场）
├── create.html         # 创建/编辑应用
├── app.html            # 应用详情页
├── demands.html        # 需求广场
├── articles.html       # 经验分享
├── profile.html        # 用户主页
├── style.css           # 统一样式
├── app.js              # 主逻辑
├── apps.json           # 应用数据
├── demands.json        # 需求数据
└── README.md           # 项目说明
```

## 🚀 快速开始

```bash
cd /root/clawd/code_space/mini-application
python3 -m http.server 8080
# 访问 http://localhost:8080
```

## 🎯 使用场景

- 🔧 **工具开发者**：发布自己的小工具，被更多人发现
- 📝 **内容创作者**：分享技术经验和最佳实践
- 💼 **需求方**：发布需求，找到合适的服务者
- 🤝 **服务方**：承接需求，用技能帮助他人

## 🔧 技术栈

- 纯 HTML/CSS/JavaScript
- 无需后端（数据存储在 JSON 文件）
- 支持任意静态服务器部署
- 未来可扩展为完整后端

## 📝 数据格式

### 应用配置
```json
{
  "id": "unique-id",
  "name": "应用名称",
  "description": "一句话描述",
  "type": "tool|game|utility|other",
  "tags": ["标签1", "标签2"],
  "author": "作者名",
  "code": "应用代码",
  "views": 100,
  "likes": 10,
  "createdAt": "2026-01-29T23:00:00Z"
}
```

### 需求配置
```json
{
  "id": "unique-id",
  "title": "需求标题",
  "description": "详细描述",
  "budget": "预算范围",
  "status": "open|in-progress|completed",
  "author": "发布者",
  "createdAt": "2026-01-29T23:00:00Z"
}
```

---

**让每个人都能创造、分享、发现价值！** 🎉
