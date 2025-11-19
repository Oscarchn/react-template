# Getting Started
- Hit run
- Edit [App.tsx](#src/App.tsx) and watch it live update!

# Learn More

You can learn more in the [Base Extension Development Guide](https://lark-technologies.larksuite.com/docx/HvCbdSzXNowzMmxWgXsuB2Ngs7d) or [多维表格扩展脚本开发指南](https://feishu.feishu.cn/docx/U3wodO5eqome3uxFAC3cl0qanIe).

## Install packages

Install packages in Shell pane or search and add in Packages pane.

## Publish
Please npm run build first, submit it together with the dist directory, and then fill in the form:
[Share form](https://feishu.feishu.cn/share/base/form/shrcnGFgOOsFGew3SDZHPhzkM0e)



## 发布
请先npm run build，连同dist目录一起提交，然后再填写表单：
[共享表单](https://feishu.feishu.cn/share/base/form/shrcnGFgOOsFGew3SDZHPhzkM0e)


# Lark Base Sidebar Extension (React)

本项目是一个基于 **飞书多维表格（Lark Base / Bitable）** 的 **边栏插件（Sidebar Extension）**，使用 **React + @lark-base-open/js-sdk** 实现。
主要目标：

* 为多维表格用户提供一个嵌入式的侧边栏工具
* 通过 Base JS SDK 读写当前 Base 的表、字段、记录
* 严格遵守官方插件开发规范，支持浅色/深色主题与多语言

---

## 1. 技术栈与运行环境

* **运行形态**：多维表格页面内 `iframe` 侧边栏插件
* **前端框架**：React
* **构建工具**：Vite（推荐）
* **SDK**：`@lark-base-open/js-sdk`
* **路由**：`HashRouter`（禁止使用 History 模式）
* **国际化**：`react-i18next` + JSON 语言包（zh / en / jp）

> ⚠️ 注意：
>
> * 前端插件只能使用 **Base JS SDK** 访问数据；
> * 如需服务器逻辑，应使用 **Node SDK + PersonalBaseToken**，且 PersonalBaseToken 只能存放在服务端，不能暴露在前端代码中。

---

## 2. 开发 & 调试

### 2.1 安装依赖

```bash
npm install
# or
yarn install
```

### 2.2 本地开发

```bash
npm run dev
```

通常会在本地起一个开发服务器，然后在多维表格的插件配置中，将插件 URL 指向本地地址（例如 `http://localhost:5173/`），用于调试。

### 2.3 构建产物

```bash
npm run build
```

构建产物默认输出到 `dist` 目录：

* `package.json` 中需包含：

  ```json
  {
    "output": "dist"
  }
  ```
* 确保 `dist/` 没有被 `.gitignore` 排除，发布到插件中心时需要上传这一目录的内容。

---

## 3. 项目结构（示例）

```txt
.
├─ src/
│  ├─ main.tsx          # 入口，初始化 SDK、主题监听、i18n 等
│  ├─ App.tsx           # 根组件，承载布局和路由
│  ├─ hooks/
│  │  ├─ useTheme.ts    # 封装主题获取和 onThemeChange 监听
│  │  ├─ useBaseEvents.ts # 封装 base/table/view/record 等事件监听
│  ├─ components/
│  │  ├─ SidebarLayout.tsx
│  │  ├─ XxxPanel.tsx   # 业务面板组件
│  ├─ services/
│  │  ├─ baseClient.ts  # 和 JS SDK 交互封装（表、字段、记录操作）
│  ├─ locales/
│  │  ├─ zh.json
│  │  ├─ en.json
│  │  ├─ jp.json
│  ├─ i18n.ts           # react-i18next 初始化
│  ├─ styles/
│  │  ├─ index.css      # 全局样式，含主题相关 CSS 变量
│  └─ router/
│     ├─ index.tsx      # HashRouter 配置
├─ public/
│  └─ icon.svg
├─ dist/                # 构建产物（发布时上传）
├─ vite.config.ts
├─ package.json
└─ README.md
```

---

## 4. 主题与布局规范

### 4.1 浅色 / 深色主题支持

插件必须支持 **LIGHT / DARK 两种主题**，不能只适配一种。

* 初始化时获取当前主题：

  ```ts
  const theme = await bitable.bridge.getTheme(); // "LIGHT" | "DARK"
  ```

* 监听主题变化：

  ```ts
  bitable.bridge.onThemeChange((event) => {
    const theme = event.data.theme;
  });
  ```

* 使用 CSS 变量或顶层 class 切换颜色，而不是在组件内硬编码颜色。

### 4.2 布局要求

* 最小宽度约 **410px**。
* 使用 **flex 垂直布局**。
* 避免写死大量 px，建议使用 `%` / `rem` / 弹性布局。

### 4.3 字体规范

```css
font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Tahoma,
  "PingFang SC", "Microsoft Yahei", Arial, "Hiragino Sans GB", sans-serif,
  "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
```

---

## 5. 国际化（i18n）

### 5.1 目录

```txt
src/locales/
├─ zh.json
├─ en.json
└─ jp.json
```

### 5.2 初始化（示例）

```ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

export function initI18n(lang) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: {} },
      zh: { translation: {} },
      jp: { translation: {} }
    },
    lng: lang,
    fallbackLng: 'en'
  });
}
```

> 所有用户可见文案必须从 i18n 加载。

---

## 6. 数据访问与性能 / 安全规范

### 6.1 通过 JS SDK 访问 Base 数据

```ts
const table = await bitable.base.getActiveTable();
const records = await table.getRecords({ pageSize: 100 });
```

### 6.2 必须优先使用批量接口

* `addRecords`
* `setRecords`
* `deleteRecords`
* `getRecords`

### 6.3 数据安全

* 禁止写死 token（PersonalBaseToken、appToken 等）。
* 禁止无必要上传 Base 数据到第三方服务。

---

## 7. 任务状态 API 约束

- 有效状态仅支持：`todo`、`done`
- 前端与服务层均进行严格校验：任何非上述值的写入将被拒绝
- 状态转换规则：只允许从 `todo` 转为 `done`（单向转换）；不支持回退为 `todo`
- 多维表格 Schema 要求：任务表的 `status` 字段类型为单选（SingleSelect），且枚举值仅包含 `todo` 与 `done`
- 国际化文案：`status.todo` 与 `status.done` 保留，其余状态文案已移除

```ts
// 更新任务状态（仅接受 'todo' | 'done'）
await updateTaskStatus(recordId, 'done');
```

---

## 8. 事件监听

插件应监听：

* base/table/view/field 结构变化
* record/cell 数据变化
* 用户选中记录变化

---

## 9. 路由与构建

* 使用 `HashRouter`，禁止 History。
* `vite.config.ts` 中必须：

  ```ts
  base: './'
  ```
* 构建输出：`dist/`

---

## 10. Coding Rules for Copilot

```md
When generating code for this project, ALWAYS follow these rules:

1. This is a Lark Base sidebar plugin built with React.
2. Use @lark-base-open/js-sdk for all table/field/record operations.
3. Support LIGHT/DARK themes via getTheme + onThemeChange.
4. Use responsive layout; sidebar min width ≈ 410px.
5. Use i18n JSON files for ALL user-facing text.
6. Use batch APIs for large data operations.
7. NEVER hard-code tokens or send Base data externally.
8. Listen to base/table/view/field/record/cell changes.
9. Use HashRouter and relative paths; build to dist/.
```

---

## 11. 相关链接

* JS SDK 文档： [https://lark-base-team.github.io/js-sdk-docs/zh/](https://lark-base-team.github.io/js-sdk-docs/zh/)
* React 模板： [https://github.com/Lark-Base-Team/react-template](https://github.com/Lark-Base-Team/react-template)
* UIBuilder 模板： [https://github.com/Lark-Base-Team/uibuilder-template](https://github.com/Lark-Base-Team/uibuilder-template)
* 插件发布申请： [https://feishu.feishu.cn/share/base/form/shrcnwTXnFVAbMPOSeaOFwIAnbf](https://feishu.feishu.cn/share/base/form/shrcnwTXnFVAbMPOSeaOFwIAnbf)
