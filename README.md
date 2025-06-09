# 🎮 Voidix Minecraft服务器官方网站

[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2.2-blue)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.3.1-purple)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.4-cyan)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-3.2.3-green)](https://vitest.dev/)
[![codecov](https://codecov.io/gh/voidix-network/voidix-web/branch/master/graph/badge.svg?token=1UK18ZSXU5)](https://codecov.io/gh/voidix-network/voidix-web)
[![Code License](https://img.shields.io/badge/GAGPL-3.0-yellow)](./LICENSE_CODE)
[![Content License](https://img.shields.io/badge/Content-CC_BY_SA_4.0-orange)](./LICENSE_CONTENT)

使用现代React 18 + TypeScript + Vite + Tailwind CSS技术栈，提供优质的用户体验和企业级SEO优化✨✨✨

## 🚀 快速开始

### 开发环境
```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 测试和覆盖率
```bash
# 运行所有测试
npm test

# 生成覆盖率报告
npm run test:coverage

# 查看详细测试指南
```
📖 [测试文档](./docs/TESTING.md)

### 生产构建
```bash
# 完整构建（包含预渲染和sitemap）
npm run build

# 基础构建
npm run build:basic

# 预览构建结果
npm run preview
```

## 📋 主要功能

- ✅ **现代化架构**: React 18 + TypeScript + Vite
- ✅ **响应式设计**: 移动端优先，完美适配各种设备  
- ✅ **SEO优化**: 预渲染、sitemap、结构化数据
- ✅ **性能优化**: 代码分割、懒加载、资源优化
- ✅ **测试覆盖**: Vitest + Testing Library + 覆盖率报告
- ✅ **实时状态**: WebSocket服务器状态监控
- ✅ **无障碍支持**: ARIA标签、键盘导航
- ✅ **暗色主题**: 专业的游戏风格设计

## 🛠️ 技术栈

### 核心框架
- **React 18** - 现代React特性（并发渲染、Suspense）
- **TypeScript** - 类型安全和更好的开发体验  
- **Vite** - 极速的构建工具和开发服务器

### 样式和UI
- **Tailwind CSS** - 实用优先的CSS框架
- **Framer Motion** - 流畅的动画效果
- **Lucide React** - 现代图标库

### 测试和质量
- **Vitest** - 快速的单元测试框架
- **Testing Library** - React组件测试
- **@vitest/coverage-v8** - 代码覆盖率报告

### SEO和性能
- **React Helmet Async** - 动态head管理
- **预渲染** - Puppeteer预渲染关键页面
- **Sitemap生成** - 自动生成搜索引擎地图

### 状态管理和通信  
- **Zustand** - 轻量级状态管理
- **WebSocket** - 实时服务器状态更新

## 📖 文档

- 📚 [测试指南](./docs/TESTING.md) - 详细的测试编写和覆盖率指南
- 🔍 [SEO优化](./docs/SEO.md) - SEO配置和最佳实践
- 🚀 [部署指南](./docs/UBUNTU-DEPLOYMENT.md) - Ubuntu服务器部署说明

## 🧪 测试

项目使用Vitest和Testing Library进行全面测试：

```bash
# 运行测试套件
npm run test:run      # 一次性运行
npm run test:watch    # 监视模式
npm run test:ui       # 可视化测试界面

# 覆盖率报告  
npm run test:coverage # 生成覆盖率报告
open coverage/index.html # 查看详细报告
```

### 当前测试状态
- ✅ **7个测试用例** 全部通过
- ✅ **NotFoundPage** 100%覆盖率
- ✅ **CI/CD集成** GitHub Actions自动测试
- ✅ **覆盖率报告** 多格式输出(HTML/JSON/LCOV)

## 🚀 部署

### 本地预览
```bash
npm run build
npm run preview
```

### 生产环境
详细部署说明请参考 [Ubuntu部署指南](./docs/UBUNTU-DEPLOYMENT.md)

## 📊 项目统计

- 📁 **组件数量**: 50+ React组件
- 🎨 **页面数量**: 4个主要页面 + 404页面
- 🔧 **工具函数**: 20+ 实用函数
- 📱 **响应式断点**: 移动端、平板、桌面
- ⚡ **构建大小**: ~500KB (gzipped)
- 🧪 **测试覆盖率**: 8.42% (持续改进中)

## 🤝 贡献

欢迎提交Issue和Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

### 开发规范
- ✅ 使用TypeScript编写类型安全的代码
- ✅ 遵循Prettier代码格式化规范
- ✅ 为新功能编写测试用例
- ✅ 确保所有测试通过
- ✅ 更新相关文档

## 📄 许可证

- **代码**: [MIT License](./LICENSE_CODE)
- **内容**: [CC BY-NC-SA 4.0](./LICENSE_CONTENT)

## 📞 联系我们

- 🌐 **官网**: [voidix.net](https://voidix.net)
- 📧 **邮箱**: support@voidix.net
- 💬 **QQ群**: 123456789

---

<div align="center">
  <p>🎮 <strong>Voidix</strong> - 最好玩的Minecraft服务器 🎮</p>
  <p>Built with ❤️ by Voidix Team</p>
</div>