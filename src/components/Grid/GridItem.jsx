import { useState, useRef, useEffect } from 'react';
import { MdSettings, MdClose } from 'react-icons/md';

/**
 * GridItem - 网格布局中的单个项
 * 支持拖动调整位置，实时推挤动画
 */
const GridItem = ({
  id,
  x,
  y,
  w,
  h,
  gridConfig,
  isEditMode,
  onDragStart,
  onDragMove,
  onDragEnd,
  onResizeStart,
  onResizeMove,
  onResizeEnd,
  isDragging,
  isResizing,
  onConfig, // 配置按钮回调
  onDelete, // 删除按钮回调
  children,
}) => {
  const [dragStart, setDragStart] = useState(null);
  const [isLocalDragging, setIsLocalDragging] = useState(false);
  const [resizeStart, setResizeStart] = useState(null);
  const [isLocalResizing, setIsLocalResizing] = useState(false);
  const itemRef = useRef(null);

  const handleMouseDown = (e) => {
    if (!isEditMode) return;

    e.preventDefault();
    e.stopPropagation();

    setDragStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: x,
      startY: y,
    });
    setIsLocalDragging(true);

    // 通知父组件拖动开始
    if (onDragStart) {
      onDragStart(id);
    }
  };

  const handleMouseMove = (e) => {
    if (!isLocalDragging || !dragStart) return;

    const { cols, rows, cellSize, gap } = gridConfig;

    // 计算鼠标移动的距离
    const deltaX = e.clientX - dragStart.mouseX;
    const deltaY = e.clientY - dragStart.mouseY;

    // 转换为网格单位（每个单元格 = cellSize + gap）
    const gridDeltaX = Math.round(deltaX / (cellSize + gap));
    const gridDeltaY = Math.round(deltaY / (cellSize + gap));

    // 计算新位置
    let newX = dragStart.startX + gridDeltaX;
    let newY = dragStart.startY + gridDeltaY;

    // 边界检查
    newX = Math.max(0, Math.min(newX, cols - w));
    newY = Math.max(0, newY);

    // 实时通知父组件位置变化（触发推挤预览）
    if (onDragMove && (newX !== x || newY !== y)) {
      onDragMove(id, newX, newY);
    }
  };

  const handleMouseUp = () => {
    if (!isLocalDragging) return;

    setIsLocalDragging(false);

    const { cols, rows, cellSize, gap } = gridConfig;

    // 计算最终位置
    const deltaX = dragStart ? window.event.clientX - dragStart.mouseX : 0;
    const deltaY = dragStart ? window.event.clientY - dragStart.mouseY : 0;

    const gridDeltaX = Math.round(deltaX / (cellSize + gap));
    const gridDeltaY = Math.round(deltaY / (cellSize + gap));

    let finalX = dragStart ? dragStart.startX + gridDeltaX : x;
    let finalY = dragStart ? dragStart.startY + gridDeltaY : y;

    finalX = Math.max(0, Math.min(finalX, cols - w));
    finalY = Math.max(0, finalY);

    setDragStart(null);

    // 通知父组件拖动结束（提交布局）
    if (onDragEnd) {
      onDragEnd(id, finalX, finalY);
    }
  };

  // Resize 处理函数
  const handleResizeMouseDown = (e) => {
    if (!isEditMode) return;

    e.preventDefault();
    e.stopPropagation(); // 阻止触发拖动

    setResizeStart({
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: w,
      startH: h,
    });
    setIsLocalResizing(true);

    // 通知父组件开始 resize
    if (onResizeStart) {
      onResizeStart(id);
    }
  };

  const handleResizeMouseMove = (e) => {
    if (!isLocalResizing || !resizeStart) return;

    const { cols, rows, cellSize, gap } = gridConfig;

    // 计算鼠标移动的距离
    const deltaX = e.clientX - resizeStart.mouseX;
    const deltaY = e.clientY - resizeStart.mouseY;

    // 转换为网格单位
    const gridDeltaX = Math.round(deltaX / (cellSize + gap));
    const gridDeltaY = Math.round(deltaY / (cellSize + gap));

    // 计算新尺寸
    let newW = resizeStart.startW + gridDeltaX;
    let newH = resizeStart.startH + gridDeltaY;

    // 尺寸限制（最小 1x1，最大不超出边界）
    newW = Math.max(1, Math.min(newW, cols - x));
    newH = Math.max(1, newH);

    // 实时通知父组件尺寸变化
    if (onResizeMove && (newW !== w || newH !== h)) {
      onResizeMove(id, newW, newH);
    }
  };

  const handleResizeMouseUp = () => {
    if (!isLocalResizing) return;

    setIsLocalResizing(false);

    const { cols, rows, cellSize, gap } = gridConfig;

    // 计算最终尺寸
    const deltaX = resizeStart ? window.event.clientX - resizeStart.mouseX : 0;
    const deltaY = resizeStart ? window.event.clientY - resizeStart.mouseY : 0;

    const gridDeltaX = Math.round(deltaX / (cellSize + gap));
    const gridDeltaY = Math.round(deltaY / (cellSize + gap));

    let finalW = resizeStart ? resizeStart.startW + gridDeltaX : w;
    let finalH = resizeStart ? resizeStart.startH + gridDeltaY : h;

    finalW = Math.max(1, Math.min(finalW, cols - x));
    finalH = Math.max(1, finalH);

    setResizeStart(null);

    // 通知父组件 resize 结束
    if (onResizeEnd) {
      onResizeEnd(id, finalW, finalH);
    }
  };

  useEffect(() => {
    if (isLocalDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isLocalDragging, dragStart, x, y]);

  useEffect(() => {
    if (isLocalResizing) {
      document.addEventListener('mousemove', handleResizeMouseMove);
      document.addEventListener('mouseup', handleResizeMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleResizeMouseMove);
        document.removeEventListener('mouseup', handleResizeMouseUp);
      };
    }
  }, [isLocalResizing, resizeStart, w, h, x]);

  const { cellSize, gap } = gridConfig;

  // 简单的固定 px 计算
  const style = {
    position: 'absolute',
    // left = gap + x * (cellSize + gap)
    left: `${gap + x * (cellSize + gap)}px`,
    // top = gap + y * (cellSize + gap)
    top: `${gap + y * (cellSize + gap)}px`,
    // width = w * cellSize + (w-1) * gap
    width: `${w * cellSize + (w - 1) * gap}px`,
    // height = h * cellSize + (h-1) * gap
    height: `${h * cellSize + (h - 1) * gap}px`,
    transition: isLocalDragging || isLocalResizing ? 'none' : 'all 0.3s ease',
    cursor: isEditMode ? 'move' : 'default',
    zIndex: isDragging || isResizing ? 1000 : 1,
    opacity: isDragging || isResizing ? 0.8 : 1,
  };

  return (
    <div
      ref={itemRef}
      style={style}
      onMouseDown={handleMouseDown}
      className="grid-item relative group"
    >
      {children}

      {/* Config and Delete Buttons - hover 时显示 */}
      {isEditMode && (
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
          {onConfig && (
            <button
              onClick={(e) => {
                e.stopPropagation();

                // 检查 widget 是否有自己的配置界面
                const widgetContainer = itemRef.current?.querySelector('[data-has-own-config="true"]');
                if (widgetContainer) {
                  // 如果 widget 有自己的配置界面，触发它的编辑按钮
                  const editBtn = widgetContainer.querySelector('.speeddial-edit-btn, [data-widget-edit-btn]');
                  if (editBtn) {
                    editBtn.click();
                    return;
                  }
                }

                // 否则打开配置侧栏
                onConfig(id);
              }}
              onMouseDown={(e) => e.stopPropagation()} // 防止触发拖动
              className="p-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-md"
              title="配置"
            >
              <MdSettings size={18} />
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(id);
              }}
              onMouseDown={(e) => e.stopPropagation()} // 防止触发拖动
              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-md"
              title="删除"
            >
              <MdClose size={18} />
            </button>
          )}
        </div>
      )}

      {/* Resize Handle - 右下角 */}
      {isEditMode && (
        <div
          onMouseDown={handleResizeMouseDown}
          className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize z-10"
          style={{
            background: 'linear-gradient(135deg, transparent 50%, #3b82f6 50%)',
            borderBottomRightRadius: '4px',
          }}
          title="拖动调整大小"
        />
      )}
    </div>
  );
};

export default GridItem;
