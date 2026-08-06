'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { UserProfile, UserRole } from '@/types';
import { validatePasswordStrength } from '@/lib/cryptoOtp';

export interface RegisteredAccount extends UserProfile {
  password?: string;
  email_verified?: boolean;
}

const SUPERADMIN_1_EMAIL = (process.env.SUPERADMIN1_EMAIL || process.env.NEXT_PUBLIC_SUPERADMIN_1_EMAIL || 'incharge@tgpcet.ac.in').toLowerCase();
const SUPERADMIN_1_PASSWORD = process.env.SUPERADMIN1_PASSWORD || process.env.NEXT_PUBLIC_SUPERADMIN_1_PASSWORD || 'demo123';

const SUPERADMIN_2_EMAIL = (process.env.SUPERADMIN2_EMAIL || process.env.NEXT_PUBLIC_SUPERADMIN_2_EMAIL || 'darshan@tgpcet.ac.in').toLowerCase();
const SUPERADMIN_2_PASSWORD = process.env.SUPERADMIN2_PASSWORD || process.env.NEXT_PUBLIC_SUPERADMIN_2_PASSWORD || 'demo123';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  registeredUsers: Record<string, RegisteredAccount>;
  login: (emailOrPhone: string, pass: string) => Promise<{ success: boolean; message: string; role?: UserRole }>;
  checkEmailAvailable: (email: string, phone?: string) => { available: boolean; message?: string };
  sendOtp: (email: string, purpose?: 'registration' | 'forgot_password' | 'change_password') => Promise<{ success: boolean; message: string; devOtp?: string }>;
  verifyOtp: (email: string, otp: string, purpose?: string) => Promise<{ success: boolean; message: string }>;
  registerUser: (data: Partial<RegisteredAccount>) => Promise<{ success: boolean; message: string; userId?: string; registeredUser?: RegisteredAccount }>;
  resetPasswordWithOtp: (email: string, otp: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  changePasswordWithOtp: (currentPass: string, otp: string, newPass: string) => Promise<{ success: boolean; message: string }>;
  resendVerificationEmail: (email: string) => Promise<{ success: boolean; message: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<boolean>;
  isUser: boolean;
  isSuperAdmin1: boolean; // IDEA LAB Incharge (Dr. Neeraj Waijode)
  isSuperAdmin2: boolean; // Developer (Darshan)
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Initial Pre-Configured SuperAdmin Accounts
const DEFAULT_PRESETS: Record<string, RegisteredAccount> = {
  [SUPERADMIN_1_EMAIL]: {
    id: 'incharge-uuid-001',
    first_name: 'Dr. Neeraj',
    middle_name: '',
    last_name: 'Waijode',
    email: SUPERADMIN_1_EMAIL,
    phone: '+91 9876543210',
    college_id: 'FAC-IDEA-01',
    college_name: 'Tulsiramji Gaikwad Patil College of Engineering & Technology',
    current_education: 'Other',
    gender: 'Male',
    address: 'IDEA LAB TGPCET Campus, Nagpur',
    role: 'superadmin_1',
    password: SUPERADMIN_1_PASSWORD,
    email_verified: true,
  },
  [SUPERADMIN_2_EMAIL]: {
    id: 'developer-uuid-002',
    first_name: 'Darshan',
    middle_name: '',
    last_name: 'Developer',
    email: SUPERADMIN_2_EMAIL,
    phone: '+91 9123456789',
    college_id: 'CSI-2026-001',
    college_name: 'Tulsiramji Gaikwad Patil College of Engineering & Technology',
    current_education: 'B.Tech',
    gender: 'Male',
    address: 'DRT-VERSE HQ, Nagpur',
    role: 'superadmin_2',
    password: SUPERADMIN_2_PASSWORD,
    email_verified: true,
  },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [registeredUsers, setRegisteredUsers] = useState<Record<string, RegisteredAccount>>(DEFAULT_PRESETS);

  // Trigger SuperAdmin initialization API check on mount
  useEffect(() => {
    fetch('/api/auth/init-superadmins', { method: 'POST' }).catch(() => {});
  }, []);

  // Load registered users registry & session on mount
  useEffect(() => {
    try {
      const storedRegistry = localStorage.getItem('idea_lab_registered_users');
      if (storedRegistry) {
        const parsed = JSON.parse(storedRegistry);
        setRegisteredUsers({ ...DEFAULT_PRESETS, ...parsed });
      } else {
        localStorage.setItem('idea_lab_registered_users', JSON.stringify(DEFAULT_PRESETS));
      }
    } catch (e) {
      console.error('Error reading registered users registry:', e);
    }

    // Check saved active session
    const savedUser = localStorage.getItem('idea_lab_user');
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error('Error parsing stored user session:', e);
      }
    }

    setLoading(false);
  }, []);

  // Helper to persist registered accounts
  const persistRegisteredUsers = (updated: Record<string, RegisteredAccount>) => {
    setRegisteredUsers(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('idea_lab_registered_users', JSON.stringify(updated));
    }
  };

  // 1. CHECK EMAIL / PHONE AVAILABILITY
  const checkEmailAvailable = (email: string, phone?: string): { available: boolean; message?: string } => {
    const cleanEmail = email.toLowerCase().trim();
    const cleanPhone = phone?.trim();

    const existingKey = Object.keys(registeredUsers).find((k) => {
      const u = registeredUsers[k];
      if (u.email?.toLowerCase() === cleanEmail) return true;
      if (cleanPhone && u.phone && u.phone.replace(/\s+/g, '') === cleanPhone.replace(/\s+/g, '')) return true;
      return false;
    });

    if (existingKey) {
      return {
        available: false,
        message: 'An account with this email or phone number already exists! Please log in.',
      };
    }
    return { available: true };
  };

  // 2. LOGIN FLOW (Email + Password, Check Verification, Route by Role)
  const login = async (emailOrPhone: string, pass: string): Promise<{ success: boolean; message: string; role?: UserRole }> => {
    setLoading(true);
    const query = emailOrPhone.toLowerCase().trim();

    const matchedKey = Object.keys(registeredUsers).find((k) => {
      const u = registeredUsers[k];
      if (u.email?.toLowerCase() === query) return true;
      if (u.phone && u.phone.replace(/\s+/g, '') === query.replace(/\s+/g, '')) return true;
      return false;
    });

    if (matchedKey && registeredUsers[matchedKey]) {
      const targetUser = registeredUsers[matchedKey];

      // Password Validation
      if (targetUser.password) {
        if (!pass || targetUser.password !== pass.trim()) {
          setLoading(false);
          return { success: false, message: 'Incorrect password! Please check your credentials or reset your password.' };
        }
      }

      // Check Email Verification
      if (targetUser.email_verified === false) {
        setLoading(false);
        return {
          success: false,
          message: 'Please verify your email first before signing in.',
        };
      }

      const sessionUser: UserProfile = {
        id: targetUser.id,
        first_name: targetUser.first_name,
        middle_name: targetUser.middle_name,
        last_name: targetUser.last_name,
        email: targetUser.email,
        phone: targetUser.phone,
        college_id: targetUser.college_id,
        college_name: targetUser.college_name,
        current_education: targetUser.current_education,
        gender: targetUser.gender,
        address: targetUser.address,
        avatar_url: targetUser.avatar_url,
        resume_url: targetUser.resume_url,
        role: targetUser.role,
        email_verified: true,
      };

      setUser(sessionUser);
      localStorage.setItem('idea_lab_user', JSON.stringify(sessionUser));
      setLoading(false);
      return { success: true, message: `Welcome back, ${sessionUser.first_name}!`, role: sessionUser.role };
    }

    setLoading(false);
    return {
      success: false,
      message: 'Account not found! No registration history found for this email. You must register first before logging in.',
    };
  };

  // 3. SEND OTP (Email OTP for Forgot Password / Registration / Change Password)
  const sendOtp = async (email: string, purpose: 'registration' | 'forgot_password' | 'change_password' = 'forgot_password'): Promise<{ success: boolean; message: string; devOtp?: string }> => {
    try {
      const res = await fetch('/api/auth/otp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, purpose }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message, devOtp: data.devOtp };
    } catch (e) {
      return { success: false, message: 'Failed to send OTP. Please check server network connection.' };
    }
  };

  // 4. VERIFY OTP
  const verifyOtp = async (email: string, otp: string, purpose: string = 'forgot_password'): Promise<{ success: boolean; message: string }> => {
    try {
      const res = await fetch('/api/auth/otp/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, purpose }),
      });
      const data = await res.json();
      return { success: data.success, message: data.message };
    } catch (e) {
      return { success: false, message: 'Failed to verify OTP. Please try again.' };
    }
  };

  // 5. REGISTER USER (Create account, set role: 'user', mark verified after OTP)
  const registerUser = async (data: Partial<RegisteredAccount>): Promise<{ success: boolean; message: string; userId?: string; registeredUser?: RegisteredAccount }> => {
    if (!data.email || !data.password) {
      return { success: false, message: 'Email and Password are required.' };
    }

    const passValidation = validatePasswordStrength(data.password);
    if (!passValidation.valid) {
      return { success: false, message: passValidation.message || 'Password does not meet security requirements.' };
    }

    const cleanEmail = data.email.toLowerCase().trim();
    const year = new Date().getFullYear();
    const randomDigits = Math.floor(100000 + Math.random() * 900000);
    const generatedId = data.college_id && data.college_id.trim() ? data.college_id.trim() : `IDEA-${year}-${randomDigits}`;

    const newUser: RegisteredAccount = {
      id: generatedId,
      first_name: data.first_name || cleanEmail.split('@')[0],
      middle_name: data.middle_name || '',
      last_name: data.last_name || 'Innovator',
      email: cleanEmail,
      phone: data.phone || '',
      college_id: data.college_id || generatedId,
      college_name: 'Tulsiramji Gaikwad Patil College of Engineering & Technology',
      current_education: data.current_education || 'B.Tech',
      gender: data.gender || 'None',
      address: data.address || 'None',
      role: 'user',
      password: data.password,
      email_verified: true, // Marked verified upon OTP completion
      created_at: new Date().toISOString(),
    };

    const updated = { ...registeredUsers, [cleanEmail]: newUser };
    persistRegisteredUsers(updated);

    return {
      success: true,
      message: 'Registration complete! Your account & ID have been created successfully.',
      userId: generatedId,
      registeredUser: newUser,
    };
  };

  // 6. FORGOT PASSWORD: SET NEW PASSWORD WITH OTP
  const resetPasswordWithOtp = async (email: string, otp: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    const cleanEmail = email.toLowerCase().trim();

    // Validate OTP
    const otpRes = await verifyOtp(cleanEmail, otp, 'forgot_password');
    if (!otpRes.success) {
      return otpRes;
    }

    // Validate Password Strength
    const passVal = validatePasswordStrength(newPass);
    if (!passVal.valid) {
      return { success: false, message: passVal.message || 'Password strength requirement not met.' };
    }

    if (!registeredUsers[cleanEmail]) {
      return { success: false, message: 'No registered account found for this email.' };
    }

    const updatedRegistry = {
      ...registeredUsers,
      [cleanEmail]: {
        ...registeredUsers[cleanEmail],
        password: newPass,
      },
    };
    persistRegisteredUsers(updatedRegistry);

    // Invalidate active sessions
    if (user?.email?.toLowerCase() === cleanEmail) {
      await logout();
    }

    return { success: true, message: 'Password updated successfully! Please log in with your new password.' };
  };

  // 7. CHANGE PASSWORD INSIDE SETTINGS (Current Pass -> Verify -> OTP -> Enter New Pass -> Invalidate -> Logout)
  const changePasswordWithOtp = async (currentPass: string, otp: string, newPass: string): Promise<{ success: boolean; message: string }> => {
    if (!user || !user.email) {
      return { success: false, message: 'You must be logged in to change your password.' };
    }

    const cleanEmail = user.email.toLowerCase().trim();
    const account = registeredUsers[cleanEmail];

    // Verify Current Password
    if (account && account.password && account.password !== currentPass) {
      return { success: false, message: 'Current password is incorrect! Please verify your current password.' };
    }

    // Verify OTP
    const otpRes = await verifyOtp(cleanEmail, otp, 'change_password');
    if (!otpRes.success) {
      return otpRes;
    }

    // Validate Password Strength
    const passVal = validatePasswordStrength(newPass);
    if (!passVal.valid) {
      return { success: false, message: passVal.message || 'New password does not meet security requirements.' };
    }

    const updatedRegistry = {
      ...registeredUsers,
      [cleanEmail]: {
        ...account,
        password: newPass,
      },
    };
    persistRegisteredUsers(updatedRegistry);

    // Invalidate active session & require re-login
    await logout();

    return { success: true, message: 'Password updated successfully! Previous sessions invalidated. Please log in again.' };
  };

  // 8. RESEND VERIFICATION EMAIL
  const resendVerificationEmail = async (email: string): Promise<{ success: boolean; message: string }> => {
    return sendOtp(email, 'registration');
  };

  // 9. LOGOUT
  const logout = async () => {
    setUser(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('idea_lab_user');
    }
    try {
      await supabase.auth.signOut();
    } catch (e) {}
  };

  // 10. UPDATE PROFILE
  const updateProfile = async (data: Partial<UserProfile>): Promise<boolean> => {
    if (!user) return false;
    const oldEmailKey = user.email ? user.email.toLowerCase().trim() : '';
    const updated = { ...user, ...data };
    const newEmailKey = updated.email ? updated.email.toLowerCase().trim() : '';
    setUser(updated);
    localStorage.setItem('idea_lab_user', JSON.stringify(updated));

    if (oldEmailKey) {
      const updatedRegistry = { ...registeredUsers };
      const existingAccount = updatedRegistry[oldEmailKey] || { ...updated, password: 'demo123' };
      if (oldEmailKey !== newEmailKey && newEmailKey) {
        delete updatedRegistry[oldEmailKey];
      }
      updatedRegistry[newEmailKey || oldEmailKey] = {
        ...existingAccount,
        ...updated,
      };
      persistRegisteredUsers(updatedRegistry);
    }
    return true;
  };

  // Role Checks
  const currentRole = user?.role?.toLowerCase();
  const isUser = currentRole === 'user' || currentRole === 'student';
  const isSuperAdmin1 = currentRole === 'superadmin_1' || currentRole === 'admin_incharge' || user?.email?.toLowerCase() === SUPERADMIN_1_EMAIL;
  const isSuperAdmin2 = currentRole === 'superadmin_2' || currentRole === 'admin_developer' || user?.email?.toLowerCase() === SUPERADMIN_2_EMAIL;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        registeredUsers,
        login,
        checkEmailAvailable,
        sendOtp,
        verifyOtp,
        registerUser,
        resetPasswordWithOtp,
        changePasswordWithOtp,
        resendVerificationEmail,
        logout,
        updateProfile,
        isUser,
        isSuperAdmin1,
        isSuperAdmin2,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
