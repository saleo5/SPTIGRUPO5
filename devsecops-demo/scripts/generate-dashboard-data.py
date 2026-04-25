#!/usr/bin/env python3
"""
Genera dashboard/data.json a partir de los resultados de SAST y SCA.
Se ejecuta en GitHub Actions después de semgrep y npm audit.
"""
import json
import os
from datetime import datetime, timezone


def load_json(path):
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Warning: no se pudo leer {path}: {e}")
        return {}


def sarif_severity(level):
    return {'error': 'critical', 'warning': 'high', 'note': 'medium'}.get(level, 'low')


# ── SAST (semgrep.sarif) ──────────────────────────────────────────────────────
sarif = load_json('semgrep.sarif')
raw_results = []
try:
    raw_results = sarif['runs'][0]['results']
except (KeyError, IndexError):
    pass

sast_findings = []
for r in raw_results:
    loc = r.get('locations', [{}])[0].get('physicalLocation', {})
    sast_findings.append({
        'severity': sarif_severity(r.get('level', 'note')),
        'rule':     r.get('ruleId', ''),
        'message':  r.get('message', {}).get('text', '')[:150],
        'file':     loc.get('artifactLocation', {}).get('uri', ''),
        'line':     loc.get('region', {}).get('startLine', 0),
    })

sast_critical = sum(1 for f in sast_findings if f['severity'] == 'critical')
sast_high     = sum(1 for f in sast_findings if f['severity'] == 'high')
sast_medium   = sum(1 for f in sast_findings if f['severity'] == 'medium')
sast_low      = sum(1 for f in sast_findings if f['severity'] == 'low')

# ── SCA (audit-report.json) ───────────────────────────────────────────────────
audit     = load_json('audit-report.json')
vuln_meta = audit.get('metadata', {}).get('vulnerabilities', {})

sca_critical = vuln_meta.get('critical', 0)
sca_high     = vuln_meta.get('high', 0)
sca_moderate = vuln_meta.get('moderate', 0)
sca_low      = vuln_meta.get('low', 0)
sca_total    = vuln_meta.get('total', 0)

sca_findings = []
for pkg, data in audit.get('vulnerabilities', {}).items():
    for via in data.get('via', []):
        if isinstance(via, dict):
            fix = data.get('fixAvailable', {})
            sca_findings.append({
                'package':        pkg,
                'version':        str(data.get('range', '')),
                'title':          via.get('title', ''),
                'severity':       via.get('severity', ''),
                'recommendation': fix.get('version', '') if isinstance(fix, dict) else '',
            })

# ── Generar output ────────────────────────────────────────────────────────────
repo      = os.environ.get('GITHUB_REPOSITORY', '')
run_id    = os.environ.get('GITHUB_RUN_ID', '')
sha       = os.environ.get('GITHUB_SHA', 'local')

output = {
    'generated_at': datetime.now(timezone.utc).isoformat(),
    'commit':       sha[:8],
    'run_url':      f'https://github.com/{repo}/actions/runs/{run_id}',
    'summary': {
        'total':    len(sast_findings) + sca_total,
        'critical': sast_critical + sca_critical,
        'high':     sast_high + sca_high,
        'medium':   sast_medium + sca_moderate,
        'low':      sast_low + sca_low,
    },
    'sast': {
        'total':    len(sast_findings),
        'critical': sast_critical,
        'high':     sast_high,
        'medium':   sast_medium,
        'low':      sast_low,
        'findings': sast_findings,
    },
    'sca': {
        'total':    sca_total,
        'critical': sca_critical,
        'high':     sca_high,
        'moderate': sca_moderate,
        'low':      sca_low,
        'findings': sca_findings,
    },
}

out_path = 'dashboard/data.json'
os.makedirs(os.path.dirname(out_path), exist_ok=True)
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, indent=2, ensure_ascii=False)

print(f"✅ {out_path} generado — {output['summary']['total']} vulnerabilidades totales")
print(f"   SAST: {output['sast']['total']} · SCA: {output['sca']['total']}")
