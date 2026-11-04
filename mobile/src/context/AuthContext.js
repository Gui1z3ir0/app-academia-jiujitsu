import React, { createContext, useState, useEffect, useContext } from 'react';
import { dataService } from '../services/dataService';
import { storage } from '../services/storage';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentRole, setCurrentRole] = useState(null);
  const [hasAdmin, setHasAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    bootstrapAuth();
  }, []);

  async function bootstrapAuth() {
    try {
      setIsLoading(true);
      const adminExists = await dataService.hasAdmin();
      setHasAdmin(adminExists);

      const savedUser = await storage.get('auth_session_user', null);
      const savedRole = await storage.get('auth_session_role', null);

      if (savedUser && savedRole) {
        setCurrentUser(savedUser);
        setCurrentRole(savedRole);
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  }

  async function login(email, password) {
    const result = await dataService.loginUser(email, password);
    if (result.success) {
      setCurrentUser(result.user);
      setCurrentRole(result.role);
      await storage.set('auth_session_user', result.user);
      await storage.set('auth_session_role', result.role);
      const adminExists = await dataService.hasAdmin();
      setHasAdmin(adminExists);
    }
    return result;
  }

  async function registerStudent(studentData) {
    const result = await dataService.registerStudent(studentData);
    if (result.success) {
      setCurrentUser(result.user);
      setCurrentRole('student');
      await storage.set('auth_session_user', result.user);
      await storage.set('auth_session_role', 'student');
    }
    return result;
  }

  async function registerOwner(ownerData) {
    const result = await dataService.registerOwnerAccount(ownerData);
    if (result.success) {
      setCurrentUser(result.user);
      setCurrentRole('admin');
      setHasAdmin(true);
      await storage.set('auth_session_user', result.user);
      await storage.set('auth_session_role', 'admin');
    }
    return result;
  }

  async function logout() {
    setCurrentUser(null);
    setCurrentRole(null);
    await storage.remove('auth_session_user');
    await storage.remove('auth_session_role');
    const adminExists = await dataService.hasAdmin();
    setHasAdmin(adminExists);
  }

  async function refreshAdminStatus() {
    const adminExists = await dataService.hasAdmin();
    setHasAdmin(adminExists);
    return adminExists;
  }

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        isLoggedIn: !!currentUser,
        hasAdmin,
        isLoading,
        login,
        registerStudent,
        registerOwner,
        logout,
        refreshAdminStatus
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser utilizado dentro de AuthProvider');
  }
  return context;
}
