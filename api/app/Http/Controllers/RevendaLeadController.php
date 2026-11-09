<?php

namespace App\Http\Controllers;

use App\Models\FeatureFlag;
use App\Models\RevendaLead;
use Illuminate\Http\Request;

class RevendaLeadController extends Controller
{
    /** Cadastra o interesse de revenda de um lojista (industria <- lojista). */
    public function store(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_querio_revender')) {
            abort(403, 'Quero Revender nao habilitado.');
        }

        $user = $request->user();

        $data = $request->validate([
            'nome_empresa' => 'required|string|max:255',
            'cnpj' => 'required|string|max:20|unique:revenda_leads,cnpj',
            'contato_nome' => 'required|string|max:255',
            'contato_email' => 'required|email|max:255',
            'contato_telefone' => 'nullable|string|max:20',
            'cidade' => 'nullable|string|max:100',
            'estado' => 'nullable|string|max:100',
            'segmento' => 'nullable|string|max:100',
            'mensagem' => 'nullable|string|max:2000',
        ]);

        $lead = RevendaLead::create(array_merge($data, [
            'user_id' => $user->id,
            'status' => RevendaLead::STATUS_NOVO,
        ]));

        return response()->json([
            'message' => 'Interesse de revenda cadastrado com sucesso.',
            'lead' => $lead->load('user'),
        ], 201);
    }

    /** Lista leads de revenda. Industria/admin veem todos; lojista ve apenas os proprios. */
    public function index(Request $request)
    {
        if (!FeatureFlag::isEnabled('ff_querio_revender')) {
            abort(403, 'Quero Revender nao habilitado.');
        }

        $user = $request->user();
        $role = optional($user->UserType)->nome;

        $query = RevendaLead::with('user');

        if (!in_array($role, ['industry', 'admin'], true)) {
            $query->where('user_id', $user->id);
        }

        if ($request->has('status')) {
            $query->where('status', $request->query('status'));
        }

        $leads = $query->orderByDesc('created_at')->paginate(
            $request->input('per_page', 20)
        );

        return response()->json([
            'message' => 'Leads de revenda listados com sucesso.',
            'leads' => $leads,
        ], 200);
    }

    /** Exibe um lead de revenda (industria/admin veem qualquer um; lojista apenas o proprio). */
    public function show(Request $request, RevendaLead $revendaLead)
    {
        if (!FeatureFlag::isEnabled('ff_querio_revender')) {
            abort(403, 'Quero Revender nao habilitado.');
        }

        $user = $request->user();
        $role = optional($user->UserType)->nome;

        if (!in_array($role, ['industry', 'admin'], true)
            && (int) $revendaLead->user_id !== (int) $user->id) {
            abort(403, 'Voce nao pode ver este lead.');
        }

        return response()->json([
            'message' => 'Lead de revenda encontrado.',
            'lead' => $revendaLead->load('user'),
        ], 200);
    }

    /** Atualiza status (e notas internas) de um lead — apenas industria/admin. */
    public function update(Request $request, RevendaLead $revendaLead)
    {
        if (!FeatureFlag::isEnabled('ff_querio_revender')) {
            abort(403, 'Quero Revender nao habilitado.');
        }

        $user = $request->user();
        $role = optional($user->UserType)->nome;

        if (!in_array($role, ['industry', 'admin'], true)) {
            abort(403, 'Apenas a industria pode atualizar o status do lead.');
        }

        $data = $request->validate([
            'status' => 'required|string|in:novo,em_analise,contatado,fechado,recusado',
            'notas_internas' => 'nullable|string|max:2000',
        ]);

        $revendaLead->update($data);

        return response()->json([
            'message' => 'Lead de revenda atualizado com sucesso.',
            'lead' => $revendaLead->fresh()->load('user'),
        ], 200);
    }
}
