import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { 
  LogOut, GraduationCap, Calendar, BookOpen, 
  Clock, CheckCircle, XCircle, Globe, Users,
  User, Star, Home, BarChart3, Award, DollarSign,
  ChevronRight, Eye, Phone, Mail
} from 'lucide-react';

const ParentDashboard = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState(null);
  const [childData, setChildData] = useState({
    attendance: [],
    grades: [],
    fees: [],
    assignments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (selectedChild) {
      fetchChildData(selectedChild.id);
    }
  }, [selectedChild]);

  const fetchChildren = async () => {
    setLoading(true);
    try {
      // جلب جميع الطلاب المرتبطين بولي الأمر
      const studentsRes = await axios.get('/students');
      const myChildren = studentsRes.data.filter(s => 
        user.student_ids?.includes(s.id) || s.parent_id === user.id
      );
      setChildren(myChildren);
      if (myChildren.length > 0) {
        setSelectedChild(myChildren[0]);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchChildData = async (childId) => {
    try {
      const [attendanceRes, gradesRes, feesRes, assignmentsRes] = await Promise.all([
        axios.get(`/attendance?student_id=${childId}`),
        axios.get(`/grades?student_id=${childId}`),
        axios.get(`/fees?student_id=${childId}`),
        axios.get('/assignments')
      ]);
      
      const child = children.find(c => c.id === childId);
      setChildData({
        attendance: attendanceRes.data,
        grades: gradesRes.data,
        fees: feesRes.data,
        assignments: assignmentsRes.data.filter(a => a.class_name === child?.class_name)
      });
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  // حساب الإحصائيات للطفل المحدد
  const avgGrade = childData.grades.length > 0 
    ? (childData.grades.reduce((sum, g) => sum + (g.percentage || 0), 0) / childData.grades.length).toFixed(1)
    : 0;
  
  const presentDays = childData.attendance.filter(a => a.status === 'present').length;
  const absentDays = childData.attendance.filter(a => a.status === 'absent').length;
  const totalDays = childData.attendance.length;
  const attendanceRate = totalDays > 0 ? ((presentDays / totalDays) * 100).toFixed(0) : 0;

  const totalFees = childData.fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const paidFees = childData.fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50" dir={i18n.language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-teal-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden">
                {user.profile_image ? (
                  <img src={user.profile_image} alt={user.full_name} className="w-full h-full object-cover" />
                ) : (
                  <Users className="w-7 h-7 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{user.full_name}</h1>
                <p className="text-sm text-gray-500">{t('parent')} - {children.length} أبناء</p>
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
          {/* Children Selector */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-500 mb-3">أبنائي</h3>
            <div className="space-y-2">
              {children.map(child => (
                <div
                  key={child.id}
                  className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                    selectedChild?.id === child.id 
                      ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg' 
                      : 'hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                  onClick={() => setSelectedChild(child)}
                  data-testid={`child-${child.id}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    selectedChild?.id === child.id ? 'bg-white/20' : 'bg-teal-100 text-teal-700'
                  }`}>
                    {(child.full_name || 'ط')[0]}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm">{child.full_name}</p>
                    <p className={`text-xs ${selectedChild?.id === child.id ? 'text-teal-100' : 'text-gray-500'}`}>
                      {child.class_name}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <hr className="my-4" />

          {/* Navigation */}
          <nav className="space-y-2">
            {[
              { id: 'dashboard', icon: Home, label: 'نظرة عامة' },
              { id: 'attendance', icon: CheckCircle, label: 'الحضور' },
              { id: 'grades', icon: BarChart3, label: 'الدرجات' },
              { id: 'fees', icon: DollarSign, label: 'الرسوم' },
              { id: 'assignments', icon: BookOpen, label: 'الواجبات' }
            ].map(item => (
              <div
                key={item.id}
                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                  activeTab === item.id 
                    ? 'bg-teal-100 text-teal-700' 
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
          {!selectedChild ? (
            <div className="text-center py-20">
              <Users className="w-20 h-20 mx-auto mb-6 text-gray-300" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">مرحباً بك!</h2>
              <p className="text-gray-500">لم يتم ربط أي أبناء بحسابك بعد</p>
            </div>
          ) : (
            <>
              {/* Child Header */}
              <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-6 text-white mb-6">
                <div className="flex items-center gap-6">
                  <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-bold">
                    {selectedChild.profile_image ? (
                      <img src={selectedChild.profile_image} alt={selectedChild.full_name} className="w-full h-full object-cover rounded-2xl" />
                    ) : (
                      (selectedChild.full_name || 'ط')[0]
                    )}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{selectedChild.full_name}</h2>
                    <p className="text-teal-100">{selectedChild.class_name} - {selectedChild.grade}</p>
                    <div className="flex gap-4 mt-2 text-sm">
                      {selectedChild.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-4 h-4" /> {selectedChild.email}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Dashboard Tab */}
              {activeTab === 'dashboard' && (
                <div className="space-y-6">
                  {/* Stats Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-purple-700">المعدل العام</p>
                            <h3 className="text-3xl font-bold text-purple-900">{avgGrade}%</h3>
                          </div>
                          <Star className="w-12 h-12 text-purple-600 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-green-700">نسبة الحضور</p>
                            <h3 className="text-3xl font-bold text-green-900">{attendanceRate}%</h3>
                          </div>
                          <CheckCircle className="w-12 h-12 text-green-600 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-red-700">أيام الغياب</p>
                            <h3 className="text-3xl font-bold text-red-900">{absentDays}</h3>
                          </div>
                          <XCircle className="w-12 h-12 text-red-600 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-orange-700">الرسوم المتبقية</p>
                            <h3 className="text-3xl font-bold text-orange-900">{(totalFees - paidFees).toLocaleString()}</h3>
                          </div>
                          <DollarSign className="w-12 h-12 text-orange-600 opacity-50" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Recent Activity */}
                  <div className="grid grid-cols-2 gap-6">
                    {/* Recent Grades */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-purple-600" />
                          آخر الدرجات
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {childData.grades.length > 0 ? (
                          <div className="space-y-3">
                            {childData.grades.slice(0, 5).map((grade, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="font-semibold">{grade.subject}</p>
                                  <p className="text-xs text-gray-500">{grade.assessment_name}</p>
                                </div>
                                <Badge className={grade.percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}>
                                  {grade.percentage?.toFixed(0)}%
                                </Badge>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">لا توجد درجات</p>
                        )}
                      </CardContent>
                    </Card>

                    {/* Recent Attendance */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          آخر سجلات الحضور
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {childData.attendance.length > 0 ? (
                          <div className="space-y-3">
                            {childData.attendance.slice(-5).reverse().map((record, idx) => (
                              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <span className="font-semibold">{record.date}</span>
                                {record.status === 'present' && <Badge className="bg-green-500">حاضر</Badge>}
                                {record.status === 'absent' && <Badge className="bg-red-500">غائب</Badge>}
                                {record.status === 'late' && <Badge className="bg-yellow-500">متأخر</Badge>}
                                {record.status === 'excused' && <Badge className="bg-blue-500">معذور</Badge>}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-gray-500 text-center py-4">لا توجد سجلات</p>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Attendance Tab */}
              {activeTab === 'attendance' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">سجل حضور {selectedChild.full_name}</h2>
                    <div className="flex gap-4">
                      <Card className="bg-green-50 border-green-200 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-bold text-green-900">{presentDays}</span>
                          <span className="text-green-600 text-sm">حضور</span>
                        </div>
                      </Card>
                      <Card className="bg-red-50 border-red-200 px-4 py-2">
                        <div className="flex items-center gap-2">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="font-bold text-red-900">{absentDays}</span>
                          <span className="text-red-600 text-sm">غياب</span>
                        </div>
                      </Card>
                    </div>
                  </div>
                  
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                          <tr>
                            <th className="px-6 py-4 text-right">التاريخ</th>
                            <th className="px-6 py-4 text-center">الحالة</th>
                            <th className="px-6 py-4 text-right">ملاحظات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {childData.attendance.slice().reverse().map((record, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-semibold">{record.date}</td>
                              <td className="px-6 py-4 text-center">
                                {record.status === 'present' && <Badge className="bg-green-500">حاضر ✓</Badge>}
                                {record.status === 'absent' && <Badge className="bg-red-500">غائب ✗</Badge>}
                                {record.status === 'late' && <Badge className="bg-yellow-500">متأخر</Badge>}
                                {record.status === 'excused' && <Badge className="bg-blue-500">معذور</Badge>}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">{record.notes || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {childData.attendance.length === 0 && (
                        <div className="text-center py-12 text-gray-500">لا توجد سجلات حضور</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Grades Tab */}
              {activeTab === 'grades' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900">درجات {selectedChild.full_name}</h2>
                    <Card className="bg-purple-50 border-purple-200 px-6 py-3">
                      <div className="flex items-center gap-3">
                        <Star className="w-6 h-6 text-purple-600" />
                        <div>
                          <p className="text-xs text-purple-600">المعدل العام</p>
                          <p className="text-2xl font-bold text-purple-900">{avgGrade}%</p>
                        </div>
                      </div>
                    </Card>
                  </div>
                  
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                          <tr>
                            <th className="px-6 py-4 text-right">المادة</th>
                            <th className="px-6 py-4 text-right">التقييم</th>
                            <th className="px-6 py-4 text-right">النوع</th>
                            <th className="px-6 py-4 text-center">الدرجة</th>
                            <th className="px-6 py-4 text-center">النسبة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {childData.grades.map((grade, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-semibold">{grade.subject}</td>
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
                          ))}
                        </tbody>
                      </table>
                      {childData.grades.length === 0 && (
                        <div className="text-center py-12 text-gray-500">لا توجد درجات مسجلة</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Fees Tab */}
              {activeTab === 'fees' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">رسوم {selectedChild.full_name}</h2>
                  
                  {/* Summary Cards */}
                  <div className="grid grid-cols-3 gap-6">
                    <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-blue-700">إجمالي الرسوم</p>
                        <p className="text-3xl font-bold text-blue-900">{totalFees.toLocaleString()}</p>
                        <p className="text-xs text-blue-600">فرنك CFA</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-green-700">المدفوع</p>
                        <p className="text-3xl font-bold text-green-900">{paidFees.toLocaleString()}</p>
                        <p className="text-xs text-green-600">فرنك CFA</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                      <CardContent className="p-6 text-center">
                        <p className="text-sm text-red-700">المتبقي</p>
                        <p className="text-3xl font-bold text-red-900">{(totalFees - paidFees).toLocaleString()}</p>
                        <p className="text-xs text-red-600">فرنك CFA</p>
                      </CardContent>
                    </Card>
                  </div>
                  
                  {/* Fees Table */}
                  <Card>
                    <CardContent className="p-0">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-teal-600 to-emerald-600 text-white">
                          <tr>
                            <th className="px-6 py-4 text-right">الشهر</th>
                            <th className="px-6 py-4 text-right">النوع</th>
                            <th className="px-6 py-4 text-center">المبلغ</th>
                            <th className="px-6 py-4 text-center">المدفوع</th>
                            <th className="px-6 py-4 text-center">الحالة</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {childData.fees.map((fee, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-6 py-4 font-semibold">{fee.month}</td>
                              <td className="px-6 py-4">{fee.fee_type}</td>
                              <td className="px-6 py-4 text-center">{(fee.amount || 0).toLocaleString()}</td>
                              <td className="px-6 py-4 text-center text-green-600">{(fee.paid_amount || 0).toLocaleString()}</td>
                              <td className="px-6 py-4 text-center">
                                {fee.paid_amount >= fee.amount ? (
                                  <Badge className="bg-green-500">مدفوع</Badge>
                                ) : fee.paid_amount > 0 ? (
                                  <Badge className="bg-yellow-500">جزئي</Badge>
                                ) : (
                                  <Badge className="bg-red-500">غير مدفوع</Badge>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {childData.fees.length === 0 && (
                        <div className="text-center py-12 text-gray-500">لا توجد رسوم مسجلة</div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Assignments Tab */}
              {activeTab === 'assignments' && (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900">واجبات {selectedChild.full_name}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {childData.assignments.map((assignment, idx) => {
                      const dueDate = new Date(assignment.due_date);
                      const isOverdue = dueDate < new Date();
                      
                      return (
                        <Card key={idx} className={`hover:shadow-lg transition-shadow ${isOverdue ? 'border-red-200' : ''}`}>
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="font-bold text-lg">{assignment.title}</h3>
                                <p className="text-sm text-gray-500">{assignment.subject}</p>
                              </div>
                              <Badge variant={isOverdue ? "destructive" : "outline"}>
                                {assignment.max_score} درجة
                              </Badge>
                            </div>
                            <p className="text-gray-600 text-sm mb-4">{assignment.description}</p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center text-sm text-gray-500">
                                <Clock className="w-4 h-4 mr-2" />
                                {assignment.due_date}
                              </div>
                              {isOverdue && <Badge className="bg-red-500">منتهي</Badge>}
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                  
                  {childData.assignments.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                      <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>لا توجد واجبات حالياً</p>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentDashboard;
