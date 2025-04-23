import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// 启用CORS
app.use('/*', cors());

// 生成随机邮箱前缀
function generateRandomPrefix(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from(
    { length },
    () => chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
}

// 创建新邮箱
app.post('/emails', async (c) => {
  const { prefix } = await c.req.json();
  const emailPrefix = prefix || generateRandomPrefix();
  const emailAddress = `${emailPrefix}@您的域名`; // 替换为您的域名

  try {
    await c.env.DB.prepare(
      'INSERT INTO email_addresses (email_address) VALUES (?)'
    ).bind(emailAddress).run();

    return c.json({ email: emailAddress });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      return c.json({ error: '邮箱已存在' }, 400);
    }
    return c.json({ error: '创建邮箱失败' }, 500);
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