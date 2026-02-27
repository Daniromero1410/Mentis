import os

file_path = r'c:\Users\daniel.romero\OneDrive - GESTAR INNOVACION S.A.S\Documentos\william-romero\backend\app\routers\analisis_exigencias_mental.py'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

sub_endpoints_code = '''

# ===== SUB-ENDPOINTS INDIVIDUALES =====
@router.get("/{AE_id:int}/secciones", response_model=SeccionesAERead)
def obtener_secciones(AE_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    secciones = session.exec(select(SeccionesAE).where(SeccionesAE.AE_id == AE_id)).first()
    if not secciones: return {} # Devolver vacio si no existe
    return secciones

@router.post("/{AE_id:int}/secciones")
def guardar_secciones(AE_id: int, request: dict, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    secciones = session.exec(select(SeccionesAE).where(SeccionesAE.AE_id == AE_id)).first()
    if secciones:
        for key, value in request.items():
            if hasattr(secciones, key) and key != 'id' and key != 'AE_id':
                setattr(secciones, key, value)
        secciones.updated_at = datetime.utcnow()
        session.add(secciones)
    else:
        # Filtrar campos validos
        valid_keys = SeccionesAECreate.__fields__.keys()
        data = {k: v for k, v in request.items() if k in valid_keys}
        secciones = SeccionesAE(AE_id=AE_id, **data)
        session.add(secciones)
    session.commit()
    return {"msg": "Secciones guardadas correctamente"}

@router.get("/{AE_id:int}/condiciones-riesgo")
def obtener_condiciones_riesgo(AE_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    condiciones = session.exec(select(CondicionRiesgoAE).where(CondicionRiesgoAE.AE_id == AE_id)).all()
    return condiciones

@router.post("/{AE_id:int}/condiciones-riesgo")
def guardar_condicion_riesgo(AE_id: int, request: dict, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    
    dimension = request.get('dimension')
    item_numero = request.get('item_numero')
    
    if not dimension or item_numero is None:
        raise HTTPException(status_code=400, detail="Falta dimension o item_numero")
        
    condicion = session.exec(
        select(CondicionRiesgoAE)
        .where(CondicionRiesgoAE.AE_id == AE_id)
        .where(CondicionRiesgoAE.dimension == dimension)
        .where(CondicionRiesgoAE.item_numero == item_numero)
    ).first()
    
    if condicion:
        for key, value in request.items():
            if hasattr(condicion, key) and key != 'id' and key != 'AE_id':
                setattr(condicion, key, value)
        condicion.updated_at = datetime.utcnow()
        session.add(condicion)
    else:
        valid_keys = CondicionRiesgoAECreate.__fields__.keys()
        data = {k: v for k, v in request.items() if k in valid_keys}
        condicion = CondicionRiesgoAE(AE_id=AE_id, **data)
        session.add(condicion)
        
    session.commit()
    return {"msg": "Condicion guardada correctamente"}

@router.get("/{AE_id:int}/resumen-factores")
def obtener_resumen_factores(AE_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    resumenes = session.exec(select(ResumenFactorAE).where(ResumenFactorAE.AE_id == AE_id)).all()
    return resumenes

@router.post("/{AE_id:int}/resumen-factores")
def guardar_resumen_factor(AE_id: int, request: dict, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    
    dimension = request.get('dimension')
    if not dimension:
        raise HTTPException(status_code=400, detail="Falta dimension")
        
    resumen = session.exec(
        select(ResumenFactorAE)
        .where(ResumenFactorAE.AE_id == AE_id)
        .where(ResumenFactorAE.dimension == dimension)
    ).first()
    
    # Check for empty strings in NivelRiesgo enums
    if request.get('nivel_riesgo_trabajador') == '':
        request['nivel_riesgo_trabajador'] = None
    if request.get('nivel_riesgo_experto') == '':
        request['nivel_riesgo_experto'] = None
        
    if resumen:
        for key, value in request.items():
            if hasattr(resumen, key) and key != 'id' and key != 'AE_id':
                setattr(resumen, key, value)
        resumen.updated_at = datetime.utcnow()
        session.add(resumen)
    else:
        valid_keys = ResumenFactorAECreate.__fields__.keys()
        data = {k: v for k, v in request.items() if k in valid_keys}
        resumen = ResumenFactorAE(AE_id=AE_id, **data)
        session.add(resumen)
        
    session.commit()
    return {"msg": "Resumen guardado correctamente"}

@router.get("/{AE_id:int}/concepto-final")
def obtener_concepto_final(AE_id: int, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    concepto = session.exec(select(ConceptoFinalAE).where(ConceptoFinalAE.AE_id == AE_id)).first()
    if not concepto: return {} # Devolver vacio si no existe
    return concepto

@router.post("/{AE_id:int}/concepto-final")
def guardar_concepto_final(AE_id: int, request: dict, session: Session = Depends(get_session), current_user: Usuario = Depends(get_current_user)):
    AE = session.get(AnalisisExigenciaMental, AE_id)
    if not AE: raise HTTPException(status_code=404, detail="AE no encontrada")
    concepto = session.exec(select(ConceptoFinalAE).where(ConceptoFinalAE.AE_id == AE_id)).first()
    
    if concepto:
        for key, value in request.items():
            # Special case to store signature natively later or ignore empty string for signature
            if key == 'firma_evaluador' and not value:
                continue
            if hasattr(concepto, key) and key != 'id' and key != 'AE_id':
                setattr(concepto, key, value)
        concepto.updated_at = datetime.utcnow()
        session.add(concepto)
    else:
        valid_keys = ConceptoFinalAECreate.__fields__.keys()
        data = {k: v for k, v in request.items() if k in valid_keys}
        concepto = ConceptoFinalAE(AE_id=AE_id, **data)
        session.add(concepto)
        
    session.commit()
    return {"msg": "Concepto final guardado correctamente"}

'''

parts = content.split('# ===== DESCARGAR PDF =====')
new_content = parts[0] + sub_endpoints_code + '# ===== DESCARGAR PDF =====' + parts[1]

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(new_content)

print("Endpoints added successfully!")
