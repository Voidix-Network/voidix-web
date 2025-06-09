// filepath: c:\Users\ASKLL\WebstormProjects\voidix-web\src\pages\StatusPage.tsx
import React, { useState, useEffect } from 'react';
import { useWebSocketStatus } from '@/hooks/useWebSocket';
import { formatRunningTime, calculateGroupStats } from '@/utils';
import { SERVER_DISPLAY_NAMES, SERVER_GROUPS } from '@/constants';
import { PageSEO } from '@/components/seo';
import { BreadcrumbNavigation, ServerCard, ServerGroupCard } from '@/components';

/**
 * 状态统计卡片组件
 */
interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, className = '' }) => (
  <div
    className={`bg-gray-800 rounded-lg border border-gray-700 p-6 hover:border-gray-600 transition-colors ${className}`}
  >
    <h3 className="text-gray-400 text-sm font-medium mb-2">{title}</h3>
    <p className="text-white text-2xl font-bold">{value}</p>
    {subtitle && <p className="text-gray-500 text-sm mt-1">{subtitle}</p>}
  </div>
);

/**
 * 统计卡片加载骨架屏
 */
const StatCardSkeleton: React.FC = () => (
  <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 animate-pulse">
    <div className="w-20 h-4 bg-gray-600 rounded mb-2" />
    <div className="w-16 h-8 bg-gray-600 rounded" />
  </div>
);

/**
 * 服务器卡片加载骨架屏
 */
const ServerCardSkeleton: React.FC = () => (
  <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden animate-pulse">
    <div className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-gray-600" />
          <div>
            <div className="w-32 h-4 bg-gray-600 rounded mb-2" />
            <div className="w-24 h-3 bg-gray-700 rounded" />
          </div>
        </div>
        <div className="text-right">
          <div className="w-20 h-4 bg-gray-600 rounded mb-2" />
          <div className="w-12 h-3 bg-gray-700 rounded" />
        </div>
      </div>
    </div>
  </div>
);

/**
 * 服务器状态页面组件
 * 迁移自原始的status.html页面，保持功能一致性
 */
export const StatusPage: React.FC = () => {
  const {
    connectionStatus,
    servers,
    aggregateStats,
    isMaintenance,
    runningTime,
    totalRunningTime,
  } = useWebSocketStatus();

  // 管理手风琴展开状态（按组展开）
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  // 切换组展开状态
  const toggleGroupExpansion = (groupKey: string) => {
    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupKey)) {
        newSet.delete(groupKey);
      } else {
        newSet.add(groupKey);

        // 跟踪组详情查看事件
        if (typeof window !== 'undefined' && window.voidixUnifiedAnalytics) {
          const groupInfo = SERVER_GROUPS[groupKey as keyof typeof SERVER_GROUPS];
          const groupStats = calculateGroupStats(groupInfo.servers, servers);
          window.voidixUnifiedAnalytics.trackCustomEvent(
            'server_group',
            'group_expand',
            groupKey,
            groupStats.totalPlayers
          );
        }
      }
      return newSet;
    });
  };

  // 页面加载时跟踪状态页面访问
  useEffect(() => {
    if (typeof window !== 'undefined' && window.voidixUnifiedAnalytics) {
      window.voidixUnifiedAnalytics.trackCustomEvent(
        'page_view',
        'status_page',
        'status_page_visit',
        Object.keys(servers).length
      );
    }
  }, []);

  // 跟踪服务器状态变化
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      window.voidixUnifiedAnalytics &&
      Object.keys(servers).length > 0
    ) {
      // 跟踪整体状态
      window.voidixUnifiedAnalytics.trackCustomEvent(
        'server_status',
        'status_update',
        'aggregate_stats',
        aggregateStats.totalPlayers
      );

      // 跟踪个别服务器状态
      Object.entries(servers).forEach(([serverId, serverData]) => {
        window.voidixUnifiedAnalytics.trackServerStatus(
          serverId,
          serverData.players,
          serverData.status === 'online'
        );
      });
    }
  }, [servers, aggregateStats]);

  return (
    <>
      <PageSEO pageKey="status" type="website" canonicalUrl="https://www.voidix.net/status" />
      <div className="min-h-screen bg-gray-900 py-16">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* 面包屑导航 */}
          <BreadcrumbNavigation className="mb-8" />

          {/* 页面标题 */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">服务器状态</h1>
            <p className="text-gray-400 text-lg">实时查看 Voidix 网络的服务器状态和统计信息</p>

            {/* 连接状态指示器 */}
            <div className="mt-6 flex items-center justify-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  connectionStatus === 'connected'
                    ? 'bg-green-500 animate-pulse'
                    : connectionStatus === 'reconnecting'
                      ? 'bg-yellow-500 animate-pulse'
                      : 'bg-red-500'
                }`}
              />
              <span className="text-gray-400 text-sm">
                {connectionStatus === 'connected'
                  ? '已连接'
                  : connectionStatus === 'reconnecting'
                    ? '重连中...'
                    : connectionStatus === 'failed'
                      ? '连接失败'
                      : '已断开'}
              </span>
            </div>
          </div>

          {/* 维护模式提示 */}
          {isMaintenance && (
            <div className="bg-gradient-to-r from-yellow-800 to-orange-800 border border-yellow-500 rounded-lg p-6 mb-8 shadow-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center animate-pulse">
                  <svg
                    className="w-4 h-4 text-yellow-900"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-yellow-100 font-bold text-lg">🚧 服务器维护中</h3>
              </div>
              <p className="text-yellow-100 mb-2">服务器正在进行维护，部分功能可能暂时不可用。</p>
              <p className="text-yellow-200 text-sm">
                💡 请访问官网 www.voidix.top 获取最新信息，或加群 186438621 联系管理员
              </p>
            </div>
          )}

          {/* 统计卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {connectionStatus === 'connected' && Object.keys(servers).length > 0 ? (
              <>
                <StatCard
                  title="总在线玩家"
                  value={aggregateStats.totalPlayers}
                  subtitle="跨所有服务器"
                />
                <StatCard
                  title="在线服务器"
                  value={`${aggregateStats.onlineServers}/${Object.keys(servers).filter(id => id !== 'anticheat_test').length}`}
                  subtitle="正常运行中"
                />
                <StatCard
                  title="总运行时间"
                  value={formatRunningTime(totalRunningTime)}
                  subtitle="自启动以来"
                />
              </>
            ) : (
              <>
                <StatCardSkeleton />
                <StatCardSkeleton />
                <StatCardSkeleton />
              </>
            )}
          </div>

          {/* 服务器状态列表 */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white mb-6">服务器详情</h2>

            {connectionStatus !== 'connected' ? (
              <div className="text-center py-12">
                <div className="space-y-4">
                  {connectionStatus === 'reconnecting' ? (
                    <>
                      <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      <div className="text-gray-400">正在连接到服务器...</div>
                    </>
                  ) : connectionStatus === 'failed' ? (
                    <>
                      <svg
                        className="w-12 h-12 text-red-400 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <div className="text-gray-400">无法连接到服务器</div>
                      <p className="text-gray-500 text-sm">请检查网络连接或稍后再试</p>
                    </>
                  ) : (
                    <>
                      <div className="text-gray-400">正在加载服务器数据...</div>
                      <div className="space-y-4">
                        <ServerCardSkeleton />
                        <ServerCardSkeleton />
                        <ServerCardSkeleton />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ) : Object.keys(servers).length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400">正在加载服务器数据...</div>
                <div className="space-y-4 mt-6">
                  <ServerCardSkeleton />
                  <ServerCardSkeleton />
                  <ServerCardSkeleton />
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {Object.entries(SERVER_GROUPS).map(([groupKey, groupInfo]) => {
                  const groupStats = calculateGroupStats(groupInfo.servers, servers);
                  return (
                    <ServerGroupCard
                      key={groupKey}
                      groupInfo={groupInfo}
                      groupStats={groupStats}
                      isExpanded={expandedGroups.has(groupKey)}
                      onToggle={() => toggleGroupExpansion(groupKey)}
                    >
                      {groupInfo.servers.map(serverId => {
                        const serverData = servers[serverId];
                        const displayName = (SERVER_DISPLAY_NAMES as any)[serverId] || serverId;
                        return (
                          <ServerCard
                            key={serverId}
                            serverId={serverId}
                            serverInfo={serverData}
                            displayName={displayName}
                            categoryTitle={groupInfo.description}
                          />
                        );
                      })}
                    </ServerGroupCard>
                  );
                })}
              </div>
            )}
          </div>

          {/* 实时运行时间显示 */}
          {runningTime !== null && (
            <div className="mt-12 text-center">
              <div className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg border border-gray-600 p-6 inline-block shadow-lg">
                <div className="flex items-center justify-center space-x-2 mb-2">
                  <svg
                    className="w-5 h-5 text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <h3 className="text-gray-400 text-sm font-medium">当前运行时间</h3>
                </div>
                <p className="text-green-400 text-2xl font-mono font-bold">
                  {formatRunningTime(runningTime)}
                </p>
                <p className="text-gray-500 text-xs mt-1">自启动以来持续运行</p>
              </div>
            </div>
          )}

          {/* 页脚信息 */}
          <div className="mt-16 text-center border-t border-gray-700 pt-8">
            <div className="space-y-4">
              <p className="text-gray-500 text-xs">
                © 2025 Voidix Network. 实时服务器状态监控系统
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
