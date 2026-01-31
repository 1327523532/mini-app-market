/**
 * 工具函数集
 */

/**
 * 生成唯一ID
 */
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

/**
 * 格式化日期
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
}

/**
 * 格式化相对时间
 */
export function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  const now = new Date();
  const target = new Date(dateStr);
  const diffMs = now - target;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffDay > 0) return `${diffDay}天前`;
  if (diffHour > 0) return `${diffHour}小时前`;
  if (diffMin > 0) return `${diffMin}分钟前`;
  return '刚刚';
}

/**
 * HTML转义 - 防止XSS攻击
 */
export function escapeHtml(text) {
  if (typeof text !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * 获取应用类型图标
 */
export function getAppIcon(type) {
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
export function getTypeName(type) {
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
export function validateInput(data, rules) {
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
  }
  return errors;
}

/**
 * 防抖函数
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * 节流函数
 */
export function throttle(func, limit) {
  let inThrottle;
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * 文本截断
 */
export function truncateText(text, maxLength) {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * 深拷贝
 */
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

/**
 * 从URL参数获取值
 */
export function getUrlParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * 设置页面标题
 */
export function setPageTitle(title) {
  document.title = `${title} | Mini-Application`;
}

/**
 * 显示提示消息
 */
export function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

/**
 * 显示确认对话框
 */
export function showConfirm(message, onConfirm, onCancel) {
  if (confirm(message)) {
    onConfirm && onConfirm();
  } else {
    onCancel && onCancel();
  }
}
