#!/usr/bin/env python3
"""
Pruebas de seguridad — Control de acceso y autorización (Mentis)
================================================================

Verifica de forma automatizada los controles de acceso del backend:
  - Endpoints protegidos rechazan peticiones sin token (401)
  - Un terapeuta NO puede acceder a endpoints de administrador (403)
  - Un usuario NO puede ver registros de otro (IDOR)
  - /auth/registro ya no permite auto-registro sin ser admin

USO (recomendado contra entorno LOCAL, no producción):

    pip install requests
    export BASE_URL="http://localhost:8000"
    export ADMIN_EMAIL="admin@ejemplo.com"      export ADMIN_PASS="..."
    export TERA_A_EMAIL="terapeutaA@ejemplo.com" export TERA_A_PASS="..."
    export TERA_B_EMAIL="terapeutaB@ejemplo.com" export TERA_B_PASS="..."
    python3 test_autorizacion.py

Cada prueba imprime PASS/FAIL. Un FAIL = posible vulnerabilidad a revisar.
"""
import os
import sys
import requests

BASE = os.environ.get("BASE_URL", "http://localhost:8000").rstrip("/")
ADMIN = (os.environ.get("ADMIN_EMAIL", ""), os.environ.get("ADMIN_PASS", ""))
TERA_A = (os.environ.get("TERA_A_EMAIL", ""), os.environ.get("TERA_A_PASS", ""))
TERA_B = (os.environ.get("TERA_B_EMAIL", ""), os.environ.get("TERA_B_PASS", ""))

_passed = 0
_failed = 0


def check(nombre, condicion, detalle=""):
    global _passed, _failed
    if condicion:
        _passed += 1
        print(f"  ✅ PASS  {nombre}")
    else:
        _failed += 1
        print(f"  ❌ FAIL  {nombre}  {detalle}")


def login(email, password):
    r = requests.post(f"{BASE}/auth/login", json={"email": email, "password": password}, timeout=15)
    if r.status_code != 200:
        print(f"[!] No se pudo iniciar sesión con {email}: {r.status_code} {r.text[:120]}")
        return None
    return r.json()["access_token"]


def H(token):
    return {"Authorization": f"Bearer {token}"}


def main():
    print(f"\n=== Pruebas de autorización contra {BASE} ===\n")

    # ── 1. Endpoints protegidos sin token ────────────────────────────
    print("[1] Acceso sin token (debe dar 401):")
    for path in ["/auth/me", "/usuarios/", "/valoraciones/", "/cuentas/admin/servicios?mes=6&anio=2026"]:
        r = requests.get(f"{BASE}{path}", timeout=15)
        check(f"GET {path} sin token", r.status_code in (401, 403), f"-> {r.status_code}")

    # ── 2. /auth/registro ya no es auto-registro público ─────────────
    print("\n[2] Auto-registro como admin (debe ser rechazado):")
    r = requests.post(f"{BASE}/auth/registro", json={
        "email": "atacante@evil.com", "nombre": "X", "apellido": "Y",
        "password": "Password123", "rol": "admin"
    }, timeout=15)
    check("POST /auth/registro sin ser admin", r.status_code in (401, 403), f"-> {r.status_code}")

    # ── 3. Escalada de privilegios (terapeuta -> endpoints admin) ────
    if TERA_A[0]:
        tA = login(*TERA_A)
        if tA:
            print("\n[3] Terapeuta llamando endpoints de admin (debe dar 403):")
            admin_paths = [
                ("GET", "/usuarios/"),
                ("GET", "/cuentas/admin/servicios?mes=6&anio=2026"),
                ("GET", "/cuentas/admin/exportar?mes=6&anio=2026"),
                ("GET", "/cuentas/admin/tarifas"),
                ("GET", "/cuentas/admin/servicios-catalogo"),
                ("GET", "/auth/password-reset-requests"),
            ]
            for method, path in admin_paths:
                r = requests.request(method, f"{BASE}{path}", headers=H(tA), timeout=15)
                check(f"{method} {path} como terapeuta", r.status_code == 403, f"-> {r.status_code}")

    # ── 4. IDOR: terapeuta A no ve servicios de B ────────────────────
    if TERA_A[0] and TERA_B[0]:
        tA, tB = login(*TERA_A), login(*TERA_B)
        if tA and tB:
            print("\n[4] IDOR — un terapeuta no debe ver/editar registros de otro:")
            # B crea un servicio
            rb = requests.post(f"{BASE}/cuentas/mis-servicios?mes=6&anio=2026",
                               headers=H(tB), json={"nombre_usuario": "PRUEBA IDOR", "servicio": "COMITÉ"}, timeout=15)
            if rb.status_code == 201:
                sid = rb.json()["id"]
                # A intenta editarlo
                ra = requests.put(f"{BASE}/cuentas/mis-servicios/{sid}", headers=H(tA),
                                  json={"nombre_usuario": "HACKEADO"}, timeout=15)
                check(f"PUT servicio de B desde A (id={sid})", ra.status_code in (403, 404), f"-> {ra.status_code}")
                # A intenta borrarlo
                ra = requests.delete(f"{BASE}/cuentas/mis-servicios/{sid}", headers=H(tA), timeout=15)
                check(f"DELETE servicio de B desde A (id={sid})", ra.status_code in (403, 404), f"-> {ra.status_code}")
                # limpiar
                requests.delete(f"{BASE}/cuentas/mis-servicios/{sid}", headers=H(tB), timeout=15)

            # A lista sus servicios: no deben aparecer los de B
            ra = requests.get(f"{BASE}/cuentas/mis-servicios?mes=6&anio=2026", headers=H(tA), timeout=15)
            if ra.status_code == 200:
                nombres = [s.get("nombre_usuario") for s in ra.json()]
                check("Lista de A no contiene registros de B", "PRUEBA IDOR" not in nombres)

    # ── 5. El terapeuta nunca ve precios ─────────────────────────────
    if TERA_A[0]:
        tA = login(*TERA_A)
        if tA:
            print("\n[5] El terapeuta no debe ver campos de precio:")
            ra = requests.get(f"{BASE}/cuentas/mis-servicios?mes=6&anio=2026", headers=H(tA), timeout=15)
            if ra.status_code == 200 and ra.json():
                tiene_precio = any("precio_unitario" in s for s in ra.json())
                check("Respuesta de terapeuta sin 'precio_unitario'", not tiene_precio)
            else:
                print("  (sin datos para verificar precios)")

    print(f"\n=== Resultado: {_passed} PASS / {_failed} FAIL ===")
    sys.exit(1 if _failed else 0)


if __name__ == "__main__":
    main()
