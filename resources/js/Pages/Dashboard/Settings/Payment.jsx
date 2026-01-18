import React, { useEffect } from "react";
import { Head, useForm, usePage } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Input from "@/Components/Dashboard/Input";
import Checkbox from "@/Components/Dashboard/Checkbox";
import {
    IconCreditCard,
    IconDeviceFloppy,
    IconBrandStripe,
    IconCash,
} from "@tabler/icons-react";
import toast from "react-hot-toast";

export default function Payment({ auth, setting, supportedGateways = [] }) {
    const { flash } = usePage().props;

    const { data, setData, put, errors, processing } = useForm({
        default_gateway: setting?.default_gateway ?? "cash",
        midtrans_enabled: setting?.midtrans_enabled ?? false,
        midtrans_server_key: setting?.midtrans_server_key ?? "",
        midtrans_client_key: setting?.midtrans_client_key ?? "",
        midtrans_production: setting?.midtrans_production ?? false,
        xendit_enabled: setting?.xendit_enabled ?? false,
        xendit_secret_key: setting?.xendit_secret_key ?? "",
        xendit_public_key: setting?.xendit_public_key ?? "",
        xendit_production: setting?.xendit_production ?? false,
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("settings.payments.update"), { preserveScroll: true });
    };

    const isGatewaySelectable = (gateway) => {
        if (gateway === "cash") return true;
        if (gateway === "midtrans") return data.midtrans_enabled;
        if (gateway === "xendit") return data.xendit_enabled;
        return false;
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pengaturan Payment" />

            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
                                <div className="p-2 sm:p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                                    <IconCreditCard size={24} className="text-primary-600 dark:text-primary-400" />
                                </div>
                                Pengaturan Payment Gateway
                            </h1>
                            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 ml-12 sm:ml-14">
                                Konfigurasi metode pembayaran untuk transaksi
                            </p>
                        </div>

                        {/* Status indicators */}
                        <div className="flex flex-wrap gap-2">
                            {data.midtrans_enabled && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium">
                                    <IconBrandStripe size={14} />
                                    Midtrans
                                </span>
                            )}
                            {data.xendit_enabled && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-medium">
                                    <IconCreditCard size={14} />
                                    Xendit
                                </span>
                            )}
                            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">
                                <IconCash size={14} />
                                Cash Always Active
                            </span>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="max-w-4xl space-y-4 sm:space-y-6">
                {/* Default Gateway */}
                <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <IconCash size={18} className="text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300">
                                Gateway Default
                            </h3>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mb-4 ml-11">
                            Gateway pembayaran yang akan dipilih secara otomatis saat membuka halaman transaksi
                        </p>
                        <div className="ml-11">
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Pilih Gateway
                        </label>
                        <select
                            value={data.default_gateway}
                            onChange={(e) =>
                                setData("default_gateway", e.target.value)
                            }
                            className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                        >
                            {supportedGateways.map((gw) => (
                                <option
                                    key={gw.value}
                                    value={gw.value}
                                    disabled={!isGatewaySelectable(gw.value)}
                                >
                                    {gw.label}
                                    {!isGatewaySelectable(gw.value) &&
                                        " (nonaktif)"}
                                </option>
                            ))}
                        </select>
                        {errors?.default_gateway && (
                            <small className="text-xs text-danger-500 mt-1">
                                {errors.default_gateway}
                            </small>
                        )}
                        </div>
                    </div>
                </div>

                {/* Midtrans */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <IconBrandStripe size={18} />
                            Midtrans Snap
                        </h3>
                        <label
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                                data.midtrans_enabled
                                    ? "bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-400"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            }`}
                        >
                            <Checkbox
                                checked={data.midtrans_enabled}
                                onChange={(e) =>
                                    setData(
                                        "midtrans_enabled",
                                        e.target.checked
                                    )
                                }
                            />
                            {data.midtrans_enabled ? "Aktif" : "Nonaktif"}
                        </label>
                    </div>
                    <div
                        className={`space-y-4 ${
                            !data.midtrans_enabled
                                ? "opacity-50 pointer-events-none"
                                : ""
                        }`}
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Server Key"
                                type="text"
                                value={data.midtrans_server_key}
                                onChange={(e) =>
                                    setData(
                                        "midtrans_server_key",
                                        e.target.value
                                    )
                                }
                                errors={errors?.midtrans_server_key}
                                placeholder="SB-Mid-server-xxx"
                            />
                            <Input
                                label="Client Key"
                                type="text"
                                value={data.midtrans_client_key}
                                onChange={(e) =>
                                    setData(
                                        "midtrans_client_key",
                                        e.target.value
                                    )
                                }
                                errors={errors?.midtrans_client_key}
                                placeholder="SB-Mid-client-xxx"
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={data.midtrans_production}
                                onChange={(e) =>
                                    setData(
                                        "midtrans_production",
                                        e.target.checked
                                    )
                                }
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                Mode Produksi
                            </span>
                        </label>
                    </div>
                </div>

                {/* Xendit */}
                <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                            <IconCreditCard size={18} />
                            Xendit Invoice
                        </h3>
                        <label
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium cursor-pointer transition-all ${
                                data.xendit_enabled
                                    ? "bg-success-100 dark:bg-success-900/50 text-success-700 dark:text-success-400"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-500"
                            }`}
                        >
                            <Checkbox
                                checked={data.xendit_enabled}
                                onChange={(e) =>
                                    setData("xendit_enabled", e.target.checked)
                                }
                            />
                            {data.xendit_enabled ? "Aktif" : "Nonaktif"}
                        </label>
                    </div>
                    <div
                        className={`space-y-4 ${
                            !data.xendit_enabled
                                ? "opacity-50 pointer-events-none"
                                : ""
                        }`}
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <Input
                                label="Secret Key"
                                type="text"
                                value={data.xendit_secret_key}
                                onChange={(e) =>
                                    setData("xendit_secret_key", e.target.value)
                                }
                                errors={errors?.xendit_secret_key}
                                placeholder="xnd_development_xxx"
                            />
                            <Input
                                label="Public Key"
                                type="text"
                                value={data.xendit_public_key}
                                onChange={(e) =>
                                    setData("xendit_public_key", e.target.value)
                                }
                                errors={errors?.xendit_public_key}
                                placeholder="xnd_public_development_xxx"
                            />
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <Checkbox
                                checked={data.xendit_production}
                                onChange={(e) =>
                                    setData(
                                        "xendit_production",
                                        e.target.checked
                                    )
                                }
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">
                                Mode Produksi
                            </span>
                        </label>
                    </div>
                </div>

                {/* Submit */}
                <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 p-4 sm:p-6 -mx-3 sm:-mx-4 lg:-mx-6">
                    <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                            <p className="font-medium mb-1">💡 Tips:</p>
                            <ul className="space-y-0.5 text-xs">
                                <li>• Aktifkan payment gateway untuk menerima pembayaran online</li>
                                <li>• Gunakan mode production untuk transaksi real</li>
                            </ul>
                        </div>
                        <button
                            type="submit"
                            disabled={processing}
                            className="w-full sm:w-auto px-6 sm:px-8 h-11 sm:h-12 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 disabled:from-slate-400 disabled:to-slate-500 text-white rounded-xl font-semibold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl disabled:shadow-none transform hover:-translate-y-0.5 disabled:transform-none"
                        >
                            {processing ? (
                                <>
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                                    <span>Menyimpan...</span>
                                </>
                            ) : (
                                <>
                                    <IconDeviceFloppy size={20} />
                                    <span>Simpan Konfigurasi</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
                </form>
            </div>
        </AuthenticatedLayout>
    );
}
