"""Configuracion compartida para todos los tests — importable como modulo normal."""

import os
import sys

from dotenv import load_dotenv
load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), '..', '.env.test'))

BASE_URL       = os.getenv("TEST_API_URL", "https://mentis-production.up.railway.app")
ADMIN_EMAIL    = os.getenv("ADMIN_EMAIL",    "")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "")
TEST_EMAIL     = os.getenv("TEST_EMAIL",     "")
TEST_PASSWORD  = os.getenv("TEST_PASSWORD",  "")
TEST_EMAIL_2   = os.getenv("TEST_EMAIL_2",   "")
TEST_PASSWORD_2= os.getenv("TEST_PASSWORD_2","")

_faltantes = [nombre for nombre, val in [
    ("TEST_EMAIL",     TEST_EMAIL),
    ("TEST_PASSWORD",  TEST_PASSWORD),
    ("ADMIN_EMAIL",    ADMIN_EMAIL),
    ("ADMIN_PASSWORD", ADMIN_PASSWORD),
] if not val]

if _faltantes:
    print(
        f"\n[ERROR] Variables no configuradas: {_faltantes}\n"
        f"Crea backend/.env.test basandote en backend/.env.test.example\n",
        file=sys.stderr,
    )
    sys.exit(1)
