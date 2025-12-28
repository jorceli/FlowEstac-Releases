import React from 'react';

export const CouponsSettings: React.FC<any> = (props) => {
  const { data, setEditingCoupon, handleDeleteCoupon, handleToggleCouponStatus, newCouponCode, setNewCouponCode, newCouponDiscount, setNewCouponDiscount, newCouponValidUntil, setNewCouponValidUntil, handleAddCoupon } = props;
  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg">Cupons de Desconto</h3>
      <ul className="space-y-2">
        {data.coupons.map((c: any) => (
          <li key={c.id} className="flex justify-between items-center p-2 bg-slate-100 dark:bg-slate-700/50 rounded">
            <div>
              <span>{c.code} - {c.discountPercentage}%</span>
              <span className="text-xs text-slate-500 ml-2">(Válido até: {c.validUntil ? new Date(c.validUntil).toLocaleDateString('pt-BR') : 'Indefinido'})</span>
            </div>
            <div className="flex items-center gap-4">
              <button onClick={() => handleToggleCouponStatus(c.id)} className={`text-xs px-2 py-1 rounded ${c.isActive ? 'bg-green-500 text-white' : 'bg-slate-300 dark:bg-slate-600'}`}>{c.isActive ? 'Ativo' : 'Inativo'}</button>
              <div className="flex gap-2">
                <button onClick={() => setEditingCoupon(c)} className="text-blue-500 hover:text-blue-700">Editar</button>
                <button onClick={() => handleDeleteCoupon(c.id)} className="text-red-500 hover:text-red-700">Excluir</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <div className="p-4 border rounded-lg dark:border-slate-700 space-y-3">
        <h4 className="font-semibold">Novo Cupom</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <input type="text" value={newCouponCode} onChange={e => setNewCouponCode(e.target.value)} placeholder="Código do Cupom" className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600" />
          <input type="number" value={newCouponDiscount} onChange={e => setNewCouponDiscount(parseFloat(e.target.value) || '')} placeholder="Desconto (%)" className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600" />
          <input type="date" value={newCouponValidUntil} onChange={e => setNewCouponValidUntil(e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600" />
        </div>
        <div className="flex justify-end"><button onClick={handleAddCoupon} className="py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Adicionar Cupom</button></div>
      </div>
    </div>
  );
};

