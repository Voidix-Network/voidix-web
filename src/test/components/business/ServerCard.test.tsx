import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ServerCard } from '@/components/business/ServerCard';
import type { ServerCardProps } from '@/components/business/ServerCard';

// 引入测试设置
import '@/test/setup';

describe('ServerCard', () => {
  describe('基础渲染', () => {
    it('应该渲染基本的服务器卡片结构', () => {
      const mockServerInfo = {
        isOnline: true,
        players: 10,
      };

      render(
        <ServerCard serverId="survival" serverInfo={mockServerInfo} displayName="生存服务器" />
      );

      // 验证显示名称
      expect(screen.getByText('生存服务器')).toBeInTheDocument();

      // 验证在线状态显示
      expect(screen.getByText('10 在线')).toBeInTheDocument();
    });

    it('应该渲染带有类别标题的服务器卡片', () => {
      const mockServerInfo = {
        isOnline: true,
        players: 15,
      };

      render(
        <ServerCard
          serverId="creative"
          serverInfo={mockServerInfo}
          displayName="创造服务器"
          categoryTitle="创造世界"
        />
      );

      expect(screen.getByText('创造服务器')).toBeInTheDocument();
      expect(screen.getByText('15 在线')).toBeInTheDocument();
    });
  });

  describe('在线状态处理', () => {
    it('应该正确显示在线服务器状态', () => {
      const { container } = render(
        <ServerCard
          serverId="lobby"
          serverInfo={{ isOnline: true, players: 25 }}
          displayName="大厅服务器"
        />
      );

      // 检查状态指示器
      const statusDot = container.querySelector('.w-2.h-2.rounded-full');
      expect(statusDot).toHaveClass('bg-green-500', 'animate-pulse');

      // 检查玩家数量显示
      expect(screen.getByText('25 在线')).toBeInTheDocument();
      expect(screen.getByText('25 在线')).toHaveClass('text-green-400');
    });

    it('应该正确显示离线服务器状态', () => {
      const { container } = render(
        <ServerCard
          serverId="minigame"
          serverInfo={{ isOnline: false, players: 0 }}
          displayName="小游戏服务器"
        />
      );

      // 检查状态指示器
      const statusDot = container.querySelector('.w-2.h-2.rounded-full');
      expect(statusDot).toHaveClass('bg-red-500');
      expect(statusDot).not.toHaveClass('animate-pulse');

      // 检查离线状态显示
      expect(screen.getByText('离线')).toBeInTheDocument();
      expect(screen.getByText('离线')).toHaveClass('text-red-400');
    });

    it('应该处理玩家数量为undefined的情况', () => {
      render(
        <ServerCard serverId="test" serverInfo={{ isOnline: true }} displayName="测试服务器" />
      );

      // 玩家数量应该默认为0
      expect(screen.getByText('0 在线')).toBeInTheDocument();
    });

    it('应该处理玩家数量为null的情况', () => {
      render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: null }}
          displayName="测试服务器"
        />
      );

      // 玩家数量应该回退到0
      expect(screen.getByText('0 在线')).toBeInTheDocument();
    });
  });

  describe('样式和布局', () => {
    it('应该应用默认的CSS类名', () => {
      const { container } = render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 5 }}
          displayName="测试服务器"
        />
      );

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveClass(
        'bg-gray-700/50',
        'rounded',
        'p-3',
        'hover:bg-gray-700/70',
        'transition-colors',
        'duration-200'
      );
    });

    it('应该为没有categoryTitle的服务器名称应用font-medium', () => {
      render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 8 }}
          displayName="主要服务器"
        />
      );

      const nameElement = screen.getByText('主要服务器');
      expect(nameElement).toHaveClass('font-medium');
      expect(nameElement).not.toHaveClass('font-normal');
    });

    it('应该为有categoryTitle的服务器名称应用font-normal', () => {
      render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 12 }}
          displayName="子服务器"
          categoryTitle="分类标题"
        />
      );

      const nameElement = screen.getByText('子服务器');
      expect(nameElement).toHaveClass('font-normal');
      expect(nameElement).not.toHaveClass('font-medium');
    });

    it('应该为玩家数量文本应用正确的样式', () => {
      render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: true, players: 20 }}
          displayName="样式测试服务器"
        />
      );

      const playersElement = screen.getByText('20 在线');
      expect(playersElement).toHaveClass('text-sm', 'font-mono', 'transition-colors');
    });

    it('应该为服务器名称应用正确的基础样式', () => {
      render(
        <ServerCard
          serverId="test"
          serverInfo={{ isOnline: false, players: 0 }}
          displayName="样式测试"
        />
      );

      const nameElement = screen.getByText('样式测试');
      expect(nameElement).toHaveClass('text-sm', 'text-white');
    });
  });

  describe('Props处理', () => {
    it('应该处理所有必需的props', () => {
      const requiredProps: ServerCardProps = {
        serverId: 'required-test',
        serverInfo: { isOnline: true, players: 30 },
        displayName: '必需参数测试',
      };

      expect(() => {
        render(<ServerCard {...requiredProps} />);
      }).not.toThrow();

      expect(screen.getByText('必需参数测试')).toBeInTheDocument();
      expect(screen.getByText('30 在线')).toBeInTheDocument();
    });

    it('应该处理可选的categoryTitle prop', () => {
      const propsWithCategory: ServerCardProps = {
        serverId: 'category-test',
        serverInfo: { isOnline: false, players: 0 },
        displayName: '类别测试',
        categoryTitle: '测试类别',
      };

      expect(() => {
        render(<ServerCard {...propsWithCategory} />);
      }).not.toThrow();

      expect(screen.getByText('类别测试')).toBeInTheDocument();
    });
  });

  describe('边界条件和错误处理', () => {
    it('应该在serverInfo为null时不渲染任何内容', () => {
      const { container } = render(
        <ServerCard serverId="null-test" serverInfo={null} displayName="空信息测试" />
      );

      expect(container.firstChild).toBeNull();
    });

    it('应该在serverInfo为undefined时不渲染任何内容', () => {
      const { container } = render(
        <ServerCard serverId="undefined-test" serverInfo={undefined} displayName="未定义测试" />
      );

      expect(container.firstChild).toBeNull();
    });

    it('应该处理空的serverInfo对象', () => {
      render(<ServerCard serverId="empty-test" serverInfo={{}} displayName="空对象测试" />);

      // 没有isOnline字段时应该被视为离线
      expect(screen.getByText('离线')).toBeInTheDocument();
      expect(screen.getByText('空对象测试')).toBeInTheDocument();
    });

    it('应该处理isOnline为false且没有players字段的情况', () => {
      render(
        <ServerCard
          serverId="offline-test"
          serverInfo={{ isOnline: false }}
          displayName="离线测试"
        />
      );

      expect(screen.getByText('离线')).toBeInTheDocument();
      expect(screen.getByText('离线测试')).toBeInTheDocument();
    });

    it('应该处理长服务器名称', () => {
      const longName = '非常长的服务器名称用于测试文本显示和布局处理能力';
      render(
        <ServerCard
          serverId="long-name-test"
          serverInfo={{ isOnline: true, players: 100 }}
          displayName={longName}
        />
      );

      expect(screen.getByText(longName)).toBeInTheDocument();
      expect(screen.getByText('100 在线')).toBeInTheDocument();
    });

    it('应该处理大玩家数量', () => {
      render(
        <ServerCard
          serverId="high-players-test"
          serverInfo={{ isOnline: true, players: 9999 }}
          displayName="高玩家数测试"
        />
      );

      expect(screen.getByText('9999 在线')).toBeInTheDocument();
    });
  });
});
