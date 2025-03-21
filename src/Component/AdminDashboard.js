import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Users, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  ChevronUp, 
  Download, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
  Bell, 
  Search, 
  Settings, 
  Eye
} from "lucide-react";

const AdminDashboard = ({ isAdmin }) => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("deposits");
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      message: "New deposit request received",
      time: "5 mins ago",
      read: false,
    },
    {
      id: 2,
      message: "Withdraw request pending approval",
      time: "1 hour ago",
      read: false,
    },
    {
      id: 3,
      message: "System maintenance scheduled tonight",
      time: "2 hours ago",
      read: true,
    },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    pendingDeposits: 0,
    pendingWithdrawals: 0,
  });

  const navigate = useNavigate();

  useEffect(() => {
    if (!isAdmin) {
      navigate("/login");
    } else {
      fetchUsers();
    }
  }, [isAdmin, navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/transactions");
      if (!response.ok) throw new Error("Error fetching user data");
      const data = await response.json();
      setUsers(data);

      // Calculate statistics
      const depositTransactions = data.filter(
        (user) => user.type === "deposit"
      );
      const withdrawTransactions = data.filter(
        (user) => user.type === "withdraw"
      );
      setStats({
        totalDeposits: depositTransactions.length,
        totalWithdrawals: withdrawTransactions.length,
        pendingDeposits: depositTransactions.filter(
          (t) => t.status !== "approved"
        ).length,
        pendingWithdrawals: withdrawTransactions.filter(
          (t) => t.status !== "approved"
        ).length,
      });

      setLoading(false);
    } catch (error) {
      console.error("Error fetching user data:", error);
      setLoading(false);
    }
  };

  const handleDepositAction = async (
    user_id,
    amount,
    transaction_id,
    action
  ) => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/depositConfirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, amount, transaction_id }),
      });

      const result = await response.json();
      if (response.ok) {
        showNotificationToast(`Deposit ${action} for User ID: ${user_id}`);
        fetchUsers(); // Refresh user data
      } else {
        showNotificationToast(`Error: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error in deposit API:", error);
      showNotificationToast("Error processing the request.", "error");
    } finally {
      setLoading(false);
    }

    setSelectedUser({ user_id, amount, transaction_id });
    setModalType("deposit");
    setShowModal(true);
  };

  const handleWithdrawAction = async (user_id, amount, transaction_id) => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/withdrawConfirm", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, amount, transaction_id }),
      });

      const result = await response.json();
      if (response.ok) {
        showNotificationToast(`Withdraw accepted for User ID: ${user_id}`);
        fetchUsers(); // Refresh user data
      } else {
        showNotificationToast(`Error: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error in withdraw API:", error);
      showNotificationToast("Error processing the request.", "error");
    } finally {
      setLoading(false);
    }

    setSelectedUser({ user_id, amount, transaction_id });
    setModalType("withdraw");
    setShowModal(true);
  };

  const handleWithDrawDeclineAction = async (user_id, transaction_id) => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/withdrawDecline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, transaction_id }),
      });

      const result = await response.json();
      if (response.ok) {
        showNotificationToast(`Withdrawal declined for User ID: ${user_id}`);
        fetchUsers();
      } else {
        showNotificationToast(`Error: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error declining request:", error);
      showNotificationToast("Error processing the request.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDepositDeclineAction = async (user_id, transaction_id) => {
    try {
      setLoading(true);
      const response = await fetch("http://127.0.0.1:5000/depositDecline", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ user_id, transaction_id }),
      });

      const result = await response.json();
      if (response.ok) {
        showNotificationToast(`Deposit declined for User ID: ${user_id}`);
        fetchUsers();
      } else {
        showNotificationToast(`Error: ${result.message}`, "error");
      }
    } catch (error) {
      console.error("Error declining request:", error);
      showNotificationToast("Error processing the request.", "error");
    } finally {
      setLoading(false);
    }
  };

  const showNotificationToast = (message, type = "success") => {
    const newNotification = {
      id: Date.now(),
      message,
      time: "Just now",
      read: false,
      type,
    };
    setNotifications((prev) => [newNotification, ...prev]);

    // Show temporary toast
    const toast = document.createElement("div");
    toast.className = `fixed bottom-4 right-4 p-4 rounded-lg shadow-lg ${
      type === "success" ? "bg-green-500" : "bg-red-500"
    } text-white flex items-center space-x-2 animate-fade-in z-50`;

    const icon = document.createElement("span");
    icon.innerHTML =
      type === "success"
        ? '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>'
        : '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>';

    const text = document.createElement("span");
    text.textContent = message;

    toast.appendChild(icon);
    toast.appendChild(text);
    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("animate-fade-out");
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 500);
    }, 3000);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const filterUsers = (users, query) => {
    if (!query) return users;
    const lowerQuery = query.toLowerCase();
    return users.filter(
      (user) =>
        user.user_id.toString().includes(lowerQuery) ||
        user.transaction_id.toString().includes(lowerQuery) ||
        (user.account_number &&
          user.account_number.toString().includes(lowerQuery))
    );
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
  };

  const filteredDepositUsers = filterUsers(
    users.filter((user) => user.type === "deposit"),
    searchQuery
  );

  const filteredWithdrawUsers = filterUsers(
    users.filter((user) => user.type === "withdraw"),
    searchQuery
  );

  // Logout function
  const handleLogout = () => {
    // Here you would clear any auth tokens/state
    navigate("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "block" : "hidden"
        } md:block bg-indigo-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform md:relative md:translate-x-0 transition duration-200 ease-in-out z-20`}
      >
        <div className="flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <svg
              className="h-8 w-8 text-indigo-300"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 7H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M5 12H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M5 17H19"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-2xl font-semibold">Admin Panel</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="mt-10">
          <a
            className={`flex items-center py-2 px-4 rounded transition duration-200 hover:bg-indigo-700 ${
              activeTab === "deposits" ? "bg-indigo-700" : ""
            }`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("deposits");
            }}
          >
            <Download className="mr-3 h-5 w-5" />
            <span>Deposits</span>
            <span className="ml-auto bg-indigo-600 text-xs rounded-full px-2 py-1">
              {stats.pendingDeposits}
            </span>
          </a>
          <a
            className={`flex items-center py-2 px-4 rounded transition duration-200 hover:bg-indigo-700 ${
              activeTab === "withdrawals" ? "bg-indigo-700" : ""
            }`}
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab("withdrawals");
            }}
          >
            <Upload className="mr-3 h-5 w-5" />
            <span>Withdrawals</span>
            <span className="ml-auto bg-indigo-600 text-xs rounded-full px-2 py-1">
              {stats.pendingWithdrawals}
            </span>
          </a>
          <a
            className="flex items-center py-2 px-4 rounded transition duration-200 hover:bg-indigo-700"
            href="#"
          >
            <Users className="mr-3 h-5 w-5" />
            <span>User Management</span>
          </a>
          <a
            className="flex items-center py-2 px-4 rounded transition duration-200 hover:bg-indigo-700"
            href="#"
          >
            <Settings className="mr-3 h-5 w-5" />
            <span>Settings</span>
          </a>
          <a
            className="flex items-center py-2 px-4 rounded transition duration-200 hover:bg-indigo-700 mt-8 border-t border-indigo-700 pt-4"
            href="#"
            onClick={handleLogout}
          >
            <LogOut className="mr-3 h-5 w-5" />
            <span>Logout</span>
          </a>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white shadow-sm z-10">
          <div className="flex items-center justify-between p-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="text-gray-500 focus:outline-none md:hidden"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="relative w-64 mx-4">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                  <Search className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  className="block w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="flex items-center text-gray-500 focus:outline-none"
                >
                  <Bell className="h-6 w-6" />
                  {notifications.filter((n) => !n.read).length > 0 && (
                    <span className="absolute top-0 right-0 -mt-1 -mr-1 bg-red-500 text-white w-4 h-4 rounded-full text-xs flex items-center justify-center">
                      {notifications.filter((n) => !n.read).length}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-2 z-30">
                    <div className="flex items-center justify-between px-4 py-2 border-b">
                      <h3 className="text-lg font-semibold">Notifications</h3>
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-800"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`px-4 py-3 hover:bg-gray-100 border-b border-gray-100 ${
                              notification.read ? "opacity-70" : "font-semibold"
                            }`}
                          >
                            <div className="flex items-start">
                              <div
                                className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                                  notification.type === "error"
                                    ? "bg-red-100 text-red-500"
                                    : notification.read
                                    ? "bg-gray-100 text-gray-500"
                                    : "bg-indigo-100 text-indigo-500"
                                }`}
                              >
                                {notification.type === "error" ? (
                                  <AlertCircle className="h-5 w-5" />
                                ) : (
                                  <Bell className="h-5 w-5" />
                                )}
                              </div>
                              <div className="ml-3">
                                <p className="text-sm text-gray-800">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {notification.time}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500">
                          No notifications
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="border-l pl-4 flex items-center">
                <img
                  src="/api/placeholder/40/40"
                  alt="Admin Avatar"
                  className="h-8 w-8 rounded-full mr-2"
                />
                <span className="font-medium">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Dashboard Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          {/* Dashboard Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-indigo-100 text-indigo-600">
                  <Download className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Deposits
                  </p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {stats.totalDeposits}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span
                  className={`font-medium ${
                    stats.pendingDeposits > 0
                      ? "text-amber-500"
                      : "text-green-500"
                  }`}
                >
                  {stats.pendingDeposits} pending
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-green-100 text-green-600">
                  <Upload className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Withdrawals
                  </p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {stats.totalWithdrawals}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span
                  className={`font-medium ${
                    stats.pendingWithdrawals > 0
                      ? "text-amber-500"
                      : "text-green-500"
                  }`}
                >
                  {stats.pendingWithdrawals} pending
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-blue-100 text-blue-600">
                  <Users className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    Total Users
                  </p>
                  <p className="text-2xl font-semibold text-gray-800">
                    {new Set(users.map((user) => user.user_id)).size}
                  </p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span className="font-medium text-blue-600">
                  Active today:{" "}
                  {Math.floor(
                    new Set(users.map((user) => user.user_id)).size * 0.7
                  )}
                </span>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                  <Settings className="h-8 w-8" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">
                    System Status
                  </p>
                  <p className="text-2xl font-semibold text-gray-800">Active</p>
                </div>
              </div>
              <div className="mt-4 text-sm text-gray-500">
                <span className="font-medium text-green-500">
                  All services operational
                </span>
              </div>
            </div>
          </div>

          {/* Data Tables */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  {activeTab === "deposits"
                    ? "Deposit Transactions"
                    : "Withdraw Transactions"}
                </h2>
                <div className="flex">
                  <button
                    onClick={() => setActiveTab("deposits")}
                    className={`px-4 py-2 rounded-l-md ${
                      activeTab === "deposits"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Deposits
                  </button>
                  <button
                    onClick={() => setActiveTab("withdrawals")}
                    className={`px-4 py-2 rounded-r-md ${
                      activeTab === "withdrawals"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-100 text-gray-700"
                    }`}
                  >
                    Withdrawals
                  </button>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-10 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : activeTab === "deposits" ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Receipt
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDepositUsers.length > 0 ? (
                      filteredDepositUsers.map((user) => (
                        <tr
                          key={user.transaction_id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                {user.user_id
                                  .toString()
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  ID: {user.user_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.transaction_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${user.amount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : user.status === "declined"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {user.status || "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {user.transaction_image ? (
                              <button
                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                onClick={() =>
                                  window.open(user.transaction_image, "_blank")
                                }
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                View
                              </button>
                            ) : (
                              <span className="text-gray-500">N/A</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                className={`inline-flex items-center px-3 py-1 rounded-md ${
                                  user.status === "approved"
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                                onClick={() =>
                                  handleDepositAction(
                                    user.user_id,
                                    user.amount,
                                    user.transaction_id,
                                    "approve"
                                  )
                                }
                                disabled={user.status === "approved"}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </button>
                              <button
                                className={`inline-flex items-center px-3 py-1 rounded-md ${
                                  user.status === "approved"
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                                onClick={() =>
                                  handleDepositDeclineAction(
                                    user.user_id,
                                    user.transaction_id
                                  )
                                }
                                disabled={user.status === "approved"}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Decline
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No deposit transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Transaction ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Account Number
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredWithdrawUsers.length > 0 ? (
                      filteredWithdrawUsers.map((user) => (
                        <tr
                          key={user.transaction_id}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                                {user.user_id
                                  .toString()
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  ID: {user.user_id}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.transaction_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              ${user.amount}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                user.status === "approved"
                                  ? "bg-green-100 text-green-800"
                                  : user.status === "declined"
                                  ? "bg-red-100 text-red-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {user.status || "Pending"}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {user.account_number || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end gap-2">
                              <button
                                className={`inline-flex items-center px-3 py-1 rounded-md ${
                                  user.status === "approved"
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-green-100 text-green-700 hover:bg-green-200"
                                }`}
                                onClick={() =>
                                  handleWithdrawAction(
                                    user.user_id,
                                    user.amount,
                                    user.transaction_id
                                  )
                                }
                                disabled={user.status === "approved"}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approve
                              </button>
                              <button
                                className={`inline-flex items-center px-3 py-1 rounded-md ${
                                  user.status === "approved"
                                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                    : "bg-red-100 text-red-700 hover:bg-red-200"
                                }`}
                                onClick={() =>
                                  handleWithDrawDeclineAction(
                                    user.user_id,
                                    user.transaction_id
                                  )
                                }
                                disabled={user.status === "approved"}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Decline
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="6"
                          className="px-6 py-4 text-center text-gray-500"
                        >
                          No withdrawal transactions found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-11/12 md:w-1/2 lg:w-1/3">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {modalType === "deposit"
                  ? "Deposit Confirmation"
                  : "Withdraw Confirmation"}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Are you sure you want to{" "}
                {modalType === "deposit" ? "approve" : "decline"} this
                transaction?
              </p>
              <p className="text-sm text-gray-600 mt-2">
                User ID:{" "}
                <span className="font-medium">{selectedUser.user_id}</span>
              </p>
              <p className="text-sm text-gray-600">
                Amount:{" "}
                <span className="font-medium">${selectedUser.amount}</span>
              </p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (modalType === "deposit") {
                    handleDepositAction(
                      selectedUser.user_id,
                      selectedUser.amount,
                      selectedUser.transaction_id,
                      "approve"
                    );
                  } else {
                    handleWithdrawAction(
                      selectedUser.user_id,
                      selectedUser.amount,
                      selectedUser.transaction_id
                    );
                  }
                  closeModal();
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;