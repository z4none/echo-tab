/**
 * Widget 系统入口
 * 自动注册所有内置 Widgets
 */
import widgetRegistry from './core/WidgetRegistry';

// 直接定义 manifest 对象，避免 JSON 导入问题
const clockManifest = {
  id: 'clock',
  name: '时钟',
  description: '显示当前时间和日期，支持12/24小时制切换',
  version: '1.0.0',
  author: 'EchoTab',
  type: 'builtin',
  icon: '⏰',
  defaultSize: { w: 4, h: 2 },
  minSize: { w: 2, h: 1 },
  maxSize: { w: 8, h: 4 },
  tags: ['时间', '工具', '实用'],
  category: 'productivity',
};

const weatherManifest = {
  id: 'weather',
  name: '天气',
  description: '显示实时天气信息，支持地理定位和城市搜索',
  version: '1.0.0',
  author: 'EchoTab',
  type: 'builtin',
  icon: '🌤️',
  defaultSize: { w: 5, h: 3 },
  minSize: { w: 3, h: 1 },
  maxSize: { w: 8, h: 6 },
  tags: ['天气', '实用', '信息'],
  category: 'information',
};

const searchManifest = {
  id: 'search',
  name: '搜索',
  description: '多引擎搜索框，支持 Google、Bing、百度、DuckDuckGo',
  version: '1.0.0',
  author: 'EchoTab',
  type: 'builtin',
  icon: '🔍',
  defaultSize: { w: 5, h: 1 },
  minSize: { w: 3, h: 1 },
  maxSize: { w: 10, h: 2 },
  tags: ['搜索', '工具', '实用'],
  category: 'productivity',
};

const todoManifest = {
  id: 'todo',
  name: '待办事项',
  description: '简单实用的待办事项列表，支持任务添加、完成标记和删除',
  version: '1.0.0',
  author: 'EchoTab',
  type: 'builtin',
  icon: '✓',
  defaultSize: { w: 4, h: 4 },
  minSize: { w: 3, h: 3 },
  maxSize: { w: 6, h: 8 },
  tags: ['待办', '任务', '生产力'],
  category: 'productivity',
};

// 注册内置 Widgets
// 使用动态 import 实现按需加载
console.log('[Widgets] 开始注册内置 Widgets');

widgetRegistry.register(
  'clock',
  clockManifest,
  () => import('./builtin/clock')
);

widgetRegistry.register(
  'weather',
  weatherManifest,
  () => import('./builtin/weather')
);

widgetRegistry.register(
  'search',
  searchManifest,
  () => import('./builtin/search')
);

widgetRegistry.register(
  'todo',
  todoManifest,
  () => import('./builtin/todo')
);

console.log('[Widgets] 所有 Widgets 已注册:', widgetRegistry.getAll().map(w => w.id));

// 导出核心模块
export { default as widgetRegistry } from './core/WidgetRegistry';
export { default as DynamicWidget } from './core/DynamicWidget';
export { default as WidgetErrorBoundary } from './core/WidgetErrorBoundary';
