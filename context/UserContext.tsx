"use client";

//全ページでセッション情報を簡単に取得できるようにする
import { createContext, useContext, ReactNode } from "react"
import { User } from "@supabase/supabase-js"

interface UserContextType {
  user: User | null
}

const UserContext = createContext<UserContextType | undefined>(undefined)

export const useUser = (): UserContextType => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

interface UserProviderProps {
  user?: User | null; // user プロパティをオプショナルに変更
  children: ReactNode;
}

export const UserProvider = ({ user = null, children }: UserProviderProps) => {
  return <UserContext.Provider value={{ user }}>{children}</UserContext.Provider>;
};
