import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useWidgetStyles } from '../../core/widgetStyles';
import useStore from '../../../store/useStore';

/**
 * Note Widget - 支持 Markdown 的笔记（预览模式）
 * 编辑功能在配置侧栏中进行
 * @param {string} instanceId - 实例 ID
 * @param {object} config - Widget 配置 (从新架构传入)
 * @param {object} manifest - Widget manifest 信息
 */
function Note({ instanceId, config, manifest }) {
  // 获取背景样式配置（从 config 或 manifest）
  const showBackground = config?.showBackground ?? manifest?.defaultBackground ?? true;
  const widgetStyles = useWidgetStyles(useStore, { showBackground });

  // 获取笔记内容
  const content = config?.content || '';

  return (
    <div className={`${widgetStyles.containerClass} flex flex-col h-full`} style={widgetStyles.containerStyle}>
      {/* 内容区域 - Markdown 预览 */}
      <div className="flex-1 overflow-y-auto min-h-0 p-4 custom-scrollbar">
        {content ? (
          <div className={`prose prose-sm dark:prose-invert max-w-none ${widgetStyles.textPrimary}`}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full">
            <p className={`${widgetStyles.textMuted} text-center`}>
              暂无内容
            </p>
            <p className={`${widgetStyles.textMuted} text-xs text-center mt-2`}>
              点击右上角配置按钮开始编辑
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Note;
