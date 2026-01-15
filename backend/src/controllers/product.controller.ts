import prisma from "../config/prisma";

export const createProduct = async (req: any, res: any) => {
  try {
    const { name, description, price } = req.body;

    if (!name || !price) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
      },
    });

    res.status(201).json({
      message: "Product created successfully",
      product: formatProductResponse(product),
    });
  } catch (err: any) {
    console.error(err);
    if (err.code === "P2002") {
      return res.status(400).json({ message: "Product name already exists" });
    }
    res.status(500).json({ message: "Failed to create product" });
  }
};

export const getAllProducts = async (req: any, res: any) => {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      orderBy: { createdAt: "desc" },
    });

    res.json(products.map(formatProductResponse));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

export const getProduct = async (req: any, res: any) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(formatProductResponse(product));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

export const updateProduct = async (req: any, res: any) => {
  try {
    const { productId } = req.params;
    const { name, description, price, isActive } = req.body;

    const product = await prisma.product.update({
      where: { id: productId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price: parseFloat(price) }),
        ...(isActive !== undefined && { isActive }),
      },
    });

    res.json({
      message: "Product updated successfully",
      product: formatProductResponse(product),
    });
  } catch (err: any) {
    console.error(err);
    if (err.code === "P2002") {
      return res.status(400).json({ message: "Product name already exists" });
    }
    res.status(500).json({ message: "Failed to update product" });
  }
};

export const deleteProduct = async (req: any, res: any) => {
  try {
    const { productId } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await prisma.product.delete({
      where: { id: productId },
    });

    res.json({ message: "Product deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete product" });
  }
};

function formatProductResponse(product: any) {
  return {
    ...product,
    price: parseFloat(product.price.toString()),
  };
}
