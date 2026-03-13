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

interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  totalPurchases: number;
}

interface CustomerTableProps {
  customers: Customer[];
  total: number;
  page: number;
  onPageChange: (page: number) => void;
}

export function CustomerTable({
  customers,
  total,
  page,
  onPageChange,
}: CustomerTableProps) {
  const totalPages = Math.ceil(total / 20);

  return (
    <div className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-800">
          <TableRow className="border-slate-700">
            <TableHead className="text-slate-300">Name</TableHead>
            <TableHead className="text-slate-300">Phone</TableHead>
            <TableHead className="text-slate-300">Email</TableHead>
            <TableHead className="text-slate-300 text-right">Total Purchases</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {customers.map((customer) => (
            <TableRow key={customer.id} className="border-slate-800 hover:bg-slate-800/50">
              <TableCell className="text-white font-medium">{customer.name}</TableCell>
              <TableCell className="text-slate-400">{customer.phone || "-"}</TableCell>
              <TableCell className="text-slate-400">{customer.email || "-"}</TableCell>
              <TableCell className="text-white text-right">
                ₹{parseFloat(customer.totalPurchases.toString()).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800">
        <p className="text-slate-400 text-sm">
          Showing {(page - 1) * 20 + 1} to {Math.min(page * 20, total)} of {total} customers
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
