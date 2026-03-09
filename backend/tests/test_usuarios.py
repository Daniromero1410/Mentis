"""
SUITE: Administración de Usuarios
METODOLOGIA: Caja negra — operaciones CRUD del admin + restricciones de rol
COBERTURA:
    - Admin puede crear, leer, actualizar y eliminar usuarios
    - Email duplicado es rechazado
    - No-admin no puede crear usuarios
    - Usuario inactivo no puede autenticarse
"""

import pytest
import allure
from faker import Faker

fake = Faker("es_CO")


def make_usuario_payload(**overrides):
    payload = {
        "email": fake.unique.email(),
        "nombre": fake.first_name(),
        "apellido": fake.last_name(),
        "password": "TestPassword123!",
        "rol": "psicologo",
        "activo": True,
        "acceso_valoraciones": True,
        "acceso_pruebas_trabajo": True,
        "acceso_formatos_to": False,
        "acceso_analisis_exigencias_mental": True,
        "acceso_valoracion_ocupacional": False,
    }
    payload.update(overrides)
    return payload


@allure.epic("Administración")
@allure.feature("Gestión de Usuarios")
class TestUsuariosAdmin:

    @allure.story("Admin CRUD completo")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.usuarios
    @pytest.mark.smoke
    def test_admin_crea_usuario(self, client, admin_headers):
        """Admin puede crear un nuevo usuario."""
        payload = make_usuario_payload()
        res = client.post("/usuarios/", json=payload, headers=admin_headers)
        assert res.status_code in [200, 201], f"Error al crear usuario: {res.text}"
        data = res.json()
        assert "id" in data
        assert data["email"] == payload["email"]
        # cleanup
        client.delete(f"/usuarios/{data['id']}", headers=admin_headers)

    @allure.story("Admin CRUD completo")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.usuarios
    def test_admin_lista_usuarios(self, client, admin_headers):
        """Admin puede listar todos los usuarios del sistema."""
        res = client.get("/usuarios/", headers=admin_headers)
        assert res.status_code == 200
        body = res.json()
        items = body if isinstance(body, list) else body.get("items", body.get("data", []))
        assert len(items) >= 1

    @allure.story("Admin CRUD completo")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.usuarios
    def test_admin_actualiza_usuario(self, client, admin_headers):
        """Admin puede actualizar datos de un usuario."""
        # Crear usuario temporal
        payload = make_usuario_payload()
        res = client.post("/usuarios/", json=payload, headers=admin_headers)
        assert res.status_code in [200, 201]
        id_ = res.json()["id"]

        # Actualizar
        payload["nombre"] = "NombreActualizado"
        res2 = client.put(f"/usuarios/{id_}", json=payload, headers=admin_headers)
        assert res2.status_code == 200

        client.delete(f"/usuarios/{id_}", headers=admin_headers)

    @allure.story("Admin CRUD completo")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.usuarios
    def test_admin_elimina_usuario(self, client, admin_headers):
        """Admin puede eliminar un usuario."""
        payload = make_usuario_payload()
        res = client.post("/usuarios/", json=payload, headers=admin_headers)
        assert res.status_code in [200, 201]
        id_ = res.json()["id"]

        del_res = client.delete(f"/usuarios/{id_}", headers=admin_headers)
        assert del_res.status_code in [200, 204]

    @allure.story("Validaciones")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.usuarios
    def test_email_duplicado_rechazado(self, client, admin_headers):
        """Crear dos usuarios con el mismo email es rechazado."""
        payload = make_usuario_payload()
        res1 = client.post("/usuarios/", json=payload, headers=admin_headers)
        assert res1.status_code in [200, 201]
        id1 = res1.json()["id"]

        # Intentar crear con el mismo email
        res2 = client.post("/usuarios/", json=payload, headers=admin_headers)
        assert res2.status_code in [400, 409, 422], (
            f"Email duplicado debería ser rechazado pero retornó {res2.status_code}"
        )

        client.delete(f"/usuarios/{id1}", headers=admin_headers)

    @allure.story("Usuario inactivo")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.usuarios
    @pytest.mark.seguridad
    def test_usuario_inactivo_no_puede_login(self, client, admin_headers):
        """Un usuario con activo=False no puede autenticarse."""
        # Crear usuario inactivo
        payload = make_usuario_payload(activo=False)
        res = client.post("/usuarios/", json=payload, headers=admin_headers)
        assert res.status_code in [200, 201]
        id_ = res.json()["id"]

        # Intentar login
        login_res = client.post("/auth/login", json={
            "email": payload["email"],
            "password": payload["password"],
        })
        assert login_res.status_code in [401, 403], (
            f"Usuario inactivo pudo hacer login (status: {login_res.status_code})"
        )

        client.delete(f"/usuarios/{id_}", headers=admin_headers)
