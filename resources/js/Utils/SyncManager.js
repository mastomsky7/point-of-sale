import offlineDB from './OfflineDB';
import axios from 'axios';

class SyncManager {
    constructor() {
        this.isSyncing = false;
        this.syncInterval = null;
        this.listeners = new Set();
    }

    // Initialize sync manager
    async init() {
        await offlineDB.init();

        // Set up online/offline listeners
        window.addEventListener('online', () => this.handleOnline());
        window.addEventListener('offline', () => this.handleOffline());

        // Check if already online
        if (navigator.onLine) {
            await this.syncAll();
        }

        // Periodic sync every 5 minutes when online
        this.syncInterval = setInterval(() => {
            if (navigator.onLine && !this.isSyncing) {
                this.syncAll();
            }
        }, 5 * 60 * 1000);
    }

    // Subscribe to sync events
    subscribe(listener) {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    }

    // Emit event to listeners
    emit(event, data) {
        this.listeners.forEach(listener => listener(event, data));
    }

    // Handle online event
    async handleOnline() {
        console.log('[SyncManager] Back online');
        this.emit('online', null);

        // Wait a bit for connection to stabilize
        setTimeout(() => this.syncAll(), 1000);
    }

    // Handle offline event
    handleOffline() {
        console.log('[SyncManager] Gone offline');
        this.emit('offline', null);
    }

    // Sync all pending data
    async syncAll() {
        if (this.isSyncing || !navigator.onLine) {
            return;
        }

        this.isSyncing = true;
        this.emit('sync-start', null);

        try {
            // Sync in order of priority
            await this.pullMasterData();
            await this.pushTransactions();
            await this.pushAppointments();
            await this.processSyncQueue();

            this.emit('sync-complete', null);
            console.log('[SyncManager] Sync completed successfully');
        } catch (error) {
            console.error('[SyncManager] Sync error:', error);
            this.emit('sync-error', error);
        } finally {
            this.isSyncing = false;
        }
    }

    // Pull master data from server
    async pullMasterData() {
        try {
            // Get last sync timestamp
            const lastSync = await offlineDB.getSetting('last_sync');

            // Fetch products
            const productsResponse = await axios.get('/api/sync/products', {
                params: { since: lastSync }
            });
            if (productsResponse.data.products) {
                await offlineDB.syncProducts(productsResponse.data.products);
                console.log('[SyncManager] Products synced:', productsResponse.data.products.length);
            }

            // Fetch services
            const servicesResponse = await axios.get('/api/sync/services', {
                params: { since: lastSync }
            });
            if (servicesResponse.data.services) {
                await offlineDB.syncServices(servicesResponse.data.services);
                console.log('[SyncManager] Services synced:', servicesResponse.data.services.length);
            }

            // Fetch customers
            const customersResponse = await axios.get('/api/sync/customers', {
                params: { since: lastSync }
            });
            if (customersResponse.data.customers) {
                await offlineDB.syncCustomers(customersResponse.data.customers);
                console.log('[SyncManager] Customers synced:', customersResponse.data.customers.length);
            }

            // Fetch staff
            const staffResponse = await axios.get('/api/sync/staff', {
                params: { since: lastSync }
            });
            if (staffResponse.data.staff) {
                await offlineDB.syncStaff(staffResponse.data.staff);
                console.log('[SyncManager] Staff synced:', staffResponse.data.staff.length);
            }

            // Update last sync timestamp
            await offlineDB.setSetting('last_sync', new Date().toISOString());

            this.emit('pull-complete', null);
        } catch (error) {
            console.error('[SyncManager] Pull error:', error);
            throw error;
        }
    }

    // Push offline transactions to server
    async pushTransactions() {
        try {
            const transactions = await offlineDB.getUnsyncedTransactions();

            if (transactions.length === 0) {
                return;
            }

            console.log('[SyncManager] Pushing', transactions.length, 'transactions');

            for (const transaction of transactions) {
                try {
                    const response = await axios.post('/api/sync/transactions', transaction);

                    if (response.data.success) {
                        await offlineDB.markTransactionSynced(transaction.id);
                        this.emit('transaction-synced', { id: transaction.id });
                    }
                } catch (error) {
                    console.error('[SyncManager] Failed to sync transaction:', transaction.id, error);
                    // Continue with next transaction
                }
            }

            this.emit('transactions-push-complete', { count: transactions.length });
        } catch (error) {
            console.error('[SyncManager] Transaction push error:', error);
            throw error;
        }
    }

    // Push offline appointments to server
    async pushAppointments() {
        try {
            const appointments = await offlineDB.getUnsyncedAppointments();

            if (appointments.length === 0) {
                return;
            }

            console.log('[SyncManager] Pushing', appointments.length, 'appointments');

            for (const appointment of appointments) {
                try {
                    const response = await axios.post('/api/sync/appointments', appointment);

                    if (response.data.success) {
                        await offlineDB.markAppointmentSynced(appointment.id);
                        this.emit('appointment-synced', { id: appointment.id });
                    }
                } catch (error) {
                    console.error('[SyncManager] Failed to sync appointment:', appointment.id, error);
                    // Continue with next appointment
                }
            }

            this.emit('appointments-push-complete', { count: appointments.length });
        } catch (error) {
            console.error('[SyncManager] Appointment push error:', error);
            throw error;
        }
    }

    // Process generic sync queue
    async processSyncQueue() {
        try {
            const queue = await offlineDB.getSyncQueue();

            if (queue.length === 0) {
                return;
            }

            console.log('[SyncManager] Processing sync queue:', queue.length, 'items');

            for (const item of queue) {
                try {
                    await this.processSyncQueueItem(item);
                    await offlineDB.markSyncQueueItemSynced(item.id);
                } catch (error) {
                    console.error('[SyncManager] Failed to process queue item:', item.id, error);
                    // Continue with next item
                }
            }

            this.emit('sync-queue-complete', { count: queue.length });
        } catch (error) {
            console.error('[SyncManager] Sync queue error:', error);
            throw error;
        }
    }

    // Process individual sync queue item
    async processSyncQueueItem(item) {
        const { type, data } = item;

        switch (type) {
            case 'update-customer':
                await axios.patch(`/api/customers/${data.id}`, data);
                break;

            case 'create-customer':
                await axios.post('/api/customers', data);
                break;

            case 'update-appointment':
                await axios.patch(`/api/appointments/${data.id}`, data);
                break;

            case 'cancel-appointment':
                await axios.post(`/api/appointments/${data.id}/cancel`, data);
                break;

            default:
                console.warn('[SyncManager] Unknown sync queue item type:', type);
        }
    }

    // Save transaction for later sync
    async saveOfflineTransaction(transactionData) {
        const id = await offlineDB.addOfflineTransaction(transactionData);
        this.emit('transaction-queued', { id });
        return id;
    }

    // Save appointment for later sync
    async saveOfflineAppointment(appointmentData) {
        const id = await offlineDB.addOfflineAppointment(appointmentData);
        this.emit('appointment-queued', { id });
        return id;
    }

    // Add item to sync queue
    async addToQueue(type, data) {
        const id = await offlineDB.addToSyncQueue(type, data);
        this.emit('queue-item-added', { id, type });
        return id;
    }

    // Check if online
    isOnline() {
        return navigator.onLine;
    }

    // Get pending sync count
    async getPendingCount() {
        const transactions = await offlineDB.getUnsyncedTransactions();
        const appointments = await offlineDB.getUnsyncedAppointments();
        const queue = await offlineDB.getSyncQueue();

        return {
            transactions: transactions.length,
            appointments: appointments.length,
            queue: queue.length,
            total: transactions.length + appointments.length + queue.length
        };
    }

    // Force sync now
    async forceSync() {
        return this.syncAll();
    }

    // Stop sync manager
    destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
        window.removeEventListener('online', this.handleOnline);
        window.removeEventListener('offline', this.handleOffline);
        this.listeners.clear();
    }
}

// Singleton instance
const syncManager = new SyncManager();

export default syncManager;
