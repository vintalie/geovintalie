<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserType;
use App\Models\ServiceProvider;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProbeTest extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api/v2';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    private function token(string $nome): string
    {
        $tipo = UserType::firstOrCreate(['nome' => $nome], ['nome' => $nome]);
        $email = "{$nome}@teste.com";
        User::firstOrCreate(
            ['email' => $email],
            ['name' => ucfirst($nome), 'password' => bcrypt('senha123'), 'tipo_id' => $tipo->id]
        );
        return $this->tokenFor(User::where('email', $email)->first(), 'senha123');
    }

    private function tokenFor(User $user, string $password): string
    {
        $login = $this->post('/api/login', ['email' => $user->email, 'password' => $password]);
        return $login->json('token');
    }

    public function test_probe_basic(): void
    {
        $client = $this->token('user');

        $tipo = UserType::firstOrCreate(['nome' => 'provider'], ['nome' => 'provider']);
        $u = User::factory()->create(['email' => 'provider@teste.com', 'password' => bcrypt('senha123'), 'tipo_id' => $tipo->id]);
        $provider = ServiceProvider::create(['user_id' => $u->id, 'business_name' => 'P', 'is_active' => true]);
        $providerToken = $this->tokenFor($u, 'senha123');

        $r = $this->withHeader('Authorization', "Bearer {$client}")
            ->post("{$this->base}/agendamentos", ['provider_id' => $provider->id, 'date' => now()->addDays(2)->toDateString(), 'time' => '14:00']);
        file_put_contents('/tmp/probe_out.txt', "\nPOST create: " . $r->status() . " " . $r->getContent() . "\n", FILE_APPEND);
        $id = $r->json('id');
        $patch = $this->withHeader('Authorization', "Bearer {$providerToken}")
            ->patch("{$this->base}/agendamentos/{$id}", ['status' => 'confirmado']);
        file_put_contents('/tmp/probe_out.txt', "PATCH confirm: " . $patch->status() . " " . $patch->getContent() . "\n", FILE_APPEND);

        $del = $this->withHeader('Authorization', "Bearer {$client}")
            ->delete("{$this->base}/agendamentos/{$id}");
        file_put_contents('/tmp/probe_out.txt', "DELETE cancel: " . $del->status() . " " . $del->getContent() . "\n", FILE_APPEND);

        $intruso = $this->token('intruso');
        $get = $this->withHeader('Authorization', "Bearer {$intruso}")
            ->get("{$this->base}/agendamentos/{$id}");
        file_put_contents('/tmp/probe_out.txt', "GET intruso show: " . $get->status() . " " . $get->getContent() . "\n", FILE_APPEND);

        $conv = $this->withHeader('Authorization', "Bearer {$client}")
            ->post("{$this->base}/conversas", ['provider_id' => $provider->id]);
        file_put_contents('/tmp/probe_out.txt', "POST conversa: " . $conv->status() . " " . $conv->getContent() . "\n", FILE_APPEND);
        $cid = $conv->json('id');

        $msg = $this->withHeader('Authorization', "Bearer {$client}")
            ->post("{$this->base}/conversas/{$cid}/mensagens", ['body' => 'oi']);
        file_put_contents('/tmp/probe_out.txt', "POST mensagem: " . $msg->status() . " " . $msg->getContent() . "\n", FILE_APPEND);
    }
}
