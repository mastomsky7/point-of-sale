import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';
import {
    IconDatabase,
    IconDownload,
    IconTrash,
    IconRefresh,
    IconClock,
    IconFileDatabase,
    IconAlertTriangle,
    IconCheck,
} from '@tabler/icons-react';
import { confirmDelete, confirmDialog, successToast, errorToast } from '@/Utils/SweetAlertHelper';

export default function Backup({ auth, backups = [], dbName, storageUsed }) {
    const [isCreating, setIsCreating] = useState(false);
    const [deletingFile, setDeletingFile] = useState(null);
    const [restoringFile, setRestoringFile] = useState(null);

    const handleCreateBackup = async () => {
        if (isCreating) return;

        const confirmed = await confirmDialog({
            title: 'Buat Backup?',
            text: 'Backup database akan dibuat sekarang',
            icon: 'question',
            confirmButtonText: 'Ya, Buat!',
            cancelButtonText: 'Batal'
        });

        if (confirmed) {
            setIsCreating(true);
            router.post(
                route('settings.backup.create'),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setIsCreating(false);
                        // Delay toast to ensure page is ready
                        setTimeout(() => {
                            successToast('Backup berhasil dibuat!');
                        }, 100);
                    },
                    onError: () => {
                        setIsCreating(false);
                        setTimeout(() => {
                            errorToast('Gagal membuat backup');
                        }, 100);
                    },
                }
            );
        }
    };

    const handleDownload = (filename) => {
        window.location.href = route('settings.backup.download', filename);
    };

    const handleDelete = async (filename) => {
        const confirmed = await confirmDelete(`backup ${filename}`);
        if (confirmed) {
            setDeletingFile(filename);
            router.delete(route('settings.backup.delete', filename), {
                preserveState: true,
                preserveScroll: true,
                onSuccess: () => {
                    setDeletingFile(null);
                    setTimeout(() => {
                        successToast('Backup berhasil dihapus');
                    }, 100);
                },
                onError: () => {
                    setDeletingFile(null);
                    setTimeout(() => {
                        errorToast('Gagal menghapus backup');
                    }, 100);
                },
            });
        }
    };

    const handleRestore = async (filename) => {
        const confirmed = await confirmDialog({
            title: '⚠️ PERINGATAN!',
            html: `
                <div style="text-align: left;">
                    <p style="margin-bottom: 12px;">Restore database dari backup: <strong>${filename}</strong>?</p>
                    <ul style="margin: 0; padding-left: 20px; color: #dc2626;">
                        <li>Semua data saat ini akan DIGANTI dengan data dari backup!</li>
                        <li>Proses ini TIDAK BISA dibatalkan!</li>
                    </ul>
                </div>
            `,
            icon: 'warning',
            confirmButtonText: 'Ya, Restore!',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#dc2626'
        });

        if (confirmed) {
            setRestoringFile(filename);
            router.post(
                route('settings.backup.restore', filename),
                {},
                {
                    preserveState: true,
                    preserveScroll: true,
                    onSuccess: () => {
                        setRestoringFile(null);
                        setTimeout(() => {
                            successToast('Database berhasil di-restore!');
                            setTimeout(() => {
                                window.location.reload();
                            }, 2000);
                        }, 100);
                    },
                    onError: () => {
                        setRestoringFile(null);
                        setTimeout(() => {
                            errorToast('Gagal restore database');
                        }, 100);
                    },
                }
            );
        }
    };

    return (
        <AuthenticatedLayout user={auth.user}>
            <Head title="Backup Database" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                        <IconDatabase size={32} className="text-primary-600 dark:text-primary-400" />
                        Backup Database
                    </h1>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        Kelola backup database untuk keamanan data Anda
                    </p>
                </div>

                {/* Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                <IconFileDatabase className="text-blue-600 dark:text-blue-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Database</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{dbName}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                <IconDatabase className="text-green-600 dark:text-green-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Total Backup</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">
                                    {backups.length} file
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                                <IconClock className="text-purple-600 dark:text-purple-400" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-gray-600 dark:text-gray-400">Storage Used</p>
                                <p className="text-lg font-semibold text-gray-900 dark:text-white">{storageUsed}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Create Backup Button */}
                <div className="mb-6">
                    <button
                        onClick={handleCreateBackup}
                        disabled={isCreating}
                        className="inline-flex items-center px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
                    >
                        {isCreating ? (
                            <>
                                <IconRefresh className="animate-spin mr-2" size={20} />
                                Membuat Backup...
                            </>
                        ) : (
                            <>
                                <IconDatabase className="mr-2" size={20} />
                                Buat Backup Sekarang
                            </>
                        )}
                    </button>
                </div>

                {/* Warning Info */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <IconAlertTriangle className="text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                                Penting!
                            </h3>
                            <ul className="text-sm text-yellow-700 dark:text-yellow-400 space-y-1">
                                <li>• Backup dilakukan untuk seluruh database</li>
                                <li>• Proses restore akan mengganti semua data saat ini</li>
                                <li>• Simpan backup di lokasi aman (download & simpan offline)</li>
                                <li>• Buat backup secara berkala untuk keamanan data</li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Backup List */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Daftar Backup</h2>
                    </div>

                    {backups.length === 0 ? (
                        <div className="px-6 py-12 text-center">
                            <IconFileDatabase className="mx-auto text-gray-400 dark:text-gray-600 mb-3" size={48} />
                            <p className="text-gray-500 dark:text-gray-400">Belum ada backup</p>
                            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                                Klik tombol "Buat Backup Sekarang" untuk membuat backup pertama
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-900">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            File
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Size
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Created
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {backups.map((backup, index) => (
                                        <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <IconFileDatabase className="text-gray-400 dark:text-gray-600 mr-3" size={20} />
                                                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                                                        {backup.filename}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {backup.size}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-gray-600 dark:text-gray-400">
                                                    {backup.created_at}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex items-center justify-end gap-2">
                                                    {/* Download */}
                                                    <button
                                                        onClick={() => handleDownload(backup.filename)}
                                                        className="inline-flex items-center px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                                                        title="Download"
                                                    >
                                                        <IconDownload size={16} />
                                                    </button>

                                                    {/* Restore */}
                                                    <button
                                                        onClick={() => handleRestore(backup.filename)}
                                                        disabled={restoringFile === backup.filename}
                                                        className="inline-flex items-center px-3 py-1.5 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-md transition-colors disabled:cursor-not-allowed"
                                                        title="Restore"
                                                    >
                                                        {restoringFile === backup.filename ? (
                                                            <IconRefresh size={16} className="animate-spin" />
                                                        ) : (
                                                            <IconCheck size={16} />
                                                        )}
                                                    </button>

                                                    {/* Delete */}
                                                    <button
                                                        onClick={() => handleDelete(backup.filename)}
                                                        disabled={deletingFile === backup.filename}
                                                        className="inline-flex items-center px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white rounded-md transition-colors disabled:cursor-not-allowed"
                                                        title="Delete"
                                                    >
                                                        {deletingFile === backup.filename ? (
                                                            <IconRefresh size={16} className="animate-spin" />
                                                        ) : (
                                                            <IconTrash size={16} />
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
