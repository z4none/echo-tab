import { useState, useEffect } from 'react';
import { MdClose, MdAdd } from 'react-icons/md';
import { widgetRegistry } from '../../widgets';
import useStore from '../../store/useStore';

/**
 * Widget Store - 侧栏显示所有可用的 Widget
 * 用户可以点击添加 Widget 到页面
 */
function WidgetStore({ isOpen, onClose }) {
  const { addWidgetInstance, theme } = useStore();
  const [selectedCategory, setSelectedCategory] = useState('all');

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

  // 获取所有 Widget（返回的是 { id, manifest, loader } 对象数组）
  const allWidgets = widgetRegistry.getAll() || [];

  // 获取所有分类（从 manifest 中读取）
  const categories = ['all', ...new Set(allWidgets.map((w) => w.manifest?.category || 'other'))];

  // 过滤 Widget
  const filteredWidgets =
    selectedCategory === 'all'
      ? allWidgets
      : allWidgets.filter((w) => (w.manifest?.category || 'other') === selectedCategory);

  // 添加 Widget 到页面
  const handleAddWidget = (widgetId, widgetEntry) => {
    const manifest = widgetEntry.manifest;
    const { defaultSize } = manifest;

    // 根据不同 widget 类型设置默认配置
    let defaultConfig = {};

    switch (widgetId) {
      case 'clock':
        defaultConfig = {
          timeFormat: 'HH:mm:ss',
          dateFormat: 'yyyy年MM月dd日 EEEE',
          showDate: true,
          font: {
            family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            weight: 700,
            timeSize: 64,
            dateSize: 20
          }
        };
        break;
      case 'weather':
        defaultConfig = {
          unit: 'celsius',
          location: {
            latitude: null,
            longitude: null,
            name: '',
            timezone: 'auto',
          },
        };
        break;
      case 'search':
        defaultConfig = { engine: 'google' };
        break;
      case 'todo':
        defaultConfig = { items: [] };
        break;
      case 'note':
        defaultConfig = {
          title: '新笔记',
          content: '',
          isEditing: true,
        };
        break;
      case 'speeddial':
        defaultConfig = { bindings: {} };
        break;
      case 'quote':
        defaultConfig = {
          categories: ['inspiration', 'movie', 'anime'],
        };
        break;
      default:
        defaultConfig = {};
    }

    addWidgetInstance(widgetId, defaultConfig, defaultSize);
    onClose(); // 添加后关闭侧栏
  };

  if (!isOpen) return null;

  return (
    <>
      {/* 遮罩层 */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* 弹出窗口 */}
        <div
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 flex flex-col w-full max-w-4xl h-[85vh]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 头部 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              Widget Store
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <MdClose size={24} className="text-gray-600 dark:text-gray-300" />
            </button>
          </div>

        {/* 分类过滤 */}
        <div className="flex gap-2 p-4 overflow-x-auto border-b border-gray-200 dark:border-gray-700">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-4 py-2 rounded-lg whitespace-nowrap transition-colors
                ${
                  selectedCategory === category
                    ? 'bg-primary-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }
              `}
            >
              {category === 'all' ? '全部' : category}
            </button>
          ))}
        </div>

          {/* Widget 列表 */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWidgets.map((widgetEntry) => {
                const manifest = widgetEntry.manifest || {};
                return (
                  <div
                    key={widgetEntry.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-xl border-2 border-transparent hover:border-primary-500 transition-all cursor-pointer group"
                    onClick={() => handleAddWidget(widgetEntry.id, widgetEntry)}
                  >
                    <div className="flex items-start gap-3">
                      {/* 图标 */}
                      <div className="text-4xl flex-shrink-0">{manifest.icon || '🎨'}</div>

                      {/* 信息 */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                          {manifest.name || widgetEntry.id}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
                          {manifest.description || ''}
                        </p>

                        {/* 标签 */}
                        <div className="flex flex-wrap gap-1">
                          {(manifest.tags || []).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-0.5 text-xs bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* 添加按钮 */}
                      <button
                        className="p-2 bg-primary-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddWidget(widgetEntry.id, widgetEntry);
                        }}
                      >
                        <MdAdd size={20} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 底部提示 */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
              点击 Widget 卡片添加到页面
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default WidgetStore;
