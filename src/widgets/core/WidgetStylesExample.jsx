/**
 * Widget 统一样式使用示例
 *
 * 这个文件展示了如何在 Widget 中使用统一的样式配置
 * 所有新开发的 Widget 都应该遵循这个模式
 */

import { useState } from 'react';
import { MdStar } from 'react-icons/md';
import useStore from '../../store/useStore';
import { useWidgetStyles } from './widgetStyles';

function ExampleWidget() {
  const { widgets, updateWidget } = useStore();
  // 获取统一样式配置
  const widgetStyles = useWidgetStyles(useStore);

  const [count, setCount] = useState(0);

  return (
    // ✅ 容器：使用 containerClass
    <div className={`${widgetStyles.containerClass} flex flex-col`}>
      {/* ✅ 标题：使用 textPrimary */}
      <h3 className={`text-lg font-semibold ${widgetStyles.textPrimary} mb-3`}>
        示例 Widget
      </h3>

      {/* ✅ 描述文字：使用 textSecondary */}
      <p className={`text-sm ${widgetStyles.textSecondary} mb-4`}>
        这是一个使用统一样式的 Widget 示例
      </p>

      {/* ✅ 弱化文字：使用 textMuted */}
      <p className={`text-xs ${widgetStyles.textMuted} mb-4`}>
        当前计数: {count}
      </p>

      {/* ✅ 主要按钮：使用 primaryButton */}
      <button
        onClick={() => setCount(count + 1)}
        className={`${widgetStyles.primaryButton} px-4 py-2 rounded-lg transition-colors mb-3`}
      >
        <div className="flex items-center gap-2">
          <MdStar />
          <span>点击增加</span>
        </div>
      </button>

      {/* ✅ 输入框：使用 inputClass */}
      <input
        type="text"
        placeholder="输入一些内容..."
        className={`${widgetStyles.inputClass} px-3 py-2 text-sm mb-3`}
      />

      {/* ✅ 卡片/列表项：使用 cardClass */}
      <div className={`${widgetStyles.cardClass} p-3 transition-colors`}>
        <div className={`text-sm ${widgetStyles.textPrimary}`}>
          卡片内容
        </div>
        <div className={`text-xs ${widgetStyles.textMuted} mt-1`}>
          这是一个卡片示例
        </div>
      </div>

      {/* ✅ 可悬停元素：使用 hoverBg */}
      <div className={`${widgetStyles.hoverBg} p-2 rounded cursor-pointer mt-2`}>
        <span className={`text-sm ${widgetStyles.textSecondary}`}>
          悬停试试
        </span>
      </div>

      {/* ✅ 直接访问样式配置（用于动态 className） */}
      <div
        className={`
          mt-3 pt-3
          border-t
          border-${widgetStyles.styles.border.color}
          dark:border-${widgetStyles.styles.border.colorDark}
        `}
      >
        <span className={`text-xs ${widgetStyles.textMuted}`}>
          底部信息栏
        </span>
      </div>
    </div>
  );
}

export default ExampleWidget;

/**
 * 样式工具说明：
 *
 * 1. containerClass - Widget 容器基础样式
 *    - 包含：尺寸、内边距、背景、圆角、阴影、模糊
 *
 * 2. textPrimary - 主要文字颜色
 *    - 适用于：标题、主要内容
 *
 * 3. textSecondary - 次要文字颜色
 *    - 适用于：描述文字、辅助信息
 *
 * 4. textMuted - 弱化文字颜色
 *    - 适用于：提示信息、次要数据
 *
 * 5. primaryButton - 主题色按钮
 *    - 包含：背景色、悬停色、文字色
 *
 * 6. inputClass - 输入框样式
 *    - 包含：背景、边框、圆角、焦点样式
 *
 * 7. cardClass - 卡片/列表项样式
 *    - 包含：背景、圆角、悬停效果
 *
 * 8. hoverBg - 悬停背景
 *    - 适用于：可交互元素的悬停状态
 *
 * 9. activeBg - 激活背景
 *    - 适用于：选中/激活状态的元素
 *
 * 10. widgetStyles.styles - 原始配置对象
 *     - 用于需要动态拼接 className 的场景
 *     - 例如：border-${widgetStyles.styles.border.color}
 */
