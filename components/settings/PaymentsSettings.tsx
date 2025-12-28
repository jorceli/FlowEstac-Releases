import React from 'react';

export const PaymentsSettings: React.FC<any> = (props) => {
  const { data, setEditingPaymentMethod, handleDeletePaymentMethod, handleSetDefaultPaymentMethod, newPaymentMethod, setNewPaymentMethod, handleAddPaymentMethod } = props;
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Formas de Pagamento</h3>
      <ul className="space-y-2">
        {data.paymentMethods.map((p: any) => (
          <li key={p.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700/50 rounded">
            <span>{p.name}</span>
            <div className="flex items-center gap-4">
              <button onClick={() => handleSetDefaultPaymentMethod(p.id)} className={`text-xs px-2 py-1 rounded ${p.isDefault ? 'bg-green-500 text-white' : 'bg-slate-300 dark:bg-slate-600'}`}>{p.isDefault ? 'Padrão' : 'Definir Padrão'}</button>
              <div className="flex gap-2">
                <button onClick={() => setEditingPaymentMethod(p)} className="text-blue-500 hover:text-blue-700">Editar</button>
                <button onClick={() => handleDeletePaymentMethod(p.id)} disabled={p.isDefault} className="text-red-500 hover:text-red-700 disabled:text-slate-400 disabled:cursor-not-allowed">Excluir</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input type="text" value={newPaymentMethod} onChange={e => setNewPaymentMethod(e.target.value)} placeholder="Nova forma de pagamento" className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600" />
        <button onClick={handleAddPaymentMethod} className="py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Adicionar</button>
      </div>
    </div>
  );
};

