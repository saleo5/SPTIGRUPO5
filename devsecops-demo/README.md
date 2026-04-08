# DevSecOps Demo - Automatización y Remediación de Vulnerabilidades

[![Security Pipeline](https://github.com/yourusername/devsecops-demo/actions/workflows/security-pipeline.yml/badge.svg)](https://github.com/yourusername/devsecops-demo/actions)

Demo técnica de **automatización y remediación automática de vulnerabilidades** en un ambiente DevSecOps. El sistema detecta fallos de seguridad en tiempo de compilación y los corrige automáticamente.

> **Proyecto:** Trabajo de grado - Escuela Colombiana de Ingeniería Julio Garavito  
> **Estudiante:** Samuel  
> **Tema:** Automatización y Remediación de Fallos de Seguridad en DevSecOps

---

## Arquitectura

```
Developer → GitHub → GitHub Actions → SAST (Semgrep) + SCA (npm audit)
                          ↓
                  Security Findings Aggregator
                          ↓
                  Decision & Orchestration (Step Functions)
                          ↓
                Remediation Engine (Auto-PR + Dependencies Fix)
                          ↓
           GitHub (auto-PR) ← Feedback Loop ← Staging/Production
```

---

## Requisitos Previos

### Software Requerido

```bash
# Node.js 18+
node --version

# npm (viene con Node.js)
npm --version

# Python 3.8+
python3 --version

# Git
git --version

# Semgrep (para SAST)
semgrep --version  # Si no está instalado, ver sección de instalación
```

### Cuentas Necesarias

- ✅ **GitHub Account** (gratuito)
- ✅ **GitHub Personal Token** (gratuito, ver instrucciones abajo)

### Tiempo de Setup

- Instalación de herramientas: **10-15 minutos**
- Configuración GitHub: **5 minutos**
- Setup repo local: **5 minutos**
- **TOTAL: ~30 minutos**

---

## Instalación Paso a Paso

### 1. Instalar Dependencias Locales

**En macOS (con Homebrew):**
```bash
brew install node python semgrep
```

**En Ubuntu/Debian:**
```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs python3 git

# Semgrep
pip install semgrep
```

**En Windows (WSL2 recomendado):**
```bash
# Dentro de WSL2, ejecutar comandos de Ubuntu/Debian arriba
```

**Verificar instalación:**
```bash
node --version    # Debe ser v18+
npm --version     # 9+
python3 --version # 3.8+
semgrep --version # 1.0+
```

---

### 2. Clonar o Crear el Repositorio

**Opción A - Clonar este repo (si ya está en GitHub):**
```bash
git clone https://github.com/saleo5/devsecops-demo.git
cd devsecops-demo
```

**Opción B - Crear repo desde cero:**
```bash
# 1. Crear directorio
mkdir devsecops-demo
cd devsecops-demo

# 2. Inicializar git
git init

# 3. Crear estructura de directorios
mkdir -p src scripts .github/workflows

# 4. Copiar archivos (ver lista completa abajo)
# ... Copiar cada archivo ...

# 5. Crear primer commit
git add .
git commit -m "Initial commit: DevSecOps demo setup"
```

---

### 3. Crear GitHub Personal Token

**En GitHub.com:**

1. Click en tu perfil → **Settings**
2. Ir a **Developer settings** → **Personal access tokens** → **Tokens (classic)**
3. Click **Generate new token (classic)**
4. Llenar:
   - **Note:** `devsecops-demo`
   - **Expiration:** 90 days
   - **Scopes:** Seleccionar:
     - ✅ `repo` (acceso completo a repositorios)
     - ✅ `workflow` (GitHub Actions)

5. Click **Generate token**
6. **COPIAR el token y guardar en lugar seguro** (no volverá a mostrarse)

**Guardar en tu máquina:**
```bash
# En ~/.bash_profile, ~/.zshrc, o tu shell config:
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# O guardar temporalmente en la sesión:
export GITHUB_TOKEN="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
```

---

### 4. Crear Repositorio en GitHub

1. Ir a https://github.com/new
2. Llenar:
   - **Repository name:** `devsecops-demo`
   - **Description:** `Demo of automated security vulnerability remediation in DevSecOps`
   - **Public** (para que se vea en el video)
   - ☑️ **Add a README file**
   - ☑️ **Add .gitignore** → Python

3. Click **Create repository**

4. **Conectar repo local:**
```bash
git remote add origin https://github.com/YOUR_USERNAME/devsecops-demo.git
git branch -M main
git push -u origin main
```

---

### 5. Habilitar GitHub Actions

1. En tu repo de GitHub
2. Click en pestaña **Actions**
3. GitHub debería detectar el workflow automáticamente
4. Si no aparece, click **set up a workflow yourself** y GitHub Actions está habilitado

---

### 6. Instalar Dependencias del Proyecto

```bash
cd devsecops-demo
npm install
```

---

## Estructura de Archivos

Asegúrate de que tengas esta estructura:

```
devsecops-demo/
│
├── .github/
│   └── workflows/
│       └── security-pipeline.yml        ← Workflow de GitHub Actions
│
├── src/
│   ├── app.js                          ← App Express vulnerable (demo)
│   └── utils.js                        ← Utilidades con vulns (demo)
│
├── scripts/
│   ├── run-sast.sh                     ← Ejecuta Semgrep localmente
│   ├── run-sca.sh                      ← Ejecuta npm audit localmente
│   └── auto-remediate.py               ← Orquestador de remediación
│
├── .env.example                        ← Template de variables
├── .gitignore                          ← Excluir archivos sensibles
├── package.json                        ← Dependencias del proyecto
└── README.md                           ← Este archivo
```

---

## Pruebas Locales (Antes de Grabar Video)

### Probar SAST (Semgrep)

```bash
# Hacer script ejecutable
chmod +x scripts/run-sast.sh

# Ejecutar análisis
./scripts/run-sast.sh

# Esperado: Detectar múltiples vulnerabilidades en src/app.js y src/utils.js
```

**Output esperado:**
```
Iniciando análisis SAST con Semgrep...
=========================================
Semgrep encontrado: Semgrep 1.45.0

Analizando código JavaScript...

=========================================
RESULTADOS SAST
=========================================
Hallazgos encontrados: 8
Errores de análisis: 0

VULNERABILIDADES DETECTADAS:
  [javascript.lang.security.audit.hardcoded-secrets] Possible secret stored in plaintext
    Archivo: src/utils.js:4
    Severidad: HIGH
  
  [javascript.lang.security.injection.sql-injection] Potential SQL injection
    Archivo: src/app.js:22
    Severidad: CRITICAL
  ...
```

### Probar SCA (npm audit)

```bash
# Hacer script ejecutable
chmod +x scripts/run-sca.sh

# Ejecutar análisis
./scripts/run-sca.sh

# Esperado: Encontrar vulnerabilidades en dependencias
```

**Output esperado:**
```
Iniciando análisis SCA...
=========================================
npm encontrado: 9.6.7

Analizando dependencias...

=========================================
RESULTADOS SCA (npm audit)
=========================================
Críticas:  0
Altas:     2
Moderadas: 1
Bajas:     0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TOTAL:     3 vulnerabilidades
=========================================
```

---

## Guía del Demo para Grabar Video

### Duración Total: ~8 minutos

---

### Escena 1: Introducción (1 minuto)

**En pantalla:**
- Terminal abierta en el repo
- Mostrar estructura de carpetas

**Narración:**
```
"Hola, voy a demostrar cómo automatizar la detección y remediación
de vulnerabilidades de seguridad en un ambiente DevSecOps.

Tenemos una aplicación Express vulnerable que contiene:
- SQL injection
- Secrets hardcodeados
- Dependencias vulnerables

Vamos a ver cómo GitHub Actions las detecta automáticamente y 
genera PRs con las correcciones."
```

**Acciones:**
```bash
# Mostrar estructura
tree -L 2

# Mostrar el código vulnerable
cat src/app.js | head -40

# Mostrar dependencias
cat package.json
```

---

### Escena 2: Ejecución Local de SAST (2 minutos)

**En pantalla:**
- Terminal ejecutando Semgrep

**Narración:**
```
"Primero, ejecutemos SAST (Static Application Security Testing)
para analizar el código fuente y encontrar vulnerabilidades
sin ejecutar la aplicación."
```

**Acciones:**
```bash
chmod +x scripts/run-sast.sh
./scripts/run-sast.sh

# Debería mostrar:
# - Hallazgos encontrados: 8+
# - Listado de vulnerabilidades
# - Severidades (CRITICAL, HIGH, etc)
```

**Puntos clave a mencionar:**
- Detección de SQL injection en `app.js:22`
- Secrets hardcodeados en `utils.js:4`
- Weak encryption en `utils.js:18`
- Eval vulnerability en `utils.js:25`

---

### Escena 3: Ejecución Local de SCA (1 minuto)

**En pantalla:**
- Terminal ejecutando npm audit

**Narración:**
```
"Ahora ejecutemos SCA (Software Composition Analysis) para 
verificar vulnerabilidades en nuestras dependencias externas."
```

**Acciones:**
```bash
chmod +x scripts/run-sca.sh
./scripts/run-sca.sh

# Debería mostrar:
# - Total: 3 vulnerabilidades
# - Desglose por severidad
# - Paquetes afectados
```

---

### Escena 4: Git Commit y GitHub Actions (2 minutos)

**En pantalla:**
- Terminal + Navegador (GitHub)

**Narración:**
```
"Ahora vamos a hacer un commit de estos cambios vulnerables
a GitHub. Esto va a disparar automáticamente nuestro
workflow de seguridad en GitHub Actions."
```

**Acciones Terminal:**
```bash
git status

git add .

git commit -m "feat: Add new API endpoints with security vulnerabilities"

git push origin main
```

**Acciones Navegador:**
```
1. Abrir GitHub → Tu repo
2. Click en pestaña "Actions"
3. Esperar a que aparezca "DevSecOps Security Pipeline"
4. Click en el workflow para verlo ejecutarse en tiempo real
5. Mostrar los pasos:
   - SAST: Semgrep analysis
   - SCA: npm audit
   - Comentarios en el PR con resultados
```

---

### Escena 5: Ver Resultados del Pipeline (1.5 minutos)

**En pantalla:**
- GitHub Actions UI mostrando el workflow

**Narración:**
```
"El workflow está ejecutando nuestro análisis de seguridad.
Puedes ver:
- Paso a paso de cada análisis
- Logs con detalles de cada vulnerabilidad
- Los reportes se guardan como artifacts"
```

**Acciones:**
```
1. Click en cada paso para ver detalles
2. Ir a "Artifacts" para descargar reportes
3. Mostrar estructura del reporte:
   - audit-report.json (SCA)
   - semgrep.sarif (SAST)
   - security-report.md (resumen)
```

---

### Escena 6: Remediación Automática - Crear PR (1.5 minutos)

**En pantalla:**
- GitHub Action creando PR automático

**Narración:**
```
"Ahora viene la parte automática de remediación.
GitHub Actions va a:
1. Ejecutar npm audit fix para actualizar dependencias
2. Crear automáticamente un Pull Request con los cambios
3. Comentar los resultados en el PR"
```

**Acciones:**
```bash
# En GitHub Actions, esperar a que complete el job "remediation"
# O ejecutar localmente:

chmod +x scripts/auto-remediate.py

python3 scripts/auto-remediate.py
```

**En GitHub:**
```
1. Ir a "Pull Requests"
2. Ver el PR "[AUTO] Security: Auto-fix vulnerabilities"
3. Mostrar cambios en package-lock.json
4. Mostrar commit message automático
5. Mostrar el comentario con resumen de seguridad
```

---

### Escena 7: Verificación del PR (0.5 minutos)

**En pantalla:**
- PR con checks pasando

**Narración:**
```
"El PR tiene todos los checks de seguridad pasados.
Esto significa que:
✅ Las dependencias están actualizadas
✅ Se cumple con los estándares de seguridad
✅ Listo para mergear"
```

**Acciones:**
```
1. Mostrar "Checks passed" en el PR
2. Click en "Files changed" para ver package-lock.json
3. Mostrar que las dependencias vulnerables fueron reemplazadas
```

---

### Escena 8: Merge e Cierre (0.5 minutos)

**En pantalla:**
- PR siendo mergeado

**Narración:**
```
"Finalmente, vamos a mergear este PR. En un ambiente real,
esto dispararía el despliegue a staging y eventualmente producción.

Este ciclo completo de:
Detección → Análisis → Remediación → Merge

Sucede de forma completamente automatizada."
```

**Acciones:**
```bash
# En GitHub:
Click "Merge pull request"

# Opcional: Mostrar en local
git pull origin main
cat package.json | grep -A3 '"dependencies"'
# Debería mostrar versiones actualizadas
```

---

## Checklist para Grabar

Antes de presionar REC:

- [ ] Terminal limpia
- [ ] Zoom/Font size legible (14pt mínimo)
- [ ] Token de GitHub correctamente configurado
- [ ] npm install ejecutado
- [ ] Todos los scripts tienen permisos de ejecución (`chmod +x`)
- [ ] Repo creado en GitHub y sincronizado
- [ ] GitHub Actions habilitado
- [ ] Revisar que `src/app.js` tiene vulnerabilidades visibles
- [ ] Probar que Semgrep detecta vulns
- [ ] Probar que npm audit detecta vulns

---

## Troubleshooting

### Error: "Semgrep not found"

```bash
pip install semgrep
# o
brew install semgrep
```

### Error: "GITHUB_TOKEN not set"

```bash
export GITHUB_TOKEN="ghp_your_token_here"

# Verificar
echo $GITHUB_TOKEN
```

### Error: "npm audit" no encuentra vulnerabilidades

Esto está bien. Los números exactos de vulns cambian según versiones.
Lo importante es que `run-sast.sh` SÍ detecte vulns en el código.

### GitHub Actions no dispara

1. Verificar que `.github/workflows/security-pipeline.yml` existe
2. En GitHub: pestaña Actions → Verificar que está habilitado
3. Hacer un `git push` nuevo para disparar

### El auto-remediation no crea PR

```bash
# Verificar token
git ls-remote https://github.com/$USER/devsecops-demo.git

# Si falla, revalidar token en GitHub
```

---

## Recursos Adicionales

### Documentación

- [Semgrep Docs](https://semgrep.dev/docs)
- [npm audit](https://docs.npmjs.com/cli/v9/commands/npm-audit)
- [GitHub Actions](https://docs.github.com/en/actions)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)

### Para Ampliar el Demo

```bash
# Agregar más análisis:
# 1. DAST (Dynamic testing) - Zaproxy o OWASP ZAP
# 2. Container scanning - Trivy
# 3. Infrastructure as Code - Checkov
# 4. Secrets detection - TruffleHog

# Agregar almacenamiento:
# 1. S3 para logs y reportes
# 2. DynamoDB para metadata
# 3. CloudWatch para monitoreo
```

---

## Notas Importantes

1. **Este código ES INTENCIONALMENTE VULNERABLE** para la demo
2. **NUNCA** usar el código de `src/app.js` en producción
3. Los secrets en este repo son **EJEMPLOS FICTICIOS**
4. La aplicación no se ejecuta (solo análisis)

---

## Autor

**Samuel**  
Escuela Colombiana de Ingeniería Julio Garavito  
Programa de Sistemas Engineering  

---

## Licencia

MIT - Ver LICENSE para detalles

---

## Créditos

- Semgrep por las reglas de seguridad
- OWASP por las mejores prácticas
- GitHub Actions por la orquestación

---

## Soporte

Si tienes problemas:

1. Revisar la sección Troubleshooting arriba
2. Verificar que todas las herramientas están instaladas
3. Confirmar que el token de GitHub es válido
4. Revisar los logs de GitHub Actions

---

**¡Listo para grabar! Suerte con tu demo.**
