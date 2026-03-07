import os
from sqlalchemy import create_engine, text
engine = create_engine('postgresql://william_admin:william_secure_2024@localhost:5432/william_romero')
with engine.connect() as conn:
    rs = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='tareas_to'")).fetchall()
    print([r[0] for r in rs])
