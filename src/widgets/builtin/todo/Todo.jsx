import { useState, useEffect } from 'react';
import { MdAdd, MdDelete, MdCheckCircle, MdRadioButtonUnchecked, MdDragIndicator } from 'react-icons/md';
import useStore from '../../../store/useStore';
import { useWidgetStyles } from '../../core/widgetStyles';

/**
 * Todo Widget - 多实例支持
 * @param {string} instanceId - 实例 ID (可选，用于多实例)
 * @param {object} config - Widget 配置 (从新架构传入)
 * @param {object} manifest - Widget manifest 信息
 */
function Todo({ instanceId, config, manifest }) {
  const { widgets, updateWidget, updateWidgetInstance } = useStore();

  // 获取背景样式配置（从 config 或 manifest）
  const showBackground = config?.showBackground ?? manifest?.defaultBackground ?? true;
  const widgetStyles = useWidgetStyles(useStore, { showBackground });

  // 优先使用传入的 config，否则使用旧架构的配置（兼容性）
  const todoConfig = config || widgets.todo || { items: [] };
  const [items, setItems] = useState(todoConfig.items || []);
  const [inputValue, setInputValue] = useState('');
  const [draggedItemId, setDraggedItemId] = useState(null);
  const [dragOverItemId, setDragOverItemId] = useState(null);

  // 同步到 store
  useEffect(() => {
    if (instanceId) {
      updateWidgetInstance(instanceId, { items });
    } else {
      updateWidget('todo', { items });
    }
  }, [items, instanceId, updateWidget, updateWidgetInstance]);

  // 添加待办事项
  const handleAdd = () => {
    if (!inputValue.trim()) return;

    const newItem = {
      id: Date.now(),
      text: inputValue.trim(),
      completed: false,
      createdAt: new Date().toISOString(),
    };

    setItems([...items, newItem]);
    setInputValue('');
  };

  // 切换完成状态
  const handleToggle = (id) => {
    setItems(items.map(item =>
      item.id === id ? { ...item, completed: !item.completed } : item
    ));
  };

  // 删除待办事项
  const handleDelete = (id) => {
    setItems(items.filter(item => item.id !== id));
  };

  // 回车添加
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAdd();
    }
  };

  // 拖拽开始
  const handleDragStart = (e, itemId) => {
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
    // 设置拖拽图标为半透明
    e.dataTransfer.setData('text/html', e.currentTarget);
  };

  // 拖拽经过
  const handleDragOver = (e, itemId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    if (draggedItemId && draggedItemId !== itemId) {
      setDragOverItemId(itemId);
    }
  };

  // 拖拽结束
  const handleDragEnd = () => {
    if (draggedItemId && dragOverItemId && draggedItemId !== dragOverItemId) {
      const newItems = [...items];
      const draggedIndex = newItems.findIndex(item => item.id === draggedItemId);
      const targetIndex = newItems.findIndex(item => item.id === dragOverItemId);

      // 移除拖拽的项
      const [draggedItem] = newItems.splice(draggedIndex, 1);
      // 插入到目标位置
      newItems.splice(targetIndex, 0, draggedItem);

      setItems(newItems);
    }

    setDraggedItemId(null);
    setDragOverItemId(null);
  };

  // 拖拽离开
  const handleDragLeave = (e) => {
    // 只有当离开整个元素时才清除
    if (e.currentTarget === e.target) {
      setDragOverItemId(null);
    }
  };

  // 统计
  const totalCount = items.length;
  const completedCount = items.filter(item => item.completed).length;
  const activeCount = totalCount - completedCount;

  return (
    <div className={`${widgetStyles.containerClass} flex flex-col`} style={widgetStyles.containerStyle}>
      {/* 标题和统计 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className={`text-lg font-semibold ${widgetStyles.textPrimary}`}>
          待办事项
        </h3>
        <div className={`text-sm ${widgetStyles.textMuted}`}>
          {activeCount > 0 ? (
            <span>{activeCount} 项待办</span>
          ) : (
            <span className="text-green-500">全部完成 ✓</span>
          )}
        </div>
      </div>

      {/* 输入框 */}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="添加新任务..."
          className={`flex-1 px-3 py-2 text-sm ${widgetStyles.inputClass}`}
        />
        <button
          onClick={handleAdd}
          className={`p-2 ${widgetStyles.primaryButton} rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
          disabled={!inputValue.trim()}
          title="添加任务"
        >
          <MdAdd size={20} />
        </button>
      </div>

      {/* 待办事项列表 */}
      <div className="flex-1 overflow-y-auto space-y-2">
        {items.length === 0 ? (
          <div className={`flex flex-col items-center justify-center h-full ${widgetStyles.textMuted}`}>
            <svg className="w-16 h-16 mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-sm">暂无待办事项</p>
            <p className="text-xs mt-1">在上方输入框添加任务</p>
          </div>
        ) : (
          items.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragEnd={handleDragEnd}
              onDragLeave={handleDragLeave}
              className={`
                flex items-center gap-2 p-2 rounded-lg
                ${widgetStyles.cardClass}
                transition-all duration-200 group cursor-move
                ${item.completed ? 'opacity-60' : ''}
                ${draggedItemId === item.id ? 'opacity-50 scale-95' : ''}
                ${dragOverItemId === item.id ? `border-2 border-${widgetStyles.styles.primaryColor} border-dashed` : ''}
              `}
            >
              {/* 拖拽图标 */}
              <div className={`flex-shrink-0 ${widgetStyles.textMuted} opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing`}>
                <MdDragIndicator size={20} />
              </div>

              {/* 复选框 */}
              <button
                onClick={() => handleToggle(item.id)}
                className={`flex-shrink-0 ${widgetStyles.textMuted} hover:text-${widgetStyles.styles.primaryColor} transition-colors`}
                title={item.completed ? '标记为未完成' : '标记为完成'}
              >
                {item.completed ? (
                  <MdCheckCircle size={20} className="text-green-500" />
                ) : (
                  <MdRadioButtonUnchecked size={20} />
                )}
              </button>

              {/* 任务文本 */}
              <span
                className={`
                  flex-1 text-sm ${widgetStyles.textPrimary}
                  ${item.completed ? `line-through ${widgetStyles.textMuted}` : ''}
                `}
              >
                {item.text}
              </span>

              {/* 删除按钮 */}
              <button
                onClick={() => handleDelete(item.id)}
                className={`flex-shrink-0 ${widgetStyles.textMuted} hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100`}
                title="删除任务"
              >
                <MdDelete size={18} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* 底部操作 */}
      {items.length > 0 && (
        <div className={`mt-3 pt-3 border-t border-${widgetStyles.styles.border.color} dark:border-${widgetStyles.styles.border.colorDark} flex items-center justify-between text-xs ${widgetStyles.textMuted}`}>
          <span>
            共 {totalCount} 项，已完成 {completedCount} 项
          </span>
          {completedCount > 0 && (
            <button
              onClick={() => setItems(items.filter(item => !item.completed))}
              className="text-red-500 hover:text-red-600 transition-colors"
            >
              清除已完成
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default Todo;
