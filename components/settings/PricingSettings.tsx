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
    </div>
  );
};

