<?php

namespace App\Filament\Resources\Exercises\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class ExerciseForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('slug')
                    ->required(),
                TextInput::make('primary_muscle')
                    ->required(),
                Textarea::make('secondary_muscles')
                    ->columnSpanFull(),
                TextInput::make('equipment'),
                TextInput::make('difficulty')
                    ->required()
                    ->default('beginner'),
                Toggle::make('is_compound')
                    ->required(),
                Textarea::make('instructions')
                    ->columnSpanFull(),
                TextInput::make('source')
                    ->required()
                    ->default('seed'),
                TextInput::make('created_by')
                    ->numeric(),
            ]);
    }
}
