<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreMeasurementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'measured_on' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'],
            'weight_kg' => ['required', 'numeric', 'min:20', 'max:400'],
            'body_fat_pct' => ['nullable', 'numeric', 'min:1', 'max:70'],
            'waist_cm' => ['nullable', 'numeric', 'min:20', 'max:250'],
            'chest_cm' => ['nullable', 'numeric', 'min:20', 'max:250'],
            'arm_cm' => ['nullable', 'numeric', 'min:10', 'max:100'],
            'thigh_cm' => ['nullable', 'numeric', 'min:10', 'max:150'],
            'hip_cm' => ['nullable', 'numeric', 'min:20', 'max:250'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function messages(): array
    {
        return [
            'measured_on.before_or_equal' => 'Tanggal pengukuran tidak boleh melewati hari ini.',
            'measured_on.date_format' => 'Format tanggal pengukuran tidak valid.',
        ];
    }
}