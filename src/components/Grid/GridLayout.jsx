import { useMemo, useState } from 'react';
import GridItem from './GridItem';
import useStore from '../../store/useStore';
import { DynamicWidget } from '../../widgets';
import ShortcutCard from '../Shortcut/ShortcutCard';
import { findOverlappingItems, findNearestEmptyPosition } from '../../utils/gridUtils';

/**
 * GridLayout - Android 风格的网格布局容器
 * 管理所有 widgets 和 shortcuts 的位置
 */
const GridLayout = ({ onEditShortcut, onDeleteShortcut, onConfigWidget }) => {
  const {
    layout,
    gridConfig,
    isEditMode,
    updateLayout,
    shortcuts,
    widgetInstances,
    removeWidgetInstance,
  } = useStore();

  // 预览布局（拖动时显示）
  const [previewLayout, setPreviewLayout] = useState(null);
  const [draggingItemId, setDraggingItemId] = useState(null);
  const [resizingItemId, setResizingItemId] = useState(null);
  const [originalLayout, setOriginalLayout] = useState(null); // 拖动/调整大小开始时的原始布局

  // 使用预览布局或真实布局
  const displayLayout = previewLayout || layout;

  // 计算容器尺寸（固定 px）
  const containerSize = useMemo(() => {
    const { cols, rows, cellSize, gap } = gridConfig;

    // 总宽度 = cols * cellSize + (cols + 1) * gap
    const width = cols * cellSize + (cols + 1) * gap;

    // 总高度 = rows * cellSize + (rows + 1) * gap
    const height = rows * cellSize + (rows + 1) * gap;

    return { width, height };
  }, [gridConfig]);

  // 使用固定的行数
  const totalRows = gridConfig.rows;

  // 渲染网格线
  const renderGridLines = () => {
    if (!isEditMode) return null;

    const { cols, cellSize, gap } = gridConfig;
    const lines = [];

    // 渲染每个网格单元格
    for (let row = 0; row < totalRows; row++) {
      for (let col = 0; col < cols; col++) {
        lines.push(
          <div
            key={`grid-${row}-${col}`}
            className="absolute border border-dashed border-primary-300/30 dark:border-primary-500/30"
            style={{
              left: `${gap + col * (cellSize + gap)}px`,
              top: `${gap + row * (cellSize + gap)}px`,
              width: `${cellSize}px`,
              height: `${cellSize}px`,
              pointerEvents: 'none',
            }}
          />
        );
      }
    }

    return lines;
  };

  // 计算推挤后的布局（通用函数）
  const calculatePushedLayout = (id, newX, newY, baseLayout) => {
    const movingItem = baseLayout.find((item) => item.id === id);
    if (!movingItem) return baseLayout;

    const { w: movingW, h: movingH } = movingItem;

    // 查找与新位置重叠的元素
    const overlappingItems = findOverlappingItems(
      newX,
      newY,
      movingW,
      movingH,
      baseLayout,
      id
    );

    // 如果没有重叠，直接移动
    if (overlappingItems.length === 0) {
      return baseLayout.map((item) =>
        item.id === id ? { ...item, x: newX, y: newY } : item
      );
    }

    // 如果只有一个重叠，且尺寸相同，直接交换
    if (overlappingItems.length === 1) {
      const targetItem = overlappingItems[0];

      if (targetItem.w === movingW && targetItem.h === movingH) {
        // 同尺寸交换
        return baseLayout.map((item) => {
          if (item.id === id) {
            // 移动元素去用户拖动的目标位置
            return { ...item, x: newX, y: newY };
          } else if (item.id === targetItem.id) {
            // 被占位的元素去移动元素的原位
            return { ...item, x: movingItem.x, y: movingItem.y };
          }
          return item;
        });
      }
    }

    // 推挤模式：将所有重叠的元素推到空位
    const newLayout = [...baseLayout];
    const pushedItems = new Set();

    // 先更新移动的元素
    const movingIndex = newLayout.findIndex((item) => item.id === id);
    newLayout[movingIndex] = { ...movingItem, x: newX, y: newY };
    pushedItems.add(id);

    // 为每个被重叠的元素找空位
    for (const overlappedItem of overlappingItems) {
      if (pushedItems.has(overlappedItem.id)) continue;

      const emptyPos = findNearestEmptyPosition(
        overlappedItem.x,
        overlappedItem.y,
        overlappedItem.w,
        overlappedItem.h,
        newLayout,
        overlappedItem.id,
        gridConfig.cols
      );

      // 更新被推挤元素的位置
      const overlappedIndex = newLayout.findIndex(
        (item) => item.id === overlappedItem.id
      );
      newLayout[overlappedIndex] = {
        ...overlappedItem,
        x: emptyPos.x,
        y: emptyPos.y,
      };
      pushedItems.add(overlappedItem.id);
    }

    return newLayout;
  };

  // 拖动开始
  const handleDragStart = (id) => {
    setDraggingItemId(id);
    setOriginalLayout(layout); // 保存拖动开始时的原始布局
    setPreviewLayout(layout);
  };

  // 拖动过程中（实时更新预览）
  const handleDragMove = (id, newX, newY) => {
    if (!draggingItemId) {
      setDraggingItemId(id);
    }

    // 关键修改：始终基于原始布局计算，而不是预览布局
    const baseLayout = originalLayout || layout;
    const newPreviewLayout = calculatePushedLayout(id, newX, newY, baseLayout);
    setPreviewLayout(newPreviewLayout);
  };

  // 拖动结束（提交布局）
  const handleDragEnd = (id, newX, newY) => {
    // 基于原始布局计算最终布局
    const baseLayout = originalLayout || layout;
    const newLayout = calculatePushedLayout(id, newX, newY, baseLayout);

    // 提交到 store
    const store = useStore.getState();
    store.setLayout(newLayout);

    // 清除预览和原始布局
    setPreviewLayout(null);
    setDraggingItemId(null);
    setOriginalLayout(null);
  };

  // Resize 开始
  const handleResizeStart = (id) => {
    setResizingItemId(id);
    setOriginalLayout(layout); // 保存原始布局
    setPreviewLayout(layout);
  };

  // Resize 过程中（实时更新预览）
  const handleResizeMove = (id, newW, newH) => {
    if (!resizingItemId) {
      setResizingItemId(id);
    }

    // 基于原始布局更新尺寸
    const baseLayout = originalLayout || layout;
    const newPreviewLayout = baseLayout.map((item) =>
      item.id === id ? { ...item, w: newW, h: newH } : item
    );
    setPreviewLayout(newPreviewLayout);
  };

  // Resize 结束（提交布局）
  const handleResizeEnd = (id, newW, newH) => {
    // 基于原始布局计算最终布局
    const baseLayout = originalLayout || layout;
    const newLayout = baseLayout.map((item) =>
      item.id === id ? { ...item, w: newW, h: newH } : item
    );

    // 提交到 store
    const store = useStore.getState();
    store.setLayout(newLayout);

    // 清除预览和原始布局
    setPreviewLayout(null);
    setResizingItemId(null);
    setOriginalLayout(null);
  };

  // 处理配置 Widget
  const handleConfigWidget = (widgetId) => {
    if (onConfigWidget) {
      onConfigWidget(widgetId);
    }
  };

  // 处理删除 Widget
  const handleDeleteWidget = (widgetId) => {
    if (confirm('确定要删除这个 Widget 吗？')) {
      removeWidgetInstance(widgetId);
    }
  };

  // 渲染单个网格项
  const renderGridItem = (layoutItem) => {
    const { id, x, y, w, h } = layoutItem;

    let content = null;
    let needsCentering = false;

    // 检查是否是 widget 实例
    const widgetInstance = widgetInstances.find((inst) => inst.id === id);

    if (widgetInstance) {
      // Widget 实例
      content = <DynamicWidget widgetId={id} />;
      // Search 需要居中包装器
      if (widgetInstance.type === 'search') {
        needsCentering = true;
      }
    } else if (id.startsWith('shortcut-')) {
      // 快捷方式
      const shortcutId = parseInt(id.replace('shortcut-', ''));
      const shortcut = shortcuts.find((s) => s.id === shortcutId);

      if (!shortcut) return null;

      content = (
        <ShortcutCard
          shortcut={shortcut}
          isEditMode={isEditMode}
          onEdit={onEditShortcut}
          onDelete={onDeleteShortcut}
        />
      );
    }

    if (!content) return null;

    // 如果需要居中，添加包装器
    const wrappedContent = needsCentering ? (
      <div className="w-full h-full flex items-center justify-center">
        {content}
      </div>
    ) : content;

    // Widget 实例显示配置和删除按钮
    const showActions = !!widgetInstance;

    return (
      <GridItem
        key={id}
        id={id}
        x={x}
        y={y}
        w={w}
        h={h}
        gridConfig={gridConfig}
        isEditMode={isEditMode}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
        onResizeStart={handleResizeStart}
        onResizeMove={handleResizeMove}
        onResizeEnd={handleResizeEnd}
        isDragging={draggingItemId === id}
        isResizing={resizingItemId === id}
        onConfig={showActions ? handleConfigWidget : null}
        onDelete={showActions ? handleDeleteWidget : null}
      >
        {wrappedContent}
      </GridItem>
    );
  };

  // 根据 9 宫格位置获取对齐样式
  const getContainerAlignmentStyle = () => {
    const { position } = gridConfig;

    const style = {
      display: 'flex',
      width: '100%',
      minHeight: '100vh',
    };

    // 根据 9 宫格位置设置对齐
    // lt: 左上, t: 上, rt: 右上
    // l: 左, c: 中, r: 右
    // lb: 左下, b: 下, rb: 右下

    const alignmentMap = {
      'lt': { justifyContent: 'flex-start', alignItems: 'flex-start' },
      't': { justifyContent: 'center', alignItems: 'flex-start' },
      'rt': { justifyContent: 'flex-end', alignItems: 'flex-start' },
      'l': { justifyContent: 'flex-start', alignItems: 'center' },
      'c': { justifyContent: 'center', alignItems: 'center' },
      'r': { justifyContent: 'flex-end', alignItems: 'center' },
      'lb': { justifyContent: 'flex-start', alignItems: 'flex-end' },
      'b': { justifyContent: 'center', alignItems: 'flex-end' },
      'rb': { justifyContent: 'flex-end', alignItems: 'flex-end' },
    };

    const alignment = alignmentMap[position] || alignmentMap['c'];
    Object.assign(style, alignment);

    return style;
  };

  return (
    <div style={getContainerAlignmentStyle()}>
      <div
        className="grid-layout relative"
        style={{
          width: `${containerSize.width}px`,
          height: `${containerSize.height}px`,
        }}
      >
        {/* 网格线（仅编辑模式） */}
        {renderGridLines()}

        {/* 网格项 */}
        {displayLayout.map((item) => renderGridItem(item))}
      </div>
    </div>
  );
};

export default GridLayout;
