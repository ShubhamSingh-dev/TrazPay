import { useEffect, useState } from "react";
import { Button } from "./Button";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setLoading(true);
      axios
        .get(`http://localhost:8080/api/v1/user/bulk?filter=${filter}`, {
          headers: {
            Authorization: "Bearer " + localStorage.getItem("token"),
          },
        })
        .then((response) => {
          setUsers(response.data.users || []); // Correct key
          setError(null);
        })
        .catch((err) => {
          console.error(err);
          setError("Failed to load users");
          setUsers([]);
        })
        .finally(() => setLoading(false));
    }, 500);

    return () => clearTimeout(timerId);
  }, [filter]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Users</h2>

      <div className="relative mb-6">
        <input
          onChange={(e) => setFilter(e.target.value.trim())}
          type="text"
          placeholder="Search users..."
          className="w-full p-3 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
          {error}
        </div>
      )}

      <div className="space-y-3">
        {users.map((user) => (
          <UserCard key={user._id} user={user} />
        ))}
      </div>
    </div>
  );
};

function UserCard({ user }) {
  const navigate = useNavigate();
  const initials = `${user.firstName?.[0] || ""}${
    user.lastName?.[0] || ""
  }`.toUpperCase();

  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="flex items-center justify-center h-10 w-10 rounded-full bg-blue-100 text-blue-600 font-medium">
          {initials}
        </div>
        <div>
          <h3 className="font-medium text-gray-900">
            {user.firstName} {user.lastName}
          </h3>
          <p className="text-sm text-gray-500">@{user.username}</p>
        </div>
      </div>
      <div>
        <Button
          onClick={() =>
            navigate(`/send?id=${user._id}&name=${user.firstName}`)
          }
          label="Send Money"
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
        />
      </div>
    </div>
  );
}
