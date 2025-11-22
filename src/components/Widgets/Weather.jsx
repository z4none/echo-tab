import { useState, useEffect, useRef } from 'react';
import { MdRefresh, MdLocationOn } from 'react-icons/md';
import useStore from '../../store/useStore';
import {
  getCurrentWeather,
  getCurrentPosition,
  getWeatherIcon,
  getWeatherDescription,
} from '../../utils/weather';

function Weather() {
  const { widgets, updateWidget } = useStore();
  const { location = {}, unit } = widgets.weather;

  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [containerHeight, setContainerHeight] = useState(0);
  const resizeObserverRef = useRef(null);

  // 获取天气数据
  const fetchWeather = async () => {
    if (!location?.latitude || !location?.longitude) {
      setError('未设置位置信息');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getCurrentWeather(
        location.latitude,
        location.longitude,
        location.timezone,
        unit
      );
      setWeather(data);
    } catch (err) {
      setError(err.message || '获取天气失败');
      console.error('获取天气失败:', err);
    } finally {
      setLoading(false);
    }
  };

  // 使用浏览器定位
  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    setError(null);

    try {
      const position = await getCurrentPosition();

      // 更新位置信息（名称暂时为空，在设置面板中搜索后会更新）
      updateWidget('weather', {
        location: {
          latitude: position.latitude,
          longitude: position.longitude,
          name: '当前位置',
          timezone: 'auto',
        },
      });
    } catch (err) {
      setError(err.message || '获取位置失败');
      console.error('获取位置失败:', err);
    } finally {
      setLocationLoading(false);
    }
  };

  // 使用 callback ref 来监听容器高度变化
  const containerRef = (element) => {
    // 清理旧的 observer
    if (resizeObserverRef.current) {
      resizeObserverRef.current.disconnect();
      resizeObserverRef.current = null;
    }

    // 如果元素存在，创建新的 observer
    if (element) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const height = entry.contentRect.height;
          setContainerHeight(height);
        }
      });

      resizeObserver.observe(element);
      resizeObserverRef.current = resizeObserver;
    }
  };

  // 首次加载时，如果没有位置信息，尝试获取浏览器定位
  useEffect(() => {
    if (!location?.latitude && !location?.longitude) {
      handleUseCurrentLocation();
    }
  }, []); // 仅首次加载时执行

  // 当位置信息变化时，获取天气
  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      fetchWeather();

      // 每 30 分钟自动刷新一次
      const interval = setInterval(() => {
        fetchWeather();
      }, 30 * 60 * 1000);

      return () => clearInterval(interval);
    }
  }, [location?.latitude, location?.longitude, unit]);

  // 手动刷新
  const handleRefresh = () => {
    fetchWeather();
  };

  // 位置获取中
  if (locationLoading) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          <span className="text-gray-700 dark:text-gray-200">获取位置中...</span>
        </div>
      </div>
    );
  }

  // 未配置位置
  if (!location?.latitude || !location?.longitude) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-4">
        <div className="flex flex-col items-center gap-3 max-w-xs text-center">
          <span className="text-yellow-500 text-3xl">⚠️</span>
          <span className="text-gray-700 dark:text-gray-200 text-sm">
            请在设置中配置天气位置
          </span>
          {error && (
            <span className="text-xs text-red-500 dark:text-red-400">{error}</span>
          )}
          <button
            onClick={handleUseCurrentLocation}
            className="px-4 py-2 text-sm bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors flex items-center gap-2"
          >
            <MdLocationOn size={16} />
            使用当前位置
          </button>
        </div>
      </div>
    );
  }

  // 加载中
  if (loading && !weather) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg">
        <div className="flex items-center gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-500"></div>
          <span className="text-gray-700 dark:text-gray-200">加载天气中...</span>
        </div>
      </div>
    );
  }

  // 错误状态
  if (error && !weather) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg p-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <span className="text-red-500 text-3xl">❌</span>
          <span className="text-red-500 dark:text-red-400 text-sm">{error}</span>
          <button
            onClick={handleRefresh}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            title="重试"
          >
            <MdRefresh className="text-gray-600 dark:text-gray-300" size={20} />
          </button>
        </div>
      </div>
    );
  }

  // 显示天气
  if (weather) {
    const icon = getWeatherIcon(weather.weatherCode);
    const description = getWeatherDescription(weather.weatherCode);
    const tempUnit = weather.temperatureUnit || '°C';

    // 根据高度决定显示模式
    // 超简略版：< 120px（1格）
    // 简略版：120-200px（1-2格）
    // 完整版：> 200px（2格+）或初始状态（containerHeight === 0）

    // 超简略版（横向，最小化）
    if (containerHeight > 0 && containerHeight < 120) {
      return (
        <div ref={containerRef} className="w-full h-full p-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg">
          <div className="h-full flex items-center justify-between gap-2">
            <span className="text-2xl leading-none" title={description}>{icon}</span>
            <div className="flex flex-col justify-center flex-1 min-w-0">
              <span className="text-xl font-bold text-gray-800 dark:text-white leading-none">
                {Math.round(weather.temperature)}{tempUnit}
              </span>
              <span className="text-xs text-gray-600 dark:text-gray-400 truncate leading-tight mt-0.5">
                {location?.name}
              </span>
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 flex-shrink-0"
              title="刷新"
            >
              <MdRefresh
                className={`text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`}
                size={14}
              />
            </button>
          </div>
        </div>
      );
    }

    // 简略版（横向，中等信息）
    else if (containerHeight >= 120 && containerHeight < 200) {
      return (
        <div ref={containerRef} className="w-full h-full p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg">
          <div className="h-full flex items-center justify-between gap-4">
            {/* 左侧：图标和温度 */}
            <div className="flex items-center gap-4">
              <span className="text-5xl" title={description}>{icon}</span>
              <div className="flex flex-col">
                <span className="text-4xl font-bold text-gray-800 dark:text-white leading-none">
                  {Math.round(weather.temperature)}{tempUnit}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  {description}
                </span>
              </div>
            </div>

            {/* 右侧：位置和控制 */}
            <div className="flex flex-col items-end gap-2">
              {location?.name && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  📍 {location.name}
                </span>
              )}
              {weather.humidity != null && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  💧 {Math.round(weather.humidity)}%
                </span>
              )}
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
                title="刷新"
              >
                <MdRefresh
                  className={`text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`}
                  size={16}
                />
              </button>
            </div>
          </div>
        </div>
      );
    }

    // 完整版（垂直，所有信息）- 包括初始状态和大尺寸布局
    else {
      return (
      <div ref={containerRef} className="w-full h-full p-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md rounded-2xl shadow-lg">
        <div className="h-full flex flex-col justify-between">
          {/* 顶部：位置和刷新按钮 */}
          <div className="flex items-center justify-between mb-2">
            {location?.name && (
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                📍 {location.name}
              </span>
            )}
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50"
              title="刷新"
            >
              <MdRefresh
                className={`text-gray-600 dark:text-gray-300 ${loading ? 'animate-spin' : ''}`}
                size={18}
              />
            </button>
          </div>

          {/* 中部：主要信息（图标 + 温度） */}
          <div className="flex-1 flex items-center justify-center gap-6">
            {/* 天气图标 */}
            <span className="text-6xl" title={description}>
              {icon}
            </span>

            {/* 温度信息 */}
            <div className="flex flex-col">
              <span className="text-5xl font-bold text-gray-800 dark:text-white leading-none">
                {Math.round(weather.temperature)}
                <span className="text-3xl">{tempUnit}</span>
              </span>
              <span className="text-base text-gray-600 dark:text-gray-300 mt-1">
                {description}
              </span>
              {weather.apparentTemperature != null && (
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  体感 {Math.round(weather.apparentTemperature)}{tempUnit}
                </span>
              )}
            </div>
          </div>

          {/* 底部：详细信息 */}
          <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
            {/* 湿度 */}
            {weather.humidity != null && (
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">💧 湿度</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {Math.round(weather.humidity)}%
                </span>
              </div>
            )}

            {/* 风速 */}
            {weather.windSpeed != null && (
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">💨 风速</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {Math.round(weather.windSpeed)} {weather.windSpeedUnit || 'km/h'}
                </span>
              </div>
            )}

            {/* 更新时间 */}
            {weather.time && (
              <div className="flex flex-col items-center">
                <span className="text-xs text-gray-500 dark:text-gray-400">🕐 更新</span>
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                  {new Date(weather.time).toLocaleTimeString('zh-CN', {
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      );
    }
  }

  return null;
}

export default Weather;
