<?php

namespace App\Http\Controllers;

use App\Models\UserConsent;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

class UserConsentController extends Controller
{
    public function index(Request $request)
    {
        $consents = UserConsent::where('user_id', $request->user()->id)->get();

        return response()->json([
            'data' => $consents,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'purpose' => 'required|string|max:100',
            'granted' => 'required|boolean',
        ]);

        $consent = UserConsent::updateOrCreate(
            [
                'user_id' => $request->user()->id,
                'purpose' => $request->purpose,
            ],
            [
                'granted' => $request->granted,
                'granted_at' => $request->granted ? now() : null,
                'withdrawn_at' => $request->granted ? null : now(),
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
            ]
        );

        return response()->json([
            'message' => 'Consentimento atualizado com sucesso.',
            'data' => $consent,
        ], 201);
    }

    public function destroy(Request $request, string $purpose)
    {
        $consent = UserConsent::where('user_id', $request->user()->id)
            ->where('purpose', $purpose)
            ->first();

        if (!$consent) {
            abort(404, 'Consentimento não encontrado.');
        }

        $consent->delete();

        return response()->json([
            'message' => 'Consentimento revogado com sucesso.',
        ]);
    }

    public function export(Request $request)
    {
        $user = $request->user();
        $userId = $user->id;

        $personal = [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'tipo_nome' => optional($user->UserType)->nome,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
            'consents' => UserConsent::where('user_id', $userId)->get(),
        ];

        // Dados pessoais do titular em tabelas relacionadas (LGPD - acesso e portabilidade)
        if (Schema::hasTable('properties')) {
            $personal['properties'] = DB::table('properties')->where('user_id', $userId)->get();
        }
        if (Schema::hasTable('products')) {
            $personal['products'] = DB::table('products')->where('user_id', $userId)->get();
        }
        if (Schema::hasTable('service_providers')) {
            $personal['service_providers'] = DB::table('service_providers')->where('user_id', $userId)->get();
        }
        if (Schema::hasTable('service_listings')) {
            $providerId = DB::table('service_providers')->where('user_id', $userId)->value('id');
            $personal['service_listings'] = $providerId
                ? DB::table('service_listings')->where('provider_id', $providerId)->get()
                : [];
        }
        if (Schema::hasTable('appointments')) {
            $personal['appointments'] = DB::table('appointments')
                ->where('client_id', $userId)
                ->orWhere('provider_id', $userId)
                ->get();
        }
        if (Schema::hasTable('service_evaluations')) {
            $personal['service_evaluations'] = DB::table('service_evaluations')->where('evaluator_id', $userId)->get();
        }

        return response()->json([
            'message' => 'Exportacao dos dados pessoais do titular.',
            'data' => $personal,
            'exported_at' => now(),
        ]);
    }

    public function deleteAccount(Request $request)
    {
        $request->validate([
            'password' => 'required|string',
            'confirm_delete' => 'required|boolean',
        ]);

        if (!$request->confirm_delete) {
            abort(400, 'Confirmacao de exclusao e obrigatoria.');
        }

        $user = $request->user();
        $userId = $user->id;

        if (!password_verify($request->password, $user->password)) {
            abort(401, 'Senha incorreta.');
        }

        // Anonimizacao do titular (LGPD - direito ao esquecimento).
        // O registro eh mantido anonimo (em vez de deletado) para preservar
        // a integridade referencial de FKs (agendamentos, propriedades, produtos, etc.).
        $user->name = 'Usuario Excluido';
        $user->email = 'deleted_' . $userId . '@deleted.local';
        $user->phone = null;
        $user->save();

        // Consentimentos do titular
        UserConsent::where('user_id', $userId)->delete();

        // Sessoes (guardadas por hasTable; JWT e stateless e nao possui servidor de tokens para revogar)
        if (Schema::hasTable('sessions')) {
            DB::table('sessions')->where('user_id', $userId)->delete();
        }

        // Dados pessoais do titular em tabelas relacionadas
        $this->anonymizeTable('properties', ['contact1_email', 'contact2_email', 'number1', 'number2', 'number3'], 'user_id', $userId);
        $this->anonymizeTable('products', ['name', 'html'], 'user_id', $userId);

        if (Schema::hasTable('service_providers')) {
            $providerId = DB::table('service_providers')->where('user_id', $userId)->value('id');
            $this->anonymizeTable('service_providers', ['business_name', 'cnpj_cpf', 'description', 'avatar_url', 'cover_url'], 'user_id', $userId);
            if ($providerId && Schema::hasTable('service_listings')) {
                $this->anonymizeTable('service_listings', ['title', 'description', 'address', 'city', 'state', 'zip_code'], 'provider_id', $providerId);
            }
        }

        if (Schema::hasTable('appointments')) {
            $this->anonymizeTable('appointments', ['observacoes'], 'client_id', $userId);
            $this->anonymizeTable('appointments', ['observacoes'], 'provider_id', $userId);
        }

        if (Schema::hasTable('service_evaluations')) {
            $this->anonymizeTable('service_evaluations', ['comment'], 'evaluator_id', $userId);
        }

        return response()->json([
            'message' => 'Conta excluída com sucesso. Seus dados pessoais foram anonimizados de forma definitiva (direito ao esquecimento - LGPD).',
        ]);
    }

    private function anonymizeTable(string $table, array $columns, string $idColumn, int $idValue): void
    {
        if (!Schema::hasTable($table) || empty($columns)) {
            return;
        }

        $existing = collect(Schema::getColumnListing($table))->intersect($columns)->all();
        if (empty($existing)) {
            return;
        }

        $updates = array_fill_keys($existing, null);
        $updates['updated_at'] = now();

        DB::table($table)->where($idColumn, $idValue)->update($updates);
    }
}
