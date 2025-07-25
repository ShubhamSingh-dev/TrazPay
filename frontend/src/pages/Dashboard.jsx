import { useEffect, useState } from "react";
import axios from "axios";
import { Appbar } from "../components/AppBar";
import { Balance } from "../components/Balance";
import { Users } from "../components/Users";

const Dashboard = () => {
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const response = await axios.get(
          "http://localhost:8080/api/v1/account/balance",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setBalance(response.data.balance);
      } catch (err) {
        console.error("Failed to fetch balance:", err);
        setError("Failed to load balance. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Appbar />
      <div className="m-8">
        {loading ? (
          <div>Loading balance...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <Balance value={balance} />
        )}
        <Users />
      </div>
    </div>
  );
};

export default Dashboard;
