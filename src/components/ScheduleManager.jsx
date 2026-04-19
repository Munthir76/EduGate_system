import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Plus, Calendar, Clock } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const ScheduleManager = ({ teachers, t }) => {
  const [schedules, setSchedules] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [formData, setFormData] = useState({
    class_name: '',
    day: 'Monday',
    periods: []
  });

  const days = ['الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة'];
  const timeSlots = [
    '08:00-09:00', '09:00-10:00', '10:00-11:00', '11:00-12:00',
    '12:00-13:00', '13:00-14:00', '14:00-15:00'
  ];

  useEffect(() => {
    fetchSchedules();
  }, []);

  const fetchSchedules = async () => {
    try {
      const res = await axios.get('/schedules');
      setSchedules(res.data);
    } catch (error) {
      toast.error('خطأ في تحميل الجداول');
    }
  };

  const addClass = () => {
    setFormData({
      ...formData,
      periods: [...formData.periods, { time: timeSlots[0], subject: '', teacher_id: '' }]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/schedules', formData);
      toast.success('تم إضافة الجدول بنجاح! 🎉');
      setShowDialog(false);
      setFormData({ class_name: '', day: 'Monday', periods: [] });
      fetchSchedules();
    } catch (error) {
      toast.error('خطأ في الحفظ');
    }
  };

  const uniqueClasses = [...new Set(schedules.map(s => s.class_name))];

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.full_name || teacher?.user_id || 'غير محدد';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar className="w-8 h-8 text-purple-600" />
            الجداول الدراسية
          </h1>
          <p className="text-gray-600 mt-1">إدارة جداول جميع الفصول</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              إضافة جدول
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
            <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
              <DialogTitle className="text-2xl">إنشاء جدول دراسي</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 p-2">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-gray-800 font-semibold">الصف *</Label>
                  <Input
                    value={formData.class_name}
                    onChange={(e) => setFormData({ ...formData, class_name: e.target.value })}
                    placeholder="الصف الخامس أ"
                    required
                    className="border-2 focus:border-purple-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-gray-800 font-semibold">اليوم *</Label>
                  <Select value={formData.day} onValueChange={(val) => setFormData({ ...formData, day: val })}>
                    <SelectTrigger className="border-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {days.map(day => <SelectItem key={day} value={day}>{day}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-gray-800 font-semibold">الحصص</Label>
                  <Button type="button" size="sm" onClick={addClass} variant="outline">
                    <Plus className="w-3 h-3 mr-1" />
                    إضافة حصة
                  </Button>
                </div>
                
                {formData.periods.map((period, idx) => (
                  <Card key={idx} className="border-2 border-purple-100">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-2">
                          <Label className="text-sm">الوقت</Label>
                          <Select 
                            value={period.time} 
                            onValueChange={(val) => {
                              const newPeriods = [...formData.periods];
                              newPeriods[idx].time = val;
                              setFormData({ ...formData, periods: newPeriods });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeSlots.map(slot => <SelectItem key={slot} value={slot}>{slot}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">المادة</Label>
                          <Input
                            value={period.subject}
                            onChange={(e) => {
                              const newPeriods = [...formData.periods];
                              newPeriods[idx].subject = e.target.value;
                              setFormData({ ...formData, periods: newPeriods });
                            }}
                            placeholder="الرياضيات"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">المعلم</Label>
                          <Select 
                            value={period.teacher_id}
                            onValueChange={(val) => {
                              const newPeriods = [...formData.periods];
                              newPeriods[idx].teacher_id = val;
                              setFormData({ ...formData, periods: newPeriods });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر معلم" />
                            </SelectTrigger>
                            <SelectContent>
                              {teachers.map(t => (
                                <SelectItem key={t.id} value={t.id}>{t.full_name || t.user_id}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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

      {/* Class Filter */}
      <Card>
        <CardContent className="p-4">
          <Select value={selectedClass} onValueChange={setSelectedClass}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="اختر الصف" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">جميع الصفوف</SelectItem>
              {uniqueClasses.map(cls => (
                <SelectItem key={cls} value={cls}>{cls}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Schedules Display */}
      <div className="grid gap-6">
        {(selectedClass ? schedules.filter(s => s.class_name === selectedClass) : schedules).map(schedule => (
          <Card key={schedule.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                {schedule.class_name} - {schedule.day}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-3">
                {schedule.periods.map((period, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 text-purple-600 font-semibold min-w-[120px]">
                      <Clock className="w-4 h-4" />
                      {period.time}
                    </div>
                    <div className="flex-1">
                      <span className="font-semibold text-gray-900">{period.subject}</span>
                    </div>
                    <div className="text-gray-600 text-sm">
                      {getTeacherName(period.teacher_id)}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {schedules.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">لا توجد جداول دراسية بعد</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ScheduleManager;
