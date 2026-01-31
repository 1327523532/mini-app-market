/**
 * 头部组件
 */
export function renderHeader() {
  return `
    <header class="header">
      <div class="container">
        <a href="index.html" class="logo">
          🚀 Mini-Application
        </a>
        <nav class="nav">
          <a href="index.html" class="nav-link">首页</a>
          <a href="demands.html" class="nav-link">需求</a>
          <a href="articles.html" class="nav-link">分享</a>
        </nav>
        <div class="header-actions">
          <a href="create.html" class="btn btn-primary">发布应用</a>
          <div id="user-menu"></div>
        </div>
      </div>
    </header>
  `;
}

/**
 * 更新用户菜单
 */
export function updateUserMenu(user) {
  const userMenu = document.getElementById('user-menu');
  if (!userMenu) return;

  if (user) {
    userMenu.innerHTML = `
      <a href="profile.html" class="user-avatar">
        <img src="${user.avatar}" alt="${user.username}" />
      </a>
    `;
  } else {
    userMenu.innerHTML = `
      <a href="login.html" class="btn btn-outline">登录</a>
    `;
  }
}

/**
 * 初始化头部事件
 */
export function initHeaderEvents() {
  // 可以添加下拉菜单等事件
}
