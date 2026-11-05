<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Message extends Model
{
    use HasFactory;

    /**
     * Tabela de mensagens do chat interno (Escopo B4).
     * Reutiliza chat_messages, ja criada pela migracao do escopo, que possui
     * FKs para conversations (conversation_id) e users (sender_id).
     */
    protected $table = 'chat_messages';

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
        'read_at',
    ];

    protected $casts = [
        'read_at' => 'datetime',
    ];

    /**
     * Conversa a que pertence a mensagem.
     */
    public function conversation(): BelongsTo
    {
        return $this->belongsTo(Conversation::class, 'conversation_id');
    }

    /**
     * Usuario que enviou a mensagem.
     */
    public function sender(): BelongsTo
    {
        return $this->belongsTo(User::class, 'sender_id');
    }
}
