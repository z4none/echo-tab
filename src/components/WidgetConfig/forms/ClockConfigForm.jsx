import { useState, useEffect } from 'react';
import { AVAILABLE_FONTS, getAvailableWeights } from '../../../constants/fonts';
import { loadGoogleFont, isFontLoaded } from '../../../utils/fontLoader';
import useStore from '../../../store/useStore';

/**
 * Clock Widget 配置表单
 */
export default function ClockConfigForm({ config, updateConfig }) {
  const { fontSource } = useStore();

  return (
    <div className="space-y-6">
      {/* 时间格式预设选项 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          时间格式
        </label>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'HH:mm:ss', value: 'HH:mm:ss', desc: '23:45:30' },
            { label: 'HH:mm', value: 'HH:mm', desc: '23:45' },
            { label: 'hh:mm:ss a', value: 'hh:mm:ss a', desc: '11:45:30 PM' },
            { label: 'hh:mm a', value: 'hh:mm a', desc: '11:45 PM' },
          ].map((preset) => (
            <button
              key={preset.value}
              onClick={() => updateConfig('timeFormat', preset.value)}
              className={`p-3 text-left rounded-lg border-2 transition-all ${
                config.timeFormat === preset.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
              }`}
            >
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {preset.label}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {preset.desc}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 自定义时间格式 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          自定义时间格式
        </label>
        <input
          type="text"
          value={config.timeFormat || ''}
          onChange={(e) => updateConfig('timeFormat', e.target.value)}
          placeholder="例如: HH:mm:ss 或清空使用默认"
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          使用 date-fns 格式：HH(时24) mm(分) ss(秒) hh(时12) a(AM/PM)
        </p>
      </div>

      {/* 日期显示 */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded">
          <input
            type="checkbox"
            checked={config.showDate !== false}
            onChange={(e) => updateConfig('showDate', e.target.checked)}
            className="w-4 h-4 text-primary-500 rounded"
          />
          <span className="text-gray-700 dark:text-gray-300">显示日期</span>
        </label>
      </div>

      {/* 日期格式预设 */}
      {config.showDate !== false && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              日期格式预设
            </label>
            <div className="space-y-2">
              {[
                { label: '完整中文', value: 'yyyy年MM月dd日 EEEE', desc: '2024年01月15日 星期一' },
                { label: '简短中文', value: 'yyyy/MM/dd EEEE', desc: '2024/01/15 星期一' },
                { label: '月日星期', value: 'MM月dd日 EEEE', desc: '01月15日 星期一' },
                { label: '英文格式', value: 'MMMM dd, yyyy', desc: 'January 15, 2024' },
                { label: '简短英文', value: 'MMM dd, yyyy', desc: 'Jan 15, 2024' },
                { label: '数字格式', value: 'yyyy-MM-dd', desc: '2024-01-15' },
              ].map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => updateConfig('dateFormat', preset.value)}
                  className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                    config.dateFormat === preset.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                >
                  <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {preset.label}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {preset.desc}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 自定义日期格式 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              自定义日期格式
            </label>
            <input
              type="text"
              value={config.dateFormat || ''}
              onChange={(e) => updateConfig('dateFormat', e.target.value)}
              placeholder="例如: yyyy年MM月dd日 EEEE"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              yyyy(年) MM(月) dd(日) EEEE(星期) MMMM(月份全称)
            </p>
          </div>
        </>
      )}

      {/* 字体设置 */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
        <h3 className="text-base font-semibold text-gray-800 dark:text-white mb-4">
          字体设置
        </h3>

        {/* 字体选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            字体
          </label>
          <div className="grid grid-cols-2 gap-2">
            {AVAILABLE_FONTS.map((font) => {
              const isSelected = (config.font?.family || 'system') === font.value;
              const isLoaded = font.isSystem || isFontLoaded(font.googleFamily);

              return (
                <button
                  key={font.value}
                  onClick={() => {
                    updateConfig('font.family', font.value);
                    if (!font.isSystem && !isLoaded) {
                      loadGoogleFont(font.googleFamily, font.weights, fontSource);
                    }
                  }}
                  className={`p-3 text-left rounded-lg border-2 transition-all ${
                    isSelected
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {font.name}
                    </span>
                    {isLoaded && !font.isSystem && (
                      <span className="text-xs text-green-500">✓</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {font.preview}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 字重选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            字重: {config.font?.weight || 700}
          </label>
          <input
            type="range"
            min="100"
            max="900"
            step="100"
            value={config.font?.weight || 700}
            onChange={(e) => updateConfig('font.weight', parseInt(e.target.value))}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>细</span>
            <span>粗</span>
          </div>
        </div>

        {/* 时间字号 */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            时间字号: {config.font?.timeSize || 64}px
          </label>
          <input
            type="range"
            min="24"
            max="120"
            step="4"
            value={config.font?.timeSize || 64}
            onChange={(e) => updateConfig('font.timeSize', parseInt(e.target.value))}
            className="w-full"
          />
        </div>

        {/* 日期字号 */}
        {config.showDate !== false && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              日期字号: {config.font?.dateSize || 20}px
            </label>
            <input
              type="range"
              min="12"
              max="48"
              step="2"
              value={config.font?.dateSize || 20}
              onChange={(e) => updateConfig('font.dateSize', parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
