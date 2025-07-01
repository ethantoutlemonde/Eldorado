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

    // public function store(Request $request) {
    //     $data = $request->validate([
    //         'id' => 'required|string|unique:users',
    //         'nom' => 'required|string',
    //         'prenom' => 'required|string',
    //         'date_naissance' => 'required|date',
    //         'statut' => 'in:verified,banned,admin,pending',
    //     ]);
    //     return User::create($data);
    // }

    public function store(Request $request)
    {
        $data = $request->validate([
            'id' => 'required|string|unique:users',
            'nom' => 'required|string',
            'prenom' => 'required|string',
            'date_naissance' => 'required|date',
            'statut' => 'in:verified,banned,admin,pending',
            'piece_identite' => 'nullable|file|mimes:jpg,jpeg,png,pdf|max:10240',
        ]);

        $user = User::create($data);

        if ($request->hasFile('piece_identite')) {
            $file = $request->file('piece_identite');
            $extension = $file->getClientOriginalExtension();
            $filename = $user->id . '.' . $extension;

            $destination = public_path('idCards');
            if (!file_exists($destination)) {
                mkdir($destination, 0755, true);
            }

            $file->move($destination, $filename);

            // Optionnel : ajoute l'URL dans la réponse
            $user->piece_identite_url = asset('idCards/' . $filename);
        }

        return response()->json($user);
    }



    // public function show($id) {
    //     return User::findOrFail($id);
    // }

    public function show($id)
    {
        $user = User::find($id);

        if (!$user) {
            return response()->json([
                'message' => 'Utilisateur introuvable'
            ], 404);
        }

        return response()->json($user);
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

