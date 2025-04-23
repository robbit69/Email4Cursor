import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// 启用CORS
app.use('/*', cors());

// 初始化数据库
async function initializeDatabase(db) {
  try {
    const schema = await fetch(new URL('./db/schema.sql', import.meta.url)).then(r => r.text());
    await db.batch(schema.split(';').filter(stmt => stmt.trim()).map(stmt => db.prepare(stmt)));
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
  }
}

// 生成随机邮箱前缀
function generateRandomPrefix(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(
    { length },
    () => chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}

// 中间件：检查数据库初始化
app.use('/*', async (c, next) => {
  try {
    // 尝试查询 email_addresses 表
    await c.env.DB.prepare('SELECT 1 FROM email_addresses LIMIT 1').run();
  } catch (error) {
    // 如果表不存在，会抛出错误，这时我们初始化数据库
    if (error.message.includes('no such table')) {
      await initializeDatabase(c.env.DB);
    }
  }
  
  await next();
});

// 提取验证码的辅助函数
function extractVerificationCode(subject, body) {
  // 常见的验证码模式
  const patterns = [
    /验证码[：:]\s*([0-9]{4,6})/,
    /code[：:]\s*([0-9]{4,6})/i,
    /([0-9]{4,6})\s*(?:是|为|is)/,
    /验证码\D*([0-9]{4,6})/,
    /code\D*([0-9]{4,6})/i,
    /([0-9]{4,6})/  // 最后尝试匹配任何4-6位数字
  ];

  // 先尝试从主题中提取
  for (const pattern of patterns) {
    const match = subject?.match(pattern);
    if (match?.[1]) return match[1];
  }

  // 再从正文中提取
  for (const pattern of patterns) {
    const match = body?.match(pattern);
    if (match?.[1]) return match[1];
  }

  return null;
}

// 创建新邮箱
app.post('/emails', async (c) => {
  const { prefix } = await c.req.json();
  
  // 如果用户指定了前缀
  if (prefix) {
    const emailAddress = `${prefix}@${c.env.EMAIL_DOMAIN}`;
    try {
      await c.env.DB.prepare(
        'INSERT INTO email_addresses (email_address) VALUES (?)'
      ).bind(emailAddress).run();
      return c.json({ email: emailAddress });
    } catch (error) {
      if (error.message.includes('UNIQUE constraint failed')) {
        return c.json({ error: '指定的邮箱前缀已存在' }, 400);
      }
      return c.json({ error: '创建邮箱失败' }, 500);
    }
  }

  // 如果是随机生成前缀,则循环尝试直到成功
  while (true) {
    const emailPrefix = generateRandomPrefix();
    const emailAddress = `${emailPrefix}@${c.env.EMAIL_DOMAIN}`;
    
    try {
      await c.env.DB.prepare(
        'INSERT INTO email_addresses (email_address) VALUES (?)'
      ).bind(emailAddress).run();
      return c.json({ email: emailAddress });
    } catch (error) {
      if (!error.message.includes('UNIQUE constraint failed')) {
        return c.json({ error: '创建邮箱失败' }, 500);
      }
      // 如果是重复,则继续循环尝试新的前缀
      continue;
    }
  }
});

// 获取最新验证码
app.get('/emails/:email/code', async (c) => {
  const email = c.req.param('email');

  const result = await c.env.DB.prepare(`
    SELECT * FROM email_messages 
    WHERE email_address = ? 
    AND is_deleted = 0 
    AND is_read = 0 
    ORDER BY received_at DESC 
    LIMIT 1
  `).bind(email).all();

  if (!result.results?.length) {
    return c.json({ error: '没有新的验证码' }, 404);
  }

  // 标记为已读
  await c.env.DB.prepare(
    'UPDATE email_messages SET is_read = 1 WHERE id = ?'
  ).bind(result.results[0].id).run();

  return c.json(result.results[0]);
});

// 获取历史邮件
app.get('/emails/:email/messages', async (c) => {
  const email = c.req.param('email');

  const messages = await c.env.DB.prepare(`
    SELECT * FROM email_messages 
    WHERE email_address = ? 
    AND is_deleted = 0 
    ORDER BY received_at DESC
  `).bind(email).all();

  return c.json(messages.results || []);
});

// 删除邮件
app.delete('/emails/:email/messages', async (c) => {
  const email = c.req.param('email');

  await c.env.DB.prepare(`
    UPDATE email_messages 
    SET is_deleted = 1 
    WHERE email_address = ?
  `).bind(email).run();

  return c.json({ success: true });
});

export default app; 