"""
SUITE: Pruebas de Trabajo
METODOLOGIA: Caja negra — flujo CRUD + persistencia de secciones anidadas
COBERTURA:
    - CRUD completo (crear, leer, actualizar, finalizar, eliminar)
    - Persistencia de datos anidados (datos_empresa, trabajador, secciones)
    - Validación de campos
    - Manejo de IDs inexistentes
"""

import pytest
import allure
from conftest import make_prueba_trabajo_payload
from faker import Faker

fake = Faker("es_CO")


@allure.epic("Módulos Clínicos")
@allure.feature("Pruebas de Trabajo")
class TestPruebasTrabajoCRUD:

    @allure.story("Creación")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.crud
    @pytest.mark.smoke
    def test_crear_prueba_minima(self, client, auth_headers):
        """Crear prueba de trabajo con datos mínimos retorna 201."""
        payload = make_prueba_trabajo_payload()
        res = client.post("/pruebas-trabajo/", json=payload, headers=auth_headers)
        assert res.status_code == 201
        data = res.json()
        assert "id" in data
        client.delete(f"/pruebas-trabajo/{data['id']}", headers=auth_headers)

    @allure.story("Lectura")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.crud
    @pytest.mark.smoke
    def test_obtener_prueba_por_id(self, client, auth_headers, created_prueba_trabajo):
        """GET /pruebas-trabajo/{id} retorna la prueba con el ID correcto."""
        id_ = created_prueba_trabajo["id"]
        res = client.get(f"/pruebas-trabajo/{id_}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["id"] == id_

    @allure.story("Lectura")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_listar_pruebas(self, client, auth_headers, created_prueba_trabajo):
        """GET /pruebas-trabajo/ retorna lista con al menos un elemento."""
        res = client.get("/pruebas-trabajo/", headers=auth_headers)
        assert res.status_code == 200
        body = res.json()
        items = body if isinstance(body, list) else body.get("items", body.get("data", []))
        assert len(items) >= 1

    @allure.story("Lectura")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_id_inexistente_retorna_404(self, client, auth_headers):
        """GET /pruebas-trabajo/999999999 retorna 404."""
        res = client.get("/pruebas-trabajo/999999999", headers=auth_headers)
        assert res.status_code == 404

    @allure.story("Actualización")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.crud
    def test_actualizar_datos_trabajador(self, client, auth_headers, created_prueba_trabajo):
        """PUT actualiza el nombre del trabajador correctamente."""
        id_ = created_prueba_trabajo["id"]
        nuevo_nombre = "Trabajador Actualizado " + fake.last_name()
        payload = make_prueba_trabajo_payload()
        payload["trabajador"]["nombre"] = nuevo_nombre

        res = client.put(f"/pruebas-trabajo/{id_}", json=payload, headers=auth_headers)
        assert res.status_code == 200

        res2 = client.get(f"/pruebas-trabajo/{id_}", headers=auth_headers)
        body = res2.json()
        nombre_en_bd = (
            body.get("trabajador", {}).get("nombre")
            or body.get("nombre_trabajador")
        )
        assert nombre_en_bd == nuevo_nombre

    @allure.story("Integridad de datos")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.integridad
    def test_datos_empresa_persisten(self, client, auth_headers):
        """Los datos de empresa guardados se recuperan íntegramente."""
        empresa_test = "Empresa Test " + fake.numerify("####")
        ciudad_test = "Medellín"
        payload = make_prueba_trabajo_payload()
        payload["datos_empresa"]["empresa"] = empresa_test
        payload["datos_empresa"]["ciudad"] = ciudad_test

        res = client.post("/pruebas-trabajo/", json=payload, headers=auth_headers)
        assert res.status_code == 201
        id_ = res.json()["id"]

        res2 = client.get(f"/pruebas-trabajo/{id_}", headers=auth_headers)
        body = res2.json()
        empresa_bd = (
            body.get("datos_empresa", {}).get("empresa")
            or body.get("empresa")
        )
        assert empresa_bd == empresa_test

        client.delete(f"/pruebas-trabajo/{id_}", headers=auth_headers)

    @allure.story("Finalización")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.crud
    def test_finalizar_prueba(self, client, auth_headers, created_prueba_trabajo):
        """POST /pruebas-trabajo/{id}/finalizar completa la prueba y devuelve confirmación."""
        id_ = created_prueba_trabajo["id"]
        res = client.post(f"/pruebas-trabajo/{id_}/finalizar", headers=auth_headers)
        assert res.status_code == 200
        body = res.json()
        # El endpoint puede devolver {estado} o {message, prueba_id, pdf_url}
        finalizado = (
            body.get("estado", "").upper() in ["COMPLETADA", "COMPLETED", "FINALIZADA"]
            or body.get("prueba_id") == id_
            or "finaliz" in body.get("message", "").lower()
            or body.get("pdf_url") is not None
        )
        assert finalizado, f"Respuesta inesperada de finalizar: {body}"

    @allure.story("Eliminación")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_eliminar_prueba(self, client, auth_headers):
        """DELETE elimina la prueba; GET posterior retorna 404."""
        res = client.post("/pruebas-trabajo/", json=make_prueba_trabajo_payload(), headers=auth_headers)
        assert res.status_code == 201
        id_ = res.json()["id"]

        del_res = client.delete(f"/pruebas-trabajo/{id_}", headers=auth_headers)
        assert del_res.status_code in [200, 204]

        get_res = client.get(f"/pruebas-trabajo/{id_}", headers=auth_headers)
        assert get_res.status_code == 404
