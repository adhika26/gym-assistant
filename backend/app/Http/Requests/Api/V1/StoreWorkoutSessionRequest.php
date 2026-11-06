<?php

namespace App\Http\Requests\Api\V1;

use Illuminate\Foundation\Http\FormRequest;

class StoreWorkoutSessionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'performed_on' => ['required', 'date_format:Y-m-d'],
            'name' => ['required', 'string', 'max:100'],
            'duration_min' => ['nullable', 'integer', 'min:1', 'max:600'],
            'perceived_exertion' => ['nullable', 'integer', 'min:1', 'max:10'],
            'notes' => ['nullable', 'string', 'max:2000'],

            'sets' => ['required', 'array', 'min:1', 'max:100'],
            'sets.*.exercise_id' => ['required', 'integer', 'exists:exercises,id'],
            'sets.*.weight_kg' => ['nullable', 'numeric', 'min:0', 'max:1000'],
            'sets.*.reps' => ['required', 'integer', 'min:1', 'max:1000'],
            'sets.*.rpe' => ['nullable', 'numeric', 'min:1', 'max:10'],
            'sets.*.is_warmup' => ['sometimes', 'boolean'],
            'sets.*.notes' => ['nullable', 'string', 'max:255'],
        ];
    }
}