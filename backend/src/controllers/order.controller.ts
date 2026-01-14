import prisma from "../config/prisma";

export const createOrder = async (req: any, res: any) => {
  try {
    const { orderNumber, userId } = req.body;

    if (!orderNumber || !userId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { userId },
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if order number already exists
    const existingOrder = await prisma.order.findUnique({
      where: { orderNumber },
    });

    if (existingOrder) {
      return res.status(400).json({ message: "Order number already exists" });
    }

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId,
        status: "CREATED",
      },
    });

    // Create notification logs for ORDER_UPDATES when order is created
    await createOrderNotificationLogs(order.id, userId, 'CREATED');

    res.status(201).json({
      message: "Order created successfully",
      order,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create order" });
  }
};

export const getOrder = async (req: any, res: any) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
          },
        },
        logs: true,
      },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

export const getAllOrders = async (req: any, res: any) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: {
          select: {
            userId: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

export const getUserOrders = async (req: any, res: any) => {
  try {
    const { userId } = req.params;

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        logs: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json(orders);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch user orders" });
  }
};

export const updateOrderStatus = async (req: any, res: any) => {
  try {
    const { orderId } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const validStatuses = ['CREATED', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid order status" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    // Create notification logs for the status change
    await createOrderNotificationLogs(orderId, order.userId, status);

    res.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update order status" });
  }
};

export const deleteOrder = async (req: any, res: any) => {
  try {
    const { orderId } = req.params;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    await prisma.order.delete({
      where: { id: orderId },
    });

    res.json({ message: "Order deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete order" });
  }
};

// Helper function to create notification logs for order updates
async function createOrderNotificationLogs(
  orderId: string,
  userId: string,
  orderStatus: string
): Promise<void> {
  try {
    // Get user's ORDER_UPDATES notification preferences
    let preferences = await prisma.notificationPreference.findUnique({
      where: {
        userId_notificationType: {
          userId,
          notificationType: 'ORDER_UPDATES',
        },
      },
    });

    // If no preference exists, treat as opt-in by default
    if (!preferences) {
      preferences = {
        id: '',
        userId,
        notificationType: 'ORDER_UPDATES',
        email: true,
        sms: true,
        push: true,
        updatedAt: new Date(),
      };
    }

    // Create notification log for each enabled channel
    const channels = ['EMAIL', 'SMS', 'PUSH'] as const;
    const logData: any[] = [];

    for (const channel of channels) {
      const isChannelEnabled = preferences[channel.toLowerCase() as keyof typeof preferences];
      if (isChannelEnabled) {
        logData.push({
          userId,
          notificationType: 'ORDER_UPDATES',
          channel,
          status: 'SUCCESS',
          orderId,
        });
      }
    }

    if (logData.length > 0) {
      await prisma.notificationLog.createMany({
        data: logData,
      });
    }
  } catch (err) {
    console.error('Failed to create order notification logs:', err);
    // Don't throw - order creation should succeed even if notification logging fails
  }
}
