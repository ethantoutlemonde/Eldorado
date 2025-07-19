<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function show($id)
    {
        $extensions = ['jpg', 'jpeg', 'png', 'pdf'];
        foreach ($extensions as $ext) {
            $path = public_path("uploads/idcards/{$id}.{$ext}");
            if (file_exists($path)) {
                return response()->file($path);
            }
        }

        return response()->json(['error' => 'Fichier introuvable'], 404);
    }
}
