import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import useStore from '../../../store/useStore';
import { loadGoogleFont } from '../../../utils/fontLoader';
import { getFontConfig } from '../../../constants/fonts';
import { useWidgetStyles } from '../../core/widgetStyles';

/**
 * Clock Widget - 多实例支持
 * @param {string} instanceId - 实例 ID (可选，用于多实例)
 * @param {object} config - Widget 配置 (从新架构传入)
 * @param {object} manifest - Widget manifest 信息
 */
const Clock = ({ instanceId, config, manifest }) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [fontLoading, setFontLoading] = useState(false);
  const { widgets, fontSource } = useStore();

  // 优先使用传入的 config，否则使用旧架构的配置（兼容性）
  const widgetConfig = config || widgets.clock || {
    timeFormat: 'HH:mm:ss',
    dateFormat: 'yyyy年MM月dd日 EEEE',
    showDate: true,
    font: {
      family: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      weight: 700,
      timeSize: 64,
      dateSize: 20
    },
    colors: {
      time: null, // null 表示使用默认颜色
      date: null
    }
  };

  const {
    timeFormat = 'HH:mm:ss',
    dateFormat = 'yyyy年MM月dd日 EEEE',
    showDate = true,
    font = {
      family: 'system-ui, -apple-system, sans-serif',
      weight: 700,
      timeSize: 64,
      dateSize: 20
    },
    colors = {
      time: null,
      date: null
    }
  } = widgetConfig;

  // 时钟更新定时器
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 动态加载字体
  useEffect(() => {
    const fontConfig = getFontConfig(font.family);

    // 如果不是系统字体，需要加载
    if (fontConfig && !fontConfig.isSystem) {
      setFontLoading(true);
      loadGoogleFont(fontConfig.googleFamily, fontConfig.weights, fontSource)
        .then(() => {
          setFontLoading(false);
        })
        .catch((error) => {
          console.error('[Clock] 字体加载失败:', error);
          setFontLoading(false);
        });
    }
  }, [font.family, fontSource]);

  // 时间样式
  const timeStyle = {
    fontFamily: font.family || 'system-ui, -apple-system, sans-serif',
    fontWeight: font.weight || 700,
    fontSize: `${font.timeSize || 64}px`,
    textShadow: '0 2px 4px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
    ...(colors.time && { color: colors.time }) // 如果设置了自定义颜色，覆盖默认颜色
  };

  // 日期样式（使用相同字体，但可以稍细一些）
  const dateStyle = {
    fontFamily: font.family || 'system-ui, -apple-system, sans-serif',
    fontWeight: Math.max(300, (font.weight || 700) - 200), // 日期字重比时间轻一些
    fontSize: `${font.dateSize || 20}px`,
    textShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)',
    ...(colors.date && { color: colors.date }) // 如果设置了自定义颜色，覆盖默认颜色
  };

  // 获取背景样式配置（从 config 或 manifest）
  const showBackground = config?.showBackground ?? manifest?.defaultBackground ?? false;
  const widgetStyles = useWidgetStyles(useStore, { showBackground });

  return (
    <div className={widgetStyles.containerClass} style={widgetStyles.containerStyle}>
      <div className="w-full h-full flex flex-col items-center justify-center text-center">
        {fontLoading && (
          <div className="absolute top-2 right-2 text-xs text-gray-400 dark:text-gray-500">
            加载字体...
          </div>
        )}
        <div
          className={`${!colors.time ? 'text-gray-800 dark:text-white' : ''} ${showDate ? 'mb-2' : ''}`}
          style={timeStyle}
        >
          {format(currentTime, timeFormat)}
        </div>
        {showDate && (
          <div
            className={!colors.date ? 'text-gray-600 dark:text-gray-300' : ''}
            style={dateStyle}
          >
            {format(currentTime, dateFormat, { locale: zhCN })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Clock;
