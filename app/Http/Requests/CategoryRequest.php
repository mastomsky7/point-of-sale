<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class CategoryRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = [
            'name' => 'required|string|max:255',
            'description' => 'required|string',
        ];

        // Image is required on create, optional on update
        if ($this->isMethod('post')) {
            $rules['image'] = 'required|image|mimes:jpeg,jpg,png|max:2048';
        } else {
            $rules['image'] = 'nullable|image|mimes:jpeg,jpg,png|max:2048';
        }

        return $rules;
    }

    /**
     * Get custom attribute names
     */
    public function attributes(): array
    {
        return [
            'name' => 'nama kategori',
            'description' => 'deskripsi',
            'image' => 'gambar',
        ];
    }

    /**
     * Get custom messages
     */
    public function messages(): array
    {
        return [
            'name.required' => 'Nama kategori wajib diisi',
            'description.required' => 'Deskripsi wajib diisi',
            'image.required' => 'Gambar wajib diupload',
            'image.image' => 'File harus berupa gambar',
            'image.mimes' => 'Format gambar harus jpeg, jpg, atau png',
            'image.max' => 'Ukuran gambar maksimal 2MB',
        ];
    }
}
