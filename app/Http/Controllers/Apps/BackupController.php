<?php

namespace App\Http\Controllers\Apps;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class BackupController extends Controller
{
    /**
     * Display backup settings page
     */
    public function index()
    {
        // Get list of existing backups
        $backups = $this->getBackupList();

        return Inertia::render('Dashboard/Settings/Backup', [
            'backups' => $backups,
            'dbName' => env('DB_DATABASE'),
            'storageUsed' => $this->getStorageUsed(),
        ]);
    }

    /**
     * Create new database backup
     */
    public function create(Request $request)
    {
        try {
            $dbName = env('DB_DATABASE');
            $dbUser = env('DB_USERNAME');
            $dbPass = env('DB_PASSWORD');
            $dbHost = env('DB_HOST');

            // Create backup filename with timestamp
            $filename = 'backup_' . $dbName . '_' . Carbon::now()->format('Y-m-d_His') . '.sql';
            $backupPath = storage_path('app/backups');

            // Create backups directory if not exists
            if (!file_exists($backupPath)) {
                mkdir($backupPath, 0755, true);
            }

            $fullPath = $backupPath . '/' . $filename;

            // Build mysqldump command
            $command = sprintf(
                'mysqldump -h %s -u %s %s %s > %s',
                escapeshellarg($dbHost),
                escapeshellarg($dbUser),
                $dbPass ? '-p' . escapeshellarg($dbPass) : '',
                escapeshellarg($dbName),
                escapeshellarg($fullPath)
            );

            // Execute backup
            exec($command, $output, $returnCode);

            if ($returnCode === 0 && file_exists($fullPath)) {
                return redirect()->route('settings.backup.index')
                    ->with('success', 'Backup berhasil dibuat: ' . $filename);
            } else {
                throw new \Exception('Backup gagal dibuat. Return code: ' . $returnCode);
            }

        } catch (\Exception $e) {
            return redirect()->route('settings.backup.index')
                ->with('error', 'Backup gagal: ' . $e->getMessage());
        }
    }

    /**
     * Download backup file
     */
    public function download($filename)
    {
        $path = storage_path('app/backups/' . $filename);

        if (!file_exists($path)) {
            return redirect()->route('settings.backup.index')
                ->with('error', 'File backup tidak ditemukan');
        }

        return response()->download($path);
    }

    /**
     * Delete backup file
     */
    public function delete($filename)
    {
        try {
            $path = storage_path('app/backups/' . $filename);

            if (file_exists($path)) {
                unlink($path);
                return redirect()->route('settings.backup.index')
                    ->with('success', 'Backup berhasil dihapus');
            } else {
                return redirect()->route('settings.backup.index')
                    ->with('error', 'File backup tidak ditemukan');
            }
        } catch (\Exception $e) {
            return redirect()->route('settings.backup.index')
                ->with('error', 'Gagal menghapus backup: ' . $e->getMessage());
        }
    }

    /**
     * Restore database from backup
     */
    public function restore(Request $request, $filename)
    {
        try {
            $path = storage_path('app/backups/' . $filename);

            if (!file_exists($path)) {
                return redirect()->route('settings.backup.index')
                    ->with('error', 'File backup tidak ditemukan');
            }

            $dbName = env('DB_DATABASE');
            $dbUser = env('DB_USERNAME');
            $dbPass = env('DB_PASSWORD');
            $dbHost = env('DB_HOST');

            // Build mysql restore command
            $command = sprintf(
                'mysql -h %s -u %s %s %s < %s',
                escapeshellarg($dbHost),
                escapeshellarg($dbUser),
                $dbPass ? '-p' . escapeshellarg($dbPass) : '',
                escapeshellarg($dbName),
                escapeshellarg($path)
            );

            // Execute restore
            exec($command, $output, $returnCode);

            if ($returnCode === 0) {
                return redirect()->route('settings.backup.index')
                    ->with('success', 'Database berhasil di-restore dari backup: ' . $filename);
            } else {
                throw new \Exception('Restore gagal. Return code: ' . $returnCode);
            }

        } catch (\Exception $e) {
            return redirect()->route('settings.backup.index')
                ->with('error', 'Restore gagal: ' . $e->getMessage());
        }
    }

    /**
     * Get list of backup files
     */
    private function getBackupList()
    {
        $backupPath = storage_path('app/backups');

        if (!file_exists($backupPath)) {
            return [];
        }

        $files = scandir($backupPath);
        $backups = [];

        foreach ($files as $file) {
            if ($file != '.' && $file != '..' && pathinfo($file, PATHINFO_EXTENSION) === 'sql') {
                $filePath = $backupPath . '/' . $file;
                $backups[] = [
                    'filename' => $file,
                    'size' => $this->formatBytes(filesize($filePath)),
                    'size_bytes' => filesize($filePath),
                    'created_at' => Carbon::createFromTimestamp(filemtime($filePath))->format('d M Y, H:i'),
                    'created_timestamp' => filemtime($filePath),
                ];
            }
        }

        // Sort by created timestamp, newest first
        usort($backups, function($a, $b) {
            return $b['created_timestamp'] - $a['created_timestamp'];
        });

        return $backups;
    }

    /**
     * Get total storage used by backups
     */
    private function getStorageUsed()
    {
        $backupPath = storage_path('app/backups');

        if (!file_exists($backupPath)) {
            return '0 B';
        }

        $totalSize = 0;
        $files = scandir($backupPath);

        foreach ($files as $file) {
            if ($file != '.' && $file != '..') {
                $totalSize += filesize($backupPath . '/' . $file);
            }
        }

        return $this->formatBytes($totalSize);
    }

    /**
     * Format bytes to human readable size
     */
    private function formatBytes($bytes, $precision = 2)
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];

        for ($i = 0; $bytes > 1024 && $i < count($units) - 1; $i++) {
            $bytes /= 1024;
        }

        return round($bytes, $precision) . ' ' . $units[$i];
    }

    /**
     * Auto backup (can be called from scheduled task)
     */
    public function autoBackup()
    {
        try {
            $dbName = env('DB_DATABASE');
            $dbUser = env('DB_USERNAME');
            $dbPass = env('DB_PASSWORD');
            $dbHost = env('DB_HOST');

            $filename = 'auto_backup_' . $dbName . '_' . Carbon::now()->format('Y-m-d_His') . '.sql';
            $backupPath = storage_path('app/backups');

            if (!file_exists($backupPath)) {
                mkdir($backupPath, 0755, true);
            }

            $fullPath = $backupPath . '/' . $filename;

            $command = sprintf(
                'mysqldump -h %s -u %s %s %s > %s',
                escapeshellarg($dbHost),
                escapeshellarg($dbUser),
                $dbPass ? '-p' . escapeshellarg($dbPass) : '',
                escapeshellarg($dbName),
                escapeshellarg($fullPath)
            );

            exec($command, $output, $returnCode);

            if ($returnCode === 0 && file_exists($fullPath)) {
                // Clean old auto backups (keep last 7 days)
                $this->cleanOldBackups(7);

                \Log::info('Auto backup created: ' . $filename);
                return true;
            }

            return false;

        } catch (\Exception $e) {
            \Log::error('Auto backup failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Clean old backup files
     */
    private function cleanOldBackups($daysToKeep = 7)
    {
        $backupPath = storage_path('app/backups');

        if (!file_exists($backupPath)) {
            return;
        }

        $files = scandir($backupPath);
        $now = time();
        $daysInSeconds = $daysToKeep * 24 * 60 * 60;

        foreach ($files as $file) {
            if ($file != '.' && $file != '..' && strpos($file, 'auto_backup_') === 0) {
                $filePath = $backupPath . '/' . $file;
                if (($now - filemtime($filePath)) > $daysInSeconds) {
                    unlink($filePath);
                    \Log::info('Deleted old backup: ' . $file);
                }
            }
        }
    }
}
