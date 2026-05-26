import React from 'react';

export const PricingSettings: React.FC<any> = (props) => {
  const { localPricingConfig, handlePricingChange, handleSavePricing, isPricingSaved, handleAddTimeBand, handleUpdateTimeBand, handleDeleteTimeBand } = props;
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg">Modelo de Cobrança e Preços</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4 p-4 border rounded-lg dark:border-slate-700">
          <h4 className="font-semibold">Cobrança por Hora</h4>
          <select name="chargeModel" value={localPricingConfig.chargeModel} onChange={handlePricingChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600">
            <option value="hourly">Só por Hora</option>
            <option value="bands">Por Faixas de Horário</option>
            <option value="fixed">Diária Fixa (Simples)</option>
          </select>
          {localPricingConfig.chargeModel === 'hourly' && (
            <>
              <div>
                <label className="block text-sm font-medium">Valor Primeira Hora (R$)</label>
                <input type="number" name="firstHourRate" value={localPricingConfig.firstHourRate} onChange={handlePricingChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Valor Horas Adicionais (R$)</label>
                <input type="number" name="additionalHourRate" value={localPricingConfig.additionalHourRate} onChange={handlePricingChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
              </div>
            </>
          )}
          {localPricingConfig.chargeModel === 'bands' && (
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Faixas configuradas</span>
                <button type="button" onClick={handleAddTimeBand} className="py-1 px-3 bg-blue-600 text-white rounded">Adicionar Faixa</button>
              </div>
              <div className="space-y-2">
                {(localPricingConfig.timeBands || []).map((band: any, idx: number) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                    <div className="col-span-5">
                      <label className="block text-sm font-medium">Até (horas)</label>
                      <input type="number" value={band.upToHours} onChange={e => handleUpdateTimeBand(idx, 'upToHours', parseFloat(e.target.value) || 0)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
                    </div>
                    <div className="col-span-5">
                      <label className="block text-sm font-medium">Preço (R$)</label>
                      <input type="number" value={band.price} onChange={e => handleUpdateTimeBand(idx, 'price', parseFloat(e.target.value) || 0)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
                    </div>
                    <div className="col-span-2">
                      <button type="button" onClick={() => handleDeleteTimeBand(idx)} className="w-full py-2 bg-red-600 text-white rounded">Excluir</button>
                    </div>
                  </div>
                ))}
              </div>
              <div>
                <label className="block text-sm font-medium">Hora adicional após última faixa (R$)</label>
                <input type="number" name="afterBandsAdditionalHourRate" value={localPricingConfig.afterBandsAdditionalHourRate} onChange={handlePricingChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
              </div>
              <div>
                <label className="block text-sm font-medium">Aplicar Diária Fixa após (horas)</label>
                <input type="number" name="dailyCapHours" value={localPricingConfig.dailyCapHours || ''} onChange={handlePricingChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
              </div>
            </div>
          )}
          {localPricingConfig.chargeModel === 'fixed' && (
            <div>
              <label className="block text-sm font-medium">Valor Diária (R$)</label>
              <input type="number" name="fixedRate" value={localPricingConfig.fixedRate} onChange={handlePricingChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
            </div>
          )}
        </div>
        <div className="space-y-4 p-4 border rounded-lg dark:border-slate-700">
          <h4 className="font-semibold">Diária e Pernoite</h4>
          <div className="flex items-center gap-2 pb-2">
            <input type="checkbox" id="enableOvernight" name="enableOvernight" checked={localPricingConfig.enableOvernight} onChange={handlePricingChange} className="h-4 w-4 rounded" />
            <label htmlFor="enableOvernight">Habilitar cobrança de Diária/Pernoite</label>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">Início Diária</label>
              <input type="time" name="diariaStartTime" value={localPricingConfig.diariaStartTime} onChange={handlePricingChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Fim Diária</label>
              <input type="time" name="diariaEndTime" value={localPricingConfig.diariaEndTime} onChange={handlePricingChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Início Pernoite</label>
              <input type="time" name="overnightStart" value={localPricingConfig.overnightStart} onChange={handlePricingChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Fim Pernoite</label>
              <input type="time" name="overnightEnd" value={localPricingConfig.overnightEnd} onChange={handlePricingChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Valor Diária (R$)</label>
              <input type="number" name="fixedRate" value={localPricingConfig.fixedRate} onChange={handlePricingChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
            </div>
            <div>
              <label className="block text-sm font-medium">Valor Pernoite (R$)</label>
              <input type="number" name="overnightRate" value={localPricingConfig.overnightRate} onChange={handlePricingChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex justify-end pt-4">
        <button onClick={handleSavePricing} disabled={isPricingSaved} className={isPricingSaved ? 'py-2 px-6 font-semibold rounded bg-green-600 text-white' : 'py-2 px-6 font-semibold rounded bg-blue-600 text-white hover:bg-blue-700'}>
          {isPricingSaved ? 'Salvo!' : 'Salvar Preços'}
        </button>
      </div>

      {/* Assistente de Simulação */}
      <div className="mt-8 p-6 bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
        <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-blue-600">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75V18m-3-3V18m-3-3V18M3 21h18M3 3h18M3 3v18M21 3v18M10.5 7.5h3m-3 3h3m-3 3h3" />
          </svg>
          Assistente de Simulação de Preços
        </h3>
        <p className="text-sm text-slate-500 mb-6">Use este simulador para validar se as configurações acima estão calculando os valores como você deseja.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium">Data/Hora Entrada</label>
            <input type="datetime-local" id="sim-entry" className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
          </div>
          <div>
            <label className="block text-sm font-medium">Data/Hora Saída</label>
            <input type="datetime-local" id="sim-exit" className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
          </div>
          <div className="flex items-end">
            <button
              onClick={() => {
                const entryVal = (document.getElementById('sim-entry') as HTMLInputElement).value;
                const exitVal = (document.getElementById('sim-exit') as HTMLInputElement).value;
                if (!entryVal || !exitVal) {
                  alert('Informe entrada e saída para simular.');
                  return;
                }
                const entry = new Date(entryVal);
                const exit = new Date(exitVal);

                // Copy of the calculation logic for simulation purposes
                const config = localPricingConfig;
                const durationMillis = exit.getTime() - entry.getTime();
                if (durationMillis <= 0) { alert('Saída deve ser após a entrada'); return; }

                const calcHourly = (hours: number) => {
                  if (hours <= 0) return { price: 0, desc: '' };
                  if (config.chargeModel === 'fixed') return { price: config.fixedRate, desc: 'Diária Fixa' };
                  let price = 0; let desc = '';
                  if (config.chargeModel === 'bands' && config.timeBands?.length > 0) {
                    const bands = [...config.timeBands].sort((a, b) => a.upToHours - b.upToHours);
                    let found = false;
                    for (const band of bands) {
                      if (hours <= band.upToHours) { price = band.price; desc = `Até ${band.upToHours}h`; found = true; break; }
                    }
                    if (!found) {
                      const lastBand = bands[bands.length - 1];
                      const addHours = Math.ceil(hours - lastBand.upToHours);
                      price = lastBand.price + (addHours * (config.afterBandsAdditionalHourRate || config.additionalHourRate));
                      desc = `Até ${lastBand.upToHours}h + ${addHours}h Adic.`;
                    }
                  } else {
                    if (hours <= 1) { price = config.firstHourRate; desc = '1ª Hora'; }
                    else { const addHours = Math.ceil(hours - 1); price = config.firstHourRate + (addHours * config.additionalHourRate); desc = `1ª Hora + ${addHours}h Adic.`; }
                  }
                  if (config.dailyCapHours && hours >= config.dailyCapHours) { return { price: config.fixedRate, desc: `Limite ${config.dailyCapHours}h → Diária` }; }
                  return { price, desc };
                };

                let result;
                const totalHours = durationMillis / (1000 * 60 * 60);
                if (!config.enableOvernight || !config.diariaStartTime || !config.diariaEndTime) {
                  result = calcHourly(totalHours);
                } else if (totalHours <= (config.dailyCapHours || 2)) {
                  result = calcHourly(totalHours);
                } else {
                  const [sH, sM] = config.diariaStartTime.split(':').map(Number);
                  const [eH, eM] = config.diariaEndTime.split(':').map(Number);
                  let cur = new Date(entry); let total = 0; let descs = [];
                  while (cur < exit) {
                    const isDiaria = cur.getHours() >= sH && (cur.getHours() < eH || (cur.getHours() === eH && cur.getMinutes() < eM));
                    const pEnd = new Date(cur);
                    if (isDiaria) {
                      pEnd.setHours(eH, eM, 0, 0);
                      if (pEnd <= cur) pEnd.setDate(pEnd.getDate() + 1);
                    } else {
                      if (cur.getHours() >= eH) pEnd.setDate(pEnd.getDate() + 1);
                      pEnd.setHours(sH, sM, 0, 0);
                      if (pEnd <= cur) pEnd.setDate(pEnd.getDate() + 1);
                    }
                    const effEnd = exit < pEnd ? exit : pEnd;
                    const dur = (effEnd.getTime() - cur.getTime()) / (1000 * 60 * 60);
                    if (dur > 0.01) {
                      if (isDiaria) {
                        total += config.fixedRate; descs.push("1 Diária");
                      } else {
                        total += config.overnightRate; descs.push("1 Pernoite");
                      }
                    }
                    cur = effEnd;
                  }
                  // Simplify descriptions
                  const simplified = descs.reduce((acc: any, d) => { acc[d] = (acc[d] || 0) + 1; return acc; }, {});
                  const descStr = Object.entries(simplified).map(([m, c]) => (c as number) > 1 ? `${c}x ${m}` : m).join(' + ');
                  result = { price: total, desc: descStr };
                }

                const display = document.getElementById('sim-result');
                if (display) {
                  display.innerHTML = `
                                <div class="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-inner animate-in fade-in zoom-in duration-300">
                                    <p class="text-sm text-slate-500">Resultado da Simulação:</p>
                                    <p class="text-3xl font-bold text-blue-600">${result.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                                    <p class="text-xs text-slate-400 mt-1">${result.desc}</p>
                                </div>
                            `;
                }
              }}
              className="w-full py-2 bg-indigo-600 text-white font-semibold rounded hover:bg-indigo-700 transition-colors"
            >
              Simular Valor
            </button>
          </div>
        </div>

        <div id="sim-result">
          <div className="p-4 bg-slate-100 dark:bg-slate-800/30 rounded-lg text-center text-slate-400 italic text-sm">
            Os resultados aparecerão aqui após clicar em "Simular Valor".
          </div>
        </div>
      </div>
    </div>
  );
};

