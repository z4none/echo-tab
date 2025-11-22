/**
 * Widget 统一样式工具
 * 根据全局样式配置生成一致的 className
 */

/**
 * 生成 Widget 容器的基础样式类名
 * @param {Object} styles - widgetStyles 配置对象
 * @returns {string} - Tailwind className 字符串
 */
export const getWidgetContainerClass = (styles) => {
  const {
    background,
    borderRadius,
    shadow,
    padding,
    border,
  } = styles;

  const classes = [
    'w-full',
    'h-full',
    `p-${padding}`,
    `bg-${background.base}/${background.opacity}`,
    `dark:bg-${background.baseDark}/${background.opacity}`,
    `rounded-${borderRadius}`,
    `shadow-${shadow}`,
  ];

  // 添加背景模糊
  if (background.blur !== 'none') {
    classes.push(`backdrop-blur-${background.blur}`);
  }

  // 添加边框
  if (border.enabled) {
    classes.push(
      `border-${border.width}`,
      `border-${border.color}`,
      `dark:border-${border.colorDark}`
    );
  }

  return classes.join(' ');
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
  return [
    `bg-${styles.background.base}`,
    `dark:bg-${styles.background.baseDark}`,
    `border border-${styles.border.color}`,
    `dark:border-${styles.border.colorDark}`,
    `rounded-${borderRadiusMap[styles.borderRadius] || 'lg'}`,
    `focus:outline-none focus:ring-2 focus:ring-${styles.primaryColor}`,
    getTextPrimaryClass(styles),
  ].join(' ');
};

/**
 * 生成卡片/项目样式类名（用于列表项等）
 * @param {Object} styles - widgetStyles 配置对象
 * @returns {string} - className 字符串
 */
export const getCardClass = (styles) => {
  const smallerRadius = borderRadiusMap[styles.borderRadius] || 'lg';
  return [
    `bg-${styles.background.base}/50`,
    `dark:bg-${styles.background.baseDark}/50`,
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
 * @returns {Object} - { styles, getContainerClass, getTextPrimary, ... }
 */
export const useWidgetStyles = (useStore) => {
  const widgetStyles = useStore((state) => state.widgetStyles);

  return {
    styles: widgetStyles,
    // 容器样式
    containerClass: getWidgetContainerClass(widgetStyles),
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
