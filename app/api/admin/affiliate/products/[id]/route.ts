/**
 * Admin API - Individual Product Operations
 * 
 * GET /api/admin/affiliate/products/[id] - Get product details
 * PUT /api/admin/affiliate/products/[id] - Update product
 * DELETE /api/admin/affiliate/products/[id] - Delete product
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateProductSchema = z.object({
  productName: z.string().min(1).optional(),
  slug: z.string().min(1).optional(),
  productCategory: z.string().optional(),
  subcategory: z.string().optional(),
  description: z.string().optional(),
  price: z.number().nullable().optional(),
  pricingModel: z.string().optional(),
  currency: z.string().optional(),
  productUrl: z.string().url().nullable().optional(),
  affiliateUrl: z.string().url().nullable().optional(),
  features: z.array(z.string()).optional(),
  imageUrls: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isFeatured: z.boolean().optional(),
  status: z.enum(['active', 'inactive', 'out_of_stock']).optional(),
});

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET - Get product details
export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    const product = await prisma.affiliateProduct.findUnique({
      where: { id },
      include: {
        partner: { select: { id: true, companyName: true, slug: true } },
        _count: { select: { links: true, clicks: true, conversions: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Parse JSON fields
    const parseJsonField = (field: string | null) => {
      if (!field) return [];
      try {
        return JSON.parse(field);
      } catch {
        return [];
      }
    };

    // Get aggregate statistics
    const stats = await prisma.affiliateConversion.aggregate({
      where: { productId: id, conversionStatus: 'approved' },
      _sum: { saleAmount: true, commissionAmount: true },
      _count: true,
    });

    return NextResponse.json({
      product: {
        ...product,
        features: parseJsonField(product.features),
        imageUrls: parseJsonField(product.imageUrls),
        tags: parseJsonField(product.tags),
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
      stats: {
        totalClicks: product._count.clicks,
        totalConversions: stats._count,
        totalRevenue: stats._sum.saleAmount || 0,
        totalCommission: stats._sum.commissionAmount || 0,
      },
    });
  } catch (error) {
    console.error('Failed to fetch product:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}

// PUT - Update product
export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const validation = updateProductSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.error.issues },
        { status: 400 }
      );
    }

    // Check if product exists
    const existing = await prisma.affiliateProduct.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const data = validation.data;

    // If slug is being changed, check for conflicts
    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.affiliateProduct.findUnique({
        where: { slug: data.slug },
      });
      if (slugConflict) {
        return NextResponse.json(
          { error: 'A product with this slug already exists' },
          { status: 400 }
        );
      }
    }

    const product = await prisma.affiliateProduct.update({
      where: { id },
      data: {
        ...(data.productName && { productName: data.productName }),
        ...(data.slug && { slug: data.slug }),
        ...(data.productCategory && { productCategory: data.productCategory }),
        ...(data.subcategory !== undefined && { subcategory: data.subcategory }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
        ...(data.pricingModel && { pricingModel: data.pricingModel }),
        ...(data.currency && { currency: data.currency }),
        ...(data.productUrl !== undefined && { productUrl: data.productUrl }),
        ...(data.affiliateUrl !== undefined && { affiliateUrl: data.affiliateUrl }),
        ...(data.features && { features: JSON.stringify(data.features) }),
        ...(data.imageUrls && { imageUrls: JSON.stringify(data.imageUrls) }),
        ...(data.tags && { tags: JSON.stringify(data.tags) }),
        ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
        ...(data.status && { status: data.status }),
      },
    });

    return NextResponse.json({
      product: {
        ...product,
        createdAt: product.createdAt.toISOString(),
        updatedAt: product.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to update product:', error);
    return NextResponse.json(
      { error: 'Failed to update product' },
      { status: 500 }
    );
  }
}

// DELETE - Delete product
export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;

    // Check if product exists
    const product = await prisma.affiliateProduct.findUnique({
      where: { id },
      include: { _count: { select: { conversions: true } } },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Prevent deletion if there are conversions
    if (product._count.conversions > 0) {
      return NextResponse.json(
        { 
          error: 'Cannot delete product with existing conversions. Set status to inactive instead.',
          conversions: product._count.conversions,
        },
        { status: 400 }
      );
    }

    // Delete the product (will cascade to links and clicks)
    await prisma.affiliateProduct.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product' },
      { status: 500 }
    );
  }
}
