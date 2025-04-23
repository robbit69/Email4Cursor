import { useState, useEffect } from 'react';
import { MantineProvider, Container, Paper, Title, Group, TextInput, Button, Stack, Text, CopyButton, Card, Box, Overlay, Divider } from '@mantine/core';
import { createStyles } from '@mantine/core';
import { Notifications, notifications } from '@mantine/notifications';
import { IconCopy, IconTrash, IconHistory, IconMail, IconRefresh, IconCheck, IconBrandGithub } from '@tabler/icons-react';

// API 基础 URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';

// 自定义样式 
const useStyles = createStyles((theme) => ({
  wrapper: {
    minHeight: '100vh',
    position: 'relative',
    backgroundImage: 'linear-gradient(135deg, #5B86E5 0%, #36D1DC 100%)',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
  },
  container: {
    paddingTop: theme.spacing.xl * 2,
    paddingBottom: theme.spacing.xl * 2,
    position: 'relative',
    zIndex: 1,
  },
  title: {
    color: 'white',
    fontFamily: '"Inter", sans-serif',
    fontSize: 42,
    fontWeight: 800,
    marginBottom: theme.spacing.xl,
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    borderRadius: theme.radius.lg,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    padding: theme.spacing.xl,
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
    color: 'white',
    overflow: 'hidden',
    position: 'relative',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 15px 35px rgba(0, 0, 0, 0.2)',
    },
  },
  inputWrapper: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    color: 'white',
    '&::placeholder': {
      color: 'rgba(255, 255, 255, 0.7)',
    },
  },
  button: {
    minWidth: 130,
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    fontSize: 15,
    fontWeight: 500,
    height: 44,
    transition: 'all 0.3s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 16px rgba(0, 0, 0, 0.15)',
    },
    '&:active': {
      transform: 'translateY(0)',
    },
  },
  primaryButton: {
    backgroundColor: 'rgba(64, 156, 255, 0.8)',
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgba(64, 156, 255, 0.9)',
    },
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.25)',
    },
  },
  dangerButton: {
    backgroundColor: 'rgba(255, 86, 86, 0.8)',
    color: 'white',
    '&:hover': {
      backgroundColor: 'rgba(255, 86, 86, 0.9)',
    },
  },
  messageCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(10px)',
    borderRadius: theme.radius.md,
    border: '1px solid rgba(255, 255, 255, 0.2)',
    marginBottom: theme.spacing.md,
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
    transition: 'transform 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
    },
  },
  codeSection: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    padding: theme.spacing.sm,
    borderRadius: theme.radius.sm,
    border: '1px solid rgba(255, 255, 255, 0.1)',
  },
  githubLink: {
    position: 'fixed',
    top: 16,
    right: 16,
    color: 'white',
    opacity: 0.7,
    textDecoration: 'none',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: 10,
    borderRadius: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    '&:hover': {
      opacity: 1,
      transform: 'scale(1.05)',
    },
  },
  divider: {
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderTop: '1px solid rgba(255, 255, 255, 0.1)',
    width: '100%',
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
  },
  emailDisplay: {
    fontSize: 18,
    fontWeight: 700,
    color: 'white',
    padding: '8px 16px',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    borderRadius: theme.radius.md,
    border: '1px solid rgba(255, 255, 255, 0.1)',
    display: 'inline-block',
  },
  highlight: {
    color: '#6EFFFF',
    fontWeight: 700,
  },
}));

function App() {
  const { classes, cx } = useStyles();
  const [currentEmail, setCurrentEmail] = useState(null);
  const [customPrefix, setCustomPrefix] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  // 生成新邮箱
  const createEmail = async (prefix = '') => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prefix }),
      });
      const data = await response.json();
      
      if (response.ok) {
        setCurrentEmail(data.email);
        setMessages([]);
        notifications.show({
          title: '成功',
          message: '邮箱创建成功！',
          color: 'teal',
          autoClose: 3000,
          icon: <IconCheck size={16} />,
        });
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      notifications.show({
        title: '错误',
        message: error.message || '创建邮箱失败',
        color: 'red',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // 删除当前邮箱的所有邮件
  const deleteMessages = async () => {
    if (!currentEmail) return;
    try {
      setLoading(true);
      await fetch(`${API_BASE_URL}/emails/${currentEmail}/messages`, {
        method: 'DELETE',
      });
      setMessages([]);
      notifications.show({
        title: '成功',
        message: '所有邮件已删除',
        color: 'teal',
        autoClose: 3000,
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      notifications.show({
        title: '错误',
        message: '删除邮件失败',
        color: 'red',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // 获取历史邮件
  const fetchMessages = async () => {
    if (!currentEmail) return;
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/emails/${currentEmail}/messages`);
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      notifications.show({
        title: '错误',
        message: '获取邮件失败',
        color: 'red',
        autoClose: 3000,
      });
    } finally {
      setLoading(false);
    }
  };

  // 检查新验证码
  useEffect(() => {
    if (!currentEmail) return;
    
    const checkNewCode = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/emails/${currentEmail}/code`);
        if (response.ok) {
          const data = await response.json();
          setMessages(prev => {
            if (!prev.find(msg => msg.id === data.id)) {
              return [data, ...prev];
            }
            return prev;
          });
        }
      } catch (error) {
        console.error('检查验证码失败:', error);
      }
    };

    const interval = setInterval(checkNewCode, 1000);
    return () => clearInterval(interval);
  }, [currentEmail]);

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS theme={{
      colorScheme: 'dark',
      fontFamily: 'Inter, sans-serif',
      headings: { fontFamily: 'Inter, sans-serif' },
      components: {
        TextInput: { 
          styles: () => ({
            input: { ...classes.input },
          }),
        },
      },
    }}>
      <Notifications position="top-right" />
      <Box className={classes.wrapper}>
        <Container size="md" className={classes.container}>
          <Title className={classes.title}>
            匿名邮箱接码服务
          </Title>

          {/* 功能区 */}
          <Paper className={classes.card} mb="xl">
            <Stack spacing="lg">
              <Box className={classes.inputWrapper}>
                <Group spacing="md" grow>
                  <TextInput
                    size="md"
                    placeholder="输入邮箱前缀（可选）"
                    value={customPrefix}
                    onChange={(e) => setCustomPrefix(e.target.value)}
                  />
                </Group>
                <Group spacing="md" mt="md" position="center">
                  <Button
                    size="md"
                    className={cx(classes.button, classes.primaryButton)}
                    onClick={() => createEmail(customPrefix)}
                    loading={loading}
                  >
                    <Group spacing={8}>
                      <IconMail size={20} />
                      <span>创建邮箱</span>
                    </Group>
                  </Button>
                  <Button
                    size="md"
                    className={cx(classes.button, classes.secondaryButton)}
                    onClick={() => createEmail()}
                    loading={loading}
                  >
                    <Group spacing={8}>
                      <IconRefresh size={20} />
                      <span>随机生成</span>
                    </Group>
                  </Button>
                </Group>
              </Box>

              {currentEmail && (
                <>
                  <Divider className={classes.divider} />
                  <Stack spacing="md" align="center">
                    <Text align="center" mb="xs">当前邮箱：</Text>
                    <Text className={classes.emailDisplay}>{currentEmail}</Text>
                    <Group spacing="md" mt="md">
                      <CopyButton value={currentEmail}>
                        {({ copied, copy }) => (
                          <Button
                            className={cx(classes.button, classes.primaryButton)}
                            onClick={copy}
                          >
                            <Group spacing={8}>
                              <IconCopy size={20} />
                              <span>{copied ? '已复制邮箱' : '复制邮箱'}</span>
                            </Group>
                          </Button>
                        )}
                      </CopyButton>
                      <Button
                        className={cx(classes.button, classes.dangerButton)}
                        onClick={deleteMessages}
                      >
                        <Group spacing={8}>
                          <IconTrash size={20} />
                          <span>清空邮件</span>
                        </Group>
                      </Button>
                      <Button
                        className={cx(classes.button, classes.secondaryButton)}
                        onClick={fetchMessages}
                      >
                        <Group spacing={8}>
                          <IconHistory size={20} />
                          <span>历史邮件</span>
                        </Group>
                      </Button>
                    </Group>
                  </Stack>

                  {/* 邮件展示区 */}
                  {messages.length > 0 && (
                    <>
                      <Divider className={classes.divider} />
                      <Text weight={600} size="lg" mb="md" align="center">邮件列表</Text>
                      <Stack spacing="md">
                        {messages.map((message) => (
                          <Card key={message.id} className={classes.messageCard} p="lg">
                            <Group position="apart" mb="xs">
                              <Text weight={700} size="lg" color="white">{message.subject || '无主题'}</Text>
                              <Text size="sm" color="rgba(255, 255, 255, 0.7)">
                                {new Date(message.received_at).toLocaleString()}
                              </Text>
                            </Group>
                            
                            <Text size="sm" color="rgba(255, 255, 255, 0.7)" mb="md">
                              发件人: {message.sender}
                            </Text>

                            {message.verification_code && (
                              <Box className={classes.codeSection} mb="md">
                                <Group position="apart">
                                  <Text weight={700}>验证码：<span className={classes.highlight}>{message.verification_code}</span></Text>
                                  <CopyButton value={message.verification_code}>
                                    {({ copied, copy }) => (
                                      <Button
                                        className={cx(classes.button, copied ? classes.primaryButton : classes.secondaryButton)}
                                        onClick={copy}
                                        size="sm"
                                        compact
                                      >
                                        <Group spacing={8}>
                                          <IconCopy size={16} />
                                          <span>{copied ? '验证码已复制' : '复制验证码'}</span>
                                        </Group>
                                      </Button>
                                    )}
                                  </CopyButton>
                                </Group>
                              </Box>
                            )}

                            <Text size="sm" style={{ whiteSpace: 'pre-wrap', color: 'rgba(255, 255, 255, 0.9)' }}>
                              {message.body}
                            </Text>
                          </Card>
                        ))}
                      </Stack>
                    </>
                  )}
                </>
              )}
            </Stack>
          </Paper>

          {/* 教程区 */}
          <Paper className={classes.card}>
            <Title order={3} mb="lg" align="center" color="white">使用说明</Title>
            <Stack spacing="md">
              <Text className={classes.instructionText}>1. 输入自定义邮箱前缀或使用随机生成按钮创建临时邮箱</Text>
              <Text className={classes.instructionText}>2. 使用该邮箱注册你需要的服务</Text>
              <Text className={classes.instructionText}>3. 系统会自动检测新邮件并提取验证码</Text>
              <Text className={classes.instructionText}>4. 点击相应按钮可以复制邮箱地址或验证码</Text>
              <Text className={classes.instructionText}>5. 可以查看历史邮件或清空所有邮件</Text>
              <Text color="rgba(255, 255, 255, 0.6)" align="center" mt="md" size="sm">
                本服务仅供学习和测试使用，请勿用于非法用途
              </Text>
            </Stack>
          </Paper>

          {/* 项目信息 */}
          <Text
            component="a"
            href="https://github.com/yourusername/email4cursor"
            target="_blank"
            rel="noopener noreferrer"
            className={classes.githubLink}
          >
            <IconBrandGithub size={20} />
            <span>GitHub</span>
          </Text>
        </Container>
      </Box>
    </MantineProvider>
  );
}

export default App;
