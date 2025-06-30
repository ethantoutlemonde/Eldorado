<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class UserController extends Controller
{
    public function index() {
        return User::all();
    }

    public function store(Request $request) {
        $data = $request->validate([
            'id' => 'required|string|unique:users',
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'date_naissance' => 'required|date',
            'statut' => 'in:verified,banned,admin',
        ]);
        return User::create($data);
    }

    public function show($id) {
        return User::findOrFail($id);
    }

    public function update(Request $request, $id) {
        $user = User::findOrFail($id);
        $data = $request->validate([
            'nom' => 'string',
            'prenom' => 'string',
            'date_naissance' => 'date',
            'statut' => 'in:verified,banned,admin',
        ]);
        $user->update($data);
        return $user;
    }

    public function destroy($id) {
        User::findOrFail($id)->delete();
        return response()->json(['message' => 'Utilisateur supprimé']);
    }
}

