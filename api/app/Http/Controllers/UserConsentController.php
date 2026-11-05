<?php

namespace App\Http\Controllers;

use App\Models\UserConsent;
use App\Models\User;
use Illuminate\Http\Request;

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
            'message' => 'Consentimento removido com sucesso.',
        ]);
    }

    public function export(Request $request)
    {
        $user = $request->user();
        $consents = UserConsent::where('user_id', $user->id)->get();

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'tipo_nome' => $user->tipo_nome,
            ],
            'consents' => $consents,
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
            abort(400, 'Confirmação de exclusão é obrigatória.');
        }

        $user = $request->user();

        if (!password_verify($request->password, $user->password)) {
            abort(401, 'Senha incorreta.');
        }

        // Anonimizar dados antes de excluir (LGPD - direito ao esquecimento)
        $user->name = 'Usuário Excluído';
        $user->email = 'deleted_' . $user->id . '@deleted.local';
        $user->phone = null;
        $user->save();

        // Excluir consentimentos
        UserConsent::where('user_id', $user->id)->delete();

        // Fazer logout
        $request->user()->tokens()->delete();

        return response()->json([
            'message' => 'Conta excluída com sucesso. Seus dados foram anonimizados.',
        ]);
    }
}
