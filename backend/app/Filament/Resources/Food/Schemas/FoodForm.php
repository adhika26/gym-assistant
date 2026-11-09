<?php

namespace App\Filament\Resources\Food\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Schema;

class FoodForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('name')
                    ->required(),
                TextInput::make('brand'),
                TextInput::make('barcode'),
                TextInput::make('category'),
                TextInput::make('calories')
                    ->required()
                    ->numeric(),
                TextInput::make('protein_g')
                    ->required()
                    ->numeric(),
                TextInput::make('carbs_g')
                    ->required()
                    ->numeric(),
                TextInput::make('fat_g')
                    ->required()
                    ->numeric(),
                TextInput::make('fiber_g')
                    ->numeric(),
                TextInput::make('sugar_g')
                    ->numeric(),
                TextInput::make('sodium_mg')
                    ->numeric(),
                TextInput::make('source')
                    ->required()
                    ->default('user'),
                Toggle::make('is_verified')
                    ->required(),
                TextInput::make('created_by')
                    ->numeric(),
            ]);
    }
}
