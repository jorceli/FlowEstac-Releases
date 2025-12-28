import React from 'react';

export const GeneralSettings: React.FC<any> = (props) => {
  const {
    data,
    cancellationPassword,
    setCancellationPassword,
    discountPassword,
    setDiscountPassword,
    parkingLimit,
    setParkingLimit,
    newCancellationReason,
    setNewCancellationReason,
    handleDeleteCancellationReason,
    handleAddCancellationReason,
    handleSaveGeneralSettings,
    isGeneralSaved,
  } = props;

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Geral</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Senha para Cancelamentos</label>
          <input type="password" value={cancellationPassword} onChange={e => setCancellationPassword(e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Senha para Descontos</label>
          <input type="password" value={discountPassword} onChange={e => setDiscountPassword(e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
        </div>
        <div>
          <label className="block text-sm font-medium">Lotação Máxima do Pátio</label>
          <input type="number" value={parkingLimit} onChange={e => setParkingLimit(parseInt(e.target.value, 10) || 0)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" />
        </div>
      </div>
      <h3 className="font-bold text-lg pt-4 border-t dark:border-slate-700">Motivos de Cancelamento</h3>
      <ul className="space-y-2">
        {data.cancellationReasons.map((r: any) => (
          <li key={r.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700/50 rounded">
            <span>{r.reason}</span>
            <button onClick={() => handleDeleteCancellationReason(r.id)} className="text-red-500 hover:text-red-700">Excluir</button>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input type="text" value={newCancellationReason} onChange={e => setNewCancellationReason(e.target.value)} placeholder="Novo motivo..." className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600" />
        <button onClick={handleAddCancellationReason} className="py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Adicionar</button>
      </div>
      <div className="flex justify-end pt-4">
        <button onClick={handleSaveGeneralSettings} disabled={isGeneralSaved} className={isGeneralSaved ? 'py-2 px-6 font-semibold rounded bg-green-600 text-white' : 'py-2 px-6 font-semibold rounded bg-blue-600 text-white hover:bg-blue-700'}>
          {isGeneralSaved ? 'Salvo!' : 'Salvar Geral'}
        </button>
      </div>
    </div>
  );
};
