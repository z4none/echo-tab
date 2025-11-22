import { Component } from 'react';
import widgetRegistry from './WidgetRegistry';

/**
 * Widget 错误边界组件
 * 捕获 Widget 加载和运行时错误，防止整个应用崩溃
 */
class WidgetErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // 更新 state 使下一次渲染显示降级 UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error, errorInfo) {
    // 记录错误信息
    console.error(`[WidgetErrorBoundary] Widget "${this.props.widgetId}" 发生错误:`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);

    this.setState({
      errorInfo,
    });
  }

  handleRetry = () => {
    // 重置错误状态，重新渲染
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render() {
    if (this.state.hasError) {
      const { widgetId } = this.props;
      const manifest = widgetRegistry.has(widgetId)
        ? widgetRegistry.getManifest(widgetId)
        : null;

      return (
        <div className="w-full h-full flex items-center justify-center bg-red-50 dark:bg-red-900/20 rounded-2xl border-2 border-dashed border-red-200 dark:border-red-800">
          <div className="text-center p-4 max-w-xs">
            <span className="text-4xl mb-3 block">⚠️</span>
            <p className="text-red-600 dark:text-red-400 font-semibold mb-2">
              {manifest?.name || widgetId} 加载失败
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
              {this.state.error?.message || '未知错误'}
            </p>
            <button
              onClick={this.handleRetry}
              className="px-4 py-2 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              重试
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default WidgetErrorBoundary;
