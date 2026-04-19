import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  LayoutDashboard, Users, UserCheck, GraduationCap, BookOpen, 
  DollarSign, LogOut, Globe, Plus, School 
} from 'lucide-react';

const SchoolAdminDashboard = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState(null);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [parents, setParents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

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
      } else if (activeTab === 'grades') {
        const gradesRes = await axios.get('/grades');
        setGrades(gradesRes.data);
      } else if (activeTab === 'fees') {
        const feesRes = await axios.get('/fees');
        setFees(feesRes.data);
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
          <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
            <School className="w-7 h-7 text-white" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900">{user.full_name}</h2>
            <p className="text-sm text-gray-500">{t('school_admin')}</p>
          </div>
        </div>

        <nav className="space-y-2">
          <div 
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
            data-testid="nav-dashboard"
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>{t('dashboard')}</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
            data-testid="nav-students"
          >
            <Users className="w-5 h-5" />
            <span>{t('students')}</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'teachers' ? 'active' : ''}`}
            onClick={() => setActiveTab('teachers')}
            data-testid="nav-teachers"
          >
            <GraduationCap className="w-5 h-5" />
            <span>{t('teachers')}</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'parents' ? 'active' : ''}`}
            onClick={() => setActiveTab('parents')}
            data-testid="nav-parents"
          >
            <Users className="w-5 h-5" />
            <span>{t('parents')}</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveTab('attendance')}
            data-testid="nav-attendance"
          >
            <UserCheck className="w-5 h-5" />
            <span>{t('attendance')}</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'grades' ? 'active' : ''}`}
            onClick={() => setActiveTab('grades')}
            data-testid="nav-grades"
          >
            <BookOpen className="w-5 h-5" />
            <span>{t('grades')}</span>
          </div>
          <div 
            className={`nav-item ${activeTab === 'fees' ? 'active' : ''}`}
            onClick={() => setActiveTab('fees')}
            data-testid="nav-fees"
          >
            <DollarSign className="w-5 h-5" />
            <span>{t('fees')}</span>
          </div>
        </nav>

        <div className="mt-auto pt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const langs = ['ar', 'fr', 'en'];
              const currentIndex = langs.indexOf(i18n.language);
              const nextLang = langs[(currentIndex + 1) % langs.length];
              changeLanguage(nextLang);
            }}
            className="w-full mb-3"
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
        {activeTab === 'dashboard' && (
          <DashboardView stats={stats} t={t} />
        )}
        {activeTab === 'students' && (
          <StudentsView students={students} t={t} fetchData={fetchData} />
        )}
        {activeTab === 'teachers' && (
          <TeachersView teachers={teachers} t={t} fetchData={fetchData} />
        )}
        {activeTab === 'parents' && (
          <ParentsView parents={parents} t={t} fetchData={fetchData} />
        )}
        {activeTab === 'attendance' && (
          <AttendanceView attendance={attendance} students={students} t={t} fetchData={fetchData} />
        )}
        {activeTab === 'grades' && (
          <GradesView grades={grades} students={students} t={t} fetchData={fetchData} />
        )}
        {activeTab === 'fees' && (
          <FeesView fees={fees} students={students} t={t} fetchData={fetchData} />
        )}
      </div>
    </div>
  );
};

// Dashboard View Component
const DashboardView = ({ stats, t }) => {
  if (!stats) return <div>{t('loading')}</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8" data-testid="dashboard-title">{t('dashboard')}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card" data-testid="stat-students">
          <p className="text-sm text-gray-600 mb-1">{t('total_students')}</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats.total_students || 0}</h3>
        </div>
        <div className="stat-card" data-testid="stat-teachers">
          <p className="text-sm text-gray-600 mb-1">{t('total_teachers')}</p>
          <h3 className="text-3xl font-bold text-gray-900">{stats.total_teachers || 0}</h3>
        </div>
        <div className="stat-card" data-testid="stat-present">
          <p className="text-sm text-gray-600 mb-1">{t('present_today')}</p>
          <h3 className="text-3xl font-bold text-green-600">{stats.present_today || 0}</h3>
        </div>
        <div className="stat-card" data-testid="stat-absent">
          <p className="text-sm text-gray-600 mb-1">{t('absent_today')}</p>
          <h3 className="text-3xl font-bold text-red-600">{stats.absent_today || 0}</h3>
        </div>
        <div className="stat-card" data-testid="stat-total-fees">
          <p className="text-sm text-gray-600 mb-1">{t('total_fees')}</p>
          <h3 className="text-3xl font-bold text-gray-900">${stats.total_fees || 0}</h3>
        </div>
        <div className="stat-card" data-testid="stat-paid">
          <p className="text-sm text-gray-600 mb-1">{t('total_paid')}</p>
          <h3 className="text-3xl font-bold text-green-600">${stats.total_paid || 0}</h3>
        </div>
        <div className="stat-card" data-testid="stat-pending">
          <p className="text-sm text-gray-600 mb-1">{t('total_pending')}</p>
          <h3 className="text-3xl font-bold text-orange-600">${stats.total_pending || 0}</h3>
        </div>
      </div>
    </div>
  );
};

// Students View Component (simplified - full CRUD would be larger)
const StudentsView = ({ students, t, fetchData }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    full_name: '',
    email: '',
    phone: '',
    class_name: '',
    grade: '',
    date_of_birth: '',
    address: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/students', formData);
      toast.success(t('success'));
      setShowDialog(false);
      setFormData({
        username: '',
        password: '',
        full_name: '',
        email: '',
        phone: '',
        class_name: '',
        grade: '',
        date_of_birth: '',
        address: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t('students')}</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button data-testid="add-student-button">
              <Plus className="w-4 h-4 mr-2" />
              {t('add_student')}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t('add_student')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t('full_name')}</Label>
                  <Input
                    data-testid="student-fullname-input"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('username')}</Label>
                  <Input
                    data-testid="student-username-input"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('password')}</Label>
                  <Input
                    type="password"
                    data-testid="student-password-input"
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
                  <Label>{t('class')}</Label>
                  <Input
                    data-testid="student-class-input"
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t('grade')}</Label>
                  <Input
                    data-testid="student-grade-input"
                    value={formData.grade}
                    onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                    required
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

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="data-table" data-testid="students-table">
          <thead>
            <tr>
              <th>{t('full_name')}</th>
              <th>{t('class')}</th>
              <th>{t('grade')}</th>
              <th>{t('phone')}</th>
              <th>{t('email')}</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id} data-testid={`student-row-${student.id}`}>
                <td className="font-semibold">{student.user_id}</td>
                <td>{student.class_name}</td>
                <td><span className="badge badge-info">{student.grade}</span></td>
                <td>{student.phone || '-'}</td>
                <td>{student.email || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {students.length === 0 && (
          <div className="text-center py-12 text-gray-500">{t('no_data')}</div>
        )}
      </div>
    </div>
  );
};

// Similar components for Teachers, Parents, Attendance, Grades, Fees...
const TeachersView = ({ teachers, t }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('teachers')}</h1>
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <p className="text-gray-600">{teachers.length} {t('teachers')}</p>
    </div>
  </div>
);

const ParentsView = ({ parents, t }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('parents')}</h1>
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <p className="text-gray-600">{parents.length} {t('parents')}</p>
    </div>
  </div>
);

const AttendanceView = ({ attendance, t }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('attendance')}</h1>
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <p className="text-gray-600">{attendance.length} {t('attendance')} records</p>
    </div>
  </div>
);

const GradesView = ({ grades, t }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('grades')}</h1>
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <p className="text-gray-600">{grades.length} {t('grades')}</p>
    </div>
  </div>
);

const FeesView = ({ fees, t }) => (
  <div>
    <h1 className="text-3xl font-bold text-gray-900 mb-6">{t('fees')}</h1>
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <p className="text-gray-600">{fees.length} {t('fees')}</p>
    </div>
  </div>
);

export default SchoolAdminDashboard;
