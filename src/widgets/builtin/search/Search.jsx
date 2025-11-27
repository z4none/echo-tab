import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useStore from '../../../store/useStore';
import { useWidgetStyles } from '../../core/widgetStyles';

// 搜索引擎图标组件
const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

const BingIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5" fill="#008373">
    <path d="M5 3v18l5-3 7 4V6.5L9.5 9z"/>
  </svg>
);

const BaiduIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <circle cx="8" cy="9" r="2" fill="#2932E1"/>
    <circle cx="16" cy="9" r="2" fill="#2932E1"/>
    <ellipse cx="8" cy="16" rx="2.5" ry="3" fill="#2932E1"/>
    <ellipse cx="16" cy="16" rx="2.5" ry="3" fill="#2932E1"/>
    <circle cx="12" cy="5" r="1.5" fill="#2932E1"/>
  </svg>
);

const DuckDuckGoIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5">
    <circle cx="12" cy="12" r="10" fill="#DE5833"/>
    <ellipse cx="12" cy="13" rx="7" ry="6" fill="#FFF"/>
    <ellipse cx="9.5" cy="11" rx="1.5" ry="2" fill="#000"/>
    <ellipse cx="14.5" cy="11" rx="1.5" ry="2" fill="#000"/>
  </svg>
);

const SEARCH_ENGINES = {
  google: {
    name: 'Google',
    url: 'https://www.google.com/search?q=',
    placeholder: '搜索 Google',
    icon: GoogleIcon,
  },
  bing: {
    name: 'Bing',
    url: 'https://www.bing.com/search?q=',
    placeholder: '搜索 Bing',
    icon: BingIcon,
  },
  baidu: {
    name: '百度',
    url: 'https://www.baidu.com/s?wd=',
    placeholder: '百度一下',
    icon: BaiduIcon,
  },
  duckduckgo: {
    name: 'DuckDuckGo',
    url: 'https://duckduckgo.com/?q=',
    placeholder: '搜索 DuckDuckGo',
    icon: DuckDuckGoIcon,
  },
};

/**
 * Search Widget - 多实例支持
 * @param {string} instanceId - 实例 ID (可选，用于多实例)
 * @param {object} config - Widget 配置 (从新架构传入)
 * @param {object} manifest - Widget manifest 信息
 */
const Search = ({ instanceId, config, manifest }) => {
  const { widgets, updateWidget, updateWidgetInstance, theme } = useStore();

  // 获取背景样式配置（从 config 或 manifest）
  const showBackground = config?.showBackground ?? manifest?.defaultBackground ?? false;
  const widgetStyles = useWidgetStyles(useStore, { showBackground });
  const [query, setQuery] = useState('');
  const [showEngineMenu, setShowEngineMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [isFocused, setIsFocused] = useState(false);
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const inputRef = useRef(null);

  // 优先使用传入的 config，否则使用旧架构的配置（兼容性）
  const searchConfig = config || widgets.search || { engine: 'google' };
  const currentEngine = searchConfig.engine || 'google';
  const CurrentEngineIcon = SEARCH_ENGINES[currentEngine].icon;

  // 根据主题动态生成搜索框样式
  const isDark = theme === 'dark';
  const inputClassName = `
    w-full
    py-3 pl-12 pr-12 text-base
    ${isDark ? 'bg-gray-800 text-gray-100 placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}
    border-2
    ${isFocused
      ? isDark
        ? 'border-primary-500 shadow-lg shadow-primary-500/20'
        : 'border-primary-400 shadow-lg shadow-primary-400/20'
      : isDark
        ? 'border-gray-700 shadow-md'
        : 'border-gray-200 shadow-md'
    }
    rounded-2xl
    focus:outline-none
    ${!isFocused && (isDark ? 'hover:border-gray-600 hover:shadow-lg' : 'hover:border-gray-300 hover:shadow-lg')}
    transition-all duration-300 ease-out
  `.trim().replace(/\s+/g, ' ');

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const searchUrl = SEARCH_ENGINES[currentEngine].url + encodeURIComponent(query);
    window.open(searchUrl, '_blank');
    setQuery('');
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  const handleEngineChange = (engine) => {
    if (instanceId) {
      updateWidgetInstance(instanceId, { engine });
    } else {
      updateWidget('search', { engine });
    }
    setShowEngineMenu(false);
  };

  const handleToggleMenu = () => {
    if (!showEngineMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 8,
        left: rect.left,
      });
    }
    setShowEngineMenu(!showEngineMenu);
  };

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowEngineMenu(false);
      }
    };

    if (showEngineMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showEngineMenu]);

  // 全局键盘快捷键：空格聚焦搜索框，ESC 失焦
  useEffect(() => {
    const handleGlobalKeydown = (e) => {
      // 检查当前是否有元素获得焦点（输入框、文本域等）
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === 'INPUT' ||
         activeElement.tagName === 'TEXTAREA' ||
         activeElement.isContentEditable);

      // 空格键：聚焦搜索框（仅当没有输入框获得焦点时）
      if (e.key === ' ' && !isInputFocused && inputRef.current) {
        e.preventDefault(); // 防止页面滚动
        inputRef.current.focus();
        setShowEngineMenu(false); // 关闭引擎菜单（如果打开）
      }

      // ESC 键：失焦搜索框或关闭引擎菜单
      if (e.key === 'Escape') {
        if (showEngineMenu) {
          // 如果引擎菜单打开，先关闭菜单
          setShowEngineMenu(false);
        } else if (inputRef.current === activeElement) {
          // 如果搜索框有焦点，失焦并清空
          inputRef.current.blur();
          setQuery('');
        }
      }
    };

    document.addEventListener('keydown', handleGlobalKeydown);
    return () => document.removeEventListener('keydown', handleGlobalKeydown);
  }, [showEngineMenu]); // 依赖 showEngineMenu 以正确处理菜单状态

  return (
    <>
      <div className={widgetStyles.containerClass} style={widgetStyles.containerStyle}>
        <div className="w-full h-full flex items-center justify-center">
          <form
            onSubmit={handleSearch}
            className="relative w-full max-w-2xl"
          >
            {/* 搜索输入框容器 - 添加缩放和光晕效果 */}
            <div
              className={`
                relative flex items-center group
                transition-all duration-300 ease-out
                ${isFocused ? 'scale-105' : 'scale-100'}
              `}
              style={{
                filter: isFocused
                  ? isDark
                    ? 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.4)) drop-shadow(0 0 40px rgba(99, 102, 241, 0.2))'
                    : 'drop-shadow(0 0 20px rgba(99, 102, 241, 0.3)) drop-shadow(0 0 40px rgba(99, 102, 241, 0.15))'
                  : 'none',
              }}
            >
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
                placeholder={SEARCH_ENGINES[currentEngine].placeholder}
                className={inputClassName}
              />

              {/* 搜索引擎图标（左侧，可点击） */}
              <button
                ref={buttonRef}
                type="button"
                onClick={handleToggleMenu}
                className={`
                  absolute left-3 p-1.5
                  rounded-full
                  ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                  active:scale-95
                  transition-all duration-150
                  focus:outline-none
                `}
                title="选择搜索引擎"
              >
                <div className="w-5 h-5">
                  <CurrentEngineIcon />
                </div>
              </button>

              {/* 搜索按钮（右侧图标） */}
              <button
                type="submit"
                disabled={!query.trim()}
                className={`
                  absolute right-3 p-1.5
                  rounded-full
                  ${query.trim()
                    ? `text-primary-500 ${isDark ? 'hover:bg-primary-900/20' : 'hover:bg-primary-50'} active:scale-95`
                    : `${isDark ? 'text-gray-600' : 'text-gray-300'} cursor-not-allowed`
                  }
                  transition-all duration-150
                  focus:outline-none focus:ring-2 focus:ring-primary-400
                `}
                title="搜索"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* 使用 Portal 渲染搜索引擎选择器到 body - 横向图标网格 */}
      {showEngineMenu && createPortal(
        <div
          ref={menuRef}
          className={`
            fixed p-4
            ${isDark ? 'bg-gray-800/95 border-gray-700' : 'bg-white/95 border-gray-200'}
            backdrop-blur-md
            border
            rounded-2xl shadow-2xl
            z-[9999]
            animate-in fade-in zoom-in duration-200
          `}
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(SEARCH_ENGINES).map(([key, engine]) => {
              const EngineIcon = engine.icon;
              const isSelected = currentEngine === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleEngineChange(key)}
                  className={`
                    relative flex flex-col items-center gap-2 p-3 rounded-xl
                    transition-all duration-200
                    ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}
                    ${isSelected ? `${isDark ? 'bg-primary-900/30' : 'bg-primary-50'} ring-2 ring-primary-500` : ''}
                  `}
                  title={engine.name}
                >
                  <div className="w-12 h-12 flex items-center justify-center">
                    <EngineIcon />
                  </div>
                  <span className={`text-xs font-medium ${isSelected ? (isDark ? 'text-primary-400' : 'text-primary-600') : (isDark ? 'text-gray-300' : 'text-gray-600')}`}>
                    {engine.name}
                  </span>
                  {isSelected && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default Search;
