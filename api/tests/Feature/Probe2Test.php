<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\UserType;
use App\Models\ServiceProvider;
use App\Models\Appointment;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Probe2Test extends TestCase
{
    use RefreshDatabase;

    private string $base = '/api/v2';

    protected function setUp(): void
    {
        parent::setUp();
        $this->artisan('db:seed', ['--class' => 'DatabaseSeeder']);
    }

    private function tokenFor(User $user, string $password): string
    {
        $login = $this->post('/api/login', ['email' => $user->email, 'password' => $password]);
        return $login->json('token');
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

    public function test_probe_confirm(): void
    {
        $client = $this->token('user');
        $tipo = UserType::firstOrCreate(['nome' => 'provider'], ['nome' => 'provider']);
        $u = User::factory()->create(['email' => 'provider@teste.com', 'password' => bcrypt('senha123'), 'tipo_id' => $tipo->id]);
        $provider = ServiceProvider::create(['user_id' => $u->id, 'business_name' => 'P', 'is_active' => true]);
        $providerToken = $this->tokenFor($u, 'senha123');

        $r = $this->withHeader('Authorization', "Bearer {$client}")
            ->post("{$this->base}/agendamentos", ['provider_id' => $provider->id, 'date' => now()->addDays(2)->toDateString(), 'time' => '14:00']);
        $id = $r->json('data.id');

        // inspect the appointment in DB directly
        $appt = Appointment::find($id);
        file_put_contents('/tmp/probe2.txt', "APPOINTMENT: id={$appt->id} client_id={$appt->client_id} provider_id={$appt->provider_id} status={$appt->status}\n", FILE_APPEND);
        $p = $appt->provider;
        file_put_contents('/tmp/probe2.txt', "PROVIDER: " . var_export($p ? $p->id : null, true) . " user_id=" . var_export($p?->user_id, true) . "\n", FILE_APPEND);

        $patch = $this->withHeader('Authorization', "Bearer {$providerToken}")
            ->patch("{$this->base}/agendamentos/{$id}", ['status' => 'confirmado']);
        file_put_contents('/tmp/probe2.txt', "PATCH confirm: " . $patch->status() . "\n", FILE_APPEND);

        $del = $this->withHeader('Authorization', "Bearer {$client}")
            ->delete("{$this->base}/agendamentos/{$id}");
        file_put_contents('/tmp/probe2.txt', "DELETE cancel: " . $del->status() . "\n", FILE_APPEND);
    }
}
