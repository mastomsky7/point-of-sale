import { IconReceipt, IconExternalLink, IconCreditCard, IconClock } from "@tabler/icons-react";
import { Link } from "@inertiajs/react";

const formatPrice = (value = 0) =>
    value.toLocaleString("id-ID", {
        style: "currency",
        currency: "IDR",
        minimumFractionDigits: 0,
    });

const getPaymentStatusBadge = (status) => {
    const badges = {
        paid: {
            bg: "bg-green-100 dark:bg-green-900/30",
            text: "text-green-600 dark:text-green-400",
            label: "Paid",
        },
        pending: {
            bg: "bg-amber-100 dark:bg-amber-900/30",
            text: "text-amber-600 dark:text-amber-400",
            label: "Pending",
        },
        failed: {
            bg: "bg-red-100 dark:bg-red-900/30",
            text: "text-red-600 dark:text-red-400",
            label: "Failed",
        },
    };

    return badges[status] || badges.pending;
};

export default function TransactionBadge({ transaction, className = "" }) {
    if (!transaction) {
        return (
            <div
                className={`flex items-center gap-3 px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg ${className}`}
            >
                <div className="flex items-center justify-center w-10 h-10 bg-slate-200 dark:bg-slate-700 rounded-lg">
                    <IconClock className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                        Transaction Status
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        No transaction yet
                    </p>
                </div>
            </div>
        );
    }

    const paymentBadge = getPaymentStatusBadge(transaction.payment_status);

    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg ${className}`}
        >
            <div className="flex items-center justify-center w-10 h-10 bg-emerald-600 rounded-lg">
                <IconReceipt className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                    Transaction
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                        {transaction.invoice}
                    </p>
                    <div
                        className={`flex items-center gap-1 px-2 py-0.5 ${paymentBadge.bg} rounded`}
                    >
                        <IconCreditCard className={`w-3 h-3 ${paymentBadge.text}`} />
                        <span
                            className={`text-[10px] font-medium ${paymentBadge.text}`}
                        >
                            {paymentBadge.label}
                        </span>
                    </div>
                </div>
                <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-1">
                    Total: {formatPrice(transaction.grand_total)}
                </p>
            </div>
            <Link
                href={route("transactions.print", transaction.invoice)}
                target="_blank"
                className="flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium rounded-lg transition-colors"
            >
                View Invoice
                <IconExternalLink className="w-3.5 h-3.5" />
            </Link>
        </div>
    );
}
