import { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { MdClose, MdSave } from 'react-icons/md';
import useStore from '../../store/useStore';
import { widgetRegistry } from '../../widgets';
import {
  ClockConfigForm,
  QuoteConfigForm,
  WeatherConfigForm,
  SearchConfigForm,
  TodoConfigForm,
  NoteConfigForm,
  SpeedDialConfigForm,
} from './forms';

// 缓存已创建的 lazy 组件
const lazyComponentCache = new Map();

/**
 * 获取或创建 lazy 组件
 */
const getLazyComponent = (widgetType) => {
  if (lazyComponentCache.has(widgetType)) {
    return lazyComponentCache.get(widgetType);
  }

  const loader = widgetRegistry.getLoader(widgetType);
  const LazyComponent = lazy(loader);
  lazyComponentCache.set(widgetType, LazyComponent);

  return LazyComponent;
};

/**
 * Widget Config - 配置特定 Widget 实例
 */
function WidgetConfig({ widgetId, isOpen, onClose }) {
  const { widgetInstances, updateWidgetInstance, layout, gridConfig, theme } = useStore();
  const [config, setConfig] = useState({});

  // 获取当前 widget 实例
  const instance = widgetInstances.find((inst) => inst.id === widgetId);
  const manifest = instance ? widgetRegistry.getManifest(instance.type) : null;

  // 获取 widget 的布局信息（位置和尺寸）
  const widgetLayout = layout.find((item) => item.id === widgetId);

  // 计算预览区域的实际像素尺寸
  const previewSize = useMemo(() => {
    if (!widgetLayout || !gridConfig) {
      return { width: 600, height: 400 }; // 默认尺寸
    }

    const { w, h } = widgetLayout;
    const { cellSize, gap } = gridConfig;

    // 计算实际像素尺寸：(单元格数量 * 单元格大小) + ((单元格数量 - 1) * 间隙)
    const width = w * cellSize + (w - 1) * gap;
    const height = h * cellSize + (h - 1) * gap;

    return { width, height };
  }, [widgetLayout, gridConfig]);

  // 获取 Widget 类型和 LazyComponent
  const widgetType = instance?.type;
  const WidgetComponent = useMemo(() =>
    widgetType ? getLazyComponent(widgetType) : null,
    [widgetType]
  );

  // 加载配置
  useEffect(() => {
    if (instance) {
      setConfig(instance.config || {});
    }
  }, [instance]);

  // ESC 键关闭弹窗
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // 保存配置
  const handleSave = () => {
    if (widgetId) {
      updateWidgetInstance(widgetId, config);
      onClose();
    }
  };

  // 更新配置项（支持嵌套路径，如 'font.family'）
  const updateConfig = (key, value) => {
    // 如果 value 是函数，则传入当前值
    if (typeof value === 'function') {
      setConfig((prev) => {
        const keys = key.split('.');
        let current = prev;
        for (let i = 0; i < keys.length - 1; i++) {
          current = current[keys[i]];
        }
        const oldValue = current[keys[keys.length - 1]];
        const newValue = value(oldValue);

        if (key.includes('.')) {
          const newConfig = { ...prev };
          current = newConfig;
          for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
              current[keys[i]] = {};
            }
            current[keys[i]] = { ...current[keys[i]] };
            current = current[keys[i]];
          }
          current[keys[keys.length - 1]] = newValue;
          return newConfig;
        } else {
          return { ...prev, [key]: newValue };
        }
      });
    } else if (key.includes('.')) {
      // 如果 key 包含点号，使用嵌套更新
      setConfig((prev) => {
        const keys = key.split('.');
        const newConfig = { ...prev };
        let current = newConfig;

        for (let i = 0; i < keys.length - 1; i++) {
          if (!current[keys[i]]) {
            current[keys[i]] = {};
          }
          current[keys[i]] = { ...current[keys[i]] };
          current = current[keys[i]];
        }

        current[keys[keys.length - 1]] = value;
        return newConfig;
      });
    } else {
      // 简单的顶层更新
      setConfig((prev) => ({ ...prev, [key]: value }));
    }
  };

  if (!isOpen || !instance || !manifest) return null;

  // 渲染不同类型 Widget 的配置界面
  const renderConfigForm = () => {
    switch (instance.type) {
      case 'clock':
        return <ClockConfigForm config={config} updateConfig={updateConfig} />;

      case 'weather':
        return <WeatherConfigForm config={config} updateConfig={updateConfig} />;

      case 'search':
        return <SearchConfigForm config={config} updateConfig={updateConfig} />;

      case 'todo':
        return <TodoConfigForm />;

      case 'note':
        return <NoteConfigForm config={config} updateConfig={updateConfig} />;

      case 'speeddial':
        return <SpeedDialConfigForm />;

      case 'quote':
        return <QuoteConfigForm config={config} updateConfig={updateConfig} />;

      default:
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              此 Widget 类型暂无配置项。
            </p>
          </div>
        );
    }
  };

  return (
    <>
      {/* 遮罩层 */}
      <div
        className={`fixed inset-0 backdrop-blur-sm z-40 ${
          theme === 'dark' ? 'bg-black/50' : 'bg-gray-900/30'
        }`}
        onClick={onClose}
      >
        {/* Widget 预览区域 (左侧空白区域中间，不包括配置侧栏) */}
        <div
          className="absolute left-0 top-0 bottom-0 flex items-center justify-center"
          style={{ right: '384px' }} // 384px = w-96 配置侧栏宽度
          onClick={(e) => e.stopPropagation()}
        >
          {WidgetComponent && (
            <div className="px-8">
              <div
                style={{
                  width: `${previewSize.width}px`,
                  height: `${previewSize.height}px`,
                }}
              >
                <Suspense
                  fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    </div>
                  }
                >
                  <WidgetComponent instanceId={widgetId} config={config} />
                </Suspense>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 配置侧栏 */}
      <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-800 shadow-2xl z-50 flex flex-col">
        {/* 头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{manifest.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                {manifest.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                配置此 Widget
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <MdClose size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* 配置表单 */}
        <div className="flex-1 overflow-y-auto p-6">
          {renderConfigForm()}
        </div>

        {/* 底部操作按钮 */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
          <button
            onClick={handleSave}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            <MdSave size={20} />
            保存配置
          </button>
        </div>
      </div>
    </>
  );
}

export default WidgetConfig;
