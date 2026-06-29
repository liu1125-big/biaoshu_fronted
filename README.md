# AI标书 Web 前端

基于 React 19 + TypeScript + Vite 的标书生成管理平台前端应用。

## 项目结构

```
src/
├── main.tsx                      # 应用入口
├── App.tsx                      # 根组件，路由配置
├── styles.css                    # 全局样式
│
├── app/                         # 应用级配置
│   ├── providers/
│   │   └── AppProviders.tsx      # Context Providers (Toast, 文档解析提示)
│   └── menuConfig.ts            # 导航菜单配置
│
├── components/                   # 共享组件
│   ├── AppShell.tsx             # 主布局（侧边栏 + 内容区）
│   ├── Sidebar.tsx              # 可折叠导航侧边栏
│   └── ErrorBoundary.tsx         # React 错误边界
│
├── features/                    # 功能模块
│   ├── technical-plan/          # 📄 标书生成（核心功能）
│   │   ├── types.ts             # 类型定义
│   │   ├── hooks/
│   │   │   ├── useTechnicalPlanWorkflow.ts  # 工作流状态管理
│   │   │   └── useProjectList.ts           # 项目列表管理
│   │   ├── services/
│   │   │   └── bidAnalysisWorkflow.ts      # 投标分析任务定义
│   │   └── pages/
│   │       ├── TechnicalPlanEntry.tsx       # 入口（项目列表 → 工作流）
│   │       ├── TechnicalPlanHome.tsx       # 工作流总调度器
│   │       ├── ProjectListPage.tsx         # 项目列表（CRUD + 状态筛选）
│   │       ├── DocumentAnalysisPage.tsx    # Step 1: 选择标书
│   │       ├── BidAnalysisPage.tsx         # Step 2: 招标文件解析
│   │       ├── OutlineEditPage.tsx         # Step 3: 目录生成
│   │       └── ContentEditPage.tsx          # Step 4: 生成正文
│   │
│   └── knowledge-base/          # 📚 文档知识库
│       ├── types.ts
│       ├── hooks/
│       │   └── useKnowledgeBase.ts    # 知识库状态与操作
│       ├── pages/
│       │   └── KnowledgeBasePage.tsx  # 知识库主页面
│       └── utils/
│           ├── constants.tsx          # 状态标签等常量
│           └── helpers.tsx           # 辅助函数
│
└── shared/                      # 共享资源
    ├── api/
    │   ├── apiClient.ts         # API 客户端（Axios + Mock）
    │   └── endpoints.ts         # API 端点定义
    ├── ui/                      # 共享 UI 组件
    │   ├── index.ts             # 统一导出
    │   ├── Icons.tsx            # SVG 图标组件
    │   ├── FloatingToolbar.tsx  # 可拖拽浮动工具栏
    │   ├── MarkdownRenderer.tsx # Markdown 渲染
    │   ├── MarkdownEditor.tsx    # Markdown 编辑器
    │   ├── ToastProvider.tsx   # Toast 通知系统
    │   └── DocumentParseNoticeProvider.tsx  # LibreOffice 提示
    ├── utils/
    │   └── tree.ts              # 树形结构工具函数
    └── types/
        └── navigation.ts       # 导航类型定义
```

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| UI 框架 | React | 19.1.1 |
| 路由 | React Router | 7.6.0 |
| 构建工具 | Vite | 7.1.7 |
| 语言 | TypeScript | 5.9.2 |
| HTTP 客户端 | Axios | 1.9.0 |
| Markdown | react-markdown + remark-gfm + rehype-raw | ^10.1.0 |
| 图表 | mermaid | ^11.14.0 |
| UI 组件库 | Radix UI (Dialog, Popover, Toast, Tooltip 等) | 各版本 |

## 快速启动

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 预览生产构建
npm run preview
```

**开发服务器**: http://127.0.0.1:5173

## 环境变量

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `VITE_API_BASE` | 后端 API 地址 | 空（同源） |
| `VITE_APP_VERSION` | 应用版本号 | 0.1.0 |

## 模块说明

### 标书生成 (technical-plan)

多步骤向导式标书生成系统：

**Step 1 - 选择标书**
- 上传招标文件（.doc, .docx）
- 拖拽上传
- 解析为 Markdown 显示

**Step 2 - 招标文件解析**
- 18 个解析任务，分为 5 组：
  - 关键项（必选）：项目概述、技术评分要求、项目信息、甲方信息、交货服务要求
  - 采购与响应
  - 投标流程
  - 评审要求
  - 主体与合同
- 解析模式：只解析关键项 / 完整解析
- 支持自定义勾选解析项

**Step 3 - 目录生成**
- 树形大纲编辑器
- 添加/编辑/删除大纲节点及其子节点
- 大纲详情编辑（标题、描述）

**Step 4 - 生成正文**
- 按大纲叶子小节生成正文内容
- 并发生成
- Markdown 编辑器手动编辑
- 分节进度跟踪

**项目管理**
- 创建、重命名、删除项目
- 按状态筛选（草稿 / 进行中 / 已完成 / 已归档）
- 继续编辑已有项目

### 文档知识库 (knowledge-base)

历史参考资料管理系统：

**文件夹管理**
- 新建、重命名、删除文件夹

**文档处理**
- 支持格式：.doc, .docx, .wps, .pdf, .md
- 处理流水线：pending → copying → converting → extracting → matching → analyzing → saving → success
- 进度跟踪

## API 客户端

`src/shared/api/apiClient.ts` 提供统一的 API 调用接口：

```typescript
// 配置
apiClient.config.load()
apiClient.config.save()

// AI
apiClient.ai.chat(request)           // AI 对话
apiClient.ai.requestJson<TResult>()  // AI JSON 请求

// 文件
apiClient.file.parse(formData)        // 解析上传的文件

// 技术方案
apiClient.technicalPlan.*             // 标书生成相关 API
apiClient.tasks.*                     // 任务管理 API
apiClient.export.*                    // 导出 API

// 知识库
apiClient.knowledgeBase.*             // 知识库 API
```

**Mock 实现**：知识库模块已内置 Mock 数据，开发阶段可独立运行。

## 路由

```
/ → 重定向到 /technical-plan
/technical-plan → 标书生成入口
/document-knowledge-base → 文档知识库
```

## 开发说明

### 添加新页面

1. 在 `src/features/[feature]/pages/` 下创建页面组件
2. 在 `src/App.tsx` 添加路由
3. 在 `src/app/menuConfig.ts` 添加菜单配置

### 添加共享组件

1. 在 `src/shared/ui/` 下创建组件
2. 在 `src/shared/ui/index.ts` 导出

### API 开发

当前部分模块使用 Mock 数据：
- ✅ `knowledgeBase.*` - 已有 Mock 实现
- ✅ `projects.*` - 已有 Mock 实现（位于 `useProjectList` hook）
- ⚠️ 其他模块 - 需要后端支持

Mock 与真实 API 切换：通过 `VITE_API_BASE` 环境变量指定后端地址。
