/**
 * 页面渲染器
 * 统一管理所有页面的渲染逻辑
 */

import { renderHeader, updateUserMenu } from '../components/header/index.js';
import { renderFooter } from '../components/footer/index.js';
import { userStorage } from '../services/storage.js';
import { formatDate, formatRelativeTime, escapeHtml, getAppIcon, getTypeName } from '../utils/helpers.js';

/**
 * 页面基类
 */
class Page {
  constructor(options = {}) {
    this.title = options.title || 'Mini-Application';
    this.container = options.container || document.getElementById('app');
  }

  render() {
    this.container.innerHTML = `
      ${renderHeader()}
      <main class="main">
        ${this.renderContent()}
      </main>
      ${renderFooter()}
    `;
    this.afterRender();
  }

  renderContent() {
    return '<div class="page-content"></div>';
  }

  afterRender() {
    this.bindEvents();
    this.updateUserInfo();
  }

  bindEvents() {
    // 子类覆盖
  }

  updateUserInfo() {
    const user = userStorage.getCurrentUser();
    updateUserMenu(user);
  }

  setTitle(title) {
    document.title = `${title} | ${this.title}`;
  }
}

/**
 * 首页
 */
class HomePage extends Page {
  constructor() {
    super({ title: '首页' });
  }

  renderContent() {
    return `
      <div class="hero">
        <h1>发现优质微应用</h1>
        <p>让好工具被发现，让好经验被分享</p>
      </div>
      <div class="container">
        <section class="section">
          <h2>🔥 热门应用</h2>
          <div id="hot-apps" class="app-grid"></div>
        </section>
        <section class="section">
          <h2>🆕 最新发布</h2>
          <div id="recent-apps" class="app-grid"></div>
        </section>
      </div>
    `;
  }

  afterRender() {
    super.afterRender();
    this.loadApps();
  }

  async loadApps() {
    const { appStorage } = await import('../services/storage.js');
    const hotApps = appStorage.getHotApps(6);
    const recentApps = appStorage.getRecentApps(6);

    document.getElementById('hot-apps').innerHTML = this.renderAppCards(hotApps);
    document.getElementById('recent-apps').innerHTML = this.renderAppCards(recentApps);
  }

  renderAppCards(apps) {
    if (!apps || apps.length === 0) {
      return '<div class="empty-state"><p>暂无数据</p></div>';
    }
    return apps.map(app => `
      <div class="app-card" onclick="location.href='app.html?id=${app.id}'">
        <div class="app-icon">${getAppIcon(app.type)}</div>
        <div class="app-info">
          <h3>${escapeHtml(app.name)}</h3>
          <p>${escapeHtml(app.description || '')}</p>
          <div class="app-meta">
            <span>${getTypeName(app.type)}</span>
            <span>👁️ ${app.views || 0}</span>
          </div>
        </div>
      </div>
    `).join('');
  }
}

/**
 * 应用详情页
 */
class AppDetailPage extends Page {
  constructor() {
    super({ title: '应用详情' });
  }

  renderContent() {
    return `
      <div class="container">
        <div id="app-detail" class="app-detail"></div>
      </div>
    `;
  }

  afterRender() {
    super.afterRender();
    this.loadApp();
  }

  async loadApp() {
    const { appStorage, interactionStorage } = await import('../services/storage.js');
    const params = new URLSearchParams(window.location.search);
    const appId = params.get('id');

    if (!appId) {
      document.getElementById('app-detail').innerHTML = '<p>应用不存在</p>';
      return;
    }

    const app = appStorage.getById(appId);
    if (!app) {
      document.getElementById('app-detail').innerHTML = '<p>应用不存在</p>';
      return;
    }

    // 增加浏览量
    appStorage.incrementView(appId);
    interactionStorage.recordView(null, appId);

    const user = userStorage.getCurrentUser();
    const isLiked = true; // 可以添加更多逻辑
    const likesCount = interactionStorage.getLikesCount(appId);

    document.getElementById('app-detail').innerHTML = `
      <div class="app-header">
        <div class="app-icon-large">${getAppIcon(app.type)}</div>
        <div class="app-header-info">
          <h1>${escapeHtml(app.name)}</h1>
          <p class="app-description">${escapeHtml(app.description)}</p>
          <div class="app-tags">
            <span class="tag">${getTypeName(app.type)}</span>
          </div>
          <div class="app-stats">
            <span>👁️ ${app.views || 0}</span>
            <span>❤️ ${likesCount}</span>
          </div>
        </div>
      </div>
      <div class="app-content">
        <h3>应用代码</h3>
        <pre><code>${escapeHtml(app.code || '')}</code></pre>
      </div>
    `;
  }
}

/**
 * 创建应用页
 */
class CreatePage extends Page {
  constructor() {
    super({ title: '发布应用' });
  }

  renderContent() {
    return `
      <div class="container">
        <div class="form-container">
          <h1>发布应用</h1>
          <form id="create-form">
            <div class="form-group">
              <label class="form-label">应用名称 *</label>
              <input type="text" id="app-name" class="form-input" required maxlength="50">
            </div>
            <div class="form-group">
              <label class="form-label">应用类型 *</label>
              <select id="app-type" class="form-input" required>
                <option value="tool">🛠️ 工具</option>
                <option value="game">🎮 游戏</option>
                <option value="utility">📝 效率</option>
                <option value="other">📦 其他</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">应用描述 *</label>
              <textarea id="app-description" class="form-input" required maxlength="200" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label">应用代码</label>
              <textarea id="app-code" class="form-input" rows="10" placeholder="输入应用代码..."></textarea>
            </div>
            <button type="submit" class="btn btn-primary btn-large">发布应用</button>
          </form>
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.getElementById('create-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleSubmit();
    });
  }

  async handleSubmit() {
    const { appStorage, userStorage } = await import('../services/storage.js');

    const user = userStorage.getCurrentUser();
    if (!user) {
      alert('请先登录');
      location.href = 'login.html';
      return;
    }

    const app = {
      name: document.getElementById('app-name').value.trim(),
      type: document.getElementById('app-type').value,
      description: document.getElementById('app-description').value.trim(),
      code: document.getElementById('app-code').value,
      authorId: user.id,
      authorName: user.username
    };

    appStorage.add(app);
    alert('发布成功！');
    location.href = 'index.html';
  }
}

/**
 * 需求广场页
 */
class DemandsPage extends Page {
  constructor() {
    super({ title: '需求广场' });
  }

  renderContent() {
    return `
      <div class="container">
        <div class="page-header">
          <h1>需求广场</h1>
          <a href="#" class="btn btn-primary" id="create-demand-btn">发布需求</a>
        </div>
        <div id="demands-list" class="demands-list"></div>
      </div>
    `;
  }

  afterRender() {
    super.afterRender();
    this.loadDemands();
  }

  async loadDemands() {
    const { demandStorage } = await import('../services/storage.js');
    const demands = demandStorage.search({});

    document.getElementById('demands-list').innerHTML = demands.map(demand => `
      <div class="demand-card">
        <h3>${escapeHtml(demand.title)}</h3>
        <p>${escapeHtml(demand.description)}</p>
        <div class="demand-meta">
          <span>💰 ${escapeHtml(demand.budget || '面议')}</span>
          <span>📅 ${formatRelativeTime(demand.createdAt)}</span>
        </div>
      </div>
    `).join('') || '<div class="empty-state"><p>暂无需求</p></div>';
  }
}

/**
 * 经验分享页
 */
class ArticlesPage extends Page {
  constructor() {
    super({ title: '经验分享' });
  }

  renderContent() {
    return `
      <div class="container">
        <h1>经验分享</h1>
        <div id="articles-list" class="articles-list"></div>
      </div>
    `;
  }

  afterRender() {
    super.afterRender();
    this.loadArticles();
  }

  async loadArticles() {
    const { articleStorage } = await import('../services/storage.js');
    const articles = articleStorage.search({});

    document.getElementById('articles-list').innerHTML = articles.map(article => `
      <div class="article-card">
        <h3>${escapeHtml(article.title)}</h3>
        <p>${escapeHtml(article.content?.substring(0, 100) || '')}...</p>
        <div class="article-meta">
          <span>📅 ${formatRelativeTime(article.createdAt)}</span>
        </div>
      </div>
    `).join('') || '<div class="empty-state"><p>暂无文章</p></div>';
  }
}

/**
 * 用户主页
 */
class ProfilePage extends Page {
  constructor() {
    super({ title: '个人主页' });
  }

  renderContent() {
    return `
      <div class="container">
        <div id="profile-content"></div>
      </div>
    `;
  }

  afterRender() {
    super.afterRender();
    this.loadProfile();
  }

  async loadProfile() {
    const user = userStorage.getCurrentUser();
    const content = document.getElementById('profile-content');

    if (!user) {
      content.innerHTML = '<p>请先 <a href="login.html">登录</a></p>';
      return;
    }

    content.innerHTML = `
      <div class="profile-card">
        <img src="${user.avatar}" alt="${user.username}" class="profile-avatar">
        <h2>${escapeHtml(user.username)}</h2>
        <p>${escapeHtml(user.bio || '暂无简介')}</p>
        <p>📅 加入于 ${formatDate(user.createdAt)}</p>
        <button class="btn btn-outline" onclick="userStorage.logout(); location.reload();">退出登录</button>
      </div>
    `;
  }
}

/**
 * 登录页
 */
class LoginPage extends Page {
  constructor() {
    super({ title: '登录' });
  }

  renderContent() {
    return `
      <div class="container">
        <div class="form-container">
          <h1>登录</h1>
          <form id="login-form">
            <div class="form-group">
              <label class="form-label">邮箱</label>
              <input type="email" id="login-email" class="form-input" required>
            </div>
            <div class="form-group">
              <label class="form-label">密码</label>
              <input type="password" id="login-password" class="form-input" required>
            </div>
            <button type="submit" class="btn btn-primary btn-large">登录</button>
          </form>
          <p style="margin-top: 1rem;">还没有账号？<a href="#" id="show-register">立即注册</a></p>
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.getElementById('login-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });
  }

  async handleLogin() {
    const { userStorage } = await import('../services/storage.js');
    
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const result = userStorage.login(email, password);
    if (result.success) {
      alert('登录成功！');
      location.href = 'index.html';
    } else {
      alert(result.message);
    }
  }
}

// 页面路由
const pages = {
  'index.html': HomePage,
  'app.html': AppDetailPage,
  'create.html': CreatePage,
  'demands.html': DemandsPage,
  'articles.html': ArticlesPage,
  'profile.html': ProfilePage,
  'login.html': LoginPage
};

// 初始化页面
export function initPage() {
  const pageName = location.pathname.split('/').pop() || 'index.html';
  const PageClass = pages[pageName];

  if (PageClass) {
    const page = new PageClass();
    page.render();
  }
}

export { Page, HomePage, AppDetailPage, CreatePage, DemandsPage, ArticlesPage, ProfilePage, LoginPage };
