import Swal from 'sweetalert2';

/**
 * Show confirmation dialog with SweetAlert2
 * @param {Object} options - Configuration options
 * @returns {Promise<boolean>} - Returns true if confirmed, false if cancelled
 */
export const confirmDialog = async ({
    title = 'Apakah Anda yakin?',
    text = 'Tindakan ini tidak dapat dibatalkan!',
    html = null,
    icon = 'warning',
    confirmButtonText = 'Ya, Lanjutkan!',
    cancelButtonText = 'Batal',
    confirmButtonColor = '#3085d6',
    cancelButtonColor = '#d33',
} = {}) => {
    const config = {
        title,
        icon,
        showCancelButton: true,
        confirmButtonColor,
        cancelButtonColor,
        confirmButtonText,
        cancelButtonText,
        reverseButtons: true,
    };

    // Use html if provided, otherwise use text
    if (html) {
        config.html = html;
    } else {
        config.text = text;
    }

    const result = await Swal.fire(config);

    return result.isConfirmed;
};

/**
 * Show success alert (full modal)
 */
export const successAlert = (title = 'Berhasil!', text = '') => {
    return Swal.fire({
        icon: 'success',
        title,
        text,
        confirmButtonColor: '#10b981',
    });
};

/**
 * Show error alert (full modal)
 */
export const errorAlert = (title = 'Gagal!', text = '') => {
    return Swal.fire({
        icon: 'error',
        title,
        text,
        confirmButtonColor: '#ef4444',
    });
};

/**
 * Show info alert (full modal)
 */
export const infoAlert = (title = 'Info', text = '') => {
    return Swal.fire({
        icon: 'info',
        title,
        text,
        confirmButtonColor: '#3b82f6',
    });
};

/**
 * Show success toast (small notification)
 * Returns void - fires and forgets
 */
export const successToast = (message = 'Berhasil!') => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.style.zIndex = '99999';
        }
    });

    Toast.fire({
        icon: 'success',
        title: message
    });
};

/**
 * Show error toast (small notification)
 * Returns void - fires and forgets
 */
export const errorToast = (message = 'Terjadi kesalahan!') => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.style.zIndex = '99999';
        }
    });

    Toast.fire({
        icon: 'error',
        title: message
    });
};

/**
 * Show info toast (small notification)
 * Returns void - fires and forgets
 */
export const infoToast = (message = 'Info') => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.style.zIndex = '99999';
        }
    });

    Toast.fire({
        icon: 'info',
        title: message
    });
};

/**
 * Show warning toast (small notification)
 * Returns void - fires and forgets
 */
export const warningToast = (message = 'Peringatan!') => {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.style.zIndex = '99999';
        }
    });

    Toast.fire({
        icon: 'warning',
        title: message
    });
};

/**
 * Show delete confirmation
 */
export const confirmDelete = async (itemName = '') => {
    return confirmDialog({
        title: 'Hapus Item?',
        text: itemName
            ? `Hapus "${itemName}"? Tindakan ini tidak dapat dibatalkan!`
            : 'Tindakan ini tidak dapat dibatalkan!',
        icon: 'warning',
        confirmButtonText: 'Ya, Hapus!',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#ef4444',
        cancelButtonColor: '#6b7280',
    });
};
