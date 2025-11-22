/**
 * 网格布局工具函数
 */

/**
 * 检查两个矩形是否重叠
 */
export function isOverlapping(rect1, rect2) {
  const { x: x1, y: y1, w: w1, h: h1 } = rect1;
  const { x: x2, y: y2, w: w2, h: h2 } = rect2;

  return (
    x1 < x2 + w2 &&
    x1 + w1 > x2 &&
    y1 < y2 + h2 &&
    y1 + h1 > y2
  );
}

/**
 * 获取所有被占用的网格单元格
 */
export function getOccupiedCells(layout) {
  const occupied = new Set();

  layout.forEach((item) => {
    for (let y = item.y; y < item.y + item.h; y++) {
      for (let x = item.x; x < item.x + item.w; x++) {
        occupied.add(`${x},${y}`);
      }
    }
  });

  return occupied;
}

/**
 * 检查指定位置是否可以放置指定尺寸的元素
 */
export function canPlaceAt(x, y, w, h, layout, excludeId, cols) {
  // 边界检查
  if (x < 0 || y < 0 || x + w > cols) return false;

  // 检查是否与其他元素重叠
  const newRect = { x, y, w, h };

  for (const item of layout) {
    if (item.id === excludeId) continue;

    if (isOverlapping(newRect, item)) {
      return false;
    }
  }

  return true;
}

/**
 * 查找最近的空位（螺旋式搜索）
 * @param {number} startX - 起始 X 坐标
 * @param {number} startY - 起始 Y 坐标
 * @param {number} w - 元素宽度
 * @param {number} h - 元素高度
 * @param {Array} layout - 当前布局
 * @param {string} excludeId - 排除的元素 ID
 * @param {number} cols - 列数
 */
export function findNearestEmptyPosition(startX, startY, w, h, layout, excludeId, cols) {
  // 先尝试向右找（同一行）
  for (let x = startX + 1; x <= cols - w; x++) {
    if (canPlaceAt(x, startY, w, h, layout, excludeId, cols)) {
      return { x, y: startY };
    }
  }

  // 尝试下一行开头
  if (canPlaceAt(0, startY + 1, w, h, layout, excludeId, cols)) {
    return { x: 0, y: startY + 1 };
  }

  // 螺旋式扩展搜索
  const maxDistance = 20; // 最大搜索距离

  for (let distance = 1; distance <= maxDistance; distance++) {
    // 搜索正方形的四条边
    for (let dy = -distance; dy <= distance; dy++) {
      for (let dx = -distance; dx <= distance; dx++) {
        // 只检查边界上的点（不是内部的点）
        if (Math.abs(dx) !== distance && Math.abs(dy) !== distance) {
          continue;
        }

        const x = startX + dx;
        const y = startY + dy;

        if (canPlaceAt(x, y, w, h, layout, excludeId, cols)) {
          return { x, y };
        }
      }
    }
  }

  // 如果实在找不到，放在最后
  const maxY = Math.max(...layout.map((item) => item.y + item.h), 0);
  return { x: 0, y: maxY + 1 };
}

/**
 * 查找与指定位置重叠的所有元素
 */
export function findOverlappingItems(x, y, w, h, layout, excludeId) {
  const newRect = { x, y, w, h };
  const overlapping = [];

  for (const item of layout) {
    if (item.id === excludeId) continue;

    if (isOverlapping(newRect, item)) {
      overlapping.push(item);
    }
  }

  return overlapping;
}

/**
 * 计算两个位置之间的曼哈顿距离
 */
export function manhattanDistance(x1, y1, x2, y2) {
  return Math.abs(x1 - x2) + Math.abs(y1 - y2);
}
