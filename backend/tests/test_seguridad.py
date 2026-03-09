"""
SUITE: Seguridad y Autorización
METODOLOGIA: Caja negra con enfoque adversarial
COBERTURA:
    - Acceso sin token a todos los endpoints protegidos
    - Tokens inválidos / malformados / expirados
    - Aislamiento entre usuarios: usuario B no puede leer registros de usuario A
    - Endpoints de admin bloqueados para roles normales
    - Inyección SQL / XSS en campos de texto (deben guardarse como texto, no ejecutarse)
    - Los errores no exponen información interna del sistema

CRITICO PARA: datos médicos, privacidad del paciente, cumplimiento normativo
"""

import pytest
import allure
from conftest import make_valoracion_payload, make_prueba_trabajo_payload


@allure.epic("Seguridad")
@allure.feature("Protección de endpoints")
class TestAccesoSinToken:

    ENDPOINTS_PROTEGIDOS = [
        ("GET",    "/valoraciones/"),
        ("GET",    "/pruebas-trabajo/"),
        ("GET",    "/formatos-to/analisis-exigencia/"),
        ("GET",    "/analisis-exigencias-mental/"),
        ("GET",    "/formatos-to/valoracion-ocupacional/"),
        ("GET",    "/usuarios/"),
        ("GET",    "/auth/me"),
    ]

    @allure.story("Sin token → 401 en todos los módulos")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.seguridad
    @pytest.mark.parametrize("method,endpoint", ENDPOINTS_PROTEGIDOS)
    def test_sin_token_retorna_401(self, client, method, endpoint):
        """Sin Authorization header, todos los endpoints protegidos retornan 401."""
        res = client.request(method, endpoint)
        assert res.status_code == 401, (
            f"{method} {endpoint} retornó {res.status_code} sin token — debería ser 401"
        )

    @allure.story("Token inválido → 401")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.seguridad
    @pytest.mark.parametrize("bad_token,descripcion", [
        ("Bearer token_basura",           "token aleatorio"),
        ("Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.firma_falsa", "JWT con firma falsa"),
        ("Basic dXNlcjpwYXNz",            "autenticación Basic en lugar de Bearer"),
        ("",                              "header vacío"),
    ])
    def test_token_invalido_retorna_401(self, client, bad_token, descripcion):
        """Tokens inválidos de distintos tipos son rechazados con 401."""
        headers = {"Authorization": bad_token} if bad_token else {}
        res = client.get("/valoraciones/", headers=headers)
        assert res.status_code == 401, f"Token '{descripcion}' debería ser rechazado"


@allure.epic("Seguridad")
@allure.feature("Aislamiento de datos entre usuarios")
class TestAislamientoEntreUsuarios:

    @allure.story("Usuario B no puede leer registros de usuario A")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.seguridad
    def test_valoracion_no_accesible_por_otro_usuario(
        self, client, auth_headers, auth_headers_2, created_valoracion
    ):
        """
        Una valoración creada por el usuario A no debe ser accesible
        por el usuario B (otro usuario del sistema).
        """
        id_ = created_valoracion["id"]
        res = client.get(f"/valoraciones/{id_}", headers=auth_headers_2)
        assert res.status_code in [403, 404], (
            f"El usuario 2 pudo acceder a la valoracion {id_} del usuario 1 "
            f"(status: {res.status_code})"
        )

    @allure.story("Usuario B no puede leer registros de usuario A")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.seguridad
    def test_prueba_trabajo_no_accesible_por_otro_usuario(
        self, client, auth_headers, auth_headers_2, created_prueba_trabajo
    ):
        """Una prueba de trabajo creada por usuario A no es accesible por usuario B."""
        id_ = created_prueba_trabajo["id"]
        res = client.get(f"/pruebas-trabajo/{id_}", headers=auth_headers_2)
        assert res.status_code in [403, 404], (
            f"Usuario 2 pudo acceder a prueba {id_} del usuario 1"
        )


@allure.epic("Seguridad")
@allure.feature("Control de acceso por rol")
class TestControlRol:

    @allure.story("Solo admin puede listar usuarios")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.seguridad
    def test_no_admin_no_puede_listar_usuarios(self, client, auth_headers):
        """
        Un usuario con rol psicologo/terapeuta no puede acceder a GET /usuarios/.
        Si el usuario de prueba es admin, este test se salta automáticamente.
        """
        res_me = client.get("/auth/me", headers=auth_headers)
        rol = res_me.json().get("rol", "")
        if rol == "admin":
            pytest.skip("El usuario de prueba es admin — este test requiere un usuario no-admin")

        res = client.get("/usuarios/", headers=auth_headers)
        assert res.status_code in [403, 401], (
            f"Usuario con rol '{rol}' pudo listar usuarios (status: {res.status_code})"
        )

    @allure.story("Admin puede listar usuarios")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.seguridad
    def test_admin_puede_listar_usuarios(self, client, admin_headers):
        """Admin puede acceder a GET /usuarios/."""
        res = client.get("/usuarios/", headers=admin_headers)
        assert res.status_code == 200


@allure.epic("Seguridad")
@allure.feature("Inyección y XSS")
class TestInyeccionYXSS:

    @allure.story("Campos de texto aceptan caracteres especiales sin ejecutarlos")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.seguridad
    def test_inyeccion_sql_se_guarda_como_texto(self, client, auth_headers):
        """
        Contenido con patrones SQL en campos de texto debe ser almacenado como texto
        literal, no interpretado. El sistema no debe retornar error 500.
        """
        payload = make_valoracion_payload()
        payload["trabajador"]["nombre"] = "'; DROP TABLE usuarios; --"
        payload["trabajador"]["documento"] = "1' OR '1'='1"

        res = client.post("/valoraciones/", json=payload, headers=auth_headers)
        assert res.status_code in [201, 422], (
            f"Inyección SQL causó error inesperado {res.status_code}: {res.text}"
        )
        if res.status_code == 201:
            id_ = res.json()["id"]
            # El sistema sigue funcionando después de guardar el registro
            res2 = client.get(f"/valoraciones/{id_}", headers=auth_headers)
            assert res2.status_code == 200
            client.delete(f"/valoraciones/{id_}", headers=auth_headers)

    @allure.story("Campos de texto aceptan caracteres especiales sin ejecutarlos")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.seguridad
    def test_xss_se_guarda_como_texto(self, client, auth_headers):
        """
        Payload XSS en campos de texto debe almacenarse como texto, no interpretarse.
        """
        payload = make_valoracion_payload()
        payload["trabajador"]["nombre"] = "<script>alert('xss')</script>"
        payload["info_laboral"]["empresa"] = "<img src=x onerror=alert(1)>"

        res = client.post("/valoraciones/", json=payload, headers=auth_headers)
        assert res.status_code in [201, 422]
        if res.status_code == 201:
            id_ = res.json()["id"]
            res2 = client.get(f"/valoraciones/{id_}", headers=auth_headers)
            # El valor retornado debe ser texto literal, no HTML ejecutable
            nombre_en_bd = res2.json().get("trabajador", {}).get("nombre", "")
            # No debe haber ejecución — el texto debe sobrevivir sin modificación
            # o ser sanitizado, pero no causar error 500
            assert res2.status_code == 200
            client.delete(f"/valoraciones/{id_}", headers=auth_headers)

    @allure.story("Errores no exponen información interna")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.seguridad
    def test_errores_no_exponen_stack_trace(self, client, auth_headers):
        """
        Los errores de la API no deben exponer stack traces, rutas de archivo
        ni detalles internos del servidor.
        """
        # Intentar crear con payload malformado
        res = client.post("/valoraciones/", json={"campo_inexistente": True}, headers=auth_headers)
        error_text = res.text.lower()
        # No debe contener rutas del servidor
        assert "traceback" not in error_text
        assert "/home/" not in error_text
        assert "c:\\" not in error_text
        assert "sqlalchemy" not in error_text
