# 浏览器端功能验证 — training-project-platform

> 用途：将本文档交给具备浏览器自动化能力的 agent，对中优先级 5 项改动做端到端功能验证。
>
> 项目路径：`C:\Users\user\Documents\trae-soio\training-project-platform\apps\web`
>
> 部署状态：✅ 已部署到 GitHub Pages — `https://ronineymessjr-sudo.github.io/training-project-platform/`
> 本地启动：见 §1

---

## 1. 启动本地服务（如未使用线上 Pages）

```bash
cd C:\Users\user\Documents\trae-soio\training-project-platform\apps\web
npm install
npm run dev
# 浏览器打开 http://localhost:5173
```

如果 Supabase 环境变量未配置（`.env.local` 不存在），改用线上 Pages URL。

---

## 2. 登录账号

| 角色 | 邮箱 | 密码 |
|---|---|---|
| 管理员 | `admin@test.com` | `admin123456` |
| 教师 | `teacher@test.com` | `teacher123456` |
| 学生 | `student@test.com` | `student123456` |

> 至少需要管理员账号才能验证「创建项目」「创建分组」流程。

---

## 3. 验证任务清单

每项都标了【核心】或【辅助】—— 核心必须通过，辅助是加分项。

### #4 【核心】API 错误处理补全

**改动点**：替换 7 个页面的静默 `catch { console.error }`，统一用 `message.error(error?.message || '...')`。

**验证步骤**：
1. 用 DevTools 切到 **Network → Offline**（或拔网线）
2. 登录后访问以下页面，每次进入都应看到**红色 toast 错误提示**（不是控制台报错）：
   - `/`（Dashboard） → 应提示"获取仪表盘数据失败"或具体 Supabase 错误
   - `/profile` → 编辑真实姓名 → 改一个值 → 点保存 → 应弹错误
   - `/documents` → 应弹"获取项目列表失败"
   - `/scores` → 应弹"获取评分数据失败"
   - `/admin/announcements` → 应弹"获取公告数据失败"
   - `/groups` → 应弹"获取分组列表失败"
   - `/projects` → 应弹"获取项目列表失败"
3. 关闭 Offline，刷新页面，toast 消失，页面正常加载

**失败标准**：页面无任何 toast 提示（说明错误处理没生效）；或 throw 红色错误弹窗（说明是 Promise rejection 没接住）。

---

### #5 【核心】Dashboard 骨架屏

**改动点**：Dashboard 的「最近项目」「我的小组」两个 Card 在 loading 时显示 `<Skeleton>`。

**验证步骤**：
1. DevTools → Network → 选 **Slow 3G**（或自定义 throttle 到 ~500ms 延迟）
2. 登出再登录（admin 账号）
3. 进入 Dashboard `/`
4. 首次加载时观察：「最近项目」和「我的小组」两个 Card 内应出现**灰色骨架占位**（不是 spinner，不是空白，也不是已有内容）
5. 加载完成后骨架消失，显示真实数据或 "暂无数据" 空态

**失败标准**：loading 期间 Card 内是空白、spinner、或直接显示旧数据。

---

### #6 【核心】classId / projectId 改 Select + 表单验证

**改动点**：Project/List 的 classId 改 Select 拉班级；Group/List 的 projectId 改 Select 拉项目；加 maxLength + endDate≥startDate 校验。

**验证步骤 A（项目创建）**：
1. 登录 admin 账号 → 访问 `/projects`
2. 点「创建项目」
3. 弹窗里**班级字段**应是**下拉选择器**（不是数字输入框）
4. 班级下拉应**有内容**（如果有班级数据）—— 等 0.5s 加载
5. 必填项全留空 → 点「确定」→ 看到红字"请输入项目名称"等
6. 项目名填 `测试项目A` → 开始日期 `2026-06-10` → 结束日期 `2026-06-05`（早于开始）→ 点「确定」→ 看到红字"结束日期不能早于开始日期"
7. 修正结束日期为 `2026-06-20` → 提交 → 看到"项目创建成功"toast

**验证步骤 B（分组创建）**：
1. 访问 `/groups`
2. 点「创建分组」
3. 「所属项目」字段应是下拉选择器
4. 必填项留空 → 提交 → 看到"请选择项目" / "请输入分组名称" 红字
5. 填齐提交 → 看到"分组创建成功"

**失败标准**：classId 仍是数字输入框；下拉为空且不加载；表单提交时不弹验证错误。

---

### #7 【辅助】miniapp 目录说明

**改动点**：新增 `apps/miniapp/README.md`。

**验证步骤**（**无需浏览器**，直接读文件）：
```bash
type C:\Users\user\Documents\trae-soio\training-project-platform\apps\miniapp\README.md
```

**通过标准**：文件存在；内容含「状态」「目录结构」「本地开发」等章节；说明此目录是 uni-app 微信小程序脚手架。

---

### #8 【核心】移除 pps/server 旧引用

**改动点**：`docker-compose.yml` 和 `start.sh` 加弃用提示。

**验证步骤**（**无需浏览器**）：
1. 检查 `docker/docker-compose.yml` 头部应有"⚠️ 已弃用"注释块
2. 检查 `start.sh` 头部应有同样注释 + 头部 `exit 1`
3. 尝试运行 `start.sh`（Git Bash / WSL）：应直接打印弃用警告并退出（exit code = 1），不应尝试启动 Docker

**通过标准**：上述三项都满足。

---

## 4. 回归测试（【核心】确保没破坏已有功能）

完成上面 5 项后，再跑一遍基础流程：

| 流程 | 步骤 | 预期 |
|---|---|---|
| 登录 | 输入 admin@test.com / admin123456 → 登录 | 跳转 Dashboard，顶部显示「管理员」角色 |
| 登出 | 右上角登出 → 回到登录页 | URL = `/login` |
| 侧边栏 | 验证三个角色侧边栏菜单项正确（学生有「项目列表/小组/进度」等，教师有「评分/答辩」，管理员有「班级/公告」） | 菜单按角色显示 |
| 表格 | 访问 `/projects` → 看到现有项目列表（含 2 个种子项目） | 表格正常渲染，分页器显示「共 2 条」 |
| 公告 | 访问 `/admin/announcements` → 看到 2 条种子公告 | 表格显示，「发布公告」按钮可见（admin 角色） |

---

## 5. 报告格式

每项验证完成后按以下格式汇报（**复制到最终报告里**）：

```markdown
### #4 API 错误处理
- ✅/❌ Dashboard 离线时弹错误 toast
- ✅/❌ Profile 离线时弹错误 toast
- ✅/❌ Document / Score / Announcement / Group / Project 全部离线提示
- 备注：（如有异常现象，截图/录屏/控制台日志）

### #5 骨架屏
- ✅/❌ Slow 3G 下 Dashboard 看到灰色骨架
- 备注：

### #6 classId Select + 表单验证
- ✅/❌ 创建项目：classId 是下拉
- ✅/❌ 创建项目：endDate < startDate 阻止提交
- ✅/❌ 创建分组：projectId 是下拉
- ✅/❌ 必填项留空阻止提交
- 备注：

### #7 miniapp README
- ✅/❌ README 存在且内容完整
- 备注：

### #8 server 旧引用弃用
- ✅/❌ docker-compose.yml 有弃用提示
- ✅/❌ start.sh 有弃用提示 + exit 1
- ✅/❌ 运行 start.sh 不会启动 Docker
- 备注：

### 回归测试
- ✅/❌ 登录/登出
- ✅/❌ 角色侧边栏
- ✅/❌ 项目表格显示种子数据
- ✅/❌ 公告表格显示种子数据
- 备注：
```

---

## 6. 完整改动文件清单（供交叉验证）

```
apps/web/src/pages/Profile.tsx                            ← #4
apps/web/src/pages/Dashboard.tsx                          ← #4 + #5
apps/web/src/pages/Document/List.tsx                      ← #4
apps/web/src/pages/Score/List.tsx                         ← #4
apps/web/src/pages/Admin/AnnouncementManagement.tsx       ← #4
apps/web/src/pages/Group/List.tsx                         ← #4 + #6
apps/web/src/pages/Project/List.tsx                       ← #4 + #6
apps/miniapp/README.md                                    ← #7 (新增)
docker/docker-compose.yml                                 ← #8
start.sh                                                  ← #8
BACKLOG.md                                                ← 全部 (更新)
```

---

## 7. 验证完成后请把报告发回给主 agent。

主 agent 会更新 BACKLOG.md（标记全部完成 + 验证通过日期），并准备 git commit。
