import { useEffect, useState } from "react";
import api from "../services/api";

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const response = await api.get("/dashboard");
      setDashboard(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
  return <h2 className="text-center mt-10">Loading Dashboard...</h2>;
}

if (!dashboard) {
  return (
    <div className="p-6">
      <h2 className="text-red-600 text-xl">
        Dashboard could not be loaded (401 Unauthorized)
      </h2>
    </div>
  );
}

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-4 gap-6 mb-8">
        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Total Budget</h3>
          <h2 className="text-2xl font-bold">₹{dashboard.total_budget}</h2>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Total Expenses</h3>
          <h2 className="text-2xl font-bold">₹{dashboard.total_expense}</h2>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Remaining Budget</h3>
          <h2 className="text-2xl font-bold">₹{dashboard.remaining_budget}</h2>
        </div>

        <div className="bg-white shadow rounded-xl p-5">
          <h3 className="text-gray-500">Transactions</h3>
          <h2 className="text-2xl font-bold">{dashboard.total_transactions}</h2>
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-6">
        <h2 className="text-xl font-semibold mb-4">Category Summary</h2>

        <table className="w-full">
          <thead>
            <tr>
              <th className="text-left">Category</th>
              <th className="text-left">Amount</th>
            </tr>
          </thead>

          <tbody>
            {dashboard.category_summary.map((item, index) => (
              <tr key={index}>
                <td className="py-2">{item.category}</td>
                <td>₹{item.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
