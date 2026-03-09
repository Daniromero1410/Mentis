"""
SUITE: Análisis de Exigencias Mental
METODOLOGIA: Caja negra — CRUD completo + finalización
"""
import pytest
import allure
from conftest import make_analisis_mental_payload


@allure.epic("Módulos Clínicos")
@allure.feature("Análisis de Exigencias Mental")
class TestAnalisisExigenciaMentalCRUD:

    @allure.story("Creación")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.crud
    @pytest.mark.smoke
    def test_crear_analisis_mental(self, client, auth_headers):
        res = client.post("/analisis-exigencias-mental/", json=make_analisis_mental_payload(), headers=auth_headers)
        assert res.status_code == 201
        data = res.json()
        assert "id" in data
        client.delete(f"/analisis-exigencias-mental/{data['id']}", headers=auth_headers)

    @allure.story("Lectura")
    @allure.severity(allure.severity_level.BLOCKER)
    @pytest.mark.crud
    def test_obtener_por_id(self, client, auth_headers, created_analisis_mental):
        id_ = created_analisis_mental["id"]
        res = client.get(f"/analisis-exigencias-mental/{id_}", headers=auth_headers)
        assert res.status_code == 200
        assert res.json()["id"] == id_

    @allure.story("Lectura")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_id_inexistente_404(self, client, auth_headers):
        res = client.get("/analisis-exigencias-mental/999999999", headers=auth_headers)
        assert res.status_code == 404

    @allure.story("Actualización")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.crud
    def test_actualizar(self, client, auth_headers, created_analisis_mental):
        id_ = created_analisis_mental["id"]
        payload = make_analisis_mental_payload()
        res = client.put(f"/analisis-exigencias-mental/{id_}", json=payload, headers=auth_headers)
        assert res.status_code == 200

    @allure.story("Finalización")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.crud
    def test_finalizar(self, client, auth_headers, created_analisis_mental):
        id_ = created_analisis_mental["id"]
        res = client.post(f"/analisis-exigencias-mental/{id_}/finalizar", headers=auth_headers)
        assert res.status_code == 200
        estado = res.json().get("estado", "")
        assert estado.upper() in ["COMPLETADA", "COMPLETED", "FINALIZADA"]

    @allure.story("Eliminación")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.crud
    def test_eliminar(self, client, auth_headers):
        res = client.post("/analisis-exigencias-mental/", json=make_analisis_mental_payload(), headers=auth_headers)
        assert res.status_code == 201
        id_ = res.json()["id"]
        del_res = client.delete(f"/analisis-exigencias-mental/{id_}", headers=auth_headers)
        assert del_res.status_code in [200, 204]
        assert client.get(f"/analisis-exigencias-mental/{id_}", headers=auth_headers).status_code == 404
