import React, { useState, useRef } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { 
  User, Camera, Save, Mail, Phone, Shield, Key, 
  CheckCircle, Lock, Eye, EyeOff
} from 'lucide-react';

const AdminProfile = ({ user, onUpdate }) => {
  const [profileData, setProfileData] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    profile_image: user?.profile_image || ''
  });
  const [passwordData, setPasswordData] = useState({
    current_password: '',
    new_password: '',
    confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('حجم الصورة يجب أن يكون أقل من 5MB');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData(prev => ({
          ...prev,
          profile_image: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await axios.put('/auth/profile', profileData);
      toast.success('تم تحديث الملف الشخصي بنجاح! ✅');
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
      if (onUpdate) onUpdate();
    } catch (error) {
      toast.error('خطأ في تحديث الملف الشخصي');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.new_password !== passwordData.confirm_password) {
      toast.error('كلمة المرور الجديدة غير متطابقة');
      return;
    }
    if (passwordData.new_password.length < 6) {
      toast.error('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }
    
    setLoading(true);
    try {
      await axios.put('/auth/change-password', {
        current_password: passwordData.current_password,
        new_password: passwordData.new_password
      });
      toast.success('تم تغيير كلمة المرور بنجاح! ✅');
      setPasswordData({ current_password: '', new_password: '', confirm_password: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'خطأ في تغيير كلمة المرور');
    } finally {
      setLoading(false);
    }
  };

  const roleLabels = {
    super_admin: 'المدير العام',
    school_admin: 'مدير المدرسة',
    teacher: 'معلم',
    student: 'طالب',
    parent: 'ولي أمر'
  };

  return (
    <div className="space-y-6" dir="rtl">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <User className="w-8 h-8 text-purple-600" />
            الملف الشخصي
          </h1>
          <p className="text-gray-600 mt-1">إدارة معلوماتك الشخصية وإعدادات الأمان</p>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-purple-600 to-indigo-600 relative">
          {/* Profile Image */}
          <div className="absolute -bottom-16 right-8">
            <div 
              className="w-32 h-32 rounded-full bg-white shadow-xl flex items-center justify-center overflow-hidden cursor-pointer group border-4 border-white"
              onClick={() => fileInputRef.current?.click()}
            >
              {profileData.profile_image ? (
                <img src={profileData.profile_image} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-16 h-16 text-purple-600" />
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-full">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>
        </div>
        <CardContent className="pt-20 pb-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{user?.full_name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Shield className="w-4 h-4 text-purple-600" />
                <span className="text-purple-600 font-medium">{roleLabels[user?.role]}</span>
              </div>
            </div>
            <Button 
              onClick={handleSaveProfile} 
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-indigo-600"
              data-testid="save-profile-btn"
            >
              {saved ? (
                <><CheckCircle className="w-5 h-5 ml-2" /> تم الحفظ</>
              ) : (
                <><Save className="w-5 h-5 ml-2" /> حفظ التغييرات</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            المعلومات الشخصية
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <User className="w-4 h-4" />
                الاسم الكامل
              </Label>
              <Input 
                value={profileData.full_name} 
                onChange={(e) => setProfileData({...profileData, full_name: e.target.value})}
                placeholder="الاسم الكامل"
                data-testid="profile-full-name"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                البريد الإلكتروني
              </Label>
              <Input 
                type="email"
                value={profileData.email} 
                onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                placeholder="example@email.com"
                data-testid="profile-email"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                رقم الهاتف
              </Label>
              <Input 
                value={profileData.phone} 
                onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                placeholder="+223 00 00 00 00"
                data-testid="profile-phone"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Shield className="w-4 h-4" />
                الدور
              </Label>
              <Input 
                value={roleLabels[user?.role]}
                disabled
                className="bg-gray-100"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-600" />
            تغيير كلمة المرور
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>كلمة المرور الحالية</Label>
              <div className="relative">
                <Input 
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.current_password} 
                  onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                  placeholder="••••••••"
                  data-testid="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, current: !showPasswords.current})}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>كلمة المرور الجديدة</Label>
              <div className="relative">
                <Input 
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.new_password} 
                  onChange={(e) => setPasswordData({...passwordData, new_password: e.target.value})}
                  placeholder="••••••••"
                  data-testid="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, new: !showPasswords.new})}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>تأكيد كلمة المرور</Label>
              <div className="relative">
                <Input 
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirm_password} 
                  onChange={(e) => setPasswordData({...passwordData, confirm_password: e.target.value})}
                  placeholder="••••••••"
                  data-testid="confirm-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords({...showPasswords, confirm: !showPasswords.confirm})}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>
          <Button 
            onClick={handleChangePassword}
            disabled={loading || !passwordData.current_password || !passwordData.new_password}
            variant="outline"
            className="mt-4"
            data-testid="change-password-btn"
          >
            <Lock className="w-4 h-4 ml-2" />
            تغيير كلمة المرور
          </Button>
        </CardContent>
      </Card>

      {/* Security Tips */}
      <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
        <CardContent className="p-6">
          <h3 className="font-bold text-yellow-900 mb-3">🔐 نصائح أمنية</h3>
          <ul className="space-y-2 text-yellow-800">
            <li>• استخدم كلمة مرور قوية تحتوي على أحرف وأرقام ورموز</li>
            <li>• لا تشارك كلمة المرور مع أي شخص</li>
            <li>• قم بتغيير كلمة المرور بشكل دوري</li>
            <li>• تأكد من تسجيل الخروج عند استخدام أجهزة مشتركة</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminProfile;
