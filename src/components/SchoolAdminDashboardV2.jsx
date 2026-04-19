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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Badge } from './ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  LayoutDashboard, Users, UserCheck, GraduationCap, BookOpen, 
  DollarSign, LogOut, Globe, Plus, School, Edit, Trash2,
  Calendar, TrendingUp, TrendingDown, CheckCircle, XCircle,
  Clock, Search, FileText, MessageSquare, Settings
} from 'lucide-react';

const SchoolAdminDashboardV2 = ({ user, onLogout }) => {
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

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className={`sidebar ${isRTL ? 'sidebar-rtl' : ''}`}>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <School className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{user.full_name}</h2>
            <p className="text-sm text-gray-500">{t('school_admin')}</p>
          </div>
        </div>

        <nav className="space-y-1">
          <NavItem 
            icon={LayoutDashboard} 
            label={t('dashboard')} 
            active={activeTab === 'dashboard'}
            onClick={() => setActiveTab('dashboard')}
            testId="nav-dashboard"
          />
          <NavItem 
            icon={Users} 
            label={t('students')} 
            active={activeTab === 'students'}
            onClick={() => setActiveTab('students')}
            testId="nav-students"
          />
          <NavItem 
            icon={GraduationCap} 
            label={t('teachers')} 
            active={activeTab === 'teachers'}
            onClick={() => setActiveTab('teachers')}
            testId="nav-teachers"
          />
          <NavItem 
            icon={Users} 
            label={t('parents')} 
            active={activeTab === 'parents'}
            onClick={() => setActiveTab('parents')}
            testId="nav-parents"
          />
          <NavItem 
            icon={UserCheck} 
            label={t('attendance')} 
            active={activeTab === 'attendance'}
            onClick={() => setActiveTab('attendance')}
            testId="nav-attendance"
          />
          <NavItem 
            icon={BookOpen} 
            label={t('grades')} 
            active={activeTab === 'grades'}
            onClick={() => setActiveTab('grades')}
            testId="nav-grades"
          />
          <NavItem 
            icon={FileText} 
            label={t('assignments')} 
            active={activeTab === 'assignments'}
            onClick={() => setActiveTab('assignments')}
            testId="nav-assignments"
          />
          <NavItem 
            icon={DollarSign} 
            label={t('fees')} 
            active={activeTab === 'fees'}
            onClick={() => setActiveTab('fees')}
            testId="nav-fees"
          />
        </nav>

        <div className="mt-auto pt-8 space-y-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const langs = ['ar', 'fr', 'en'];
              const currentIndex = langs.indexOf(i18n.language);
              const nextLang = langs[(currentIndex + 1) % langs.length];
              changeLanguage(nextLang);
            }}
            className="w-full"
            data-testid="sidebar-language-toggle"
          >
            <Globe className="w-4 h-4 mr-2" />
            {i18n.language.toUpperCase()}
          </Button>
          <Button 
            variant="outline" 
            onClick={onLogout}
            className="w-full"
            data-testid="sidebar-logout"
          >
            <LogOut className="w-4 h-4 mr-2" />
            {t('logout')}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`main-content ${isRTL ? 'main-content-rtl' : ''}`}>
        {activeTab === 'dashboard' && <DashboardView stats={stats} t={t} />}
        {activeTab === 'students' && <StudentsView students={students} t={t} fetchData={fetchData} />}
        {activeTab === 'teachers' && <TeachersView teachers={teachers} t={t} fetchData={fetchData} />}
        {activeTab === 'parents' && <ParentsView parents={parents} t={t} fetchData={fetchData} students={students} />}
        {activeTab === 'attendance' && <AttendanceView attendance={attendance} students={students} t={t} fetchData={fetchData} />}
        {activeTab === 'grades' && <GradesView grades={grades} students={students} t={t} fetchData={fetchData} />}
        {activeTab === 'assignments' && <AssignmentsView assignments={assignments} t={t} fetchData={fetchData} />}
        {activeTab === 'fees' && <FeesView fees={fees} students={students} t={t} fetchData={fetchData} />}
      </div>
    </div>
  );
};

// Nav Item Component
const NavItem = ({ icon: Icon, label, active, onClick, testId }) => (
  <div 
    className={`nav-item ${active ? 'active' : ''}`}
    onClick={onClick}
    data-testid={testId}
  >
    <Icon className="w-5 h-5" />
    <span>{label}</span>
  </div>
);

// Dashboard View Component
const DashboardView = ({ stats, t }) => {
  if (!stats) return <div className="p-8">{t('loading')}</div>;

  const statCards = [
    { icon: Users, label: t('total_students'), value: stats.total_students || 0, color: 'blue', testId: 'stat-students' },
    { icon: GraduationCap, label: t('total_teachers'), value: stats.total_teachers || 0, color: 'purple', testId: 'stat-teachers' },
    { icon: Users, label: t('total_parents'), value: stats.total_parents || 0, color: 'indigo', testId: 'stat-parents' },
    { icon: CheckCircle, label: t('present_today'), value: stats.present_today || 0, color: 'green', testId: 'stat-present' },
    { icon: XCircle, label: t('absent_today'), value: stats.absent_today || 0, color: 'red', testId: 'stat-absent' },
    { icon: DollarSign, label: t('total_fees'), value: `$${stats.total_fees || 0}`, color: 'gray', testId: 'stat-total-fees' },
    { icon: TrendingUp, label: t('total_paid'), value: `$${stats.total_paid || 0}`, color: 'green', testId: 'stat-paid' },
    { icon: TrendingDown, label: t('total_pending'), value: `$${stats.total_pending || 0}`, color: 'orange', testId: 'stat-pending' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="dashboard-title">{t('dashboard')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow" data-testid={stat.testId}>
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

// Students View Component
const StudentsView = ({ students, t, fetchData }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/students', formData);
      toast.success(t('success'));
      setShowDialog(false);
      setFormData({
        username: '', password: '', full_name: '', email: '', phone: '',
        class_name: '', grade: '', date_of_birth: '', address: '', medical_info: ''
      });
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
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('students')}</h1>
          <p className="text-gray-600 mt-1">{students.length} {t('students')}</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600" data-testid="add-student-button">
              <Plus className="w-4 h-4 mr-2" />
              {t('add_student')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('add_student')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('full_name')} *</Label>
                  <Input
                    data-testid="student-fullname-input"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                    placeholder={t('full_name')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('username')} *</Label>
                  <Input
                    data-testid="student-username-input"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                    placeholder={t('username')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('password')} *</Label>
                  <Input
                    type="password"
                    data-testid="student-password-input"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    placeholder={t('password')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('email')}</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder={t('email')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('phone')}</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder={t('phone')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('class')} *</Label>
                  <Input
                    data-testid="student-class-input"
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    required
                    placeholder={t('class')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('grade')} *</Label>
                  <Input
                    data-testid="student-grade-input"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    required
                    placeholder={t('grade')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('date_of_birth')}</Label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>{t('address')}</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder={t('address')}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>{t('medical_info')}</Label>
                  <Textarea
                    value={formData.medical_info}
                    onChange={(e) => setFormData({ ...formData, medical_info: e.target.value })}
                    placeholder={t('medical_info')}
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit" data-testid="submit-student-button">{t('save')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <Input
            className="pl-10"
            placeholder={t('search')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table" data-testid="students-table">
              <thead>
                <tr>
                  <th>{t('full_name')}</th>
                  <th>{t('class')}</th>
                  <th>{t('grade')}</th>
                  <th>{t('phone')}</th>
                  <th>{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id} data-testid={`student-row-${student.id}`}>
                    <td className="font-semibold">{student.user_id}</td>
                    <td>{student.class_name}</td>
                    <td><Badge variant="outline">{student.grade}</Badge></td>
                    <td>{student.phone || '-'}</td>
                    <td>
                      <Badge variant={student.is_active ? "success" : "secondary"}>
                        {student.is_active ? t('active') : t('inactive')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredStudents.length === 0 && (
              <div className="text-center py-12 text-gray-500">{t('no_data')}</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Teachers View - Enhanced
const TeachersView = ({ teachers, t, fetchData }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    subjects: '',
    classes: '',
    specialization: ''
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
      toast.success(t('success'));
      setShowDialog(false);
      setFormData({
        username: '', password: '', full_name: '', email: '', phone: '',
        subjects: '', classes: '', specialization: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('teachers')}</h1>
          <p className="text-gray-600 mt-1">{teachers.length} {t('teachers')}</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600" data-testid="add-teacher-button">
              <Plus className="w-4 h-4 mr-2" />
              {t('add_teacher')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('add_teacher')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('full_name')} *</Label>
                  <Input
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('username')} *</Label>
                  <Input
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('password')} *</Label>
                  <Input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('email')}</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('phone')}</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('specialization')}</Label>
                  <Input
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>{t('subjects')} (فاصلة بينها)</Label>
                  <Input
                    value={formData.subjects}
                    onChange={(e) => setFormData({ ...formData, subjects: e.target.value })}
                    placeholder="الرياضيات, العلوم, الفيزياء"
                  />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label>{t('classes')} (فاصلة بينها)</Label>
                  <Input
                    value={formData.classes}
                    onChange={(e) => setFormData({ ...formData, classes: e.target.value })}
                    placeholder="الصف الخامس أ, الصف السادس ب"
                  />
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  {t('cancel')}
                </Button>
                <Button type="submit">{t('save')}</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>{t('full_name')}</th>
                  <th>{t('specialization')}</th>
                  <th>{t('subjects')}</th>
                  <th>{t('classes')}</th>
                  <th>{t('status')}</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td className="font-semibold">{teacher.user_id}</td>
                    <td>{teacher.specialization || '-'}</td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {teacher.subjects?.slice(0, 2).map((sub, i) => (
                          <Badge key={i} variant="outline">{sub}</Badge>
                        ))}
                        {teacher.subjects?.length > 2 && (
                          <Badge variant="outline">+{teacher.subjects.length - 2}</Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-1 flex-wrap">
                        {teacher.classes?.slice(0, 2).map((cls, i) => (
                          <Badge key={i} variant="secondary">{cls}</Badge>
                        ))}
                        {teacher.classes?.length > 2 && (
                          <Badge variant="secondary">+{teacher.classes.length - 2}</Badge>
                        )}
                      </div>
                    </td>
                    <td>
                      <Badge variant={teacher.is_active ? "success" : "secondary"}>
                        {teacher.is_active ? t('active') : t('inactive')}
                      </Badge>
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
    </div>
  );
};

// Placeholder components for other views (will be implemented next)
const ParentsView = ({ parents, t, fetchData, students }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('parents')}</h1>
    <Card>
      <CardContent className="p-6">
        <p className="text-gray-600">{parents.length} {t('parents')}</p>
      </CardContent>
    </Card>
  </div>
);

const AttendanceView = ({ attendance, students, t, fetchData }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('attendance')}</h1>
    <Card>
      <CardContent className="p-6">
        <p className="text-gray-600">{attendance.length} {t('attendance')} records</p>
      </CardContent>
    </Card>
  </div>
);

const GradesView = ({ grades, students, t, fetchData }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('grades')}</h1>
    <Card>
      <CardContent className="p-6">
        <p className="text-gray-600">{grades.length} {t('grades')}</p>
      </CardContent>
    </Card>
  </div>
);

const AssignmentsView = ({ assignments, t, fetchData }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('assignments')}</h1>
    <Card>
      <CardContent className="p-6">
        <p className="text-gray-600">{assignments.length} {t('assignments')}</p>
      </CardContent>
    </Card>
  </div>
);

const FeesView = ({ fees, students, t, fetchData }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('fees')}</h1>
    <Card>
      <CardContent className="p-6">
        <p className="text-gray-600">{fees.length} {t('fees')}</p>
      </CardContent>
    </Card>
  </div>
);

export default SchoolAdminDashboardV2;
