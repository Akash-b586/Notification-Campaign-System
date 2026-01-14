import React, { useState, useEffect } from "react";
import { Package, IndianRupee, Edit2, Trash2 } from "lucide-react";
import { Button, Card, Table, Badge, LoadingSpinner, Modal, Select } from "../../components/ui";
import { orderService } from "../../services/api";
import type { Order } from "../../types";

export const OrderManagement: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    setError("");
    try {
      const data = await orderService.list();
      setOrders(data);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "DELIVERED":
        return "success";
      case "SHIPPED":
        return "info";
      case "CONFIRMED":
        return "warning";
      case "CREATED":
        return "warning";
      case "CANCELLED":
        return "error";
      default:
        return "info";
    }
  };

  const handleStatusUpdate = async () => {
    if (!editingOrder || !newStatus) return;

    setIsUpdating(true);
    try {
      await orderService.updateStatus(editingOrder.id, newStatus);
      setOrders(
        orders.map((o) =>
          o.id === editingOrder.id ? { ...o, status: newStatus as any } : o
        )
      );
      setEditingOrder(null);
      setNewStatus("");
    } catch (err: any) {
      setError(err.message || "Failed to update order status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await orderService.delete(deleteId);
      setOrders(orders.filter((o) => o.id !== deleteId));
      setDeleteId(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete order");
    } finally {
      setIsDeleting(false);
    }
  };

  const statusOptions = [
    { value: "CREATED", label: "Created" },
    { value: "CONFIRMED", label: "Confirmed" },
    { value: "SHIPPED", label: "Shipped" },
    { value: "DELIVERED", label: "Delivered" },
    { value: "CANCELLED", label: "Cancelled" },
  ];

  const columns = [
    {
      key: "orderNumber",
      header: "Order Number",
      render: (order: Order) => (
        <span className="font-mono text-sm font-semibold text-gray-900">
          {order.orderNumber}
        </span>
      ),
    },
    {
      key: "userId",
      header: "User ID",
      render: (order: Order) => (
        <span className="text-sm text-gray-600">{order.userId.substring(0, 8)}...</span>
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
      key: "createdAt",
      header: "Created Date",
      render: (order: Order) => (
        <span className="text-gray-600">
          {new Date(order.createdAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "updatedAt",
      header: "Last Updated",
      render: (order: Order) => (
        <span className="text-gray-600">
          {new Date(order.updatedAt).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (order: Order) => (
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={<Edit2 className="w-4 h-4" />}
            onClick={() => {
              setEditingOrder(order);
              setNewStatus(order.status);
            }}
          >
            Update Status
          </Button>
          <Button
            variant="outline"
            size="sm"
            icon={<Trash2 className="w-4 h-4 text-red-600" />}
            onClick={() => setDeleteId(order.id)}
          >
            Delete
          </Button>
        </div>
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Order Management</h1>
        <p className="text-gray-600 mt-1">
          Manage all customer orders and update their status
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid md:grid-cols-5 gap-4">
        <Card className="p-4">
          <p className="text-sm text-gray-600">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Created</p>
          <p className="text-2xl font-bold text-yellow-600">
            {orders.filter((o) => o.status === "CREATED").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Confirmed</p>
          <p className="text-2xl font-bold text-blue-600">
            {orders.filter((o) => o.status === "CONFIRMED").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Shipped</p>
          <p className="text-2xl font-bold text-purple-600">
            {orders.filter((o) => o.status === "SHIPPED").length}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-gray-600">Delivered</p>
          <p className="text-2xl font-bold text-green-600">
            {orders.filter((o) => o.status === "DELIVERED").length}
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

      {/* Status Update Modal */}
      <Modal
        isOpen={!!editingOrder}
        title="Update Order Status"
        onClose={() => {
          setEditingOrder(null);
          setNewStatus("");
        }}
      >
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">
              Order: <span className="font-semibold">{editingOrder?.orderNumber}</span>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Current Status: <span className="font-semibold">{editingOrder?.status}</span>
            </p>
          </div>

          <Select
            label="New Status"
            options={statusOptions}
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            required
          />

          <p className="text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
            ℹ️ Changing the status will automatically create notification logs for the user based on their ORDER_UPDATES preferences.
          </p>

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => {
                setEditingOrder(null);
                setNewStatus("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleStatusUpdate}
              isLoading={isUpdating}
              disabled={newStatus === editingOrder?.status || !newStatus}
            >
              Update Status
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={!!deleteId}
        title="Delete Order"
        onClose={() => setDeleteId(null)}
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete this order? This action cannot be undone.
          </p>
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDelete}
              isLoading={isDeleting}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};