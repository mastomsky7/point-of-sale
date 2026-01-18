import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function LandingPage({ features, pricing, testimonials, stats }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            <Head title="TokoSync - Satu Aplikasi, Semua Toko Terhubung" />

            <div className="min-h-screen bg-white">
                {/* Navigation */}
                <nav className="fixed w-full bg-white/95 backdrop-blur-sm shadow-sm z-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between h-16 items-center">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 flex items-center">
                                    <svg className="h-8 w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                    </svg>
                                    <span className="ml-2 text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                        TokoSync
                                    </span>
                                </div>
                            </div>

                            <div className="hidden md:flex items-center space-x-8">
                                <a href="#features" className="text-gray-700 hover:text-indigo-600 transition">Fitur</a>
                                <a href="#pricing" className="text-gray-700 hover:text-indigo-600 transition">Harga</a>
                                <a href="#testimonials" className="text-gray-700 hover:text-indigo-600 transition">Testimoni</a>
                                <Link
                                    href={route('login')}
                                    className="text-gray-700 hover:text-indigo-600 transition"
                                >
                                    Masuk
                                </Link>
                                <Link
                                    href={route('register')}
                                    className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full hover:shadow-lg transform hover:-translate-y-0.5 transition"
                                >
                                    Coba Gratis
                                </Link>
                            </div>

                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="md:hidden"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile menu */}
                    {mobileMenuOpen && (
                        <div className="md:hidden bg-white border-t">
                            <div className="px-2 pt-2 pb-3 space-y-1">
                                <a href="#features" className="block px-3 py-2 text-gray-700">Fitur</a>
                                <a href="#pricing" className="block px-3 py-2 text-gray-700">Harga</a>
                                <a href="#testimonials" className="block px-3 py-2 text-gray-700">Testimoni</a>
                                <Link href={route('login')} className="block px-3 py-2 text-gray-700">Masuk</Link>
                                <Link href={route('register')} className="block px-3 py-2 bg-indigo-600 text-white rounded-lg mt-2">Coba Gratis</Link>
                            </div>
                        </div>
                    )}
                </nav>

                {/* Hero Section */}
                <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid md:grid-cols-2 gap-12 items-center">
                            <div>
                                <div className="inline-block mb-4">
                                    <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-semibold">
                                        🚀 Platform POS #1 untuk Multi-Toko
                                    </span>
                                </div>
                                <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                                    Satu Aplikasi,
                                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Semua Toko Terhubung</span>
                                </h1>
                                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                    Kelola puluhan toko dalam satu dashboard. Data tersinkronisasi real-time, laporan lengkap, dan kontrol penuh dari mana saja.
                                </p>
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <Link
                                        href={route('register')}
                                        className="px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-full hover:shadow-xl transform hover:-translate-y-1 transition text-center"
                                    >
                                        Mulai Gratis 14 Hari →
                                    </Link>
                                    <a
                                        href="#demo"
                                        className="px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-full border-2 border-indigo-600 hover:bg-indigo-50 transition text-center"
                                    >
                                        Lihat Demo
                                    </a>
                                </div>
                                <div className="mt-8 flex items-center gap-6 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Tanpa Kartu Kredit
                                    </div>
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                        Setup 5 Menit
                                    </div>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="relative z-10 rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition duration-300">
                                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-8">
                                        <div className="bg-white rounded-lg p-6 shadow-lg">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="font-bold text-gray-900">Dashboard Overview</h3>
                                                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">LIVE</span>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4 mb-6">
                                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Total Penjualan</p>
                                                    <p className="text-2xl font-bold text-gray-900">Rp 125jt</p>
                                                    <p className="text-xs text-green-600">↑ 23% vs bulan lalu</p>
                                                </div>
                                                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                                                    <p className="text-sm text-gray-600">Transaksi</p>
                                                    <p className="text-2xl font-bold text-gray-900">8,542</p>
                                                    <p className="text-xs text-green-600">↑ 15% vs bulan lalu</p>
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Toko Kemang</span>
                                                    <span className="font-semibold">Rp 45jt</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Toko Senayan</span>
                                                    <span className="font-semibold">Rp 38jt</span>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-sm text-gray-600">Toko BSD</span>
                                                    <span className="font-semibold">Rp 42jt</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="absolute -z-10 top-10 -right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
                                <div className="absolute -z-10 top-10 -left-10 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
                                <div className="absolute -z-10 -bottom-10 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Stats Section */}
                <section className="py-16 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                            {stats.map((stat, index) => (
                                <div key={index} className="text-center">
                                    <div className="text-4xl font-extrabold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                                        {stat.value}
                                    </div>
                                    <div className="text-gray-600">{stat.label}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20 bg-gray-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                                Fitur Lengkap untuk
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Bisnis Modern</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Semua yang Anda butuhkan untuk mengelola dan mengembangkan bisnis retail Anda
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {features.map((feature, index) => (
                                <div
                                    key={index}
                                    className="bg-white p-8 rounded-2xl shadow-lg hover:shadow-2xl transition transform hover:-translate-y-2"
                                >
                                    <div className={`w-14 h-14 bg-gradient-to-br from-${feature.color}-400 to-${feature.color}-600 rounded-xl flex items-center justify-center mb-6`}>
                                        <FeatureIcon icon={feature.icon} />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                                    <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Pricing Section */}
                <section id="pricing" className="py-20 bg-white">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                                Harga yang
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Transparan</span>
                            </h2>
                            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                                Pilih paket yang sesuai dengan kebutuhan bisnis Anda. Semua paket sudah termasuk update dan support.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                            {pricing.map((plan, index) => (
                                <div
                                    key={index}
                                    className={`relative bg-white rounded-2xl shadow-xl overflow-hidden transform hover:scale-105 transition ${
                                        plan.popular ? 'ring-4 ring-indigo-600' : ''
                                    }`}
                                >
                                    {plan.popular && (
                                        <div className="absolute top-0 right-0 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-2 text-sm font-semibold rounded-bl-2xl">
                                            PALING POPULER
                                        </div>
                                    )}
                                    <div className="p-8">
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                                        <p className="text-gray-600 mb-6">{plan.description}</p>
                                        <div className="mb-6">
                                            <span className="text-5xl font-extrabold text-gray-900">
                                                {(plan.price / 1000).toFixed(0)}K
                                            </span>
                                            <span className="text-gray-600">/{plan.period}</span>
                                        </div>
                                        <Link
                                            href={route('register')}
                                            className={`block w-full text-center px-6 py-3 rounded-full font-semibold transition ${
                                                plan.popular
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg'
                                                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                                            }`}
                                        >
                                            Mulai Sekarang
                                        </Link>
                                        <ul className="mt-8 space-y-4">
                                            {plan.features.map((feature, featureIndex) => (
                                                <li key={featureIndex} className="flex items-start">
                                                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-gray-700">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <p className="text-gray-600 mb-4">
                                Butuh lebih dari 20 toko? <a href="#contact" className="text-indigo-600 font-semibold hover:underline">Hubungi tim sales kami</a>
                            </p>
                            <p className="text-sm text-gray-500">
                                💳 Terima semua metode pembayaran: Transfer Bank, QRIS, GoPay, OVO, Dana, ShopeePay
                            </p>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="py-20 bg-gradient-to-br from-indigo-50 to-purple-50">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
                                Dipercaya oleh
                                <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent"> Ribuan Bisnis</span>
                            </h2>
                            <p className="text-xl text-gray-600">
                                Lihat apa kata mereka tentang TokoSync
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="bg-white p-8 rounded-2xl shadow-lg">
                                    <div className="flex items-center mb-4">
                                        {[...Array(testimonial.rating)].map((_, i) => (
                                            <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                            </svg>
                                        ))}
                                    </div>
                                    <p className="text-gray-700 mb-6 italic">"{testimonial.comment}"</p>
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                                            {testimonial.avatar}
                                        </div>
                                        <div>
                                            <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                            <div className="text-sm text-gray-600">{testimonial.role}</div>
                                            <div className="text-xs text-gray-500">{testimonial.location}</div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600">
                    <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                            Siap Mengembangkan Bisnis Anda?
                        </h2>
                        <p className="text-xl text-indigo-100 mb-10">
                            Bergabunglah dengan 2,500+ bisnis yang sudah berkembang bersama TokoSync
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <Link
                                href={route('register')}
                                className="px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-full hover:shadow-2xl transform hover:-translate-y-1 transition"
                            >
                                Coba Gratis 14 Hari
                            </Link>
                            <a
                                href="https://wa.me/62812345678"
                                target="_blank"
                                className="px-8 py-4 bg-transparent border-2 border-white text-white text-lg font-semibold rounded-full hover:bg-white hover:text-indigo-600 transition"
                            >
                                💬 Hubungi via WhatsApp
                            </a>
                        </div>
                        <p className="mt-6 text-indigo-100 text-sm">
                            Tidak perlu kartu kredit • Setup 5 menit • Support 24/7
                        </p>
                    </div>
                </section>

                {/* Footer */}
                <footer className="bg-gray-900 text-white py-12">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="grid md:grid-cols-4 gap-8 mb-8">
                            <div>
                                <div className="flex items-center mb-4">
                                    <svg className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
                                    </svg>
                                    <span className="ml-2 text-xl font-bold">TokoSync</span>
                                </div>
                                <p className="text-gray-400 text-sm">
                                    Platform POS terpercaya untuk mengelola multi-toko dengan mudah.
                                </p>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4">Produk</h3>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li><a href="#features" className="hover:text-white transition">Fitur</a></li>
                                    <li><a href="#pricing" className="hover:text-white transition">Harga</a></li>
                                    <li><a href="#" className="hover:text-white transition">Integrasi</a></li>
                                    <li><a href="#" className="hover:text-white transition">API</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4">Perusahaan</h3>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li><a href="#" className="hover:text-white transition">Tentang Kami</a></li>
                                    <li><a href="#" className="hover:text-white transition">Blog</a></li>
                                    <li><a href="#" className="hover:text-white transition">Karir</a></li>
                                    <li><a href="#" className="hover:text-white transition">Kontak</a></li>
                                </ul>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-4">Dukungan</h3>
                                <ul className="space-y-2 text-sm text-gray-400">
                                    <li><a href="#" className="hover:text-white transition">Pusat Bantuan</a></li>
                                    <li><a href="#" className="hover:text-white transition">Tutorial</a></li>
                                    <li><a href="#" className="hover:text-white transition">Syarat & Ketentuan</a></li>
                                    <li><a href="#" className="hover:text-white transition">Kebijakan Privasi</a></li>
                                </ul>
                            </div>
                        </div>
                        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
                            <p>&copy; 2026 TokoSync. All rights reserved. Made with ❤️ in Indonesia</p>
                        </div>
                    </div>
                </footer>
            </div>

            <style jsx>{`
                @keyframes blob {
                    0% { transform: translate(0px, 0px) scale(1); }
                    33% { transform: translate(30px, -50px) scale(1.1); }
                    66% { transform: translate(-20px, 20px) scale(0.9); }
                    100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </>
    );
}

function FeatureIcon({ icon }) {
    const icons = {
        cloud: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
        ),
        chart: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
        ),
        mobile: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
        ),
        shield: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
        ),
        users: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
        ),
        wallet: (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
        ),
    };

    return icons[icon] || icons.cloud;
}
