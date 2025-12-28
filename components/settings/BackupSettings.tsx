import React from 'react';

export const BackupSettings: React.FC<any> = (props) => {
  const { handleBackup, fileInputRef, handleRestore } = props;
  return (
    <div className="space-y-6">
      <h3 className="font-bold text-lg">Backup e Restauração</h3>
      <p className="text-sm text-slate-500">Faça backups regulares para proteger seus dados.</p>
      <div className="flex flex-col md:flex-row gap-4">
        <button onClick={handleBackup} className="w-full md:w-auto flex-1 py-3 px-6 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Fazer Backup</button>
        <button onClick={() => fileInputRef.current?.click()} className="w-full md:w-auto flex-1 py-3 px-6 bg-green-600 text-white font-semibold rounded hover:bg-green-700">Restaurar Backup</button>
        <input type="file" ref={fileInputRef} onChange={handleRestore} accept=".json" className="hidden" />
      </div>
      <p className="text-xs text-red-500"><strong>Atenção:</strong> Restaurar um backup substituirá TODOS os dados atuais de forma irreversível.</p>
    </div>
  );
};

