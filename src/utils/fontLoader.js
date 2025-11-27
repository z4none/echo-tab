/**
 * 字体加载工具
 * 动态从 Google Fonts 或国内镜像加载字体
 */

export const FONT_SOURCES = {
  google: 'https://fonts.googleapis.com',
  china: 'https://fonts.googleapis.cn'
};

// 已加载的字体缓存
const loadedFonts = new Set();

/**
 * 获取字体源
 * 优先从 Zustand store 读取，fallback 到 localStorage
 */
export const getFontSource = (storeSource) => {
  // 如果传入了 store 的 fontSource，优先使用
  if (storeSource && FONT_SOURCES[storeSource]) {
    return storeSource;
  }

  // fallback 到 localStorage (兼容性)
  const saved = localStorage.getItem('fontSource');
  if (saved && FONT_SOURCES[saved]) {
    return saved;
  }

  return 'google'; // 默认使用 Google 源
};

/**
 * 加载 Google Font
 * @param {string} fontFamily - Google Font 家族名，如 'Roboto', 'Orbitron'
 * @param {number[]} weights - 需要加载的字重，如 [400, 700]
 * @param {string} storeSource - 可选的字体源（从 store 传入）
 */
export const loadGoogleFont = (fontFamily, weights = [400], storeSource = null) => {
  // 系统字体不需要加载
  if (!fontFamily || fontFamily === 'system') {
    return Promise.resolve();
  }

  // 检查是否已加载
  const cacheKey = `${fontFamily}-${weights.join(',')}`;
  if (loadedFonts.has(cacheKey)) {
    console.log(`[FontLoader] 字体已加载（缓存）: ${fontFamily}`);
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const source = FONT_SOURCES[getFontSource(storeSource)];

    // 构建 Google Fonts URL
    // 例如: https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap
    const weightsParam = weights.join(';');
    const fontUrl = `${source}/css2?family=${fontFamily}:wght@${weightsParam}&display=swap`;

    // 创建 link 标签
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = fontUrl;

    link.onload = () => {
      loadedFonts.add(cacheKey);
      console.log(`[FontLoader] 字体加载成功: ${fontFamily}`);
      resolve();
    };

    link.onerror = () => {
      console.error(`[FontLoader] 字体加载失败: ${fontFamily}`);
      reject(new Error(`Failed to load font: ${fontFamily}`));
    };

    document.head.appendChild(link);
  });
};

/**
 * 预加载多个字体
 */
export const preloadFonts = (fonts) => {
  return Promise.allSettled(
    fonts.map(font => {
      if (font.isSystem) return Promise.resolve();
      return loadGoogleFont(font.googleFamily, font.weights);
    })
  );
};

/**
 * 检查字体是否已加载
 */
export const isFontLoaded = (fontFamily, weights = [400]) => {
  const cacheKey = `${fontFamily}-${weights.join(',')}`;
  return loadedFonts.has(cacheKey);
};
