import { useState, useEffect, useMemo } from 'react';
import quotesData from '../../../data/quotes.json';
import { useWidgetStyles } from '../../core/widgetStyles';
import useStore from '../../../store/useStore';

// 类别显示名称映射
const CATEGORY_NAMES = {
  inspiration: '励志',
  movie: '影视',
  anime: '动漫',
};

/**
 * Quote Widget - 显示随机名言
 * @param {string} instanceId - 实例 ID (可选，用于多实例)
 * @param {object} config - Widget 配置
 * @param {string[]} config.categories - 启用的类别数组，默认全部
 * @param {object} manifest - Widget manifest 信息
 */
const Quote = ({ instanceId, config, manifest }) => {
  const [currentQuote, setCurrentQuote] = useState(null);

  // 获取背景样式配置（从 config 或 manifest）
  const showBackground = config?.showBackground ?? manifest?.defaultBackground ?? true;
  const widgetStyles = useWidgetStyles(useStore, { showBackground });

  // 默认配置：启用所有类别
  const enabledCategories = config?.categories || ['inspiration', 'movie', 'anime'];

  // 根据启用的类别过滤名言
  const filteredQuotes = useMemo(() => {
    const quotes = [];
    quotesData.forEach((categoryGroup) => {
      if (enabledCategories.includes(categoryGroup.category)) {
        categoryGroup.items.forEach((item) => {
          quotes.push({
            ...item,
            category: categoryGroup.category,
          });
        });
      }
    });
    return quotes;
  }, [enabledCategories.join(',')]);

  // 获取随机名言
  const getRandomQuote = () => {
    if (filteredQuotes.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * filteredQuotes.length);
    return filteredQuotes[randomIndex];
  };

  // 当类别变化时更新名言
  useEffect(() => {
    setCurrentQuote(getRandomQuote());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabledCategories.join(',')]);

  // 刷新名言
  const refreshQuote = () => {
    setCurrentQuote(getRandomQuote());
  };

  if (!currentQuote) {
    return (
      <div className={widgetStyles.containerClass} style={widgetStyles.containerStyle}>
        <div className="w-full h-full flex items-center justify-center">
          <p className={widgetStyles.textMuted}>暂无名言</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${widgetStyles.containerClass} relative group`} style={widgetStyles.containerStyle}>
      <div className="w-full h-full flex flex-col items-center justify-center">
        {/* 刷新按钮 */}
        <button
          onClick={refreshQuote}
          className={`
            absolute top-4 right-4
            p-2 rounded-full
            ${widgetStyles.textMuted}
            ${widgetStyles.hoverBg}
            opacity-0 group-hover:opacity-100
            transition-all duration-200
            focus:outline-none
          `}
          title="换一句"
        >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      </button>

        {/* 名言内容 */}
        <div className="flex flex-col items-center text-center max-w-2xl px-6">
          {/* 引号装饰 */}
          <svg className="w-8 h-8 text-primary-400 dark:text-primary-500 mb-4 opacity-50" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z"/>
          </svg>

          {/* 名言文本 */}
          <p className={`text-lg md:text-xl lg:text-2xl font-medium ${widgetStyles.textPrimary} mb-4 leading-relaxed`}>
            {currentQuote.text}
          </p>

          {/* 作者 */}
          <p className={`text-sm md:text-base ${widgetStyles.textSecondary} font-light`}>
            — {currentQuote.author}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Quote;
