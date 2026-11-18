import sys, getpass, secrets, hashlib
from pathlib import Path
if len(sys.argv) != 2 or sys.argv[1] not in ("TI", "MARKETING"):
    raise SystemExit("Uso: python change_password.py TI|MARKETING")
password = getpass.getpass("Nova senha (minimo 16 caracteres): ")
if len(password) < 16 or len(password) > 512 or password != getpass.getpass("Confirme: "):
    raise SystemExit("Senha invalida ou confirmacao diferente.")
salt = secrets.token_bytes(16)
digest = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 600000)
key = sys.argv[1] + "_PASSWORD_HASH"
path = Path(__file__).resolve().parent / ".env"
lines = [line for line in path.read_text().splitlines() if not line.startswith(key + "=")]
lines.append(f"{key}=pbkdf2_sha256:600000:{salt.hex()}:{digest.hex()}")
path.write_text("\n".join(lines) + "\n")
print("Hash atualizado. Em producao, execute docker compose -f compose.yaml up -d --force-recreate api para aplicar.")
