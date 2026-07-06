<?php

namespace App\Http\Controllers\Api\Usuarios;

use App\Http\Controllers\Controller;
use App\Http\Requests\Usuarios\StoreUsuarioRequest;
use App\Http\Requests\Usuarios\UpdateUsuarioRequest;
use App\Http\Resources\Usuarios\UsuarioResource;
use App\Models\User;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class UsuarioController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return UsuarioResource::collection(
            User::query()
                ->orderByRaw("role = 'admin' desc")
                ->orderBy('name')
                ->paginate(25)
        );
    }

    public function store(StoreUsuarioRequest $request): UsuarioResource
    {
        return new UsuarioResource(User::query()->create($request->validated()));
    }

    public function update(UpdateUsuarioRequest $request, User $usuario): UsuarioResource
    {
        $payload = $request->validated();

        if (empty($payload['password'])) {
            unset($payload['password']);
        }

        $usuario->update($payload);

        return new UsuarioResource($usuario->fresh());
    }
}
