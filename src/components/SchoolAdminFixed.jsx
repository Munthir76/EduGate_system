import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { 
  LayoutDashboard, Users, UserCheck, GraduationCap, BookOpen, 
  DollarSign, LogOut, Globe, Plus, School, Calendar,
  CheckCircle, XCircle, Clock, Search, FileText, Bell, Award, Edit, Trash2,
  Settings, User, Eye, ChevronRight
} from 'lucide-react';
import ScheduleManagerComplete from './ScheduleManagerComplete';
import RatingsManager from './RatingsManager';
import SchoolSettings from './SchoolSettings';
import AdminProfile from './AdminProfile';
import { StudentDetailView, TeacherDetailView, ParentDetailView } from './DetailViews';
import FinanceSystemDetailed from './FinanceSystemDetailed';

const SchoolAdminFixed = ({ user, onLogout }) => {
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
  const [constants, setConstants] = useState({ grades: [], subjects: [] });
  const [loading, setLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications] = useState([
    { id: 1, message: 'تم إضافة طالب جديد', time: '5 دقائق', read: false },
    { id: 2, message: '3 معلمين حاضرين اليوم', time: '1 ساعة', read: true }
  ]);

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const statsRes = await axios.get('/dashboard/stats');
      setStats(statsRes.data);
      
      // Fetch constants data
      const constantsRes = await axios.get('/constants');
      setConstants(constantsRes.data);

      if (activeTab === 'students') {
        const studentsRes = await axios.get('/students');
        setStudents(studentsRes.data);
      } else if (activeTab === 'teachers') {
        const teachersRes = await axios.get('/teachers');
        setTeachers(teachersRes.data);
      } else if (activeTab === 'parents') {
        const parentsRes = await axios.get('/parents');
        setParents(parentsRes.data);
        const studentsRes = await axios.get('/students');
        setStudents(studentsRes.data);
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
      } else if (activeTab === 'finance') {
        const studentsRes = await axios.get('/students');
        setStudents(studentsRes.data);
        const teachersRes = await axios.get('/teachers');
        setTeachers(teachersRes.data);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <School className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user.full_name}</h1>
                <p className="text-sm text-gray-500">{t('school_admin')}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Button variant="outline" size="sm" onClick={() => setShowNotifications(!showNotifications)}>
                  <Bell className="w-4 h-4" />
                  {notifications.filter(n => !n.read).length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                      {notifications.filter(n => !n.read).length}
                    </span>
                  )}
                </Button>
                {showNotifications && (
                  <div className="absolute left-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border z-50">
                    <div className="p-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-xl">
                      <h3 className="font-bold">الإشعارات</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.map(n => (
                        <div key={n.id} className={`p-4 border-b hover:bg-gray-50 ${!n.read ? 'bg-purple-50' : ''}`}>
                          <p className="text-sm font-medium">{n.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{n.time}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Button variant="outline" size="sm" onClick={() => {
                const langs = ['ar', 'fr', 'en'];
                const currentIndex = langs.indexOf(i18n.language);
                changeLanguage(langs[(currentIndex + 1) % langs.length]);
              }}>
                <Globe className="w-4 h-4 mr-2" />
                {i18n.language.toUpperCase()}
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout}>
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
        <div className={`w-72 min-h-screen bg-white border-r p-6`}>
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: t('dashboard') },
              { id: 'students', icon: Users, label: t('students'), count: students.length },
              { id: 'teachers', icon: GraduationCap, label: t('teachers'), count: teachers.length },
              { id: 'parents', icon: Users, label: t('parents') },
              { id: 'schedules', icon: Calendar, label: 'الجداول الدراسية' },
              { id: 'staff-attendance', icon: UserCheck, label: 'حضور المعلمين' },
              { id: 'ratings', icon: Award, label: 'تقييمات المعلمين' },
              { id: 'finance', icon: DollarSign, label: 'النظام المالي' },
              { id: 'grades-view', icon: BookOpen, label: 'عرض الدرجات' },
              { id: 'teacher-tasks', icon: FileText, label: 'مهام المعلمين' },
              { id: 'school-settings', icon: Settings, label: 'إعدادات المدرسة' },
              { id: 'profile', icon: User, label: 'الملف الشخصي' }
            ].map(item => (
              <div
                key={item.id}
                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => setActiveTab(item.id)}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <Badge variant={activeTab === item.id ? "secondary" : "outline"}>
                    {item.count}
                  </Badge>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {activeTab === 'dashboard' && <DashboardView stats={stats} t={t} />}
          {activeTab === 'students' && <StudentsView students={students} t={t} fetchData={fetchData} constants={constants} />}
          {activeTab === 'teachers' && <TeachersView teachers={teachers} t={t} fetchData={fetchData} constants={constants} />}
          {activeTab === 'parents' && <ParentsView parents={parents} students={students} t={t} fetchData={fetchData} />}
          {activeTab === 'schedules' && <ScheduleManagerComplete teachers={teachers} t={t} />}
          {activeTab === 'ratings' && <RatingsManager teachers={teachers} students={students} t={t} userRole="school_admin" />}
          {activeTab === 'staff-attendance' && <StaffAttendanceView teachers={teachers} t={t} />}
          {activeTab === 'finance' && <FinanceSystemDetailed students={students} teachers={teachers} t={t} />}
          {activeTab === 'grades-view' && <GradesViewOnly grades={grades} students={students} t={t} />}
          {activeTab === 'teacher-tasks' && <TeacherTasksView teachers={teachers} t={t} />}
          {activeTab === 'school-settings' && <SchoolSettings user={user} t={t} onUpdate={fetchData} />}
          {activeTab === 'profile' && <AdminProfile user={user} onUpdate={fetchData} />}
        </div>
      </div>
    </div>
  );
};

// Dashboard View
const DashboardView = ({ stats, t }) => {
  if (!stats) return <div>{t('loading')}</div>;
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t('dashboard')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { icon: Users, label: t('total_students'), value: stats.total_students || 0, color: 'blue' },
          { icon: GraduationCap, label: t('total_teachers'), value: stats.total_teachers || 0, color: 'purple' },
          { icon: CheckCircle, label: t('present_today'), value: stats.present_today || 0, color: 'green' },
          { icon: XCircle, label: t('absent_today'), value: stats.absent_today || 0, color: 'red' },
        ].map((stat, i) => (
          <Card key={i} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-bold text-gray-900">{stat.value}</h3>
                </div>
                <div className={`w-14 h-14 bg-${stat.color}-100 rounded-full flex items-center justify-center`}>
                  <stat.icon className={`w-7 h-7 text-${stat.color}-600`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Students View - WORKING VERSION
const StudentsView = ({ students, t, fetchData, constants }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [formData, setFormData] = useState({
    username: '', password: '', full_name: '', email: '', phone: '',
    class_name: '', grade: '', date_of_birth: '', address: '', medical_info: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/students', formData);
      toast.success('تم إضافة الطالب بنجاح! 🎉');
      setShowDialog(false);
      setFormData({ username: '', password: '', full_name: '', email: '', phone: '',
        class_name: '', grade: '', date_of_birth: '', address: '', medical_info: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('students')}</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              {t('add_student')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
              <DialogTitle className="text-2xl">{t('add_student')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 p-2">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'full_name', label: t('full_name'), required: true },
                  { name: 'username', label: t('username'), required: true },
                  { name: 'password', label: t('password'), type: 'password', required: true },
                  { name: 'email', label: t('email'), type: 'email' },
                  { name: 'phone', label: t('phone') },
                  { name: 'date_of_birth', label: t('date_of_birth'), type: 'date' }
                ].map(field => (
                  <div key={field.name} className="space-y-2">
                    <Label className="text-gray-800 font-semibold">
                      {field.label} {field.required && '*'}
                    </Label>
                    <Input
                      type={field.type || 'text'}
                      value={formData[field.name]}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      required={field.required}
                      className="border-2 focus:border-purple-500"
                    />
                  </div>
                ))}
                <div className="space-y-2">
                  <Label className="text-gray-800 font-semibold">الصف الدراسي *</Label>
                  <Select value={formData.class_name} onValueChange={(val) => setFormData({ ...formData, class_name: val })}>
                    <SelectTrigger className="border-2">
                      <SelectValue placeholder="اختر الصف" />
                    </SelectTrigger>
                    <SelectContent>
                      {constants.grades?.map(grade => (
                        <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-800 font-semibold">المرحلة *</Label>
                  <Input
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    placeholder="مثال: التاسعة"
                    required
                    className="border-2 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-gray-800 font-semibold">{t('address')}</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="border-2 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-gray-800 font-semibold">{t('medical_info')}</Label>
                  <Textarea
                    value={formData.medical_info}
                    onChange={(e) => setFormData({ ...formData, medical_info: e.target.value })}
                    className="border-2 focus:border-purple-500"
                    rows={3}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  {t('save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{t('full_name')}</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{t('class')}</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{t('grade')}</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{t('status')}</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {students.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedStudent(student); setShowDetailView(true); }}
                        className="flex items-center gap-3 hover:text-purple-600 transition-colors group"
                        data-testid={`view-student-${student.id}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold overflow-hidden">
                          {student.profile_image ? (
                            <img src={student.profile_image} alt={student.full_name} className="w-full h-full object-cover" />
                          ) : (
                            (student.full_name || 'ط')[0]
                          )}
                        </div>
                        <span className="font-semibold group-hover:text-purple-600">{student.full_name || student.user_id}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.class_name}</td>
                    <td className="px-6 py-4"><Badge variant="outline">{student.grade}</Badge></td>
                    <td className="px-6 py-4">
                      <Badge className={student.is_active !== false ? "bg-green-500" : "bg-gray-500"}>
                        {student.is_active !== false ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setSelectedStudent(student); setShowDetailView(true); }}
                          data-testid={`detail-student-${student.id}`}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
                              try {
                                await axios.delete(`/students/${student.id}`);
                                toast.success('تم الحذف بنجاح!');
                                fetchData();
                              } catch (error) {
                                toast.error('خطأ في الحذف');
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {students.length === 0 && (
              <div className="text-center py-12 text-gray-500">{t('no_data')}</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Student Detail View Dialog */}
      <StudentDetailView 
        student={selectedStudent}
        isOpen={showDetailView}
        onClose={() => { setShowDetailView(false); setSelectedStudent(null); }}
        onUpdate={fetchData}
      />
    </div>
  );
};

// Teachers View - WORKING VERSION  
const TeachersView = ({ teachers, t, fetchData, constants }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [showDetailView, setShowDetailView] = useState(false);
  const [formData, setFormData] = useState({
    username: '', password: '', full_name: '', email: '', phone: '',
    subjects: '', classes: '', specialization: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        subjects: formData.subjects.split(',').map(s => s.trim()),
        classes: formData.classes.split(',').map(c => c.trim())
      };
      await axios.post('/teachers', data);
      toast.success('تم إضافة المعلم بنجاح! 🎉');
      setShowDialog(false);
      setFormData({ username: '', password: '', full_name: '', email: '', phone: '',
        subjects: '', classes: '', specialization: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('teachers')}</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              {t('add_teacher')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
              <DialogTitle className="text-2xl">{t('add_teacher')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 p-2">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { name: 'full_name', label: t('full_name'), required: true },
                  { name: 'username', label: t('username'), required: true },
                  { name: 'password', label: t('password'), type: 'password', required: true },
                  { name: 'email', label: t('email'), type: 'email' },
                  { name: 'phone', label: t('phone') },
                  { name: 'specialization', label: t('specialization') }
                ].map(field => (
                  <div key={field.name} className="space-y-2">
                    <Label className="text-gray-800 font-semibold">
                      {field.label} {field.required && '*'}
                    </Label>
                    <Input
                      type={field.type || 'text'}
                      value={formData[field.name]}
                      onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
                      required={field.required}
                      className="border-2 focus:border-purple-500"
                    />
                  </div>
                ))}
                <div className="space-y-2 col-span-2">
                  <Label className="text-gray-800 font-semibold">{t('subjects')} (يمكن اختيار عدة مواد)</Label>
                  <div className="border-2 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                    <div className="grid grid-cols-2 gap-2">
                      {constants.subjects?.map(subject => (
                        <label key={subject} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.subjects.split(',').map(s => s.trim()).includes(subject)}
                            onChange={(e) => {
                              const currentSubjects = formData.subjects ? formData.subjects.split(',').map(s => s.trim()) : [];
                              if (e.target.checked) {
                                setFormData({ ...formData, subjects: [...currentSubjects, subject].join(', ') });
                              } else {
                                setFormData({ ...formData, subjects: currentSubjects.filter(s => s !== subject).join(', ') });
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{subject}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-gray-800 font-semibold">الصفوف الدراسية (يمكن اختيار عدة صفوف)</Label>
                  <div className="border-2 rounded-lg p-3 max-h-40 overflow-y-auto bg-gray-50">
                    <div className="grid grid-cols-2 gap-2">
                      {constants.grades?.map(grade => (
                        <label key={grade} className="flex items-center gap-2 cursor-pointer hover:bg-gray-100 p-2 rounded">
                          <input
                            type="checkbox"
                            checked={formData.classes.split(',').map(c => c.trim()).includes(grade)}
                            onChange={(e) => {
                              const currentClasses = formData.classes ? formData.classes.split(',').map(c => c.trim()) : [];
                              if (e.target.checked) {
                                setFormData({ ...formData, classes: [...currentClasses, grade].join(', ') });
                              } else {
                                setFormData({ ...formData, classes: currentClasses.filter(c => c !== grade).join(', ') });
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{grade}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  {t('save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Teachers Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{t('full_name')}</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{t('specialization')}</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{t('subjects')}</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">{t('status')}</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {teachers.map((teacher) => (
                  <tr key={teacher.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <button
                        onClick={() => { setSelectedTeacher(teacher); setShowDetailView(true); }}
                        className="flex items-center gap-3 hover:text-blue-600 transition-colors group"
                        data-testid={`view-teacher-${teacher.id}`}
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold overflow-hidden">
                          {teacher.profile_image ? (
                            <img src={teacher.profile_image} alt={teacher.full_name} className="w-full h-full object-cover" />
                          ) : (
                            (teacher.full_name || 'م')[0]
                          )}
                        </div>
                        <span className="font-semibold group-hover:text-blue-600">{teacher.full_name || teacher.user_id}</span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{teacher.specialization || '-'}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-1 flex-wrap">
                        {teacher.subjects?.slice(0, 2).map((sub, i) => (
                          <Badge key={i} variant="outline">{sub}</Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={teacher.is_active !== false ? "bg-green-500" : "bg-gray-500"}>
                        {teacher.is_active !== false ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => { setSelectedTeacher(teacher); setShowDetailView(true); }}
                          data-testid={`detail-teacher-${teacher.id}`}
                        >
                          <Eye className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (confirm('هل أنت متأكد من حذف هذا المعلم؟')) {
                              try {
                                await axios.delete(`/teachers/${teacher.id}`);
                                toast.success('تم الحذف بنجاح!');
                                fetchData();
                              } catch (error) {
                                toast.error('خطأ في الحذف');
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {teachers.length === 0 && (
              <div className="text-center py-12 text-gray-500">{t('no_data')}</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* Teacher Detail View Dialog */}
      <TeacherDetailView 
        teacher={selectedTeacher}
        isOpen={showDetailView}
        onClose={() => { setShowDetailView(false); setSelectedTeacher(null); }}
        onUpdate={fetchData}
      />
    </div>
  );
};

// Staff Attendance View
const StaffAttendanceView = ({ teachers, t }) => {
  const [records, setRecords] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    staff_id: '',
    staff_type: 'teacher',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    notes: ''
  });

  const fetchRecords = async () => {
    try {
      const res = await axios.get('/staff-attendance');
      setRecords(res.data);
    } catch (error) {
      toast.error('خطأ');
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/staff-attendance', formData);
      toast.success('تم تسجيل الحضور! ✅');
      setShowDialog(false);
      setFormData({ staff_id: '', staff_type: 'teacher', date: new Date().toISOString().split('T')[0], status: 'present', notes: '' });
      fetchRecords();
    } catch (error) {
      toast.error('خطأ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">حضور وغياب المعلمين</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              تسجيل حضور
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
              <DialogTitle>تسجيل حضور معلم</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 p-2">
              <div className="space-y-2">
                <Label className="text-gray-800 font-semibold">المعلم</Label>
                <Select value={formData.staff_id} onValueChange={(val) => setFormData({...formData, staff_id: val})}>
                  <SelectTrigger className="border-2"><SelectValue placeholder="اختر المعلم" /></SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => <SelectItem key={t.id} value={t.id}>{t.full_name || t.user_id}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-800 font-semibold">التاريخ</Label>
                <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} className="border-2" />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-800 font-semibold">الحالة</Label>
                <Select value={formData.status} onValueChange={(val) => setFormData({...formData, status: val})}>
                  <SelectTrigger className="border-2"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">حاضر</SelectItem>
                    <SelectItem value="absent">غائب</SelectItem>
                    <SelectItem value="late">متأخر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
                <Button type="submit">حفظ</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card>
        <CardContent className="p-6">
          <p>{records.length} سجل حضور</p>
        </CardContent>
      </Card>
    </div>
  );
};

// Parents View - Enhanced Version
const ParentsView = ({ parents, students, t, fetchData }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    username: '', password: '', full_name: '', email: '', phone: '',
    relationship: 'father', student_ids: []
  });
  const [selectedStudents, setSelectedStudents] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        student_ids: selectedStudents
      };
      await axios.post('/parents', data);
      toast.success('تم إضافة ولي الأمر بنجاح! 🎉');
      setShowDialog(false);
      setFormData({ username: '', password: '', full_name: '', email: '', phone: '', relationship: 'father', student_ids: [] });
      setSelectedStudents([]);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t('parents')}</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              إضافة ولي أمر
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
              <DialogTitle className="text-2xl">إضافة ولي أمر جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 p-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-800 font-semibold">الاسم الكامل *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    className="border-2 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-800 font-semibold">اسم المستخدم *</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    className="border-2 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-800 font-semibold">كلمة المرور *</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    className="border-2 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-800 font-semibold">البريد الإلكتروني</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="border-2 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-800 font-semibold">رقم الهاتف</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="border-2 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-800 font-semibold">صلة القرابة *</Label>
                  <Select value={formData.relationship} onValueChange={(val) => setFormData({ ...formData, relationship: val })}>
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="father">أب</SelectItem>
                      <SelectItem value="mother">أم</SelectItem>
                      <SelectItem value="guardian">وصي</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2 col-span-2">
                  <Label className="text-gray-800 font-semibold">الأبناء (الطلاب)</Label>
                  <div className="border-2 rounded-lg p-4 max-h-40 overflow-y-auto">
                    {students.length > 0 ? (
                      students.map(student => (
                        <label key={student.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedStudents.includes(student.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents([...selectedStudents, student.id]);
                              } else {
                                setSelectedStudents(selectedStudents.filter(id => id !== student.id));
                              }
                            }}
                            className="w-4 h-4"
                          />
                          <span className="text-sm">{student.full_name || student.user_id} - {student.class_name}</span>
                        </label>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 text-center">لا يوجد طلاب</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  حفظ
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Parents Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الاسم الكامل</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">صلة القرابة</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">عدد الأبناء</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y">
                {parents.map((parent) => (
                  <tr key={parent.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{parent.full_name || parent.user_id}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {parent.relationship === 'father' ? 'أب' : parent.relationship === 'mother' ? 'أم' : 'وصي'}
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{parent.student_ids?.length || 0}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <Badge className={parent.is_active ? "bg-green-500" : "bg-gray-500"}>
                        {parent.is_active ? 'نشط' : 'غير نشط'}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const newName = prompt('الاسم الجديد:', parent.full_name);
                            if (newName) {
                              try {
                                await axios.put(`/parents/${parent.id}`, { full_name: newName });
                                toast.success('تم التحديث بنجاح!');
                                fetchData();
                              } catch (error) {
                                toast.error('خطأ في التحديث');
                              }
                            }
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (confirm('هل أنت متأكد من حذف ولي الأمر؟')) {
                              try {
                                await axios.delete(`/parents/${parent.id}`);
                                toast.success('تم الحذف بنجاح!');
                                fetchData();
                              } catch (error) {
                                toast.error('خطأ في الحذف');
                              }
                            }
                          }}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {parents.length === 0 && (
              <div className="text-center py-12 text-gray-500">{t('no_data')}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Finance View - النظام المالي الشامل
const FinanceView = ({ students, teachers, t }) => {
  const [activeFinanceTab, setActiveFinanceTab] = useState('overview');
  const [salaries, setSalaries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [formData, setFormData] = useState({});

  const fetchFinanceData = async () => {
    try {
      if (activeFinanceTab === 'salaries') {
        const res = await axios.get('/salaries');
        setSalaries(res.data);
      } else if (activeFinanceTab === 'expenses') {
        const res = await axios.get('/expenses');
        setExpenses(res.data);
      } else if (activeFinanceTab === 'student-fees') {
        const res = await axios.get('/fees');
        setStudentFees(res.data);
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
    }
  };

  useEffect(() => {
    fetchFinanceData();
  }, [activeFinanceTab]);

  const handleAddSalary = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/salaries', formData);
      toast.success('تم إضافة الراتب بنجاح! 💰');
      setShowDialog(false);
      fetchFinanceData();
    } catch (error) {
      toast.error('خطأ في الحفظ');
    }
  };

  const handleAddExpense = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/expenses', formData);
      toast.success('تم إضافة المصروف بنجاح! 📝');
      setShowDialog(false);
      fetchFinanceData();
    } catch (error) {
      toast.error('خطأ في الحفظ');
    }
  };

  const getTotalSalaries = () => salaries.reduce((sum, s) => sum + (s.amount || 0), 0);
  const getTotalExpenses = () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const getTotalFees = () => studentFees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const getTotalPaid = () => studentFees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
        <DollarSign className="w-8 h-8 text-green-600" />
        النظام المالي
      </h1>

      {/* Finance Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'overview', label: 'نظرة عامة' },
          { id: 'salaries', label: 'الرواتب' },
          { id: 'expenses', label: 'المصروفات' },
          { id: 'student-fees', label: 'رسوم الطلاب' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFinanceTab(tab.id)}
            className={`px-6 py-3 font-semibold transition-all ${
              activeFinanceTab === tab.id
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeFinanceTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-6">
              <p className="text-sm text-blue-700 font-semibold">إجمالي الرواتب</p>
              <h3 className="text-3xl font-bold text-blue-900 mt-2">{getTotalSalaries().toLocaleString()} فرنك</h3>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-red-50 to-red-100">
            <CardContent className="p-6">
              <p className="text-sm text-red-700 font-semibold">إجمالي المصروفات</p>
              <h3 className="text-3xl font-bold text-red-900 mt-2">{getTotalExpenses().toLocaleString()} فرنك</h3>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-6">
              <p className="text-sm text-green-700 font-semibold">رسوم الطلاب المتوقعة</p>
              <h3 className="text-3xl font-bold text-green-900 mt-2">{getTotalFees().toLocaleString()} فرنك</h3>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-6">
              <p className="text-sm text-purple-700 font-semibold">المحصّل من الطلاب</p>
              <h3 className="text-3xl font-bold text-purple-900 mt-2">{getTotalPaid().toLocaleString()} فرنك</h3>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Salaries Tab */}
      {activeFinanceTab === 'salaries' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setDialogType('salary'); setShowDialog(true); }} className="bg-gradient-to-r from-blue-600 to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              إضافة راتب
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">قائمة الرواتب ({salaries.length})</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expenses Tab */}
      {activeFinanceTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => { setDialogType('expense'); setShowDialog(true); }} className="bg-gradient-to-r from-red-600 to-red-700">
              <Plus className="w-4 h-4 mr-2" />
              إضافة مصروف
            </Button>
          </div>
          <Card>
            <CardContent className="p-6">
              <p className="text-gray-600">قائمة المصروفات ({expenses.length})</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Fees Tab */}
      {activeFinanceTab === 'student-fees' && (
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-600">رسوم الطلاب ({studentFees.length})</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Grades View Only - عرض الدرجات فقط للمدير
const GradesViewOnly = ({ grades, students, t }) => (
  <div className="space-y-6">
    <h1 className="text-3xl font-bold text-gray-900">عرض درجات الطلاب</h1>
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="p-6">
        <p className="text-blue-800 font-semibold">📝 ملاحظة: إدخال الدرجات يتم من قبل المعلمين فقط. هنا يمكنك فقط عرض وتعديل الدرجات المدخلة.</p>
      </CardContent>
    </Card>
    <Card>
      <CardContent className="p-6">
        <p className="text-gray-600">عدد السجلات: {grades.length}</p>
      </CardContent>
    </Card>
  </div>
);

// Teacher Tasks View - مهام المعلمين
const TeacherTasksView = ({ teachers, t }) => {
  const [tasks, setTasks] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    teacher_id: '',
    title: '',
    description: '',
    due_date: '',
    priority: 'medium'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/teacher-tasks', formData);
      toast.success('تم إضافة المهمة بنجاح! 📋');
      setShowDialog(false);
      setFormData({ teacher_id: '', title: '', description: '', due_date: '', priority: 'medium' });
    } catch (error) {
      toast.error('خطأ في الحفظ');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">مهام المعلمين</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              إضافة مهمة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
              <DialogTitle className="text-2xl">إضافة مهمة للمعلم</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 p-2">
              <div className="space-y-2">
                <Label className="text-gray-800 font-semibold">اختر المعلم *</Label>
                <Select value={formData.teacher_id} onValueChange={(val) => setFormData({...formData, teacher_id: val})}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="اختر معلم" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map(t => (
                      <SelectItem key={t.id} value={t.id}>{t.full_name || t.user_id}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-gray-800 font-semibold">عنوان المهمة *</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="مثال: تحضير خطة الدروس للأسبوع القادم"
                  required
                  className="border-2"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-gray-800 font-semibold">الوصف</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  placeholder="تفاصيل المهمة..."
                  className="border-2"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-800 font-semibold">تاريخ الاستحقاق</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                    className="border-2"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-800 font-semibold">الأولوية</Label>
                  <Select value={formData.priority} onValueChange={(val) => setFormData({...formData, priority: val})}>
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">منخفضة</SelectItem>
                      <SelectItem value="medium">متوسطة</SelectItem>
                      <SelectItem value="high">عالية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  إضافة المهمة
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-6">
          <p className="text-yellow-800 font-semibold">💡 ملاحظة: هنا تقوم بإعطاء مهام إدارية للمعلمين. أما الواجبات للطلاب فيديرها المعلم مباشرة.</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <p className="text-gray-600">عدد المهام: {tasks.length}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolAdminFixed;
