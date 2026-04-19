import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Progress } from './ui/progress';
import { 
  LayoutDashboard, Users, UserCheck, GraduationCap, BookOpen, 
  DollarSign, LogOut, Globe, Plus, School, Edit, Trash2,
  Calendar, TrendingUp, TrendingDown, CheckCircle, XCircle,
  Clock, Search, FileText, MessageSquare, Settings, Bell,
  Upload, Camera, BarChart3, PieChart, Activity, Award,
  Target, Zap, Star, Heart, Sparkles
} from 'lucide-react';

const SchoolAdminDashboardComplete = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [fees, setFees] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'success', message: 'تم إضافة طالب جديد بنجاح', time: '5 دقائق', read: false },
    { id: 2, type: 'warning', message: '3 طلاب غائبين اليوم', time: '1 ساعة', read: false },
    { id: 3, type: 'info', message: 'رسوم جديدة بانتظار الدفع', time: '2 ساعات', read: true }
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const statsRes = await axios.get('/dashboard/stats');
      setStats(statsRes.data);

      if (activeTab === 'students') {
        const studentsRes = await axios.get('/students');
        setStudents(studentsRes.data);
      } else if (activeTab === 'teachers') {
        const teachersRes = await axios.get('/teachers');
        setTeachers(teachersRes.data);
      } else if (activeTab === 'parents') {
        const parentsRes = await axios.get('/parents');
        setParents(parentsRes.data);
      } else if (activeTab === 'attendance') {
        const today = new Date().toISOString().split('T')[0];
        const attendanceRes = await axios.get(`/attendance?date=${today}`);
        setAttendance(attendanceRes.data);
        const studentsRes = await axios.get('/students');
        setStudents(studentsRes.data);
      } else if (activeTab === 'grades') {
        const gradesRes = await axios.get('/grades');
        setGrades(gradesRes.data);
        const studentsRes = await axios.get('/students');
        setStudents(studentsRes.data);
      } else if (activeTab === 'fees') {
        const feesRes = await axios.get('/fees');
        setFees(feesRes.data);
        const studentsRes = await axios.get('/students');
        setStudents(studentsRes.data);
      } else if (activeTab === 'assignments') {
        const assignmentsRes = await axios.get('/assignments');
        setAssignments(assignmentsRes.data);
      }
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Top Header Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm backdrop-blur-lg bg-opacity-90">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 via-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <School className="w-7 h-7 text-white" />
                  <Sparkles className="w-4 h-4 text-yellow-300 absolute -top-1 -right-1" />
                </div>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                  {user.full_name}
                </h1>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <Award className="w-3 h-3" />
                  {t('school_admin')}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {/* Notifications */}
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="relative"
                  onClick={() => setShowNotifications(!showNotifications)}
                >
                  <Bell className="w-4 h-4" />
                  {unreadNotifications > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifications}
                    </span>
                  )}
                </Button>
                
                {showNotifications && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden">
                    <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                      <h3 className="font-bold flex items-center gap-2">
                        <Bell className="w-4 h-4" />
                        الإشعارات
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {notifications.map(notif => (
                        <div 
                          key={notif.id}
                          className={`p-4 border-b hover:bg-gray-50 cursor-pointer transition-colors ${!notif.read ? 'bg-purple-50' : ''}`}
                        >
                          <p className="text-sm font-medium text-gray-900">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Language Switcher */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const langs = ['ar', 'fr', 'en'];
                  const currentIndex = langs.indexOf(i18n.language);
                  const nextLang = langs[(currentIndex + 1) % langs.length];
                  changeLanguage(nextLang);
                }}
                className="hover:scale-105 transition-transform"
              >
                <Globe className="w-4 h-4 mr-2" />
                {i18n.language.toUpperCase()}
              </Button>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={onLogout}
                className="hover:scale-105 transition-transform"
              >
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex">
        {/* Sidebar */}
        <div className={`w-72 min-h-screen bg-white border-r border-gray-200 p-6 ${isRTL ? 'border-l' : 'border-r'}`}>
          <nav className="space-y-2">
            <NavItem 
              icon={LayoutDashboard} 
              label={t('dashboard')} 
              active={activeTab === 'dashboard'}
              onClick={() => setActiveTab('dashboard')}
              badge="جديد"
              badgeColor="bg-green-500"
            />
            <NavItem 
              icon={Users} 
              label={t('students')} 
              active={activeTab === 'students'}
              onClick={() => setActiveTab('students')}
              count={students.length}
            />
            <NavItem 
              icon={GraduationCap} 
              label={t('teachers')} 
              active={activeTab === 'teachers'}
              onClick={() => setActiveTab('teachers')}
              count={teachers.length}
            />
            <NavItem 
              icon={Users} 
              label={t('parents')} 
              active={activeTab === 'parents'}
              onClick={() => setActiveTab('parents')}
            />
            <NavItem 
              icon={UserCheck} 
              label={t('attendance')} 
              active={activeTab === 'attendance'}
              onClick={() => setActiveTab('attendance')}
            />
            <NavItem 
              icon={BookOpen} 
              label={t('grades')} 
              active={activeTab === 'grades'}
              onClick={() => setActiveTab('grades')}
            />
            <NavItem 
              icon={FileText} 
              label={t('assignments')} 
              active={activeTab === 'assignments'}
              onClick={() => setActiveTab('assignments')}
            />
            <NavItem 
              icon={DollarSign} 
              label={t('fees')} 
              active={activeTab === 'fees'}
              onClick={() => setActiveTab('fees')}
            />
            <NavItem 
              icon={BarChart3} 
              label="التقارير" 
              active={activeTab === 'reports'}
              onClick={() => setActiveTab('reports')}
              badge="قريباً"
              badgeColor="bg-yellow-500"
            />
            <NavItem 
              icon={MessageSquare} 
              label="الرسائل" 
              active={activeTab === 'messages'}
              onClick={() => setActiveTab('messages')}
              badge="قريباً"
              badgeColor="bg-blue-500"
            />
          </nav>

          {/* Quick Stats in Sidebar */}
          <div className="mt-8 p-4 bg-gradient-to-br from-purple-100 to-indigo-100 rounded-xl">
            <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
              <Zap className="w-4 h-4 text-yellow-500" />
              إحصائيات سريعة
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">الحضور اليوم</span>
                <Badge variant="default" className="bg-green-500">
                  {stats?.present_today || 0}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">الغياب اليوم</span>
                <Badge variant="destructive">
                  {stats?.absent_today || 0}
                </Badge>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && <EnhancedDashboardView stats={stats} t={t} />}
          {activeTab === 'students' && <EnhancedStudentsView students={students} t={t} fetchData={fetchData} />}
          {activeTab === 'teachers' && <EnhancedTeachersView teachers={teachers} t={t} fetchData={fetchData} />}
          {activeTab === 'parents' && <EnhancedParentsView parents={parents} students={students} t={t} fetchData={fetchData} />}
          {activeTab === 'attendance' && <EnhancedAttendanceView attendance={attendance} students={students} t={t} fetchData={fetchData} />}
          {activeTab === 'grades' && <EnhancedGradesView grades={grades} students={students} t={t} fetchData={fetchData} />}
          {activeTab === 'assignments' && <EnhancedAssignmentsView assignments={assignments} t={t} fetchData={fetchData} />}
          {activeTab === 'fees' && <EnhancedFeesView fees={fees} students={students} t={t} fetchData={fetchData} />}
        </div>
      </div>
    </div>
  );
};

// Enhanced Nav Item with animations and badges
const NavItem = ({ icon: Icon, label, active, onClick, count, badge, badgeColor }) => (
  <div 
    className={`
      flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200
      ${active 
        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg scale-105' 
        : 'hover:bg-gray-100 text-gray-700'
      }
    `}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <Icon className="w-5 h-5" />
      <span className="font-medium">{label}</span>
    </div>
    {count !== undefined && (
      <Badge variant={active ? "secondary" : "outline"} className="ml-2">
        {count}
      </Badge>
    )}
    {badge && (
      <Badge className={`${badgeColor} text-white text-xs px-2 py-0.5`}>
        {badge}
      </Badge>
    )}
  </div>
);

// Enhanced Dashboard View with Charts
const EnhancedDashboardView = ({ stats, t }) => {
  if (!stats) return <div className="p-8">{t('loading')}</div>;

  const statCards = [
    { 
      icon: Users, 
      label: t('total_students'), 
      value: stats.total_students || 0, 
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      change: '+12%',
      changeType: 'up'
    },
    { 
      icon: GraduationCap, 
      label: t('total_teachers'), 
      value: stats.total_teachers || 0, 
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      change: '+5%',
      changeType: 'up'
    },
    { 
      icon: CheckCircle, 
      label: t('present_today'), 
      value: stats.present_today || 0, 
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      change: '85%',
      changeType: 'up'
    },
    { 
      icon: XCircle, 
      label: t('absent_today'), 
      value: stats.absent_today || 0, 
      color: 'from-red-500 to-red-600',
      bgColor: 'bg-red-50',
      iconColor: 'text-red-600',
      change: '15%',
      changeType: 'down'
    },
    { 
      icon: DollarSign, 
      label: t('total_paid'), 
      value: `$${stats.total_paid || 0}`, 
      color: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
      change: '+25%',
      changeType: 'up'
    },
    { 
      icon: TrendingDown, 
      label: t('total_pending'), 
      value: `$${stats.total_pending || 0}`, 
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50',
      iconColor: 'text-orange-600',
      change: '-10%',
      changeType: 'down'
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white border-0 shadow-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
        <CardContent className="p-8 relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                <Heart className="w-8 h-8 text-pink-300 animate-pulse" />
                مرحباً بك في نظام إدارة المدارس!
              </h2>
              <p className="text-purple-100 text-lg">
                لديك {stats.total_students} طالب و {stats.total_teachers} معلم في مدرستك
              </p>
              <Button variant="secondary" className="mt-4 hover:scale-105 transition-transform">
                <Star className="w-4 h-4 mr-2" />
                ابدأ جولة تعريفية
              </Button>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 bg-white bg-opacity-10 rounded-full flex items-center justify-center backdrop-blur-lg">
                <School className="w-16 h-16 text-white" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statCards.map((stat, index) => (
          <Card 
            key={index} 
            className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer border-0 shadow-md"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center transform hover:scale-110 transition-transform`}>
                  <stat.icon className={`w-7 h-7 ${stat.iconColor}`} />
                </div>
                <Badge className={`bg-gradient-to-r ${stat.color} text-white border-0`}>
                  {stat.changeType === 'up' ? '↑' : '↓'} {stat.change}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
              <Progress value={75} className="mt-3 h-2" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-purple-600" />
            إجراءات سريعة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionButton icon={Plus} label="إضافة طالب" color="purple" />
            <QuickActionButton icon={UserCheck} label="تسجيل الحضور" color="green" />
            <QuickActionButton icon={BookOpen} label="إضافة درجة" color="blue" />
            <QuickActionButton icon={FileText} label="واجب جديد" color="orange" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const QuickActionButton = ({ icon: Icon, label, color }) => {
  const colorClasses = {
    purple: 'from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700',
    green: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
    blue: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    orange: 'from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
  };

  return (
    <Button 
      className={`bg-gradient-to-r ${colorClasses[color]} text-white border-0 h-24 flex-col gap-2 hover:scale-105 transition-all shadow-lg`}
    >
      <Icon className="w-6 h-6" />
      <span className="text-sm font-medium">{label}</span>
    </Button>
  );
};

// Enhanced Students View with Image Upload
const EnhancedStudentsView = ({ students, t, fetchData }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    class_name: '',
    grade: '',
    date_of_birth: '',
    address: '',
    medical_info: ''
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/students', formData);
      toast.success('تم إضافة الطالب بنجاح! 🎉');
      setShowDialog(false);
      setFormData({
        username: '', password: '', full_name: '', email: '', phone: '',
        class_name: '', grade: '', date_of_birth: '', address: '', medical_info: ''
      });
      setImagePreview('');
      setSelectedImage(null);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    }
  };

  const filteredStudents = students.filter(s => 
    s.user_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.class_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Users className="w-8 h-8 text-purple-600" />
            {t('students')}
          </h1>
          <p className="text-gray-600 mt-1">{students.length} طالب في مدرستك</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <Plus className="w-4 h-4 mr-2" />
              {t('add_student')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
              <DialogTitle className="text-2xl flex items-center gap-2">
                <Users className="w-6 h-6" />
                {t('add_student')}
              </DialogTitle>
              <DialogDescription className="text-purple-100">
                أدخل معلومات الطالب الجديد بدقة
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6 p-2">
              {/* Image Upload Section */}
              <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-dashed border-purple-300">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="relative">
                      {imagePreview ? (
                        <Avatar className="w-32 h-32 ring-4 ring-purple-300">
                          <AvatarImage src={imagePreview} />
                        </Avatar>
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center ring-4 ring-purple-300">
                          <Camera className="w-12 h-12 text-white" />
                        </div>
                      )}
                      <label htmlFor="image-upload" className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full flex items-center justify-center cursor-pointer shadow-lg hover:scale-110 transition-transform border-2 border-purple-500">
                        <Upload className="w-5 h-5 text-purple-600" />
                      </label>
                      <input
                        id="image-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                    <p className="text-sm text-gray-600 text-center">
                      اضغط لرفع صورة الطالب (اختياري)
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {t('full_name')} *
                  </Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    placeholder="أدخل الاسم الكامل"
                    className="border-2 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{t('username')} *</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    placeholder="اسم المستخدم"
                    className="border-2 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{t('password')} *</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder="كلمة المرور"
                    className="border-2 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{t('email')}</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="البريد الإلكتروني"
                    className="border-2 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{t('phone')}</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="رقم الهاتف"
                    className="border-2 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{t('class')} *</Label>
                  <Input
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    required
                    placeholder="الصف الخامس أ"
                    className="border-2 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{t('grade')} *</Label>
                  <Input
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    required
                    placeholder="الابتدائي"
                    className="border-2 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-700 font-semibold">{t('date_of_birth')}</Label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                    className="border-2 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-gray-700 font-semibold">{t('address')}</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="العنوان الكامل"
                    className="border-2 focus:border-purple-500 transition-colors"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-gray-700 font-semibold">{t('medical_info')}</Label>
                  <Textarea
                    value={formData.medical_info}
                    onChange={(e) => setFormData({ ...formData, medical_info: e.target.value })}
                    placeholder="معلومات طبية (حساسية، أمراض مزمنة، إلخ)"
                    className="border-2 focus:border-purple-500 transition-colors"
                    rows={3}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  {t('save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card className="shadow-md">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              className="pr-10 border-2 focus:border-purple-500"
              placeholder="ابحث عن طالب أو صف..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-xl transition-all hover:-translate-y-2 cursor-pointer border-0 shadow-md overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-indigo-500"></div>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16 ring-4 ring-purple-100">
                  <AvatarFallback className="bg-gradient-to-br from-purple-400 to-indigo-500 text-white text-lg font-bold">
                    {student.user_id?.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">{student.user_id}</h3>
                  <p className="text-sm text-gray-600">{student.class_name}</p>
                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{student.grade}</Badge>
                    <Badge className={student.is_active ? "bg-green-500" : "bg-gray-500"}>
                      {student.is_active ? 'نشط' : 'غير نشط'}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStudents.length === 0 && (
        <Card className="shadow-md">
          <CardContent className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">لا توجد بيانات</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Placeholder enhanced views (will implement similarly)
const EnhancedTeachersView = ({ teachers, t }) => <div className="text-center p-12">Teachers View - Coming Soon</div>;
const EnhancedParentsView = ({ parents, t }) => <div className="text-center p-12">Parents View - Coming Soon</div>;
const EnhancedAttendanceView = ({ attendance, t }) => <div className="text-center p-12">Attendance View - Coming Soon</div>;
const EnhancedGradesView = ({ grades, t }) => <div className="text-center p-12">Grades View - Coming Soon</div>;
const EnhancedAssignmentsView = ({ assignments, t }) => <div className="text-center p-12">Assignments View - Coming Soon</div>;
const EnhancedFeesView = ({ fees, t }) => <div className="text-center p-12">Fees View - Coming Soon</div>;

export default SchoolAdminDashboardComplete;
