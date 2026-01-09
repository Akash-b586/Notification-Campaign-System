import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, LogIn, Shield } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';

export const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Mock login - Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock admin user data
      const user = {
        user_id: 'admin-1',
        name: 'Admin User',
        email: formData.email,
        role: 'admin' as const,
      };

      login(user);
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid admin credentials. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-primary-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl mb-4">
            <Shield className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Admin Portal</h1>
          <p className="text-gray-300">Secure admin access</p>
        </div>

        {/* Login Form */}
        <div className="card p-8 backdrop-blur-sm bg-white/95">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Input
              type="email"
              label="Admin Email"
              placeholder="admin@example.com"
              icon={<Mail className="w-5 h-5" />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              icon={<LogIn className="w-5 h-5" />}
            >
              Admin Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200 text-center">
            <Link to="/login" className="text-sm text-gray-600 hover:text-gray-900">
              ← Back to User Login
            </Link>
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-300">
            Only authorized administrators can access this portal
          </p>
        </div>
      </div>
    </div>
  );
};
