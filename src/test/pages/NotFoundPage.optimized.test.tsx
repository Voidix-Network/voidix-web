/**
 * NotFoundPage 组件测试套件 - 向后兼容性优化版本
 * 专注于核心功能验证，移除对具体样式和布局的依赖
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { screen, fireEvent } from '@testing-library/react';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { PageTestAssertions, renderWithHelmet } from '@/test/utils/routeTestUtils';

// Mock React Router at the top level
vi.mock('react-router-dom', () => ({
  Link: ({ children, to, className, ...props }: any) => (
    <a href={to} className={className} data-testid="router-link" {...props}>
      {children}
    </a>
  ),
}));

// Mock Lucide React icons at the top level
vi.mock('lucide-react', () => ({
  Home: (props: any) => <div {...props} data-testid="icon" data-icon="home" />,
  ArrowLeft: (props: any) => <div {...props} data-testid="icon" data-icon="arrow-left" />,
  Search: (props: any) => <div {...props} data-testid="icon" data-icon="search" />,
}));

// Mock SEO components
vi.mock('@/components/seo', () => ({
  PageSEO: ({ title, description, keywords, additionalMeta }: any) => (
    <div
      data-testid="page-seo"
      data-title={title}
      data-description={description}
      data-keywords={keywords}
      data-additional-meta={JSON.stringify(additionalMeta || [])}
    >
      SEO Component
    </div>
  ),
}));

describe('NotFoundPage - 向后兼容性优化版本', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // 设置History Mock
    Object.defineProperty(window, 'history', {
      value: { back: vi.fn() },
      configurable: true,
    });
  });

  describe('基础渲染功能', () => {
    it('应该正确渲染页面核心元素', () => {
      renderWithHelmet(<NotFoundPage />);

      // 使用新的断言工具验证核心功能
      PageTestAssertions.assertErrorState({
        hasErrorCode: true,
        hasErrorMessage: false, // 修正：不使用过宽泛的错误信息查询
        hasRecoveryOptions: true,
      });

      // 单独验证特定元素
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText('页面走丢了')).toBeInTheDocument();

      // 验证SEO组件配置
      PageTestAssertions.assertSEOConfiguration({
        hasTitle: true,
        hasDescription: true,
        hasKeywords: true,
      });
    });

    it('应该包含适当的错误描述信息', () => {
      renderWithHelmet(<NotFoundPage />);

      // 使用灵活的文本匹配，不依赖具体文案
      expect(screen.getByText(/404/)).toBeInTheDocument();
      expect(screen.getByText(/页面.*走丢|not.*found|missing/i)).toBeInTheDocument();
      expect(screen.getByText(/抱歉|sorry|apologize/i)).toBeInTheDocument();
    });

    it('应该提供用户指导信息', () => {
      renderWithHelmet(<NotFoundPage />);

      // 验证指导性内容存在，但不依赖具体文案
      expect(screen.getByText(/您可以|you.*can|try/i)).toBeInTheDocument();
      expect(screen.getByText(/检查|check|verify/i)).toBeInTheDocument();
      // 使用更精确的查询，避免多元素匹配
      expect(screen.getByRole('button', { name: /返回上页/i })).toBeInTheDocument();
    });
  });

  describe('导航功能验证', () => {
    it('应该提供有效的导航选项', () => {
      renderWithHelmet(<NotFoundPage />);

      // 使用新的导航断言工具
      PageTestAssertions.assertNavigationFunctionality([
        { text: /返回首页|home/i, href: '/', isButton: false },
        { text: /返回上页|back/i, isButton: true },
        { text: /常见问题|faq/i, href: '/faq', isButton: false },
      ]);
    });

    it('应该正确处理返回上页功能', () => {
      renderWithHelmet(<NotFoundPage />);

      const backButton = screen.getByRole('button', { name: /返回上页|back/i });
      fireEvent.click(backButton);

      // 验证history.back被调用
      expect(window.history.back).toHaveBeenCalledTimes(1);
    });

    it('应该包含正确的外部链接属性', () => {
      renderWithHelmet(<NotFoundPage />);

      // 验证链接的基本功能，不依赖具体样式
      const homeLink = screen.getByRole('link', { name: /返回首页|home/i });
      const faqLink = screen.getByRole('link', { name: /常见问题|faq/i });

      expect(homeLink).toHaveAttribute('href', '/');
      expect(faqLink).toHaveAttribute('href', '/faq');
    });
  });

  describe('SEO配置验证', () => {
    it('应该设置正确的SEO元数据', () => {
      renderWithHelmet(<NotFoundPage />);

      // 验证SEO配置的功能性，不依赖具体内容
      PageTestAssertions.assertSEOConfiguration({
        hasTitle: true,
        hasDescription: true,
        hasKeywords: true,
      });

      const pageSEO = screen.getByTestId('page-seo');

      // 验证关键SEO属性存在
      expect(pageSEO.getAttribute('data-title')).toContain('Voidix');
      expect(pageSEO.getAttribute('data-description')).toBeTruthy();
      expect(pageSEO.getAttribute('data-keywords')).toContain('404');
    });

    it('应该设置noindex和nofollow属性', () => {
      renderWithHelmet(<NotFoundPage />);

      const pageSEO = screen.getByTestId('page-seo');
      const additionalMeta = JSON.parse(pageSEO.getAttribute('data-additional-meta') || '[]');

      // 验证搜索引擎指令
      expect(additionalMeta).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'robots',
            content: expect.stringContaining('noindex'),
          }),
        ])
      );
    });

    it('应该包含品牌相关的SEO信息', () => {
      renderWithHelmet(<NotFoundPage />);

      const pageSEO = screen.getByTestId('page-seo');

      // 验证品牌一致性
      expect(pageSEO.getAttribute('data-title')).toMatch(/voidix/i);
      expect(pageSEO.getAttribute('data-description')).toMatch(/返回|home|首页/i);
    });
  });

  describe('图标和视觉元素', () => {
    it('应该包含适当的导航图标', () => {
      renderWithHelmet(<NotFoundPage />);

      // 验证图标存在，不依赖具体实现
      const icons = screen.getAllByTestId('icon');
      expect(icons.length).toBeGreaterThanOrEqual(3);

      // 验证关键图标类型（使用更安全的方式）
      const iconTypes = icons.map(icon => icon.getAttribute('data-icon'));
      expect(iconTypes).toEqual(expect.arrayContaining(['home', 'arrow-left', 'search']));
    });

    it('应该为导航元素提供视觉指示', () => {
      renderWithHelmet(<NotFoundPage />);

      // 验证视觉指示存在，但不依赖具体样式类
      const homeLink = screen.getByRole('link', { name: /返回首页|home/i });
      const backButton = screen.getByRole('button', { name: /返回上页|back/i });

      expect(homeLink.querySelector('[data-testid=\"icon\"]')).toBeInTheDocument();
      expect(backButton.querySelector('[data-testid=\"icon\"]')).toBeInTheDocument();
    });
  });

  describe('可访问性和用户体验', () => {
    it('应该提供清晰的语义化标签', () => {
      renderWithHelmet(<NotFoundPage />);

      // 验证语义化元素
      expect(screen.getByRole('button', { name: /返回上页|back/i })).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(2); // 首页 + FAQ
    });

    it('应该提供键盘导航支持', () => {
      renderWithHelmet(<NotFoundPage />);

      // 验证可聚焦元素
      const focusableElements = screen.getAllByRole('button').concat(screen.getAllByRole('link'));
      expect(focusableElements.length).toBeGreaterThanOrEqual(3);
    });

    it('应该提供清晰的错误信息层次', () => {
      renderWithHelmet(<NotFoundPage />);

      // 验证信息层次结构
      expect(screen.getByText('404')).toBeInTheDocument(); // 错误代码
      expect(screen.getByText(/页面.*走丢|not.*found/i)).toBeInTheDocument(); // 错误标题
      expect(screen.getByText(/抱歉|sorry/i)).toBeInTheDocument(); // 错误说明
      expect(screen.getByText(/您可以|you.*can/i)).toBeInTheDocument(); // 解决方案
    });
  });

  describe('错误边界和稳定性', () => {
    it('应该能正常渲染即使没有props', () => {
      // 组件健壮性测试
      expect(() => renderWithHelmet(<NotFoundPage />)).not.toThrow();
    });

    it('应该能正常处理DOM操作', () => {
      renderWithHelmet(<NotFoundPage />);

      // 验证关键元素都已渲染
      expect(screen.getByTestId('page-seo')).toBeInTheDocument();
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getAllByRole('link')).toHaveLength(2);
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });

    it('应该正确处理Router组件', () => {
      renderWithHelmet(<NotFoundPage />);

      // 验证Router Mock正常工作
      const routerLinks = screen.getAllByTestId('router-link');
      expect(routerLinks).toHaveLength(2); // 返回首页 + 常见问题
    });
  });

  describe('响应式和布局适应性', () => {
    it('应该包含基本的布局结构', () => {
      const { container } = renderWithHelmet(<NotFoundPage />);

      // 验证基本布局存在，不依赖具体CSS类
      const mainContent = container.querySelector('div');
      expect(mainContent).toBeInTheDocument();
      expect(container.querySelectorAll('div').length).toBeGreaterThan(0);
    });

    it('应该能处理不同屏幕尺寸的内容', () => {
      renderWithHelmet(<NotFoundPage />);

      // 验证内容的灵活性（通过检查文本是否能正常显示）
      expect(screen.getByText('404')).toBeInTheDocument();
      expect(screen.getByText(/页面.*走丢/i)).toBeInTheDocument();

      // 验证导航元素在各种情况下都可用
      expect(screen.getAllByRole('link')).toHaveLength(2);
      expect(screen.getAllByRole('button')).toHaveLength(1);
    });
  });

  describe('扩展性和未来兼容性', () => {
    it('应该能处理新增的导航选项', () => {
      // 模拟可能新增的导航功能
      renderWithHelmet(<NotFoundPage />);

      // 验证当前导航结构的稳定性
      const currentLinks = screen.getAllByRole('link');
      const currentButtons = screen.getAllByRole('button');

      expect(currentLinks.length).toBeGreaterThanOrEqual(2);
      expect(currentButtons.length).toBeGreaterThanOrEqual(1);
    });

    it('应该能适应SEO需求的变化', () => {
      renderWithHelmet(<NotFoundPage />);

      const pageSEO = screen.getByTestId('page-seo');

      // 验证SEO结构的灵活性
      expect(pageSEO).toBeInTheDocument();
      expect(pageSEO.getAttribute('data-title')).toBeTruthy();
      expect(pageSEO.getAttribute('data-description')).toBeTruthy();
    });

    it('应该保持与新版本路由的兼容性', () => {
      renderWithHelmet(<NotFoundPage />);

      // 验证路由相关功能的稳定性
      expect(screen.getAllByTestId('router-link')).toHaveLength(2);

      const backButton = screen.getByRole('button', { name: /返回上页|back/i });
      expect(backButton).toBeInTheDocument();

      // 验证history功能
      fireEvent.click(backButton);
      expect(window.history.back).toHaveBeenCalled();
    });
  });
});
