import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import { 
  User, Mail, Phone, Calendar, MapPin, BookOpen, GraduationCap,
  DollarSign, Clock, FileText, Camera, Edit, Save, X, 
  ChevronRight, Heart, AlertCircle, Check, Star, Upload
} from 'lucide-react';

// مكون رفع الصورة
const ImageUploader = ({ currentImage, onImageChange, size = 'lg' }) => {
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(currentImage);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-40 h-40'
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageChange(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative group">
      <div 
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center overflow-hidden border-4 border-white shadow-xl cursor-pointer`}
        onClick={() => fileInputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <User className="w-1/2 h-1/2 text-white" />
        )}
      </div>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="absolute bottom-0 right-0 w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-purple-700 transition-colors"
      >
        <Camera className="w-5 h-5" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
};

// مكون بطاقة المعلومات
const InfoCard = ({ icon: Icon, label, value, color = 'gray' }) => (
  <div className={`p-4 bg-${color}-50 rounded-xl border border-${color}-100`}>
    <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
      <Icon className="w-4 h-4" />
      {label}
    </div>
    <p className="font-semibold text-gray-900">{value || '-'}</p>
  </div>
);

// ==================== مكون تفاصيل الطالب ====================
export const StudentDetailView = ({ student, isOpen, onClose, onUpdate, fees = [], attendance = [], grades = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (student) {
      setFormData({
        full_name: student.full_name || '',
        email: student.email || '',
        phone: student.phone || '',
        class_name: student.class_name || '',
        grade: student.grade || '',
        date_of_birth: student.date_of_birth || '',
        address: student.address || '',
        medical_info: student.medical_info || '',
        profile_image: student.profile_image || ''
      });
    }
  }, [student]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`/students/${student.id}`, formData);
      toast.success('تم تحديث بيانات الطالب بنجاح!');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('خطأ في تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  // حساب الإحصائيات
  const studentFees = fees.filter(f => f.student_id === student?.id);
  const totalFees = studentFees.reduce((sum, f) => sum + (f.amount || 0), 0);
  const paidFees = studentFees.reduce((sum, f) => sum + (f.paid_amount || 0), 0);
  
  const studentAttendance = attendance.filter(a => a.student_id === student?.id);
  const presentDays = studentAttendance.filter(a => a.status === 'present').length;
  const absentDays = studentAttendance.filter(a => a.status === 'absent').length;
  
  const studentGrades = grades.filter(g => g.student_id === student?.id);
  const avgGrade = studentGrades.length > 0 
    ? (studentGrades.reduce((sum, g) => sum + (g.percentage || 0), 0) / studentGrades.length).toFixed(1)
    : 0;

  if (!student) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white p-0" data-testid="student-detail-dialog">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-700 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-4 left-4 hover:bg-white/20 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-6">
            <ImageUploader 
              currentImage={formData.profile_image} 
              onImageChange={(img) => setFormData({...formData, profile_image: img})}
              size="xl"
            />
            <div className="flex-1">
              {isEditing ? (
                <Input 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="text-2xl font-bold bg-white/20 border-white/30 text-white placeholder:text-white/50"
                />
              ) : (
                <h2 className="text-3xl font-bold">{student.full_name}</h2>
              )}
              <p className="text-purple-200 mt-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                طالب - {student.class_name} - {student.grade}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-white/20">{student.class_name}</Badge>
                <Badge className="bg-green-500">نشط</Badge>
              </div>
            </div>
            <Button
              variant={isEditing ? "secondary" : "outline"}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={loading}
              className={isEditing ? "bg-green-500 hover:bg-green-600" : "bg-white/20 border-white/30 text-white hover:bg-white/30"}
            >
              {isEditing ? <><Save className="w-4 h-4 ml-2" /> حفظ</> : <><Edit className="w-4 h-4 ml-2" /> تعديل</>}
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm text-green-700">المدفوع</p>
                <p className="text-2xl font-bold text-green-900">{paidFees.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4 text-center">
                <AlertCircle className="w-8 h-8 mx-auto text-red-600 mb-2" />
                <p className="text-sm text-red-700">المتبقي</p>
                <p className="text-2xl font-bold text-red-900">{(totalFees - paidFees).toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <Check className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-sm text-blue-700">أيام الحضور</p>
                <p className="text-2xl font-bold text-blue-900">{presentDays}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <p className="text-sm text-purple-700">المعدل</p>
                <p className="text-2xl font-bold text-purple-900">{avgGrade}%</p>
              </CardContent>
            </Card>
          </div>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-purple-600" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label>البريد الإلكتروني</Label>
                      <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>الهاتف</Label>
                      <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>تاريخ الميلاد</Label>
                      <Input type="date" value={formData.date_of_birth} onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>الصف</Label>
                      <Input value={formData.class_name} onChange={(e) => setFormData({...formData, class_name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>المستوى</Label>
                      <Input value={formData.grade} onChange={(e) => setFormData({...formData, grade: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>العنوان</Label>
                      <Input value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                    </div>
                    <div className="space-y-2 col-span-3">
                      <Label>معلومات طبية</Label>
                      <Textarea value={formData.medical_info} onChange={(e) => setFormData({...formData, medical_info: e.target.value})} />
                    </div>
                  </>
                ) : (
                  <>
                    <InfoCard icon={Mail} label="البريد الإلكتروني" value={student.email} color="purple" />
                    <InfoCard icon={Phone} label="الهاتف" value={student.phone} color="blue" />
                    <InfoCard icon={Calendar} label="تاريخ الميلاد" value={student.date_of_birth} color="green" />
                    <InfoCard icon={BookOpen} label="الصف" value={student.class_name} color="indigo" />
                    <InfoCard icon={GraduationCap} label="المستوى" value={student.grade} color="purple" />
                    <InfoCard icon={MapPin} label="العنوان" value={student.address} color="gray" />
                    {student.medical_info && (
                      <div className="col-span-3 p-4 bg-red-50 rounded-xl border border-red-100">
                        <div className="flex items-center gap-2 text-red-600 text-sm mb-1">
                          <Heart className="w-4 h-4" />
                          معلومات طبية
                        </div>
                        <p className="text-red-900">{student.medical_info}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Grades */}
          {studentGrades.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  آخر الدرجات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {studentGrades.slice(0, 5).map((grade, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{grade.subject}</p>
                        <p className="text-sm text-gray-500">{grade.assessment_name}</p>
                      </div>
                      <Badge className={grade.percentage >= 50 ? 'bg-green-500' : 'bg-red-500'}>
                        {grade.score}/{grade.max_score} ({grade.percentage?.toFixed(0)}%)
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ==================== مكون تفاصيل المعلم ====================
export const TeacherDetailView = ({ teacher, isOpen, onClose, onUpdate, salaries = [], ratings = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teacher) {
      setFormData({
        full_name: teacher.full_name || '',
        email: teacher.email || '',
        phone: teacher.phone || '',
        specialization: teacher.specialization || '',
        subjects: teacher.subjects || [],
        classes: teacher.classes || [],
        profile_image: teacher.profile_image || ''
      });
    }
  }, [teacher]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`/teachers/${teacher.id}`, formData);
      toast.success('تم تحديث بيانات المعلم بنجاح!');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('خطأ في تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  // حساب الإحصائيات
  const teacherSalaries = salaries.filter(s => s.employee_id === teacher?.id);
  const totalSalaries = teacherSalaries.reduce((sum, s) => sum + (s.amount || 0), 0);
  const paidSalaries = teacherSalaries.filter(s => s.paid || s.payment_date).length;
  
  const teacherRatings = ratings.filter(r => r.target_id === teacher?.id);
  const avgRating = teacherRatings.length > 0 
    ? (teacherRatings.reduce((sum, r) => sum + (r.rating || 0), 0) / teacherRatings.length).toFixed(1)
    : 0;

  if (!teacher) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white p-0" data-testid="teacher-detail-dialog">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-4 left-4 hover:bg-white/20 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-6">
            <ImageUploader 
              currentImage={formData.profile_image} 
              onImageChange={(img) => setFormData({...formData, profile_image: img})}
              size="xl"
            />
            <div className="flex-1">
              {isEditing ? (
                <Input 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="text-2xl font-bold bg-white/20 border-white/30 text-white"
                />
              ) : (
                <h2 className="text-3xl font-bold">{teacher.full_name}</h2>
              )}
              <p className="text-blue-200 mt-2 flex items-center gap-2">
                <GraduationCap className="w-5 h-5" />
                معلم - {teacher.specialization || 'غير محدد'}
              </p>
              <div className="flex flex-wrap gap-2 mt-3">
                {teacher.subjects?.map((subject, idx) => (
                  <Badge key={idx} className="bg-white/20">{subject}</Badge>
                ))}
              </div>
            </div>
            <Button
              variant={isEditing ? "secondary" : "outline"}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={loading}
              className={isEditing ? "bg-green-500 hover:bg-green-600" : "bg-white/20 border-white/30 text-white hover:bg-white/30"}
            >
              {isEditing ? <><Save className="w-4 h-4 ml-2" /> حفظ</> : <><Edit className="w-4 h-4 ml-2" /> تعديل</>}
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4 text-center">
                <DollarSign className="w-8 h-8 mx-auto text-green-600 mb-2" />
                <p className="text-sm text-green-700">إجمالي الرواتب</p>
                <p className="text-2xl font-bold text-green-900">{totalSalaries.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4 text-center">
                <Check className="w-8 h-8 mx-auto text-blue-600 mb-2" />
                <p className="text-sm text-blue-700">رواتب مدفوعة</p>
                <p className="text-2xl font-bold text-blue-900">{paidSalaries}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4 text-center">
                <BookOpen className="w-8 h-8 mx-auto text-purple-600 mb-2" />
                <p className="text-sm text-purple-700">المواد</p>
                <p className="text-2xl font-bold text-purple-900">{teacher.subjects?.length || 0}</p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 mx-auto text-yellow-600 mb-2" />
                <p className="text-sm text-yellow-700">التقييم</p>
                <p className="text-2xl font-bold text-yellow-900">{avgRating}/5</p>
              </CardContent>
            </Card>
          </div>

          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label>البريد الإلكتروني</Label>
                      <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>الهاتف</Label>
                      <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>التخصص</Label>
                      <Input value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} />
                    </div>
                  </>
                ) : (
                  <>
                    <InfoCard icon={Mail} label="البريد الإلكتروني" value={teacher.email} color="blue" />
                    <InfoCard icon={Phone} label="الهاتف" value={teacher.phone} color="green" />
                    <InfoCard icon={GraduationCap} label="التخصص" value={teacher.specialization} color="purple" />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subjects & Classes */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <BookOpen className="w-5 h-5 text-indigo-600" />
                  المواد الدراسية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {teacher.subjects?.map((subject, idx) => (
                    <Badge key={idx} variant="outline" className="px-3 py-1">{subject}</Badge>
                  ))}
                  {(!teacher.subjects || teacher.subjects.length === 0) && (
                    <p className="text-gray-500">لم يتم تحديد المواد</p>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <GraduationCap className="w-5 h-5 text-purple-600" />
                  الصفوف
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {teacher.classes?.map((cls, idx) => (
                    <Badge key={idx} variant="outline" className="px-3 py-1">{cls}</Badge>
                  ))}
                  {(!teacher.classes || teacher.classes.length === 0) && (
                    <p className="text-gray-500">لم يتم تحديد الصفوف</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Ratings */}
          {teacherRatings.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-600" />
                  آخر التقييمات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {teacherRatings.slice(0, 5).map((rating, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{rating.category}</p>
                        <p className="text-sm text-gray-500">{rating.notes || 'بدون ملاحظات'}</p>
                      </div>
                      <div className="flex items-center gap-1">
                        {[1,2,3,4,5].map(star => (
                          <Star key={star} className={`w-4 h-4 ${star <= rating.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ==================== مكون تفاصيل ولي الأمر ====================
export const ParentDetailView = ({ parent, isOpen, onClose, onUpdate, students = [] }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (parent) {
      setFormData({
        full_name: parent.full_name || '',
        email: parent.email || '',
        phone: parent.phone || '',
        relationship: parent.relationship || '',
        profile_image: parent.profile_image || ''
      });
    }
  }, [parent]);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`/parents/${parent.id}`, formData);
      toast.success('تم تحديث بيانات ولي الأمر بنجاح!');
      setIsEditing(false);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('خطأ في تحديث البيانات');
    } finally {
      setLoading(false);
    }
  };

  // الأبناء المرتبطين
  const parentStudents = students.filter(s => parent?.student_ids?.includes(s.id));

  if (!parent) return null;

  const relationshipLabels = {
    father: 'أب',
    mother: 'أم',
    guardian: 'ولي أمر'
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto bg-white p-0" data-testid="parent-detail-dialog">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 p-8 text-white relative">
          <button onClick={onClose} className="absolute top-4 left-4 hover:bg-white/20 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-6">
            <ImageUploader 
              currentImage={formData.profile_image} 
              onImageChange={(img) => setFormData({...formData, profile_image: img})}
              size="xl"
            />
            <div className="flex-1">
              {isEditing ? (
                <Input 
                  value={formData.full_name}
                  onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                  className="text-2xl font-bold bg-white/20 border-white/30 text-white"
                />
              ) : (
                <h2 className="text-3xl font-bold">{parent.full_name}</h2>
              )}
              <p className="text-teal-200 mt-2 flex items-center gap-2">
                <User className="w-5 h-5" />
                {relationshipLabels[parent.relationship] || 'ولي أمر'}
              </p>
              <div className="flex gap-2 mt-3">
                <Badge className="bg-white/20">{parentStudents.length} أبناء</Badge>
              </div>
            </div>
            <Button
              variant={isEditing ? "secondary" : "outline"}
              onClick={() => isEditing ? handleSave() : setIsEditing(true)}
              disabled={loading}
              className={isEditing ? "bg-green-500 hover:bg-green-600" : "bg-white/20 border-white/30 text-white hover:bg-white/30"}
            >
              {isEditing ? <><Save className="w-4 h-4 ml-2" /> حفظ</> : <><Edit className="w-4 h-4 ml-2" /> تعديل</>}
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-teal-600" />
                المعلومات الشخصية
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label>البريد الإلكتروني</Label>
                      <Input value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>الهاتف</Label>
                      <Input value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <Label>صلة القرابة</Label>
                      <Input value={formData.relationship} onChange={(e) => setFormData({...formData, relationship: e.target.value})} />
                    </div>
                  </>
                ) : (
                  <>
                    <InfoCard icon={Mail} label="البريد الإلكتروني" value={parent.email} color="teal" />
                    <InfoCard icon={Phone} label="الهاتف" value={parent.phone} color="green" />
                    <InfoCard icon={User} label="صلة القرابة" value={relationshipLabels[parent.relationship]} color="purple" />
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Children */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                الأبناء ({parentStudents.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {parentStudents.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {parentStudents.map((student, idx) => (
                    <div key={idx} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center text-white font-bold">
                        {student.full_name?.[0] || 'ط'}
                      </div>
                      <div>
                        <p className="font-semibold">{student.full_name}</p>
                        <p className="text-sm text-gray-500">{student.class_name} - {student.grade}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">لم يتم ربط أي أبناء</p>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default { StudentDetailView, TeacherDetailView, ParentDetailView, ImageUploader };
