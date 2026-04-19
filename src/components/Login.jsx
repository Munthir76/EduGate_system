import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { GraduationCap, Globe } from 'lucide-react';

const Login = ({ onLogin }) => {
  const { t, i18n } = useTranslation();
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'super_admin'
  });
  const [loading, setLoading] = useState(false);

  const roles = [
    { value: 'super_admin', label: t('super_admin') },
    { value: 'school_admin', label: t('school_admin') },
    { value: 'teacher', label: t('teacher') },
    { value: 'student', label: t('student') },
    { value: 'parent', label: t('parent') }
  ];

  const languages = [
    { code: 'ar', name: t('arabic') },
    { code: 'fr', name: t('french') },
    { code: 'en', name: t('english') }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/auth/login', formData);
      toast.success(t('success'));
      onLogin(response.data.access_token, response.data.user);
    } catch (error) {
      toast.error(error.response?.data?.detail || t('error'));
    } finally {
      setLoading(false);
    }
  };

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    document.documentElement.dir = lng === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <div className="login-container">
      <div className="login-card" data-testid="login-card">
        {/* Language Switcher */}
        <div className="flex justify-end mb-4">
          <Select value={i18n.language} onValueChange={changeLanguage}>
            <SelectTrigger className="w-32" data-testid="language-selector">
              <Globe className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {languages.map(lang => (
                <SelectItem key={lang.code} value={lang.code} data-testid={`lang-${lang.code}`}>
                  {lang.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-full flex items-center justify-center">
              <GraduationCap className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2" data-testid="login-title">
            {t('welcome_back')}
          </h1>
          <p className="text-gray-600">{t('login_subtitle')}</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Role Selection */}
          <div className="space-y-2">
            <Label htmlFor="role" className="text-gray-700 font-semibold">
              {t('select_role')}
            </Label>
            <Select
              value={formData.role}
              onValueChange={(value) => setFormData({ ...formData, role: value })}
            >
              <SelectTrigger data-testid="role-selector">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {roles.map(role => (
                  <SelectItem key={role.value} value={role.value} data-testid={`role-${role.value}`}>
                    {role.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Username */}
          <div className="space-y-2">
            <Label htmlFor="username" className="text-gray-700 font-semibold">
              {t('username')}
            </Label>
            <Input
              id="username"
              type="text"
              data-testid="username-input"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              placeholder={t('username')}
              required
              className="h-12"
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-gray-700 font-semibold">
              {t('password')}
            </Label>
            <Input
              id="password"
              type="password"
              data-testid="password-input"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={t('password')}
              required
              className="h-12"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            data-testid="login-button"
            className="w-full h-12 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl"
            disabled={loading}
          >
            {loading ? t('loading') : t('login')}
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center">
          <a href="#" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
            {t('forgot_password')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;