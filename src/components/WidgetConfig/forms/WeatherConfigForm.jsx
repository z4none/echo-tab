import { useState } from 'react';
import { MdLocationOn, MdSearch, MdDelete } from 'react-icons/md';
import { searchCity, getCurrentPosition } from '../../../utils/weather';

/**
 * Weather Widget 配置表单
 */
export default function WeatherConfigForm({ config, updateConfig }) {
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [citySearchResults, setCitySearchResults] = useState([]);
  const [citySearchLoading, setCitySearchLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  // 搜索城市
  const handleCitySearch = async () => {
    if (!citySearchQuery.trim()) return;

    setCitySearchLoading(true);
    try {
      const results = await searchCity(citySearchQuery);
      setCitySearchResults(results);
    } catch (error) {
      console.error('搜索城市失败:', error);
      alert('搜索失败: ' + error.message);
    } finally {
      setCitySearchLoading(false);
    }
  };

  // 选择城市
  const handleSelectCity = (city) => {
    updateConfig('location', {
      latitude: city.latitude,
      longitude: city.longitude,
      name: city.name,
      timezone: city.timezone || 'auto',
    });

    // 添加到常用城市
    const savedCities = config.savedCities || [];
    if (!savedCities.find((c) => c.id === city.id)) {
      updateConfig('savedCities', [...savedCities, city]);
    }

    setCitySearchResults([]);
    setCitySearchQuery('');
  };

  // 使用当前位置
  const handleUseCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const position = await getCurrentPosition();
      updateConfig('location', {
        latitude: position.latitude,
        longitude: position.longitude,
        name: position.name || '当前位置',
        timezone: 'auto',
      });
      alert('定位成功！');
    } catch (error) {
      console.error('获取位置失败:', error);
      alert('获取位置失败: ' + error.message);
    } finally {
      setLocationLoading(false);
    }
  };

  // 删除常用城市
  const handleRemoveSavedCity = (cityId) => {
    updateConfig('savedCities', (config.savedCities || []).filter((c) => c.id !== cityId));
  };

  return (
    <div className="space-y-6">
      {/* 当前位置 */}
      {config.location?.name && (
        <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">当前位置</div>
          <div className="text-base font-medium text-gray-800 dark:text-white">
            📍 {config.location.name}
          </div>
          {config.location.latitude && config.location.longitude && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {config.location.latitude.toFixed(4)}, {config.location.longitude.toFixed(4)}
            </div>
          )}
        </div>
      )}

      {/* 搜索城市 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          搜索城市
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={citySearchQuery}
            onChange={(e) => setCitySearchQuery(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleCitySearch();
              }
            }}
            placeholder="输入城市名称..."
            className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={handleCitySearch}
            disabled={citySearchLoading || !citySearchQuery.trim()}
            className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <MdSearch size={20} />
            {citySearchLoading ? '搜索中...' : '搜索'}
          </button>
        </div>
      </div>

      {/* 搜索结果 */}
      {citySearchResults.length > 0 && (
        <div className="max-h-60 overflow-y-auto space-y-2">
          {citySearchResults.map((city) => (
            <button
              key={city.id}
              onClick={() => handleSelectCity(city)}
              className="w-full p-3 text-left bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-all"
            >
              <div className="font-medium text-gray-800 dark:text-white">{city.name}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{city.displayName}</div>
            </button>
          ))}
        </div>
      )}

      {/* 使用当前位置 */}
      <button
        onClick={handleUseCurrentLocation}
        disabled={locationLoading}
        className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        <MdLocationOn size={20} />
        {locationLoading ? '定位中...' : '使用当前位置'}
      </button>

      {/* 温度单位 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          温度单位
        </label>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => updateConfig('unit', 'celsius')}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              (config.unit || 'celsius') === 'celsius'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
            }`}
          >
            摄氏度 (°C)
          </button>
          <button
            onClick={() => updateConfig('unit', 'fahrenheit')}
            className={`px-4 py-2 rounded-lg border-2 transition-all ${
              config.unit === 'fahrenheit'
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-400'
            }`}
          >
            华氏度 (°F)
          </button>
        </div>
      </div>

      {/* 常用城市 */}
      {config.savedCities?.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            常用城市
          </label>
          <div className="space-y-2">
            {config.savedCities.map((city) => (
              <div
                key={city.id}
                className="flex items-center justify-between p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
              >
                <button
                  onClick={() => handleSelectCity(city)}
                  className="flex-1 text-left text-sm text-gray-700 dark:text-gray-300 hover:text-primary-500"
                >
                  {city.displayName}
                </button>
                <button
                  onClick={() => handleRemoveSavedCity(city.id)}
                  className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <MdDelete size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
