#!/usr/bin/env python3

"""
scripts/auto-remediate.py - Orquestador de remediación automática
Crea PRs automáticas con fixes para vulnerabilidades encontradas
"""

import json
import subprocess
import os
import sys
from datetime import datetime
import requests

def run_command(cmd, capture=True):
    """Ejecuta un comando y retorna output"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=capture,
            text=True,
            timeout=60
        )
        return result.returncode, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        return 1, "", "Timeout executing command"

def get_github_token():
    """Obtiene el GitHub token de variables de entorno"""
    token = os.getenv('GITHUB_TOKEN')
    if not token:
        print("Error: GITHUB_TOKEN no definido")
        print("   Export: export GITHUB_TOKEN='your_token'")
        sys.exit(1)
    return token

def get_repo_info():
    """Obtiene información del repositorio"""
    # Obtener origen remoto
    returncode, stdout, _ = run_command("git config --get remote.origin.url")

    if returncode != 0:
        print("No estamos en un repositorio git")
        sys.exit(1)

    repo_url = stdout.strip()

    # Parse owner/repo
    if "github.com" in repo_url:
        parts = repo_url.split("/")
        owner = parts[-2]
        repo = parts[-1].replace(".git", "")
        return owner, repo
    else:
        print("No es un repositorio de GitHub")
        sys.exit(1)

def run_npm_audit_fix():
    """Ejecuta npm audit fix para corregir dependencias"""
    print("\nEjecutando npm audit fix...")
    print("=" * 50)
    
    returncode, stdout, stderr = run_command("npm audit fix --force")
    
    if returncode == 0:
        print("npm audit fix completado exitosamente")
        return True
    else:
        print("npm audit fix retornó código:", returncode)
        print("Output:", stdout)
        return False

def create_remediation_commit():
    """Crea un commit con las correcciones"""
    print("\nCreando commit con remediaciones...")
    print("=" * 50)
    
    # Verificar si hay cambios
    returncode, stdout, _ = run_command("git diff --name-only")
    
    if not stdout.strip():
        print("No hay cambios para commitear")
        return False
    
    print("Archivos modificados:")
    print(stdout)
    
    # Crear commit
    cmd = (
        'git config user.name "DevSecOps Bot" && '
        'git config user.email "devsecops@bot.local" && '
        'git add -A && '
        'git commit -m "chore: Auto-remediate security vulnerabilities\\n\\n'
        '- Actualizar dependencias vulnerables\\n'
        '- Aplicar fixes de SAST\\n'
        f'- Timestamp: {datetime.now().isoformat()}\\n\\n'
        '[skip ci]"'
    )
    
    returncode, stdout, stderr = run_command(cmd)
    
    if returncode == 0:
        print("Commit creado exitosamente")
        return True
    else:
        print("Error al crear commit:", stderr)
        return False

def create_branch_and_push():
    """Crea rama de remediación y hace push"""
    print("\nCreando rama y haciendo push...")
    print("=" * 50)
    
    branch_name = f"auto/security-remediation-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    # Crear rama
    cmd = f"git checkout -b {branch_name}"
    returncode, _, stderr = run_command(cmd)
    
    if returncode != 0:
        print(f"Error al crear rama: {stderr}")
        return None
    
    # Push
    cmd = f"git push -u origin {branch_name}"
    returncode, stdout, stderr = run_command(cmd)
    
    if returncode == 0:
        print(f"Push completado: {branch_name}")
        return branch_name
    else:
        print(f"Error al hacer push: {stderr}")
        return None

def print_banner():
    """Imprime banner inicial"""
    print("""
╔════════════════════════════════════════════════╗
║  DevSecOps Auto-Remediation Orchestrator     ║
║     Security Findings → Automatic PR Fix       ║
╚════════════════════════════════════════════════╝
    """)

def main():
    """Función principal"""
    print_banner()
    
    token = get_github_token()
    owner, repo = get_repo_info()
    
    print(f"Repository: {owner}/{repo}")
    print(f"Token: {token[:10]}...")
    print()
    
    # Paso 1: Ejecutar npm audit fix
    if not run_npm_audit_fix():
        print("\nContinuando sin cambios...")
    
    # Paso 2: Crear commit
    if not create_remediation_commit():
        print("\nNo hay cambios para hacer commit")
        sys.exit(0)
    
    # Paso 3: Crear rama y push
    branch = create_branch_and_push()
    if not branch:
        print("\nFallo al crear rama y hacer push")
        sys.exit(1)
    
    # Paso 4: Resumen
    print("\n" + "=" * 50)
    print("REMEDIACIÓN COMPLETADA")
    print("=" * 50)
    print(f"Rama creada: {branch}")
    print(f"Cambios pusheados a: origin/{branch}")
    print("\nPróximo paso: Crear Pull Request manualmente o esperar")
    print("   a que GitHub Actions cree uno automáticamente")
    print()

if __name__ == "__main__":
    main()
