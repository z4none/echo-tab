import { useState, useRef, useEffect } from 'react';
import ShortcutCard from './ShortcutCard';

const ShortcutGrid = ({ shortcuts, isEditMode, onEdit, onDelete, onReorder }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const gridRef = useRef(null);
  const dragPreviewRef = useRef(null);

  useEffect(() => {
    if (draggedIndex !== null) {
      const handleMouseMove = (e) => {
        setDragPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
        });

        // 计算当前鼠标悬停在哪个卡片上
        const gridRect = gridRef.current?.getBoundingClientRect();
        if (!gridRect) return;

        const cards = gridRef.current?.querySelectorAll('[data-card-index]');
        let newIndex = draggedIndex;

        cards?.forEach((card, index) => {
          const rect = card.getBoundingClientRect();
          const centerX = rect.left + rect.width / 2;
          const centerY = rect.top + rect.height / 2;

          if (
            e.clientX >= rect.left &&
            e.clientX <= rect.right &&
            e.clientY >= rect.top &&
            e.clientY <= rect.bottom
          ) {
            newIndex = index;
          }
        });

        if (newIndex !== draggedIndex) {
          const newShortcuts = [...shortcuts];
          const draggedItem = newShortcuts[draggedIndex];
          newShortcuts.splice(draggedIndex, 1);
          newShortcuts.splice(newIndex, 0, draggedItem);
          onReorder(newShortcuts);
          setDraggedIndex(newIndex);
        }
      };

      const handleMouseUp = () => {
        setDraggedIndex(null);
        setDraggedItem(null);
      };

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedIndex, dragOffset, shortcuts, onReorder]);

  const handleMouseDown = (e, index) => {
    if (!isEditMode) return;

    e.preventDefault();
    const target = e.currentTarget;
    const rect = target.getBoundingClientRect();

    setDraggedIndex(index);
    setDraggedItem(shortcuts[index]);
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setDragPosition({
      x: rect.left,
      y: rect.top,
    });
  };

  return (
    <>
      <div
        ref={gridRef}
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6"
      >
        {shortcuts.map((shortcut, index) => (
          <div
            key={shortcut.id}
            data-card-index={index}
            onMouseDown={(e) => handleMouseDown(e, index)}
            className={`
              transition-all duration-200
              ${isEditMode ? 'cursor-move' : ''}
              ${draggedIndex === index ? 'opacity-30' : ''}
            `}
          >
            <ShortcutCard
              shortcut={shortcut}
              isEditMode={isEditMode}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </div>
        ))}
      </div>

      {/* 拖拽预览 */}
      {draggedIndex !== null && draggedItem && (
        <div
          ref={dragPreviewRef}
          className="fixed pointer-events-none z-50"
          style={{
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y}px`,
            transform: 'scale(1.1)',
            transition: 'transform 0.1s ease-out',
          }}
        >
          <div className="opacity-90 shadow-2xl">
            <ShortcutCard
              shortcut={draggedItem}
              isEditMode={false}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default ShortcutGrid;
