<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProductRequest extends FormRequest
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
        $productId = $this->route('product') ? $this->route('product')->id : null;

        $rules = [
            'barcode' => [
                'required',
                'string',
                Rule::unique('products', 'barcode')->ignore($productId),
            ],
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'category_id' => 'required|exists:categories,id',
            'buy_price' => 'required|numeric|min:0',
            'sell_price' => 'required|numeric|min:0|gte:buy_price',
            'stock' => 'required|integer|min:0',
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
            'barcode' => 'barcode',
            'title' => 'nama produk',
            'description' => 'deskripsi',
            'category_id' => 'kategori',
            'buy_price' => 'harga beli',
            'sell_price' => 'harga jual',
            'stock' => 'stok',
            'image' => 'gambar',
        ];
    }

    /**
     * Get custom messages
     */
    public function messages(): array
    {
        return [
            'barcode.required' => 'Barcode wajib diisi',
            'barcode.unique' => 'Barcode sudah digunakan',
            'title.required' => 'Nama produk wajib diisi',
            'category_id.required' => 'Kategori wajib dipilih',
            'category_id.exists' => 'Kategori tidak valid',
            'buy_price.required' => 'Harga beli wajib diisi',
            'sell_price.required' => 'Harga jual wajib diisi',
            'sell_price.gte' => 'Harga jual harus lebih besar atau sama dengan harga beli',
            'stock.required' => 'Stok wajib diisi',
            'image.required' => 'Gambar wajib diupload',
        ];
    }
}
