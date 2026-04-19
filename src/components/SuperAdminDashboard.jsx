import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { School, Users, LogOut, Globe, Plus, GraduationCap } from 'lucide-react';

const SuperAdminDashboard = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();
  const [stats, setStats] = useState(null);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    name_ar: '',
    name_fr: '',
    address: '',
    phone: '',
    email: '',
    admin_username: '',
    admin_password: '',
    admin_full_name: '',
    admin_email: ''
  });

  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, schoolsRes] = await Promise.all([
        axios.get('/schools/stats'),
        axios.get('/schools')
      ]);
      setStats(statsRes.data);
      setSchools(schoolsRes.data);
    } catch (error) {
      toast.error(t('error'));
    } finally {
      setLoading(false);
    }
  };

  const handleAddSchool = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/schools', formData);
      toast.success(t('success'));
      setShowAddDialog(false);
      setFormData({
        name: '',
        name_ar: '',
        name_fr: '',
        address: '',
        phone: '',
        email: '',
        admin_username: '',
        admin_password: '',
        admin_full_name: '',
        admin_email: ''
      });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">{t('loading')}</div>;
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900" data-testid="dashboard-title">{t('dashboard')}</h1>
                <p className="text-sm text-gray-500">{user.full_name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Language Switcher */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const langs = ['ar', 'fr', 'en'];
                  const currentIndex = langs.indexOf(i18n.language);
                  const nextLang = langs[(currentIndex + 1) % langs.length];
                  changeLanguage(nextLang);
                }}
                data-testid="language-toggle"
              >
                <Globe className="w-4 h-4 mr-2" />
                {i18n.language.toUpperCase()}
              </Button>
              <Button variant="outline" size="sm" onClick={onLogout} data-testid="logout-button">
                <LogOut className="w-4 h-4 mr-2" />
                {t('logout')}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="stat-card" data-testid="total-schools-stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('total_schools')}</p>
                <h3 className="text-3xl font-bold text-gray-900">{stats?.total_schools || 0}</h3>
              </div>
              <div className="w-14 h-14 bg-purple-100 rounded-full flex items-center justify-center">
                <School className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>

          <div className="stat-card" data-testid="total-teachers-stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('total_teachers')}</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats?.schools?.reduce((acc, s) => acc + s.teacher_count, 0) || 0}
                </h3>
              </div>
              <div className="w-14 h-14 bg-indigo-100 rounded-full flex items-center justify-center">
                <Users className="w-7 h-7 text-indigo-600" />
              </div>
            </div>
          </div>

          <div className="stat-card" data-testid="total-students-stat">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{t('total_students')}</p>
                <h3 className="text-3xl font-bold text-gray-900">
                  {stats?.schools?.reduce((acc, s) => acc + s.student_count, 0) || 0}
                </h3>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                <GraduationCap className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Schools List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">{t('schools')}</h2>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button data-testid="add-school-button" className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  <Plus className="w-4 h-4 mr-2" />
                  {t('add_school')}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
                <DialogHeader className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-6 -m-6 mb-6 rounded-t-lg">
                  <DialogTitle className="text-2xl">{t('add_school')}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSchool} className="space-y-4 mt-4 p-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-gray-800 font-semibold">{t('school_name')}</Label>
                      <Input
                        data-testid="school-name-input"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                        className="border-2 focus:border-purple-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-gray-800 font-semibold">{t('school_name_ar')}</Label>
                      <Input
                        value={formData.name_ar}
                        onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('school_name_fr')}</Label>
                      <Input
                        value={formData.name_fr}
                        onChange={(e) => setFormData({ ...formData, name_fr: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('phone')}</Label>
                      <Input
                        data-testid="school-phone-input"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('email')}</Label>
                      <Input
                        type="email"
                        data-testid="school-email-input"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>{t('address')}</Label>
                      <Input
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-4">{t('admin_info')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>{t('admin_username')}</Label>
                        <Input
                          data-testid="admin-username-input"
                          value={formData.admin_username}
                          onChange={(e) => setFormData({ ...formData, admin_username: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin_password')}</Label>
                        <Input
                          type="password"
                          data-testid="admin-password-input"
                          value={formData.admin_password}
                          onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('admin_full_name')}</Label>
                        <Input
                          data-testid="admin-fullname-input"
                          value={formData.admin_full_name}
                          onChange={(e) => setFormData({ ...formData, admin_full_name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>{t('email')}</Label>
                        <Input
                          type="email"
                          value={formData.admin_email}
                          onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end pt-4">
                    <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)}>
                      {t('cancel')}
                    </Button>
                    <Button type="submit" data-testid="submit-school-button">{t('save')}</Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="overflow-x-auto">
            <table className="data-table" data-testid="schools-table">
              <thead>
                <tr>
                  <th>{t('school_name')}</th>
                  <th>{t('phone')}</th>
                  <th>{t('email')}</th>
                  <th>{t('total_teachers')}</th>
                  <th>{t('total_students')}</th>
                  <th>الإجراءات</th>
                </tr>
              </thead>
              <tbody>
                {stats?.schools?.map((school) => {
                  const schoolData = schools.find(s => s.id === school.school_id);
                  return (
                  <tr key={school.school_id} data-testid={`school-row-${school.school_id}`}>
                    <td className="font-semibold">{school.school_name}</td>
                    <td>
                      {schoolData?.phone || '-'}
                    </td>
                    <td>
                      {schoolData?.email || '-'}
                    </td>
                    <td>
                      <span className="badge badge-info">{school.teacher_count}</span>
                    </td>
                    <td>
                      <span className="badge badge-success">{school.student_count}</span>
                    </td>
                    <td>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={async () => {
                            const newName = prompt('اسم المدرسة الجديد:', school.school_name);
                            const newPhone = prompt('رقم الهاتف الجديد:', schoolData?.phone);
                            const newEmail = prompt('البريد الإلكتروني الجديد:', schoolData?.email);
                            if (newName || newPhone || newEmail) {
                              try {
                                await axios.put(`/schools/${school.school_id}`, {
                                  name: newName || school.school_name,
                                  phone: newPhone || schoolData?.phone,
                                  email: newEmail || schoolData?.email
                                });
                                toast.success('تم تحديث المدرسة بنجاح!');
                                fetchData();
                              } catch (error) {
                                toast.error('خطأ في التحديث');
                              }
                            }
                          }}
                        >
                          تعديل
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={async () => {
                            if (confirm('هل أنت متأكد من حذف هذه المدرسة؟ سيتم تعطيل جميع المستخدمين المرتبطين بها.')) {
                              try {
                                await axios.delete(`/schools/${school.school_id}`);
                                toast.success('تم حذف المدرسة بنجاح!');
                                fetchData();
                              } catch (error) {
                                toast.error('خطأ في الحذف');
                              }
                            }
                          }}
                        >
                          حذف
                        </Button>
                      </div>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
            {stats?.schools?.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                {t('no_data')}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;