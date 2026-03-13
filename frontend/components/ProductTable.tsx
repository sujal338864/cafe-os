"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface Product {
  id: string;
  name: string;
  sku?: string;
  sellingPrice: number;
  stock: number;
  lowStockAlert: number;
}

interface ProductTableProps {
  products: Product[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

export function ProductTable({
  products,
  total,
  page,
  onPageChange,
}: ProductTableProps) {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-800">
          <TableRow className="border-slate-700">
            <TableHead className="text-slate-300">Product Name</TableHead>
            <TableHead className="text-slate-300">SKU</TableHead>
            <TableHead className="text-slate-300 text-right">Price</TableHead>
            <TableHead className="text-slate-300 text-right">Stock</TableHead>
            <TableHead className="text-slate-300">Status</TableHead>
            <TableHead className="text-slate-300 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id} className="border-slate-800 hover:bg-slate-800/50">
              <TableCell className="text-white font-medium">{product.name}</TableCell>
              <TableCell className="text-slate-400">{product.sku || "-"}</TableCell>
              <TableCell className="text-white text-right">
                ₹{parseFloat(product.sellingPrice.toString()).toFixed(2)}
              </TableCell>
              <TableCell className="text-white text-right">{product.stock}</TableCell>
              <TableCell>
                {product.stock <= product.lowStockAlert ? (
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-medium">
                    Low Stock
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-xs font-medium">
                    In Stock
                  </span>
                )}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/dashboard/products/${product.id}/edit`}>
                    <Button variant="ghost" size="icon" className="text-blue-400 hover:text-blue-300">
                      <Edit className="w-4 h-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:text-red-300"
                    onClick={() => deleteMutation.mutate(product.id)}
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
        <p className="text-slate-400 text-sm">
          Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} products
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="border-slate-700"
          >
            Previous
          </Button>
          <Button
            variant="outline"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="border-slate-700"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
