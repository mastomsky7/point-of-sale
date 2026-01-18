// IndexedDB helper for offline data storage
const DB_NAME = 'pos-offline-db';
const DB_VERSION = 1;

class OfflineDB {
    constructor() {
        this.db = null;
    }

    async init() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = () => reject(request.error);
            request.onsuccess = () => {
                this.db = request.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                // Products store
                if (!db.objectStoreNames.contains('products')) {
                    const productStore = db.createObjectStore('products', { keyPath: 'id' });
                    productStore.createIndex('barcode', 'barcode', { unique: false });
                    productStore.createIndex('category_id', 'category_id', { unique: false });
                }

                // Services store
                if (!db.objectStoreNames.contains('services')) {
                    const serviceStore = db.createObjectStore('services', { keyPath: 'id' });
                    serviceStore.createIndex('category_id', 'category_id', { unique: false });
                    serviceStore.createIndex('is_active', 'is_active', { unique: false });
                }

                // Customers store
                if (!db.objectStoreNames.contains('customers')) {
                    const customerStore = db.createObjectStore('customers', { keyPath: 'id' });
                    customerStore.createIndex('phone', 'no_telp', { unique: false });
                }

                // Staff store
                if (!db.objectStoreNames.contains('staff')) {
                    const staffStore = db.createObjectStore('staff', { keyPath: 'id' });
                    staffStore.createIndex('is_active', 'is_active', { unique: false });
                }

                // Categories store
                if (!db.objectStoreNames.contains('categories')) {
                    db.createObjectStore('categories', { keyPath: 'id' });
                }

                // Offline transactions queue
                if (!db.objectStoreNames.contains('transactions')) {
                    const transactionStore = db.createObjectStore('transactions', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    transactionStore.createIndex('synced', 'synced', { unique: false });
                    transactionStore.createIndex('created_at', 'created_at', { unique: false });
                }

                // Offline appointments queue
                if (!db.objectStoreNames.contains('appointments')) {
                    const appointmentStore = db.createObjectStore('appointments', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    appointmentStore.createIndex('synced', 'synced', { unique: false });
                    appointmentStore.createIndex('appointment_date', 'appointment_date', { unique: false });
                }

                // Sync queue
                if (!db.objectStoreNames.contains('sync_queue')) {
                    const syncStore = db.createObjectStore('sync_queue', {
                        keyPath: 'id',
                        autoIncrement: true
                    });
                    syncStore.createIndex('type', 'type', { unique: false });
                    syncStore.createIndex('synced', 'synced', { unique: false });
                }

                // Settings store
                if (!db.objectStoreNames.contains('settings')) {
                    db.createObjectStore('settings', { keyPath: 'key' });
                }
            };
        });
    }

    // Generic CRUD operations
    async add(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.add(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async put(storeName, data) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.put(data);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async get(storeName, key) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.get(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async getAll(storeName) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async delete(storeName, key) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.delete(key);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async clear(storeName) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        return new Promise((resolve, reject) => {
            const request = store.clear();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async bulkPut(storeName, dataArray) {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);

        const promises = dataArray.map(data => {
            return new Promise((resolve, reject) => {
                const request = store.put(data);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
            });
        });

        return Promise.all(promises);
    }

    // Index queries
    async getByIndex(storeName, indexName, value) {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);

        return new Promise((resolve, reject) => {
            const request = index.getAll(value);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    // Product-specific methods
    async syncProducts(products) {
        await this.clear('products');
        return this.bulkPut('products', products);
    }

    async getProductByBarcode(barcode) {
        const products = await this.getByIndex('products', 'barcode', barcode);
        return products[0] || null;
    }

    // Service-specific methods
    async syncServices(services) {
        await this.clear('services');
        return this.bulkPut('services', services);
    }

    async getActiveServices() {
        return this.getByIndex('services', 'is_active', true);
    }

    // Customer-specific methods
    async syncCustomers(customers) {
        await this.clear('customers');
        return this.bulkPut('customers', customers);
    }

    // Staff-specific methods
    async syncStaff(staff) {
        await this.clear('staff');
        return this.bulkPut('staff', staff);
    }

    async getActiveStaff() {
        return this.getByIndex('staff', 'is_active', true);
    }

    // Transaction queue methods
    async addOfflineTransaction(transaction) {
        return this.add('transactions', {
            ...transaction,
            synced: false,
            created_at: new Date().toISOString(),
        });
    }

    async getUnsyncedTransactions() {
        return this.getByIndex('transactions', 'synced', false);
    }

    async markTransactionSynced(id) {
        const transaction = await this.get('transactions', id);
        if (transaction) {
            transaction.synced = true;
            transaction.synced_at = new Date().toISOString();
            return this.put('transactions', transaction);
        }
    }

    // Appointment queue methods
    async addOfflineAppointment(appointment) {
        return this.add('appointments', {
            ...appointment,
            synced: false,
            created_at: new Date().toISOString(),
        });
    }

    async getUnsyncedAppointments() {
        return this.getByIndex('appointments', 'synced', false);
    }

    async markAppointmentSynced(id) {
        const appointment = await this.get('appointments', id);
        if (appointment) {
            appointment.synced = true;
            appointment.synced_at = new Date().toISOString();
            return this.put('appointments', appointment);
        }
    }

    // Sync queue methods
    async addToSyncQueue(type, data) {
        return this.add('sync_queue', {
            type,
            data,
            synced: false,
            created_at: new Date().toISOString(),
        });
    }

    async getSyncQueue() {
        return this.getByIndex('sync_queue', 'synced', false);
    }

    async markSyncQueueItemSynced(id) {
        const item = await this.get('sync_queue', id);
        if (item) {
            item.synced = true;
            item.synced_at = new Date().toISOString();
            return this.put('sync_queue', item);
        }
    }

    // Settings methods
    async getSetting(key, defaultValue = null) {
        const setting = await this.get('settings', key);
        return setting ? setting.value : defaultValue;
    }

    async setSetting(key, value) {
        return this.put('settings', { key, value });
    }
}

// Singleton instance
const offlineDB = new OfflineDB();

export default offlineDB;
