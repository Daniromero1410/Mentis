"""
SUITE: Valoración Ocupacional (TO)
METODOLOGIA: Caja negra — CRUD completo
"""
import pytest
import allure
from conftest import make_valoracion_ocupacional_payload


@allure.epic("Módulos TO")
@allure.feature("Valoración Ocupacional")
class TestValoracionOcupacionalCRUD:

    @allure.story("Creación")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.crud
    @pytest.mark.smoke
    def test_crear(self, client, auth_headers):
        res = client.post("/formatos-to/valoracion-ocupacional/", json=make_valoracion_ocupacional_payload(), headers=auth_headers)
        assert res.status_code == 201
        data = res.json()
        assert "id" in data
        client.delete(f"/formatos-to/valoracion-ocupacional/{data['id']}", headers=auth_headers)

    @allure.story("Lectura")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.crud
    def test_obtener_por_id(self, client, auth_headers, created_valoracion_ocupacional):
        id_ = created_valoracion_ocupacional["id"]
        res = client.get(f"/formatos-to/valoracion-ocupacional/{id_}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["id"] == id_

    @allure.story("Lectura")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_id_inexistente_404(self, client, auth_headers):
        res = client.get("/formatos-to/valoracion-ocupacional/999999999", headers=auth_headers)
        assert res.status_code == 404

    @allure.story("Actualización")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.crud
    def test_actualizar(self, client, auth_headers, created_valoracion_ocupacional):
        id_ = created_valoracion_ocupacional["id"]
        res = client.put(f"/formatos-to/valoracion-ocupacional/{id_}", json=make_valoracion_ocupacional_payload(), headers=auth_headers)
        assert res.status_code == 200

    @allure.story("Finalización")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.crud
    def test_finalizar(self, client, auth_headers, created_valoracion_ocupacional):
        id_ = created_valoracion_ocupacional["id"]
        res = client.post(f"/formatos-to/valoracion-ocupacional/{id_}/finalizar", headers=auth_headers)
        assert res.status_code == 200

    @allure.story("Eliminación")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_eliminar(self, client, auth_headers):
        res = client.post("/formatos-to/valoracion-ocupacional/", json=make_valoracion_ocupacional_payload(), headers=auth_headers)
        assert res.status_code == 201
        id_ = res.json()["id"]
        del_res = client.delete(f"/formatos-to/valoracion-ocupacional/{id_}", headers=auth_headers)
        assert del_res.status_code in [200, 204]
        assert client.get(f"/formatos-to/valoracion-ocupacional/{id_}", headers=auth_headers).status_code == 404
