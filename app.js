// Mini-Application 主逻辑 v0.4

// ==================== 工具函数 ====================

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 格式化日期
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

// HTML转义
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 获取应用类型图标
function getAppIcon(type) {
    const icons = {
        tool: '🛠️',
        game: '🎮',
        utility: '📝',
        other: '📦'
    };
    return icons[type] || '📦';
}

// 获取应用类型名称
function getTypeName(type) {
    const names = {
        tool: '🛠️ 工具',
        game: '🎮 游戏',
        utility: '📝 效率',
        other: '📦 其他'
    };
    return names[type] || '📦 其他';
}

// ==================== 数据存储 ====================

// 应用数据存储
class AppStorage {
    constructor() {
        this.storageKey = 'mini_apps';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            this.save({ applications: [] });
        }
    }

    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { applications: [] };
        } catch (e) {
            console.error('读取应用数据失败:', e);
            return { applications: [] };
        }
    }

    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('保存应用数据失败:', e);
        }
    }

    getById(id) {
        const data = this.getAll();
        return data.applications.find(a => a.id === id);
    }

    add(app) {
        const data = this.getAll();
        app.id = generateId();
        app.createdAt = new Date().toISOString();
        app.updatedAt = app.createdAt;
        app.views = 0;
        app.likes = 0;
        data.applications.unshift(app);
        this.save(data);
        return app;
    }

    update(id, updates) {
        const data = this.getAll();
        const index = data.applications.findIndex(a => a.id === id);
        if (index !== -1) {
            data.applications[index] = {
                ...data.applications[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.save(data);
            return data.applications[index];
        }
        return null;
    }

    delete(id) {
        const data = this.getAll();
        data.applications = data.applications.filter(a => a.id !== id);
        this.save(data);
    }

    search(keyword, type = 'all') {
        const data = this.getAll();
        let results = data.applications;

        // 关键词搜索
        if (keyword && keyword.trim()) {
            const kw = keyword.toLowerCase();
            results = results.filter(a => 
                a.name.toLowerCase().includes(kw) ||
                a.description.toLowerCase().includes(kw) ||
                (a.tags && a.tags.some(t => t.toLowerCase().includes(kw)))
            );
        }

        // 类型筛选
        if (type && type !== 'all') {
            results = results.filter(a => a.type === type);
        }

        return results;
    }
}

// ==================== 需求数据存储 ====================

class DemandStorage {
    constructor() {
        this.storageKey = 'mini_demands';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            this.save({ demands: [] });
        }
    }

    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { demands: [] };
        } catch (e) {
            return { demands: [] };
        }
    }

    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('保存需求数据失败:', e);
        }
    }

    add(demand) {
        const data = this.getAll();
        demand.id = generateId();
        demand.createdAt = new Date().toISOString();
        data.demands.unshift(demand);
        this.save(data);
        return demand;
    }

    delete(id) {
        const data = this.getAll();
        data.demands = data.demands.filter(d => d.id !== id);
        this.save(data);
    }
}

// ==================== 文章数据存储 ====================

class ArticleStorage {
    constructor() {
        this.storageKey = 'mini_articles';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            this.save({ articles: [] });
        }
    }

    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { articles: [] };
        } catch (e) {
            return { articles: [] };
        }
    }

    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('保存文章数据失败:', e);
        }
    }

    add(article) {
        const data = this.getAll();
        article.id = generateId();
        article.createdAt = new Date().toISOString();
        article.views = 0;
        data.articles.unshift(article);
        this.save(data);
        return article;
    }

    delete(id) {
        const data = this.getAll();
        data.articles = data.articles.filter(a => a.id !== id);
        this.save(data);
    }
}

// ==================== 导出实例 ====================

const appStorage = new AppStorage();
const demandStorage = new DemandStorage();
const articleStorage = new ArticleStorage();

// 全局暴露
window.generateId = generateId;
window.formatDate = formatDate;
window.escapeHtml = escapeHtml;
window.getAppIcon = getAppIcon;
window.getTypeName = getTypeName;
window.appStorage = appStorage;
window.demandStorage = demandStorage;
window.articleStorage = articleStorage;

// ==================== 用户系统 v0.5 ====================

class UserStorage {
    constructor() {
        this.storageKey = 'mini_users';
        this.tokenKey = 'mini_token';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            this.save({ users: [] });
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

    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('保存用户数据失败:', e);
        }
    }

    // 注册
    register(username, email, password) {
        const data = this.getAll();
        
        // 检查邮箱是否已存在
        if (data.users.some(u => u.email === email)) {
            return { success: false, message: '邮箱已被注册' };
        }
        
        // 检查用户名
        if (data.users.some(u => u.username === username)) {
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
        const token = this.generateToken(user);
        this.setToken(token, user.id);
        
        return { success: true, user: this.sanitizeUser(user), token };
    }

    // 登录
    login(email, password) {
        const data = this.getAll();
        const user = data.users.find(u => u.email === email.toLowerCase());
        
        if (!user) {
            return { success: false, message: '用户不存在' };
        }
        
        if (user.password !== this.hashPassword(password)) {
            return { success: false, message: '密码错误' };
        }
        
        const token = this.generateToken(user);
        this.setToken(token, user.id);
        
        return { success: true, user: this.sanitizeUser(user), token };
    }

    // 登出
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem('mini_userId');
    }

    // 获取当前用户
    getCurrentUser() {
        const token = this.getToken();
        const userId = this.getUserId();
        
        if (!token || !userId) return null;
        
        // 验证 token
        if (!this.verifyToken(token, userId)) {
            this.logout();
            return null;
        }
        
        const data = this.getAll();
        return data.users.find(u => u.id === userId);
    }

    // 更新用户信息
    updateProfile(updates) {
        const userId = this.getUserId();
        const data = this.getAll();
        const index = data.users.findIndex(u => u.id === userId);
        
        if (index !== -1) {
            data.users[index] = {
                ...data.users[index],
                ...updates,
                updatedAt: new Date().toISOString()
            };
            this.save(data);
            return { success: true, user: this.sanitizeUser(data.users[index]) };
        }
        
        return { success: false, message: '用户不存在' };
    }

    // 获取用户信息
    getUserProfile(userId) {
        const data = this.getAll();
        const user = data.users.find(u => u.id === userId);
        if (!user) return null;
        
        // 返回公开信息
        return {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio,
            createdAt: user.createdAt
        };
    }

    // 工具方法
    hashPassword(password) {
        // 简单哈希，实际项目应使用 bcrypt
        return btoa(password + '_mini_app_salt');
    }

    generateToken(user) {
        return btoa(JSON.stringify({
            userId: user.id,
            exp: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7天过期
        }));
    }

    verifyToken(token, userId) {
        try {
            const data = JSON.parse(atob(token));
            return data.userId === userId && data.exp > Date.now();
        } catch (e) {
            return false;
        }
    }

    setToken(token, userId) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem('mini_userId', userId);
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    getUserId() {
        return localStorage.getItem('mini_userId');
    }

    sanitizeUser(user) {
        const { password, ...sanitized } = user;
        return sanitized;
    }
}

// 导出实例
const userStorage = new UserStorage();
window.userStorage = userStorage;

// ==================== 收藏/点赞系统 v0.6 ====================

class InteractionStorage {
    constructor() {
        this.storageKey = 'mini_interactions';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            this.save({
                favorites: [],  // 收藏
                likes: [],      // 点赞
                views: []       // 浏览记录
            });
        }
    }

    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('保存互动数据失败:', e);
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

    // 收藏应用
    toggleFavorite(userId, appId) {
        const data = this.getAll();
        const index = data.favorites.findIndex(f => f.userId === userId && f.appId === appId);
        
        if (index !== -1) {
            data.favorites.splice(index, 1);
            this.save(data);
            return { success: true, favorited: false };
        } else {
            data.favorites.push({
                userId: userId,
                appId: appId,
                createdAt: new Date().toISOString()
            });
            this.save(data);
            return { success: true, favorited: true };
        }
    }

    // 检查是否已收藏
    isFavorited(userId, appId) {
        const data = this.getAll();
        return data.favorites.some(f => f.userId === userId && f.appId === appId);
    }

    // 获取用户收藏列表
    getUserFavorites(userId) {
        const data = this.getAll();
        return data.favorites.filter(f => f.userId === userId).map(f => f.appId);
    }

    // 点赞应用
    toggleLike(appId) {
        const data = this.getAll();
        const index = data.likes.findIndex(l => l.appId === appId);
        
        if (index !== -1) {
            data.likes.splice(index, 1);
            this.save(data);
            return { success: true, liked: false, count: data.likes.filter(l => l.appId === appId).length };
        } else {
            data.likes.push({
                appId: appId,
                createdAt: new Date().toISOString()
            });
            this.save(data);
            return { success: true, liked: true, count: data.likes.filter(l => l.appId === appId).length + 1 };
        }
    }

    // 获取应用点赞数
    getLikesCount(appId) {
        const data = this.getAll();
        return data.likes.filter(l => l.appId === appId).length;
    }

    // 记录浏览
    recordView(userId, appId) {
        const data = this.getAll();
        data.views.push({
            userId: userId,
            appId: appId,
            createdAt: new Date().toISOString()
        });
        this.save(data);
    }

    // 获取应用浏览量
    getViewsCount(appId) {
        const data = this.getAll();
        return data.views.filter(v => v.appId === appId).length;
    }
}

// 导出实例
const interactionStorage = new InteractionStorage();
window.interactionStorage = interactionStorage;
