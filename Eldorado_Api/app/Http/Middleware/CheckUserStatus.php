<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckUserStatus
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next)
{
    if (auth('api')->check() && auth('api')->user()->status) {
        return $next($request);
    }
    return response()->json(['message' => 'Accès refusé : votre compte n\'est pas activé.'], 403);
}
}
