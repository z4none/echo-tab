import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useStore from '../../../store/useStore';

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

const Search = () => {
  const { widgets, updateWidget } = useStore();
  const [query, setQuery] = useState('');
  const [showEngineMenu, setShowEngineMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const buttonRef = useRef(null);
  const currentEngine = widgets.search.engine || 'google';
  const CurrentEngineIcon = SEARCH_ENGINES[currentEngine].icon;

  const handleSearch = (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    const searchUrl = SEARCH_ENGINES[currentEngine].url + encodeURIComponent(query);
    window.open(searchUrl, '_blank');
    setQuery('');
  };

  const handleEngineChange = (engine) => {
    updateWidget('search', { engine });
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

  return (
    <>
      <div className="w-full max-w-2xl mx-auto">
        <form onSubmit={handleSearch} className="relative">
          {/* 搜索输入框 */}
          <div className="relative flex items-center">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={SEARCH_ENGINES[currentEngine].placeholder}
              className="
                w-full pl-14 pr-24 py-4 text-lg
                bg-white/90 dark:bg-gray-800/90 backdrop-blur-glass
                text-gray-800 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                border border-gray-200 dark:border-gray-700
                rounded-full shadow-lg
                focus:outline-none focus:ring-2 focus:ring-primary-500
                transition-all duration-300
              "
            />

            {/* 搜索引擎图标（可点击） */}
            <button
              ref={buttonRef}
              type="button"
              onClick={handleToggleMenu}
              className="
                absolute left-4
                p-1.5 rounded-full
                hover:bg-gray-100 dark:hover:bg-gray-700
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-primary-500
              "
              title="选择搜索引擎"
            >
              <CurrentEngineIcon />
            </button>

            {/* 搜索按钮 */}
            <button
              type="submit"
              className="
                absolute right-2
                px-6 py-2 text-sm font-medium
                bg-primary-500 text-white
                rounded-full
                hover:bg-primary-600
                focus:outline-none focus:ring-2 focus:ring-primary-500
                transition-all duration-300
                shadow-md
              "
            >
              搜索
            </button>
          </div>
        </form>
      </div>

      {/* 使用 Portal 渲染下拉菜单到 body */}
      {showEngineMenu && createPortal(
        <div
          ref={menuRef}
          className="
            fixed py-2
            bg-white dark:bg-gray-800
            border border-gray-200 dark:border-gray-700
            rounded-xl shadow-xl
            min-w-[180px]
            z-[9999]
            animate-in fade-in zoom-in duration-200
          "
          style={{
            top: `${menuPosition.top}px`,
            left: `${menuPosition.left}px`,
          }}
        >
          {Object.entries(SEARCH_ENGINES).map(([key, engine]) => {
            const EngineIcon = engine.icon;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleEngineChange(key)}
                className={`
                  w-full px-4 py-2.5 flex items-center gap-3
                  hover:bg-gray-100 dark:hover:bg-gray-700
                  transition-colors duration-200
                  ${currentEngine === key ? 'bg-primary-50 dark:bg-primary-900/20' : ''}
                `}
              >
                <EngineIcon />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {engine.name}
                </span>
                {currentEngine === key && (
                  <svg className="w-4 h-4 ml-auto text-primary-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
};

export default Search;
