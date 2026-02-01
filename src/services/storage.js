/**
 * 数据存储服务
 * 统一管理所有本地存储操作
 */

import { generateId, formatDate } from '../utils/helpers.js';

// 存储键常量
const STORAGE_KEYS = {
  APPS: 'mini_apps',
  DEMANDS: 'mini_demands',
  ARTICLES: 'mini_articles',
  USERS: 'mini_users',
  TOKEN: 'mini_token',
  USER_ID: 'mini_userId',
  INTERACTIONS: 'mini_interactions'
};

// 存储版本
const STORAGE_VERSION = '1.0';

/**
 * 基础存储类
 */
class BaseStorage {
  constructor(storageKey) {
    this.storageKey = storageKey;
  }

  init() {
    try {
      if (!localStorage.getItem(this.storageKey)) {
        this.save({ version: STORAGE_VERSION, data: [] });
      }
    } catch (e) {
      console.error(`初始化存储失败: ${this.storageKey}`, e);
    }
  }

  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : { version: STORAGE_VERSION, data: [] };
    } catch (e) {
      console.error(`读取数据失败: ${this.storageKey}`, e);
      return { version: STORAGE_VERSION, data: [] };
    }
  }

  save(data) {
    try {
      const toSave = {
        ...data,
        version: STORAGE_VERSION,
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(this.storageKey, JSON.stringify(toSave, null, 2));
      return true;
    } catch (e) {
      console.error(`保存数据失败: ${this.storageKey}`, e);
      return false;
    }
  }

  add(item) {
    const data = this.getAll();
    const newItem = {
      ...item,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.data.unshift(newItem);
    this.save(data);
    return newItem;
  }

  update(id, updates) {
    const data = this.getAll();
    const index = data.data.findIndex(item => item.id === id);
    if (index === -1) return null;

    data.data[index] = {
      ...data.data[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    this.save(data);
    return data.data[index];
  }

  delete(id) {
    const data = this.getAll();
    data.data = data.data.filter(item => item.id !== id);
    this.save(data);
  }

  getById(id) {
    const data = this.getAll();
    return data.data.find(item => item.id === id) || null;
  }

  search(criteria) {
    const data = this.getAll();
    let results = [...data.data];

    if (criteria.keyword) {
      const kw = criteria.keyword.toLowerCase();
      results = results.filter(item =>
        (item.name && item.name.toLowerCase().includes(kw)) ||
        (item.description && item.description.toLowerCase().includes(kw)) ||
        (item.title && item.title.toLowerCase().includes(kw))
      );
    }

    if (criteria.type && criteria.type !== 'all') {
      results = results.filter(item => item.type === criteria.type);
    }

    // 标签筛选
    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter(item => {
        if (!item.tags || !Array.isArray(item.tags)) return false;
        // 包含任一标签
        if (criteria.matchType === 'any') {
          return criteria.tags.some(tag => item.tags.includes(tag));
        }
        // 包含所有标签
        return criteria.tags.every(tag => item.tags.includes(tag));
      });
    }

    return results;
  }

  /**
   * 获取所有标签
   */
  getAllTags() {
    const data = this.getAll();
    const tagsSet = new Set();
    data.data.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => tagsSet.add(tag));
      }
    });
    return Array.from(tagsSet).sort();
  }

  /**
   * 按标签获取应用
   */
  getByTag(tag, limit = 20) {
    const data = this.getAll();
    const results = data.data.filter(item =>
      item.tags && Array.isArray(item.tags) && item.tags.includes(tag)
    );
    return results.slice(0, limit);
  }

  /**
   * 获取带统计的标签列表
   */
  getTagsWithCount() {
    const data = this.getAll();
    const tagCount = {};
    data.data.forEach(item => {
      if (item.tags && Array.isArray(item.tags)) {
        item.tags.forEach(tag => {
          tagCount[tag] = (tagCount[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(tagCount)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count);
  }
}

/**
 * 应用存储
 */
class AppStorage extends BaseStorage {
  constructor() {
    super(STORAGE_KEYS.APPS);
  }

  add(app) {
    const newApp = {
      ...app,
      views: 0,
      likes: 0
    };
    return super.add(newApp);
  }

  incrementView(id) {
    return this.update(id, {
      views: (this.getById(id)?.views || 0) + 1
    });
  }

  getHotApps(limit = 10) {
    const data = this.getAll();
    return [...data.data]
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  }

  getRecentApps(limit = 10) {
    const data = this.getAll();
    return [...data.data]
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, limit);
  }
}

/**
 * 需求存储
 */
class DemandStorage extends BaseStorage {
  constructor() {
    super(STORAGE_KEYS.DEMANDS);
  }
}

/**
 * 文章存储
 */
class ArticleStorage extends BaseStorage {
  constructor() {
    super(STORAGE_KEYS.ARTICLES);
  }
}

/**
 * 用户存储
 */
class UserStorage {
  constructor() {
    this.storageKey = STORAGE_KEYS.USERS;
    this.tokenKey = STORAGE_KEYS.TOKEN;
    this.userIdKey = STORAGE_KEYS.USER_ID;
    this.init();
  }

  init() {
    try {
      if (!localStorage.getItem(this.storageKey)) {
        this.save({ users: [] });
      }
    } catch (e) {
      console.error('用户存储初始化失败', e);
    }
  }

  save(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('保存用户数据失败', e);
    }
  }

  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : { users: [] };
    } catch (e) {
      return { users: [] };
    }
  }

  // 密码哈希（简化版）
  hashPassword(password) {
    return btoa(password + '_v1');
  }

  verifyPassword(password, hashedPassword) {
    return this.hashPassword(password) === hashedPassword;
  }

  register(username, email, password) {
    const data = this.getAll();
    
    if (data.users.some(u => u.email === email.toLowerCase())) {
      return { success: false, message: '邮箱已被注册' };
    }
    if (data.users.some(u => u.username === username.trim())) {
      return { success: false, message: '用户名已被占用' };
    }

    const user = {
      id: generateId(),
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: this.hashPassword(password),
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${username}`,
      bio: '',
      createdAt: new Date().toISOString()
    };

    data.users.push(user);
    this.save(data);
    
    // 自动登录
    this.setToken(user.id);
    
    return { success: true, user: this.sanitizeUser(user) };
  }

  login(email, password) {
    const data = this.getAll();
    const user = data.users.find(u => u.email === email.toLowerCase());
    
    if (!user) {
      return { success: false, message: '用户不存在' };
    }
    if (!this.verifyPassword(password, user.password)) {
      return { success: false, message: '密码错误' };
    }

    this.setToken(user.id);
    return { success: true, user: this.sanitizeUser(user) };
  }

  logout() {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userIdKey);
  }

  getCurrentUser() {
    const userId = localStorage.getItem(this.userIdKey);
    if (!userId) return null;

    const data = this.getAll();
    return data.users.find(u => u.id === userId) || null;
  }

  setToken(userId) {
    localStorage.setItem(this.tokenKey, 'logged_in');
    localStorage.setItem(this.userIdKey, userId);
  }

  sanitizeUser(user) {
    const { password, ...sanitized } = user;
    return sanitized;
  }
}

/**
 * 互动存储
 */
class InteractionStorage {
  constructor() {
    this.storageKey = STORAGE_KEYS.INTERACTIONS;
    this.init();
  }

  init() {
    if (!localStorage.getItem(this.storageKey)) {
      this.save({ favorites: [], likes: [], views: [] });
    }
  }

  save(data) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(data, null, 2));
    } catch (e) {
      console.error('保存互动数据失败', e);
    }
  }

  getAll() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : { favorites: [], likes: [], views: [] };
    } catch (e) {
      return { favorites: [], likes: [], views: [] };
    }
  }

  toggleFavorite(userId, appId) {
    if (!userId) return { success: false, message: '用户未登录' };
    
    const data = this.getAll();
    const index = data.favorites.findIndex(
      f => f.userId === userId && f.appId === appId
    );

    if (index !== -1) {
      data.favorites.splice(index, 1);
      this.save(data);
      return { success: true, favorited: false };
    } else {
      data.favorites.push({
        userId,
        appId,
        createdAt: new Date().toISOString()
      });
      this.save(data);
      return { success: true, favorited: true };
    }
  }

  isFavorited(userId, appId) {
    if (!userId) return false;
    const data = this.getAll();
    return data.favorites.some(f => f.userId === userId && f.appId === appId);
  }

  toggleLike(appId) {
    const data = this.getAll();
    const index = data.likes.findIndex(l => l.appId === appId);

    if (index !== -1) {
      data.likes.splice(index, 1);
    } else {
      data.likes.push({ appId, createdAt: new Date().toISOString() });
    }
    this.save(data);
    return {
      success: true,
      liked: index === -1,
      count: data.likes.filter(l => l.appId === appId).length
    };
  }

  isLiked(appId) {
    const data = this.getAll();
    return data.likes.some(l => l.appId === appId);
  }

  getLikesCount(appId) {
    const data = this.getAll();
    return data.likes.filter(l => l.appId === appId).length;
  }

  recordView(userId, appId) {
    const data = this.getAll();
    data.views.push({
      userId: userId || 'anonymous',
      appId,
      createdAt: new Date().toISOString()
    });
    this.save(data);
  }

  getViewsCount(appId) {
    const data = this.getAll();
    return data.views.filter(v => v.appId === appId).length;
  }
}

// 导出实例
export const appStorage = new AppStorage();
export const demandStorage = new DemandStorage();
export const articleStorage = new ArticleStorage();
export const userStorage = new UserStorage();
export const interactionStorage = new InteractionStorage();
export { STORAGE_KEYS, BaseStorage, AppStorage, DemandStorage, ArticleStorage, UserStorage, InteractionStorage };
