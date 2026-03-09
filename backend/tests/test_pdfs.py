"""
SUITE: Generación de PDFs
METODOLOGIA: Caja negra — verificar que el endpoint retorna un PDF válido
COBERTURA:
    - Status 200
    - Content-Type: application/pdf
    - Cuerpo no vacío (tiene bytes reales)
    - PDF de valoración, prueba de trabajo, análisis de exigencia, análisis mental
    - PDF requiere autenticación (sin token → 401)

PREREQUISITOS DE NEGOCIO:
    - Valoración: requiere concepto antes de generar PDF
    - Prueba de trabajo: requiere estado COMPLETADA (finalizar primero)
    - Análisis mental: requiere estado COMPLETADA (finalizar primero)
    - Análisis de exigencia: PDF siempre disponible
    - Valoración ocupacional: PDF siempre disponible

BUGS CONOCIDOS:
    - Analisis mental finalizar → 500 por parámetro incorrecto (AE vs Ae) en el servicio PDF
"""

import pytest
import allure


PDF_MAGIC_BYTES = b"%PDF"  # Todo PDF válido empieza con estos bytes


@allure.epic("Generación de Documentos")
@allure.feature("Exportación a PDF")
class TestPDFs:

    @allure.story("Valoración Psicológica")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.pdf
    def test_pdf_valoracion_retorna_200_y_es_pdf(
        self, client, auth_headers, created_valoracion
    ):
        """GET /valoraciones/{id}/descargar-pdf retorna un PDF válido (requiere concepto previo)."""
        id_ = created_valoracion["id"]

        # El backend requiere concepto antes de generar PDF
        put_res = client.put(f"/valoraciones/{id_}", json={
            "concepto": {
                "concepto_editado": "Trabajador apto para reintegro laboral.",
                "elaboro_nombre": "Psicologo Test",
                "reviso_nombre": "Revisor Test",
            }
        }, headers=auth_headers)
        assert put_res.status_code == 200, f"No se pudo agregar concepto: {put_res.text}"

        res = client.get(f"/valoraciones/{id_}/descargar-pdf", headers=auth_headers)
        assert res.status_code == 200, f"PDF valoracion retornó {res.status_code}: {res.text[:200]}"
        assert "pdf" in res.headers.get("content-type", "").lower()
        assert len(res.content) > 0
        assert res.content[:4] == PDF_MAGIC_BYTES

    @allure.story("Valoración Psicológica")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.pdf
    @pytest.mark.seguridad
    def test_pdf_valoracion_sin_token_retorna_401(self, client, created_valoracion):
        """El endpoint de descarga requiere autenticación."""
        id_ = created_valoracion["id"]
        res = client.get(f"/valoraciones/{id_}/descargar-pdf")
        assert res.status_code == 401

    @allure.story("Prueba de Trabajo")
    @allure.severity(allure.severity_level.CRITICAL)
    @pytest.mark.pdf
    def test_pdf_prueba_trabajo_retorna_200_y_es_pdf(
        self, client, auth_headers, created_prueba_trabajo
    ):
        """GET /pruebas-trabajo/{id}/descargar-pdf retorna un PDF válido (requiere finalizar primero)."""
        id_ = created_prueba_trabajo["id"]

        # El backend requiere estado COMPLETADA para generar PDF
        fin_res = client.post(f"/pruebas-trabajo/{id_}/finalizar", headers=auth_headers)
        assert fin_res.status_code == 200, f"No se pudo finalizar prueba: {fin_res.text}"

        res = client.get(f"/pruebas-trabajo/{id_}/descargar-pdf", headers=auth_headers)
        assert res.status_code == 200, f"PDF prueba trabajo retornó {res.status_code}"
        assert "pdf" in res.headers.get("content-type", "").lower()
        assert len(res.content) > 0
        assert res.content[:4] == PDF_MAGIC_BYTES

    @allure.story("Análisis de Exigencia")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.pdf
    def test_pdf_analisis_exigencia_retorna_200_y_es_pdf(
        self, client, auth_headers, created_analisis_exigencia
    ):
        """GET /formatos-to/analisis-exigencia/{id}/pdf retorna un PDF válido."""
        id_ = created_analisis_exigencia["id"]
        res = client.get(f"/formatos-to/analisis-exigencia/{id_}/pdf", headers=auth_headers)
        assert res.status_code == 200, f"PDF análisis exigencia retornó {res.status_code}"
        assert "pdf" in res.headers.get("content-type", "").lower()
        assert len(res.content) > 0
        assert res.content[:4] == PDF_MAGIC_BYTES

    @allure.story("Análisis de Exigencias Mental")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.pdf
    @pytest.mark.xfail(
        reason="BUG #001 en backend: generar_pdf_analisis_exigencia_mental() recibe "
               "keyword arg 'AE' pero la función espera 'Ae'. 500 al llamar /finalizar.",
        strict=False,
    )
    def test_pdf_analisis_mental_retorna_200_y_es_pdf(
        self, client, auth_headers, created_analisis_mental
    ):
        """GET /analisis-exigencias-mental/{id}/descargar-pdf retorna un PDF válido."""
        id_ = created_analisis_mental["id"]

        # El backend requiere estado COMPLETADA para generar PDF
        fin_res = client.post(f"/analisis-exigencias-mental/{id_}/finalizar", headers=auth_headers)
        assert fin_res.status_code == 200, f"Finalizar analisis mental retornó {fin_res.status_code}: {fin_res.text}"

        res = client.get(f"/analisis-exigencias-mental/{id_}/descargar-pdf", headers=auth_headers)
        assert res.status_code == 200, f"PDF análisis mental retornó {res.status_code}"
        assert "pdf" in res.headers.get("content-type", "").lower()
        assert len(res.content) > 0
        assert res.content[:4] == PDF_MAGIC_BYTES

    @allure.story("Valoración Ocupacional")
    @allure.severity(allure.severity_level.NORMAL)
    @pytest.mark.pdf
    def test_pdf_valoracion_ocupacional_retorna_200_y_es_pdf(
        self, client, auth_headers, created_valoracion_ocupacional
    ):
        """GET /formatos-to/valoracion-ocupacional/{id}/descargar-pdf retorna un PDF válido."""
        id_ = created_valoracion_ocupacional["id"]
        res = client.get(f"/formatos-to/valoracion-ocupacional/{id_}/descargar-pdf", headers=auth_headers)
        assert res.status_code == 200, f"PDF valoracion ocupacional retornó {res.status_code}"
        assert "pdf" in res.headers.get("content-type", "").lower()
        assert len(res.content) > 0
        assert res.content[:4] == PDF_MAGIC_BYTES
