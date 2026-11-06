<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreMealEntryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'food_id' => ['required', 'integer', 'exists:foods,id'],
            'consumed_on' => ['required', 'date_format:Y-m-d'],
            'meal_type' => ['required', Rule::in([
                'breakfast',
                'lunch',
                'dinner',
                'snack',
            ])],
            'quantity_g' => ['required', 'numeric', 'min:1', 'max:5000'],
        ];
    }
}