import React, { useState, useEffect, useCallback } from "react";
import { Plus, Package, IndianRupee } from "lucide-react";
import { Button, Card, Table, Badge, LoadingSpinner } from "../../components/ui";
import { useNavigate } from "react-router-dom";
import { orderService } from "../../services/api";
import type { Order } from "../../types";

type OrderStatus = "DELIVERED" | "SHIPPED" | "PENDING" | "CANCELLED";

export const UserOrders: React.FC = () => {
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const fetchOrders = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const response = await orderService.getMyOrders();

      // Handles both: array response OR { data: [] }
      const ordersData: Order[] = Array.isArray(response)
        ? response
        : response?.data ?? [];

      setOrders(ordersData);
    } catch (err: any) {
      setError(err?.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const getStatusVariant = (status: OrderStatus) => {
    switch (status) {
      case "DELIVERED":
        return "success";
      case "SHIPPED":
        return "info";
      case "PENDING":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "info";
    }
  };

  const columns = [
    {
      key: "id",
      header: "Order ID",
      render: (order: Order) => (
        <span className="font-mono text-sm text-gray-600">
          {order.id}
        </span>
      ),
    },
    {
      key: "productName",
      header: "Product",
      render: (order: Order) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <span className="font-medium text-gray-900">
            {order.productName}
          </span>
        </div>
      ),
    },
    {
      key: "amount",
      header: "Amount",
      render: (order: Order) => (
        <div className="flex items-center gap-1 font-semibold text-gray-900">
          <IndianRupee className="w-4 h-4" />
          <span>
            {typeof order.amount === "number"
              ? order.amount.toLocaleString("en-IN")
              : order.amount}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (order: Order) => (
        <Badge variant={getStatusVariant(order.status as OrderStatus)}>
          {order.status}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Date",
      render: (order: Order) => (
        <span className="text-gray-600">
          {order.createdAt
            ? new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "--"}
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
          variant="primary"
          icon={<Plus className="w-5 h-5" />}
          onClick={() => navigate("/user/orders/new")}
        >
          Create Order
        </Button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Summary */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold">{orders.length}</p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">Delivered</p>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter(o => o.status === "DELIVERED").length}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">In Progress</p>
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter(
              o => o.status === "SHIPPED"
            ).length}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-sm text-gray-600">Cancelled</p>
          <p className="text-2xl font-bold text-red-600">
            {orders.filter(o => o.status === "CANCELLED").length}
          </p>
        </Card>
      </div>

      {/* Table */}
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
