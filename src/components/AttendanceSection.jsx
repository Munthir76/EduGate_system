import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Calendar, CheckCircle, XCircle, Clock, Plus } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const AttendanceSection = ({ attendance, students, t, fetchData }) => {
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [formData, setFormData] = useState({
    student_id: '',
    date: new Date().toISOString().split('T')[0],
    status: 'present',
    notes: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/attendance', formData);
      toast.success(t('success'));
      setShowDialog(false);
      setFormData({ student_id: '', date: new Date().toISOString().split('T')[0], status: 'present', notes: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      present: { variant: 'default', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100' },
      absent: { variant: 'destructive', icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
      late: { variant: 'secondary', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-100' },
      excused: { variant: 'outline', icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' }
    };
    const config = variants[status] || variants.present;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className={`${config.bg} ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {t(status)}
      </Badge>
    );
  };

  // Group attendance by student
  const studentAttendance = {};
  attendance.forEach(record => {
    if (!studentAttendance[record.student_id]) {
      studentAttendance[record.student_id] = [];
    }
    studentAttendance[record.student_id].push(record);
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('attendance')}</h1>
          <p className="text-gray-600 mt-1">{t('today')}: {selectedDate}</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600" data-testid="mark-attendance-button">
              <Plus className="w-4 h-4 mr-2" />
              {t('mark_attendance')}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{t('mark_attendance')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t('select_student')} *</Label>
                <Select value={formData.student_id} onValueChange={(value) => setFormData({ ...formData, student_id: value })} required>
                  <SelectTrigger>
                    <SelectValue placeholder={t('select_student')} />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.user_id} - {student.class_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('date')} *</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>{t('status')} *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">{t('present')}</SelectItem>
                    <SelectItem value="absent">{t('absent')}</SelectItem>
                    <SelectItem value="late">{t('late')}</SelectItem>
                    <SelectItem value="excused">{t('excused')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>{t('notes')}</Label>
                <Input
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder={t('notes')}
                />
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
                  <th>{t('student')}</th>
                  <th>{t('class')}</th>
                  <th>{t('date')}</th>
                  <th>{t('status')}</th>
                  <th>{t('notes')}</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => {
                  const student = students.find(s => s.id === record.student_id);
                  return (
                    <tr key={record.id}>
                      <td className="font-semibold">{student?.user_id || record.student_id}</td>
                      <td>{record.class_name}</td>
                      <td>{record.date}</td>
                      <td>{getStatusBadge(record.status)}</td>
                      <td className="text-sm text-gray-600">{record.notes || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {attendance.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                {t('no_data')}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AttendanceSection;
