<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\UserType;
use App\Models\Permission;

class PermissionSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * Cadastra as permissoes do Escopo C1 e as distribui pelos papeis:
     *  - admin: todas as permissoes
     *  - lojista: produtos e propriedades
     *  - prestador: produtos
     *  - indústria: produtos
     *  - consumidor: sem permissoes de gerenciamento
     */
    public function run(): void
    {
        $permissions = [
            ['nome' => 'gerenciar_usuarios', 'descricao' => 'Criar, editar e excluir usuarios.'],
            ['nome' => 'gerenciar_papeis', 'descricao' => 'Criar, editar e excluir papeis (user types).'],
            ['nome' => 'gerenciar_permissoes', 'descricao' => 'Atribuir permissoes a papeis.'],
            ['nome' => 'gerenciar_produtos', 'descricao' => 'Gerenciar produtos e estoque.'],
            ['nome' => 'gerenciar_propriedades', 'descricao' => 'Gerenciar propriedades/lojas.'],
        ];

        $created = [];
        foreach ($permissions as $data) {
            $created[] = Permission::firstOrCreate(['nome' => $data['nome']], $data);
        }

        $collection = collect($created);
        $byNome = $collection->keyBy('nome');
        $allIds = $collection->pluck('id')->all();

        $rolePermissions = [
            'admin'       => $allIds,
            'lojista'     => [$byNome->get('gerenciar_produtos')->id, $byNome->get('gerenciar_propriedades')->id],
            'prestador'   => [$byNome->get('gerenciar_produtos')->id],
            'indústria'   => [$byNome->get('gerenciar_produtos')->id],
            'consumidor'  => [],
        ];

        foreach ($rolePermissions as $roleName => $permissionIds) {
            $role = UserType::where('nome', $roleName)->first();
            if ($role) {
                $role->permissions()->sync(array_unique($permissionIds));
            }
        }
    }
}
