/**
 * 测试环境设置
 * 配置测试运行时需要的全局设置和Mock
 */

import '@testing-library/jest-dom';
import { initializeBrowserMocks, initializeWebSocketMocks } from './mocks';

// 为 framer-motion 添加 PointerEvent mock，修复测试环境兼容性
global.PointerEvent = class PointerEvent extends Event {
  pointerId: number;
  pressure: number;
  pointerType: string;

  constructor(type: string, init?: PointerEventInit) {
    super(type, init);
    this.pointerId = init?.pointerId ?? 0;
    this.pressure = init?.pressure ?? 0;
    this.pointerType = init?.pointerType ?? 'mouse';
  }
} as any;

// 初始化所有必要的Mock对象
initializeBrowserMocks();
initializeWebSocketMocks();

console.log('✅ 测试环境初始化完成');
