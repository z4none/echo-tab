import { useState, useEffect } from 'react';
import { MdClose } from 'react-icons/md';
import { normalizeUrl, getFaviconUrl, getWebsiteName, isValidUrl } from '../../utils/favicon';

const AddShortcutModal = ({ isOpen, onClose, onSave, editingShortcut }) => {
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    icon: '',
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingShortcut) {
      setFormData({
        name: editingShortcut.name,
        url: editingShortcut.url,
        icon: editingShortcut.icon,
      });
    } else {
      setFormData({ name: '', url: '', icon: '' });
    }
    setErrors({});
  }, [editingShortcut, isOpen]);

  const handleUrlBlur = () => {
    if (formData.url && !formData.name) {
      const normalized = normalizeUrl(formData.url);
      const name = getWebsiteName(normalized);
      const icon = getFaviconUrl(normalized);

      setFormData((prev) => ({
        ...prev,
        url: normalized,
        name: name.charAt(0).toUpperCase() + name.slice(1),
        icon,
      }));
    } else if (formData.url) {
      const normalized = normalizeUrl(formData.url);
      setFormData((prev) => ({
        ...prev,
        url: normalized,
        icon: getFaviconUrl(normalized),
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = '请输入网站名称';
    }

    if (!formData.url.trim()) {
      newErrors.url = '请输入网站地址';
    } else if (!isValidUrl(formData.url)) {
      newErrors.url = '请输入有效的网站地址';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      onSave({
        ...formData,
        id: editingShortcut?.id,
      });
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景遮罩 */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* 模态框 */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
        {/* 标题栏 */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
            {editingShortcut ? '编辑网站' : '添加网站'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <MdClose size={24} className="text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        {/* 表单 */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* 网站地址 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              网站地址
            </label>
            <input
              type="text"
              value={formData.url}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, url: e.target.value }))
              }
              onBlur={handleUrlBlur}
              placeholder="例如: github.com 或 https://github.com"
              className={`
                w-full px-4 py-2 rounded-lg border
                bg-white dark:bg-gray-700
                text-gray-800 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-primary-500
                ${errors.url ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              `}
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-500">{errors.url}</p>
            )}
          </div>

          {/* 网站名称 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              网站名称
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              placeholder="例如: GitHub"
              className={`
                w-full px-4 py-2 rounded-lg border
                bg-white dark:bg-gray-700
                text-gray-800 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-primary-500
                ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}
              `}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-500">{errors.name}</p>
            )}
          </div>

          {/* 图标预览 */}
          {formData.icon && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                图标预览
              </label>
              <div className="flex items-center gap-3">
                <img
                  src={formData.icon}
                  alt="icon preview"
                  className="w-12 h-12 object-contain rounded-lg border border-gray-300 dark:border-gray-600 p-1"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  自动从网站获取
                </span>
              </div>
            </div>
          )}

          {/* 按钮 */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors shadow-md"
            >
              {editingShortcut ? '保存' : '添加'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddShortcutModal;
