import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Package, IndianRupee, ArrowLeft, CheckCircle } from "lucide-react";
import { Button, Card, Input, Select, LoadingSpinner } from "../../components/ui";
import { orderService } from "../../services/api";
import { useAuthStore } from "../../store/authStore";

export const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [productName, setProductName] = useState("");
  const [amount, setAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Array<{ name: string; price: number }>>([]);

  useEffect(() => {
    // Load products - in a real scenario this would come from backend
    const defaultProducts = [
      { name: "Face Cream", price: 499 },
      { name: "Shampoo", price: 299 },
      { name: "Body Lotion", price: 399 },
      { name: "Hair Oil", price: 249 },
      { name: "Face Wash", price: 199 },
      { name: "Conditioner", price: 349 },
      { name: "Serum", price: 599 },
      { name: "Sunscreen", price: 449 },
    ];
    setProducts(defaultProducts);
    setIsLoading(false);
  }, []);

  const handleProductChange = (name: string) => {
    setProductName(name);
    const product = products.find((p) => p.name === name);
    setAmount(product?.price || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !amount || !user?.userId) {
      setError("Please select a product");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      // Generate a unique order number
      const orderNumber = `ORD-${user.userId.substring(0, 8)}-${Date.now()}`;

      await orderService.create({
        orderNumber,
        userId: user.userId,
      });
      setShowSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/user/orders");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to create order");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedProduct = products.find((p) => p.name === productName);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div className="p-4 lg:p-8 flex items-center justify-center min-h-[70vh]">
        <Card className="p-8 max-w-md w-full text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Order Created Successfully!
          </h2>
          <p className="text-gray-600 mb-4">
            Your order has been placed and is being processed.
          </p>
          <p className="text-sm text-gray-500">
            Redirecting to orders page...
          </p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          icon={<ArrowLeft className="w-5 h-5" />}
          onClick={() => navigate("/user/orders")}
        >
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Create New Order</h1>
          <p className="text-gray-600 mt-1">
            Select a product and place your order
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Order Form */}
      <div className="max-w-2xl">
        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Product
              </label>
              <Select
                options={[
                  { value: "", label: "Choose a product..." },
                  ...products.map((p) => ({
                    value: p.name,
                    label: `${p.name} - ₹${p.price}`,
                  })),
                ]}
                value={productName}
                onChange={(e) => handleProductChange(e.target.value)}
                required
              />
            </div>

            {/* Product Details */}
            {selectedProduct && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {selectedProduct.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Selected for order
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Amount Display */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amount
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <IndianRupee className="w-5 h-5 text-gray-400" />
                </div>
                <Input
                  type="number"
                  value={amount}
                  readOnly
                  className="pl-10 bg-gray-50 font-semibold text-lg"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Amount is automatically set based on the selected product
              </p>
            </div>

            {/* Order Summary */}
            {productName && (
              <Card className="p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium">{productName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium">₹{amount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping:</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 mt-2 flex justify-between">
                    <span className="font-semibold text-gray-900">Total:</span>
                    <span className="font-bold text-lg text-gray-900">
                      ₹{amount}
                    </span>
                  </div>
                </div>
              </Card>
            )}

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/user/orders")}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                disabled={!productName || isSubmitting}
                isLoading={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Placing Order..." : "Place Order"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};