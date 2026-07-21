<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Menu;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $menu = Menu::query()
            ->whereNull('parent_id')
            ->where('estado', true)
            ->with(['children' => fn ($query) => $query->where('estado', true)])
            ->orderBy('orden')
            ->get();

        return response()->json(['data' => $menu]);
    }
}
