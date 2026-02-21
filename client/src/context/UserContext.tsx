import React, { createContext, ReactNode, useState } from "react";

interface UserContextType {
  user: string | null;
  setUser: React.Dispatch<React.SetStateAction<string | null>>;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

interface Props {
  children: ReactNode;
}

const UserDataProvider = ({ children }: Props) => {
  const [user, setUser] = useState<string | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserDataProvider;