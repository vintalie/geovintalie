<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Facades\Storage;

class Message extends Model
{
    use HasFactory;

    /**
     * Tabela de mensagens do chat interno (Escopo B4).
     * Reutiliza chat_messages, ja criada pela migracao do escopo, que possui
     * FKs para conversations (conversation_id) e users (sender_id), alem
     * dos campos opcionais de anexo de arquivo (Escopo B6).
     */
    protected $table = 'chat_messages';

    protected $fillable = [
        'conversation_id',
        'sender_id',
        'body',
        'read_at',
        'file_path',
        'file_name',
        'file_mime',
        'file_size',
    ];

    protected $casts = [
        'read_at' => 'datetime',
        'file_size' => 'integer',
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

    /**
     * Indica se a mensagem possui anexo de arquivo.
     */
    public function hasAttachment(): bool
    {
        return (bool) $this->file_path;
    }

    /**
     * URL publica do anexo (disco public). Retorna null quando nao há anexo.
     */
    public function getFileUrlAttribute(): ?string
    {
        if (!$this->file_path) {
            return null;
        }

        return Storage::disk('public')->url($this->file_path);
    }
}
