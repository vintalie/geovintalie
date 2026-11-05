<?php

declare(strict_types=1);

namespace App\Observability;

use Illuminate\Support\Str;

final class CorrelationContext
{
    private static ?string $id = null;

    private function __construct()
    {
    }

    public static function id(): ?string
    {
        return self::$id;
    }

    public static function setId(?string $id): void
    {
        self::$id = $id;
    }

    public static function generate(): string
    {
        self::$id = Str::uuid()->toString();

        return self::$id;
    }

    public static function reset(): void
    {
        self::$id = null;
    }
}
