import { useState } from 'react';
import { MdEdit, MdDelete } from 'react-icons/md';

const ShortcutCard = ({ shortcut, isEditMode, onEdit, onDelete, onClick }) => {
  const [imageError, setImageError] = useState(false);

  const handleClick = (e) => {
    if (isEditMode) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick(shortcut);
    }
  };

  return (
    <div className="group relative w-full h-full">
      {/* 编辑模式：显示编辑和删除按钮 */}
      {isEditMode && (
        <div className="absolute -top-2 -right-2 z-10 flex gap-1">
          <button
            onClick={() => onEdit(shortcut)}
            className="p-1.5 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors"
            title="编辑"
          >
            <MdEdit size={14} />
          </button>
          <button
            onClick={() => onDelete(shortcut.id)}
            className="p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors"
            title="删除"
          >
            <MdDelete size={14} />
          </button>
        </div>
      )}

      {/* 快捷方式卡片 */}
      <a
        href={shortcut.url}
        onClick={handleClick}
        target="_blank"
        rel="noopener noreferrer"
        className={`
          flex flex-col items-center justify-center rounded-xl
          transition-all duration-300
          w-full h-full gap-2
          ${isEditMode ? 'cursor-move' : 'cursor-pointer hover:scale-105'}
        `}
      >
        {/* 网站图标 - 占据剩余所有空间 */}
        <div className="flex-1 w-full flex items-center justify-center relative">
          {!imageError && shortcut.icon ? (
            <img
              src={shortcut.icon}
              alt={shortcut.name}
              className="absolute h-full object-contain drop-shadow-lg"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-3/4 h-3/4 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center text-white text-2xl font-bold shadow-lg">
              {shortcut.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* 网站名称 - 仅占据文字本身高度 */}
        <span
          className="text-xs font-medium text-gray-700 dark:text-gray-200 text-center line-clamp-1 leading-none pb-1"
          style={{ textShadow: '0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)' }}
        >
          {shortcut.name}
        </span>
      </a>
    </div>
  );
};

export default ShortcutCard;
