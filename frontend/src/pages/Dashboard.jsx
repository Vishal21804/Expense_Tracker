import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Dashboard = () => {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard");
        setDashboard(response.data);
      } catch (error) {
        console.error("Dashboard Error:", error);

        if (error.response?.status === 401) {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
          return;
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2 className="text-2xl font-semibold">Loading Dashboard...</h2>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="flex justify-center items-center h-screen">
        <h2 className="text-red-600 text-2xl font-semibold">
          Dashboard could not be loaded.
        </h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Total Budget</h3>
          <h2 className="text-2xl font-bold">₹{dashboard.total_budget ?? 0}</h2>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Total Expenses</h3>
          <h2 className="text-2xl font-bold">
            ₹{dashboard.total_expense ?? 0}
          </h2>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Remaining Budget</h3>
          <h2 className="text-2xl font-bold">
            ₹{dashboard.remaining_budget ?? 0}
          </h2>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Transactions</h3>
          <h2 className="text-2xl font-bold">
            {dashboard.total_transactions ?? 0}
          </h2>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Category Summary</h2>

        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Category</th>
              <th className="text-left py-2">Amount</th>
            </tr>
          </thead>

          <tbody>
            {dashboard.category_summary?.length > 0 ? (
              dashboard.category_summary.map((item, index) => (
                <tr key={index} className="border-b">
                  <td className="py-2">{item.category}</td>
                  <td>₹{item.amount}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="2" className="py-4 text-center text-gray-500">
                  No expenses available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
