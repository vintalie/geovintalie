<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Models\ServiceEvaluation;

class Review extends ServiceEvaluation
{
    use HasFactory;

    /**
     * Tabela de avaliacoes mutuas cliente-prestador (Escopo B5).
     * Reutiliza service_evaluations (mesma tabela de ServiceEvaluation,
     * heranca de modelo, sem duplicacao de armazenamento).
     */
    protected $table = 'service_evaluations';

    /**
     * Relacoes herdadas de ServiceEvaluation: listing(), provider(), evaluator().
     */

    public const RATING_MIN = 1;
    public const RATING_MAX = 5;
}
