import { lazy, Suspense, useMemo } from 'react';
import widgetRegistry from './WidgetRegistry';
import WidgetErrorBoundary from './WidgetErrorBoundary';

/**
 * 加载中占位符组件
 */
const WidgetLoadingFallback = ({ widgetId }) => {
  const manifest = widgetRegistry.has(widgetId)
    ? widgetRegistry.getManifest(widgetId)
    : null;

  return (
    <div className="w-full h-full flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-md rounded-2xl">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {manifest?.icon && <span className="mr-1">{manifest.icon}</span>}
          加载 {manifest?.name || widgetId}...
        </span>
      </div>
    </div>
  );
};

// 缓存已创建的 lazy 组件，避免重复创建
const lazyComponentCache = new Map();

/**
 * 获取或创建 lazy 组件
 */
const getLazyComponent = (widgetId) => {
  if (lazyComponentCache.has(widgetId)) {
    console.log(`[DynamicWidget] 使用缓存的组件: ${widgetId}`);
    return lazyComponentCache.get(widgetId);
  }

  console.log(`[DynamicWidget] 创建新的 lazy 组件: ${widgetId}`);
  const loader = widgetRegistry.getLoader(widgetId);

  // 包装 loader 以添加调试信息
  const wrappedLoader = async () => {
    console.log(`[DynamicWidget] 开始加载 Widget: ${widgetId}`);
    try {
      const module = await loader();
      console.log(`[DynamicWidget] Widget 加载成功: ${widgetId}`, module);
      return module;
    } catch (error) {
      console.error(`[DynamicWidget] Widget 加载失败: ${widgetId}`, error);
      throw error;
    }
  };

  const LazyComponent = lazy(wrappedLoader);
  lazyComponentCache.set(widgetId, LazyComponent);

  return LazyComponent;
};

/**
 * 动态加载 Widget 组件
 * 使用 React.lazy 和 Suspense 实现按需加载
 */
const DynamicWidget = ({ widgetId, ...props }) => {
  // 检查 Widget 是否已注册
  if (!widgetRegistry.has(widgetId)) {
    console.error(`[DynamicWidget] Widget "${widgetId}" 未注册`);
    return (
      <div className="w-full h-full flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-dashed border-yellow-200 dark:border-yellow-800">
        <div className="text-center p-4">
          <span className="text-yellow-500 text-3xl">⚠️</span>
          <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-2">
            Widget "{widgetId}" 未注册
          </p>
        </div>
      </div>
    );
  }

  // 使用 useMemo 缓存 lazy 组件，避免每次渲染都重新创建
  const LazyComponent = useMemo(() => getLazyComponent(widgetId), [widgetId]);

  return (
    <WidgetErrorBoundary widgetId={widgetId}>
      <Suspense fallback={<WidgetLoadingFallback widgetId={widgetId} />}>
        <LazyComponent {...props} />
      </Suspense>
    </WidgetErrorBoundary>
  );
};

export default DynamicWidget;
