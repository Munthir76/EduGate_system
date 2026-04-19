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
import { DollarSign, Plus, TrendingUp, TrendingDown, Edit, Trash2, Check, X, Eye, Calendar, User, CreditCard } from 'lucide-react';

const FinanceSystemFull = ({ students, teachers, t }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [salaries, setSalaries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [fees, setFees] = useState([]);
  const [constants, setConstants] = useState({});
  const [showDialog, setShowDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchConstants();
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

  const openDialog = (type, item = null) => {
    setDialogType(type);
    setEditingItem(item);
    
    if (item) {
      setFormData(item);
    } else {
      if (type === 'salary') {
        setFormData({
          employee_id: '',
          employee_type: 'teacher',
          amount: '',
          month: new Date().toISOString().slice(0, 7),
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
          student_id: '',
          amount: '',
          fee_type: '',
          month: new Date().toISOString().slice(0, 7),
          due_date: '',
          status: 'غير مدفوع',
          paid_amount: 0,
          payment_date: '',
          payment_method: '',
          notes: ''
        });
      }
    }
    setShowDialog(true);
  };

  const openDetailsDialog = (person, type) => {
    setSelectedPerson(person);
    setDialogType(type);
    setShowDetailsDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const endpoint = dialogType === 'salary' ? '/salaries' : dialogType === 'expense' ? '/expenses' : '/fees';
      if (editingItem) {
        await axios.put(`${endpoint}/${editingItem.id}`, formData);
        toast.success('تم التحديث بنجاح! ✅');
      } else {
        await axios.post(endpoint, formData);
        toast.success('تم الإضافة بنجاح! ✅');
      }
      setShowDialog(false);
      fetchFinanceData();
    } catch (error) {
      toast.error('خطأ في الحفظ');
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    try {
      const endpoint = type === 'salary' ? '/salaries' : type === 'expense' ? '/expenses' : '/fees';
      await axios.delete(`${endpoint}/${id}`);
      toast.success('تم الحذف بنجاح!');
      fetchFinanceData();
    } catch (error) {
      toast.error('خطأ في الحذف');
    }
  };

  // Get records for specific person
  const getPersonRecords = (personId, type) => {
    if (type === 'salary') {
      return salaries.filter(s => s.employee_id === personId);
    } else if (type === 'fee') {
      return fees.filter(f => f.student_id === personId);
    }
    return [];
  };

  const getTotalForPerson = (personId, type) => {
    const records = getPersonRecords(personId, type);
    return records.reduce((sum, r) => sum + (r.amount || 0), 0);
  };

  const getPaidForPerson = (personId) => {
    const records = fees.filter(f => f.student_id === personId);
    return records.reduce((sum, r) => sum + (r.paid_amount || 0), 0);
  };

  const getTotalSalaries = () => salaries.reduce((sum, s) => sum + (s.amount || 0), 0);
  const getTotalExpenses = () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const getTotalFees = () => fees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const getTotalPaid = () => fees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            النظام المالي الشامل
          </h1>
          <p className="text-gray-600 mt-1">إدارة كاملة للرواتب والمصروفات والرسوم</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'overview', label: '📊 نظرة عامة' },
          { id: 'salaries', label: '💰 الرواتب', count: teachers.length },
          { id: 'expenses', label: '📝 المصروفات', count: expenses.length },
          { id: 'fees', label: '💵 رسوم الطلاب', count: students.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-6 py-3 font-semibold transition-all flex items-center gap-2 ${
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
          </div>

          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
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

      {/* Salaries Tab - جدول المعلمين مع سجلاتهم */}
      {activeTab === 'salaries' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">سجلات رواتب المعلمين والموظفين</h2>
            <Button onClick={() => openDialog('salary')} className="bg-gradient-to-r from-blue-600 to-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              إضافة راتب
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-right text-sm font-semibold">المعلم/الموظف</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">عدد الرواتب</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">إجمالي المبلغ</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">آخر راتب</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">الحالة</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {teachers.map(teacher => {
                      const records = getPersonRecords(teacher.id, 'salary');
                      const total = getTotalForPerson(teacher.id, 'salary');
                      const lastRecord = records[records.length - 1];
                      
                      return (
                        <tr key={teacher.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{teacher.full_name || teacher.user_id}</p>
                              <p className="text-sm text-gray-500">{teacher.specialization || 'معلم'}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="text-lg">{records.length}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-blue-600">{total.toLocaleString()} فرنك</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="text-sm text-gray-600">
                              {lastRecord ? lastRecord.month : '-'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={records.length > 0 ? 'bg-green-500' : 'bg-yellow-500'}>
                              {records.length > 0 ? 'يوجد سجلات' : 'لا يوجد'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openDetailsDialog(teacher, 'salary')}>
                                <Eye className="w-3 h-3 mr-1" />
                                عرض السجلات
                              </Button>
                              <Button size="sm" onClick={() => openDialog('salary')}>
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Student Fees Tab - جدول الطلاب مع سجلاتهم */}
      {activeTab === 'fees' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">سجلات رسوم الطلاب</h2>
            <Button onClick={() => openDialog('fee')} className="bg-gradient-to-r from-green-600 to-green-700">
              <Plus className="w-4 h-4 mr-2" />
              إضافة رسوم
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-right text-sm font-semibold">الطالب</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">الصف</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">عدد السجلات</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">الإجمالي</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">المدفوع</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">المتبقي</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">الحالة</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {students.map(student => {
                      const records = getPersonRecords(student.id, 'fee');
                      const total = getTotalForPerson(student.id, 'fee');
                      const paid = getPaidForPerson(student.id);
                      const remaining = total - paid;
                      
                      return (
                        <tr key={student.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4">
                            <div>
                              <p className="font-semibold text-gray-900">{student.full_name || student.user_id}</p>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline">{student.class_name}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="outline" className="text-lg">{records.length}</Badge>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-gray-900">{total.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-green-600">{paid.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-bold text-red-600">{remaining.toLocaleString()}</span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge className={remaining === 0 ? 'bg-green-500' : remaining < total ? 'bg-yellow-500' : 'bg-red-500'}>
                              {remaining === 0 ? 'مكتمل' : remaining < total ? 'جزئي' : 'غير مدفوع'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openDetailsDialog(student, 'fee')}>
                                <Eye className="w-3 h-3 mr-1" />
                                عرض السجلات
                              </Button>
                              <Button size="sm" onClick={() => openDialog('fee')}>
                                <Plus className="w-3 h-3" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Expenses Tab */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => openDialog('expense')} className="bg-gradient-to-r from-red-600 to-red-700">
              <Plus className="w-4 h-4 mr-2" />
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
                        <td className="px-6 py-4 font-bold text-red-600">{expense.amount.toLocaleString()}</td>
                        <td className="px-6 py-4 text-sm">{expense.payment_method || '-'}</td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openDialog('expense', expense)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete('expense', expense.id)}>
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

      {/* Details Dialog - عرض السجلات التفصيلية */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
            <DialogTitle className="text-2xl">
              سجلات {dialogType === 'salary' ? 'الرواتب' : 'الرسوم'} - {selectedPerson?.full_name || selectedPerson?.user_id}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {selectedPerson && (
              <div className="space-y-4">
                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-blue-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">عدد السجلات</p>
                      <p className="text-2xl font-bold text-blue-900">
                        {getPersonRecords(selectedPerson.id, dialogType).length}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-50">
                    <CardContent className="p-4">
                      <p className="text-sm text-gray-600">الإجمالي</p>
                      <p className="text-2xl font-bold text-green-900">
                        {getTotalForPerson(selectedPerson.id, dialogType).toLocaleString()} فرنك
                      </p>
                    </CardContent>
                  </Card>
                  {dialogType === 'fee' && (
                    <Card className="bg-purple-50">
                      <CardContent className="p-4">
                        <p className="text-sm text-gray-600">المدفوع</p>
                        <p className="text-2xl font-bold text-purple-900">
                          {getPaidForPerson(selectedPerson.id).toLocaleString()} فرنك
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Records Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>جميع السجلات</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getPersonRecords(selectedPerson.id, dialogType).map(record => (
                        <div key={record.id} className="p-4 border rounded-lg bg-gray-50">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-gray-500">الشهر/التاريخ</p>
                              <p className="font-semibold">{record.month || record.date || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">النوع</p>
                              <p className="font-semibold">{record.salary_type || record.fee_type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">المبلغ</p>
                              <p className="font-bold text-green-600">{record.amount.toLocaleString()} فرنك</p>
                            </div>
                            {dialogType === 'fee' && (
                              <div>
                                <p className="text-xs text-gray-500">المدفوع</p>
                                <p className="font-bold text-blue-600">{(record.paid_amount || 0).toLocaleString()} فرنك</p>
                              </div>
                            )}
                            <div>
                              <p className="text-xs text-gray-500">طريقة الدفع</p>
                              <p className="text-sm">{record.payment_method || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">تاريخ التسديد</p>
                              <p className="text-sm">{record.payment_date || '-'}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500">الحالة</p>
                              <Badge className={record.paid || record.status === 'مدفوع' ? 'bg-green-500' : 'bg-yellow-500'}>
                                {record.paid ? 'مدفوع' : record.status || 'غير مدفوع'}
                              </Badge>
                            </div>
                            <div className="col-span-2 md:col-span-4">
                              {record.notes && (
                                <>
                                  <p className="text-xs text-gray-500 mt-2">ملاحظات</p>
                                  <p className="text-sm">{record.notes}</p>
                                </>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => openDialog(dialogType, record)}>
                                <Edit className="w-3 h-3" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleDelete(dialogType, record.id)}>
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {getPersonRecords(selectedPerson.id, dialogType).length === 0 && (
                        <div className="text-center py-8 text-gray-500">لا توجد سجلات</div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
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
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                    <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>الشهر *</Label>
                    <Input type="month" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ التسديد</Label>
                    <Input type="date" value={formData.payment_date} onChange={(e) => setFormData({...formData, payment_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>طريقة الدفع</Label>
                    <Select value={formData.payment_method} onValueChange={(val) => setFormData({...formData, payment_method: val})}>
                      <SelectTrigger>
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
                    <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} />
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
                      <SelectTrigger>
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
                      <SelectTrigger>
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
                    <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>المبلغ المدفوع</Label>
                    <Input type="number" value={formData.paid_amount} onChange={(e) => setFormData({...formData, paid_amount: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>الشهر</Label>
                    <Input type="month" value={formData.month} onChange={(e) => setFormData({...formData, month: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ الاستحقاق</Label>
                    <Input type="date" value={formData.due_date} onChange={(e) => setFormData({...formData, due_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>تاريخ التسديد</Label>
                    <Input type="date" value={formData.payment_date} onChange={(e) => setFormData({...formData, payment_date: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>طريقة الدفع</Label>
                    <Select value={formData.payment_method} onValueChange={(val) => setFormData({...formData, payment_method: val})}>
                      <SelectTrigger>
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
                    <Textarea value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} rows={3} />
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
                      <SelectTrigger>
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
                    <Input type="number" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>التاريخ *</Label>
                    <Input type="date" value={formData.date} onChange={(e) => setFormData({...formData, date: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Label>طريقة الدفع</Label>
                    <Select value={formData.payment_method} onValueChange={(val) => setFormData({...formData, payment_method: val})}>
                      <SelectTrigger>
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
                    <Input value={formData.receipt_number} onChange={(e) => setFormData({...formData, receipt_number: e.target.value})} />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>الوصف *</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} required />
                  </div>
                </div>
              </>
            )}

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
  );
};

export default FinanceSystemFull;