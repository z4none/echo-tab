/**
 * Quote Widget 配置表单
 */
export default function QuoteConfigForm({ config, updateConfig }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          显示类别
        </label>
        <div className="space-y-2">
          {[
            { value: 'inspiration', label: '励志名言', icon: '💪' },
            { value: 'movie', label: '影视台词', icon: '🎬' },
            { value: 'anime', label: '动漫台词', icon: '🎌' },
          ].map((category) => {
            const isEnabled = (config.categories || ['inspiration', 'movie', 'anime']).includes(
              category.value
            );
            return (
              <label
                key={category.value}
                className="flex items-center gap-3 p-3 rounded-lg border-2 transition-all cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                style={{
                  borderColor: isEnabled
                    ? 'rgb(var(--color-primary-500) / 1)'
                    : 'rgb(var(--color-gray-300) / 1)',
                  backgroundColor: isEnabled
                    ? 'rgb(var(--color-primary-50) / 0.5)'
                    : 'transparent',
                }}
              >
                <input
                  type="checkbox"
                  checked={isEnabled}
                  onChange={(e) => {
                    const currentCategories = config.categories || [
                      'inspiration',
                      'movie',
                      'anime',
                    ];
                    const newCategories = e.target.checked
                      ? [...currentCategories, category.value]
                      : currentCategories.filter((c) => c !== category.value);
                    updateConfig('categories', newCategories);
                  }}
                  className="w-5 h-5 text-primary-500 rounded focus:ring-2 focus:ring-primary-500"
                />
                <span className="text-xl">{category.icon}</span>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {category.label}
                </span>
              </label>
            );
          })}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
          选择要显示的名言类别，可多选
        </p>
      </div>
    </div>
  );
}
