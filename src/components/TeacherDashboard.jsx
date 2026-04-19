import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { 
  LogOut, GraduationCap, Users, Calendar, BookOpen, FileText,
  Clock, CheckCircle, XCircle, AlertCircle, Plus, Save, Eye,
  ChevronRight, Globe, Bell, User, Star, ClipboardList, Home,
  UserCheck, BarChart3, BookMarked, PenTool
} from 'lucide-react';

const TeacherDashboard = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [grades, setGrades] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [studentsRes, schedulesRes, gradesRes, assignmentsRes, attendanceRes] = await Promise.all([
        axios.get('/students'),
        axios.get('/schedules'),
        axios.get('/grades'),
        axios.get('/assignments'),
        axios.get('/attendance')
      ]);
      
      setStudents(studentsRes.data);
      setSchedules(schedulesRes.data);
      setGrades(gradesRes.data);
      setAssignments(assignmentsRes.data);
      setAttendance(attendanceRes.data);
      
      // استخراج الصفوف التي يدرسها المعلم
      const teacherClasses = user.classes || [];
      setMyClasses(teacherClasses);
      if (teacherClasses.length > 0) {
        setSelectedClass(teacherClasses[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  // الطلاب في الصف المحدد
  const classStudents = students.filter(s => s.class_name === selectedClass);
  
  // حضور اليوم للصف المحدد
  const todayAttendance = attendance.filter(a => 
    a.date === selectedDate && 
    classStudents.some(s => s.id === a.student_id)
  );

  // حفظ الحضور
  const saveAttendance = async (studentId, status) => {
    try {
      const existingRecord = todayAttendance.find(a => a.student_id === studentId);
      
      if (existingRecord) {
        await axios.put(`/attendance/${existingRecord.id}`, {
          ...existingRecord,
          status,
          recorded_by: user.id
        });
      } else {
        await axios.post('/attendance', {
          student_id: studentId,
          date: selectedDate,
          status,
          class_name: selectedClass,
          recorded_by: user.id
        });
      }
      toast.success('تم تسجيل الحضور');
      fetchData();
    } catch (error) {
      toast.error('خطأ في تسجيل الحضور');
    }
  };

  // حفظ جميع الحضور
  const saveAllAttendance = async (status) => {
    try {
      for (const student of classStudents) {
        const existingRecord = todayAttendance.find(a => a.student_id === student.id);
        if (!existingRecord) {
          await axios.post('/attendance', {
            student_id: student.id,
            date: selectedDate,
            status,
            class_name: selectedClass,
            recorded_by: user.id
          });
        }
      }
      toast.success(`تم تسجيل جميع الطلاب ${status === 'present' ? 'حاضرين' : 'غائبين'}`);
      fetchData();
    } catch (error) {
      toast.error('خطأ في تسجيل الحضور');
    }
  };

  // إحصائيات
  const stats = {
    totalStudents: classStudents.length,
    presentToday: todayAttendance.filter(a => a.status === 'present').length,
    absentToday: todayAttendance.filter(a => a.status === 'absent').length,
    totalAssignments: assignments.filter(a => a.teacher_id === user.id).length
  };

  const getAttendanceStatus = (studentId) => {
    const record = todayAttendance.find(a => a.student_id === studentId);
    return record?.status || null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-7 h-7 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user.full_name}</h1>
                <p className="text-sm text-gray-500">{t('teacher')} - {user.specialization || 'معلم'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => {
                const langs = ['ar', 'fr', 'en'];
                const currentIndex = langs.indexOf(i18n.language);
                changeLanguage(langs[(currentIndex + 1) % langs.length]);
              }}>
                <Globe className="w-4 h-4 mr-2" />
                {i18n.language.toUpperCase()}
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout} data-testid="logout-button">
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
        <div className="w-64 min-h-screen bg-white border-r p-6">
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: Home, label: 'الرئيسية' },
              { id: 'attendance', icon: UserCheck, label: 'تسجيل الحضور' },
              { id: 'grades', icon: BarChart3, label: 'إدخال الدرجات' },
              { id: 'assignments', icon: BookMarked, label: 'الواجبات' },
              { id: 'schedule', icon: Calendar, label: 'جدولي' },
              { id: 'students', icon: Users, label: 'طلابي' }
            ].map(item => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  activeTab === item.id 
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg' 
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
                onClick={() => setActiveTab(item.id)}
                data-testid={`tab-${item.id}`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </div>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 p-8">
          {/* Dashboard Tab */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">مرحباً، {user.full_name} 👋</h2>
              
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-700">طلابي</p>
                        <h3 className="text-3xl font-bold text-blue-900">{stats.totalStudents}</h3>
                      </div>
                      <Users className="w-12 h-12 text-blue-600 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-700">حاضرون اليوم</p>
                        <h3 className="text-3xl font-bold text-green-900">{stats.presentToday}</h3>
                      </div>
                      <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-red-700">غائبون اليوم</p>
                        <h3 className="text-3xl font-bold text-red-900">{stats.absentToday}</h3>
                      </div>
                      <XCircle className="w-12 h-12 text-red-600 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-700">الواجبات</p>
                        <h3 className="text-3xl font-bold text-purple-900">{stats.totalAssignments}</h3>
                      </div>
                      <FileText className="w-12 h-12 text-purple-600 opacity-50" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>إجراءات سريعة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Button 
                      onClick={() => setActiveTab('attendance')} 
                      className="h-24 flex-col bg-gradient-to-r from-green-500 to-green-600"
                    >
                      <UserCheck className="w-8 h-8 mb-2" />
                      تسجيل الحضور
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('grades')} 
                      className="h-24 flex-col bg-gradient-to-r from-blue-500 to-blue-600"
                    >
                      <BarChart3 className="w-8 h-8 mb-2" />
                      إدخال الدرجات
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('assignments')} 
                      className="h-24 flex-col bg-gradient-to-r from-purple-500 to-purple-600"
                    >
                      <BookMarked className="w-8 h-8 mb-2" />
                      إضافة واجب
                    </Button>
                    <Button 
                      onClick={() => setActiveTab('schedule')} 
                      className="h-24 flex-col bg-gradient-to-r from-orange-500 to-orange-600"
                    >
                      <Calendar className="w-8 h-8 mb-2" />
                      جدولي
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* My Subjects & Classes */}
              <div className="grid grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-blue-600" />
                      موادي
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.subjects?.map((subject, idx) => (
                        <Badge key={idx} className="bg-blue-100 text-blue-800 px-3 py-1">{subject}</Badge>
                      ))}
                      {(!user.subjects || user.subjects.length === 0) && (
                        <p className="text-gray-500">لم يتم تحديد المواد</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-purple-600" />
                      صفوفي
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {user.classes?.map((cls, idx) => (
                        <Badge key={idx} className="bg-purple-100 text-purple-800 px-3 py-1">{cls}</Badge>
                      ))}
                      {(!user.classes || user.classes.length === 0) && (
                        <p className="text-gray-500">لم يتم تحديد الصفوف</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Attendance Tab */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">تسجيل الحضور</h2>
              </div>

              {/* Filters */}
              <Card>
                <CardContent className="p-4">
                  <div className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-2">
                      <Label>الصف</Label>
                      <Select value={selectedClass} onValueChange={setSelectedClass}>
                        <SelectTrigger className="w-48" data-testid="class-select">
                          <SelectValue placeholder="اختر الصف" />
                        </SelectTrigger>
                        <SelectContent>
                          {myClasses.map(cls => (
                            <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>التاريخ</Label>
                      <Input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-48"
                        data-testid="date-input"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => saveAllAttendance('present')}
                        className="bg-green-50 hover:bg-green-100 text-green-700"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        الكل حاضر
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => saveAllAttendance('absent')}
                        className="bg-red-50 hover:bg-red-100 text-red-700"
                      >
                        <XCircle className="w-4 h-4 mr-2" />
                        الكل غائب
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Attendance Table */}
              <Card>
                <CardContent className="p-0">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-right">#</th>
                        <th className="px-6 py-4 text-right">الطالب</th>
                        <th className="px-6 py-4 text-center">الحالة</th>
                        <th className="px-6 py-4 text-center">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {classStudents.map((student, idx) => {
                        const status = getAttendanceStatus(student.id);
                        return (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 text-sm text-gray-500">{idx + 1}</td>
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                                  {(student.full_name || 'ط')[0]}
                                </div>
                                <span className="font-semibold">{student.full_name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-center">
                              {status === 'present' && <Badge className="bg-green-500">حاضر ✓</Badge>}
                              {status === 'absent' && <Badge className="bg-red-500">غائب ✗</Badge>}
                              {status === 'late' && <Badge className="bg-yellow-500">متأخر</Badge>}
                              {status === 'excused' && <Badge className="bg-blue-500">معذور</Badge>}
                              {!status && <Badge variant="outline">لم يسجل</Badge>}
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center gap-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => saveAttendance(student.id, 'present')}
                                  className={`${status === 'present' ? 'bg-green-600' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
                                  data-testid={`present-${student.id}`}
                                >
                                  <CheckCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => saveAttendance(student.id, 'absent')}
                                  className={`${status === 'absent' ? 'bg-red-600' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                                  data-testid={`absent-${student.id}`}
                                >
                                  <XCircle className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => saveAttendance(student.id, 'late')}
                                  className={`${status === 'late' ? 'bg-yellow-600' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
                                >
                                  <Clock className="w-4 h-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  onClick={() => saveAttendance(student.id, 'excused')}
                                  className={`${status === 'excused' ? 'bg-blue-600' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}
                                >
                                  <AlertCircle className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  {classStudents.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      لا يوجد طلاب في هذا الصف
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Grades Tab */}
          {activeTab === 'grades' && (
            <GradesEntry 
              user={user}
              students={classStudents}
              selectedClass={selectedClass}
              setSelectedClass={setSelectedClass}
              myClasses={myClasses}
              grades={grades}
              fetchData={fetchData}
            />
          )}

          {/* Assignments Tab */}
          {activeTab === 'assignments' && (
            <AssignmentsManager 
              user={user}
              assignments={assignments}
              myClasses={myClasses}
              fetchData={fetchData}
            />
          )}

          {/* Schedule Tab */}
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              <h2 className="text-3xl font-bold text-gray-900">جدولي الأسبوعي</h2>
              <Card>
                <CardContent className="p-6">
                  {schedules.filter(s => s.teacher_id === user.id).length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-right">اليوم</th>
                            <th className="px-4 py-3 text-right">الوقت</th>
                            <th className="px-4 py-3 text-right">المادة</th>
                            <th className="px-4 py-3 text-right">الصف</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {schedules.filter(s => s.teacher_id === user.id).map((schedule, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3">{schedule.day_of_week}</td>
                              <td className="px-4 py-3">{schedule.time_slot}</td>
                              <td className="px-4 py-3">{schedule.subject}</td>
                              <td className="px-4 py-3">{schedule.class_grade}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>لم يتم تعيين جدول لك بعد</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Students Tab */}
          {activeTab === 'students' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-gray-900">طلابي</h2>
                <Select value={selectedClass} onValueChange={setSelectedClass}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {myClasses.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {classStudents.map(student => (
                  <Card key={student.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold">
                          {(student.full_name || 'ط')[0]}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg">{student.full_name}</h3>
                          <p className="text-sm text-gray-500">{student.class_name}</p>
                          <p className="text-xs text-gray-400">{student.email}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              
              {classStudents.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                  <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>لا يوجد طلاب في هذا الصف</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// مكون إدخال الدرجات
const GradesEntry = ({ user, students, selectedClass, setSelectedClass, myClasses, grades, fetchData }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    student_id: '',
    subject: user.subjects?.[0] || '',
    assessment_name: '',
    assessment_type: 'quiz',
    score: '',
    max_score: '100',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        score: parseFloat(formData.score),
        max_score: parseFloat(formData.max_score),
        percentage: (parseFloat(formData.score) / parseFloat(formData.max_score)) * 100,
        teacher_id: user.id,
        class_name: selectedClass,
        date: new Date().toISOString().split('T')[0]
      };
      await axios.post('/grades', data);
      toast.success('تم إضافة الدرجة بنجاح!');
      setShowDialog(false);
      setFormData({
        student_id: '',
        subject: user.subjects?.[0] || '',
        assessment_name: '',
        assessment_type: 'quiz',
        score: '',
        max_score: '100',
        notes: ''
      });
      fetchData();
    } catch (error) {
      toast.error('خطأ في إضافة الدرجة');
    }
  };

  const classGrades = grades.filter(g => 
    students.some(s => s.id === g.student_id)
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">إدخال الدرجات</h2>
        <div className="flex gap-3">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الصف" />
            </SelectTrigger>
            <SelectContent>
              {myClasses.map(cls => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setShowDialog(true)} className="bg-gradient-to-r from-blue-600 to-indigo-600" data-testid="add-grade-btn">
            <Plus className="w-4 h-4 mr-2" />
            إضافة درجة
          </Button>
        </div>
      </div>

      {/* Grades Table */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
              <tr>
                <th className="px-6 py-4 text-right">الطالب</th>
                <th className="px-6 py-4 text-right">المادة</th>
                <th className="px-6 py-4 text-right">التقييم</th>
                <th className="px-6 py-4 text-right">النوع</th>
                <th className="px-6 py-4 text-center">الدرجة</th>
                <th className="px-6 py-4 text-center">النسبة</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {classGrades.map((grade, idx) => {
                const student = students.find(s => s.id === grade.student_id);
                return (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-semibold">{student?.full_name || '-'}</td>
                    <td className="px-6 py-4">{grade.subject}</td>
                    <td className="px-6 py-4">{grade.assessment_name}</td>
                    <td className="px-6 py-4">
                      <Badge variant="outline">{grade.assessment_type}</Badge>
                    </td>
                    <td className="px-6 py-4 text-center font-bold">{grade.score}/{grade.max_score}</td>
                    <td className="px-6 py-4 text-center">
                      <Badge className={grade.percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}>
                        {grade.percentage?.toFixed(0)}%
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {classGrades.length === 0 && (
            <div className="text-center py-12 text-gray-500">لا توجد درجات مسجلة</div>
          )}
        </CardContent>
      </Card>

      {/* Add Grade Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg bg-white" data-testid="grade-dialog">
          <DialogHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
            <DialogTitle className="text-xl">إضافة درجة جديدة</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>الطالب *</Label>
              <Select value={formData.student_id} onValueChange={(val) => setFormData({...formData, student_id: val})} required>
                <SelectTrigger data-testid="grade-student-select">
                  <SelectValue placeholder="اختر الطالب" />
                </SelectTrigger>
                <SelectContent>
                  {students.map(s => (
                    <SelectItem key={s.id} value={s.id}>{s.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المادة *</Label>
                <Select value={formData.subject} onValueChange={(val) => setFormData({...formData, subject: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    {user.subjects?.map(sub => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>نوع التقييم *</Label>
                <Select value={formData.assessment_type} onValueChange={(val) => setFormData({...formData, assessment_type: val})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quiz">اختبار قصير</SelectItem>
                    <SelectItem value="exam">امتحان</SelectItem>
                    <SelectItem value="homework">واجب</SelectItem>
                    <SelectItem value="project">مشروع</SelectItem>
                    <SelectItem value="participation">مشاركة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>اسم التقييم *</Label>
              <Input 
                value={formData.assessment_name} 
                onChange={(e) => setFormData({...formData, assessment_name: e.target.value})}
                placeholder="مثال: اختبار الوحدة الأولى"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>الدرجة *</Label>
                <Input 
                  type="number"
                  value={formData.score} 
                  onChange={(e) => setFormData({...formData, score: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>الدرجة الكاملة *</Label>
                <Input 
                  type="number"
                  value={formData.max_score} 
                  onChange={(e) => setFormData({...formData, max_score: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>ملاحظات</Label>
              <Textarea 
                value={formData.notes} 
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
                rows={2}
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
              <Button type="submit" className="bg-gradient-to-r from-blue-600 to-indigo-600">حفظ</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// مكون إدارة الواجبات
const AssignmentsManager = ({ user, assignments, myClasses, fetchData }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    subject: user.subjects?.[0] || '',
    class_name: myClasses[0] || '',
    due_date: '',
    max_score: '100'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/assignments', {
        ...formData,
        teacher_id: user.id,
        teacher_name: user.full_name,
        created_at: new Date().toISOString()
      });
      toast.success('تم إضافة الواجب بنجاح!');
      setShowDialog(false);
      setFormData({
        title: '',
        description: '',
        subject: user.subjects?.[0] || '',
        class_name: myClasses[0] || '',
        due_date: '',
        max_score: '100'
      });
      fetchData();
    } catch (error) {
      toast.error('خطأ في إضافة الواجب');
    }
  };

  const myAssignments = assignments.filter(a => a.teacher_id === user.id);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-900">الواجبات والتكليفات</h2>
        <Button onClick={() => setShowDialog(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600" data-testid="add-assignment-btn">
          <Plus className="w-4 h-4 mr-2" />
          إضافة واجب
        </Button>
      </div>

      {/* Assignments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {myAssignments.map((assignment, idx) => (
          <Card key={idx} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-bold text-lg">{assignment.title}</h3>
                  <p className="text-sm text-gray-500">{assignment.subject} - {assignment.class_name}</p>
                </div>
                <Badge variant="outline">{assignment.max_score} درجة</Badge>
              </div>
              <p className="text-gray-600 text-sm mb-4">{assignment.description}</p>
              <div className="flex items-center text-sm text-gray-500">
                <Clock className="w-4 h-4 mr-2" />
                تاريخ التسليم: {assignment.due_date}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {myAssignments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          <BookMarked className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>لم تقم بإضافة أي واجبات بعد</p>
        </div>
      )}

      {/* Add Assignment Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-lg bg-white" data-testid="assignment-dialog">
          <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
            <DialogTitle className="text-xl">إضافة واجب جديد</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>عنوان الواجب *</Label>
              <Input 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="مثال: حل تمارين الوحدة الثانية"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>المادة *</Label>
                <Select value={formData.subject} onValueChange={(val) => setFormData({...formData, subject: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر المادة" />
                  </SelectTrigger>
                  <SelectContent>
                    {user.subjects?.map(sub => (
                      <SelectItem key={sub} value={sub}>{sub}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>الصف *</Label>
                <Select value={formData.class_name} onValueChange={(val) => setFormData({...formData, class_name: val})}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent>
                    {myClasses.map(cls => (
                      <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>تاريخ التسليم *</Label>
                <Input 
                  type="date"
                  value={formData.due_date} 
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>الدرجة</Label>
                <Input 
                  type="number"
                  value={formData.max_score} 
                  onChange={(e) => setFormData({...formData, max_score: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>وصف الواجب *</Label>
              <Textarea 
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="اكتب تفاصيل الواجب هنا..."
                rows={4}
                required
              />
            </div>
            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>إلغاء</Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600">حفظ</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
