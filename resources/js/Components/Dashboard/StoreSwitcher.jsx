import { useState, Fragment } from 'react';
import { router, usePage } from '@inertiajs/react';
import { Menu, Transition } from '@headlessui/react';
import { ChevronDownIcon, CheckIcon, BuildingStorefrontIcon } from '@heroicons/react/24/outline';

export default function StoreSwitcher({ stores, currentStore }) {
    const [switching, setSwitching] = useState(false);

    const switchStore = (storeId) => {
        if (storeId === currentStore?.id) return;

        setSwitching(true);
        router.post('/dashboard/switch-store',
            { store_id: storeId },
            {
                preserveScroll: true,
                onFinish: () => setSwitching(false),
            }
        );
    };

    if (!stores || stores.length <= 1) {
        return null;
    }

    return (
        <Menu as="div" className="relative inline-block text-left">
            <div>
                <Menu.Button className="inline-flex w-full justify-center items-center gap-x-2 rounded-md bg-white dark:bg-slate-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-gray-100 shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-700 hover:bg-gray-50 dark:hover:bg-slate-700">
                    <BuildingStorefrontIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                    <span className="hidden sm:inline">{currentStore?.name || 'Select Store'}</span>
                    <ChevronDownIcon className="h-4 w-4 text-gray-400" aria-hidden="true" />
                    {switching && (
                        <div className="ml-1 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600" />
                    )}
                </Menu.Button>
            </div>

            <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
            >
                <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <div className="py-1">
                        <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                            Switch Store
                        </div>
                        {stores.map((store) => (
                            <Menu.Item key={store.id}>
                                {({ active }) => (
                                    <button
                                        onClick={() => switchStore(store.id)}
                                        className={`${
                                            active ? 'bg-gray-100 dark:bg-slate-700' : ''
                                        } ${
                                            store.id === currentStore?.id ? 'bg-blue-50 dark:bg-slate-700' : ''
                                        } group flex w-full items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300`}
                                        disabled={switching}
                                    >
                                        <div className="flex-1 flex items-center">
                                            <BuildingStorefrontIcon className="mr-3 h-5 w-5 text-gray-400 group-hover:text-gray-500" aria-hidden="true" />
                                            <div className="flex flex-col items-start">
                                                <span className="font-medium">{store.name}</span>
                                                {store.code && (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">{store.code}</span>
                                                )}
                                            </div>
                                        </div>
                                        {store.id === currentStore?.id && (
                                            <CheckIcon className="h-5 w-5 text-blue-600" aria-hidden="true" />
                                        )}
                                    </button>
                                )}
                            </Menu.Item>
                        ))}
                    </div>
                </Menu.Items>
            </Transition>
        </Menu>
    );
}
