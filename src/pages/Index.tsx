import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface Message {
  id?: number;
  role: 'user' | 'assistant';
  content: string;
}

interface User {
  id: number;
  email: string;
  name: string;
  subscription_plan: string;
}

interface Chat {
  id: number;
  title: string;
  updated_at: string;
}

const AUTH_URL = 'https://functions.poehali.dev/514ada78-49f0-41d5-b722-dec6a8a6e411';
const CHAT_URL = 'https://functions.poehali.dev/1dc9af25-0e8e-410e-8254-36d7d76a1dcd';

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState<User | null>(null);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      loadChats();
    }
  }, [user]);

  const loadChats = async () => {
    if (!user) return;
    try {
      const response = await fetch(`${CHAT_URL}?userId=${user.id}`);
      const data = await response.json();
      setChats(data.chats || []);
    } catch (error) {
      console.error('Failed to load chats:', error);
    }
  };

  const loadChatMessages = async (chatId: number) => {
    try {
      const response = await fetch(`${CHAT_URL}?userId=${user?.id}&chatId=${chatId}`);
      const data = await response.json();
      setMessages(data.messages || []);
      setCurrentChatId(chatId);
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось загрузить сообщения', variant: 'destructive' });
    }
  };

  const handleAuth = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
      const response = await fetch(AUTH_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: authMode,
          email,
          password,
          name: authMode === 'register' ? name : undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        setShowAuthDialog(false);
        toast({ title: 'Успешно!', description: authMode === 'register' ? 'Аккаунт создан' : 'Вы вошли в систему' });
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось подключиться к серверу', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setMessages([]);
    setChats([]);
    setCurrentChatId(null);
    toast({ title: 'Вы вышли из аккаунта' });
  };

  const createNewChat = async () => {
    if (!user) {
      setShowAuthDialog(true);
      return;
    }

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'create', userId: user.id })
      });

      const data = await response.json();
      if (response.ok) {
        setCurrentChatId(data.chat.id);
        setMessages([]);
        await loadChats();
        setActiveTab('chat');
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось создать чат', variant: 'destructive' });
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || !user || !currentChatId) return;

    const userMessage: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    try {
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          userId: user.id,
          chatId: currentChatId,
          message: inputValue
        })
      });

      const data = await response.json();
      
      if (response.ok) {
        setMessages(prev => [...prev, data.assistantMessage]);
      } else {
        toast({ title: 'Ошибка', description: data.error, variant: 'destructive' });
      }
    } catch (error) {
      toast({ title: 'Ошибка', description: 'Не удалось отправить сообщение', variant: 'destructive' });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-lg border-b border-gray-200 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
              <Icon name="Sparkles" size={24} className="text-white" />
            </div>
            <span className="text-2xl font-bold gradient-text">GapGap AI</span>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <button 
              onClick={() => setActiveTab('home')}
              className={`text-sm font-medium transition-colors ${activeTab === 'home' ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Главная
            </button>
            <button 
              onClick={() => {
                if (!user) {
                  setShowAuthDialog(true);
                } else if (!currentChatId) {
                  createNewChat();
                } else {
                  setActiveTab('chat');
                }
              }}
              className={`text-sm font-medium transition-colors ${activeTab === 'chat' ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Чат с ИИ
            </button>
            <button 
              onClick={() => setActiveTab('pricing')}
              className={`text-sm font-medium transition-colors ${activeTab === 'pricing' ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
            >
              Тарифы
            </button>
            <button 
              onClick={() => setActiveTab('api')}
              className={`text-sm font-medium transition-colors ${activeTab === 'api' ? 'text-primary' : 'text-gray-600 hover:text-gray-900'}`}
            >
              API
            </button>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <>
                <span className="text-sm text-gray-600 hidden md:block">👋 {user.name}</span>
                <Button variant="outline" size="sm" onClick={handleLogout}>
                  <Icon name="LogOut" size={16} className="mr-2" />
                  Выйти
                </Button>
              </>
            ) : (
              <Button className="gradient-purple text-white hover:opacity-90" onClick={() => setShowAuthDialog(true)}>
                Войти
              </Button>
            )}
          </div>
        </div>
      </nav>

      <div className="pt-20">
        {activeTab === 'home' && (
          <div className="container mx-auto px-4 py-20">
            <div className="text-center mb-16 animate-fade-in">
              <Badge className="mb-4 gradient-purple text-white border-0">✨ Новое поколение ИИ</Badge>
              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
                Встречайте
                <br />
                <span className="gradient-text">GapGap AI</span>
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
                Мощный ИИ-ассистент для решения любых задач. Общайтесь, создавайте, анализируйте — всё в одном месте.
              </p>
              <div className="flex gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="gradient-purple text-white hover:opacity-90 transition-all hover:scale-105"
                  onClick={() => {
                    if (!user) {
                      setShowAuthDialog(true);
                    } else {
                      createNewChat();
                    }
                  }}
                >
                  <Icon name="MessageSquare" size={20} className="mr-2" />
                  Попробовать бесплатно
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  onClick={() => setActiveTab('api')}
                >
                  <Icon name="Code" size={20} className="mr-2" />
                  API документация
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-20 animate-slide-up">
              <Card className="border-2 hover:border-primary transition-all hover:shadow-xl">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center mb-4">
                    <Icon name="Zap" size={24} className="text-primary" />
                  </div>
                  <CardTitle>Молниеносная скорость</CardTitle>
                  <CardDescription>
                    Получайте ответы за миллисекунды благодаря нашей оптимизированной нейросети
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-secondary transition-all hover:shadow-xl">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-pink-100 flex items-center justify-center mb-4">
                    <Icon name="Brain" size={24} className="text-secondary" />
                  </div>
                  <CardTitle>Умное понимание</CardTitle>
                  <CardDescription>
                    Продвинутые модели обработки языка для точного понимания контекста
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-2 hover:border-accent transition-all hover:shadow-xl">
                <CardHeader>
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center mb-4">
                    <Icon name="Shield" size={24} className="text-accent" />
                  </div>
                  <CardTitle>Безопасность данных</CardTitle>
                  <CardDescription>
                    Шифрование на уровне банка для защиты вашей информации
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="bg-white rounded-3xl p-12 shadow-2xl">
              <h2 className="text-4xl font-bold text-center mb-12">
                Возможности <span className="gradient-text">GapGap AI</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-8">
                {[
                  { icon: 'MessageCircle', title: 'Интеллектуальные диалоги', desc: 'Естественное общение на любые темы' },
                  { icon: 'FileText', title: 'Генерация контента', desc: 'Создание текстов, статей и документов' },
                  { icon: 'Code2', title: 'Помощь в программировании', desc: 'Написание и отладка кода' },
                  { icon: 'Languages', title: 'Переводы', desc: 'Точные переводы на 50+ языков' },
                  { icon: 'BarChart3', title: 'Анализ данных', desc: 'Обработка и визуализация информации' },
                  { icon: 'Lightbulb', title: 'Креативные идеи', desc: 'Генерация инновационных решений' }
                ].map((feature, idx) => (
                  <div key={idx} className="flex gap-4 items-start">
                    <div className="w-10 h-10 rounded-lg gradient-purple flex items-center justify-center flex-shrink-0">
                      <Icon name={feature.icon as any} size={20} className="text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">{feature.title}</h3>
                      <p className="text-gray-600 text-sm">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'chat' && (
          <div className="container mx-auto px-4 py-12 flex gap-4" style={{ height: 'calc(100vh - 120px)' }}>
            {user && (
              <Card className="w-64 flex-shrink-0">
                <CardHeader>
                  <CardTitle className="text-lg">История чатов</CardTitle>
                  <Button size="sm" className="w-full gradient-purple text-white" onClick={createNewChat}>
                    <Icon name="Plus" size={16} className="mr-2" />
                    Новый чат
                  </Button>
                </CardHeader>
                <CardContent className="p-2">
                  <ScrollArea className="h-[calc(100vh-280px)]">
                    {chats.map(chat => (
                      <button
                        key={chat.id}
                        onClick={() => loadChatMessages(chat.id)}
                        className={`w-full text-left p-3 rounded-lg mb-2 transition-colors ${
                          currentChatId === chat.id ? 'bg-purple-100' : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="font-medium text-sm truncate">{chat.title}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(chat.updated_at).toLocaleDateString('ru')}
                        </div>
                      </button>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>
            )}

            <div className="flex-1 bg-white rounded-3xl shadow-2xl overflow-hidden">
              <div className="flex flex-col h-full">
                <div className="border-b p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                  <h2 className="text-2xl font-bold gradient-text mb-2">Чат с GapGap AI</h2>
                  <p className="text-sm text-gray-600">Задайте любой вопрос — получите умный ответ</p>
                </div>
                
                <ScrollArea className="flex-1 p-6">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-gray-400">
                      <div className="text-center">
                        <Icon name="MessageSquare" size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Начните новый диалог с ИИ</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg, idx) => (
                        <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                            msg.role === 'user' 
                              ? 'gradient-purple text-white' 
                              : 'bg-gray-100 text-gray-900'
                          }`}>
                            <pre className="text-sm leading-relaxed whitespace-pre-wrap font-sans">{msg.content}</pre>
                          </div>
                        </div>
                      ))}
                      {isTyping && (
                        <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-2xl px-6 py-4">
                            <div className="flex gap-2">
                              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </ScrollArea>

                <div className="border-t p-6 bg-gray-50">
                  <div className="flex gap-3">
                    <Input 
                      placeholder="Введите ваше сообщение..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                      className="flex-1 h-12 text-base"
                      disabled={!currentChatId}
                    />
                    <Button 
                      size="lg" 
                      className="gradient-purple text-white hover:opacity-90 px-8"
                      onClick={handleSendMessage}
                      disabled={!currentChatId}
                    >
                      <Icon name="Send" size={20} />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'pricing' && (
          <div className="container mx-auto px-4 py-20">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-4">Выберите свой <span className="gradient-text">тариф</span></h2>
              <p className="text-xl text-gray-600">Гибкие планы для любых задач</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <Card className="border-2 hover:shadow-2xl transition-all">
                <CardHeader>
                  <Icon name="Rocket" size={32} className="text-gray-400 mb-4" />
                  <CardTitle className="text-2xl">Базовый</CardTitle>
                  <CardDescription className="text-base">Для личного использования</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">Бесплатно</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {['50 запросов в день', 'Базовая модель ИИ', 'Поддержка email'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Icon name="Check" size={18} className="text-green-500" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant="outline" onClick={() => setShowAuthDialog(true)}>
                    Начать бесплатно
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-4 border-primary hover:shadow-2xl transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 gradient-purple text-white px-4 py-1 text-xs font-semibold rounded-bl-lg">
                  ПОПУЛЯРНЫЙ
                </div>
                <CardHeader>
                  <Icon name="Star" size={32} className="text-primary mb-4" />
                  <CardTitle className="text-2xl">Профессиональный</CardTitle>
                  <CardDescription className="text-base">Для бизнеса и команд</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">1990₽</span>
                    <span className="text-gray-600">/мес</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {['Безлимитные запросы', 'Продвинутая модель ИИ', 'Приоритетная поддержка', 'API доступ'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Icon name="Check" size={18} className="text-green-500" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6 gradient-purple text-white hover:opacity-90">Выбрать план</Button>
                </CardContent>
              </Card>

              <Card className="border-2 hover:shadow-2xl transition-all">
                <CardHeader>
                  <Icon name="Building2" size={32} className="text-accent mb-4" />
                  <CardTitle className="text-2xl">Корпоративный</CardTitle>
                  <CardDescription className="text-base">Для крупных компаний</CardDescription>
                  <div className="pt-4">
                    <span className="text-4xl font-bold">Custom</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {['Всё из Pro', 'Выделенные ресурсы', 'SLA 99.9%', 'Персональный менеджер'].map((item, idx) => (
                      <li key={idx} className="flex items-center gap-2">
                        <Icon name="Check" size={18} className="text-green-500" />
                        <span className="text-sm">{item}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-6" variant="outline">Связаться с нами</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'api' && (
          <div className="container mx-auto px-4 py-20 max-w-6xl">
            <div className="text-center mb-16">
              <Badge className="mb-4 gradient-purple text-white border-0">
                <Icon name="Code" size={16} className="mr-2" />
                Для разработчиков
              </Badge>
              <h2 className="text-5xl font-bold mb-4">
                <span className="gradient-text">API</span> интеграция
              </h2>
              <p className="text-xl text-gray-600">Интегрируйте GapGap AI в свои приложения</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card>
                <CardHeader>
                  <Icon name="Zap" size={24} className="text-primary mb-2" />
                  <CardTitle>Быстрый старт</CardTitle>
                  <CardDescription>Начните работу за пару минут</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="bg-slate-900 rounded-lg p-4 font-mono text-sm text-green-400">
                    <div>npm install @gapgap/ai-sdk</div>
                    <div className="mt-2 text-gray-400">// или</div>
                    <div>pip install gapgap-ai</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <Icon name="BookOpen" size={24} className="text-secondary mb-2" />
                  <CardTitle>Документация</CardTitle>
                  <CardDescription>Полное руководство по API</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li className="flex items-center gap-2 text-sm">
                      <Icon name="FileText" size={16} className="text-gray-400" />
                      Аутентификация и токены
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Icon name="MessageSquare" size={16} className="text-gray-400" />
                      Chat API endpoints
                    </li>
                    <li className="flex items-center gap-2 text-sm">
                      <Icon name="Settings" size={16} className="text-gray-400" />
                      Конфигурация и лимиты
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Пример использования</CardTitle>
                <CardDescription>JavaScript / TypeScript</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-slate-900 rounded-xl p-6 font-mono text-sm overflow-x-auto">
                  <pre className="text-gray-300">
{`import { GapGapAI } from '@gapgap/ai-sdk';

const ai = new GapGapAI({
  apiKey: 'your_api_key_here'
});

const response = await ai.chat.complete({
  messages: [
    { role: 'user', content: 'Привет!' }
  ],
  model: 'gapgap-pro'
});

console.log(response.message);`}
                  </pre>
                </div>
              </CardContent>
            </Card>

            <div className="mt-12 text-center">
              <Button size="lg" className="gradient-purple text-white hover:opacity-90">
                <Icon name="Key" size={20} className="mr-2" />
                Получить API ключ
              </Button>
            </div>
          </div>
        )}
      </div>

      <footer className="bg-slate-900 text-white py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center gap-2 mb-6 md:mb-0">
              <div className="w-10 h-10 rounded-xl gradient-purple flex items-center justify-center">
                <Icon name="Sparkles" size={24} className="text-white" />
              </div>
              <span className="text-xl font-bold">GapGap AI</span>
            </div>
            <div className="flex gap-6 text-sm text-gray-400">
              <a href="#" className="hover:text-white transition-colors">О нас</a>
              <a href="#" className="hover:text-white transition-colors">Блог</a>
              <a href="#" className="hover:text-white transition-colors">Поддержка</a>
              <a href="#" className="hover:text-white transition-colors">Конфиденциальность</a>
            </div>
          </div>
          <div className="text-center mt-8 text-sm text-gray-500">
            © 2024 GapGap AI. Все права защищены.
          </div>
        </div>
      </footer>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl gradient-text">
              {authMode === 'login' ? 'Вход в аккаунт' : 'Регистрация'}
            </DialogTitle>
            <DialogDescription>
              {authMode === 'login' ? 'Войдите, чтобы продолжить' : 'Создайте аккаунт за 30 секунд'}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={authMode} onValueChange={(v) => setAuthMode(v as 'login' | 'register')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Вход</TabsTrigger>
              <TabsTrigger value="register">Регистрация</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Label htmlFor="login-email">Email</Label>
                  <Input id="login-email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="login-password">Пароль</Label>
                  <Input id="login-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full gradient-purple text-white">
                  Войти
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleAuth} className="space-y-4">
                <div>
                  <Label htmlFor="register-name">Имя</Label>
                  <Input id="register-name" name="name" required />
                </div>
                <div>
                  <Label htmlFor="register-email">Email</Label>
                  <Input id="register-email" name="email" type="email" required />
                </div>
                <div>
                  <Label htmlFor="register-password">Пароль</Label>
                  <Input id="register-password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full gradient-purple text-white">
                  Создать аккаунт
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
