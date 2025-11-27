import { lazy, Suspense, useMemo } from 'react';
import widgetRegistry from './WidgetRegistry';
import WidgetErrorBoundary from './WidgetErrorBoundary';
import useStore from '../../store/useStore';

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
 *
 * @param {string} widgetId - Widget ID，可以是类型（如 'clock'）或实例 ID（如 'note-123'）
 * @param {object} props - 传递给 Widget 组件的其他属性
 */
const DynamicWidget = ({ widgetId, ...props }) => {
  const { widgetInstances, widgets } = useStore();

  // 检测是否为多实例 Widget（例如 'note-123' -> type='note', instanceId='note-123'）
  const widgetType = widgetId.includes('-') ? widgetId.split('-')[0] : widgetId;
  const instanceId = widgetId.includes('-') ? widgetId : null;

  // 尝试从新架构获取 widget 实例配置
  let widgetConfig = null;
  if (instanceId) {
    const instance = widgetInstances.find((inst) => inst.id === instanceId);
    if (instance) {
      widgetConfig = instance.config;
    } else {
      // 如果在新架构中找不到，尝试从旧架构中获取（兼容性处理）
      // 例如 note-xxx 可能还在 widgets.notes.instances 中
      if (widgetType === 'note' && widgets.notes?.instances?.[instanceId]) {
        widgetConfig = widgets.notes.instances[instanceId];
      } else if (widgetType === 'speeddial') {
        widgetConfig = widgets.speeddial || {};
      }
    }
  } else {
    // 非实例化 widget，从旧架构获取配置
    widgetConfig = widgets[widgetType] || {};
  }

  // 检查 Widget 是否已注册（使用 widgetType 而不是 widgetId）
  if (!widgetRegistry.has(widgetType)) {
    console.error(`[DynamicWidget] Widget "${widgetType}" 未注册`);
    return (
      <div className="w-full h-full flex items-center justify-center bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl border-2 border-dashed border-yellow-200 dark:border-yellow-800">
        <div className="text-center p-4">
          <span className="text-yellow-500 text-3xl">⚠️</span>
          <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-2">
            Widget "{widgetType}" 未注册
          </p>
        </div>
      </div>
    );
  }

  // 使用 useMemo 缓存 lazy 组件，避免每次渲染都重新创建
  const LazyComponent = useMemo(() => getLazyComponent(widgetType), [widgetType]);

  // 获取 widget 的 manifest 信息
  const manifest = widgetRegistry.getManifest(widgetType);

  return (
    <WidgetErrorBoundary widgetId={widgetType}>
      <Suspense fallback={<WidgetLoadingFallback widgetId={widgetType} />}>
        <LazyComponent
          instanceId={instanceId}
          config={widgetConfig}
          manifest={manifest}
          {...props}
        />
      </Suspense>
    </WidgetErrorBoundary>
  );
};

export default DynamicWidget;
