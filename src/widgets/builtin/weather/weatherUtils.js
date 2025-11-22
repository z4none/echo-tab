/**
 * Open-Meteo API 工具函数
 * 文档: https://open-meteo.com/en/docs
 * 优点: 免费、无需注册、无 API key
 */

const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const WEATHER_API = 'https://api.open-meteo.com/v1/forecast';

/**
 * 搜索城市（地理编码）
 * @param {string} cityName - 城市名称
 * @param {number} count - 返回结果数量
 * @returns {Promise<Array>} 城市列表
 */
export async function searchCity(cityName, count = 5) {
  if (!cityName || !cityName.trim()) {
    throw new Error('城市名称不能为空');
  }

  const params = new URLSearchParams({
    name: cityName.trim(),
    count: count.toString(),
    language: 'zh', // 中文结果
    format: 'json',
  });

  const url = `${GEOCODING_API}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Open-Meteo 返回格式: { results: [...] }
    if (!data.results || data.results.length === 0) {
      throw new Error('未找到该城市');
    }

    // 返回城市列表，包含 { id, name, country, latitude, longitude, timezone }
    return data.results.map((city) => ({
      id: city.id,
      name: city.name,
      country: city.country || '',
      admin1: city.admin1 || '', // 省/州
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: city.timezone,
      // 显示名称：城市, 省/州, 国家
      displayName: [city.name, city.admin1, city.country]
        .filter(Boolean)
        .join(', '),
    }));
  } catch (error) {
    console.error('搜索城市失败:', error);
    throw error;
  }
}

/**
 * 通过坐标获取实时天气
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @param {string} timezone - 时区（例如 'Asia/Shanghai'）
 * @param {string} unit - 温度单位 'celsius' 或 'fahrenheit'
 * @returns {Promise<Object>} 天气数据
 */
export async function getCurrentWeather(
  latitude,
  longitude,
  timezone = 'auto',
  unit = 'celsius'
) {
  if (latitude == null || longitude == null) {
    throw new Error('坐标参数缺失');
  }

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    current: [
      'temperature_2m', // 温度
      'relative_humidity_2m', // 湿度
      'apparent_temperature', // 体感温度
      'weathercode', // 天气代码
      'windspeed_10m', // 风速
    ].join(','),
    timezone: timezone,
    temperature_unit: unit,
  });

  const url = `${WEATHER_API}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    // Open-Meteo 返回格式: { current: {...}, current_units: {...} }
    if (!data.current) {
      throw new Error('未获取到天气数据');
    }

    const { current, current_units } = data;

    // 格式化返回数据
    return {
      temperature: current.temperature_2m,
      temperatureUnit: current_units.temperature_2m,
      apparentTemperature: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
      weatherCode: current.weathercode,
      windSpeed: current.windspeed_10m,
      windSpeedUnit: current_units.windspeed_10m,
      time: current.time,
    };
  } catch (error) {
    console.error('获取天气失败:', error);
    throw error;
  }
}

/**
 * 获取未来天气预报
 * @param {number} latitude - 纬度
 * @param {number} longitude - 经度
 * @param {string} timezone - 时区
 * @param {string} unit - 温度单位
 * @param {number} days - 预报天数（最多16天）
 * @returns {Promise<Object>} 天气预报数据
 */
export async function getWeatherForecast(
  latitude,
  longitude,
  timezone = 'auto',
  unit = 'celsius',
  days = 7
) {
  if (latitude == null || longitude == null) {
    throw new Error('坐标参数缺失');
  }

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    daily: [
      'weathercode', // 天气代码
      'temperature_2m_max', // 最高温度
      'temperature_2m_min', // 最低温度
      'precipitation_sum', // 降水量
      'windspeed_10m_max', // 最大风速
    ].join(','),
    timezone: timezone,
    temperature_unit: unit,
    forecast_days: days.toString(),
  });

  const url = `${WEATHER_API}?${params.toString()}`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.daily) {
      throw new Error('未获取到天气预报数据');
    }

    const { daily, daily_units } = data;

    // 格式化为数组
    const forecast = [];
    for (let i = 0; i < daily.time.length; i++) {
      forecast.push({
        date: daily.time[i],
        weatherCode: daily.weathercode[i],
        tempMax: daily.temperature_2m_max[i],
        tempMin: daily.temperature_2m_min[i],
        precipitation: daily.precipitation_sum[i],
        windSpeedMax: daily.windspeed_10m_max[i],
      });
    }

    return {
      forecast,
      units: daily_units,
    };
  } catch (error) {
    console.error('获取天气预报失败:', error);
    throw error;
  }
}

/**
 * WMO 天气代码对应的图标映射
 * 参考: https://open-meteo.com/en/docs
 * WMO Weather interpretation codes (WW)
 */
export const weatherIcons = {
  // 0: 晴天
  0: '☀️',
  // 1-3: 多云
  1: '🌤️', // 主要晴天
  2: '⛅', // 部分多云
  3: '☁️', // 阴天
  // 45, 48: 雾
  45: '🌫️',
  48: '🌫️',
  // 51-55: 毛毛雨
  51: '🌦️', // 轻度
  53: '🌦️', // 中度
  55: '🌧️', // 密集
  // 56-57: 冻毛毛雨
  56: '🌧️',
  57: '🌧️',
  // 61-65: 雨
  61: '🌧️', // 轻度
  63: '🌧️', // 中度
  65: '⛈️', // 大雨
  // 66-67: 冻雨
  66: '🌧️',
  67: '🌧️',
  // 71-75: 雪
  71: '🌨️', // 轻度
  73: '🌨️', // 中度
  75: '❄️', // 大雪
  // 77: 雪粒
  77: '❄️',
  // 80-82: 阵雨
  80: '🌦️', // 轻度
  81: '🌧️', // 中度
  82: '⛈️', // 猛烈
  // 85-86: 阵雪
  85: '🌨️',
  86: '❄️',
  // 95: 雷暴
  95: '⛈️',
  // 96, 99: 雷暴伴冰雹
  96: '⛈️',
  99: '⛈️',
};

/**
 * 获取天气图标
 * @param {number} code - WMO 天气代码
 * @returns {string} 图标 emoji
 */
export function getWeatherIcon(code) {
  return weatherIcons[code] || '❓';
}

/**
 * 获取天气描述文字（中文）
 * @param {number} code - WMO 天气代码
 * @returns {string} 天气描述
 */
export function getWeatherDescription(code) {
  const descriptions = {
    0: '晴天',
    1: '主要晴天',
    2: '部分多云',
    3: '阴天',
    45: '雾',
    48: '霜雾',
    51: '小雨',
    53: '中雨',
    55: '大雨',
    56: '小冻雨',
    57: '冻雨',
    61: '小雨',
    63: '中雨',
    65: '大雨',
    66: '小冻雨',
    67: '冻雨',
    71: '小雪',
    73: '中雪',
    75: '大雪',
    77: '雪粒',
    80: '小阵雨',
    81: '阵雨',
    82: '大阵雨',
    85: '小阵雪',
    86: '阵雪',
    95: '雷暴',
    96: '雷暴伴小冰雹',
    99: '雷暴伴冰雹',
  };

  return descriptions[code] || '未知';
}

/**
 * 使用浏览器地理定位 API 获取当前位置
 * @returns {Promise<{latitude: number, longitude: number}>}
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('浏览器不支持地理定位'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        let message = '获取位置失败';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            message = '用户拒绝了地理定位请求';
            break;
          case error.POSITION_UNAVAILABLE:
            message = '位置信息不可用';
            break;
          case error.TIMEOUT:
            message = '获取位置超时';
            break;
        }
        reject(new Error(message));
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // 5分钟缓存
      }
    );
  });
}
