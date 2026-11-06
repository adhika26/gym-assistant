<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateMealEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'consumed_on' => ['sometimes', 'date_format:Y-m-d'],
            'meal_type' => ['sometimes', Rule::in([
                'breakfast',
                'lunch',
                'dinner',
                'snack',
            ])],
            'quantity_g' => ['sometimes', 'numeric', 'min:1', 'max:5000'],
        ];
    }
}