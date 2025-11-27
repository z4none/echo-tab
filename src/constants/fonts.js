/**
 * 字体配置常量
 * 定义所有可用的字体选项
 */

export const AVAILABLE_FONTS = [
  {
    name: '系统等宽',
    value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    isSystem: true, // 系统字体，无需加载
    preview: '12:34:56',
    description: '系统等宽字体'
  },
  {
    name: 'Roboto Mono',
    value: 'Roboto Mono, monospace',
    weights: [100, 200, 300, 400, 500, 600, 700],
    googleFamily: 'Roboto+Mono',
    preview: '12:34:56',
    description: '清晰易读等宽'
  },
  {
    name: 'JetBrains Mono',
    value: 'JetBrains Mono, monospace',
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
    googleFamily: 'JetBrains+Mono',
    preview: '12:34:56',
    description: '程序员最爱'
  },
  {
    name: 'Fira Code',
    value: 'Fira Code, monospace',
    weights: [300, 400, 500, 600, 700],
    googleFamily: 'Fira+Code',
    preview: '12:34:56',
    description: '优雅等宽字体'
  },
  {
    name: 'Source Code Pro',
    value: 'Source Code Pro, monospace',
    weights: [200, 300, 400, 500, 600, 700, 900],
    googleFamily: 'Source+Code+Pro',
    preview: '12:34:56',
    description: 'Adobe 等宽字体'
  },
  {
    name: 'Space Mono',
    value: 'Space Mono, monospace',
    weights: [400, 700],
    googleFamily: 'Space+Mono',
    preview: '12:34:56',
    description: '复古等宽字体'
  },
  {
    name: 'IBM Plex Mono',
    value: 'IBM Plex Mono, monospace',
    weights: [100, 200, 300, 400, 500, 600, 700],
    googleFamily: 'IBM+Plex+Mono',
    preview: '12:34:56',
    description: 'IBM 专业字体'
  },
  {
    name: 'Inconsolata',
    value: 'Inconsolata, monospace',
    weights: [200, 300, 400, 500, 600, 700, 800, 900],
    googleFamily: 'Inconsolata',
    preview: '12:34:56',
    description: '经典等宽字体'
  }
];

// 字重选项
export const FONT_WEIGHTS = [
  { label: '极细', value: 100 },
  { label: '纤细', value: 200 },
  { label: '细', value: 300 },
  { label: '正常', value: 400 },
  { label: '中等', value: 500 },
  { label: '半粗', value: 600 },
  { label: '粗', value: 700 },
  { label: '特粗', value: 800 },
  { label: '超粗', value: 900 }
];

// 根据字体系列获取字体配置
export const getFontConfig = (fontFamily) => {
  return AVAILABLE_FONTS.find(font => font.value === fontFamily);
};

// 获取字体支持的字重范围
export const getAvailableWeights = (fontFamily) => {
  const font = getFontConfig(fontFamily);
  if (!font || font.isSystem) {
    return [100, 200, 300, 400, 500, 600, 700, 800, 900]; // 系统字体支持所有字重
  }
  return font.weights || [400, 700];
};
