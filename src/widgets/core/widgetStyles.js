/**
 * Widget 统一样式工具
 * 根据全局样式配置生成一致的 className
 */

/**
 * 将 hex 颜色转换为 rgba
 * @param {string} hex - hex 颜色值 (如 '#ffffff')
 * @param {number} alpha - 透明度 (0-100)
 * @returns {string} - rgba 字符串
 */
const hexToRgba = (hex, alpha) => {
  // 处理无效输入
  if (!hex || typeof hex !== 'string') {
    return `rgba(255, 255, 255, ${alpha / 100})`; // 默认白色
  }

  // 确保 hex 以 # 开头
  const normalizedHex = hex.startsWith('#') ? hex : `#${hex}`;

  // 验证 hex 格式
  if (normalizedHex.length !== 7) {
    return `rgba(255, 255, 255, ${alpha / 100})`; // 默认白色
  }

  const r = parseInt(normalizedHex.slice(1, 3), 16);
  const g = parseInt(normalizedHex.slice(3, 5), 16);
  const b = parseInt(normalizedHex.slice(5, 7), 16);

  // 验证解析结果
  if (isNaN(r) || isNaN(g) || isNaN(b)) {
    return `rgba(255, 255, 255, ${alpha / 100})`; // 默认白色
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha / 100})`;
};

/**
 * 生成 Widget 容器的基础样式类名和内联样式
 * @param {Object} styles - widgetStyles 配置对象
 * @param {boolean} isDark - 是否为深色模式
 * @param {Object} options - 可选配置
 * @param {boolean} options.showBackground - 是否显示背景（默认 true）
 * @param {boolean} options.showBorder - 是否显示边框（默认跟随 showBackground）
 * @param {boolean} options.showShadow - 是否显示阴影（默认跟随 showBackground）
 * @param {boolean} options.showPadding - 是否显示内边距（默认跟随 showBackground）
 * @returns {Object} - { className, style }
 */
export const getWidgetContainerStyle = (styles, isDark = false, options = {}) => {
  const {
    background,
    borderRadius,
    shadow,
    padding,
    border,
  } = styles;

  const {
    showBackground = true,
    showBorder = showBackground,
    showShadow = showBackground,
    showPadding = showBackground,
  } = options;

  const classes = [
    'w-full',
    'h-full',
  ];

  const style = {};

  // 只有显示背景时才添加背景相关样式
  if (showBackground) {
    if (showPadding) {
      classes.push(`p-${padding}`);
    }
    classes.push(`rounded-${borderRadius}`);
    if (showShadow) {
      classes.push(`shadow-${shadow}`);
    }

    // 添加背景模糊
    if (background.blur !== 'none') {
      classes.push(`backdrop-blur-${background.blur}`);
    }

    // 生成背景色的内联样式
    const bgColor = isDark ? background.colorDark : background.color;
    style.backgroundColor = hexToRgba(bgColor, background.opacity);
  }

  // 添加边框
  if (showBorder && border.enabled) {
    classes.push(
      `border-${border.width}`,
      `border-${border.color}`,
      `dark:border-${border.colorDark}`
    );
  }

  return {
    className: classes.join(' '),
    style,
  };
};

/**
 * 生成 Widget 容器的基础样式类名（旧版，保持兼容）
 * @param {Object} styles - widgetStyles 配置对象
 * @returns {string} - Tailwind className 字符串
 */
export const getWidgetContainerClass = (styles) => {
  const result = getWidgetContainerStyle(styles, false);
  return result.className;
};

/**
 * 生成主要文字颜色类名
 * @param {Object} styles - widgetStyles 配置对象
 * @returns {string} - className 字符串
 */
export const getTextPrimaryClass = (styles) => {
  return `text-${styles.text.primary} dark:text-${styles.text.primaryDark}`;
};

/**
 * 生成次要文字颜色类名
 * @param {Object} styles - widgetStyles 配置对象
 * @returns {string} - className 字符串
 */
export const getTextSecondaryClass = (styles) => {
  return `text-${styles.text.secondary} dark:text-${styles.text.secondaryDark}`;
};

/**
 * 生成弱化文字颜色类名
 * @param {Object} styles - widgetStyles 配置对象
 * @returns {string} - className 字符串
 */
export const getTextMutedClass = (styles) => {
  return `text-${styles.text.muted} dark:text-${styles.text.mutedDark}`;
};

/**
 * 生成主题色按钮类名
 * @param {Object} styles - widgetStyles 配置对象
 * @returns {string} - className 字符串
 */
export const getPrimaryButtonClass = (styles) => {
  return `bg-${styles.primaryColor} hover:bg-${styles.primaryColorHover} text-white`;
};

/**
 * 生成交互元素悬停背景类名
 * @param {Object} styles - widgetStyles 配置对象
 * @returns {string} - className 字符串
 */
export const getHoverBgClass = (styles) => {
  return `hover:bg-${styles.interactive.hoverBg} dark:hover:bg-${styles.interactive.hoverBgDark}`;
};

/**
 * 生成激活状态背景类名
 * @param {Object} styles - widgetStyles 配置对象
 * @returns {string} - className 字符串
 */
export const getActiveBgClass = (styles) => {
  return `bg-${styles.interactive.activeBg} dark:bg-${styles.interactive.activeBgDark}`;
};

/**
 * 生成输入框样式类名
 * @param {Object} styles - widgetStyles 配置对象
 * @returns {string} - className 字符串
 */
export const getInputClass = (styles) => {
  const classes = [
    'bg-white dark:bg-gray-800',
    'text-gray-900 dark:text-gray-100',
    'placeholder-gray-400 dark:placeholder-gray-500',
    `border border-${styles.border.color} dark:border-${styles.border.colorDark}`,
    `rounded-${borderRadiusMap[styles.borderRadius] || 'lg'}`,
    `focus:outline-none focus:ring-2 focus:ring-${styles.primaryColor}`,
  ];

  return classes.join(' ');
};

/**
 * 生成卡片/项目样式类名（用于列表项等）
 * @param {Object} styles - widgetStyles 配置对象
 * @returns {string} - className 字符串
 */
export const getCardClass = (styles) => {
  const smallerRadius = borderRadiusMap[styles.borderRadius] || 'lg';
  return [
    'bg-white/50',
    'dark:bg-gray-800/50',
    `rounded-${smallerRadius}`,
    getHoverBgClass(styles),
  ].join(' ');
};

// 圆角映射表（用于内部元素，比容器小一级）
const borderRadiusMap = {
  'none': 'none',
  'sm': 'sm',
  'md': 'md',
  'lg': 'md',
  'xl': 'lg',
  '2xl': 'xl',
  '3xl': '2xl',
  'full': 'full',
};

/**
 * Hook: 获取 Widget 样式配置和辅助函数
 * @param {Object} useStore - Zustand store hook
 * @param {Object} options - 容器样式选项（传递给 getWidgetContainerStyle）
 * @param {boolean} options.showBackground - 是否显示背景（默认 true）
 * @param {boolean} options.showBorder - 是否显示边框（默认跟随 showBackground）
 * @param {boolean} options.showShadow - 是否显示阴影（默认跟随 showBackground）
 * @param {boolean} options.showPadding - 是否显示内边距（默认跟随 showBackground）
 * @returns {Object} - { styles, containerClass, containerStyle, getTextPrimary, ... }
 */
export const useWidgetStyles = (useStore, options = {}) => {
  const widgetStyles = useStore((state) => state.widgetStyles);
  const theme = useStore((state) => state.theme);
  const isDark = theme === 'dark';

  const containerStyleObj = getWidgetContainerStyle(widgetStyles, isDark, options);

  return {
    styles: widgetStyles,
    // 容器样式（新版，包含内联样式）
    containerClass: containerStyleObj.className,
    containerStyle: containerStyleObj.style,
    // 文字样式
    textPrimary: getTextPrimaryClass(widgetStyles),
    textSecondary: getTextSecondaryClass(widgetStyles),
    textMuted: getTextMutedClass(widgetStyles),
    // 按钮样式
    primaryButton: getPrimaryButtonClass(widgetStyles),
    // 交互样式
    hoverBg: getHoverBgClass(widgetStyles),
    activeBg: getActiveBgClass(widgetStyles),
    // 表单样式
    inputClass: getInputClass(widgetStyles),
    // 卡片样式
    cardClass: getCardClass(widgetStyles),
  };
};
