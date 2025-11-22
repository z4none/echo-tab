import { useEffect, useState } from 'react';
import { MdEdit, MdEditOff, MdLightMode, MdDarkMode, MdAdd } from 'react-icons/md';
import useStore from './store/useStore';
import GridLayout from './components/Grid/GridLayout';
import AddShortcutModal from './components/Shortcut/AddShortcutModal';
import SettingsPanel from './components/Settings/SettingsPanel';
// 导入 Widget 系统，自动注册所有内置 Widgets
import './widgets';

function App() {
  const {
    theme,
    setTheme,
    background,
    shortcuts,
    addShortcut,
    updateShortcut,
    removeShortcut,
    isEditMode,
    setEditMode,
  } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingShortcut, setEditingShortcut] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  useEffect(() => {
    // 应用主题
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const getBackgroundStyle = () => {
    const baseStyle = {};

    switch (background.type) {
      case 'color':
        baseStyle.backgroundColor = background.value;
        break;
      case 'gradient':
        baseStyle.background = background.value;
        break;
      case 'image':
      case 'unsplash':
        baseStyle.backgroundImage = `url(${background.value})`;
        baseStyle.backgroundSize = 'cover';
        baseStyle.backgroundPosition = 'center';
        baseStyle.backgroundRepeat = 'no-repeat';
        break;
      default:
        baseStyle.backgroundColor = '#f3f4f6';
    }

    return baseStyle;
  };

  const getBackgroundOverlayStyle = () => {
    if (background.type === 'image' || background.type === 'unsplash') {
      const filters = [];

      if (background.blur > 0) {
        filters.push(`blur(${background.blur}px)`);
      }

      if (background.brightness !== 100) {
        filters.push(`brightness(${background.brightness}%)`);
      }

      return {
        filter: filters.length > 0 ? filters.join(' ') : undefined,
        opacity: background.opacity / 100,
      };
    }
    return {};
  };

  const handleAddClick = () => {
    setEditingShortcut(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (shortcut) => {
    setEditingShortcut(shortcut);
    setIsModalOpen(true);
  };

  const handleSaveShortcut = (shortcutData) => {
    if (shortcutData.id) {
      // 编辑已存在的快捷方式
      updateShortcut(shortcutData.id, {
        name: shortcutData.name,
        url: shortcutData.url,
        icon: shortcutData.icon,
      });
    } else {
      // 添加新快捷方式
      addShortcut({
        name: shortcutData.name,
        url: shortcutData.url,
        icon: shortcutData.icon,
      });
    }
  };

  const handleDeleteShortcut = (id) => {
    if (window.confirm('确定要删除这个快捷方式吗？')) {
      removeShortcut(id);
    }
  };

  return (
    <div className="h-screen overflow-hidden">
      {/* 主内容区域 */}
      <div className="h-full relative overflow-hidden">
        {/* 背景层 */}
        <div
          className="absolute inset-0 transition-all duration-300"
          style={{
            ...getBackgroundStyle(),
            ...getBackgroundOverlayStyle(),
          }}
        />

        {/* 内容层 */}
        <div className="relative z-10 h-full overflow-hidden">
          <div className="container mx-auto px-4 py-8 min-h-screen">
            {/* 网格布局 */}
            <GridLayout
              onEditShortcut={handleEditClick}
              onDeleteShortcut={handleDeleteShortcut}
            />
          </div>

          {/* 右下角工具栏 */}
          <div className="fixed bottom-4 right-4 flex gap-2 z-20">
            {/* 添加网站按钮 */}
            <button
              onClick={handleAddClick}
              className="p-3 bg-green-500 text-white rounded-full shadow-lg hover:shadow-xl hover:bg-green-600 transition-all"
              title="添加网站"
            >
              <MdAdd size={24} />
            </button>

            {/* 编辑模式切换 */}
            <button
              onClick={() => setEditMode(!isEditMode)}
              className={`
                p-3 rounded-full shadow-lg hover:shadow-xl transition-all
                ${
                  isEditMode
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200'
                }
              `}
              title={isEditMode ? '退出编辑' : '编辑模式'}
            >
              {isEditMode ? <MdEditOff size={24} /> : <MdEdit size={24} />}
            </button>

            {/* 主题切换 */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-all"
              title={theme === 'light' ? '切换到暗黑模式' : '切换到浅色模式'}
            >
              {theme === 'light' ? (
                <MdDarkMode size={24} className="text-gray-700" />
              ) : (
                <MdLightMode size={24} className="text-yellow-400" />
              )}
            </button>

            {/* 设置按钮 */}
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-lg hover:shadow-xl transition-shadow"
              title="设置"
            >
              <svg
                className="w-6 h-6 text-gray-700 dark:text-gray-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* 添加/编辑网站模态框 */}
        <AddShortcutModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveShortcut}
          editingShortcut={editingShortcut}
        />
      </div>

      {/* 设置侧边栏 - 浮动在右侧 */}
      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}

export default App;
