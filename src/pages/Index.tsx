import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Привет! Я GapGap AI. Чем могу помочь?' }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, newMessage]);
    setInputValue('');
    setIsTyping(true);

    setTimeout(() => {
      const responses = [
        'Отличный вопрос! GapGap AI может помочь вам с различными задачами.',
        'Я проанализировал ваш запрос. Вот что я могу предложить...',
        'Интересно! Давайте разберём это детальнее.',
        'Понял вас. Моя нейросеть обработала запрос и готова помочь!'
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      setIsTyping(false);
    }, 1500);
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
              onClick={() => setActiveTab('chat')}
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
          <Button className="gradient-purple text-white hover:opacity-90 transition-opacity">
            Начать
          </Button>
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
                  onClick={() => setActiveTab('chat')}
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
          <div className="container mx-auto px-4 py-12 max-w-5xl">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden" style={{ height: 'calc(100vh - 200px)' }}>
              <div className="flex flex-col h-full">
                <div className="border-b p-6 bg-gradient-to-r from-purple-50 to-pink-50">
                  <h2 className="text-2xl font-bold gradient-text mb-2">Чат с GapGap AI</h2>
                  <p className="text-sm text-gray-600">Задайте любой вопрос — получите умный ответ</p>
                </div>
                
                <ScrollArea className="flex-1 p-6">
                  <div className="space-y-4">
                    {messages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[70%] rounded-2xl px-6 py-4 ${
                          msg.role === 'user' 
                            ? 'gradient-purple text-white' 
                            : 'bg-gray-100 text-gray-900'
                        }`}>
                          <p className="text-sm leading-relaxed">{msg.content}</p>
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
                </ScrollArea>

                <div className="border-t p-6 bg-gray-50">
                  <div className="flex gap-3">
                    <Input 
                      placeholder="Введите ваше сообщение..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      className="flex-1 h-12 text-base"
                    />
                    <Button 
                      size="lg" 
                      className="gradient-purple text-white hover:opacity-90 px-8"
                      onClick={handleSendMessage}
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
                  <Button className="w-full mt-6" variant="outline">Начать бесплатно</Button>
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
    </div>
  );
};

export default Index;
