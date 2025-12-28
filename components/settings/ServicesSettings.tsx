import React from 'react';

export const ServicesSettings: React.FC<any> = (props) => {
  const { data, setEditingService, newServiceName, setNewServiceName, newServicePrice, setNewServicePrice, handleAddService, handleDeleteService } = props;
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Serviços Adicionais</h3>
      <ul className="space-y-2">
        {data.services.map((s: any) => (
          <li key={s.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700/50 rounded">
            <span>{s.name} - {s.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
            <div className="flex gap-2">
              <button onClick={() => setEditingService(s)} className="text-blue-500 hover:text-blue-700">Editar</button>
              <button onClick={() => handleDeleteService(s.id)} className="text-red-500 hover:text-red-700">Excluir</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="flex gap-2">
        <input type="text" value={newServiceName} onChange={e => setNewServiceName(e.target.value)} placeholder="Nome do serviço" className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600" />
        <input type="number" value={newServicePrice} onChange={e => setNewServicePrice(parseFloat(e.target.value) || '')} placeholder="Preço" className="p-2 w-40 border rounded dark:bg-slate-700 dark:border-slate-600" />
        <button onClick={handleAddService} className="py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Adicionar</button>
      </div>
    </div>
  );
};

