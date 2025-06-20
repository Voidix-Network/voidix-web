// 服务器状态类型
export type ServerStatus = 'online' | 'offline' | 'maintenance';

// 玩家IGN相关类型
export interface PlayerIgnInfo {
  uuid: string;
  ign: string; // 游戏内用户名
  serverId: string;
  joinTime: Date;
  lastSeen: Date;
}

// 服务器玩家IGN映射
export interface ServerPlayerIgns {
  [serverId: string]: PlayerIgnInfo[];
}

// 服务器相关类型定义
export interface ServerInfo {
  id: string;
  name: string;
  displayName: string;
  address: string;
  status: ServerStatus;
  players: number;
  maxPlayers: number;
  uptime: number;
  totalUptime: number;
  lastUpdate: Date;
  isOnline: boolean;
}

// WebSocket消息类型
export interface WebSocketMessage {
  type:
    | 'full'
    | 'maintenance_status_update'
    | 'players_update_add'
    | 'players_update_remove'
    | 'server_update'
    | 'notice_update_add_respond'
    | 'notice_update_remove_respond'
    | 'notice_return';
  payload?: any;
  isMaintenance?: boolean;
  status?: boolean | string;
  maintenanceStartTime?: string | null;
  servers?: Record<string, ServerData> | ServerUpdateData; // 支持两种格式
  players?: {
    online: string;
    currentPlayers: Record<string, any>;
  };
  player?: {
    uuid: string;
    username?: string;
    previousServer?: string;
    newServer?: string;
    currentServer?: string;
  };
  runningTime?: number | string;
  totalRunningTime?: number | string;
  totalOnlinePlayers?: number;
  // 公告系统相关字段
  error_msg?: string;
  notices?: Record<
    string,
    {
      title: string;
      text: string;
      time: number;
      color: string;
    }
  >;
}

// 原始服务器数据结构（用于full消息）
export interface ServerData {
  online: number;
  isOnline?: boolean; // 改为可选，因为WebSocket消息可能不包含此字段
  uptime?: number;
}

// server_update消息中的服务器数据结构（简化格式：serverId: playerCount）
export interface ServerUpdateData {
  [serverId: string]: number; // 直接是玩家数量
}

// WebSocket连接状态
export type ConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'connecting'
  | 'reconnecting'
  | 'failed';

// 服务器聚合统计
export interface AggregateStats {
  totalPlayers: number;
  onlineServers: number;
  totalUptime: number;
}

// 状态显示文本常量
export interface StatusTexts {
  loading: string;
  online: string;
  offline: string;
  disconnected: string;
  unknown: string;
  partialUnknown: string;
  lessThanAMinute: string;
  errorConnecting: string;
  maintenance: string;
  maintenanceStartTimePrefix: string;
  connectionFailedPermanently: string;
  reconnecting: string;
  playerDataLoading: string;
  noPlayersOnline: string;
  unknownTime: string;
  invalidTimestamp: string;
  timeFormatError: string;
}

// CSS类名常量
export interface StatusClasses {
  indexPage: {
    dotBase: string;
    colorGreen: string;
    colorYellow: string;
    colorRed: string;
    animatePulse: string;
  };
  statusPage: {
    dotOnline: string;
    dotOffline: string;
    dotMaintenance: string;
  };
  textGreen: string;
  textYellow: string;
  textRed: string;
  textMonoGreen: string;
  textMonoRed: string;
  textMonoYellow: string;
}

// WebSocket配置
export interface WebSocketConfig {
  url: string;
  maxReconnectAttempts: number;
  reconnectIntervals: number[];
  connectionTimeout: number;
  disableReconnect?: boolean; // 禁用重连功能（主要用于测试）
}

// 时间常量
export interface TimeConstants {
  SECONDS_IN_MINUTE: number;
  SECONDS_IN_HOUR: number;
  SECONDS_IN_DAY: number;
  SECONDS_IN_YEAR: number;
}

// 服务器配置
export interface ServerConfig {
  [key: string]: {
    statusPageElements?: {
      statusEl: string;
      dotEl: string;
      displayNameEl: string;
    };
    indexPageElements?: {
      badge: string;
      dot: string;
    };
    keys: string[];
    isAggregate?: boolean;
  };
}

// Tab组件相关类型
export interface TabItem {
  label: string;
  value: string;
  content: React.ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

// 动画组件相关类型
export interface AnimatedSectionProps {
  children: React.ReactNode;
  delay?: number;
  initial?: any;
  whileInView?: any;
  viewport?: any;
  className?: string;
}

// 服务器状态卡片类型
export interface ServerCardProps {
  type: 'MINIGAME' | 'SURVIVAL';
  address: string;
  status: ServerStatus;
  players: number;
  maxPlayers?: number;
  className?: string;
}
