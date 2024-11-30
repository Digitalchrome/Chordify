import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { supabase } from '../../lib/supabase';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [showResendButton, setShowResendButton] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);
  const resetPassword = useAuthStore((state) => state.resetPassword);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const result = await signIn(email.trim().toLowerCase(), password);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Failed to sign in');
        // If the error indicates email verification is needed, show the resend button
        if (result.needsVerification) {
          setShowResendButton(true);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email.trim()) {
      setError('Please enter your email address to reset your password');
      return;
    }

    setError('');
    setSuccess('');
    setIsResetting(true);

    try {
      const result = await resetPassword(email);
      if (result.success) {
        setSuccess(result.message);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!email.trim()) {
      setError('Please enter your email address to delete the account');
      return;
    }

    setError('');
    setSuccess('');
    setIsDeleting(true);

    try {
      const result = await deleteAccount(email);
      if (result.success) {
        setSuccess(result.message);
        // Clear the form
        setPassword('');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Failed to delete account. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleResendVerification = async () => {
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim().toLowerCase(),
      });

      if (error) {
        setError('Failed to resend verification email. Please try signing up again.');
      } else {
        setSuccess('Verification email resent! Please check your inbox and spam folder.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsResending(false);
    }
  };

  const isProcessing = isLoading || isResetting || isDeleting;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-bold text-white mb-6">Login to Chordify</h2>
        {error && (
          <div className="bg-red-500 text-white p-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-500 text-white p-3 rounded mb-4">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-gray-300 mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
              disabled={isProcessing}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-gray-300 mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 rounded bg-gray-700 text-white border border-gray-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              required
              disabled={isProcessing}
            />
          </div>
          <div className="space-y-2">
            <button
              type="submit"
              className={`w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isProcessing}
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={handleResetPassword}
              className={`w-full bg-gray-600 text-white p-2 rounded hover:bg-gray-700 transition-colors ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isProcessing}
            >
              {isResetting ? 'Sending Reset Email...' : 'Reset Password'}
            </button>
            <button
              type="button"
              onClick={handleDeleteAccount}
              className={`w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 transition-colors ${
                isProcessing ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              disabled={isProcessing}
            >
              {isDeleting ? 'Deleting Account...' : 'Delete Account & Start Fresh'}
            </button>
            {showResendButton && !success && (
              <button
                type="button"
                onClick={handleResendVerification}
                className={`w-full mt-2 bg-green-600 text-white p-2 rounded hover:bg-green-700 transition-colors ${
                  isResending ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                disabled={isResending}
              >
                {isResending ? 'Resending...' : 'Resend Verification Email'}
              </button>
            )}
          </div>
          <div className="mt-4 text-center">
            <span className="text-gray-400">Don't have an account? </span>
            <Link to="/signup" className="text-blue-500 hover:text-blue-400 transition-colors">
              Sign up
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
