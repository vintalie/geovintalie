<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ServiceEvaluation;

class Review extends ServiceEvaluation
{
    use HasFactory;

    /**
     * Tabela de avaliacoes mutuas cliente-prestador (Escopo B5).
     * Reutiliza service_evaluations por heranca de ServiceEvaluation
     * (modelo canonico do Escopo B5). Relacoes e preenchiveis sao herdados.
     */

    public const RATING_MIN = 1;
    public const RATING_MAX = 5;
}
