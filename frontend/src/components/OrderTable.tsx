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
import { format } from "date-fns";

interface Order {
  id: string;
  invoiceNumber: string;
  customer?: { name: string };
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
}

interface OrderTableProps {
  orders: Order[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

export function OrderTable({
  orders,
  total,
  page,
  onPageChange,
}: OrderTableProps) {
  const totalPages = Math.ceil(total / 20);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500/20 text-green-400";
      case "PARTIAL":
        return "bg-yellow-500/20 text-yellow-400";
      case "UNPAID":
        return "bg-red-500/20 text-red-400";
      default:
        return "bg-slate-500/20 text-slate-400";
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-800">
          <TableRow className="border-slate-700">
            <TableHead className="text-slate-300">Invoice #</TableHead>
            <TableHead className="text-slate-300">Customer</TableHead>
            <TableHead className="text-slate-300 text-right">Amount</TableHead>
            <TableHead className="text-slate-300">Status</TableHead>
            <TableHead className="text-slate-300">Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id} className="border-slate-800 hover:bg-slate-800/50">
              <TableCell className="text-white font-medium">{order.invoiceNumber}</TableCell>
              <TableCell className="text-slate-400">{order.customer?.name || "Walk-in"}</TableCell>
              <TableCell className="text-white text-right font-semibold">
                ₹{parseFloat(order.totalAmount.toString()).toFixed(2)}
              </TableCell>
              <TableCell>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </TableCell>
              <TableCell className="text-slate-400">
                {format(new Date(order.createdAt), "MMM dd, yyyy")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
        <p className="text-slate-400 text-sm">
          Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} orders
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
