<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreFoodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'brand' => ['nullable', 'string', 'max:255'],
            'barcode' => ['nullable', 'string', 'max:64', 'unique:foods,barcode'],
            'category' => ['nullable', 'string', 'max:50'],

            // Nilai per 100 gram
            'calories' => ['required', 'numeric', 'min:0', 'max:1000'],
            'protein_g' => ['required', 'numeric', 'min:0', 'max:100'],
            'carbs_g' => ['required', 'numeric', 'min:0', 'max:100'],
            'fat_g' => ['required', 'numeric', 'min:0', 'max:100'],
            'fiber_g' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'sugar_g' => ['nullable', 'numeric', 'min:0', 'max:100'],
            'sodium_mg' => ['nullable', 'numeric', 'min:0', 'max:100000'],
        ];
    }
}