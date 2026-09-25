import { useMemo, useState } from "react";
import { Layout } from "../components/Layout";
import { brl } from "../lib/format";

function num(v: string) {
  return Number(v.replace(",", ".")) || 0;
}

export function Precificacao() {
  const [custoCompra, setCustoCompra] = useState("0");
  const [frete, setFrete] = useState("0");
  const [embalagem, setEmbalagem] = useState("0");
  const [outros, setOutros] = useState("0");
  const [taxaCartao, setTaxaCartao] = useState("4.99");
  const [imposto, setImposto] = useState("0");
  const [marketing, setMarketing] = useState("0");
  const [margem, setMargem] = useState("60");
  const [precoTeste, setPrecoTeste] = useState("");

  const result = useMemo(() => {
    const custoTotal =
      num(custoCompra) + num(frete) + num(embalagem) + num(outros);
    const taxasPercent = num(taxaCartao) + num(imposto) + num(marketing);
    const margemPercent = num(margem);

    // preço = custoTotal / (1 - (taxas% + margem%)/100)
    const divisor = 1 - (taxasPercent + margemPercent) / 100;
    const precoSugerido = divisor > 0 ? custoTotal / divisor : 0;

    const precoAnalisado = precoTeste.trim() !== "" ? num(precoTeste) : precoSugerido;
    const taxasValor = precoAnalisado * (taxasPercent / 100);
    const lucroLiquido = precoAnalisado - custoTotal - taxasValor;
    const margemLiquida =
      precoAnalisado > 0 ? (lucroLiquido / precoAnalisado) * 100 : 0;

    return {
      custoTotal,
      precoSugerido,
      precoAnalisado,
      taxasValor,
      lucroLiquido,
      margemLiquida,
      markup: custoTotal > 0 ? precoSugerido / custoTotal : 0,
    };
  }, [custoCompra, frete, embalagem, outros, taxaCartao, imposto, marketing, margem, precoTeste]);

  function cenario(pctMargem: number) {
    const custoTotal = num(custoCompra) + num(frete) + num(embalagem) + num(outros);
    const taxasPercent = num(taxaCartao) + num(imposto) + num(marketing);
    const divisor = 1 - (taxasPercent + pctMargem) / 100;
    return divisor > 0 ? custoTotal / divisor : 0;
  }

  return (
    <Layout
      title="Calculadora de precificação"
      subtitle="Para revenda: custo de compra no atacado + taxas + margem desejada"
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div className="surface" style={{ padding: 24 }}>
          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, marginBottom: 16 }}>
            Custos da peça
          </h2>
          <div className="field-row">
            <div>
              <label className="label">Custo de compra (atacado)</label>
              <input className="input" value={custoCompra} onChange={(e) => setCustoCompra(e.target.value)} />
            </div>
            <div>
              <label className="label">Frete / deslocamento</label>
              <input className="input" value={frete} onChange={(e) => setFrete(e.target.value)} />
            </div>
          </div>
          <div className="field-row" style={{ marginTop: 16 }}>
            <div>
              <label className="label">Embalagem / etiqueta</label>
              <input className="input" value={embalagem} onChange={(e) => setEmbalagem(e.target.value)} />
            </div>
            <div>
              <label className="label">Outros custos</label>
              <input className="input" value={outros} onChange={(e) => setOutros(e.target.value)} />
            </div>
          </div>

          <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, margin: "24px 0 16px" }}>
            Taxas e margem
          </h2>
          <div className="field-row">
            <div>
              <label className="label">Taxa de cartão / gateway (%)</label>
              <input className="input" value={taxaCartao} onChange={(e) => setTaxaCartao(e.target.value)} />
            </div>
            <div>
              <label className="label">Imposto sobre venda (%)</label>
              <input className="input" value={imposto} onChange={(e) => setImposto(e.target.value)} />
            </div>
          </div>
          <div className="field-row" style={{ marginTop: 16 }}>
            <div>
              <label className="label">Marketing / anúncios (%)</label>
              <input className="input" value={marketing} onChange={(e) => setMarketing(e.target.value)} />
            </div>
            <div>
              <label className="label">Margem de lucro desejada (%)</label>
              <input className="input" value={margem} onChange={(e) => setMargem(e.target.value)} />
            </div>
          </div>
          <div style={{ marginTop: 16 }}>
            <label className="label">Testar um preço específico (opcional)</label>
            <input
              className="input"
              value={precoTeste}
              onChange={(e) => setPrecoTeste(e.target.value)}
              placeholder="Ex.: 189,90"
            />
          </div>
        </div>

        <div>
          <div
            className="surface"
            style={{ padding: 24, borderColor: "rgba(226,56,46,0.4)", marginBottom: 16 }}
          >
            <p className="stat-label">Preço de venda sugerido</p>
            <p className="stat-value text-primary" style={{ fontSize: 34 }}>
              {brl(result.precoSugerido)}
            </p>
            <p className="product-meta">
              Markup de {result.markup.toFixed(2)}x sobre o custo total.
            </p>
          </div>

          <div className="surface" style={{ padding: 24, marginBottom: 16 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, marginBottom: 12 }}>
              Quebra do preço
            </h2>
            <Row label="Preço analisado" value={brl(result.precoAnalisado)} />
            <Row label="Custo total da peça" value={brl(result.custoTotal)} />
            <Row label="Taxas sobre a venda" value={brl(result.taxasValor)} />
            <Row label="Lucro líquido" value={brl(result.lucroLiquido)} />
            <Row label="Margem líquida" value={`${result.margemLiquida.toFixed(0)}%`} />
            {result.lucroLiquido < 0 && (
              <div
                className="error-text"
                style={{
                  marginTop: 12,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 10,
                  padding: 10,
                }}
              >
                Nesse preço a peça sai no prejuízo. Aumente o preço ou reduza custos.
              </div>
            )}
          </div>

          <div className="surface" style={{ padding: 24 }}>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: 18, marginBottom: 12 }}>
              Cenários rápidos
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
              {[40, 60, 80].map((m) => (
                <div key={m} className="surface" style={{ padding: 14, textAlign: "center" }}>
                  <p className="stat-label">{m}% margem</p>
                  <p style={{ fontFamily: "Georgia, serif", fontSize: 18, marginTop: 6 }}>
                    {brl(cenario(m))}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "8px 0",
        borderBottom: "1px solid var(--border)",
        fontSize: 14,
      }}
    >
      <span style={{ color: "var(--muted)" }}>{label}</span>
      <span style={{ fontWeight: 600 }}>{value}</span>
    </div>
  );
}
