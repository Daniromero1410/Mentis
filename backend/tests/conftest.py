"""
conftest.py — Fixtures compartidos para todos los tests de Mentis.

CONFIGURACION REQUERIDA:
    Crea backend/.env.test copiando backend/.env.test.example y completa los valores.
    NUNCA pongas credenciales reales directamente en el codigo fuente.

Variables esperadas en .env.test:
    TEST_API_URL    URL del backend en produccion
    ADMIN_EMAIL     Email de administrador
    ADMIN_PASSWORD  Contrasena del administrador
    TEST_EMAIL      Email de usuario con acceso completo
    TEST_PASSWORD   Contrasena del usuario test
    TEST_EMAIL_2    (Opcional) Segundo usuario para pruebas de aislamiento
    TEST_PASSWORD_2 Contrasena del segundo usuario
"""

import pytest
import httpx
from datetime import date
from faker import Faker

from config import (
    BASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD,
    TEST_EMAIL, TEST_PASSWORD, TEST_EMAIL_2, TEST_PASSWORD_2,
)

fake = Faker("es_CO")


# ── Clientes HTTP ─────────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def client():
    """Cliente HTTP sin autenticación (sesión completa)."""
    with httpx.Client(base_url=BASE_URL, timeout=30) as c:
        yield c


# ── Tokens y headers ──────────────────────────────────────────────────────────

@pytest.fixture(scope="session")
def admin_token(client):
    res = client.post("/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert res.status_code == 200, (
        f"Login admin falló ({res.status_code}). "
        f"Verifica ADMIN_EMAIL y ADMIN_PASSWORD en .env.test\n{res.text}"
    )
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture(scope="session")
def user_token(client):
    res = client.post("/auth/login", json={"email": TEST_EMAIL, "password": TEST_PASSWORD})
    assert res.status_code == 200, (
        f"Login usuario test falló ({res.status_code}). "
        f"Verifica TEST_EMAIL y TEST_PASSWORD en .env.test\n{res.text}"
    )
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(user_token):
    return {"Authorization": f"Bearer {user_token}"}


@pytest.fixture(scope="session")
def user_token_2(client):
    res = client.post("/auth/login", json={"email": TEST_EMAIL_2, "password": TEST_PASSWORD_2})
    if res.status_code != 200:
        pytest.skip("TEST_EMAIL_2 no disponible — saltando pruebas de aislamiento cross-user")
    return res.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers_2(user_token_2):
    return {"Authorization": f"Bearer {user_token_2}"}


@pytest.fixture(scope="session")
def current_user(client, auth_headers):
    res = client.get("/auth/me", headers=auth_headers)
    assert res.status_code == 200
    return res.json()


# ── Factories de datos de prueba ──────────────────────────────────────────────

def make_valoracion_payload(**overrides):
    payload = {
        "fecha_valoracion": date.today().isoformat(),
        "trabajador": {
            "nombre": fake.name(),
            "documento": fake.numerify("##########"),
            "fecha_nacimiento": "1985-06-15",
        },
        "info_laboral": {
            "empresa": fake.company(),
            "eps": "SURA",
            "dias_incapacidad": 30,
        },
    }
    payload.update(overrides)
    return payload


def make_prueba_trabajo_payload(**overrides):
    payload = {
        "fecha_valoracion": date.today().isoformat(),
        "datos_empresa": {
            "empresa": fake.company(),
            "nit": fake.numerify("########-#"),
            "ciudad": "Bogotá",
            "arl": "Sura",
        },
        "trabajador": {
            "nombre": fake.name(),
            "identificacion": fake.numerify("##########"),
            "puesto_trabajo_evaluado": "Auxiliar de bodega",
        },
    }
    payload.update(overrides)
    return payload


def make_analisis_exigencia_payload(**overrides):
    payload = {
        "datos_generales": {
            "empresa": fake.company(),
            "nit": fake.numerify("########-#"),
            "cargo_analizado": "Operario de producción",
        },
    }
    payload.update(overrides)
    return payload


def make_analisis_mental_payload(**overrides):
    payload = {
        "fecha_valoracion": date.today().isoformat(),
        "datos_empresa": {
            "empresa": fake.company(),
            "nit": fake.numerify("########-#"),
        },
        "trabajador": {
            "nombre": fake.name(),
            "identificacion": fake.numerify("##########"),
        },
    }
    payload.update(overrides)
    return payload


def make_valoracion_ocupacional_payload(**overrides):
    payload = {
        "fecha_valoracion": date.today().isoformat(),
        "datos_empresa": {
            "empresa": fake.company(),
        },
        "trabajador": {
            "nombre": fake.name(),
            "identificacion": fake.numerify("##########"),
        },
    }
    payload.update(overrides)
    return payload


# ── Fixtures de registros (con cleanup automatico) ────────────────────────────

@pytest.fixture
def created_valoracion(client, auth_headers):
    """Crea una valoracion y la elimina al terminar el test."""
    payload = make_valoracion_payload()
    res = client.post("/valoraciones/", json=payload, headers=auth_headers)
    assert res.status_code == 201, f"No se pudo crear valoracion de prueba: {res.text}"
    data = res.json()
    yield data
    client.delete(f"/valoraciones/{data['id']}", headers=auth_headers)


@pytest.fixture
def created_prueba_trabajo(client, auth_headers):
    payload = make_prueba_trabajo_payload()
    res = client.post("/pruebas-trabajo/", json=payload, headers=auth_headers)
    assert res.status_code == 201, f"No se pudo crear prueba de trabajo de prueba: {res.text}"
    data = res.json()
    yield data
    client.delete(f"/pruebas-trabajo/{data['id']}", headers=auth_headers)


@pytest.fixture
def created_analisis_exigencia(client, auth_headers):
    payload = make_analisis_exigencia_payload()
    res = client.post("/formatos-to/analisis-exigencia/", json=payload, headers=auth_headers)
    assert res.status_code == 201, f"No se pudo crear analisis de exigencia: {res.text}"
    data = res.json()
    yield data
    client.delete(f"/formatos-to/analisis-exigencia/{data['id']}", headers=auth_headers)


@pytest.fixture
def created_analisis_mental(client, auth_headers):
    payload = make_analisis_mental_payload()
    res = client.post("/analisis-exigencias-mental/", json=payload, headers=auth_headers)
    assert res.status_code == 201, f"No se pudo crear analisis mental: {res.text}"
    data = res.json()
    yield data
    client.delete(f"/analisis-exigencias-mental/{data['id']}", headers=auth_headers)


@pytest.fixture
def created_valoracion_ocupacional(client, auth_headers):
    payload = make_valoracion_ocupacional_payload()
    res = client.post("/formatos-to/valoracion-ocupacional/", json=payload, headers=auth_headers)
    assert res.status_code == 201, f"No se pudo crear valoracion ocupacional: {res.text}"
    data = res.json()
    yield data
    client.delete(f"/formatos-to/valoracion-ocupacional/{data['id']}", headers=auth_headers)
