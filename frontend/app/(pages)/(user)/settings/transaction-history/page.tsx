"use client";

import { useState, useEffect } from "react";
import { fetchTransactions } from "@/lib/api/transactions";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ChevronDown, ChevronUp, Loader2, Trash2 } from 'lucide-react';
import { Transaction } from "@/types/interfaces";
import React from "react";
import InvoiceComponent from "@/components/user-page/borrow/invoice";

export default function TransactionPage() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [type, setType] = useState<"all" | "borrow" | "return">("all");
    const [status, setStatus] = useState<"all" | "pending" | "approved" | "declined" | "overdue" >("all");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [expandedRow, setExpandedRow] = useState<string | null>(null);

    const fetchData = async (userId: string) => {
        setLoading(true);
        setError(null);

        try {
            const data = await fetchTransactions({
                search: search,
                type: type,
                status: status,
                userId: userId,
            });
            setTransactions(data);
        } catch (err) {
            console.error("Error fetching transactions:", err);
            setError("Failed to fetch transactions.");
        } finally {
            setLoading(false);
        }
    };

    const toggleRow = (id: string) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    useEffect(() => {
      const userId:string = localStorage.getItem("userId")  || "";
      fetchData(userId);
    }, [search, type, status]);

    return (
        <div className="flex flex-col h-full">
            <div className="space-y-6 mb-6">
                <h1 className="text-3xl font-bold">Transaction</h1>
                <div className="flex flex-row justify-center items-end gap-4">
                    <div className="flex-1">
                        <Label htmlFor="search">Search</Label>
                        <Input
                            id="search"
                            placeholder="Search transactions"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div>
                        <Label htmlFor="type">Type</Label>
                        <Select value={type} onValueChange={(value: "all" | "borrow" | "return") => setType(value)}>
                            <SelectTrigger id="type" className="w-[180px]">
                                <SelectValue placeholder="Type transactions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="borrow">Borrows</SelectItem>
                                <SelectItem value="return">Returns</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <Select value={status} onValueChange={(value: "all" | "pending" | "approved" | "declined" | "overdue" ) => setStatus(value)}>
                            <SelectTrigger id="status" className="w-[180px]">
                                <SelectValue placeholder="Filter transactions" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="decline">Decline</SelectItem>
                                <SelectItem value="overdue">Overdue</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            <div className="flex-grow overflow-auto border rounded-md">
                {loading ? (
                    <div className="flex justify-center items-center h-full">
                        <Loader2 className="animate-spin h-8 w-8" />
                    </div>
                ) : error ? (
                    <div className="text-center text-red-500">{error}</div>
                ) : (
                    <Table>
                        <TableCaption>A list of recent transactions.</TableCaption>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>User</TableHead>
                                <TableHead>Date Range</TableHead>
                                <TableHead>Total Fee</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {transactions.map((transaction) => (
                                <React.Fragment key={transaction.id}>
                                    {/* Main Row */}
                                    <TableRow>
                                        <TableCell>
                                            <Dialog>
                                                <DialogTrigger asChild>
                                                    <Button variant="link" className="text-blue-500 underline">
                                                        {transaction.invoiceCode}
                                                    </Button>
                                                </DialogTrigger>
                                                <DialogContent className="max-w-4xl w-full overflow-y-auto">
                                                    {/* <DialogHeader>
                                                        <DialogTitle>Transaction ID: {transaction.id}</DialogTitle>
                                                    </DialogHeader> */}
                                                    <div className="max-h-[70vh] overflow-y-auto">
                                                        <InvoiceComponent invoiceCode={transaction.invoiceCode}/>
                                                    </div>
                                                </DialogContent>
                                            </Dialog>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{transaction.user.name}</span>
                                                <span className="text-sm text-muted-foreground">{transaction.user.email}</span>
                                                <span className="text-sm text-muted-foreground">{transaction.user.phone}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <p>{new Date(transaction.dateRange.from).toLocaleDateString()}</p>
                                            <p className="text-sm text-muted-foreground">
                                                to {new Date(transaction.dateRange.to).toLocaleDateString()}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <p className="font-medium">
                                                Rp{transaction.totalFee.toLocaleString()}
                                            </p>
                                        </TableCell>
                                        <TableCell>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    transaction.status === "approved"
                                                        ? "bg-green-100 text-green-800"
                                                        : transaction.status === "overdue"
                                                        ? "bg-red-100 text-red-800"
                                                        : "bg-gray-100 text-gray-800"
                                                }`}
                                            >
                                                {transaction.status}
                                            </span>
                                        </TableCell>
                                        <TableCell>{transaction.type}</TableCell>
                                        <TableCell>{transaction.paymentMethod}</TableCell>
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => toggleRow(transaction.id)}
                                            >
                                                {expandedRow === transaction.id ? <ChevronUp /> : <ChevronDown />}
                                            </Button>

                                        </TableCell>
                                    </TableRow>

                                    {/* Expanded Row for Items */}
                                    {expandedRow === transaction.id && (
                                        <TableRow>
                                            <TableCell colSpan={8}>
                                                <div className="grid grid-cols-2 gap-4 p-4">
                                                    {transaction.items.map((item) => (
                                                        <div
                                                            key={item.id}
                                                            className="flex items-center gap-4 p-2 border rounded"
                                                        >
                                                            <img
                                                                src={item.image}
                                                                alt={item.title}
                                                                className="w-12 h-12 object-cover rounded"
                                                            />
                                                            <div>
                                                                <p className="font-medium">{item.title}</p>
                                                                <p className="text-sm text-muted-foreground">
                                                                    by {item.author}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
        </div>
    );
}
