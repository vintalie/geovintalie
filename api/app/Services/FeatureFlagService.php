<?php

namespace App\Services;

use App\Models\FeatureFlag;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Collection;

/**
 * Serviço de feature flags (Escopo C4).
 *
 * Centraliza a consulta e atualização de flags usadas para liberação
 * gradual dos novos módulos (A e B). Todas as flags nascem desligadas
 * por padrão (conforme FeatureFlagSeeder); cabe ao administrador
 * habilitá-las via API quando o módulo estiver pronto para release.
 */
class FeatureFlagService
{
    /** Retorna todas as flags ordenadas por nome. */
    public function all(): Collection
    {
        return FeatureFlag::orderBy('name')->get();
    }

    /** Busca uma flag pelo nome. Retorna null quando não existe. */
    public function find(string $name): ?FeatureFlag
    {
        return FeatureFlag::where('name', $name)->first();
    }

    /**
     * Indica se a flag está habilitada para o contexto atual.
     * Flag desconhecida ou desligada => false. Com rollout < 100 =>
     * liberação percentual determinística (crc32 do nome da flag).
     */
    public function isEnabled(string $name): bool
    {
        return FeatureFlag::isEnabled($name);
    }

    /**
     * Atualiza enabled e/ou rollout_percentage de uma flag existente.
     *
     * @throws ModelNotFoundException quando a flag não existe.
     */
    public function update(string $name, array $data): FeatureFlag
    {
        $flag = $this->find($name);

        if (! $flag) {
            throw new ModelNotFoundException("Feature flag '{$name}' não encontrada.");
        }

        $flag->update($data);

        return $flag;
    }

    /** Nomes das flags atualmente habilitadas (enabled = true). */
    public function enabledNames(): array
    {
        return $this->all()->where('enabled', true)->pluck('name')->all();
    }
}
