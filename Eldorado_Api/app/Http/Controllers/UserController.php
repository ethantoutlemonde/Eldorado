<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;


class UserController extends Controller
{
    // Liste des utilisateurs
    public function index()
    {
        $users = User::all();
        return response()->json($users);
    }

    // Détails d'un utilisateur spécifique
    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        return response()->json($user);
    }

    // Créer un nouvel utilisateur
    public function store(Request $request)
    {
        $validated = $request->validate([
            'firstname' => 'required|string|max:255',
            'lastname' => 'required|string|max:255',
            'wallet' => 'required|string|unique:users,wallet',
            'id_card' => 'required|string|unique:users,id_card',
            'status' => 'boolean',
            'is_admin' => 'boolean',
        ]);

        $user = User::create($validated);

        return response()->json($user, 201);
    }

    // Mettre à jour un utilisateur
    public function update(Request $request, $id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $validated = $request->validate([
            'firstname' => 'string|max:255',
            'lastname' => 'string|max:255',
            'wallet' => 'string|unique:users,wallet,' . $id,
            'id_card' => 'string|unique:users,id_card,' . $id,
            'status' => 'boolean',
            'is_admin' => 'boolean',
        ]);

        $user->update($validated);

        return response()->json($user);
    }

    // Supprimer un utilisateur
    public function destroy($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json(['message' => 'Utilisateur non trouvé'], 404);
        }

        $user->delete();

        return response()->json(['message' => 'Utilisateur supprimé avec succès']);
    }
}
