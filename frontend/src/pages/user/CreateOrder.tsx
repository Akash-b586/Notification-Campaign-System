import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Package, IndianRupee, ArrowLeft, CheckCircle } from "lucide-react";
import { Button, Card, Input, Select } from "../../components/ui";

interface Product {
  name: string;
  price: number;
  description: string;
}

const products: Product[] = [
  { name: "Face Cream", price: 499, description: "Anti-aging face cream" },
  { name: "Shampoo", price: 299, description: "Natural hair shampoo" },
  { name: "Body Lotion", price: 399, description: "Moisturizing body lotion" },
  { name: "Hair Oil", price: 249, description: "Nourishing hair oil" },
  { name: "Face Wash", price: 199, description: "Deep cleansing face wash" },
  { name: "Conditioner", price: 349, description: "Hair conditioner" },
  { name: "Serum", price: 599, description: "Vitamin C serum" },
  { name: "Sunscreen", price: 449, description: "SPF 50 sunscreen" },
];

export const CreateOrder: React.FC = () => {
  const navigate = useNavigate();
  const [selectedProduct, setSelectedProduct] = useState("");
  const [amount, setAmount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleProductChange = (productName: string) => {
    setSelectedProduct(productName);
    const product = products.find((p) => p.name === productName);
    setAmount(product?.price || 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) {
      alert("Please select a product");
      return;
    }

    setIsSubmitting(true);

    // Simulate order creation
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      // Redirect after 2 seconds
      setTimeout(() => {
        navigate("/user/orders");
      }, 2000);
    }, 1000);
  };

  const selectedProductDetails = products.find((p) => p.name === selectedProduct);

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
                value={selectedProduct}
                onChange={(e) => handleProductChange(e.target.value)}
                required
              />
            </div>

            {/* Product Details */}
            {selectedProductDetails && (
              <Card className="p-4 bg-blue-50 border-blue-200">
                <div className="flex items-start gap-3">
                  <Package className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {selectedProductDetails.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {selectedProductDetails.description}
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
            {selectedProduct && (
              <Card className="p-4 bg-gray-50">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Order Summary
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Product:</span>
                    <span className="font-medium">{selectedProduct}</span>
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
                disabled={!selectedProduct || isSubmitting}
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
