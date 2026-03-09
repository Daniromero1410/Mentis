"""
SUITE: Análisis de Exigencia (TO)
METODOLOGIA: Caja negra — CRUD completo
"""
import pytest
import allure
from conftest import make_analisis_exigencia_payload


@allure.epic("Módulos TO")
@allure.feature("Análisis de Exigencia")
class TestAnalisisExigenciaCRUD:

    @allure.story("Creación")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.crud
    @pytest.mark.smoke
    def test_crear_analisis(self, client, auth_headers):
        res = client.post("/formatos-to/analisis-exigencia/", json=make_analisis_exigencia_payload(), headers=auth_headers)
        assert res.status_code == 201
        data = res.json()
        assert "id" in data
        client.delete(f"/formatos-to/analisis-exigencia/{data['id']}", headers=auth_headers)

    @allure.story("Lectura")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.crud
    def test_obtener_por_id(self, client, auth_headers, created_analisis_exigencia):
        id_ = created_analisis_exigencia["id"]
        res = client.get(f"/formatos-to/analisis-exigencia/{id_}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["id"] == id_

    @allure.story("Lectura")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_listar(self, client, auth_headers, created_analisis_exigencia):
        res = client.get("/formatos-to/analisis-exigencia/", headers=auth_headers)
        assert res.status_code == 200

    @allure.story("Lectura")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_id_inexistente_404(self, client, auth_headers):
        res = client.get("/formatos-to/analisis-exigencia/999999999", headers=auth_headers)
        assert res.status_code == 404

    @allure.story("Actualización")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.crud
    def test_actualizar(self, client, auth_headers, created_analisis_exigencia):
        id_ = created_analisis_exigencia["id"]
        payload = make_analisis_exigencia_payload()
        payload["datos_generales"]["cargo_analizado"] = "Supervisor de planta actualizado"
        res = client.put(f"/formatos-to/analisis-exigencia/{id_}", json=payload, headers=auth_headers)
        assert res.status_code == 200

    @allure.story("Eliminación")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_eliminar(self, client, auth_headers):
        res = client.post("/formatos-to/analisis-exigencia/", json=make_analisis_exigencia_payload(), headers=auth_headers)
        assert res.status_code == 201
        id_ = res.json()["id"]
        del_res = client.delete(f"/formatos-to/analisis-exigencia/{id_}", headers=auth_headers)
        assert del_res.status_code in [200, 204]
        assert client.get(f"/formatos-to/analisis-exigencia/{id_}", headers=auth_headers).status_code == 404
