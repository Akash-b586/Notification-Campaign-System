import React, { useState, useEffect } from "react";
import { Plus, Package, IndianRupee } from "lucide-react";
import { Button, Card, Table, Badge, LoadingSpinner } from "../../components/ui";
import { useNavigate } from "react-router-dom";

interface Order {
  orderId: string;
  product: string;
  amount: number;
  status: "CREATED" | "SHIPPED" | "DELIVERED" | "CANCELLED";
  date: string;
}

export const UserOrders: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading with dummy data
    setTimeout(() => {
      const dummyOrders: Order[] = [
        {
          orderId: "ORD001",
          product: "Face Cream",
          amount: 499,
          status: "DELIVERED",
          date: "2026-01-12T10:00:00Z",
        },
        {
          orderId: "ORD002",
          product: "Shampoo",
          amount: 299,
          status: "SHIPPED",
          date: "2026-01-10T14:30:00Z",
        },
        {
          orderId: "ORD003",
          product: "Body Lotion",
          amount: 399,
          status: "CREATED",
          date: "2026-01-09T09:15:00Z",
        },
        {
          orderId: "ORD004",
          product: "Hair Oil",
          amount: 249,
          status: "DELIVERED",
          date: "2026-01-08T16:45:00Z",
        },
        {
          orderId: "ORD005",
          product: "Face Wash",
          amount: 199,
          status: "CANCELLED",
          date: "2026-01-07T11:20:00Z",
        },
      ];
      setOrders(dummyOrders);
      setIsLoading(false);
    }, 500);
  }, []);

  const getStatusVariant = (status: Order["status"]) => {
    switch (status) {
      case "DELIVERED":
        return "success";
      case "SHIPPED":
        return "info";
      case "CREATED":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "info";
    }
  };

  const columns = [
    {
      key: "orderId",
      header: "Order ID",
      render: (order: Order) => (
        <span className="font-mono text-sm text-gray-600">{order.orderId}</span>
      ),
    },
    {
      key: "product",
      header: "Product",
      render: (order: Order) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">{order.product}</span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (order: Order) => (
        <div className="flex items-center gap-1 font-semibold text-gray-900">
          <IndianRupee className="w-4 h-4" />
          <span>{order.amount}</span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order: Order) => (
        <Badge variant={getStatusVariant(order.status)}>{order.status}</Badge>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (order: Order) => (
        <span className="text-gray-600">
          {new Date(order.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
          <p className="text-gray-600 mt-1">
            View and track your order history
          </p>
        </div>
        <Button
          onClick={() => navigate("/user/orders/new")}
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
        >
          Create Order
        </Button>
      </div>

      {/* Orders Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Delivered</p>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter((o) => o.status === "DELIVERED").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter((o) => o.status === "SHIPPED" || o.status === "CREATED").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">
            {orders.filter((o) => o.status === "CANCELLED").length}
          </p>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <Table
          data={orders}
          columns={columns}
          emptyMessage="No orders found"
        />
      </Card>
    </div>
  );
};
