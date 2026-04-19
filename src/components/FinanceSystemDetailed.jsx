import React, { useState, useEffect } from 'react';
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
  DollarSign, Plus, TrendingUp, TrendingDown, Edit, Trash2, 
  Check, X, Eye, Calendar, User, CreditCard, Phone, Mail,
  BookOpen, GraduationCap, Clock, FileText, ArrowLeft, ChevronRight
} from 'lucide-react';

// الأشهر العربية
const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];

// السنة الدراسية الحالية
const CURRENT_YEAR = new Date().getFullYear();
const ACADEMIC_YEAR = `${CURRENT_YEAR}-${CURRENT_YEAR + 1}`;

const FinanceSystemDetailed = ({ students, teachers, t }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [salaries, setSalaries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fees, setFees] = useState([]);
  const [constants, setConstants] = useState({});
  const [showDialog, setShowDialog] = useState(false);
  const [showPersonProfile, setShowPersonProfile] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [selectedPersonType, setSelectedPersonType] = useState(null);
  const [formData, setFormData] = useState({});
  const [attendanceData, setAttendanceData] = useState([]);
  const [gradesData, setGradesData] = useState([]);

  useEffect(() => {
    fetchConstants();
    fetchAllFinanceData();
  }, []);

  useEffect(() => {
    if (activeTab !== 'overview') {
      fetchFinanceData();
    }
  }, [activeTab]);

  const fetchConstants = async () => {
    try {
      const res = await axios.get('/constants');
      setConstants(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchAllFinanceData = async () => {
    try {
      const [salariesRes, feesRes, expensesRes] = await Promise.all([
        axios.get('/salaries'),
        axios.get('/fees'),
        axios.get('/expenses')
      ]);
      setSalaries(salariesRes.data);
      setFees(feesRes.data);
      setExpenses(expensesRes.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchFinanceData = async () => {
    try {
      if (activeTab === 'salaries') {
        const res = await axios.get('/salaries');
        setSalaries(res.data);
      } else if (activeTab === 'expenses') {
        const res = await axios.get('/expenses');
        setExpenses(res.data);
      } else if (activeTab === 'fees') {
        const res = await axios.get('/fees');
        setFees(res.data);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  // جلب بيانات إضافية للطالب عند فتح الملف الشخصي
  const fetchStudentDetails = async (studentId) => {
    try {
      const [attendanceRes, gradesRes] = await Promise.all([
        axios.get(`/attendance?student_id=${studentId}`),
        axios.get(`/grades?student_id=${studentId}`)
      ]);
      setAttendanceData(attendanceRes.data);
      setGradesData(gradesRes.data);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  // فتح الملف الشخصي الكامل
  const openPersonProfile = async (person, type) => {
    setSelectedPerson(person);
    setSelectedPersonType(type);
    if (type === 'student') {
      await fetchStudentDetails(person.id);
    }
    setShowPersonProfile(true);
  };

  // إنشاء جدول 12 شهراً للطالب
  const generate12MonthsGrid = (personId, type) => {
    const months = [];
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // نبدأ من سبتمبر (بداية السنة الدراسية)
    const startMonth = 8; // September
    const startYear = currentMonth >= 8 ? currentYear : currentYear - 1;
    
    for (let i = 0; i < 12; i++) {
      const monthIndex = (startMonth + i) % 12;
      const year = startMonth + i >= 12 ? startYear + 1 : startYear;
      const monthKey = `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
      
      let record = null;
      if (type === 'student') {
        record = fees.find(f => f.student_id === personId && f.month === monthKey);
      } else if (type === 'teacher') {
        record = salaries.find(s => s.employee_id === personId && s.month === monthKey);
      }
      
      months.push({
        monthKey,
        monthName: MONTHS_AR[monthIndex],
        year,
        record,
        isPast: new Date(year, monthIndex) <= new Date(),
        isCurrent: monthIndex === currentMonth && year === currentYear
      });
    }
    
    return months;
  };

  const openDialog = (type, item = null, preselectedPerson = null) => {
    setDialogType(type);
    setEditingItem(item);
    
    if (item) {
      setFormData(item);
    } else {
      const currentMonth = new Date().toISOString().slice(0, 7);
      if (type === 'salary') {
        setFormData({
          employee_id: preselectedPerson?.id || '',
          employee_type: 'teacher',
          amount: '',
          month: currentMonth,
          salary_type: '',
          payment_date: '',
          payment_method: '',
          notes: ''
        });
      } else if (type === 'expense') {
        setFormData({
          amount: '',
          expense_type: '',
          description: '',
          date: new Date().toISOString().slice(0, 10),
          payment_method: '',
          receipt_number: ''
        });
      } else if (type === 'fee') {
        setFormData({
          student_id: preselectedPerson?.id || '',
          amount: '',
          fee_type: '',
          month: currentMonth,
          due_date: '',
          status: 'غير مدفوع',
          paid_amount: 0,
          payment_date: '',
          payment_method: '',
          notes: '',
          academic_year: ACADEMIC_YEAR,
          semester: '1'
        });
      }
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = dialogType === 'salary' ? '/salaries' : dialogType === 'expense' ? '/expenses' : '/fees';
      const submitData = { ...formData };
      
      // تحويل القيم الرقمية
      if (submitData.amount) submitData.amount = parseFloat(submitData.amount);
      if (submitData.paid_amount) submitData.paid_amount = parseFloat(submitData.paid_amount);
      
      if (editingItem) {
        await axios.put(`${endpoint}/${editingItem.id}`, submitData);
        toast.success('تم التحديث بنجاح! ✅');
      } else {
        await axios.post(endpoint, submitData);
        toast.success('تم الإضافة بنجاح! ✅');
      }
      setShowDialog(false);
      fetchAllFinanceData();
    } catch (error) {
      toast.error('خطأ في الحفظ');
      console.error(error);
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      const endpoint = type === 'salary' ? '/salaries' : type === 'expense' ? '/expenses' : '/fees';
      await axios.delete(`${endpoint}/${id}`);
      toast.success('تم الحذف بنجاح!');
      fetchAllFinanceData();
    } catch (error) {
      toast.error('خطأ في الحذف');
    }
  };

  // حساب الإحصائيات
  const getStudentStats = (studentId) => {
    const studentFees = fees.filter(f => f.student_id === studentId);
    const total = studentFees.reduce((sum, f) => sum + (f.amount || 0), 0);
    const paid = studentFees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
    return { total, paid, remaining: total - paid, count: studentFees.length };
  };

  const getTeacherStats = (teacherId) => {
    const teacherSalaries = salaries.filter(s => s.employee_id === teacherId);
    const total = teacherSalaries.reduce((sum, s) => sum + (s.amount || 0), 0);
    const paidCount = teacherSalaries.filter(s => s.paid || s.payment_date).length;
    return { total, count: teacherSalaries.length, paidCount };
  };

  const getTotalSalaries = () => salaries.reduce((sum, s) => sum + (s.amount || 0), 0);
  const getTotalExpenses = () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const getTotalFees = () => fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const getTotalPaid = () => fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            النظام المالي الشامل
          </h1>
          <p className="text-gray-600 mt-1">إدارة كاملة للرواتب والمصروفات والرسوم مع عرض تفصيلي لـ 12 شهراً</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b overflow-x-auto">
        {[
          { id: 'overview', label: '📊 نظرة عامة' },
          { id: 'fees', label: '💵 رسوم الطلاب', count: students.length },
          { id: 'salaries', label: '💰 رواتب المعلمين', count: teachers.length },
          { id: 'expenses', label: '📝 المصروفات', count: expenses.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            data-testid={`finance-tab-${tab.id}`}
            className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-b-2 border-purple-600 text-purple-600'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            {tab.label}
            {tab.count !== undefined && <Badge variant="outline">{tab.count}</Badge>}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-700 font-semibold">رسوم الطلاب المتوقعة</p>
                    <h3 className="text-3xl font-bold text-green-900 mt-2">{getTotalFees().toLocaleString()}</h3>
                    <p className="text-xs text-green-600 mt-1">فرنك CFA</p>
                  </div>
                  <TrendingUp className="w-12 h-12 text-green-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-700 font-semibold">المحصّل من الطلاب</p>
                    <h3 className="text-3xl font-bold text-purple-900 mt-2">{getTotalPaid().toLocaleString()}</h3>
                    <p className="text-xs text-purple-600 mt-1">فرنك CFA</p>
                  </div>
                  <Check className="w-12 h-12 text-purple-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-700 font-semibold">إجمالي الرواتب</p>
                    <h3 className="text-3xl font-bold text-blue-900 mt-2">{getTotalSalaries().toLocaleString()}</h3>
                    <p className="text-xs text-blue-600 mt-1">فرنك CFA</p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-blue-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-700 font-semibold">إجمالي المصروفات</p>
                    <h3 className="text-3xl font-bold text-red-900 mt-2">{getTotalExpenses().toLocaleString()}</h3>
                    <p className="text-xs text-red-600 mt-1">فرنك CFA</p>
                  </div>
                  <TrendingDown className="w-12 h-12 text-red-600 opacity-50" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-t-lg">
              <CardTitle>ملخص مالي</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold">💵 إجمالي الإيرادات المتوقعة:</span>
                <span className="text-2xl font-bold text-green-600">{getTotalFees().toLocaleString()} فرنك</span>
              </div>
              <div className="flex justify-between p-4 bg-gray-50 rounded-lg">
                <span className="font-semibold">💰 إجمالي المصروفات:</span>
                <span className="text-2xl font-bold text-red-600">{(getTotalSalaries() + getTotalExpenses()).toLocaleString()} فرنك</span>
              </div>
              <div className="flex justify-between p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                <span className="font-bold text-lg">📊 الصافي المتوقع:</span>
                <span className={`text-3xl font-bold ${getTotalFees() - (getTotalSalaries() + getTotalExpenses()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {(getTotalFees() - (getTotalSalaries() + getTotalExpenses())).toLocaleString()} فرنك
                </span>
              </div>
              <div className="flex justify-between p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                <span className="font-semibold">⚠️ رسوم غير محصلة:</span>
                <span className="text-2xl font-bold text-yellow-700">{(getTotalFees() - getTotalPaid()).toLocaleString()} فرنك</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Fees Tab - جدول الطلاب مع 12 شهراً */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">سجلات رسوم الطلاب - السنة الدراسية {ACADEMIC_YEAR}</h2>
            <Button onClick={() => openDialog('fee')} className="bg-gradient-to-r from-green-600 to-green-700" data-testid="add-fee-btn">
              <Plus className="w-4 h-4 ml-2" />
              إضافة رسوم
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold sticky right-0 bg-purple-600 z-10">الطالب</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">الصف</th>
                    {MONTHS_AR.map((month, idx) => (
                      <th key={idx} className="px-2 py-3 text-center text-xs font-semibold min-w-[80px]">{month}</th>
                    ))}
                    <th className="px-4 py-3 text-center text-sm font-semibold bg-green-700">الإجمالي</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold bg-blue-700">المدفوع</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold bg-red-700">المتبقي</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {students.map(student => {
                    const monthsData = generate12MonthsGrid(student.id, 'student');
                    const stats = getStudentStats(student.id);
                    
                    return (
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 sticky right-0 bg-white z-10">
                          <button
                            onClick={() => openPersonProfile(student, 'student')}
                            className="flex items-center gap-2 hover:text-purple-600 transition-colors group"
                            data-testid={`student-profile-btn-${student.id}`}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                              {(student.full_name || 'ط')[0]}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold group-hover:text-purple-600">{student.full_name || student.user_id}</p>
                              <p className="text-xs text-gray-500">{student.grade}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline">{student.class_name}</Badge>
                        </td>
                        {monthsData.map((monthData, idx) => {
                          const record = monthData.record;
                          let bgColor = 'bg-gray-100';
                          let statusIcon = null;
                          
                          if (record) {
                            if (record.status === 'مدفوع' || record.paid_amount >= record.amount) {
                              bgColor = 'bg-green-100';
                              statusIcon = <Check className="w-4 h-4 text-green-600 mx-auto" />;
                            } else if (record.paid_amount > 0) {
                              bgColor = 'bg-yellow-100';
                              statusIcon = <Clock className="w-4 h-4 text-yellow-600 mx-auto" />;
                            } else {
                              bgColor = 'bg-red-100';
                              statusIcon = <X className="w-4 h-4 text-red-600 mx-auto" />;
                            }
                          }
                          
                          return (
                            <td key={idx} className={`px-2 py-3 text-center ${bgColor} ${monthData.isCurrent ? 'ring-2 ring-purple-500' : ''}`}>
                              {record ? (
                                <div className="space-y-1">
                                  {statusIcon}
                                  <p className="text-xs font-semibold">{(record.paid_amount || 0).toLocaleString()}</p>
                                  <p className="text-xs text-gray-500">/{(record.amount || 0).toLocaleString()}</p>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setFormData({
                                      student_id: student.id,
                                      month: monthData.monthKey,
                                      amount: '',
                                      fee_type: '',
                                      due_date: '',
                                      status: 'غير مدفوع',
                                      paid_amount: 0,
                                      payment_date: '',
                                      payment_method: '',
                                      notes: '',
                                      academic_year: ACADEMIC_YEAR,
                                      semester: '1'
                                    });
                                    setDialogType('fee');
                                    setEditingItem(null);
                                    setShowDialog(true);
                                  }}
                                  className="text-xs text-gray-400 hover:text-purple-600"
                                  data-testid={`add-fee-month-${student.id}-${monthData.monthKey}`}
                                >
                                  <Plus className="w-4 h-4 mx-auto" />
                                </button>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center font-bold text-green-700 bg-green-50">{stats.total.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center font-bold text-blue-700 bg-blue-50">{stats.paid.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center font-bold text-red-700 bg-red-50">{stats.remaining.toLocaleString()}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Teacher Salaries Tab - جدول المعلمين مع 12 شهراً */}
      {activeTab === 'salaries' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">سجلات رواتب المعلمين - السنة الدراسية {ACADEMIC_YEAR}</h2>
            <Button onClick={() => openDialog('salary')} className="bg-gradient-to-r from-blue-600 to-blue-700" data-testid="add-salary-btn">
              <Plus className="w-4 h-4 ml-2" />
              إضافة راتب
            </Button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="px-4 py-3 text-right text-sm font-semibold sticky right-0 bg-blue-600 z-10">المعلم</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold">التخصص</th>
                    {MONTHS_AR.map((month, idx) => (
                      <th key={idx} className="px-2 py-3 text-center text-xs font-semibold min-w-[80px]">{month}</th>
                    ))}
                    <th className="px-4 py-3 text-center text-sm font-semibold bg-green-700">الإجمالي</th>
                    <th className="px-4 py-3 text-center text-sm font-semibold bg-purple-700">عدد الرواتب</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {teachers.map(teacher => {
                    const monthsData = generate12MonthsGrid(teacher.id, 'teacher');
                    const stats = getTeacherStats(teacher.id);
                    
                    return (
                      <tr key={teacher.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 sticky right-0 bg-white z-10">
                          <button
                            onClick={() => openPersonProfile(teacher, 'teacher')}
                            className="flex items-center gap-2 hover:text-blue-600 transition-colors group"
                            data-testid={`teacher-profile-btn-${teacher.id}`}
                          >
                            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                              {(teacher.full_name || 'م')[0]}
                            </div>
                            <div className="text-right">
                              <p className="font-semibold group-hover:text-blue-600">{teacher.full_name || teacher.user_id}</p>
                              <p className="text-xs text-gray-500">{teacher.specialization || 'معلم'}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge variant="outline">{teacher.specialization || '-'}</Badge>
                        </td>
                        {monthsData.map((monthData, idx) => {
                          const record = monthData.record;
                          let bgColor = 'bg-gray-100';
                          let statusIcon = null;
                          
                          if (record) {
                            if (record.paid || record.payment_date) {
                              bgColor = 'bg-green-100';
                              statusIcon = <Check className="w-4 h-4 text-green-600 mx-auto" />;
                            } else {
                              bgColor = 'bg-yellow-100';
                              statusIcon = <Clock className="w-4 h-4 text-yellow-600 mx-auto" />;
                            }
                          }
                          
                          return (
                            <td key={idx} className={`px-2 py-3 text-center ${bgColor} ${monthData.isCurrent ? 'ring-2 ring-blue-500' : ''}`}>
                              {record ? (
                                <div className="space-y-1">
                                  {statusIcon}
                                  <p className="text-xs font-semibold">{(record.amount || 0).toLocaleString()}</p>
                                  <p className="text-xs text-gray-500">{record.salary_type || ''}</p>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    setFormData({
                                      employee_id: teacher.id,
                                      employee_type: 'teacher',
                                      month: monthData.monthKey,
                                      amount: '',
                                      salary_type: '',
                                      payment_date: '',
                                      payment_method: '',
                                      notes: ''
                                    });
                                    setDialogType('salary');
                                    setEditingItem(null);
                                    setShowDialog(true);
                                  }}
                                  className="text-xs text-gray-400 hover:text-blue-600"
                                  data-testid={`add-salary-month-${teacher.id}-${monthData.monthKey}`}
                                >
                                  <Plus className="w-4 h-4 mx-auto" />
                                </button>
                              )}
                            </td>
                          );
                        })}
                        <td className="px-4 py-3 text-center font-bold text-green-700 bg-green-50">{stats.total.toLocaleString()}</td>
                        <td className="px-4 py-3 text-center font-bold text-purple-700 bg-purple-50">{stats.count}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openDialog('expense')} className="bg-gradient-to-r from-red-600 to-red-700" data-testid="add-expense-btn">
              <Plus className="w-4 h-4 ml-2" />
              إضافة مصروف
            </Button>
          </div>
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-right text-sm font-semibold">التاريخ</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">نوع المصروف</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">الوصف</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">المبلغ</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">طريقة الدفع</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {expenses.map(expense => (
                      <tr key={expense.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm">{expense.date}</td>
                        <td className="px-6 py-4 text-sm">{expense.expense_type}</td>
                        <td className="px-6 py-4 text-sm">{expense.description}</td>
                        <td className="px-6 py-4 font-bold text-red-600">{(expense.amount || 0).toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">{expense.payment_method || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openDialog('expense', expense)} data-testid={`edit-expense-${expense.id}`}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete('expense', expense.id)} data-testid={`delete-expense-${expense.id}`}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {expenses.length === 0 && (
                  <div className="text-center py-12 text-gray-500">لا توجد مصروفات مسجلة</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Person Profile Dialog - الملف الشخصي الكامل */}
      <Dialog open={showPersonProfile} onOpenChange={setShowPersonProfile}>
        <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto bg-white" data-testid="person-profile-dialog">
          {selectedPerson && (
            <>
              <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
                <DialogTitle className="text-2xl flex items-center gap-4">
                  <button onClick={() => setShowPersonProfile(false)} className="hover:bg-white/20 p-1 rounded">
                    <ArrowLeft className="w-6 h-6" />
                  </button>
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl font-bold">
                    {(selectedPerson.full_name || 'س')[0]}
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{selectedPerson.full_name || selectedPerson.user_id}</p>
                    <p className="text-sm opacity-80">
                      {selectedPersonType === 'student' ? `طالب - ${selectedPerson.class_name}` : `معلم - ${selectedPerson.specialization || ''}`}
                    </p>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="p-4 space-y-6">
                {/* Personal Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <User className="w-5 h-5" />
                      المعلومات الشخصية
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">الاسم الكامل</p>
                        <p className="font-semibold">{selectedPerson.full_name || '-'}</p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">البريد الإلكتروني</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          {selectedPerson.email || '-'}
                        </p>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="text-xs text-gray-500">الهاتف</p>
                        <p className="font-semibold flex items-center gap-1">
                          <Phone className="w-4 h-4 text-gray-400" />
                          {selectedPerson.phone || '-'}
                        </p>
                      </div>
                      {selectedPersonType === 'student' && (
                        <>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">الصف</p>
                            <p className="font-semibold">{selectedPerson.class_name}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">المستوى</p>
                            <p className="font-semibold">{selectedPerson.grade}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">تاريخ الميلاد</p>
                            <p className="font-semibold">{selectedPerson.date_of_birth || '-'}</p>
                          </div>
                        </>
                      )}
                      {selectedPersonType === 'teacher' && (
                        <>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">التخصص</p>
                            <p className="font-semibold">{selectedPerson.specialization || '-'}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">المواد</p>
                            <p className="font-semibold">{selectedPerson.subjects?.join(', ') || '-'}</p>
                          </div>
                          <div className="p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">الصفوف</p>
                            <p className="font-semibold">{selectedPerson.classes?.join(', ') || '-'}</p>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Financial Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5" />
                      الملخص المالي
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedPersonType === 'student' ? (
                      <div className="grid grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                          <p className="text-sm text-green-700">إجمالي الرسوم</p>
                          <p className="text-2xl font-bold text-green-900">{getStudentStats(selectedPerson.id).total.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                          <p className="text-sm text-blue-700">المدفوع</p>
                          <p className="text-2xl font-bold text-blue-900">{getStudentStats(selectedPerson.id).paid.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-red-50 rounded-lg text-center">
                          <p className="text-sm text-red-700">المتبقي</p>
                          <p className="text-2xl font-bold text-red-900">{getStudentStats(selectedPerson.id).remaining.toLocaleString()}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-green-50 rounded-lg text-center">
                          <p className="text-sm text-green-700">إجمالي الرواتب</p>
                          <p className="text-2xl font-bold text-green-900">{getTeacherStats(selectedPerson.id).total.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-blue-50 rounded-lg text-center">
                          <p className="text-sm text-blue-700">عدد الرواتب</p>
                          <p className="text-2xl font-bold text-blue-900">{getTeacherStats(selectedPerson.id).count}</p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* 12 Months Detailed Table */}
                <Card>
                  <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      سجل الـ 12 شهراً التفصيلي - السنة الدراسية {ACADEMIC_YEAR}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-right text-sm font-semibold">الشهر</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">المبلغ</th>
                            {selectedPersonType === 'student' && (
                              <th className="px-4 py-3 text-right text-sm font-semibold">المدفوع</th>
                            )}
                            <th className="px-4 py-3 text-right text-sm font-semibold">الحالة</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">تاريخ الدفع</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">طريقة الدفع</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">النوع</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">ملاحظات</th>
                            <th className="px-4 py-3 text-right text-sm font-semibold">الإجراءات</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {generate12MonthsGrid(selectedPerson.id, selectedPersonType).map((monthData, idx) => {
                            const record = monthData.record;
                            let statusBadge;
                            
                            if (record) {
                              if (selectedPersonType === 'student') {
                                if (record.status === 'مدفوع' || record.paid_amount >= record.amount) {
                                  statusBadge = <Badge className="bg-green-500">مدفوع بالكامل</Badge>;
                                } else if (record.paid_amount > 0) {
                                  statusBadge = <Badge className="bg-yellow-500">مدفوع جزئياً</Badge>;
                                } else {
                                  statusBadge = <Badge className="bg-red-500">غير مدفوع</Badge>;
                                }
                              } else {
                                if (record.paid || record.payment_date) {
                                  statusBadge = <Badge className="bg-green-500">تم الصرف</Badge>;
                                } else {
                                  statusBadge = <Badge className="bg-yellow-500">معلق</Badge>;
                                }
                              }
                            }
                            
                            return (
                              <tr key={idx} className={`${monthData.isCurrent ? 'bg-purple-50' : ''} ${!record ? 'bg-gray-50' : ''}`}>
                                <td className="px-4 py-3">
                                  <div className="flex items-center gap-2">
                                    <span className={`font-semibold ${monthData.isCurrent ? 'text-purple-600' : ''}`}>
                                      {monthData.monthName} {monthData.year}
                                    </span>
                                    {monthData.isCurrent && <Badge variant="outline" className="text-xs">الشهر الحالي</Badge>}
                                  </div>
                                </td>
                                <td className="px-4 py-3 font-bold">{record ? `${(record.amount || 0).toLocaleString()} فرنك` : '-'}</td>
                                {selectedPersonType === 'student' && (
                                  <td className="px-4 py-3 font-bold text-blue-600">{record ? `${(record.paid_amount || 0).toLocaleString()} فرنك` : '-'}</td>
                                )}
                                <td className="px-4 py-3">{statusBadge || <Badge variant="outline">لا يوجد سجل</Badge>}</td>
                                <td className="px-4 py-3 text-sm">{record?.payment_date || '-'}</td>
                                <td className="px-4 py-3 text-sm">{record?.payment_method || '-'}</td>
                                <td className="px-4 py-3 text-sm">{record?.fee_type || record?.salary_type || '-'}</td>
                                <td className="px-4 py-3 text-sm text-gray-500">{record?.notes || '-'}</td>
                                <td className="px-4 py-3">
                                  {record ? (
                                    <div className="flex gap-1">
                                      <Button size="sm" variant="outline" onClick={() => openDialog(selectedPersonType === 'student' ? 'fee' : 'salary', record)}>
                                        <Edit className="w-3 h-3" />
                                      </Button>
                                      <Button size="sm" variant="destructive" onClick={() => handleDelete(selectedPersonType === 'student' ? 'fee' : 'salary', record.id)}>
                                        <Trash2 className="w-3 h-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      onClick={() => {
                                        if (selectedPersonType === 'student') {
                                          setFormData({
                                            student_id: selectedPerson.id,
                                            month: monthData.monthKey,
                                            amount: '',
                                            fee_type: '',
                                            due_date: '',
                                            status: 'غير مدفوع',
                                            paid_amount: 0,
                                            payment_date: '',
                                            payment_method: '',
                                            notes: '',
                                            academic_year: ACADEMIC_YEAR,
                                            semester: '1'
                                          });
                                          setDialogType('fee');
                                        } else {
                                          setFormData({
                                            employee_id: selectedPerson.id,
                                            employee_type: 'teacher',
                                            month: monthData.monthKey,
                                            amount: '',
                                            salary_type: '',
                                            payment_date: '',
                                            payment_method: '',
                                            notes: ''
                                          });
                                          setDialogType('salary');
                                        }
                                        setEditingItem(null);
                                        setShowDialog(true);
                                      }}
                                    >
                                      <Plus className="w-3 h-3 ml-1" />
                                      إضافة
                                    </Button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>

                {/* Additional Info for Students */}
                {selectedPersonType === 'student' && (
                  <>
                    {/* Attendance Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Clock className="w-5 h-5" />
                          ملخص الحضور
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="p-4 bg-green-50 rounded-lg text-center">
                            <p className="text-sm text-green-700">حاضر</p>
                            <p className="text-2xl font-bold text-green-900">
                              {attendanceData.filter(a => a.status === 'present').length}
                            </p>
                          </div>
                          <div className="p-4 bg-red-50 rounded-lg text-center">
                            <p className="text-sm text-red-700">غائب</p>
                            <p className="text-2xl font-bold text-red-900">
                              {attendanceData.filter(a => a.status === 'absent').length}
                            </p>
                          </div>
                          <div className="p-4 bg-yellow-50 rounded-lg text-center">
                            <p className="text-sm text-yellow-700">متأخر</p>
                            <p className="text-2xl font-bold text-yellow-900">
                              {attendanceData.filter(a => a.status === 'late').length}
                            </p>
                          </div>
                          <div className="p-4 bg-blue-50 rounded-lg text-center">
                            <p className="text-sm text-blue-700">معذور</p>
                            <p className="text-2xl font-bold text-blue-900">
                              {attendanceData.filter(a => a.status === 'excused').length}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Grades Summary */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <GraduationCap className="w-5 h-5" />
                          ملخص الدرجات
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {gradesData.length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-4 py-2 text-right text-sm">المادة</th>
                                  <th className="px-4 py-2 text-right text-sm">نوع التقييم</th>
                                  <th className="px-4 py-2 text-right text-sm">الدرجة</th>
                                  <th className="px-4 py-2 text-right text-sm">النسبة</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y">
                                {gradesData.slice(0, 5).map((grade, idx) => (
                                  <tr key={idx}>
                                    <td className="px-4 py-2">{grade.subject}</td>
                                    <td className="px-4 py-2">{grade.assessment_type}</td>
                                    <td className="px-4 py-2">{grade.score}/{grade.max_score}</td>
                                    <td className="px-4 py-2">
                                      <Badge className={grade.percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}>
                                        {grade.percentage?.toFixed(1)}%
                                      </Badge>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-center text-gray-500 py-4">لا توجد درجات مسجلة</p>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white" data-testid="finance-form-dialog">
          <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
            <DialogTitle className="text-2xl">
              {editingItem ? 'تعديل' : 'إضافة'} {dialogType === 'salary' ? 'راتب' : dialogType === 'expense' ? 'مصروف' : 'رسوم'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-2">
            {dialogType === 'salary' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>المعلم/الموظف *</Label>
                    <Select value={formData.employee_id} onValueChange={(val) => setFormData({...formData, employee_id: val})} required>
                      <SelectTrigger data-testid="salary-employee-select">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {teachers.map(t => (
                          <SelectItem key={t.id} value={t.id}>{t.full_name || t.user_id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>نوع الراتب *</Label>
                    <Select value={formData.salary_type} onValueChange={(val) => setFormData({...formData, salary_type: val})} required>
                      <SelectTrigger data-testid="salary-type-select">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        {constants.salary_types?.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>المبلغ *</Label>
                    <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required data-testid="salary-amount-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>الشهر *</Label>
                    <Input type="month" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} required data-testid="salary-month-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ التسديد</Label>
                    <Input type="date" value={formData.payment_date} onChange={(e) => setFormData({...formData, payment_date: e.target.value})} data-testid="salary-payment-date-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>طريقة الدفع</Label>
                    <Select value={formData.payment_method} onValueChange={(val) => setFormData({...formData, payment_method: val})}>
                      <SelectTrigger data-testid="salary-payment-method-select">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        {constants.payment_methods?.map(method => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>ملاحظات</Label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} data-testid="salary-notes-input" />
                  </div>
                </div>
              </>
            )}

            {dialogType === 'fee' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>الطالب *</Label>
                    <Select value={formData.student_id} onValueChange={(val) => setFormData({...formData, student_id: val})} required>
                      <SelectTrigger data-testid="fee-student-select">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent className="max-h-60">
                        {students.map(s => (
                          <SelectItem key={s.id} value={s.id}>{s.full_name || s.user_id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>نوع الرسوم *</Label>
                    <Select value={formData.fee_type} onValueChange={(val) => setFormData({...formData, fee_type: val})} required>
                      <SelectTrigger data-testid="fee-type-select">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        {constants.fee_types?.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>المبلغ الإجمالي *</Label>
                    <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required data-testid="fee-amount-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>المبلغ المدفوع</Label>
                    <Input type="number" value={formData.paid_amount} onChange={(e) => setFormData({...formData, paid_amount: e.target.value})} data-testid="fee-paid-amount-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>الشهر</Label>
                    <Input type="month" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} data-testid="fee-month-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ الاستحقاق</Label>
                    <Input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} data-testid="fee-due-date-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ التسديد</Label>
                    <Input type="date" value={formData.payment_date} onChange={(e) => setFormData({...formData, payment_date: e.target.value})} data-testid="fee-payment-date-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>طريقة الدفع</Label>
                    <Select value={formData.payment_method} onValueChange={(val) => setFormData({...formData, payment_method: val})}>
                      <SelectTrigger data-testid="fee-payment-method-select">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        {constants.payment_methods?.map(method => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>ملاحظات</Label>
                    <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} data-testid="fee-notes-input" />
                  </div>
                </div>
              </>
            )}

            {dialogType === 'expense' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>نوع المصروف *</Label>
                    <Select value={formData.expense_type} onValueChange={(val) => setFormData({...formData, expense_type: val})} required>
                      <SelectTrigger data-testid="expense-type-select">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        {constants.expense_types?.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>المبلغ *</Label>
                    <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required data-testid="expense-amount-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>التاريخ *</Label>
                    <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required data-testid="expense-date-input" />
                  </div>
                  <div className="space-y-2">
                    <Label>طريقة الدفع</Label>
                    <Select value={formData.payment_method} onValueChange={(val) => setFormData({...formData, payment_method: val})}>
                      <SelectTrigger data-testid="expense-payment-method-select">
                        <SelectValue placeholder="اختر" />
                      </SelectTrigger>
                      <SelectContent>
                        {constants.payment_methods?.map(method => (
                          <SelectItem key={method} value={method}>{method}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>رقم الإيصال</Label>
                    <Input value={formData.receipt_number} onChange={(e) => setFormData({...formData, receipt_number: e.target.value})} data-testid="expense-receipt-input" />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>الوصف *</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} required data-testid="expense-description-input" />
                  </div>
                </div>
              </>
            )}

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)} data-testid="cancel-btn">
                إلغاء
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600" data-testid="save-btn">
                حفظ
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinanceSystemDetailed;
