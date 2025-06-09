// filepath: c:\Users\ASKLL\WebstormProjects\voidix-web\src\components\business\ServerCard.tsx
import React from 'react';

/**
 * 单个服务器卡片组件属性接口
 */
export interface ServerCardProps {
  serverId: string;
  serverInfo: any;
  displayName: string;
  categoryTitle?: string;
}

/**
 * 单个服务器卡片组件
 * 用于StatusPage显示单个服务器的状态信息
 */
export const ServerCard: React.FC<ServerCardProps> = ({
  serverInfo,
  displayName,
  categoryTitle,
}) => {
  if (!serverInfo) return null;

  const status = serverInfo.isOnline ? 'online' : 'offline';
  const players = serverInfo.players || 0;

  return (
    <div className="bg-gray-700/50 rounded p-3 hover:bg-gray-700/70 transition-colors duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div
            className={`w-2 h-2 rounded-full ${
              status === 'online' ? 'bg-green-500 animate-pulse' : 'bg-red-500'
            }`}
          />
          <span className={`text-sm ${categoryTitle ? 'font-normal' : 'font-medium'} text-white`}>
            {displayName}
          </span>
        </div>
        <span
          className={`text-sm font-mono ${
            status === 'online' ? 'text-green-400' : 'text-red-400'
          } transition-colors`}
        >
          {status === 'online' ? `${players} 在线` : '离线'}
        </span>
      </div>
    </div>
  );
};
