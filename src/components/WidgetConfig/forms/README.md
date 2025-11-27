# Widget 配置表单组件

此目录包含各个 Widget 的配置表单组件，用于拆分 `WidgetConfig.jsx` 的复杂性。

## 文件结构

```
forms/
├── README.md                  # 本文件
├── index.js                   # 统一导出所有配置表单
├── ClockConfigForm.jsx        # 时钟 Widget 配置 (~250行)
├── QuoteConfigForm.jsx        # 每日一言 Widget 配置 (~60行)
├── WeatherConfigForm.jsx      # 天气 Widget 配置 (~210行)
├── SearchConfigForm.jsx       # 搜索 Widget 配置 (~25行)
├── TodoConfigForm.jsx         # 待办事项 Widget 配置
├── NoteConfigForm.jsx         # 笔记 Widget 配置
└── SpeedDialConfigForm.jsx    # 快捷键 Widget 配置
```

## 重构成果

**之前**: `WidgetConfig.jsx` 单文件 ~750+ 行

**现在**:
- 主文件: ~268 行 (减少 64%)
- 配置表单: 7 个独立文件，各自管理

## 如何创建新的配置表单

1. **创建新文件**：在此目录下创建 `{WidgetName}ConfigForm.jsx`

2. **编写组件**：
```jsx
/**
 * {WidgetName} Widget 配置表单
 */
export default function {WidgetName}ConfigForm({ config, updateConfig }) {
  return (
    <div className="space-y-6">
      {/* 配置项 */}
    </div>
  );
}
```

3. **添加导出**：在 `index.js` 中添加导出
```js
export { default as {WidgetName}ConfigForm } from './{WidgetName}ConfigForm';
```

4. **在 WidgetConfig.jsx 中使用**：
```jsx
// 导入
import { ClockConfigForm, QuoteConfigForm, {WidgetName}ConfigForm } from './forms';

// 在 renderConfigForm 中使用
case '{widgetId}':
  return <{WidgetName}ConfigForm config={config} updateConfig={updateConfig} />;
```

## Props 说明

所有配置表单组件接收以下 props：

- `config` (Object): 当前 widget 实例的配置对象
- `updateConfig` (Function): 更新配置的函数
  - 支持嵌套路径：`updateConfig('font.family', value)`
  - 支持简单键：`updateConfig('timeFormat', value)`

## 注意事项

- 配置表单应该是纯展示组件，不应包含业务逻辑
- 使用 `updateConfig` 更新配置时会自动保存
- 支持实时预览，配置变化会立即反映在预览区域
- 样式应保持一致，使用 Tailwind CSS
