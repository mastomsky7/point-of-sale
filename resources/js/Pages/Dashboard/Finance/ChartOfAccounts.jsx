import React, { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import {
    IconList,
    IconPlus,
    IconSearch,
    IconFilter,
    IconChevronDown,
    IconChevronRight,
    IconEdit,
    IconTrash,
    IconCircleCheck,
    IconCircleX,
} from '@tabler/icons-react';

export default function ChartOfAccounts({ auth, title, accounts, accountsByType, types, filters }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState(filters?.type || '');
    const [showActiveOnly, setShowActiveOnly] = useState(filters?.is_active !== undefined ? filters.is_active : true);
    const [expandedTypes, setExpandedTypes] = useState(new Set(['asset', 'liability', 'equity', 'revenue', 'expense']));

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount || 0);
    };

    // Toggle type expansion
    const toggleType = (type) => {
        const newExpanded = new Set(expandedTypes);
        if (newExpanded.has(type)) {
            newExpanded.delete(type);
        } else {
            newExpanded.add(type);
        }
        setExpandedTypes(newExpanded);
    };

    // Filter accounts
    const handleFilter = () => {
        router.get('/finance/chart-of-accounts', {
            type: selectedType,
            is_active: showActiveOnly ? 1 : undefined,
        }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Reset filters
    const handleResetFilters = () => {
        setSelectedType('');
        setShowActiveOnly(true);
        router.get('/finance/chart-of-accounts', {}, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    // Get type color
    const getTypeColor = (type) => {
        const colors = {
            asset: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
            liability: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
            equity: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20',
            revenue: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20',
            expense: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20',
        };
        return colors[type] || 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/20';
    };

    // Get type label
    const getTypeLabel = (type) => {
        const labels = {
            asset: 'Asset',
            liability: 'Liability',
            equity: 'Equity',
            revenue: 'Revenue',
            expense: 'Expense',
        };
        return labels[type] || type;
    };

    // Filter accounts by search
    const filteredAccountsByType = accountsByType ? Object.entries(accountsByType).reduce((acc, [type, typeAccounts]) => {
        const filtered = typeAccounts.filter(account =>
            account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            account.code.toLowerCase().includes(searchQuery.toLowerCase())
        );
        if (filtered.length > 0) {
            acc[type] = filtered;
        }
        return acc;
    }, {}) : {};

    // Build hierarchical tree
    const buildTree = (accounts) => {
        const accountMap = {};
        const roots = [];

        accounts.forEach(account => {
            accountMap[account.id] = { ...account, children: [] };
        });

        accounts.forEach(account => {
            if (account.parent_id) {
                const parent = accountMap[account.parent_id];
                if (parent) {
                    parent.children.push(accountMap[account.id]);
                } else {
                    roots.push(accountMap[account.id]);
                }
            } else {
                roots.push(accountMap[account.id]);
            }
        });

        return roots;
    };

    // Render account row
    const renderAccountRow = (account, level = 0) => {
        const hasChildren = account.children && account.children.length > 0;
        const paddingLeft = `${level * 2}rem`;

        return (
            <React.Fragment key={account.id}>
                <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border-b border-slate-200 dark:border-slate-700">
                    <td className="px-4 py-3" style={{ paddingLeft }}>
                        <div className="flex items-center gap-2">
                            {hasChildren && (
                                <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                                    <IconChevronRight size={16} />
                                </button>
                            )}
                            <span className="font-mono text-sm text-slate-600 dark:text-slate-400">{account.code}</span>
                        </div>
                    </td>
                    <td className="px-4 py-3">
                        <span className={`font-medium ${level === 0 ? 'text-slate-900 dark:text-slate-100' : 'text-slate-700 dark:text-slate-300'}`}>
                            {account.name}
                        </span>
                    </td>
                    <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(account.type)}`}>
                            {getTypeLabel(account.type)}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                            {formatCurrency(account.balance)}
                        </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                        {account.is_active ? (
                            <IconCircleCheck size={20} className="text-green-600 dark:text-green-400 inline" />
                        ) : (
                            <IconCircleX size={20} className="text-slate-400 dark:text-slate-600 inline" />
                        )}
                    </td>
                    <td className="px-4 py-3">
                        <div className="flex items-center gap-2 justify-end">
                            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors text-slate-600 dark:text-slate-400">
                                <IconEdit size={16} />
                            </button>
                            <button className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-colors text-red-600 dark:text-red-400">
                                <IconTrash size={16} />
                            </button>
                        </div>
                    </td>
                </tr>
                {hasChildren && account.children.map(child => renderAccountRow(child, level + 1))}
            </React.Fragment>
        );
    };

    return (
        <AuthenticatedLayout auth={auth}>
            <Head title={title || 'Chart of Accounts'} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-3">
                                <IconList size={32} className="text-primary-600 dark:text-primary-400" />
                                Chart of Accounts
                            </h1>
                            <p className="mt-2 text-slate-600 dark:text-slate-400">
                                Manage your accounting chart of accounts
                            </p>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                            <IconPlus size={20} />
                            Add Account
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Search
                            </label>
                            <div className="relative">
                                <IconSearch size={20} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search accounts..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Account Type
                            </label>
                            <select
                                value={selectedType}
                                onChange={(e) => setSelectedType(e.target.value)}
                                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                            >
                                <option value="">All Types</option>
                                {types && types.map((type) => (
                                    <option key={type} value={type}>{getTypeLabel(type)}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Status
                            </label>
                            <div className="flex items-center h-10">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={showActiveOnly}
                                        onChange={(e) => setShowActiveOnly(e.target.checked)}
                                        className="w-4 h-4 text-primary-600 border-slate-300 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm text-slate-700 dark:text-slate-300">Show active only</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Actions
                            </label>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleFilter}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
                                >
                                    <IconFilter size={16} />
                                    Apply
                                </button>
                                <button
                                    onClick={handleResetFilters}
                                    className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
                                >
                                    Reset
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Accounts by Type */}
                <div className="space-y-6">
                    {Object.entries(filteredAccountsByType).map(([type, typeAccounts]) => {
                        const tree = buildTree(typeAccounts);
                        const isExpanded = expandedTypes.has(type);
                        const totalBalance = typeAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || 0), 0);

                        return (
                            <div key={type} className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                                {/* Type Header */}
                                <button
                                    onClick={() => toggleType(type)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        {isExpanded ? <IconChevronDown size={20} /> : <IconChevronRight size={20} />}
                                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(type)}`}>
                                            {getTypeLabel(type)}
                                        </span>
                                        <span className="text-sm text-slate-600 dark:text-slate-400">
                                            {typeAccounts.length} account{typeAccounts.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm text-slate-600 dark:text-slate-400 mr-2">Total Balance:</span>
                                        <span className="font-bold text-slate-900 dark:text-slate-100">
                                            {formatCurrency(totalBalance)}
                                        </span>
                                    </div>
                                </button>

                                {/* Accounts Table */}
                                {isExpanded && (
                                    <div className="overflow-x-auto">
                                        <table className="w-full">
                                            <thead className="bg-slate-50 dark:bg-slate-700/50 border-y border-slate-200 dark:border-slate-700">
                                                <tr>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                        Code
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                        Account Name
                                                    </th>
                                                    <th className="px-4 py-3 text-left text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                        Type
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                        Balance
                                                    </th>
                                                    <th className="px-4 py-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                        Active
                                                    </th>
                                                    <th className="px-4 py-3 text-right text-xs font-medium text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                                                        Actions
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {tree.map(account => renderAccountRow(account))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {Object.keys(filteredAccountsByType).length === 0 && (
                    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center">
                        <IconList size={64} className="mx-auto mb-4 text-slate-400 dark:text-slate-600" />
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
                            No accounts found
                        </h3>
                        <p className="text-slate-600 dark:text-slate-400 mb-6">
                            {searchQuery ? 'Try adjusting your search query or filters' : 'Get started by adding your first account'}
                        </p>
                        <button className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors">
                            <IconPlus size={20} />
                            Add Account
                        </button>
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
