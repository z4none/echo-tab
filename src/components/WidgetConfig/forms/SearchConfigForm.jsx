/**
 * Search Widget 配置表单
 */
export default function SearchConfigForm({ config, updateConfig }) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          搜索引擎
        </label>
        <select
          value={config.engine || 'google'}
          onChange={(e) => updateConfig('engine', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
        >
          <option value="google">Google</option>
          <option value="bing">Bing</option>
          <option value="baidu">百度</option>
          <option value="duckduckgo">DuckDuckGo</option>
        </select>
      </div>
    </div>
  );
}
