import { Head, Link } from "@inertiajs/react";
import {
    IconShoppingCart,
    IconReceipt,
    IconUsers,
    IconChartBar,
    IconPackage,
    IconTrendingUp,
    IconDeviceMobile,
    IconCheck,
    IconClock,
    IconShield,
    IconBolt,
    IconReportMoney,
} from "@tabler/icons-react";

export default function Welcome() {
    const features = [
        {
            icon: IconShoppingCart,
            title: "Transaksi Cepat",
            desc: "Proses jual beli dalam hitungan detik dengan interface yang intuitif",
        },
        {
            icon: IconReceipt,
            title: "Cetak Struk Otomatis",
            desc: "Support thermal printer 58mm, 80mm, dan invoice A4",
        },
        {
            icon: IconUsers,
            title: "Manajemen Pelanggan",
            desc: "Kelola data pelanggan dan riwayat transaksi dengan mudah",
        },
        {
            icon: IconPackage,
            title: "Inventori Produk",
            desc: "Stok realtime, kategori, dan barcode scanner ready",
        },
        {
            icon: IconChartBar,
            title: "Laporan Lengkap",
            desc: "Dashboard analytics, penjualan, dan profit realtime",
        },
        {
            icon: IconReportMoney,
            title: "Multi Payment Gateway",
            desc: "Tunai, QRIS, Transfer Bank, dan integrasi Midtrans",
        },
        {
            icon: IconClock,
            title: "Beauty Salon Support",
            desc: "Manage services, staff, appointments, dan komisi",
        },
        {
            icon: IconDeviceMobile,
            title: "Progressive Web App",
            desc: "Install di HP & desktop, offline mode ready",
        },
    ];

    const benefits = [
        "Transaksi lebih cepat 3x dibanding sistem konvensional",
        "Laporan keuangan realtime & akurat",
        "Multi-user dengan role & permission lengkap",
        "Responsive untuk desktop, tablet, & mobile",
        "Dark mode untuk kenyamanan mata",
        "Keyboard shortcuts untuk cashier expert",
    ];

    const techStack = [
        { name: "Laravel 12", color: "bg-red-500" },
        { name: "React 18", color: "bg-cyan-500" },
        { name: "Inertia.js", color: "bg-purple-500" },
        { name: "TailwindCSS", color: "bg-sky-500" },
        { name: "MySQL", color: "bg-orange-500" },
    ];

    return (
        <>
            <Head title="Point of Sale System - Modern & Powerful" />

            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
                {/* Navbar */}
                <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                                <IconShoppingCart
                                    size={22}
                                    className="text-white"
                                />
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                                POS System
                            </span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a
                                href="#features"
                                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"
                            >
                                Features
                            </a>
                            <a
                                href="#benefits"
                                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"
                            >
                                Benefits
                            </a>
                            <a
                                href="#tech"
                                className="text-sm font-medium text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"
                            >
                                Technology
                            </a>
                        </div>

                        <div className="flex items-center gap-3">
                            <Link
                                href="/login"
                                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl hover:from-primary-600 hover:to-primary-700 shadow-lg shadow-primary-500/30 transition-all flex items-center gap-2"
                            >
                                <IconShield size={18} />
                                Login
                            </Link>
                        </div>
                    </div>
                </nav>

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-6 relative overflow-hidden">
                    {/* Background decoration */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-40 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl" />
                        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
                    </div>

                    <div className="max-w-7xl mx-auto relative z-10">
                        <div className="text-center max-w-4xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-8 border border-primary-200 dark:border-primary-900">
                                <IconBolt size={16} />
                                Fast, Modern & Powerful POS
                            </div>

                            <h1 className="text-6xl md:text-7xl font-extrabold text-slate-900 dark:text-white leading-tight mb-6">
                                Point of Sale System
                                <span className="block mt-3 bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600 bg-clip-text text-transparent">
                                    Built for Success
                                </span>
                            </h1>

                            <p className="mt-8 text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto leading-relaxed">
                                Aplikasi kasir modern berbasis web untuk retail,
                                warung, toko, dan beauty salon. Kelola transaksi,
                                inventori, pelanggan, dan laporan dalam satu
                                platform yang powerful.
                            </p>

                            <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-5">
                                <Link
                                    href="/login"
                                    className="w-full sm:w-auto px-10 py-5 text-lg font-bold text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-2xl hover:from-primary-600 hover:to-primary-700 shadow-2xl shadow-primary-500/40 transition-all flex items-center justify-center gap-3 group"
                                >
                                    Get Started
                                    <IconShoppingCart
                                        size={22}
                                        className="group-hover:translate-x-1 transition-transform"
                                    />
                                </Link>
                                <a
                                    href="#features"
                                    className="w-full sm:w-auto px-10 py-5 text-lg font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl transition-all flex items-center justify-center gap-3"
                                >
                                    Learn More
                                </a>
                            </div>

                            {/* Stats */}
                            <div className="mt-16 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
                                {[
                                    { value: "99.9%", label: "Uptime" },
                                    { value: "3x", label: "Faster" },
                                    { value: "100%", label: "Secure" },
                                ].map((stat, i) => (
                                    <div key={i} className="text-center">
                                        <div className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                                            {stat.label}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Dashboard Preview */}
                        <div className="mt-20 relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-slate-950 to-transparent z-10 pointer-events-none h-32 bottom-0 top-auto" />
                            <div className="rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl bg-white dark:bg-slate-900">
                                <div className="bg-slate-100 dark:bg-slate-800 px-5 py-4 flex items-center gap-3 border-b border-slate-200 dark:border-slate-700">
                                    <div className="flex gap-2">
                                        <div className="w-3 h-3 rounded-full bg-red-400" />
                                        <div className="w-3 h-3 rounded-full bg-yellow-400" />
                                        <div className="w-3 h-3 rounded-full bg-green-400" />
                                    </div>
                                    <div className="flex-1 text-center text-sm text-slate-500 font-medium">
                                        dashboard.possystem.local
                                    </div>
                                </div>
                                <img
                                    src="/media/revamp-dashboard.png"
                                    alt="POS Dashboard Preview"
                                    className="w-full"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section
                    id="features"
                    className="py-24 px-6 bg-white dark:bg-slate-900"
                >
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-16">
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-6 border border-primary-200 dark:border-primary-900">
                                Complete Features
                            </div>
                            <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
                                Everything You Need
                            </h2>
                            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                                Semua fitur yang Anda butuhkan untuk mengelola
                                bisnis retail dan salon dalam satu platform
                                terintegrasi
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {features.map((feature, i) => (
                                <div
                                    key={i}
                                    className="group p-6 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg shadow-primary-500/30">
                                        <feature.icon
                                            size={28}
                                            className="text-white"
                                        />
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">
                                        {feature.title}
                                    </h3>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                                        {feature.desc}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Benefits Section */}
                <section id="benefits" className="py-24 px-6">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-6 border border-primary-200 dark:border-primary-900">
                                    Why Choose Us
                                </div>
                                <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
                                    Built for Performance & Reliability
                                </h2>
                                <p className="text-lg text-slate-600 dark:text-slate-400 mb-10">
                                    Sistem POS yang dirancang dengan teknologi
                                    modern untuk memberikan performa terbaik dan
                                    pengalaman pengguna yang optimal.
                                </p>

                                <div className="space-y-4">
                                    {benefits.map((benefit, i) => (
                                        <div
                                            key={i}
                                            className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                                        >
                                            <div className="w-6 h-6 rounded-full bg-primary-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <IconCheck
                                                    size={16}
                                                    className="text-white"
                                                />
                                            </div>
                                            <p className="text-slate-700 dark:text-slate-300 font-medium">
                                                {benefit}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative">
                                <div className="rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-2xl">
                                    <img
                                        src="/media/revamp-pos.png"
                                        alt="POS Interface"
                                        className="w-full"
                                    />
                                </div>
                                <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-primary-500/20 rounded-full blur-3xl -z-10" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Tech Stack */}
                <section
                    id="tech"
                    className="py-24 px-6 bg-white dark:bg-slate-900"
                >
                    <div className="max-w-7xl mx-auto text-center">
                        <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400 text-sm font-semibold mb-6 border border-primary-200 dark:border-primary-900">
                            Powered By
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 dark:text-white mb-6">
                            Modern Technology Stack
                        </h2>
                        <p className="text-lg text-slate-600 dark:text-slate-400 mb-14 max-w-2xl mx-auto">
                            Dibangun dengan teknologi terkini yang cepat,
                            scalable, dan mudah di-maintain
                        </p>

                        <div className="flex flex-wrap justify-center gap-6">
                            {techStack.map((tech, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 px-8 py-4 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all hover:shadow-xl"
                                >
                                    <div
                                        className={`w-4 h-4 rounded-full ${tech.color} shadow-lg`}
                                    />
                                    <span className="font-bold text-lg text-slate-700 dark:text-slate-300">
                                        {tech.name}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA */}
                <section className="py-24 px-6">
                    <div className="max-w-5xl mx-auto">
                        <div className="relative overflow-hidden bg-gradient-to-r from-primary-500 via-primary-600 to-purple-600 rounded-3xl p-12 md:p-16 text-center text-white shadow-2xl">
                            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
                            <div className="relative z-10">
                                <h2 className="text-4xl md:text-5xl font-extrabold mb-6">
                                    Ready to Transform Your Business?
                                </h2>
                                <p className="text-xl opacity-95 mb-10 max-w-2xl mx-auto">
                                    Mulai gunakan sistem POS modern kami dan
                                    rasakan perbedaannya dalam mengelola bisnis
                                    Anda
                                </p>
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-3 px-10 py-5 bg-white text-primary-600 font-bold text-lg rounded-2xl hover:bg-slate-50 hover:shadow-2xl transition-all"
                                >
                                    <IconShield size={24} />
                                    Login to Dashboard
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                                    <IconShoppingCart
                                        size={20}
                                        className="text-white"
                                    />
                                </div>
                                <span className="text-lg font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                                    POS System
                                </span>
                            </div>

                            <div className="flex flex-col md:flex-row items-center gap-6">
                                <a
                                    href="#features"
                                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"
                                >
                                    Features
                                </a>
                                <a
                                    href="#benefits"
                                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"
                                >
                                    Benefits
                                </a>
                                <a
                                    href="#tech"
                                    className="text-sm text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors"
                                >
                                    Technology
                                </a>
                            </div>

                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                © {new Date().getFullYear()} POS System. All
                                rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
