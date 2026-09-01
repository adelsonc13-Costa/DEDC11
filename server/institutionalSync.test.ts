import { describe, expect, it } from "vitest";
import { classify, classifyCareerStatus, extractEvent, INSTITUTIONAL_SOURCES } from "./institutionalSync";

describe("institutional sync classifier", () => {
  it("classifies incentive, health and study publications", () => {
    expect(classify("Conceder incentivo à Produção Científica — Adicional de Titulação")).toContain("incentivo");
    expect(classify("Licença para tratamento de saúde homologar atestado")).toContain("saude");
    expect(classify("Afastamento para estudo de Doutorado")).toContain("estudo");
  });

  it("extracts structured fields from a health publication", () => {
    const event = extractEvent("Licença Médica concedida por Portaria nº 1234 de 20/08/2026 pelo prazo de 15 dias", "saude");
    expect(event.portaria).toBe("1234");
    expect(event.publicationDate).toBe("20/08/2026");
    expect(event.days).toBe("15");
    expect(event.endDate).toBe("2026-09-04");
  });

  it("configures the four PGDP public sources", () => {
    expect(INSTITUTIONAL_SOURCES.filter(source => source.key.startsWith("pgdp-")).map(source => source.url)).toEqual([
      "https://pgdp.uneb.br/promocao-docente-2/",
      "https://pgdp.uneb.br/promocao-tecnico/",
      "https://pgdp.uneb.br/progressao-docente/",
      "https://pgdp.uneb.br/progressao-tecnico/",
    ]);
    expect(classify("Portaria de Progressão e Promoção funcional")).toContain("carreira");
  });

  it("filters career results by positive and negative status", () => {
    expect(classifyCareerStatus("Promoção concedida — servidor contemplado")).toBe("confirmed");
    expect(classifyCareerStatus("Processo indeferido por falta de documentação")).toBe("negative");
    expect(classifyCareerStatus("Processo em análise")).toBe("pending");
  });

  it("extracts incentive percentage and SEI identifier", () => {
    const event = extractEvent("Conceder incentivo de 20% — Portaria nº 8888 — SEI 074.6902.2024.0084196-76", "incentivo");
    expect(event.percentage).toBe("20");
    expect(event.portaria).toBe("8888");
    expect(event.sei).toBe("074.6902.2024.0084196-76");
  });
});
