import { useState, useEffect } from 'react';

/**
 * Note Widget 配置表单
 */
export default function NoteConfigForm({ config, updateConfig }) {
  const [localContent, setLocalContent] = useState(config?.content || '');

  // 同步外部配置到本地状态
  useEffect(() => {
    setLocalContent(config?.content || '');
  }, [config]);

  // 实时更新内容
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setLocalContent(newContent);
    updateConfig('content', newContent);
  };

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* 编辑器标题 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          笔记内容
        </label>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          左侧实时预览效果
        </p>
      </div>

      {/* Markdown 编辑器 */}
      <div className="flex-1 min-h-0 border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
        <textarea
          value={localContent}
          onChange={handleContentChange}
          placeholder="支持 Markdown 语法...

示例：
# 标题
## 二级标题

**粗体** *斜体*

- 列表项1
- 列表项2

[链接](https://example.com)

```javascript
代码块
```"
          className="w-full h-full p-4 resize-none bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-mono text-sm focus:outline-none"
          style={{ minHeight: '400px' }}
        />
      </div>

      {/* Markdown 语法提示 */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p className="font-medium">Markdown 快速参考：</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1">
          <p><code className="px-1 bg-gray-100 dark:bg-gray-700 rounded"># 标题</code> 一级标题</p>
          <p><code className="px-1 bg-gray-100 dark:bg-gray-700 rounded">## 标题</code> 二级标题</p>
          <p><code className="px-1 bg-gray-100 dark:bg-gray-700 rounded">**粗体**</code> 粗体文字</p>
          <p><code className="px-1 bg-gray-100 dark:bg-gray-700 rounded">*斜体*</code> 斜体文字</p>
          <p><code className="px-1 bg-gray-100 dark:bg-gray-700 rounded">- 列表</code> 无序列表</p>
          <p><code className="px-1 bg-gray-100 dark:bg-gray-700 rounded">[文字](链接)</code> 超链接</p>
        </div>
      </div>
    </div>
  );
}
