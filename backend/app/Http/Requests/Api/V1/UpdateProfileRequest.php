<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'gender' => ['required', Rule::in(['male', 'female'])],
            'birth_date' => ['required', 'date', 'before:today', 'after:1900-01-01'],
            'height_cm' => ['required', 'integer', 'min:100', 'max:250'],
            'weight_kg' => ['required', 'numeric', 'min:30', 'max:300'],
            'activity_level' => ['required', Rule::in([
                'sedentary',
                'light',
                'moderate',
                'very_active',
                'extra_active',
            ])],
            'experience_level' => ['required', Rule::in([
                'beginner',
                'intermediate',
                'advanced',
            ])],
            'goal' => ['required', Rule::in(['cut', 'maintain', 'bulk'])],
            'target_weight_kg' => ['nullable', 'numeric', 'min:30', 'max:300'],
            'weekly_rate_kg' => ['nullable', 'numeric', 'min:0.1', 'max:1'],
            'unit_system' => ['sometimes', Rule::in(['metric', 'imperial'])],
            'timezone' => ['sometimes', 'timezone'],
            'equipment' => ['nullable', 'array'],
            'equipment.*' => ['string', 'max:50'],
            'dietary_preferences' => ['nullable', 'array'],
            'dietary_preferences.*' => ['string', 'max:50'],
            'allergies' => ['nullable', 'array'],
            'allergies.*' => ['string', 'max:50'],
        ];
    }
}