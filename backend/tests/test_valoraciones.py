"""
SUITE: Valoraciones Psicológicas
METODOLOGIA: Caja negra — flujo CRUD completo + integridad de datos
COBERTURA:
    - Creacion con datos mínimos y datos completos
    - Lectura por ID y listado paginado
    - Actualizacion parcial y total
    - Verificacion de persistencia de datos (guardar → recuperar → comparar)
    - Finalizacion de valoracion
    - Eliminacion
    - Validacion de campos requeridos
    - Manejo de IDs inexistentes
"""

import pytest
import allure
from conftest import make_valoracion_payload
from faker import Faker

fake = Faker("es_CO")


@allure.epic("Módulos Clínicos")
@allure.feature("Valoraciones Psicológicas")
class TestValoracionesCRUD:

    @allure.story("Creación")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.crud
    @pytest.mark.smoke
    def test_crear_valoracion_minima(self, client, auth_headers):
        """Crear una valoración con campos mínimos requeridos retorna 201."""
        payload = make_valoracion_payload()
        res = client.post("/valoraciones/", json=payload, headers=auth_headers)
        assert res.status_code == 201
        data = res.json()
        assert "id" in data
        assert data["id"] > 0
        # cleanup
        client.delete(f"/valoraciones/{data['id']}", headers=auth_headers)

    @allure.story("Creación")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.crud
    def test_crear_valoracion_retorna_id_unico(self, client, auth_headers):
        """Dos valoraciones creadas consecutivamente tienen IDs distintos."""
        ids = []
        for _ in range(2):
            res = client.post("/valoraciones/", json=make_valoracion_payload(), headers=auth_headers)
            assert res.status_code == 201
            ids.append(res.json()["id"])
        assert ids[0] != ids[1]
        for id_ in ids:
            client.delete(f"/valoraciones/{id_}", headers=auth_headers)

    @allure.story("Lectura")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.crud
    @pytest.mark.smoke
    def test_obtener_valoracion_por_id(self, client, auth_headers, created_valoracion):
        """GET /valoraciones/{id} retorna la valoracion correcta."""
        id_ = created_valoracion["id"]
        res = client.get(f"/valoraciones/{id_}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["id"] == id_

    @allure.story("Lectura")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_listar_valoraciones_retorna_lista(self, client, auth_headers, created_valoracion):
        """GET /valoraciones/ retorna una lista con al menos un elemento."""
        res = client.get("/valoraciones/", headers=auth_headers)
        assert res.status_code == 200
        body = res.json()
        # acepta lista directa o paginacion { items: [...] }
        items = body if isinstance(body, list) else body.get("items", body.get("data", []))
        assert len(items) >= 1

    @allure.story("Lectura")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_id_inexistente_retorna_404(self, client, auth_headers):
        """GET /valoraciones/999999999 retorna 404."""
        res = client.get("/valoraciones/999999999", headers=auth_headers)
        assert res.status_code == 404

    @allure.story("Actualización")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.crud
    def test_actualizar_trabajador_nombre(self, client, auth_headers, created_valoracion):
        """PUT /valoraciones/{id} actualiza el nombre del trabajador."""
        id_ = created_valoracion["id"]
        nuevo_nombre = "Nombre Actualizado Test " + fake.last_name()
        payload = make_valoracion_payload()
        payload["trabajador"]["nombre"] = nuevo_nombre

        res = client.put(f"/valoraciones/{id_}", json=payload, headers=auth_headers)
        assert res.status_code == 200

        res2 = client.get(f"/valoraciones/{id_}", headers=auth_headers)
        body = res2.json()
        # el nombre puede estar en trabajador o directamente
        nombre_en_bd = (
            body.get("trabajador", {}).get("nombre")
            or body.get("nombre_trabajador")
        )
        assert nombre_en_bd == nuevo_nombre

    @allure.story("Integridad de datos")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.integridad
    def test_datos_persisten_tras_guardado(self, client, auth_headers):
        """Los datos guardados se recuperan exactamente igual."""
        nombre_test = "Paciente Prueba " + fake.numerify("####")
        documento_test = fake.numerify("##########")
        payload = make_valoracion_payload()
        payload["trabajador"]["nombre"] = nombre_test
        payload["trabajador"]["documento"] = documento_test
        payload["info_laboral"]["dias_incapacidad"] = 45

        res = client.post("/valoraciones/", json=payload, headers=auth_headers)
        assert res.status_code == 201
        id_ = res.json()["id"]

        res2 = client.get(f"/valoraciones/{id_}", headers=auth_headers)
        body = res2.json()

        trab = body.get("trabajador", {})
        assert trab.get("nombre") == nombre_test
        assert trab.get("documento") == documento_test

        client.delete(f"/valoraciones/{id_}", headers=auth_headers)

    @allure.story("Finalización")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.crud
    def test_finalizar_valoracion(self, client, auth_headers, created_valoracion):
        """POST /valoraciones/{id}/finalizar cambia el estado a COMPLETADA (requiere concepto previo)."""
        id_ = created_valoracion["id"]

        # Requisito del negocio: la valoración debe tener concepto antes de finalizar
        put_res = client.put(f"/valoraciones/{id_}", json={
            "concepto": {
                "concepto_editado": "Trabajador apto para reintegro laboral sin restricciones.",
                "elaboro_nombre": "Psicologo Test Automatizado",
                "reviso_nombre": "Revisor Test Automatizado",
            }
        }, headers=auth_headers)
        assert put_res.status_code == 200, f"No se pudo agregar concepto: {put_res.text}"

        res = client.post(f"/valoraciones/{id_}/finalizar", headers=auth_headers)
        assert res.status_code == 200, f"Finalizar retornó {res.status_code}: {res.text}"
        body = res.json()
        estado = body.get("estado", "")
        assert estado.upper() in ["COMPLETADA", "COMPLETED", "FINALIZADA"]

    @allure.story("Eliminación")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_eliminar_valoracion(self, client, auth_headers):
        """DELETE /valoraciones/{id} elimina el registro y 404 al intentar recuperarlo."""
        res = client.post("/valoraciones/", json=make_valoracion_payload(), headers=auth_headers)
        assert res.status_code == 201
        id_ = res.json()["id"]

        del_res = client.delete(f"/valoraciones/{id_}", headers=auth_headers)
        assert del_res.status_code in [200, 204]

        get_res = client.get(f"/valoraciones/{id_}", headers=auth_headers)
        assert get_res.status_code == 404


@allure.epic("Módulos Clínicos")
@allure.feature("Valoraciones Psicológicas")
class TestValoracionesValidacion:

    @allure.story("Validación de campos requeridos")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_crear_sin_trabajador_retorna_error(self, client, auth_headers):
        """Crear valoracion sin trabajador es rechazado con 422."""
        payload = {"fecha_valoracion": "2025-01-15"}
        res = client.post("/valoraciones/", json=payload, headers=auth_headers)
        assert res.status_code == 422

    @allure.story("Validación de campos requeridos")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_crear_sin_fecha_retorna_error(self, client, auth_headers):
        """Crear valoracion sin fecha_valoracion es rechazado con 422."""
        payload = {
            "trabajador": {"nombre": "Test", "documento": "123"}
        }
        res = client.post("/valoraciones/", json=payload, headers=auth_headers)
        assert res.status_code == 422

    @allure.story("Validación de campos requeridos")
    @allure.severity(allure.severity_level.MINOR)
    @pytest.mark.crud
    def test_fecha_formato_invalido_retorna_error(self, client, auth_headers):
        """Una fecha con formato inválido es rechazada."""
        payload = make_valoracion_payload()
        payload["fecha_valoracion"] = "no-es-una-fecha"
        res = client.post("/valoraciones/", json=payload, headers=auth_headers)
        assert res.status_code == 422
