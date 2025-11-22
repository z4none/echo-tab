/**
 * 获取网站的 favicon URL
 * @param {string} url - 网站 URL
 * @returns {string} favicon URL
 */
export const getFaviconUrl = (url) => {
  try {
    const urlObj = new URL(url);
    const domain = urlObj.origin;

    // 使用 Google 的 favicon 服务
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
  } catch (error) {
    console.error('Invalid URL:', error);
    return '';
  }
};

/**
 * 从 URL 中提取网站名称
 * @param {string} url - 网站 URL
 * @returns {string} 网站名称
 */
export const getWebsiteName = (url) => {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname;

    // 移除 www. 前缀
    hostname = hostname.replace(/^www\./, '');

    // 获取主域名（去除子域名）
    const parts = hostname.split('.');
    if (parts.length >= 2) {
      return parts[parts.length - 2];
    }

    return hostname;
  } catch (error) {
    return '';
  }
};

/**
 * 验证 URL 是否有效
 * @param {string} url - 网站 URL
 * @returns {boolean} 是否有效
 */
export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 标准化 URL（自动添加协议）
 * @param {string} url - 输入的 URL
 * @returns {string} 标准化后的 URL
 */
export const normalizeUrl = (url) => {
  if (!url) return '';

  // 如果没有协议，添加 https://
  if (!/^https?:\/\//i.test(url)) {
    return `https://${url}`;
  }

  return url;
};
