import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { DollarSign, Plus, TrendingUp, TrendingDown, FileText, Calendar, Edit, Trash2, Check, X } from 'lucide-react';

const FinanceSystem = ({ students, teachers, t }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [salaries, setSalaries] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [studentFees, setStudentFees] = useState([]);
  const [constants, setConstants] = useState({ salary_types: [], expense_types: [], fee_types: [], payment_methods: [], payment_status: [] });
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchConstants();
  }, []);

  useEffect(() => {
    fetchFinanceData();
  }, [activeTab]);

  const fetchConstants = async () => {
    try {
      const res = await axios.get('/constants');
      setConstants(res.data);
    } catch (error) {
      console.error('Error fetching constants:', error);
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
      } else if (activeTab === 'student-fees') {
        const res = await axios.get('/fees');
        setStudentFees(res.data);
      }
    } catch (error) {
      console.error('Error fetching finance data:', error);
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
          due_date: '',
          status: 'غير مدفوع',
          paid_amount: 0,
          payment_method: '',
          notes: ''
        });
      }
    }
    setShowDialog(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (dialogType === 'salary') {
        if (editingItem) {
          await axios.put(`/salaries/${editingItem.id}`, formData);
          toast.success('تم تحديث الراتب بنجاح! 💰');
        } else {
          await axios.post('/salaries', formData);
          toast.success('تم إضافة الراتب بنجاح! 💰');
        }
      } else if (dialogType === 'expense') {
        if (editingItem) {
          await axios.put(`/expenses/${editingItem.id}`, formData);
          toast.success('تم تحديث المصروف بنجاح! 📝');
        } else {
          await axios.post('/expenses', formData);
          toast.success('تم إضافة المصروف بنجاح! 📝');
        }
      } else if (dialogType === 'fee') {
        if (editingItem) {
          await axios.put(`/fees/${editingItem.id}`, formData);
          toast.success('تم تحديث الرسوم بنجاح! 💵');
        } else {
          await axios.post('/fees', formData);
          toast.success('تم إضافة الرسوم بنجاح! 💵');
        }
      }
      setShowDialog(false);
      setEditingItem(null);
      fetchFinanceData();
    } catch (error) {
      toast.error('خطأ في الحفظ');
    }
  };

  const handleDelete = async (type, id) => {
    if (!confirm('هل أنت متأكد من الحذف؟')) return;
    
    try {
      if (type === 'salary') {
        await axios.delete(`/salaries/${id}`);
        toast.success('تم حذف الراتب');
      } else if (type === 'expense') {
        await axios.delete(`/expenses/${id}`);
        toast.success('تم حذف المصروف');
      } else if (type === 'fee') {
        await axios.delete(`/fees/${id}`);
        toast.success('تم حذف الرسوم');
      }
      fetchFinanceData();
    } catch (error) {
      toast.error('خطأ في الحذف');
    }
  };

  const getTotalSalaries = () => salaries.reduce((sum, s) => sum + (s.amount || 0), 0);
  const getTotalExpenses = () => expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const getTotalFees = () => studentFees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const getTotalPaid = () => studentFees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
  const getUnpaidFees = () => getTotalFees() - getTotalPaid();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <DollarSign className="w-8 h-8 text-green-600" />
            النظام المالي الشامل
          </h1>
          <p className="text-gray-600 mt-1">إدارة كاملة للرواتب والمصروفات والرسوم</p>
        </div>
      </div>

      {/* Finance Tabs */}
      <div className="flex gap-2 border-b">
        {[
          { id: 'overview', label: '📊 نظرة عامة', icon: TrendingUp },
          { id: 'salaries', label: '💰 الرواتب', count: salaries.length },
          { id: 'expenses', label: '📝 المصروفات', count: expenses.length },
          { id: 'student-fees', label: '💵 رسوم الطلاب', count: studentFees.length }
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
            {tab.count !== undefined && (
              <Badge variant="outline" className="ml-2">{tab.count}</Badge>
            )}
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

          {/* Financial Summary */}
          <Card>
            <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <CardTitle>ملخص مالي</CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">💵 إجمالي الإيرادات المتوقعة:</span>
                  <span className="text-2xl font-bold text-green-600">{getTotalFees().toLocaleString()} فرنك</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                  <span className="font-semibold">💰 إجمالي المصروفات:</span>
                  <span className="text-2xl font-bold text-red-600">{(getTotalSalaries() + getTotalExpenses()).toLocaleString()} فرنك</span>
                </div>
                <div className="flex justify-between items-center p-4 bg-purple-50 rounded-lg border-2 border-purple-200">
                  <span className="font-bold text-lg">📊 الصافي المتوقع:</span>
                  <span className={`text-3xl font-bold ${getTotalFees() - (getTotalSalaries() + getTotalExpenses()) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {(getTotalFees() - (getTotalSalaries() + getTotalExpenses())).toLocaleString()} فرنك
                  </span>
                </div>
                <div className="flex justify-between items-center p-4 bg-yellow-50 rounded-lg border-2 border-yellow-200">
                  <span className="font-semibold">⚠️ رسوم غير محصلة:</span>
                  <span className="text-2xl font-bold text-yellow-700">{getUnpaidFees().toLocaleString()} فرنك</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Salaries Tab */}
      {activeTab === 'salaries' && (
        <div className="space-y-4">
          <div className="flex justify-end">
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
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الموظف</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">النوع</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">نوع الراتب</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">المبلغ</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الشهر</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الحالة</th>
                      <th className="px-6 py-3 text-right text-sm font-semibold text-gray-900">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y">
                    {salaries.map((salary) => (
                      <tr key={salary.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-900">{salary.employee_name || salary.employee_id}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{salary.employee_type === 'teacher' ? 'معلم' : 'إداري'}</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{salary.salary_type}</td>
                        <td className="px-6 py-4 text-sm font-bold text-green-600">{salary.amount.toLocaleString()} فرنك</td>
                        <td className="px-6 py-4 text-sm text-gray-600">{salary.month}</td>
                        <td className="px-6 py-4">
                          <Badge className={salary.paid ? 'bg-green-500' : 'bg-yellow-500'}>
                            {salary.paid ? 'مدفوع' : 'غير مدفوع'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => openDialog('salary', salary)}>
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDelete('salary', salary.id)}>
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {salaries.length === 0 && (
                  <div className="text-center py-12 text-gray-500">لا توجد رواتب مسجلة</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Similar tables for expenses and fees... */}
      
      {/* Dialog for Add/Edit */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl bg-white">
          <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
            <DialogTitle className="text-2xl">
              {editingItem ? 'تعديل' : 'إضافة'} {dialogType === 'salary' ? 'راتب' : dialogType === 'expense' ? 'مصروف' : 'رسوم'}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-2">
            {/* Form fields based on dialogType */}
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

export default FinanceSystem;