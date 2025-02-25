import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getUserAllDetails } from "@/libs/user/getUserAllDetails"; // Adjust the import path

// Define User Context Interface
interface UserContextType {
  userDetails: any | null;
  loading: boolean;
  refreshUserData: () => void;
  setUserData: (data: any) => void;
}

// Create Context with Default Values
const UserContext = createContext<UserContextType>({
  userDetails: null,
  loading: true,
  refreshUserData: () => {},
  setUserData: () => {},
});

// Context Provider Component
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [userDetails, setUserDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to Fetch and Set User Data
  const fetchUserDetails = async () => {
    setLoading(true);
    try {
      const userDetails = await getUserAllDetails();
      if (userDetails) {
        setUserDetails(userDetails);
      }
    } catch (error) {
      console.error("Error fetching user details:", error);
    } finally {
      setLoading(false);
    }
  };

  // Function to Manually Refresh User Data
  const refreshUserData = () => {
    fetchUserDetails();
  };

  // Fetch user details when the app loads
  useEffect(() => {
    fetchUserDetails();
  }, []);

  return (
    <UserContext.Provider value={{ userDetails, loading, refreshUserData, setUserData: setUserDetails }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom Hook to Access User Data
export const useUser = () => useContext(UserContext);
