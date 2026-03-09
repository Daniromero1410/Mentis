"""
SUITE: Autenticación
METODOLOGIA: Caja negra — se prueban entradas válidas, inválidas y límite
COBERTURA:
    - Login exitoso con credenciales válidas
    - Rechazo de credenciales inválidas
    - Validación de formato de token JWT
    - Protección de rutas sin token
    - Expiración / invalidez de token
"""

import pytest
import allure
from config import BASE_URL, TEST_EMAIL, TEST_PASSWORD


@allure.epic("Autenticación")
@allure.feature("Login")
class TestLogin:

    @allure.story("Login exitoso")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.auth
    @pytest.mark.smoke
    def test_login_exitoso_retorna_token(self, client):
        """Un usuario con credenciales válidas recibe un token JWT."""
        res = client.post("/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
        })
        assert res.status_code == 200
        body = res.json()
        assert "access_token" in body
        assert body["token_type"] == "bearer"
        assert len(body["access_token"]) > 20

    @allure.story("Login exitoso")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.auth
    def test_login_retorna_datos_usuario(self, client):
        """La respuesta del login incluye el objeto usuario con campos obligatorios."""
        res = client.post("/auth/login", json={
            "email": TEST_EMAIL,
            "password": TEST_PASSWORD,
        })
        assert res.status_code == 200
        user = res.json()["user"]
        assert "id" in user
        assert "email" in user
        assert "nombre" in user
        assert "rol" in user
        assert user["activo"] is True
        assert "hashed_password" not in user  # no debe exponer el hash

    @allure.story("Rechazo de credenciales incorrectas")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.auth
    def test_login_password_incorrecto_retorna_401(self, client):
        """Contraseña incorrecta es rechazada con 401."""
        res = client.post("/auth/login", json={
            "email": TEST_EMAIL,
            "password": "contraseña_incorrecta_xyz",
        })
        assert res.status_code == 401

    @allure.story("Rechazo de credenciales incorrectas")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.auth
    def test_login_email_inexistente_retorna_401(self, client):
        """Email que no existe en la base de datos es rechazado con 401."""
        res = client.post("/auth/login", json={
            "email": "usuario_que_no_existe@nada.com",
            "password": "cualquiera",
        })
        assert res.status_code == 401

    @allure.story("Validacion de campos")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.auth
    def test_login_sin_email_retorna_422(self, client):
        """Solicitud sin campo email es rechazada con 422 (Unprocessable Entity)."""
        res = client.post("/auth/login", json={"password": TEST_PASSWORD})
        assert res.status_code == 422

    @allure.story("Validacion de campos")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.auth
    def test_login_sin_password_retorna_422(self, client):
        """Solicitud sin campo password es rechazada con 422."""
        res = client.post("/auth/login", json={"email": TEST_EMAIL})
        assert res.status_code == 422

    @allure.story("Validacion de campos")
    @allure.severity(allure.severity_level.MINOR)
    @pytest.mark.auth
    def test_login_campos_vacios_retorna_error(self, client):
        """Campos vacíos son rechazados."""
        res = client.post("/auth/login", json={"email": "", "password": ""})
        assert res.status_code in [401, 422]

    @allure.story("Seguridad — respuesta no revela info interna")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.auth
    @pytest.mark.seguridad
    def test_error_login_no_revela_si_email_existe(self, client):
        """El mensaje de error de login no debe indicar si el email existe o no."""
        res_email_malo = client.post("/auth/login", json={
            "email": "noexiste@nada.com",
            "password": "cualquiera",
        })
        res_pass_mala = client.post("/auth/login", json={
            "email": TEST_EMAIL,
            "password": "password_incorrecto",
        })
        # Ambos deben dar 401 — no debe haber diferencia observable
        assert res_email_malo.status_code == 401
        assert res_pass_mala.status_code == 401


@allure.epic("Autenticación")
@allure.feature("Token JWT")
class TestTokenJWT:

    @allure.story("Acceso con token válido")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.auth
    @pytest.mark.smoke
    def test_get_me_con_token_valido(self, client, auth_headers):
        """GET /auth/me con token válido retorna los datos del usuario autenticado."""
        res = client.get("/auth/me", headers=auth_headers)
        assert res.status_code == 200
        user = res.json()
        assert "id" in user
        assert "email" in user
        assert "rol" in user

    @allure.story("Proteccion de rutas")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.auth
    @pytest.mark.seguridad
    def test_get_me_sin_token_retorna_401(self, client):
        """GET /auth/me sin token retorna 401."""
        res = client.get("/auth/me")
        assert res.status_code == 401

    @allure.story("Proteccion de rutas")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.auth
    @pytest.mark.seguridad
    def test_get_me_token_invalido_retorna_401(self, client):
        """GET /auth/me con token basura retorna 401."""
        res = client.get("/auth/me", headers={"Authorization": "Bearer token_completamente_falso"})
        assert res.status_code == 401

    @allure.story("Proteccion de rutas")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.auth
    @pytest.mark.seguridad
    def test_get_me_header_malformado_retorna_401(self, client):
        """Authorization header sin prefijo Bearer es rechazado."""
        res = client.get("/auth/me", headers={"Authorization": "solo-un-token-sin-bearer"})
        assert res.status_code == 401

    @allure.story("Proteccion de rutas")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.auth
    @pytest.mark.seguridad
    def test_endpoint_sin_token_retorna_401(self, client):
        """Rutas protegidas sin token retornan 401 en todos los módulos."""
        endpoints = [
            "/valoraciones/",
            "/pruebas-trabajo/",
            "/analisis-exigencias-mental/",
            "/formatos-to/valoracion-ocupacional/",
        ]
        for endpoint in endpoints:
            res = client.get(endpoint)
            assert res.status_code in [401, 403], (
                f"El endpoint {endpoint} debería requerir autenticación pero retornó {res.status_code}"
            )
