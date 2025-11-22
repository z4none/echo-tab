/**
 * Widget 注册中心
 * 管理所有可用的 Widget，提供动态加载能力
 */
class WidgetRegistry {
  constructor() {
    this.widgets = new Map();
  }

  /**
   * 注册 Widget
   * @param {string} id - Widget ID
   * @param {object} manifest - Widget 配置清单
   * @param {Function} loader - 动态导入函数 () => import('./Widget')
   */
  register(id, manifest, loader) {
    if (this.widgets.has(id)) {
      console.warn(`Widget "${id}" 已存在，将被覆盖`);
    }

    this.widgets.set(id, {
      id,
      manifest,
      loader,
      loaded: false,
      component: null,
    });

    console.log(`[WidgetRegistry] 注册 Widget: ${id} (${manifest.name})`);
  }

  /**
   * 获取 Widget 加载器
   * @param {string} id - Widget ID
   * @returns {Function} 动态导入函数
   */
  getLoader(id) {
    const widget = this.widgets.get(id);
    if (!widget) {
      throw new Error(`Widget "${id}" 未注册`);
    }
    return widget.loader;
  }

  /**
   * 获取 Widget 配置清单
   * @param {string} id - Widget ID
   * @returns {object} Manifest 对象
   */
  getManifest(id) {
    const widget = this.widgets.get(id);
    if (!widget) {
      throw new Error(`Widget "${id}" 未注册`);
    }
    return widget.manifest;
  }

  /**
   * 检查 Widget 是否已注册
   * @param {string} id - Widget ID
   * @returns {boolean}
   */
  has(id) {
    return this.widgets.has(id);
  }

  /**
   * 获取所有已注册的 Widget
   * @returns {Array} Widget 列表
   */
  getAll() {
    return Array.from(this.widgets.values());
  }

  /**
   * 获取内置 Widgets
   * @returns {Array} 内置 Widget 列表
   */
  getBuiltin() {
    return this.getAll().filter((w) => w.manifest.type === 'builtin');
  }

  /**
   * 获取第三方 Widgets
   * @returns {Array} 第三方 Widget 列表
   */
  getExternal() {
    return this.getAll().filter((w) => w.manifest.type === 'external');
  }

  /**
   * 根据标签搜索 Widget
   * @param {string} tag - 标签名
   * @returns {Array} 匹配的 Widget 列表
   */
  searchByTag(tag) {
    return this.getAll().filter((w) => w.manifest.tags?.includes(tag));
  }

  /**
   * 取消注册 Widget
   * @param {string} id - Widget ID
   */
  unregister(id) {
    if (this.widgets.has(id)) {
      console.log(`[WidgetRegistry] 取消注册 Widget: ${id}`);
      this.widgets.delete(id);
    }
  }

  /**
   * 清空所有注册的 Widget
   */
  clear() {
    console.log('[WidgetRegistry] 清空所有 Widget');
    this.widgets.clear();
  }
}

// 创建全局单例
const widgetRegistry = new WidgetRegistry();

export { widgetRegistry };
export default widgetRegistry;
