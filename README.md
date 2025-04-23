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
└── .env.example         # 环境变量示例文件
```

## 环境变量配置

### 前端环境变量
- `ACCESS_CODE`: 访问密码（留空则不启用密码验证）

### 后端环境变量（Cloudflare Workers）
- `EMAIL_DOMAIN`: 邮箱域名配置
- `DATABASE_ID`: D1 数据库 ID

## 部署说明

1. Fork 本项目到你的 GitHub 账号

2. 在 Cloudflare 中设置：
   - 创建一个 D1 数据库
   - 配置邮件接收的 Worker
   - 在 Pages 中连接你的 GitHub 仓库
   - 在 Pages 的环境变量中配置必要的变量

3. 本地开发（可选）：
```bash
# 安装依赖
npm install

# 使用 wrangler 进行本地开发
npm run dev
```

## 技术栈

- 前端：React + Vite
- 后端：Cloudflare Workers
- 数据库：Cloudflare D1

## 注意事项

1. 确保你有：
   - Cloudflare 账号
   - 已配置的域名
   - D1 数据库实例

2. 本项目主要面向直接部署到 Cloudflare，本地开发为可选项

## 许可证

MIT 