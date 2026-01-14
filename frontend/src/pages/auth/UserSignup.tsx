import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, UserPlus } from 'lucide-react';
import { Button, Input } from '../../components/ui';
import { useAuthStore } from '../../store/authStore';
import { authService } from '../../services/api';

export const UserSignup: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.signup({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        city: formData.city,
        role: 'CUSTOMER',
      });

      // Signup returns user data with JWT cookie automatically set
      const user = {
        userId: response.userId,
        name: response.name,
        email: response.email,
        role: response.role,
      };

      login(user);
      
      // Redirect to user dashboard
      navigate('/user');
    } catch (err: any) {
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-900 via-primary-900 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-32 h-12 rounded-2xl mb-4">
            <img src="/logo.png" alt="Logo" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
          <p className="text-gray-300">Join us today</p>
        </div>

        {/* Signup Form */}
        <div className="card p-8 backdrop-blur-sm bg-white/95">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            <Input
              type="text"
              label="Full Name"
              placeholder="John Doe"
              icon={<User className="w-5 h-5" />}
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <Input
              type="email"
              label="Email Address"
              placeholder="you@example.com"
              icon={<Mail className="w-5 h-5" />}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />

            <Input
              type="tel"
              label="Phone Number"
              placeholder="+91 9999999999"
              icon={<Phone className="w-5 h-5" />}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />

            <Input
              type="text"
              label="City"
              placeholder="Mumbai"
              icon={<MapPin className="w-5 h-5" />}
              value={formData.city}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
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

            <Input
              type="password"
              label="Confirm Password"
              placeholder="••••••••"
              icon={<Lock className="w-5 h-5" />}
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isLoading}
              icon={<UserPlus className="w-5 h-5" />}
            >
              Create Account
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
