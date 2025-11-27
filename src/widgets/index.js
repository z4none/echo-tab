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
  defaultBackground: false, // 时钟默认透明，不遮挡背景
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
  defaultBackground: true, // 天气需要背景显示信息
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
  defaultBackground: false, // 搜索框自带背景，外层透明
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
  defaultBackground: true, // 待办事项需要背景
};

const noteManifest = {
  id: 'note',
  name: '笔记',
  description: '支持 Markdown 的笔记 Widget，可创建多个笔记实例',
  version: '1.0.0',
  author: 'EchoTab',
  type: 'builtin',
  icon: '📝',
  defaultSize: { w: 4, h: 4 },
  minSize: { w: 3, h: 3 },
  maxSize: { w: 8, h: 8 },
  tags: ['笔记', 'Markdown', '生产力'],
  category: 'productivity',
  defaultBackground: true, // 笔记需要背景
};

const speedDialManifest = {
  id: 'speeddial',
  name: 'SpeedDial',
  description: '键盘快捷访问，26个字母键快速跳转到常用网站',
  version: '1.0.0',
  author: 'EchoTab',
  type: 'builtin',
  icon: '⌨️',
  defaultSize: { w: 6, h: 4 },
  minSize: { w: 5, h: 3 },
  maxSize: { w: 10, h: 6 },
  tags: ['快捷键', '键盘', '导航', '效率'],
  category: 'productivity',
  defaultBackground: true, // SpeedDial 需要背景显示键盘布局
};

const quoteManifest = {
  id: 'quote',
  name: '每日一言',
  description: '随机显示名人名言、影视经典句子，给你启发和灵感',
  version: '1.0.0',
  author: 'EchoTab',
  type: 'builtin',
  icon: '💬',
  defaultSize: { w: 5, h: 3 },
  minSize: { w: 4, h: 2 },
  maxSize: { w: 8, h: 6 },
  tags: ['名言', '灵感', '文字'],
  category: 'information',
  defaultBackground: true, // Quote 需要背景突出文字
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

widgetRegistry.register(
  'note',
  noteManifest,
  () => import('./builtin/note')
);

widgetRegistry.register(
  'speeddial',
  speedDialManifest,
  () => import('./builtin/speeddial')
);

widgetRegistry.register(
  'quote',
  quoteManifest,
  () => import('./builtin/quote')
);

console.log('[Widgets] 所有 Widgets 已注册:', widgetRegistry.getAll().map(w => w.id));

// 导出核心模块
export { default as widgetRegistry } from './core/WidgetRegistry';
export { default as DynamicWidget } from './core/DynamicWidget';
export { default as WidgetErrorBoundary } from './core/WidgetErrorBoundary';
