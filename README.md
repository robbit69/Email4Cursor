# Email4Cursor

匿名邮箱接码服务，基于 Cloudflare Workers 和 Pages 构建。

## 功能特点

- 支持自定义邮箱前缀
- 自动提取验证码
- 实时邮件通知
- 历史邮件查询
- 响应式界面设计
- 可选的访问密码保护

## 项目结构

```
/
├── public/              # 前端代码
├── worker/              # Workers 后端代码
├── .dev.vars.example    # 后端环境变量示例
├── .env.local.example   # 前端环境变量示例
└── .env.example         # 环境变量说明
```

## 环境变量配置

项目使用两套环境变量系统：

### 后端环境变量（Cloudflare Workers）

1. 本地开发：
   - 复制 `.dev.vars.example` 为 `.dev.vars`
   - 填入实际的配置值：
     - `EMAIL_DOMAIN`: 邮箱域名
     - `DATABASE_ID`: D1 数据库 ID
   - 使用 `wrangler dev` 启动服务

2. 生产环境：
   - 在 Cloudflare Dashboard 中配置相同的变量

### 前端环境变量（Cloudflare Pages）

1. 本地开发：
   - 复制 `.env.local.example` 为 `.env.local`
   - 填入实际的配置值：
     - `VITE_API_URL`: API 接口地址
     - `VITE_APP_NAME`: 应用名称
     - `VITE_GITHUB_URL`: 项目地址
     - `VITE_ACCESS_CODE`: 访问密码（留空则不启用密码验证）
   - 使用 `npm run dev` 启动服务

2. 生产环境：
   - 在 Cloudflare Pages 的项目设置中配置相同的变量

## 开发环境设置

1. 安装依赖：
```bash
npm install
```

2. 配置环境变量：
   - 复制 `.env.example` 为 `.dev.vars` 和 `.env.local`
   - 填入实际配置值

3. 本地开发：
```bash
# 启动后端服务
npm run dev:worker

# 启动前端服务
npm run dev:frontend
```

4. 部署：
```bash
# 部署 Workers
npm run deploy:worker

# 部署 Pages（自动通过 GitHub 触发）
git push origin main
```

## 技术栈

- 前端：React + Vite
- 后端：Cloudflare Workers + Hono
- 数据库：Cloudflare D1

## 注意事项

1. 不要提交包含敏感信息的文件：
   - `.dev.vars`
   - `.env.local`
   - 任何包含实际配置值的环境变量文件

2. 本地开发时需要：
   - 有效的 Cloudflare 账号
   - 配置好的 D1 数据库
   - 已设置的邮箱域名

3. 数据库迁移：
   - 使用 `wrangler` 命令行工具管理数据库迁移
   - 迁移文件位于 `worker/db/migrations/` 目录

## 许可证

MIT 