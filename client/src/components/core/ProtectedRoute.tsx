import React, { ReactNode, useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../context/UserContext";

interface Props {
  children: ReactNode;
}

const ProtectedRoute: React.FC<Props> = ({ children }) => {
  const { user } = useContext(UserContext)!;

  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export default ProtectedRoute;
