import React, { useEffect, useState } from 'react';

export const PrintingSettings: React.FC<any> = (props) => {
  const { localPrinterConfig, setLocalPrinterConfig, printerPresets, handlePrinterProfileChange, handlePrinterWidthChange, handleSavePrinterConfig, isPrinterConfigSaved, localCouponConfig, handleCouponConfigChange } = props;
  const [systemPrinters, setSystemPrinters] = useState<any[]>([]);

  useEffect(() => {
    const fetchPrinters = async () => {
      if (window.electronAPI && window.electronAPI.getPrinters) {
        try {
          const printers = await window.electronAPI.getPrinters();
          setSystemPrinters(printers);
        } catch (err) {
          console.error("Failed to fetch printers", err);
        }
      }
    };
    fetchPrinters();
  }, []);

  const handleSystemPrinterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLocalPrinterConfig((prev: any) => ({ ...prev, printerName: e.target.value }));
  };

  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg">Impressão de Cupons</h3>
      <div className="p-4 border rounded-lg dark:border-slate-700 space-y-4">
        <h4 className="font-semibold">Configuração da Impressora</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Impressora do Sistema (Física)</label>
            <select value={localPrinterConfig.printerName || ''} onChange={handleSystemPrinterChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1">
              <option value="">-- Selecione a Impressora --</option>
              {systemPrinters.map((p: any) => (
                <option key={p.name} value={p.name}>{p.name}</option>
              ))}
            </select>
            <p className="text-xs text-slate-500 mt-1">Selecione para impressão direta (Silenciosa).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Perfil de Largura (Preset)</label>
            <select value={localPrinterConfig.profile} onChange={handlePrinterProfileChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1">
              {Object.entries(printerPresets).map(([key, preset]: any) => (
                <option key={key} value={key}>{preset.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Largura de Impressão (pixels)</label>
            <input type="number" value={localPrinterConfig.printWidth} onChange={handlePrinterWidthChange} disabled={localPrinterConfig.profile !== 'custom'} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1 disabled:bg-slate-200" />
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button onClick={handleSavePrinterConfig} disabled={isPrinterConfigSaved} className={isPrinterConfigSaved ? 'py-2 px-6 font-semibold rounded bg-green-600 text-white' : 'py-2 px-6 font-semibold rounded bg-blue-600 text-white hover:bg-blue-700'}>{isPrinterConfigSaved ? 'Salvo!' : 'Salvar Impressora'}</button>
        </div>
      </div>
      <div className="p-4 border rounded-lg dark:border-slate-700 space-y-4">
        <h4 className="font-semibold">Conteúdo e Layout</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Cabeçalho</label>
            <textarea name="headerMessage" value={localCouponConfig.headerMessage} onChange={handleCouponConfigChange} rows={3} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1 font-mono text-xs"></textarea>
          </div>
          <div>
            <label className="block text-sm font-medium">Rodapé</label>
            <textarea name="footerMessage" value={localCouponConfig.footerMessage} onChange={handleCouponConfigChange} rows={3} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1 font-mono text-xs"></textarea>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2"><input type="checkbox" id="highlightPlate" name="highlightPlate" checked={!!localCouponConfig.highlightPlate} onChange={handleCouponConfigChange} className="h-4 w-4 rounded" /><label htmlFor="highlightPlate">Destacar Placa no Cupom</label></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="printCouponNumberInFooter" name="printCouponNumberInFooter" checked={!!localCouponConfig.printCouponNumberInFooter} onChange={handleCouponConfigChange} className="h-4 w-4 rounded" /><label htmlFor="printCouponNumberInFooter">Mostrar Número do Cupom no Rodapé</label></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="printBarcode" name="printBarcode" checked={!!localCouponConfig.printBarcode} onChange={handleCouponConfigChange} className="h-4 w-4 rounded" /><label htmlFor="printBarcode">Imprimir Código de Barras</label></div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2"><input type="checkbox" id="showSummary" name="showSummary" checked={!!localCouponConfig.showSummary} onChange={handleCouponConfigChange} className="h-4 w-4 rounded" /><label htmlFor="showSummary">Mostrar Resumo de Valores</label></div>
            <div className="flex items-center gap-2"><input type="checkbox" id="showOverdueMonthly" name="showOverdueMonthly" checked={!!localCouponConfig.showOverdueMonthly} onChange={handleCouponConfigChange} className="h-4 w-4 rounded" /><label htmlFor="showOverdueMonthly">Alertar Mensalista em Atraso</label></div>
          </div>
        </div>
        <div className="flex justify-end pt-4">
          <button onClick={props.handleSaveCouponConfig} disabled={props.isCouponConfigSaved} className={props.isCouponConfigSaved ? 'py-2 px-6 font-semibold rounded bg-green-600 text-white' : 'py-2 px-6 font-semibold rounded bg-blue-600 text-white hover:bg-blue-700'}>{props.isCouponConfigSaved ? 'Salvo!' : 'Salvar Layout'}</button>
        </div>
      </div>
    </div>
  );
};
