import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

export const createOrder = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { productId, quantity } = req.body;
    if (!productId || !quantity) {
      res.status(400).json({ message: 'productId and quantity are required' });
      return;
    }
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }
    if (quantity < product.minOrderQty) {
      res.status(400).json({ message: `Minimum order quantity is ${product.minOrderQty}` });
      return;
    }
    const order = await prisma.order.create({
      data: {
        buyerId: req.userId!,
        supplierId: product.supplierId,
        productId,
        quantity: parseInt(quantity),
        totalAmount: product.price * parseInt(quantity),
        status: 'PENDING',
      },
      include: {
        product: true,
        buyer: { select: { id: true, name: true, email: true } },
        supplier: { select: { id: true, name: true, email: true } },
      },
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const getMyOrders = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const role = req.userRole;
    const orders = await prisma.order.findMany({
      where: role === 'BUYER' ? { buyerId: req.userId } : { supplierId: req.userId },
      include: {
        product: true,
        buyer: { select: { id: true, name: true, email: true } },
        supplier: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const updateOrderStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { status } = req.body;
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }
    // Supplier can accept/reject
    if ((status === 'ACCEPTED' || status === 'REJECTED') && order.supplierId !== req.userId) {
      res.status(403).json({ message: 'Only supplier can accept or reject orders' });
      return;
    }
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
      include: {
        product: true,
        buyer: { select: { id: true, name: true, email: true } },
        supplier: { select: { id: true, name: true, email: true } },
      },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const markPaymentSent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.buyerId !== req.userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { paymentSent: true },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};

export const markGoodsDelivered = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || order.supplierId !== req.userId) {
      res.status(403).json({ message: 'Not authorized' });
      return;
    }
    let status = order.status;
    if (order.paymentSent) {
      status = 'COMPLETED';
    }
    const updated = await prisma.order.update({
      where: { id: req.params.id },
      data: { goodsDelivered: true, status },
    });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
};
