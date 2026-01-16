import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface Student {
  id: number;
  name: string;
  balance: number;
  attendance: number;
  group: string;
  lastVisit: string;
}

interface Group {
  id: number;
  name: string;
  students: number;
  schedule: string;
  trainer: string;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const mockStudents: Student[] = [
    { id: 1, name: 'Иванов Артём', balance: 1200, attendance: 92, group: 'САМБО 7-9 лет', lastVisit: '2026-01-15' },
    { id: 2, name: 'Петрова Мария', balance: -300, attendance: 87, group: 'САМБО 7-9 лет', lastVisit: '2026-01-14' },
    { id: 3, name: 'Сидоров Максим', balance: 600, attendance: 95, group: 'Юниоры', lastVisit: '2026-01-16' },
    { id: 4, name: 'Кузнецова Анна', balance: -600, attendance: 78, group: 'Юниоры', lastVisit: '2026-01-13' },
  ];

  const mockGroups: Group[] = [
    { id: 1, name: 'САМБО 7-9 лет', students: 12, schedule: 'ПН, СР, ПТ 16:00', trainer: 'Бикташев А.' },
    { id: 2, name: 'Юниоры', students: 15, schedule: 'ВТ, ЧТ, СБ 18:00', trainer: 'Бикташев А.' },
    { id: 3, name: 'Начинающие', students: 8, schedule: 'ПН, СР 17:00', trainer: 'Иванов С.' },
  ];

  const totalStudents = mockStudents.length;
  const totalDebt = mockStudents.filter(s => s.balance < 0).reduce((sum, s) => sum + Math.abs(s.balance), 0);
  const totalBalance = mockStudents.reduce((sum, s) => sum + s.balance, 0);
  const avgAttendance = Math.round(mockStudents.reduce((sum, s) => sum + s.attendance, 0) / totalStudents);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-50 backdrop-blur-sm bg-card/80">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-destructive rounded-lg flex items-center justify-center">
              <span className="text-2xl">🥋</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground font-heading">САМБО Система</h1>
              <p className="text-sm text-muted-foreground">Система учёта посещаемости</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Icon name="Bell" size={20} />
            </Button>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground font-semibold">АБ</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <nav className="border-b border-border bg-card/50">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="h-14 bg-transparent border-0 gap-2">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Icon name="LayoutDashboard" size={18} />
                Главная
              </TabsTrigger>
              <TabsTrigger value="groups" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Icon name="Users" size={18} />
                Группы
              </TabsTrigger>
              <TabsTrigger value="students" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Icon name="User" size={18} />
                Ученики
              </TabsTrigger>
              <TabsTrigger value="finance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Icon name="DollarSign" size={18} />
                Финансы
              </TabsTrigger>
              <TabsTrigger value="schedule" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-2">
                <Icon name="Calendar" size={18} />
                Расписание
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="py-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="border-l-4 border-l-primary hover-scale">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Icon name="Users" size={16} />
                      Всего учеников
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{totalStudents}</div>
                    <p className="text-xs text-muted-foreground mt-1">В 3 группах</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-accent hover-scale">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Icon name="TrendingUp" size={16} />
                      Средняя посещаемость
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-foreground">{avgAttendance}%</div>
                    <Progress value={avgAttendance} className="mt-2 h-2" />
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-success hover-scale">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Icon name="Wallet" size={16} />
                      Общий баланс
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-bold ${totalBalance >= 0 ? 'text-success' : 'text-destructive'}`}>
                      {totalBalance >= 0 ? '+' : ''}{totalBalance} ₽
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">Все ученики</p>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-l-destructive hover-scale">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Icon name="AlertCircle" size={16} />
                      Задолженность
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-destructive">{totalDebt} ₽</div>
                    <p className="text-xs text-muted-foreground mt-1">{mockStudents.filter(s => s.balance < 0).length} должников</p>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="Activity" size={20} />
                      Последние посещения
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockStudents.map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.group}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={student.attendance >= 90 ? 'default' : 'secondary'} className="mb-1">
                            {student.attendance}%
                          </Badge>
                          <p className="text-xs text-muted-foreground">{student.lastVisit}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon name="AlertTriangle" size={20} />
                      Требуют внимания
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {mockStudents.filter(s => s.balance < 0).map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded-lg bg-destructive/10 border border-destructive/20 hover:bg-destructive/20 transition-colors">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-destructive text-destructive-foreground text-xs">
                              {student.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{student.name}</p>
                            <p className="text-xs text-muted-foreground">{student.group}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-destructive">{student.balance} ₽</p>
                          <Button size="sm" variant="outline" className="mt-1 h-7 text-xs">
                            Пополнить
                          </Button>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="groups" className="py-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-heading">Группы</h2>
                <Button className="gap-2">
                  <Icon name="Plus" size={18} />
                  Создать группу
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mockGroups.map(group => (
                  <Card key={group.id} className="hover-scale cursor-pointer">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">{group.trainer}</p>
                        </div>
                        <Badge variant="secondary">{group.students} чел</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Icon name="Calendar" size={16} className="text-muted-foreground" />
                        <span>{group.schedule}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" className="flex-1">Посещаемость</Button>
                        <Button size="sm" variant="outline" className="flex-1">Управление</Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="students" className="py-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold font-heading">Ученики</h2>
                <Button className="gap-2">
                  <Icon name="UserPlus" size={18} />
                  Добавить ученика
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b bg-muted/50">
                        <tr>
                          <th className="text-left p-4 font-semibold text-sm">Ученик</th>
                          <th className="text-left p-4 font-semibold text-sm">Группа</th>
                          <th className="text-left p-4 font-semibold text-sm">Посещаемость</th>
                          <th className="text-left p-4 font-semibold text-sm">Баланс</th>
                          <th className="text-left p-4 font-semibold text-sm">Последний визит</th>
                          <th className="text-left p-4 font-semibold text-sm">Действия</th>
                        </tr>
                      </thead>
                      <tbody>
                        {mockStudents.map(student => (
                          <tr key={student.id} className="border-b hover:bg-muted/30 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <Avatar>
                                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                                    {student.name.split(' ').map(n => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">{student.name}</span>
                              </div>
                            </td>
                            <td className="p-4 text-sm">{student.group}</td>
                            <td className="p-4">
                              <Badge variant={student.attendance >= 90 ? 'default' : 'secondary'}>
                                {student.attendance}%
                              </Badge>
                            </td>
                            <td className="p-4">
                              <span className={`font-bold ${student.balance >= 0 ? 'text-success' : 'text-destructive'}`}>
                                {student.balance >= 0 ? '+' : ''}{student.balance} ₽
                              </span>
                            </td>
                            <td className="p-4 text-sm text-muted-foreground">{student.lastVisit}</td>
                            <td className="p-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="ghost">
                                  <Icon name="Eye" size={16} />
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Icon name="Edit" size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="finance" className="py-6">
              <h2 className="text-2xl font-bold font-heading mb-6">Финансы</h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Финансовая сводка</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <Icon name="PieChart" size={48} className="mx-auto mb-2 opacity-50" />
                        <p>График будет добавлен в следующей версии</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Быстрая статистика</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="p-3 rounded-lg bg-success/10 border border-success/20">
                      <p className="text-sm text-muted-foreground">Поступления (месяц)</p>
                      <p className="text-2xl font-bold text-success">+24,600 ₽</p>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                      <p className="text-sm text-muted-foreground">Задолженности</p>
                      <p className="text-2xl font-bold text-destructive">-{totalDebt} ₽</p>
                    </div>
                    <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                      <p className="text-sm text-muted-foreground">Средний чек</p>
                      <p className="text-2xl font-bold text-primary">300 ₽</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="py-6">
              <h2 className="text-2xl font-bold font-heading mb-6">Расписание</h2>
              <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
                {['ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ', 'ВС'].map((day, idx) => (
                  <Card key={day} className={idx >= 5 ? 'bg-muted/50' : ''}>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-center text-sm">{day}</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      {idx % 2 === 0 && idx < 6 && (
                        <>
                          <div className="p-2 rounded bg-primary/10 border border-primary/20 text-xs">
                            <p className="font-semibold">16:00</p>
                            <p className="text-muted-foreground">7-9 лет</p>
                          </div>
                          <div className="p-2 rounded bg-accent/10 border border-accent/20 text-xs">
                            <p className="font-semibold">17:00</p>
                            <p className="text-muted-foreground">Начинающие</p>
                          </div>
                        </>
                      )}
                      {idx % 2 === 1 && idx < 6 && (
                        <div className="p-2 rounded bg-success/10 border border-success/20 text-xs">
                          <p className="font-semibold">18:00</p>
                          <p className="text-muted-foreground">Юниоры</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </nav>
    </div>
  );
};

export default Index;
