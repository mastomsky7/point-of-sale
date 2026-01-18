import React, { useEffect, useState } from "react";
import { Head, useForm, usePage, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import Input from "@/Components/Dashboard/Input";
import Checkbox from "@/Components/Dashboard/Checkbox";
import {
    IconBell,
    IconDeviceFloppy,
    IconBrandWhatsapp,
    IconMail,
    IconMessage,
    IconSend,
    IconCheck,
    IconAlertCircle,
    IconInfoCircle,
    IconExternalLink,
    IconClock,
} from "@tabler/icons-react";
import toast from "react-hot-toast";
import axios from "axios";

export default function Notification({ auth, setting, whatsappProviders = [], emailProviders = [] }) {
    const { flash } = usePage().props;
    const [testingWhatsApp, setTestingWhatsApp] = useState(false);
    const [testPhoneNumber, setTestPhoneNumber] = useState("");
    const [selectedProvider, setSelectedProvider] = useState(null);
    const [testingEmail, setTestingEmail] = useState(false);
    const [testEmailAddress, setTestEmailAddress] = useState("");
    const [selectedEmailProvider, setSelectedEmailProvider] = useState(null);

    const { data, setData, put, errors, processing } = useForm({
        // WhatsApp Settings
        whatsapp_enabled: setting?.whatsapp_enabled ?? false,
        whatsapp_api_url: setting?.whatsapp_api_url ?? "",
        whatsapp_api_token: setting?.whatsapp_api_token ?? "",
        whatsapp_phone_number: setting?.whatsapp_phone_number ?? "",
        whatsapp_business_id: setting?.whatsapp_business_id ?? "",

        // WhatsApp Message Settings
        whatsapp_send_receipt: setting?.whatsapp_send_receipt ?? true,
        whatsapp_send_appointment: setting?.whatsapp_send_appointment ?? true,
        whatsapp_send_reminder: setting?.whatsapp_send_reminder ?? false,
        whatsapp_reminder_hours: setting?.whatsapp_reminder_hours ?? 24,

        // Email Settings
        email_enabled: setting?.email_enabled ?? false,
        email_driver: setting?.email_driver ?? "smtp",
        email_host: setting?.email_host ?? "",
        email_port: setting?.email_port ?? 587,
        email_username: setting?.email_username ?? "",
        email_password: setting?.email_password ?? "",
        email_encryption: setting?.email_encryption ?? "tls",
        email_from_address: setting?.email_from_address ?? "",
        email_from_name: setting?.email_from_name ?? "POS System",

        // Email Message Settings
        email_send_receipt: setting?.email_send_receipt ?? true,
        email_receipt_message: setting?.email_receipt_message ?? "",
    });

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("settings.notifications.update"), { preserveScroll: true });
    };

    const handleProviderSelect = (provider) => {
        setSelectedProvider(provider);
        setData("whatsapp_api_url", provider.url_example);
    };

    const handleEmailProviderSelect = (provider) => {
        setSelectedEmailProvider(provider);
        setData({
            ...data,
            email_host: provider.host,
            email_port: provider.port,
            email_encryption: provider.encryption,
        });
    };

    const handleTestWhatsApp = async () => {
        if (!testPhoneNumber) {
            toast.error("Masukkan nomor telepon terlebih dahulu");
            return;
        }

        setTestingWhatsApp(true);
        try {
            const response = await axios.post(
                route("settings.notifications.testWhatsApp"),
                { phone_number: testPhoneNumber }
            );

            toast.success(response.data.message);
        } catch (error) {
            const message = error.response?.data?.message || "Gagal mengirim pesan test";
            toast.error(message);
        } finally {
            setTestingWhatsApp(false);
        }
    };

    const handleTestEmail = async () => {
        if (!testEmailAddress) {
            toast.error("Masukkan alamat email terlebih dahulu");
            return;
        }

        setTestingEmail(true);
        try {
            const response = await axios.post(
                route("settings.notifications.testEmail"),
                { email_address: testEmailAddress }
            );

            toast.success(response.data.message);
        } catch (error) {
            const message = error.response?.data?.message || "Gagal mengirim email test";
            toast.error(message);
        } finally {
            setTestingEmail(false);
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Pengaturan Notifikasi" />

            <div className="py-4 sm:py-6">
                <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
                    {/* Header with gradient background */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2 sm:gap-3">
                                    <div className="p-2 sm:p-2.5 bg-primary-100 dark:bg-primary-900/30 rounded-xl">
                                        <IconBell size={24} className="text-primary-600 dark:text-primary-400" />
                                    </div>
                                    Pengaturan Notifikasi
                                </h1>
                                <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-2 ml-12 sm:ml-14">
                                    Konfigurasi notifikasi otomatis untuk meningkatkan komunikasi dengan customer
                                </p>
                            </div>

                            {/* Status indicator */}
                            <div className="flex flex-wrap gap-2">
                                {data.whatsapp_enabled && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-medium">
                                        <IconBrandWhatsapp size={14} />
                                        WhatsApp Aktif
                                    </span>
                                )}
                                {data.email_enabled && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-medium">
                                        <IconMail size={14} />
                                        Email Aktif
                                    </span>
                                )}
                                {!data.whatsapp_enabled && !data.email_enabled && (
                                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-lg text-xs font-medium">
                                        <IconAlertCircle size={14} />
                                        Belum Ada Notifikasi Aktif
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        {/* WhatsApp Integration */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                                <IconBrandWhatsapp size={20} className="text-green-600 dark:text-green-400" />
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200">
                                                WhatsApp Business API
                                            </h3>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 ml-11">
                                            Kirim struk transaksi dan konfirmasi appointment otomatis via WhatsApp
                                        </p>
                                        {data.whatsapp_enabled && (
                                            <div className="flex flex-wrap gap-2 mt-3 ml-11">
                                                {data.whatsapp_send_receipt && (
                                                    <span className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md">
                                                        ✓ Receipt
                                                    </span>
                                                )}
                                                {data.whatsapp_send_appointment && (
                                                    <span className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md">
                                                        ✓ Appointment
                                                    </span>
                                                )}
                                                {data.whatsapp_send_reminder && (
                                                    <span className="text-xs px-2 py-1 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md">
                                                        ✓ Reminder
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {data.whatsapp_enabled ? "Aktif" : "Nonaktif"}
                                        </span>
                                        <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                                            data.whatsapp_enabled
                                                ? "bg-green-600"
                                                : "bg-slate-300 dark:bg-slate-600"
                                        }`}>
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={data.whatsapp_enabled}
                                                onChange={(e) => setData("whatsapp_enabled", e.target.checked)}
                                            />
                                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                                data.whatsapp_enabled ? "translate-x-6" : "translate-x-1"
                                            }`} />
                                        </div>
                                    </label>
                                </div>

                            {data.whatsapp_enabled && (
                                <>
                                    {/* Provider Selection */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            Pilih WhatsApp Provider
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                            {whatsappProviders.map((provider) => (
                                                <button
                                                    key={provider.value}
                                                    type="button"
                                                    onClick={() => handleProviderSelect(provider)}
                                                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                                                        selectedProvider?.value === provider.value
                                                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-primary-300"
                                                    }`}
                                                >
                                                    {provider.recommended && (
                                                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                                            Recommended
                                                        </span>
                                                    )}
                                                    <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                                                        {provider.label}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">
                                                        {provider.description}
                                                    </div>
                                                    {provider.free_tier && (
                                                        <span className="inline-block px-2 py-0.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 text-xs rounded">
                                                            Free Tier
                                                        </span>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* API Configuration */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <Input
                                                label="API URL"
                                                type="text"
                                                value={data.whatsapp_api_url}
                                                onChange={(e) => setData("whatsapp_api_url", e.target.value)}
                                                error={errors.whatsapp_api_url}
                                                placeholder="https://api.provider.com/v1/messages"
                                                required={data.whatsapp_enabled}
                                            />
                                            {selectedProvider && (
                                                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                    Example: {selectedProvider.url_example}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <Input
                                                label="API Token"
                                                type="password"
                                                value={data.whatsapp_api_token}
                                                onChange={(e) => setData("whatsapp_api_token", e.target.value)}
                                                error={errors.whatsapp_api_token}
                                                placeholder="Your API token or key"
                                                required={data.whatsapp_enabled}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <Input
                                                label="Business Phone Number"
                                                type="text"
                                                value={data.whatsapp_phone_number}
                                                onChange={(e) => setData("whatsapp_phone_number", e.target.value)}
                                                error={errors.whatsapp_phone_number}
                                                placeholder="+6281234567890"
                                            />
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Format: +62... (international format)
                                            </p>
                                        </div>

                                        <div>
                                            <Input
                                                label="Business ID (Optional)"
                                                type="text"
                                                value={data.whatsapp_business_id}
                                                onChange={(e) => setData("whatsapp_business_id", e.target.value)}
                                                error={errors.whatsapp_business_id}
                                                placeholder="For Meta Cloud API"
                                            />
                                        </div>
                                    </div>

                                    {/* Documentation Links */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                                        <div className="flex items-start gap-3">
                                            <IconInfoCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                                    Setup Guide & Documentation
                                                </h4>
                                                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                                    <li>
                                                        <a
                                                            href="/WHATSAPP_QUICK_SETUP.md"
                                                            target="_blank"
                                                            className="hover:underline inline-flex items-center gap-1"
                                                        >
                                                            Quick Setup Guide (5 min)
                                                            <IconExternalLink size={14} />
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a
                                                            href="/WHATSAPP_CONFIG_GUIDE.md"
                                                            target="_blank"
                                                            className="hover:underline inline-flex items-center gap-1"
                                                        >
                                                            Complete Configuration Guide
                                                            <IconExternalLink size={14} />
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a
                                                            href="/WHATSAPP_INVOICE_FEATURE.md"
                                                            target="_blank"
                                                            className="hover:underline inline-flex items-center gap-1"
                                                        >
                                                            Feature Documentation
                                                            <IconExternalLink size={14} />
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Settings */}
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                                            Message Settings
                                        </h4>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                                                <Checkbox
                                                    checked={data.whatsapp_send_receipt}
                                                    onChange={(e) => setData("whatsapp_send_receipt", e.target.checked)}
                                                />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        Send Receipt After Transaction
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        Kirim struk otomatis via WhatsApp setelah transaksi selesai
                                                    </div>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                                                <Checkbox
                                                    checked={data.whatsapp_send_appointment}
                                                    onChange={(e) => setData("whatsapp_send_appointment", e.target.checked)}
                                                />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        Send Appointment Confirmation
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        Kirim konfirmasi booking appointment ke customer
                                                    </div>
                                                </div>
                                            </label>

                                            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                                                <Checkbox
                                                    checked={data.whatsapp_send_reminder}
                                                    onChange={(e) => setData("whatsapp_send_reminder", e.target.checked)}
                                                />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                                        Send Appointment Reminder
                                                        <IconClock size={16} />
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        Kirim reminder sebelum appointment
                                                    </div>
                                                </div>
                                            </label>

                                            {data.whatsapp_send_reminder && (
                                                <div className="ml-10 mt-2">
                                                    <Input
                                                        label="Reminder Hours Before Appointment"
                                                        type="number"
                                                        value={data.whatsapp_reminder_hours}
                                                        onChange={(e) => setData("whatsapp_reminder_hours", parseInt(e.target.value))}
                                                        error={errors.whatsapp_reminder_hours}
                                                        min="1"
                                                        max="168"
                                                        placeholder="24"
                                                        className="max-w-xs"
                                                    />
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                        Kirim reminder berapa jam sebelum appointment (max 168 = 7 hari)
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Test WhatsApp */}
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                            Test WhatsApp Connection
                                        </h4>
                                        <div className="flex gap-3">
                                            <input
                                                type="text"
                                                value={testPhoneNumber}
                                                onChange={(e) => setTestPhoneNumber(e.target.value)}
                                                placeholder="081234567890"
                                                className="flex-1 h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleTestWhatsApp}
                                                disabled={testingWhatsApp || !data.whatsapp_enabled}
                                                className="px-4 h-11 bg-green-600 hover:bg-green-700 disabled:bg-slate-400 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
                                            >
                                                {testingWhatsApp ? (
                                                    <>
                                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <IconSend size={18} />
                                                        Send Test
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                            Masukkan nomor WhatsApp untuk menerima pesan test
                                        </p>
                                    </div>
                                </>
                            )}
                            </div>
                        </div>

                        {/* Email Integration */}
                        <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow duration-200">
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                                <IconMail size={20} className="text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <h3 className="text-lg sm:text-xl font-semibold text-slate-800 dark:text-slate-200">
                                                Email Notification
                                            </h3>
                                        </div>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 ml-11">
                                            Kirim struk pembayaran otomatis via email setelah transaksi selesai
                                        </p>
                                        {data.email_enabled && (
                                            <div className="flex flex-wrap gap-2 mt-3 ml-11">
                                                {data.email_send_receipt && (
                                                    <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md">
                                                        ✓ Auto Receipt
                                                    </span>
                                                )}
                                                <span className="text-xs px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-md">
                                                    {data.email_encryption?.toUpperCase()} Encrypted
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                                            {data.email_enabled ? "Aktif" : "Nonaktif"}
                                        </span>
                                        <div className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                                            data.email_enabled
                                                ? "bg-blue-600"
                                                : "bg-slate-300 dark:bg-slate-600"
                                        }`}>
                                            <input
                                                type="checkbox"
                                                className="sr-only"
                                                checked={data.email_enabled}
                                                onChange={(e) => setData("email_enabled", e.target.checked)}
                                            />
                                            <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                                                data.email_enabled ? "translate-x-6" : "translate-x-1"
                                            }`} />
                                        </div>
                                    </label>
                                </div>

                            {data.email_enabled && (
                                <>
                                    {/* Email Provider Selection */}
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                                            Pilih Email Provider
                                        </label>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                            {emailProviders.map((provider) => (
                                                <button
                                                    key={provider.value}
                                                    type="button"
                                                    onClick={() => handleEmailProviderSelect(provider)}
                                                    className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                                                        selectedEmailProvider?.value === provider.value
                                                            ? "border-primary-500 bg-primary-50 dark:bg-primary-900/20"
                                                            : "border-slate-200 dark:border-slate-700 hover:border-primary-300"
                                                    }`}
                                                >
                                                    {provider.recommended && (
                                                        <span className="absolute top-2 right-2 px-2 py-0.5 bg-green-500 text-white text-xs rounded-full">
                                                            Recommended
                                                        </span>
                                                    )}
                                                    <div className="font-semibold text-slate-800 dark:text-slate-200 mb-1">
                                                        {provider.label}
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        {provider.description}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* SMTP Configuration */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <Input
                                                label="SMTP Host"
                                                type="text"
                                                value={data.email_host}
                                                onChange={(e) => setData("email_host", e.target.value)}
                                                error={errors.email_host}
                                                placeholder="smtp.gmail.com"
                                                required={data.email_enabled}
                                            />
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <Input
                                                label="Port"
                                                type="number"
                                                value={data.email_port}
                                                onChange={(e) => setData("email_port", parseInt(e.target.value))}
                                                error={errors.email_port}
                                                placeholder="587"
                                                required={data.email_enabled}
                                            />
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                    Encryption
                                                </label>
                                                <select
                                                    value={data.email_encryption}
                                                    onChange={(e) => setData("email_encryption", e.target.value)}
                                                    className="w-full h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                                >
                                                    <option value="tls">TLS</option>
                                                    <option value="ssl">SSL</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <Input
                                                label="Email Username"
                                                type="email"
                                                value={data.email_username}
                                                onChange={(e) => setData("email_username", e.target.value)}
                                                error={errors.email_username}
                                                placeholder="your-email@gmail.com"
                                                required={data.email_enabled}
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                label="Email Password / App Password"
                                                type="password"
                                                value={data.email_password}
                                                onChange={(e) => setData("email_password", e.target.value)}
                                                error={errors.email_password}
                                                placeholder="Your app password"
                                                required={data.email_enabled}
                                            />
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                                Untuk Gmail: Gunakan App Password
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div>
                                            <Input
                                                label="From Email Address"
                                                type="email"
                                                value={data.email_from_address}
                                                onChange={(e) => setData("email_from_address", e.target.value)}
                                                error={errors.email_from_address}
                                                placeholder="noreply@yourdomain.com"
                                                required={data.email_enabled}
                                            />
                                        </div>

                                        <div>
                                            <Input
                                                label="From Name"
                                                type="text"
                                                value={data.email_from_name}
                                                onChange={(e) => setData("email_from_name", e.target.value)}
                                                error={errors.email_from_name}
                                                placeholder="POS System"
                                            />
                                        </div>
                                    </div>

                                    {/* Documentation Links */}
                                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 mb-6">
                                        <div className="flex items-start gap-3">
                                            <IconInfoCircle size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
                                            <div className="flex-1">
                                                <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
                                                    Setup Guide & Documentation
                                                </h4>
                                                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                                                    <li>
                                                        <a
                                                            href="/EMAIL-SETUP-GUIDE.md"
                                                            target="_blank"
                                                            className="hover:underline inline-flex items-center gap-1"
                                                        >
                                                            Email Setup Guide
                                                            <IconExternalLink size={14} />
                                                        </a>
                                                    </li>
                                                    <li>
                                                        <a
                                                            href="/configure-email.php"
                                                            target="_blank"
                                                            className="hover:underline inline-flex items-center gap-1"
                                                        >
                                                            CLI Configuration Script
                                                            <IconExternalLink size={14} />
                                                        </a>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Settings */}
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">
                                            Message Settings
                                        </h4>
                                        <div className="space-y-3">
                                            <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                                                <Checkbox
                                                    checked={data.email_send_receipt}
                                                    onChange={(e) => setData("email_send_receipt", e.target.checked)}
                                                />
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                        Send Receipt After Transaction
                                                    </div>
                                                    <div className="text-xs text-slate-500 dark:text-slate-400">
                                                        Kirim struk otomatis via email setelah transaksi selesai
                                                    </div>
                                                </div>
                                            </label>

                                            {data.email_send_receipt && (
                                                <div className="ml-10 mt-2">
                                                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                                        Custom Message (Optional)
                                                    </label>
                                                    <textarea
                                                        value={data.email_receipt_message}
                                                        onChange={(e) => setData("email_receipt_message", e.target.value)}
                                                        placeholder="Terima kasih atas pembelian Anda!"
                                                        rows="3"
                                                        className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Test Email */}
                                    <div className="border-t border-slate-200 dark:border-slate-700 pt-6 mt-6">
                                        <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">
                                            Test Email Connection
                                        </h4>
                                        <div className="flex gap-3">
                                            <input
                                                type="email"
                                                value={testEmailAddress}
                                                onChange={(e) => setTestEmailAddress(e.target.value)}
                                                placeholder="test@example.com"
                                                className="flex-1 h-11 px-4 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                                            />
                                            <button
                                                type="button"
                                                onClick={handleTestEmail}
                                                disabled={testingEmail || !data.email_enabled}
                                                className="px-4 h-11 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
                                            >
                                                {testingEmail ? (
                                                    <>
                                                        <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                                                        Sending...
                                                    </>
                                                ) : (
                                                    <>
                                                        <IconSend size={18} />
                                                        Send Test
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                                            Masukkan alamat email untuk menerima email test
                                        </p>
                                    </div>
                                </>
                            )}
                            </div>
                        </div>

                        {/* SMS Integration (Coming Soon) */}
                        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 opacity-60">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                                        <IconMessage size={24} className="text-orange-600" />
                                        SMS Notification
                                        <span className="text-xs bg-slate-200 dark:bg-slate-700 px-2 py-1 rounded">
                                            Coming Soon
                                        </span>
                                    </h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                        Kirim notifikasi via SMS
                                    </p>
                                </div>
                                <Checkbox disabled />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <div className="sticky bottom-0 bg-slate-50 dark:bg-slate-900/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800 p-4 sm:p-6 -mx-3 sm:-mx-4 lg:-mx-6 mt-6">
                            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                    <p className="font-medium mb-1">💡 Tips:</p>
                                    <ul className="space-y-0.5 text-xs">
                                        <li>• Test koneksi sebelum menyimpan untuk memastikan konfigurasi benar</li>
                                        <li>• Aktifkan notifikasi untuk meningkatkan customer engagement</li>
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
                                            <span>Simpan Pengaturan</span>
                                            <IconCheck size={16} className="opacity-70" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
