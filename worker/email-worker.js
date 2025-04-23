export default {
  async email(message, env, ctx) {
    // 提取邮件信息
    const to = message.to;
    const from = message.from;
    const subject = message.headers.get("subject");
    const body = await message.text();
    
    try {
      // 提取验证码
      const verificationCode = extractVerificationCode(subject, body);
      
      // 存储邮件到数据库
      await env.DB.prepare(`
        INSERT INTO email_messages 
        (email_address, sender, subject, body, verification_code) 
        VALUES (?, ?, ?, ?, ?)
      `).bind(to, from, subject, body, verificationCode).run();
      
      // 转发邮件（可选，如果需要的话）
      // await message.forward(to);
      
    } catch (error) {
      console.error('Error processing email:', error);
    }
  }
};

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