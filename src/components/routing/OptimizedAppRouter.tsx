import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from '@/components';
import { useWebSocket } from '@/hooks/useWebSocket';

// 懒加载页面组件 - 提升首屏加载性能
const HomePage = React.lazy(() =>
  import('@/pages/HomePage').then(module => ({ default: module.HomePage }))
);
const StatusPage = React.lazy(() =>
  import('@/pages/StatusPage').then(module => ({
    default: module.StatusPage,
  }))
);
const FaqPage = React.lazy(() =>
  import('@/pages/FaqPage').then(module => ({ default: module.FaqPage }))
);
const BugReportPage = React.lazy(() =>
  import('@/pages/BugReportPage').then(module => ({
    default: module.BugReportPage,
  }))
);
const NotFoundPage = React.lazy(() =>
  import('@/pages/NotFoundPage').then(module => ({
    default: module.NotFoundPage,
  }))
);

/**
 * 页面加载组件
 */
const PageLoadingSpinner: React.FC = () => (
  <div className="min-h-screen bg-gray-900 flex items-center justify-center">
    <div className="flex flex-col items-center space-y-4">
      {/* Minecraft风格的加载动画 */}
      <div className="relative">
        <div className="w-16 h-16 border-4 border-purple-500/30 border-t-purple-500 rounded-lg animate-spin"></div>
        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-cyan-400 rounded-lg animate-spin animation-delay-150"></div>
      </div>
      <div className="text-center">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-purple-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
          加载中...
        </h3>
        <p className="text-gray-400 text-sm mt-1">正在为您准备精彩内容</p>
      </div>
    </div>
  </div>
);

/**
 * 错误边界组件
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

class PageErrorBoundary extends React.Component<React.PropsWithChildren<{}>, ErrorBoundaryState> {
  constructor(props: React.PropsWithChildren<{}>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('页面加载错误:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // 获取错误信息，提供更好的调试体验
      const errorMessage = this.state.error?.message || '未知错误';
      const isDevelopment = process.env.NODE_ENV === 'development';

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center px-4">
          <div className="text-center max-w-md">
            <div className="text-red-400 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">页面加载失败</h2>
            <p className="text-gray-400 mb-4">抱歉，页面遇到了一些问题。请刷新页面重试。</p>

            {/* 开发模式下显示详细错误信息 */}
            {isDevelopment && this.state.error && (
              <div className="mt-4 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-left">
                <h3 className="text-red-400 font-semibold mb-2">错误详情（开发模式）:</h3>
                <p className="text-red-300 text-sm font-mono break-words">{errorMessage}</p>
                {this.state.error.stack && (
                  <details className="mt-2">
                    <summary className="text-red-400 cursor-pointer">堆栈跟踪</summary>
                    <pre className="text-red-300 text-xs mt-2 overflow-auto max-h-32">
                      {this.state.error.stack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <button
              onClick={() => window.location.reload()}
              className="mt-6 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * 优化的App路由组件
 * 支持代码分割、懒加载、错误边界
 */
export const OptimizedAppRouter: React.FC = () => {
  // 使用autoConnect选项，避免手动调用connect导致重复连接
  useWebSocket({ autoConnect: true });

  return (
    <Router>
      <Layout>
        <PageErrorBoundary>
          <Suspense fallback={<PageLoadingSpinner />}>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/status" element={<StatusPage />} />
              <Route path="/faq" element={<FaqPage />} />{' '}
              <Route path="/bug-report" element={<BugReportPage />} />
              {/* 404页面 - 必须放在最后 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </PageErrorBoundary>
      </Layout>
    </Router>
  );
};

export default OptimizedAppRouter;
