#!/bin/bash

# scripts/run-sca.sh - Ejecuta análisis SCA (dependencias) con npm audit

echo "Iniciando análisis SCA (Software Composition Analysis)..."
echo "==========================================="
echo ""

# Verificar si npm está disponible
if ! command -v npm &> /dev/null; then
    echo "npm no está instalado."
    exit 1
fi

echo "npm encontrado: $(npm --version)"
echo ""

# Ejecutar npm audit
echo "Analizando dependencias..."
echo ""

npm audit --production --json > /tmp/npm-audit-results.json 2>&1

# Parse y mostrar resultados
TOTAL_VULNS=$(jq '.metadata.vulnerabilities.total' /tmp/npm-audit-results.json)
CRITICAL=$(jq '.metadata.vulnerabilities.critical // 0' /tmp/npm-audit-results.json)
HIGH=$(jq '.metadata.vulnerabilities.high // 0' /tmp/npm-audit-results.json)
MODERATE=$(jq '.metadata.vulnerabilities.moderate // 0' /tmp/npm-audit-results.json)
LOW=$(jq '.metadata.vulnerabilities.low // 0' /tmp/npm-audit-results.json)

echo "==========================================="
echo "RESULTADOS SCA (npm audit)"
echo "==========================================="
echo "Críticas:  $CRITICAL"
echo "Altas:     $HIGH"
echo "Moderadas: $MODERATE"
echo "Bajas:     $LOW"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TOTAL:     $TOTAL_VULNS vulnerabilidades"
echo "==========================================="
echo ""

# Mostrar detalles si hay vulnerabilidades
if [ "$TOTAL_VULNS" -gt 0 ]; then
    echo "VULNERABILIDADES DE DEPENDENCIAS:"
    echo ""
    jq -r '.vulnerabilities | to_entries[] | "  Paquete: \(.key)\n     Tipo: \(.value.via[0].title)\n     Versión afectada: \(.value.via[0].range)\n     Fix disponible: \(.value.via[0].recommendation)\n"' /tmp/npm-audit-results.json 2>/dev/null || echo "Ver detalles en el JSON"
    echo ""
    echo "Para auto-corregir: npm audit fix"
    echo ""
else
    echo "✅ No se encontraron vulnerabilidades en dependencias"
fi

echo "==========================================="
echo "📄 Reporte completo guardado en: /tmp/npm-audit-results.json"
echo ""

# Exit code basado en vulnerabilidades encontradas
if [ "$TOTAL_VULNS" -gt 0 ]; then
    exit 1
else
    exit 0
fi
