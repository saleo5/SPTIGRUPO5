#!/bin/bash

# scripts/run-sast.sh - Ejecuta análisis SAST con Semgrep

echo "Iniciando análisis SAST con Semgrep..."
echo "==========================================="
echo ""

# Verificar si Semgrep está instalado
if ! command -v semgrep &> /dev/null; then
    echo "Semgrep no está instalado."
    echo ""
    echo "Instálalo con:"
    echo "  pip install semgrep"
    echo "  o"
    echo "  brew install semgrep"
    exit 1
fi

echo "Semgrep encontrado: $(semgrep --version)"
echo ""

# Ejecutar Semgrep con configuración básica de seguridad
echo "Analizando código JavaScript..."
echo ""

semgrep \
  --config p/security-audit \
  --config p/owasp-top-ten \
  --json \
  src/ \
  > /tmp/semgrep-results.json

# Parse y mostrar resultados
FINDINGS=$(jq '.results | length' /tmp/semgrep-results.json)
ERRORS=$(jq '.errors | length' /tmp/semgrep-results.json)

echo "==========================================="
echo "RESULTADOS SAST"
echo "==========================================="
echo "Hallazgos encontrados: $FINDINGS"
echo "Errores de análisis: $ERRORS"
echo ""

# Mostrar detalles de cada vulnerabilidad
if [ "$FINDINGS" -gt 0 ]; then
    echo "VULNERABILIDADES DETECTADAS:"
    echo ""
    jq -r '.results[] | "  [\(.rule_id)] \(.message)\n    Archivo: \(.path):\(.start.line)\n    Severidad: \(.extra.severity)"' /tmp/semgrep-results.json
    echo ""
else
    echo "✅ No se encontraron vulnerabilidades"
fi

echo "==========================================="
echo "📄 Reporte completo guardado en: /tmp/semgrep-results.json"
echo ""

exit 0
