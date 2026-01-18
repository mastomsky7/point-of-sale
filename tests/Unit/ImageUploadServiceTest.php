<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\Image\ImageUploadService;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ImageUploadServiceTest extends TestCase
{
    use RefreshDatabase;

    protected $imageService;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('public');
        $this->imageService = new ImageUploadService();
    }

    /** @test */
    public function it_can_upload_image()
    {
        $file = UploadedFile::fake()->image('test.jpg');

        $filename = $this->imageService->upload($file, 'test', 'uploads', 'test-image');

        $this->assertStringContainsString('test-', $filename);
        $this->assertStringContainsString('.jpg', $filename);
        Storage::disk('public')->assertExists('uploads/' . $filename);
    }

    /** @test */
    public function it_can_delete_image()
    {
        $file = UploadedFile::fake()->image('test.jpg');
        $filename = $this->imageService->upload($file, 'test', 'uploads');

        Storage::disk('public')->assertExists('uploads/' . $filename);

        $result = $this->imageService->delete($filename, 'uploads');

        $this->assertTrue($result);
        Storage::disk('public')->assertMissing('uploads/' . $filename);
    }

    /** @test */
    public function it_can_update_image()
    {
        // Upload first image
        $oldFile = UploadedFile::fake()->image('old.jpg');
        $oldFilename = $this->imageService->upload($oldFile, 'test', 'uploads');

        Storage::disk('public')->assertExists('uploads/' . $oldFilename);

        // Update with new image
        $newFile = UploadedFile::fake()->image('new.jpg');
        $newFilename = $this->imageService->update($newFile, $oldFilename, 'test', 'uploads');

        // Assert old file deleted and new file exists
        Storage::disk('public')->assertMissing('uploads/' . $oldFilename);
        Storage::disk('public')->assertExists('uploads/' . $newFilename);
        $this->assertNotEquals($oldFilename, $newFilename);
    }

    /** @test */
    public function it_returns_false_when_deleting_non_existent_file()
    {
        $result = $this->imageService->delete('non-existent.jpg', 'uploads');

        $this->assertFalse($result);
    }
}
