<?php

namespace App\Http\Controllers;

use App\Models\LandingPage;
use App\Models\User;
use App\Services\LandingPageGenerationService;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class LandingPageController extends Controller
{
    public function __construct(
        protected LandingPageGenerationService $service,
    ) {
    }

    /**
     * Lista as landing pages geradas pelo usuario autenticado.
     */
    public function index(Request $request)
    {
        $pages = LandingPage::where('user_id', $request->user()->id)
            ->orderByDesc('created_at')
            ->paginate(15);

        return response()->json([
            'message' => 'Landing pages listadas com sucesso.',
            'data' => $pages,
        ]);
    }

    /**
     * Gera e armazena uma landing page otimizada para SEO local.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'slug' => 'sometimes|string|max:255|unique:landing_pages,slug',
            'city' => 'required|string|max:100',
            'state' => 'required|string|max:100',
            'country' => 'required|string|max:100',
            'neighborhood' => 'sometimes|nullable|string|max:100',
            'activity' => 'sometimes|string|max:100',
        ]);

        $gerado = $this->service->generate($validated);

        // Garante unicidade do slug no banco (evita colisao entre geracoes).
        $slug = $gerado['slug'];
        $counter = 1;
        while (LandingPage::where('slug', $slug)->exists()) {
            $slug = $gerado['slug'] . '-' . $counter++;
        }

        $page = LandingPage::create([
            'user_id' => $request->user()->id,
            'title' => $gerado['title'],
            'slug' => $slug,
            'city' => $gerado['city'],
            'state' => $gerado['state'],
            'country' => $gerado['country'],
            'neighborhood' => $gerado['neighborhood'],
            'activity' => $gerado['activity'],
            'meta_title' => $gerado['metaTitle'],
            'meta_description' => $gerado['metaDescription'],
            'h1' => $gerado['h1'],
            'content' => $gerado['content'],
            'structured_data' => array_merge(
                $gerado['structured_data'],
                ['url' => route('landing-pages.show', ['slug' => $slug], false)]
            ),
            'published' => true,
            'published_at' => now(),
        ]);

        return response()->json([
            'message' => 'Landing page gerada com sucesso.',
            'data' => $page->load('user:id,name,email'),
        ], 201);
    }

    /**
     * Retorna os dados publicos de uma landing page pelo slug (indexavel por buscadores).
     */
    public function show(string $slug)
    {
        $page = LandingPage::published()->where('slug', $slug)->first();

        if (!$page) {
            abort(404, 'Landing page nao encontrada.');
        }

        return response()->json([
            'message' => 'Landing page encontrada.',
            'data' => $page->load('user:id,name,email'),
        ]);
    }

    /**
     * Atualiza uma landing page (apenas o proprietario).
     */
    public function update(Request $request, LandingPage $landingPage)
    {
        $this->authorizeOwner($request->user(), $landingPage);

        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'sometimes|string',
            'meta_title' => 'sometimes|string|max:255',
            'meta_description' => 'sometimes|string|max:255',
            'h1' => 'sometimes|string|max:255',
            'published' => 'sometimes|boolean',
        ]);

        $landingPage->update($validated);

        return response()->json([
            'message' => 'Landing page atualizada com sucesso.',
            'data' => $landingPage,
        ]);
    }

    /**
     * Remove uma landing page (apenas o proprietario).
     */
    public function destroy(Request $request, LandingPage $landingPage)
    {
        $this->authorizeOwner($request->user(), $landingPage);

        $landingPage->delete();

        return response()->json([
            'message' => 'Landing page removida com sucesso.',
        ]);
    }

    protected function authorizeOwner(?User $user, LandingPage $landingPage): void
    {
        if (!$user || $landingPage->user_id !== $user->id) {
            abort(403, 'Voce nao e o proprietario desta landing page.');
        }
    }
}
