import React from 'react';

export const AgreementsSettings: React.FC<any> = (props) => {
  const { data, setEditingAgreement, handleDeleteAgreement, newAgreementName, setNewAgreementName, newAgreementDiscountType, setNewAgreementDiscountType, newAgreementDiscountValue, setNewAgreementDiscountValue, newAgreementPlates, setNewAgreementPlates, handleAddAgreement } = props;
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Convênios</h3>
      <ul className="space-y-2">
        {data.agreements.map((a: any) => (
          <li key={a.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700/50 rounded">
            <span>{a.name}</span>
            <div className="flex gap-2">
              <button onClick={() => setEditingAgreement(a)} className="text-blue-500 hover:text-blue-700">Editar</button>
              <button onClick={() => handleDeleteAgreement(a.id)} className="text-red-500 hover:text-red-700">Excluir</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="p-4 border rounded-lg dark:border-slate-700 space-y-3">
        <h4 className="font-semibold">Novo Convênio</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" value={newAgreementName} onChange={e => setNewAgreementName(e.target.value)} placeholder="Nome do Convênio" className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600" />
          <div className="flex gap-2">
            <select value={newAgreementDiscountType} onChange={e => setNewAgreementDiscountType(e.target.value as any)} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
              <option value="percentage">Percentual</option>
              <option value="fixed">Valor Fixo</option>
            </select>
            <input type="number" value={newAgreementDiscountValue} onChange={e => setNewAgreementDiscountValue(parseFloat(e.target.value) || '')} placeholder="Valor" className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600" />
          </div>
        </div>
        <div>
          <input type="text" value={newAgreementPlates} onChange={e => setNewAgreementPlates(e.target.value)} placeholder="Placas associadas (separadas por vírgula)" className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600" />
        </div>
        <div className="flex justify-end">
          <button onClick={handleAddAgreement} className="py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Adicionar Convênio</button>
        </div>
      </div>
    </div>
  );
};

