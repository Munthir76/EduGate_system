import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  School, Camera, Save, Mail, Phone, MapPin, Globe, 
  Palette, Image, Settings, CheckCircle, Building
} from 'lucide-react';

const SchoolSettings = ({ user, t, onUpdate }) => {
  const [schoolData, setSchoolData] = useState({
    name: '',
    name_ar: '',
    name_fr: '',
    address: '',
    phone: '',
    email: '',
    description: '',
    logo: '',
    cover_image: '',
    primary_color: '#7c3aed',
    secondary_color: '#4f46e5'
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const logoInputRef = useRef(null);
  const coverInputRef = useRef(null);

  useEffect(() => {
    fetchSchoolData();
  }, []);

  const fetchSchoolData = async () => {
    try {
      const res = await axios.get(`/schools/${user.school_id}`);
      if (res.data) {
        setSchoolData(prev => ({
          ...prev,
          ...res.data
        }));
      }
    } catch (error) {
      console.error('Error fetching school data:', error);
    }
  };

  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setSchoolData(prev => ({
          ...prev,
          [type]: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.put(`/schools/${user.school_id}`, schoolData);
      toast.success('تم حفظ إعدادات المدرسة بنجاح! ✅');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('خطأ في حفظ الإعدادات');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Settings className="w-8 h-8 text-purple-600" />
            إعدادات المدرسة
          </h1>
          <p className="text-gray-600 mt-1">خصص مدرستك واجعلها تعكس هويتك</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={loading}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6"
          data-testid="save-school-settings-btn"
        >
          {saved ? (
            <><CheckCircle className="w-5 h-5 ml-2" /> تم الحفظ</>
          ) : (
            <><Save className="w-5 h-5 ml-2" /> {loading ? 'جاري الحفظ...' : 'حفظ التغييرات'}</>
          )}
        </Button>
      </div>

      {/* Cover Image Section */}
      <Card className="overflow-hidden">
        <div 
          className="h-48 bg-gradient-to-r from-purple-600 to-indigo-600 relative cursor-pointer group"
          style={schoolData.cover_image ? { backgroundImage: `url(${schoolData.cover_image})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
          onClick={() => coverInputRef.current?.click()}
        >
          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="text-white text-center">
              <Camera className="w-12 h-12 mx-auto mb-2" />
              <p>تغيير صورة الغلاف</p>
            </div>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => handleImageUpload(e, 'cover_image')}
            className="hidden"
          />
          
          {/* Logo overlay */}
          <div className="absolute -bottom-16 right-8">
            <div 
              className="w-32 h-32 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden cursor-pointer group border-4 border-white"
              onClick={(e) => { e.stopPropagation(); logoInputRef.current?.click(); }}
            >
              {schoolData.logo ? (
                <img src={schoolData.logo} alt="School Logo" className="w-full h-full object-cover" />
              ) : (
                <School className="w-16 h-16 text-purple-600" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleImageUpload(e, 'logo')}
              className="hidden"
            />
          </div>
        </div>
        <CardContent className="pt-20 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{schoolData.name || 'اسم المدرسة'}</h2>
              <p className="text-gray-500">{schoolData.address || 'العنوان'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="w-5 h-5 text-purple-600" />
            المعلومات الأساسية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                اسم المدرسة (عربي)
              </Label>
              <Input 
                value={schoolData.name_ar || schoolData.name} 
                onChange={(e) => setSchoolData({...schoolData, name_ar: e.target.value, name: e.target.value})}
                placeholder="مدرسة النور الابتدائية"
                data-testid="school-name-ar"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                اسم المدرسة (فرنسي)
              </Label>
              <Input 
                value={schoolData.name_fr} 
                onChange={(e) => setSchoolData({...schoolData, name_fr: e.target.value})}
                placeholder="École Primaire Al-Nour"
                data-testid="school-name-fr"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                البريد الإلكتروني
              </Label>
              <Input 
                type="email"
                value={schoolData.email} 
                onChange={(e) => setSchoolData({...schoolData, email: e.target.value})}
                placeholder="info@school.edu.ml"
                data-testid="school-email"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                رقم الهاتف
              </Label>
              <Input 
                value={schoolData.phone} 
                onChange={(e) => setSchoolData({...schoolData, phone: e.target.value})}
                placeholder="+223 20 00 00 00"
                data-testid="school-phone"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                العنوان
              </Label>
              <Input 
                value={schoolData.address} 
                onChange={(e) => setSchoolData({...schoolData, address: e.target.value})}
                placeholder="باماكو، مالي"
                data-testid="school-address"
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>وصف المدرسة</Label>
            <Textarea 
              value={schoolData.description} 
              onChange={(e) => setSchoolData({...schoolData, description: e.target.value})}
              placeholder="اكتب وصفاً موجزاً عن مدرستك ورؤيتها..."
              rows={4}
              data-testid="school-description"
            />
          </div>
        </CardContent>
      </Card>

      {/* Theme Colors */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-purple-600" />
            ألوان الواجهة
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>اللون الأساسي</Label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={schoolData.primary_color}
                  onChange={(e) => setSchoolData({...schoolData, primary_color: e.target.value})}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input 
                  value={schoolData.primary_color}
                  onChange={(e) => setSchoolData({...schoolData, primary_color: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>اللون الثانوي</Label>
              <div className="flex items-center gap-2">
                <input 
                  type="color" 
                  value={schoolData.secondary_color}
                  onChange={(e) => setSchoolData({...schoolData, secondary_color: e.target.value})}
                  className="w-12 h-10 rounded cursor-pointer"
                />
                <Input 
                  value={schoolData.secondary_color}
                  onChange={(e) => setSchoolData({...schoolData, secondary_color: e.target.value})}
                  className="flex-1"
                />
              </div>
            </div>
          </div>
          
          {/* Preview */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl">
            <p className="text-sm text-gray-500 mb-3">معاينة الألوان:</p>
            <div className="flex items-center gap-4">
              <div 
                className="px-6 py-3 rounded-lg text-white font-semibold"
                style={{ backgroundColor: schoolData.primary_color }}
              >
                زر أساسي
              </div>
              <div 
                className="px-6 py-3 rounded-lg text-white font-semibold"
                style={{ backgroundColor: schoolData.secondary_color }}
              >
                زر ثانوي
              </div>
              <div 
                className="px-6 py-3 rounded-lg font-semibold border-2"
                style={{ borderColor: schoolData.primary_color, color: schoolData.primary_color }}
              >
                زر خارجي
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-purple-900 mb-3">💡 نصائح لتخصيص مدرستك</h3>
          <ul className="space-y-2 text-purple-800">
            <li>• استخدم شعاراً واضحاً بخلفية شفافة (PNG)</li>
            <li>• صورة الغلاف المثالية بحجم 1200×400 بكسل</li>
            <li>• اختر ألواناً تعكس هوية مدرستك</li>
            <li>• اكتب وصفاً موجزاً يعكس رؤية المدرسة</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default SchoolSettings;
