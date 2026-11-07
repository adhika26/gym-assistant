<?php

namespace App\Services\Ai;

use App\Models\User;

class FitnessContextBuilder
{
    public function forUser(User $user): string
    {
        $profile = $user->profile;

        if (! $profile) {
            return 'User belum mengisi profil. Minta user menyelesaikan onboarding.';
        }

        $today = now()->toDateString();

        $nutrition = $user->mealEntries()
            ->whereDate('consumed_on', $today)
            ->selectRaw('
                COALESCE(SUM(calories), 0) as calories,
                COALESCE(SUM(protein_g), 0) as protein_g,
                COALESCE(SUM(carbs_g), 0) as carbs_g,
                COALESCE(SUM(fat_g), 0) as fat_g
            ')
            ->first();

        $latestMeasurement = $user->bodyMeasurements()
            ->orderByDesc('measured_on')
            ->first();

        $sessions = $user->workoutSessions()
            ->with('sets')
            ->orderByDesc('performed_on')
            ->limit(3)
            ->get();

        $lines = [];

        $lines[] = 'PROFIL:';
        $lines[] = sprintf(
            '- %s, umur %d tahun, tinggi %d cm, berat %s kg',
            $profile->gender === 'male' ? 'Pria' : 'Wanita',
            $profile->birth_date->age,
            $profile->height_cm,
            $this->number($profile->weight_kg),
        );
        $lines[] = sprintf(
            '- Tujuan: %s | Aktivitas: %s | Pengalaman: %s',
            $profile->goal,
            $profile->activity_level,
            $profile->experience_level,
        );
        $lines[] = sprintf(
            '- Target harian: %d kcal, protein %d g, karbo %d g, lemak %d g, air %d ml',
            $profile->calorie_target ?? 0,
            $profile->protein_g ?? 0,
            $profile->carbs_g ?? 0,
            $profile->fat_g ?? 0,
            $profile->water_ml ?? 0,
        );

        $lines[] = '';
        $lines[] = "NUTRISI HARI INI ({$today}):";
        $lines[] = sprintf(
            '- Kalori: %s / %s kcal (sisa %s kcal)',
            $this->number($nutrition->calories),
            $profile->calorie_target ?? 0,
            $this->number(max(0, ($profile->calorie_target ?? 0) - (float) $nutrition->calories)),
        );
        $lines[] = sprintf(
            '- Protein %s g, karbo %s g, lemak %s g',
            $this->number($nutrition->protein_g),
            $this->number($nutrition->carbs_g),
            $this->number($nutrition->fat_g),
        );

        if ($latestMeasurement) {
            $lines[] = '';
            $lines[] = 'PENGUKURAN TERBARU:';
            $lines[] = sprintf(
                '- %s: %s kg%s%s',
                $latestMeasurement->measured_on->toDateString(),
                $this->number($latestMeasurement->weight_kg),
                $latestMeasurement->body_fat_pct !== null
                    ? ', body fat ' . $this->number($latestMeasurement->body_fat_pct) . '%'
                    : '',
                $latestMeasurement->waist_cm !== null
                    ? ', pinggang ' . $this->number($latestMeasurement->waist_cm) . ' cm'
                    : '',
            );
        }

        $lines[] = '';
        $lines[] = 'LATIHAN TERAKHIR:';

        if ($sessions->isEmpty()) {
            $lines[] = '- Belum ada sesi latihan.';
        } else {
            foreach ($sessions as $session) {
                $summary = $session->sets
                    ->take(6)
                    ->map(function ($set) {
                        $weight = $set->weight_kg === null
                            ? 'bodyweight'
                            : $this->number($set->weight_kg) . ' kg';

                        return sprintf('%s %s x %d', $set->exercise_name, $weight, $set->reps);
                    })
                    ->implode(', ');

                $lines[] = sprintf(
                    '- %s %s (%d set): %s',
                    $session->performed_on->toDateString(),
                    $session->name,
                    $session->sets->count(),
                    $summary,
                );
            }
        }

        return implode("\n", $lines);
    }

    private function number(mixed $value): string
    {
        $value = round((float) $value, 1);

        return rtrim(rtrim(number_format($value, 1, '.', ''), '0'), '.');
    }
}