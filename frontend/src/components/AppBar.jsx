import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export const Appbar = () => {
  const [userName, setUserName] = useState("User");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      const token = localStorage.getItem("token");
      console.log("Token found:", token);

      if (!token) {
        console.warn("No token found, redirecting to login...");
        navigate("/login");
        return;
      }

      try {
        console.log("Calling /me endpoint...");
        const response = await axios.get(
          "http://localhost:8080/api/v1/user/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Full response:", response);

        const user = response?.data?.user;
        console.log("Extracted user:", user);

        const nameToStore = user?.firstName ?? "User";
        setUserName(nameToStore);
        localStorage.setItem("name", nameToStore);
      } catch (error) {
        console.error("Error fetching user data:", error);
        if (error.response?.status === 401) {
          handleLogout();
        }
      }
    };

    // Always fetch fresh user data on mount
    fetchUserData();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/v1/user/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("name");
      navigate("/login");
      window.location.reload();
    }
  };

  return (
    <div className="shadow h-14 flex justify-between items-center bg-white px-4 sticky top-0 z-50">
      <div
        className="text-xl font-bold text-blue-600 cursor-pointer"
        onClick={() => navigate("/dashboard")}
      >
        TrazPay
      </div>

      <div className="relative flex items-center gap-4">
        <div className="hidden md:block text-sm">Hello, {userName}</div>

        <div
          className="relative rounded-full h-10 w-10 bg-blue-100 flex justify-center items-center cursor-pointer hover:bg-blue-200 transition-colors"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          tabIndex={0}
        >
          <div className="text-blue-600 font-medium">
            {userName[0]?.toUpperCase() || "U"}
          </div>

          {isMenuOpen && (
            <div className="absolute right-0 top-12 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                Signed in as <span className="font-medium">{userName}</span>
              </div>
              <button
                onClick={() => {
                  navigate("/profile");
                  setIsMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Your Profile
              </button>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Appbar;