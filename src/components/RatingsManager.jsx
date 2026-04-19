import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Star, Award, Plus, TrendingUp } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const RatingsManager = ({ teachers, students, t, userRole }) => {
  const [ratings, setRatings] = useState([]);
  const [showDialog, setShowDialog] = useState(false);
  const [formData, setFormData] = useState({
    target_id: '',
    target_type: userRole === 'school_admin' ? 'teacher' : 'student',
    rating: 5,
    category: '',
    notes: ''
  });

  useEffect(() => {
    fetchRatings();
  }, []);

  const fetchRatings = async () => {
    try {
      const res = await axios.get('/ratings');
      setRatings(res.data);
    } catch (error) {
      toast.error('خطأ في تحميل التقييمات');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/ratings', formData);
      toast.success('تم إضافة التقييم بنجاح! ⭐');
      setShowDialog(false);
      setFormData({ target_id: '', target_type: userRole === 'school_admin' ? 'teacher' : 'student', rating: 5, category: '', notes: '' });
      fetchRatings();
    } catch (error) {
      toast.error('خطأ في الحفظ');
    }
  };

  const targetList = formData.target_type === 'teacher' ? teachers : students;
  const categories = userRole === 'school_admin' 
    ? ['التدريس', 'الانضباط', 'التعاون', 'الالتزام', 'الإبداع']
    : ['الأداء الأكاديمي', 'السلوك', 'المشاركة', 'الواجبات', 'الحضور'];

  const getAverageRating = (targetId) => {
    const targetRatings = ratings.filter(r => r.target_id === targetId);
    if (targetRatings.length === 0) return 0;
    return (targetRatings.reduce((sum, r) => sum + r.rating, 0) / targetRatings.length).toFixed(1);
  };

  const getRatingColor = (rating) => {
    if (rating >= 8) return 'text-green-600';
    if (rating >= 6) return 'text-blue-600';
    if (rating >= 4) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingBadge = (rating) => {
    if (rating >= 9) return { label: 'ممتاز', color: 'bg-green-500' };
    if (rating >= 7) return { label: 'جيد جداً', color: 'bg-blue-500' };
    if (rating >= 5) return { label: 'جيد', color: 'bg-yellow-500' };
    if (rating >= 3) return { label: 'مقبول', color: 'bg-orange-500' };
    return { label: 'ضعيف', color: 'bg-red-500' };
  };

  const getTargetName = (item) => {
    // Try to get full_name first, fallback to user_id
    return item.full_name || item.user_id || 'غير محدد';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Award className="w-8 h-8 text-purple-600" />
            {userRole === 'school_admin' ? 'تقييمات المعلمين' : 'تقييمات الطلاب'}
          </h1>
          <p className="text-gray-600 mt-1">متابعة الأداء والتحسين المستمر (من 1 إلى 10)</p>
        </div>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
              <Plus className="w-4 h-4 mr-2" />
              إضافة تقييم
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
              <DialogTitle className="text-2xl">تقييم جديد</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 p-2">
              <div className="space-y-2">
                <Label className="text-gray-800 font-semibold">
                  {userRole === 'school_admin' ? 'اختر المعلم' : 'اختر الطالب'} *
                </Label>
                <Select value={formData.target_id} onValueChange={(val) => setFormData({ ...formData, target_id: val })}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="اختر..." />
                  </SelectTrigger>
                  <SelectContent>
                    {targetList.map(item => (
                      <SelectItem key={item.id} value={item.id}>{getTargetName(item)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-800 font-semibold">الفئة *</Label>
                <Select value={formData.category} onValueChange={(val) => setFormData({ ...formData, category: val })}>
                  <SelectTrigger className="border-2">
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-800 font-semibold">التقييم (1-10) *</Label>
                <div className="grid grid-cols-10 gap-2">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: num })}
                      className={`p-3 rounded-lg font-bold text-lg transition-all ${
                        formData.rating === num 
                          ? 'bg-purple-600 text-white shadow-lg scale-110' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
                <div className="text-center mt-3">
                  <span className="text-4xl font-bold text-purple-600">{formData.rating}/10</span>
                  <p className="text-sm text-gray-600 mt-1">
                    {formData.rating >= 9 ? 'ممتاز' : formData.rating >= 7 ? 'جيد جداً' : formData.rating >= 5 ? 'جيد' : formData.rating >= 3 ? 'مقبول' : 'ضعيف'}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-gray-800 font-semibold">ملاحظات</Label>
                <Textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="أضف ملاحظاتك هنا..."
                  className="border-2 focus:border-purple-500"
                  rows={4}
                />
              </div>

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                  إلغاء
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  حفظ التقييم
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-700 font-semibold">المتوسط العام</p>
                <h3 className="text-3xl font-bold text-green-800 mt-1">
                  {ratings.length > 0 
                    ? (ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length).toFixed(1)
                    : '0.0'
                  }/10
                </h3>
              </div>
              <TrendingUp className="w-10 h-10 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-700 font-semibold">عدد التقييمات</p>
                <h3 className="text-3xl font-bold text-blue-800 mt-1">{ratings.length}</h3>
              </div>
              <Award className="w-10 h-10 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-700 font-semibold">الأشخاص المقيمون</p>
                <h3 className="text-3xl font-bold text-purple-800 mt-1">{targetList.length}</h3>
              </div>
              <Star className="w-10 h-10 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ratings Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {targetList.map(item => {
          const avgRating = parseFloat(getAverageRating(item.id));
          const itemRatings = ratings.filter(r => r.target_id === item.id);
          const badge = getRatingBadge(avgRating);
          
          return (
            <Card key={item.id} className="hover:shadow-xl transition-all border-2">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-indigo-50">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{getTargetName(item)}</CardTitle>
                    {item.specialization && (
                      <p className="text-sm text-gray-600 mt-1">{item.specialization}</p>
                    )}
                  </div>
                  <Badge className={`${badge.color} text-white`}>{badge.label}</Badge>
                </div>
                <div className="flex items-center gap-3 mt-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                    <span className={`text-3xl font-bold ${getRatingColor(avgRating)}`}>
                      {avgRating || '0.0'}
                    </span>
                    <span className="text-gray-500">/10</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600 flex items-center justify-between">
                    <span>عدد التقييمات:</span>
                    <Badge variant="outline" className="font-bold">{itemRatings.length}</Badge>
                  </p>
                  <div className="border-t pt-3 space-y-2">
                    {itemRatings.slice(0, 3).map(rating => (
                      <div key={rating.id} className="p-3 bg-gray-50 rounded-lg text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-900">{rating.category}</span>
                          <Badge className={`${getRatingBadge(rating.rating).color} text-white text-xs`}>
                            {rating.rating}/10
                          </Badge>
                        </div>
                        {rating.notes && (
                          <p className="text-gray-600 text-xs mt-1 line-clamp-2">{rating.notes}</p>
                        )}
                      </div>
                    ))}
                    {itemRatings.length === 0 && (
                      <p className="text-center text-gray-400 text-sm py-4">لا توجد تقييمات بعد</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {targetList.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Award className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <p className="text-gray-500">لا توجد بيانات للتقييم</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RatingsManager;
