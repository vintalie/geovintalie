<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RevendaLead extends Model
{
    use HasFactory;

    /**
     * Tabela de leads B2B do modulo "Quero Revender" (Escopo A6).
     * Representa o interesse de um lojista em revender produtos de uma industria.
     */
    protected $fillable = [
        'user_id',
        'nome_empresa',
        'cnpj',
        'contato_nome',
        'contato_email',
        'contato_telefone',
        'cidade',
        'estado',
        'segmento',
        'mensagem',
        'status',
        'notas_internas',
    ];

    protected $casts = [
        'status' => 'string',
    ];

    public const STATUS_NOVO = 'novo';
    public const STATUS_EM_ANALISE = 'em_analise';
    public const STATUS_CONTATADO = 'contatado';
    public const STATUS_FECHADO = 'fechado';
    public const STATUS_RECUSADO = 'recusado';

    public static array $STATUSES = [
        self::STATUS_NOVO,
        self::STATUS_EM_ANALISE,
        self::STATUS_CONTATADO,
        self::STATUS_FECHADO,
        self::STATUS_RECUSADO,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
