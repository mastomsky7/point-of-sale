<?php

namespace App\Services\Image;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ImageUploadService
{
    /**
     * Handle image upload with consistent naming and storage
     *
     * @param UploadedFile $file
     * @param string $prefix - e.g. 'cat', 'prod', 'srv'
     * @param string $directory - storage directory
     * @param string|null $name - optional name for slug generation
     * @return string - filename
     */
    public function upload(UploadedFile $file, string $prefix, string $directory, ?string $name = null): string
    {
        $slug = $name ? Str::slug($name) : Str::random(8);
        $randomString = Str::random(8);
        $extension = $file->getClientOriginalExtension();
        $filename = "{$prefix}-{$slug}-{$randomString}.{$extension}";

        $file->storeAs($directory, $filename, 'public');

        return $filename;
    }

    /**
     * Delete old image if exists
     *
     * @param string|null $filename
     * @param string $directory
     * @return bool
     */
    public function delete(?string $filename, string $directory): bool
    {
        if ($filename && Storage::disk('public')->exists("{$directory}/{$filename}")) {
            return Storage::disk('public')->delete("{$directory}/{$filename}");
        }

        return false;
    }

    /**
     * Update image: delete old and upload new
     *
     * @param UploadedFile $newFile
     * @param string|null $oldFilename
     * @param string $prefix
     * @param string $directory
     * @param string|null $name
     * @return string
     */
    public function update(UploadedFile $newFile, ?string $oldFilename, string $prefix, string $directory, ?string $name = null): string
    {
        $this->delete($oldFilename, $directory);
        return $this->upload($newFile, $prefix, $directory, $name);
    }
}
