# Laravel API Setup Guide

## 1. CORS Configuration

Add this to your Laravel `config/cors.php`:

\`\`\`php
<?php

return [
    'paths' => ['api/*', 'sanctum/csrf-cookie'],
    'allowed_methods' => ['*'],
    'allowed_origins' => ['http://localhost:3000', 'http://127.0.0.1:3000'],
    'allowed_origins_patterns' => [],
    'allowed_headers' => ['*'],
    'exposed_headers' => [],
    'max_age' => 0,
    'supports_credentials' => false,
];
\`\`\`

## 2. API Routes

Add these routes to your `routes/api.php`:

\`\`\`php
<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;

Route::get('/users', [UserController::class, 'index']);
Route::get('/users/{id}', [UserController::class, 'show']);
Route::put('/users/{id}', [UserController::class, 'update']);
Route::delete('/users/{id}', [UserController::class, 'destroy']);
Route::post('/users', [UserController::class, 'store']);
\`\`\`

## 3. User Model

Create a User model with these fields:

\`\`\`php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = [
        'id', // Ethereum wallet address
        'prenom',
        'nom', 
        'date_naissance',
        'statut'
    ];

    protected $keyType = 'string';
    public $incrementing = false;

    protected $casts = [
        'date_naissance' => 'date',
    ];
}
\`\`\`

## 4. Migration

Create a migration:

\`\`\`php
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUsersTable extends Migration
{
    public function up()
    {
        Schema::create('users', function (Blueprint $table) {
            $table->string('id')->primary(); // Ethereum address
            $table->string('prenom');
            $table->string('nom');
            $table->date('date_naissance');
            $table->enum('statut', ['verified', 'banned', 'pending', 'admin']);
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('users');
    }
}
\`\`\`

## 5. Controller

Create UserController:

\`\`\`php
<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return User::all();
    }

    public function show($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }
        return $user;
    }

    public function update(Request $request, $id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $user->update($request->all());
        return $user;
    }

    public function destroy($id)
    {
        $user = User::find($id);
        if (!$user) {
            return response()->json(['error' => 'User not found'], 404);
        }

        $user->delete();
        return response()->json(['message' => 'User deleted successfully']);
    }

    public function store(Request $request)
    {
        return User::create($request->all());
    }
}
\`\`\`

## 6. Start Laravel Server

\`\`\`bash
php artisan serve --host=127.0.0.1 --port=8000
\`\`\`

## 7. Test Data (Optional)

Add some test users to your database:

\`\`\`php
// In a seeder or tinker
User::create([
    'id' => '0x742d35Cc6634C0532925a3b8D4C9db96590c6C87',
    'prenom' => 'Admin',
    'nom' => 'User',
    'date_naissance' => '1990-01-01',
    'statut' => 'admin'
]);
