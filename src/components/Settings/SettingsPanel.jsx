import { useState, useEffect } from 'react';
import { MdClose, MdDownload, MdUpload } from 'react-icons/md';
import useStore from '../../store/useStore';
import { FONT_SOURCES } from '../../utils/fontLoader';

const SettingsPanel = ({ isOpen, onClose }) => {
  const { theme, setTheme, background, setBackground, widgets, updateWidget, gridConfig, setGridConfig, layout, updateLayout, addNoteInstance, removeNoteInstance, fontSource, setFontSource, widgetStyles, setWidgetStyles } = useStore();
  const [activeTab, setActiveTab] = useState('appearance');

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

  const handleExportConfig = () => {
    const config = {
      theme,
      background,
      widgets,
      gridConfig,
      shortcuts: useStore.getState().shortcuts,
      layout: useStore.getState().layout,
    };

    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `echo-tab-config-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportConfig = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const config = JSON.parse(event.target.result);
        const store = useStore.getState();

        if (config.theme) store.setTheme(config.theme);
        if (config.background) store.setBackground(config.background);
        if (config.gridConfig) store.setGridConfig(config.gridConfig);
        if (config.widgets) {
          Object.entries(config.widgets).forEach(([key, value]) => {
            store.updateWidget(key, value);
          });
        }
        if (config.layout) store.setLayout(config.layout);
        if (config.shortcuts) {
          config.shortcuts.forEach((shortcut) => {
            store.addShortcut(shortcut);
          });
        }

        alert('配置导入成功！');
        onClose();
      } catch (error) {
        alert('配置文件格式错误！');
      }
    };
    reader.readAsText(file);
  };

  // 处理 Widget 启用/禁用
  const handleToggleWidget = (widgetId, enabled) => {
    // 更新 widget 配置
    updateWidget(widgetId, { enabled });

    // 如果启用，检查 layout 中是否存在该 widget
    if (enabled) {
      const widgetInLayout = layout.find(item => item.id === widgetId);
      if (!widgetInLayout) {
        // 自动添加到 layout - 根据不同 widget 设置默认位置和大小
        const defaultLayouts = {
          todo: { x: 1, y: 0, w: 3, h: 4 },
          weather: { x: 4, y: 2, w: 5, h: 3 },
          clock: { x: 4, y: 0, w: 4, h: 2 },
          search: { x: 4, y: 3, w: 5, h: 1 },
          speeddial: { x: 0, y: 4, w: 6, h: 4 },
        };

        const defaultLayout = defaultLayouts[widgetId] || { x: 0, y: 0, w: 4, h: 4 };

        // 查找空位置（避免重叠）
        let finalPosition = defaultLayout;
        const occupied = new Set();
        layout.forEach(item => {
          for (let y = item.y; y < item.y + item.h; y++) {
            for (let x = item.x; x < item.x + item.w; x++) {
              occupied.add(`${x},${y}`);
            }
          }
        });

        // 检查默认位置是否被占用
        let isOccupied = false;
        for (let y = defaultLayout.y; y < defaultLayout.y + defaultLayout.h; y++) {
          for (let x = defaultLayout.x; x < defaultLayout.x + defaultLayout.w; x++) {
            if (occupied.has(`${x},${y}`)) {
              isOccupied = true;
              break;
            }
          }
          if (isOccupied) break;
        }

        // 如果被占用，寻找新位置
        if (isOccupied) {
          const { cols } = gridConfig;
          let found = false;
          for (let y = 0; y < 20 && !found; y++) {
            for (let x = 0; x < cols && !found; x++) {
              let canPlace = true;
              for (let dy = 0; dy < defaultLayout.h && canPlace; dy++) {
                for (let dx = 0; dx < defaultLayout.w && canPlace; dx++) {
                  if (x + dx >= cols || occupied.has(`${x + dx},${y + dy}`)) {
                    canPlace = false;
                  }
                }
              }
              if (canPlace) {
                finalPosition = { ...defaultLayout, x, y };
                found = true;
              }
            }
          }
        }

        updateLayout(widgetId, finalPosition);
        console.log(`[SettingsPanel] 已将 ${widgetId} 添加到布局:`, finalPosition);
      }
    }
  };

  const handleBackgroundColorChange = (color) => {
    setBackground({
      type: 'color',
      value: color,
      blur: 0,
      brightness: 100,
      opacity: 100,
    });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 检查文件大小（限制 5MB）
    if (file.size > 5 * 1024 * 1024) {
      alert('图片大小不能超过 5MB！');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setBackground({
        ...background,
        type: 'image',
        value: event.target.result,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleUnsplashDaily = async () => {
    try {
      // 生成 0-1000 之间的随机 ID
      const randomId = Math.floor(Math.random() * 1000);
      // 使用固定 ID 的 URL 格式，确保刷新页面后图片不变
      const imageUrl = `https://picsum.photos/id/${randomId}/1920/1080`;

      setBackground({
        ...background,
        type: 'unsplash',
        value: imageUrl,
      });
    } catch (error) {
      alert('获取图片失败，请稍后重试！');
    }
  };

  const handleRemoveBackground = () => {
    setBackground({
      type: 'color',
      value: '#f3f4f6',
      blur: 0,
      brightness: 100,
      opacity: 100,
    });
  };

  const handleBackgroundEffect = (key, value) => {
    setBackground({
      ...background,
      [key]: value,
    });
  };

  const handleResetEffects = () => {
    setBackground({
      ...background,
      blur: 0,
      brightness: 100,
      opacity: 100,
    });
  };

  const PRESET_COLORS = [
    '#f3f4f6', // 浅灰
    '#ffffff', // 白色
    '#1f2937', // 深灰
    '#0f172a', // 深蓝灰
    '#fef3c7', // 浅黄
    '#dbeafe', // 浅蓝
    '#fce7f3', // 浅粉
    '#dcfce7', // 浅绿
  ];

  const PRESET_GRADIENTS = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
    'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
  ];

  return (
    // 设置侧边栏 - 固定在右侧，浮动在页面上方
    <div
      className={`
        fixed right-0 top-0 h-full bg-white dark:bg-gray-800 shadow-2xl z-50
        transition-all duration-300 ease-in-out overflow-hidden
        ${isOpen ? 'w-[480px]' : 'w-0'}
      `}
    >
        <div className="w-[480px] h-full flex flex-col">
          {/* 标题栏 */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
              设置
            </h2>
            <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <MdClose size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

          {/* 标签页 */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'appearance'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            外观
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'layout'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            布局
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex-1 px-6 py-3 font-medium transition-colors ${
              activeTab === 'data'
                ? 'text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            数据
          </button>
        </div>

          {/* 内容区域 - flex-1 填充剩余空间 */}
          <div className="flex-1 p-6 overflow-y-auto">
          {/* 外观设置 */}
          {activeTab === 'appearance' && (
            <div className="space-y-6">
              {/* 主题 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  主题模式
                </h3>
                <div className="flex gap-3">
                  <button
                    onClick={() => setTheme('light')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      theme === 'light'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">☀️</div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        浅色模式
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setTheme('dark')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      theme === 'dark'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🌙</div>
                      <div className="font-medium text-gray-800 dark:text-white">
                        暗黑模式
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* 背景颜色 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  背景颜色
                </h3>
                <div className="grid grid-cols-4 gap-3">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleBackgroundColorChange(color)}
                      className={`h-12 rounded-lg border-2 transition-all ${
                        background.type === 'color' && background.value === color
                          ? 'border-primary-500 ring-2 ring-primary-200'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* 背景渐变 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  渐变背景
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {PRESET_GRADIENTS.map((gradient, index) => (
                    <button
                      key={index}
                      onClick={() => setBackground({ type: 'gradient', value: gradient, blur: 0, brightness: 100, opacity: 100 })}
                      className={`h-16 rounded-lg border-2 transition-all ${
                        background.type === 'gradient' && background.value === gradient
                          ? 'border-primary-500 ring-2 ring-primary-200'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                      style={{ background: gradient }}
                    />
                  ))}
                </div>
              </div>

              {/* 背景图片 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  背景图片
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <label className="flex-1 px-4 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors cursor-pointer text-center font-medium">
                      上传本地图片
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <button
                      onClick={handleUnsplashDaily}
                      className="flex-1 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      随机图片
                    </button>
                  </div>

                  {(background.type === 'image' || background.type === 'unsplash') && (
                    <>
                      {/* 背景预览 */}
                      <div className="relative h-32 rounded-lg overflow-hidden border-2 border-gray-300 dark:border-gray-600">
                        <div
                          className="absolute inset-0 bg-cover bg-center"
                          style={{
                            backgroundImage: `url(${background.value})`,
                            filter: `blur(${background.blur}px) brightness(${background.brightness}%)`,
                            opacity: background.opacity / 100,
                          }}
                        />
                        <button
                          onClick={handleRemoveBackground}
                          className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
                        >
                          <MdClose size={16} />
                        </button>
                      </div>

                      {/* 图片效果调节 */}
                      <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        {/* 标题和重置按钮 */}
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                            图片效果
                          </h4>
                          <button
                            onClick={handleResetEffects}
                            className="px-3 py-1 text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            重置
                          </button>
                        </div>

                        {/* 模糊度 */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              模糊度
                            </label>
                            <span className="text-sm text-gray-500">{background.blur}px</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="20"
                            value={background.blur || 0}
                            onChange={(e) => handleBackgroundEffect('blur', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        {/* 亮度 */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              亮度
                            </label>
                            <span className="text-sm text-gray-500">{background.brightness}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="200"
                            value={background.brightness || 100}
                            onChange={(e) => handleBackgroundEffect('brightness', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>

                        {/* 透明度 */}
                        <div>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              透明度
                            </label>
                            <span className="text-sm text-gray-500">{background.opacity}%</span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={background.opacity || 100}
                            onChange={(e) => handleBackgroundEffect('opacity', parseInt(e.target.value))}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* 字体源设置 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  字体加载源
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  选择 Google Fonts 字体的加载源。如果访问 Google 有困难，请使用国内镜像。
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setFontSource('google')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      fontSource === 'google'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🌍</div>
                      <div className="font-medium text-gray-800 dark:text-white mb-1">
                        国际源
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        fonts.googleapis.com
                      </div>
                    </div>
                  </button>
                  <button
                    onClick={() => setFontSource('china')}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all ${
                      fontSource === 'china'
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-2xl mb-2">🇨🇳</div>
                      <div className="font-medium text-gray-800 dark:text-white mb-1">
                        国内镜像
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        fonts.googleapis.cn
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Widget 背景配置 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  组件背景
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  自定义所有组件的统一背景颜色和透明度
                </p>

                {/* 浅色模式背景 */}
                <div className="space-y-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        浅色模式背景
                      </label>
                      <input
                        type="color"
                        value={widgetStyles.background.color}
                        onChange={(e) => setWidgetStyles({
                          background: { ...widgetStyles.background, color: e.target.value }
                        })}
                        className="w-10 h-10 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <input
                      type="text"
                      value={widgetStyles.background.color}
                      onChange={(e) => setWidgetStyles({
                        background: { ...widgetStyles.background, color: e.target.value }
                      })}
                      placeholder="#ffffff"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* 深色模式背景 */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        深色模式背景
                      </label>
                      <input
                        type="color"
                        value={widgetStyles.background.colorDark}
                        onChange={(e) => setWidgetStyles({
                          background: { ...widgetStyles.background, colorDark: e.target.value }
                        })}
                        className="w-10 h-10 rounded cursor-pointer border-2 border-gray-300 dark:border-gray-600"
                      />
                    </div>
                    <input
                      type="text"
                      value={widgetStyles.background.colorDark}
                      onChange={(e) => setWidgetStyles({
                        background: { ...widgetStyles.background, colorDark: e.target.value }
                        })}
                      placeholder="#1f2937"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  {/* 透明度 */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        背景透明度
                      </label>
                      <span className="text-sm text-gray-500">{widgetStyles.background.opacity}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={widgetStyles.background.opacity}
                      onChange={(e) => setWidgetStyles({
                        background: { ...widgetStyles.background, opacity: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 网格布局设置 */}
          {activeTab === 'layout' && (
            <div className="space-y-6">
              {/* 网格尺寸 */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  网格尺寸
                </h3>
                <div className="space-y-4">
                  {/* 列数 */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        列数
                      </label>
                      <span className="text-sm text-gray-500">{gridConfig.cols}</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="20"
                      value={gridConfig.cols}
                      onChange={(e) => setGridConfig({ cols: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* 行数 */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        行数
                      </label>
                      <span className="text-sm text-gray-500">{gridConfig.rows}</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="16"
                      value={gridConfig.rows}
                      onChange={(e) => setGridConfig({ rows: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  {/* 单元格大小 */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        单元格大小
                      </label>
                      <span className="text-sm text-gray-500">{gridConfig.cellSize}px</span>
                    </div>
                    <input
                      type="range"
                      min="32"
                      max="128"
                      step="8"
                      value={gridConfig.cellSize}
                      onChange={(e) => setGridConfig({ cellSize: parseInt(e.target.value) })}
                      className="w-full"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      每个网格单元格都是正方形（推荐：96px）
                    </p>
                  </div>

                  {/* 间隙 */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        网格间隙
                      </label>
                      <span className="text-sm text-gray-500">{gridConfig.gap}px</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="32"
                      step="4"
                      value={gridConfig.gap}
                      onChange={(e) => setGridConfig({ gap: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* 网格位置 - 9宫格选择器 */}
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  网格位置
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { pos: 'lt', label: '左上', icon: '↖️' },
                    { pos: 't', label: '上', icon: '⬆️' },
                    { pos: 'rt', label: '右上', icon: '↗️' },
                    { pos: 'l', label: '左', icon: '⬅️' },
                    { pos: 'c', label: '中', icon: '⊙' },
                    { pos: 'r', label: '右', icon: '➡️' },
                    { pos: 'lb', label: '左下', icon: '↙️' },
                    { pos: 'b', label: '下', icon: '⬇️' },
                    { pos: 'rb', label: '右下', icon: '↘️' },
                  ].map(({ pos, label, icon }) => (
                    <button
                      key={pos}
                      onClick={() => setGridConfig({ position: pos })}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        gridConfig.position === pos
                          ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-center">
                        <div className="text-2xl mb-1">{icon}</div>
                        <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                          {label}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 数据管理 */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  导出配置
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  将您的所有设置和快捷方式导出为 JSON 文件
                </p>
                <button
                  onClick={handleExportConfig}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <MdDownload size={20} />
                  导出配置
                </button>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                  导入配置
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  从 JSON 文件恢复您的设置和快捷方式
                </p>
                <label className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors cursor-pointer inline-flex">
                  <MdUpload size={20} />
                  选择文件导入
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleImportConfig}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
