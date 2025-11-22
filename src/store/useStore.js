import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useStore = create(
  persist(
    (set) => ({
      // 主题设置
      theme: 'light',
      setTheme: (theme) => set({ theme }),

      // 网站快捷方式
      shortcuts: [],
      addShortcut: (shortcut) =>
        set((state) => {
          const id = Date.now();
          const newShortcut = { ...shortcut, id };

          // 找到第一个空闲的位置
          const findEmptyPosition = () => {
            const { cols } = state.gridConfig;
            const occupied = new Set();

            // 标记所有被占用的格子
            state.layout.forEach((item) => {
              for (let y = item.y; y < item.y + item.h; y++) {
                for (let x = item.x; x < item.x + item.w; x++) {
                  occupied.add(`${x},${y}`);
                }
              }
            });

            // 从第 5 行开始查找（为 widgets 预留空间）
            for (let y = 5; y < 100; y++) {
              for (let x = 0; x < cols; x++) {
                if (!occupied.has(`${x},${y}`)) {
                  return { x, y };
                }
              }
            }

            return { x: 0, y: 5 }; // 默认位置
          };

          const position = findEmptyPosition();

          return {
            shortcuts: [...state.shortcuts, newShortcut],
            layout: [
              ...state.layout,
              { id: `shortcut-${id}`, x: position.x, y: position.y, w: 1, h: 1 },
            ],
          };
        }),
      removeShortcut: (id) =>
        set((state) => ({
          shortcuts: state.shortcuts.filter((s) => s.id !== id),
          layout: state.layout.filter((item) => item.id !== `shortcut-${id}`),
        })),
      updateShortcut: (id, updates) =>
        set((state) => ({
          shortcuts: state.shortcuts.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
      reorderShortcuts: (shortcuts) => set({ shortcuts }),

      // Widget 配置
      widgets: {
        clock: { enabled: true, format24h: true },
        weather: {
          enabled: false,
          unit: 'celsius', // 'celsius' | 'fahrenheit'
          location: {
            latitude: null,
            longitude: null,
            name: '', // 城市名称（用于显示）
            timezone: 'auto',
          },
          savedCities: [], // 保存的常用城市列表
        },
        search: { enabled: true, engine: 'google' },
        todo: {
          enabled: true, // 启用待办事项
          items: [], // 待办事项列表
        },
      },
      updateWidget: (widgetName, config) =>
        set((state) => ({
          widgets: {
            ...state.widgets,
            [widgetName]: { ...state.widgets[widgetName], ...config },
          },
        })),

      // Widget 统一样式配置
      widgetStyles: {
        // 背景样式
        background: {
          base: 'white',           // 浅色模式基础背景
          baseDark: 'gray-800',    // 深色模式基础背景
          opacity: 80,             // 背景透明度 (0-100)
          blur: 'md',              // 背景模糊: 'none' | 'sm' | 'md' | 'lg' | 'xl'
        },
        // 圆角
        borderRadius: '2xl',       // 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full'
        // 阴影
        shadow: 'lg',              // 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
        // 内边距
        padding: 4,                // 1-12 (对应 p-1 到 p-12)
        // 边框
        border: {
          enabled: false,
          width: 1,                // 1-8
          color: 'gray-200',       // 浅色模式
          colorDark: 'gray-700',   // 深色模式
        },
        // 主题色 (用于按钮、高亮等)
        primaryColor: 'primary-500',
        primaryColorHover: 'primary-600',
        // 文字颜色
        text: {
          primary: 'gray-800',     // 主要文字 (浅色)
          primaryDark: 'white',    // 主要文字 (深色)
          secondary: 'gray-600',   // 次要文字 (浅色)
          secondaryDark: 'gray-300', // 次要文字 (深色)
          muted: 'gray-500',       // 弱化文字 (浅色)
          mutedDark: 'gray-400',   // 弱化文字 (深色)
        },
        // 交互元素样式
        interactive: {
          hoverBg: 'gray-100',     // 悬停背景 (浅色)
          hoverBgDark: 'gray-700', // 悬停背景 (深色)
          activeBg: 'gray-200',    // 激活背景 (浅色)
          activeBgDark: 'gray-600', // 激活背景 (深色)
        },
      },
      setWidgetStyles: (styles) =>
        set((state) => ({
          widgetStyles: { ...state.widgetStyles, ...styles },
        })),

      // 背景设置
      background: {
        type: 'color', // 'color' | 'gradient' | 'image' | 'unsplash'
        value: '#f3f4f6',
        blur: 0, // 0-20
        brightness: 100, // 0-200
        opacity: 100, // 0-100
      },
      setBackground: (background) => set({ background }),

      // 编辑模式
      isEditMode: false,
      setEditMode: (isEditMode) => set({ isEditMode }),

      // 网格布局配置
      gridConfig: {
        cols: 12, // 列数
        rows: 8, // 行数
        cellSize: 96, // 单元格大小（px，正方形）
        gap: 16, // 网格间隙（px）
        position: 'c', // 9宫格位置: 'lt' | 't' | 'rt' | 'l' | 'c' | 'r' | 'lb' | 'b' | 'rb'
      },
      setGridConfig: (config) =>
        set((state) => ({
          gridConfig: { ...state.gridConfig, ...config },
        })),

      // 网格布局（存储每个元素的位置和大小）
      layout: [
        { id: 'clock', x: 4, y: 0, w: 4, h: 2 },
        { id: 'weather', x: 4, y: 2, w: 5, h: 1 },
        { id: 'search', x: 4, y: 3, w: 5, h: 1 },
        { id: 'todo', x: 1, y: 0, w: 3, h: 4 },
      ],
      updateLayout: (id, position) =>
        set((state) => {
          const existingIndex = state.layout.findIndex((item) => item.id === id);
          if (existingIndex >= 0) {
            // 更新现有项
            const newLayout = [...state.layout];
            newLayout[existingIndex] = { ...newLayout[existingIndex], ...position };
            return { layout: newLayout };
          } else {
            // 添加新项
            return { layout: [...state.layout, { id, ...position }] };
          }
        }),
      removeFromLayout: (id) =>
        set((state) => ({
          layout: state.layout.filter((item) => item.id !== id),
        })),
      setLayout: (layout) => set({ layout }),
    }),
    {
      name: 'echo-tab-storage',
      version: 1,
      migrate: (persistedState, version) => {
        // 迁移旧的天气配置格式
        if (persistedState.widgets?.weather) {
          const weather = persistedState.widgets.weather;

          // 如果没有 location 对象，创建一个空的
          if (!weather.location) {
            weather.location = {
              latitude: null,
              longitude: null,
              name: '',
              timezone: 'auto',
            };
          }

          // 如果没有 savedCities，创建一个空数组
          if (!weather.savedCities) {
            weather.savedCities = [];
          }

          // 迁移旧的温度单位格式 'c'/'f' -> 'celsius'/'fahrenheit'
          if (weather.unit === 'c') {
            weather.unit = 'celsius';
          } else if (weather.unit === 'f') {
            weather.unit = 'fahrenheit';
          }

          // 删除旧的字段
          delete weather.apiKey;
          delete weather.city;
        }

        // 迁移旧的网格配置格式（改为固定 px 方案）
        if (persistedState.gridConfig) {
          const grid = persistedState.gridConfig;

          // 删除旧的 width 和 height 字段
          delete grid.width;
          delete grid.height;

          // 如果没有 cellSize，设置默认值
          if (!grid.cellSize) {
            grid.cellSize = 96;
          }
        }

        return persistedState;
      },
    }
  )
);

export default useStore;
