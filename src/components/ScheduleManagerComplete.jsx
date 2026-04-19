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
import { Calendar, Plus, Edit, Trash2, Clock, BookOpen, User, X } from 'lucide-react';

const DAYS = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];

const TIME_SLOTS = [
  '08:00-08:45',
  '08:45-09:30',
  '09:30-10:15',
  '10:15-11:00', // الاستراحة
  '11:00-11:45',
  '11:45-12:30',
  '12:30-13:15'
];

const ScheduleManagerComplete = ({ teachers, t }) => {
  const [schedules, setSchedules] = useState([]);
  const [constants, setConstants] = useState({ grades: [], subjects: [] });
  const [selectedClass, setSelectedClass] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [formData, setFormData] = useState({
    class_name: '',
    day: '',
    periods: []
  });
  const [viewMode, setViewMode] = useState('list'); // list or table

  useEffect(() => {
    fetchConstants();
    fetchSchedules();
  }, []);

  const fetchConstants = async () => {
    try {
      const res = await axios.get('/constants');
      setConstants(res.data);
    } catch (error) {
      console.error('Error fetching constants:', error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/schedules');
      setSchedules(res.data);
    } catch (error) {
      console.error('Error fetching schedules:', error);
    }
  };

  const openDialog = (schedule = null) => {
    setEditingSchedule(schedule);
    if (schedule) {
      setFormData(schedule);
    } else {
      setFormData({
        class_name: selectedClass || '',
        day: '',
        periods: []
      });
    }
    setShowDialog(true);
  };

  const addPeriod = () => {
    setFormData({
      ...formData,
      periods: [...formData.periods, { time: '', subject: '', teacher_id: '', room: '' }]
    });
  };

  const removePeriod = (index) => {
    const newPeriods = formData.periods.filter((_, i) => i !== index);
    setFormData({ ...formData, periods: newPeriods });
  };

  const updatePeriod = (index, field, value) => {
    const newPeriods = [...formData.periods];
    newPeriods[index][field] = value;
    setFormData({ ...formData, periods: newPeriods });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingSchedule) {
        await axios.put(`/schedules/${editingSchedule.id}`, formData);
        toast.success('تم تحديث الجدول بنجاح! 📅');
      } else {
        await axios.post('/schedules', formData);
        toast.success('تم إضافة الجدول بنجاح! 📅');
      }
      setShowDialog(false);
      setEditingSchedule(null);
      fetchSchedules();
    } catch (error) {
      toast.error('خطأ في الحفظ');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('هل أنت متأكد من حذف هذا الجدول؟')) return;
    try {
      await axios.delete(`/schedules/${id}`);
      toast.success('تم حذف الجدول بنجاح!');
      fetchSchedules();
    } catch (error) {
      toast.error('خطأ في الحذف');
    }
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.full_name || teacher?.user_id || 'غير محدد';
  };

  const getClassSchedules = (className) => {
    return schedules.filter(s => s.class_name === className);
  };

  const uniqueClasses = [...new Set(schedules.map(s => s.class_name))];
  const filteredSchedules = selectedClass 
    ? schedules.filter(s => s.class_name === selectedClass)
    : schedules;

  // عرض جدولي
  const renderTableView = () => {
    if (!selectedClass) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">اختر صفاً لعرض جدوله الأسبوعي</p>
          </CardContent>
        </Card>
      );
    }

    const classSchedules = getClassSchedules(selectedClass);

    return (
      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
          <CardTitle className="text-xl">جدول {selectedClass} الأسبوعي</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border p-3 text-center font-bold text-gray-700">الوقت</th>
                  {DAYS.map(day => (
                    <th key={day} className="border p-3 text-center font-bold text-gray-700">{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {TIME_SLOTS.map((time, timeIndex) => (
                  <tr key={time} className={timeIndex === 3 ? 'bg-yellow-50' : 'hover:bg-gray-50'}>
                    <td className="border p-3 text-center font-semibold text-gray-600">
                      {time === '10:15-11:00' ? (
                        <div className="flex items-center justify-center gap-2">
                          <Clock className="w-4 h-4 text-yellow-600" />
                          <span className="text-yellow-700 font-bold">استراحة</span>
                        </div>
                      ) : time}
                    </td>
                    {DAYS.map(day => {
                      const daySchedule = classSchedules.find(s => s.day === day);
                      const period = daySchedule?.periods.find(p => p.time === time);
                      
                      if (time === '10:15-11:00') {
                        return <td key={day} className="border bg-yellow-50"></td>;
                      }

                      return (
                        <td key={day} className="border p-2">
                          {period ? (
                            <div className="text-center">
                              <div className="font-semibold text-purple-700 text-sm">{period.subject}</div>
                              <div className="text-xs text-gray-600 mt-1">{getTeacherName(period.teacher_id)}</div>
                              {period.room && (
                                <div className="text-xs text-gray-500 mt-1">غرفة {period.room}</div>
                              )}
                            </div>
                          ) : (
                            <div className="text-center text-gray-300 text-xs">-</div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-purple-600" />
            الجداول الدراسية
          </h1>
          <p className="text-gray-600 mt-1">إدارة شاملة لجداول جميع الفصول (60 صفاً)</p>
        </div>
        <div className="flex gap-3">
          <div className="flex gap-2 border rounded-lg p-1">
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'default' : 'outline'}
              onClick={() => setViewMode('list')}
            >
              قائمة
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'table' ? 'default' : 'outline'}
              onClick={() => setViewMode('table')}
            >
              جدول أسبوعي
            </Button>
          </div>
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-600 to-indigo-600" onClick={() => openDialog()}>
                <Plus className="w-4 h-4 mr-2" />
                إضافة جدول
              </Button>
            </DialogTrigger>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-semibold">عدد الصفوف</p>
                <h3 className="text-2xl font-bold text-purple-900">{uniqueClasses.length}</h3>
              </div>
              <BookOpen className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-semibold">إجمالي الجداول</p>
                <h3 className="text-2xl font-bold text-blue-900">{schedules.length}</h3>
              </div>
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-semibold">عدد المعلمين</p>
                <h3 className="text-2xl font-bold text-green-900">{teachers.length}</h3>
              </div>
              <User className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-700 font-semibold">أيام الأسبوع</p>
                <h3 className="text-2xl font-bold text-orange-900">{DAYS.length}</h3>
              </div>
              <Clock className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Class Filter */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <Label className="font-semibold whitespace-nowrap">فلتر حسب الصف:</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="max-w-md">
                <SelectValue placeholder="جميع الصفوف" />
              </SelectTrigger>
              <SelectContent className="max-h-80">
                <SelectItem value="all">جميع الصفوف</SelectItem>
                {constants.grades?.map(grade => (
                  <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedClass && (
              <Button size="sm" variant="outline" onClick={() => setSelectedClass('')}>
                <X className="w-4 h-4 mr-1" />
                إلغاء الفلتر
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Display based on view mode */}
      {viewMode === 'table' ? renderTableView() : (
        <div className="grid grid-cols-1 gap-4">
          {filteredSchedules.map(schedule => (
            <Card key={schedule.id} className="hover:shadow-lg transition-all">
              <CardHeader className="bg-gradient-to-r from-purple-100 to-indigo-100">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg">{schedule.class_name}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">يوم {schedule.day}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openDialog(schedule)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(schedule.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  {schedule.periods.map((period, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                      <Badge variant="outline" className="whitespace-nowrap">{period.time}</Badge>
                      <div className="flex-1">
                        <p className="font-semibold text-purple-700">{period.subject}</p>
                        <p className="text-sm text-gray-600">{getTeacherName(period.teacher_id)}</p>
                      </div>
                      {period.room && (
                        <Badge className="bg-blue-100 text-blue-700">غرفة {period.room}</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
          {filteredSchedules.length === 0 && (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">لا توجد جداول مسجلة</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
            <DialogTitle className="text-2xl">
              {editingSchedule ? 'تعديل' : 'إضافة'} جدول دراسي
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 p-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="font-semibold">الصف الدراسي *</Label>
                <Select value={formData.class_name} onValueChange={(val) => setFormData({...formData, class_name: val})} required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الصف" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {constants.grades?.map(grade => (
                      <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="font-semibold">اليوم *</Label>
                <Select value={formData.day} onValueChange={(val) => setFormData({...formData, day: val})} required>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر اليوم" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map(day => (
                      <SelectItem key={day} value={day}>{day}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center mb-3">
                <Label className="font-bold text-lg">الحصص الدراسية</Label>
                <Button type="button" size="sm" onClick={addPeriod}>
                  <Plus className="w-4 h-4 mr-1" />
                  إضافة حصة
                </Button>
              </div>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {formData.periods.map((period, idx) => (
                  <div key={idx} className="p-4 border rounded-lg bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <span className="font-semibold">الحصة {idx + 1}</span>
                      <Button type="button" size="sm" variant="destructive" onClick={() => removePeriod(idx)}>
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm">الوقت *</Label>
                        <Select value={period.time} onValueChange={(val) => updatePeriod(idx, 'time', val)} required>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر الوقت" />
                          </SelectTrigger>
                          <SelectContent>
                            {TIME_SLOTS.filter(t => t !== '10:15-11:00').map(time => (
                              <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">المادة *</Label>
                        <Select value={period.subject} onValueChange={(val) => updatePeriod(idx, 'subject', val)} required>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المادة" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {constants.subjects?.map(subject => (
                              <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">المعلم *</Label>
                        <Select value={period.teacher_id} onValueChange={(val) => updatePeriod(idx, 'teacher_id', val)} required>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر معلم" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {teachers.map(t => (
                              <SelectItem key={t.id} value={t.id}>{t.full_name || t.user_id}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm">رقم الغرفة</Label>
                        <Input
                          value={period.room}
                          onChange={(e) => updatePeriod(idx, 'room', e.target.value)}
                          placeholder="مثال: 101"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {formData.periods.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>لم تتم إضافة حصص بعد</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 justify-end pt-4 border-t">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                إلغاء
              </Button>
              <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                حفظ الجدول
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScheduleManagerComplete;