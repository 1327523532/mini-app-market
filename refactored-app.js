/**
 * Mini-Application 主逻辑 - 重构版 v1.0
 * 重构目标：
 * 1. 提取 BaseStorage 基类，消除重复代码
 * 2. 增强安全性（密码哈希、XSS 防护）
 * 3. 完善错误处理
 * 4. 改进代码结构和可维护性
 */

// ==================== 常量配置 ====================
const CONFIG = {
    TOKEN_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7天
    SALT_KEY: 'mini_app_salt_v1',
    STORAGE_VERSION: '1.0',
};

// ==================== 工具函数 ====================

/**
 * 生成加密盐值
 */
function getSalt() {
    let salt = localStorage.getItem(CONFIG.SALT_KEY);
    if (!salt) {
        salt = generateId();
        localStorage.setItem(CONFIG.SALT_KEY, salt);
    }
    return salt;
}

/**
 * 生成唯一ID
 */
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 格式化日期
 */
function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * HTML转义 - 防止 XSS 攻击
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * 获取应用类型图标
 */
function getAppIcon(type) {
    const icons = {
        tool: '🛠️',
        game: '🎮',
        utility: '📝',
        other: '📦'
    };
    return icons[type] || '📦';
}

/**
 * 获取应用类型名称
 */
function getTypeName(type) {
    const names = {
        tool: '🛠️ 工具',
        game: '🎮 游戏',
        utility: '📝 效率',
        other: '📦 其他'
    };
    return names[type] || '📦 其他';
}

/**
 * 输入验证
 */
function validateInput(data, rules) {
    const errors = [];
    for (const [field, rule] of Object.entries(rules)) {
        const value = data[field];
        if (rule.required && (!value || value.toString().trim() === '')) {
            errors.push(`${rule.label}不能为空`);
        }
        if (rule.minLength && value && value.length < rule.minLength) {
            errors.push(`${rule.label}至少需要${rule.minLength}个字符`);
        }
        if (rule.maxLength && value && value.length > rule.maxLength) {
            errors.push(`${rule.label}不能超过${rule.maxLength}个字符`);
        }
        if (rule.pattern && value && !rule.pattern.test(value)) {
            errors.push(`${rule.label}格式不正确`);
        }
    }
    return errors;
}

// ==================== 基础存储类 ====================

/**
 * 基础存储类 - 消除重复代码
 */
class BaseStorage {
    constructor(storageKey, schema) {
        this.storageKey = storageKey;
        this.schema = schema;
        this.init();
    }

    /**
     * 初始化存储
     */
    init() {
        try {
            if (!localStorage.getItem(this.storageKey)) {
                this.save({ version: CONFIG.STORAGE_VERSION, data: [] });
            }
        } catch (e) {
            console.error(`初始化存储失败: ${this.storageKey}`, e);
            throw new Error('存储初始化失败，请检查浏览器存储设置');
        }
    }

    /**
     * 获取所有数据
     */
    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            if (!data) return { data: [], version: CONFIG.STORAGE_VERSION };

            const parsed = JSON.parse(data);
            if (parsed.version !== CONFIG.STORAGE_VERSION) {
                return this.migrate(parsed);
            }
            return parsed;
        } catch (e) {
            console.error(`读取数据失败: ${this.storageKey}`, e);
            return { data: [], version: CONFIG.STORAGE_VERSION, error: '数据读取失败' };
        }
    }

    /**
     * 保存数据
     */
    save(data) {
        try {
            const toSave = {
                ...data,
                version: CONFIG.STORAGE_VERSION,
                updatedAt: new Date().toISOString()
            };
            localStorage.setItem(this.storageKey, JSON.stringify(toSave, null, 2));
            return true;
        } catch (e) {
            console.error(`保存数据失败: ${this.storageKey}`, e);
            throw new Error('数据保存失败，可能是存储空间不足');
        }
    }

    /**
     * 数据迁移
     */
    migrate(oldData) {
        console.log(`数据迁移: ${this.storageKey}`);
        // 这里可以添加版本迁移逻辑
        return { data: oldData.data || [], version: CONFIG.STORAGE_VERSION };
    }

    /**
     * 添加数据
     */
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

    /**
     * 更新数据
     */
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

    /**
     * 删除数据
     */
    delete(id) {
        const data = this.getAll();
        data.data = data.data.filter(item => item.id !== id);
        this.save(data);
    }

    /**
     * 根据ID获取数据
     */
    getById(id) {
        const data = this.getAll();
        return data.data.find(item => item.id === id);
    }

    /**
     * 搜索数据
     */
    search(criteria) {
        const data = this.getAll();
        let results = [...data.data];

        if (criteria.keyword) {
            const kw = criteria.keyword.toLowerCase();
            results = results.filter(item =>
                (item.name && item.name.toLowerCase().includes(kw)) ||
                (item.description && item.description.toLowerCase().includes(kw)) ||
                (item.title && item.title.toLowerCase().includes(kw)) ||
                (item.tags && item.tags.some(tag => tag.toLowerCase().includes(kw)))
            );
        }

        if (criteria.type && criteria.type !== 'all') {
            results = results.filter(item => item.type === criteria.type);
        }

        if (criteria.authorId) {
            results = results.filter(item => item.authorId === criteria.authorId);
        }

        return results;
    }

    /**
     * 清空所有数据
     */
    clear() {
        this.save({ data: [] });
    }
}

// ==================== 应用存储 ====================

class AppStorage extends BaseStorage {
    constructor() {
        super('mini_apps', {
            name: { type: 'string', required: true },
            description: { type: 'string', required: true },
            type: { type: 'string', required: true }
        });
    }

    add(app) {
        // 验证输入
        const errors = validateInput(app, {
            name: { required: true, label: '应用名称', maxLength: 50 },
            description: { required: true, label: '应用描述', maxLength: 200 },
            type: { required: true, label: '应用类型' }
        });

        if (errors.length > 0) {
            throw new Error('输入验证失败: ' + errors.join(', '));
        }

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
}

// ==================== 需求存储 ====================

class DemandStorage extends BaseStorage {
    constructor() {
        super('mini_demands', {
            title: { type: 'string', required: true },
            description: { type: 'string', required: true }
        });
    }
}

// ==================== 文章存储 ====================

class ArticleStorage extends BaseStorage {
    constructor() {
        super('mini_articles', {
            title: { type: 'string', required: true },
            content: { type: 'string', required: true }
        });
    }
}

// ==================== 用户系统 ====================

class UserStorage {
    constructor() {
        this.storageKey = 'mini_users';
        this.tokenKey = 'mini_token';
        this.userIdKey = 'mini_userId';
        this.init();
    }

    init() {
        try {
            if (!localStorage.getItem(this.storageKey)) {
                this.save({ users: [] });
            }
        } catch (e) {
            console.error('用户存储初始化失败', e);
            throw new Error('用户系统初始化失败');
        }
    }

    save(data) {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(data, null, 2));
        } catch (e) {
            console.error('保存用户数据失败', e);
            throw new Error('用户数据保存失败');
        }
    }

    getAll() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : { users: [] };
        } catch (e) {
            console.error('读取用户数据失败', e);
            return { users: [] };
        }
    }

    /**
     * 注册 - 增强安全性
     */
    register(username, email, password) {
        const data = this.getAll();

        // 检查邮箱是否已存在
        if (data.users.some(u => u.email === email.toLowerCase())) {
            return { success: false, message: '邮箱已被注册' };
        }

        // 检查用户名
        if (data.users.some(u => u.username === username.trim())) {
            return { success: false, message: '用户名已被占用' };
        }

        const user = {
            id: generateId(),
            username: username.trim(),
            email: email.trim().toLowerCase(),
            password: this.hashPassword(password), // 使用增强的密码哈希
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

    /**
     * 登录
     */
    login(email, password) {
        const data = this.getAll();
        const user = data.users.find(u => u.email === email.toLowerCase());

        if (!user) {
            return { success: false, message: '用户不存在' };
        }

        if (!this.verifyPassword(password, user.password)) {
            return { success: false, message: '密码错误' };
        }

        const token = this.generateToken(user);
        this.setToken(token, user.id);

        return { success: true, user: this.sanitizeUser(user), token };
    }

    /**
     * 退出登录
     */
    logout() {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userIdKey);
    }

    /**
     * 获取当前用户
     */
    getCurrentUser() {
        const token = this.getToken();
        const userId = this.getUserId();

        if (!token || !userId) return null;

        if (!this.verifyToken(token, userId)) {
            this.logout();
            return null;
        }

        const data = this.getAll();
        return data.users.find(u => u.id === userId) || null;
    }

    /**
     * 更新用户信息
     */
    updateProfile(updates) {
        const userId = this.getUserId();
        if (!userId) return { success: false, message: '用户未登录' };

        const data = this.getAll();
        const index = data.users.findIndex(u => u.id === userId);

        if (index === -1) {
            return { success: false, message: '用户不存在' };
        }

        // 检查用户名是否冲突
        if (updates.username && updates.username !== data.users[index].username) {
            if (data.users.some(u => u.username === updates.username)) {
                return { success: false, message: '用户名已被占用' };
            }
        }

        data.users[index] = {
            ...data.users[index],
            ...updates,
            updatedAt: new Date().toISOString()
        };

        this.save(data);
        return { success: true, user: this.sanitizeUser(data.users[index]) };
    }

    /**
     * 获取用户信息
     */
    getUserProfile(userId) {
        const data = this.getAll();
        const user = data.users.find(u => u.id === userId);
        if (!user) return null;

        return {
            id: user.id,
            username: user.username,
            avatar: user.avatar,
            bio: user.bio,
            createdAt: user.createdAt
        };
    }

    // ==================== 工具方法 ====================

    /**
     * 增强的密码哈希 - 使用 Web Crypto API
     */
    async hashPassword(password) {
        try {
            if (window.crypto && window.crypto.subtle) {
                const encoder = new TextEncoder();
                const data = encoder.encode(password + getSalt());
                const hashBuffer = await crypto.subtle.digest('SHA-256', data);
                const hashArray = Array.from(new Uint8Array(hashBuffer));
                return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
            }
        } catch (e) {
            console.warn('Web Crypto API 不可用，使用备用方案', e);
        }

        // 备用方案：增强的 Base64 编码
        return btoa(password + getSalt() + '_v1');
    }

    /**
     * 验证密码
     */
    async verifyPassword(password, hashedPassword) {
        try {
            const hash = await this.hashPassword(password);
            return hash === hashedPassword;
        } catch (e) {
            console.error('密码验证失败', e);
            return false;
        }
    }

    /**
     * 生成 Token
     */
    generateToken(user) {
        const payload = {
            userId: user.id,
            exp: Date.now() + CONFIG.TOKEN_EXPIRY,
            iat: Date.now()
        };
        return btoa(JSON.stringify(payload));
    }

    /**
     * 验证 Token
     */
    verifyToken(token, userId) {
        try {
            const data = JSON.parse(atob(token));
            return data.userId === userId && data.exp > Date.now();
        } catch (e) {
            console.error('Token 验证失败', e);
            return false;
        }
    }

    setToken(token, userId) {
        localStorage.setItem(this.tokenKey, token);
        localStorage.setItem(this.userIdKey, userId);
    }

    getToken() {
        return localStorage.getItem(this.tokenKey);
    }

    getUserId() {
        return localStorage.getItem(this.userIdKey);
    }

    sanitizeUser(user) {
        const { password, ...sanitized } = user;
        return sanitized;
    }
}

// ==================== 互动系统 ====================

class InteractionStorage {
    constructor() {
        this.storageKey = 'mini_interactions';
        this.init();
    }

    init() {
        if (!localStorage.getItem(this.storageKey)) {
            this.save({
                favorites: [],
                likes: [],
                views: []
            });
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
            console.error('读取互动数据失败', e);
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

    getUserFavorites(userId) {
        if (!userId) return [];
        const data = this.getAll();
        return data.favorites.filter(f => f.userId === userId).map(f => f.appId);
    }

    toggleLike(appId) {
        const data = this.getAll();
        const index = data.likes.findIndex(l => l.appId === appId);

        if (index !== -1) {
            data.likes.splice(index, 1);
            this.save(data);
            const count = data.likes.filter(l => l.appId === appId).length;
            return { success: true, liked: false, count };
        } else {
            data.likes.push({
                appId,
                createdAt: new Date().toISOString()
            });
            this.save(data);
            const count = data.likes.filter(l => l.appId === appId).length;
            return { success: true, liked: true, count };
        }
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

// ==================== 导出实例 ====================

const appStorage = new AppStorage();
const demandStorage = new DemandStorage();
const articleStorage = new ArticleStorage();
const userStorage = new UserStorage();
const interactionStorage = new InteractionStorage();

// ==================== 全局暴露 ====================

window.generateId = generateId;
window.formatDate = formatDate;
window.escapeHtml = escapeHtml;
window.getAppIcon = getAppIcon;
window.getTypeName = getTypeName;
window.validateInput = validateInput;

window.appStorage = appStorage;
window.demandStorage = demandStorage;
window.articleStorage = articleStorage;
window.userStorage = userStorage;
window.interactionStorage = interactionStorage;
