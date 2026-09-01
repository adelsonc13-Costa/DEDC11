import requests
from urllib.parse import urlencode

BASE = "https://dool.egba.ba.gov.br/buscanova/"
queries = [
    {"q": "92118841", "de": "01/01/2024", "ate": "31/12/2026"},
    {"busca": "92118841", "data_inicio": "01/01/2024", "data_fim": "31/12/2026"},
    {"termo": "92118841", "ano_inicio": "2024", "ano_fim": "2026"},
    {"search": "92118841", "startDate": "2024-01-01", "endDate": "2026-12-31"},
]
for params in queries:
    url = BASE + "?" + urlencode(params)
    try:
        response = requests.get(url, timeout=30, headers={"User-Agent": "DEDC-XI-Vida-Funcional/1.0 (consulta institucional somente leitura)"}, verify=False, allow_redirects=True)
        text = " ".join(response.text.split())
        print({"params": params, "status": response.status_code, "final_url": response.url, "length": len(response.text), "snippet": text[:400]})
    except Exception as exc:
        print({"params": params, "status": 0, "error": repr(exc)})
