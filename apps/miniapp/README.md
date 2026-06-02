# 微信小程序端 (miniapp)

> 实训项目全过程管理平台的微信小程序端，基于 [uni-app](https://uniapp.dcloud.io/) + Vue 3 + Vite 构建。

## 状态

🟡 **脚手架已就绪，业务页面待实现**

当前已配置：
- 9 个页面骨架（`pages/index`, `login`, `project/list|detail`, `group/list`, `progress/list`, `document/list`, `score/list`, `profile`）
- 4 项 tabBar（首页 / 项目 / 进度 / 我的）
- 编译配置（Vite + TypeScript）

待实现：各页面的真实业务逻辑（调用 Supabase API / 数据展示）。

## 目录结构

```
apps/miniapp/
├── manifest.json         uni-app 应用清单（含微信小程序 appid 占位）
├── pages.json            页面路由 + tabBar 配置
├── vite.config.ts        Vite 构建配置
├── tsconfig.json         TypeScript 配置
├── package.json          依赖与脚本
└── src/
    ├── main.ts           入口文件
    ├── App.vue           应用根组件
    ├── style/index.scss  全局样式
    └── pages/
        ├── index/index.vue         首页
        ├── login/login.vue         登录
        ├── project/list.vue        项目列表
        ├── project/detail.vue      项目详情
        ├── group/list.vue          小组列表
        ├── progress/list.vue       进度提交
        ├── document/list.vue       文档管理
        ├── score/list.vue          成绩查询
        └── profile/profile.vue     个人信息
```

## 本地开发

```bash
cd apps/miniapp
npm install
npm run dev          # 启动 HBuilderX / CLI 调试
npm run build        # 构建生产版本（输出到 dist/）
```

> 💡 推荐使用 HBuilderX 打开此目录，可直接运行到微信开发者工具模拟器。

## 微信小程序 AppID

正式发布前需替换 `manifest.json` 中的 `mp-weixin.appid`：

```json
"mp-weixin": {
  "appid": "wx你的真实AppID"
}
```

## 共享后端

本小程序复用主 Web 端（`apps/web`）的 Supabase 项目，无需独立后端。鉴权通过 Supabase Auth 邮箱密码登录，跨端共享同一套 `profiles` / `user_roles` 表。

## 相关链接

- [uni-app 官方文档](https://uniapp.dcloud.net.cn/)
- [主项目 README](../../README.md)
- [BACKLOG 长期规划 F1](../../BACKLOG.md#-长期规划)
