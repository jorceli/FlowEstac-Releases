
import React, { useState, useMemo, useEffect, createContext, useContext, ReactNode, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GeneralSettings, PricingSettings, ServicesSettings, PaymentsSettings, AgreementsSettings, CouponsSettings, PrintingSettings, BackupSettings, NfseSettings, ModulesSettings } from './components/settings';

import ptStrings from './src/i18n/pt.json';
import enStrings from './src/i18n/en.json';
import esStrings from './src/i18n/es.json';

// =================================================================
// i18n
// =================================================================
export type Language = 'pt' | 'en' | 'es';

const translations: Record<Language, any> = {
    pt: ptStrings,
    en: enStrings,
    es: esStrings,
};

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (path: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
    const context = useContext(LanguageContext);
    if (!context) throw new Error('useLanguage must be used within LanguageProvider');
    return context;
};



// =================================================================
// ERROR BOUNDARY & FAILSAFE
// =================================================================

class ErrorBoundary extends React.Component<any, any> {
    _children: any;
    state = { hasError: false, error: null as Error | null };

    constructor(props: any) {
        super(props);
        this._children = props?.children;
    }

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error("Uncaught error:", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', margin: '20px', border: '2px solid red', borderRadius: '8px', backgroundColor: '#fff0f0', color: '#333', fontFamily: 'sans-serif' }}>
                    <h1 style={{ color: 'red', fontSize: '24px' }}>Ocorreu um Erro Crítico na Aplicação</h1>
                    <p>Ocorreu um erro inesperado durante a renderização de um componente. Tente novamente.</p>
                </div>
            );
        }
        return this._children;
    }
}

const FatalErrorScreen: React.FC<{ title: string; message: string; details?: string }> = ({ title, message }) => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: '20px', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '600px', padding: '20px', border: '2px solid #ef4444', borderRadius: '8px', backgroundColor: '#fff0f0', color: '#333', fontFamily: 'sans-serif' }}>
            <h1 style={{ color: '#ef4444', fontSize: '24px' }}>{title}</h1>
            <p>{message}</p>
        </div>
    </div>
);


// =================================================================
// HELPERS
// =================================================================
const toLocalISOString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
};

/**
 * Remove acentos e caracteres especiais de uma string para compatibilidade com impressoras térmicas.
 * Impressoras térmicas geralmente suportam apenas ASCII básico.
 */
const removeAccents = (str: string): string => { if (!str) return ''; return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^\x00-\x7F]/g, ''); };

// =================================================================
// TYPES (from types.ts)
// =================================================================

export type Page = 'dashboard' | 'movements' | 'customers' | 'employees' | 'reports' | 'settings';

export enum CustomerType {
    ROTATIVO = 'Rotativo',
    DIARIA = 'Diária',
    SEMANAL = 'Semanal',
    MENSALISTA = 'Mensalista',
    CONVENIO = 'Convênio',
    MENSALISTA_NOTURNO = 'Mensalista Noturno',
    MENSALISTA_DIARIO = 'Mensalista Diário',
}

export interface Customer {
    id: string;
    name: string;
    cpfCnpj: string;
    plate: string;
    plate2?: string;
    model?: string;
    phone: string;
    customerType: CustomerType;
    lastPayment?: string;
    isMensalista: boolean;
    isMensalistaDiurno?: boolean;
    startDate?: string;
    monthlyFee?: number;
    addressStreet?: string;
    addressNumber?: string;
    addressComplement?: string;
    addressNeighborhood?: string;
    addressCity?: string;
    addressState?: string;
    addressZip?: string;
}

export enum Permission {
    AJUSTAR_HORA = "Ajustar Hora",
    CANCELAMENTO = "Cancelamento",
    CONFIGURACOES = "Configurações",
    CUPOM = "Cupom",
    FUNCIONARIOS = "Funcionários",
    MENSALISTAS = "Mensalistas",
    MOVIMENTACAO = "Movimentação",
    RELATORIOS = "Relatórios",
    RESUMO_DIA = "Resumo do Dia",
}

export interface Employee {
    id: string;
    name: string;
    user: string;
    password?: string;
    isAdmin: boolean;
    isActive: boolean;
    permissions: Permission[];
}

export enum ChargeType {
    HORA = 'Hora',
    DIARIA = 'Diária',
    SEMANAL = 'Semanal',
    MENSAL = 'Mensal',
}

export enum VehicleType {
    CARRO = 'Carro',
    CAMINHONETE = 'Caminhonete',
    MOTO = 'Moto',
    BICICLETA = 'Bicicleta',
    BOX = 'Box',
}

export interface Service {
    id: string;
    name: string;
    price: number;
}

export interface VehicleMovement {
    id: string;
    coupon: string;
    plate: string;
    model: string;
    vehicleType: VehicleType;
    entryTime: Date;
    exitTime?: Date;
    customerName?: string;
    customerPhone?: string;
    totalPaid?: number;
    chargeType: ChargeType;
    status: 'parked' | 'completed' | 'cancelled';
    discount?: number;
    surcharge?: number;
    paymentMethod?: string;
    customerCpfOnReceipt?: string;
    services?: Service[];
    operatorEntry?: string;
    operatorExit?: string;
    // Adicionado para permitir edição do tipo de cliente na movimentação
    customerType?: CustomerType;
}

export interface CancellationLog {
    id: string;
    movement: VehicleMovement;
    cancellationTime: Date;
    operator: string;
    reason: string;
}

export interface MonthlyPaymentLog {
    id: string;
    customerId: string;
    customerName: string;
    paymentDate: Date;
    amountPaid: number;
    operator: string;
    paymentMethod: string;
}

export interface SystemLog {
    id: string;
    time: Date;
    type: 'Login' | 'Logout';
    operator: string;
}

export interface CashTransaction {
    id: string;
    date: Date;
    type: 'opening' | 'withdrawal' | 'expense';
    amount: number;
    description: string;
    operator: string;
    paymentMethod?: string; // For expenses paid by card, etc.
}

export interface DailyCashBalance {
    date: string; // YYYY-MM-DD format
    openingBalance: number;
    operator: string;
}


export interface PaymentMethod {
    id: string;
    name: string;
    isDefault: boolean;
}

export interface TimeBand { upToHours: number; price: number }
export interface PricingConfig {
    chargeModel: 'hourly' | 'fixed' | 'bands';
    firstHourRate: number;
    additionalHourRate: number;
    fixedRate: number;
    // Faixas de horário
    timeBands: TimeBand[];
    afterBandsAdditionalHourRate: number;
    dailyCapHours?: number;
    // Diária/Pernoite
    enableOvernight: boolean;
    overnightRate: number;
    diariaStartTime: string; // "07:00"
    diariaEndTime: string;   // "19:00"
}

export interface CouponConfig {
    id: string;
    code: string;
    discountPercentage: number;
    isActive: boolean;
    validUntil?: string;
}

export interface VehicleCategory {
    id: string;
    name: VehicleType;
}

export interface Agreement {
    id: string;
    name: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    associatedPlates: string; // Comma-separated
}

export interface CancellationReason {
    id: string;
    reason: string;
}

export interface CouponPrintConfig {
    headerMessage: string;
    footerMessage: string;
    entryCopies: number;
    exitCopies: number;
    validatePlate: boolean;
    highlightPlate: boolean;
    printCouponNumberInFooter: boolean;
    showSummary: boolean;
    showOverdueMonthly: boolean;
    printBarcode: boolean;
}

export interface PrinterConfig {
    profile: string;
    printWidth: number; // in pixels
    printerName?: string;
}

export interface NfseConfig {
    cnpj: string;
    im: string;
    cnae: string;
    certPath: string;
    certPassword?: string;
    isHomologation: boolean;
    autoEmit: boolean;
    certExpiration?: string;
    certSubject?: string;
}

// --- Tipos para a nova arquitetura Electron ---

// Interface para a API exposta pelo preload.js
export interface IElectronAPI {
    saveData: (key: string, data: any) => void;
    loadData: (key: string, initialData?: any) => Promise<any>;
    onUpdateReady: (callback: () => void) => void;
    restartApp: () => void;
    restartComputer: () => void;
    shutdownComputer: () => void;
    getPrinters: () => Promise<any[]>;
    onUpdateStatus: (callback: (status: string) => void) => void;
    printHtml: (content: string, printerName?: string, printWidth?: number) => Promise<{ success: boolean; error?: string }>;
    printData: (data: any[], printerName?: string, width?: string | number) => Promise<{ success: boolean; error?: string }>;
    emitNfse: (movement: VehicleMovement, config: NfseConfig) => Promise<{ success: boolean; error?: string }>;
    checkCertificateInfo: (certPath: string, certPassword?: string) => Promise<{ success: boolean; expiration?: string; subject?: string; error?: string }>;
    // checkAsaasLicense removed in favor of Firebase
    getAppVersion: () => Promise<string>;
    closeApp: () => void;
}

// Helper functions for masking
const maskCPF = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{9})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

const sendWhatsAppMessage = (phone: string, message: string) => {
    if (!phone) return;
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.length <= 11 ? `55${cleanPhone}` : cleanPhone; // Add Brazil country code if missing
    const encodedMessage = encodeURIComponent(message);
    const url = `https://web.whatsapp.com/send?phone=${fullPhone}&text=${encodedMessage}`;

    // Open in a new window using the window.open API. 
    // Since this is Electron, we might need shell.openExternal (via Main process) for better integration, 
    // but window.open usually works if 'setWindowOpenHandler' is configured in main.js. 
    // If not, a standard anchor tag also works.
    window.open(url, '_blank', 'noreferrer');
};

const maskPhone = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/(\d{2})(\d)/, '$1 $2')
        .replace(/(\d{9})\d+?$/, '$1');
};

const capitalizeFirstLetter = (value: string) => {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1);
};

const maskCNPJ = (value: string) => {
    return value
        .replace(/\D/g, '')
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2')
        .replace(/(-\d{2})\d+?$/, '$1');
};

const pushPaperFeed = (data: any[], lines: number) => {
    const safeLines = Math.max(0, Math.floor(lines));
    for (let i = 0; i < safeLines; i++) {
        data.push({ type: 'text', value: ' ', style: { fontSize: '10px' } });
    }
    data.push({ type: 'text', value: '.', style: { color: 'white', fontSize: '1px' } });
};

// Adiciona a electronAPI ao objeto global Window para type-safety
declare global {
    interface Window {
        electronAPI: IElectronAPI;
    }
}

// Estrutura de dados para o arquivo de backup
export interface BackupData {
    customers: Customer[];
    employees: Employee[];
    movements: VehicleMovement[];
    cancellationLogs: CancellationLog[];
    monthlyPaymentLogs: MonthlyPaymentLog[];
    services: Service[];
    generalSettings: any;
    paymentMethods: PaymentMethod[];
    pricingConfig: PricingConfig;
    coupons: CouponConfig[];
    vehicleCategories: VehicleCategory[];
    agreements: Agreement[];
    cancellationReasons: CancellationReason[];
    couponPrintConfig: CouponPrintConfig;
    printerConfig: PrinterConfig;
    systemLogs?: SystemLog[];
    cashTransactions?: CashTransaction[];
    dailyCashBalances?: DailyCashBalance[];
}


// =================================================================
// ICONS (from components/icons.tsx)
// =================================================================

const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
);

const CarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 17H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2zM5 7l1.5-3.5A2 2 0 018.354 2h7.292a2 2 0 011.854 1.5L19 7" />
    </svg>
);

const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21a6 6 0 00-9-5.197m0 0A5.975 5.975 0 0112 13a5.975 5.975 0 014.5 2.803M15 21a9 9 0 01-6-3.794" />
    </svg>
);

const UserGroupIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
);

const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

const CogIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);

const PlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
);

const PencilIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

const TrashIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.134-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.067-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
);

const SearchIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
    </svg>
);

const ReceiptIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-1.5h5.25m-5.25 0h3m-3 0h-1.5m3 0h.75M9 12.75h9.75M4.5 21V3m0 18h15M4.5 3h15M4.5 3H3v18h1.5" />
    </svg>
);

const PrinterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
    </svg>
);

const LogoutIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
    </svg>
);

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
);

const ChatIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
    </svg>
);

// =================================================================
// AUTH CONTEXT
// =================================================================
interface AuthContextType {
    loggedInUser: Employee | null;
}

const AuthContext = createContext<AuthContextType>({ loggedInUser: null });

const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthContext.Provider');
    }
    return context;
};

// =================================================================
// DATA HOOK (from hooks/useData.tsx)
// =================================================================

// --- INITIAL DATA ---
export interface GeneralSettings {
    cancellationPassword?: string;
    discountPassword?: string;
    parkingLimit?: number;
    lastLicenseCheck?: string; // ISO Date
    language?: Language;
    installationDate?: string; // ISO Date
}
const initialCustomers: Customer[] = [
    { id: '1', name: 'PAULO DA SILVA', cpfCnpj: '123.456.789-01', plate: 'BRA2E19', plate2: 'XYZ1234', phone: '(51) 9988-7766', customerType: CustomerType.MENSALISTA, lastPayment: '2024-06-10', isMensalista: true, isMensalistaDiurno: true, startDate: '2023-01-15', monthlyFee: 250.00, addressStreet: 'Av. Ipiranga', addressNumber: '123', addressNeighborhood: 'Partenon', addressCity: 'Porto Alegre', addressState: 'RS', addressZip: '90000-000' },
];
const initialEmployees: Employee[] = [
    { id: '1', name: 'ADMIN', user: 'ADMIN', password: 'admin', isAdmin: true, isActive: true, permissions: Object.values(Permission) },
];
const initialServices: Service[] = [{ id: '1', name: 'Lavagem Simples', price: 35.00 }, { id: '2', name: 'Sanitização', price: 80.00 }];
const initialPaymentMethods: PaymentMethod[] = [{ id: '1', name: 'DINHEIRO', isDefault: true }, { id: '2', name: 'CARTÃO CRÉDITO', isDefault: false }, { id: '3', name: 'CARTÃO DÉBITO', isDefault: false }, { id: '4', name: 'PIX', isDefault: false },];
const initialPricingConfig: PricingConfig = { chargeModel: 'hourly', firstHourRate: 10.00, additionalHourRate: 5.00, fixedRate: 30.00, timeBands: [], afterBandsAdditionalHourRate: 5.00, dailyCapHours: undefined, enableOvernight: true, overnightRate: 15.00, diariaStartTime: '07:00', diariaEndTime: '19:00' };
const initialMovements: VehicleMovement[] = [];
const initialCoupons: CouponConfig[] = [{ id: '1', code: 'PROMO10', discountPercentage: 10, isActive: true, validUntil: '2025-12-31' }];
const initialVehicleCategories: VehicleCategory[] = [{ id: '1', name: VehicleType.CARRO }, { id: '2', name: VehicleType.CAMINHONETE }, { id: '3', name: VehicleType.MOTO }, { id: '4', name: VehicleType.BICICLETA }, { id: '5', name: VehicleType.BOX },];
const initialAgreements: Agreement[] = [{ id: '1', name: 'Empresa XPTO', discountType: 'percentage', discountValue: 15, associatedPlates: 'FGH4321,JHK6789' }];
const initialCancellationReasons: CancellationReason[] = [{ id: '1', reason: 'Entrada indevida' }, { id: '2', reason: 'Cliente desistiu' }];
const initialCouponPrintConfig: CouponPrintConfig = { headerMessage: 'ESTACIONAMENTO RUA RIACHUELO, 901\nTELEFONE/WHATSAPP 51 998595952', footerMessage: 'HORÁRIOS FUNCIONAMENTO:\nSEGUNDA A SEXTA DAS 07:00 HRS ÀS 19:00 HRS\n\nVOLTE SEMPRE!!!', entryCopies: 1, exitCopies: 1, validatePlate: true, highlightPlate: true, printCouponNumberInFooter: false, showSummary: true, showOverdueMonthly: false, printBarcode: false, };
const initialPrinterConfig: PrinterConfig = { profile: 'generic_80mm', printWidth: 300, };
const initialGeneralSettings: GeneralSettings = { cancellationPassword: '', discountPassword: '', parkingLimit: 100, language: 'pt', installationDate: undefined };
const initialNfseConfig: NfseConfig = {
    cnpj: '',
    im: '',
    cnae: '',
    certPath: '',
    certPassword: '',
    isHomologation: true,
    autoEmit: false,
    certExpiration: '',
    certSubject: ''
};

// --- DATA SANITIZATION ---
const sanitizeMovements = (data: any[]): VehicleMovement[] => {
    if (!Array.isArray(data)) return [];
    return data.reduce((acc: VehicleMovement[], m: any) => {
        if (!m || !m.entryTime || isNaN(new Date(m.entryTime).getTime())) {
            console.warn('Registro de movimentação inválido descartado:', m);
            return acc;
        }
        acc.push({
            id: m.id || `${Date.now()}-${Math.random()}`,
            coupon: m.coupon || '000000',
            plate: m.plate || 'S/PLACA',
            model: m.model || 'N/D',
            vehicleType: Object.values(VehicleType).includes(m.vehicleType) ? m.vehicleType : VehicleType.CARRO,
            entryTime: new Date(m.entryTime),
            exitTime: m.exitTime && !isNaN(new Date(m.exitTime).getTime()) ? new Date(m.exitTime) : undefined,
            customerName: m.customerName || 'AVULSO',
            customerPhone: m.customerPhone || undefined,
            totalPaid: m.totalPaid,
            chargeType: Object.values(ChargeType).includes(m.chargeType) ? m.chargeType : ChargeType.HORA,
            status: ['parked', 'completed', 'cancelled'].includes(m.status) ? m.status : 'completed',
            services: Array.isArray(m.services) ? m.services : [],
            customerType: Object.values(CustomerType).includes(m.customerType) ? m.customerType : CustomerType.ROTATIVO,
            operatorEntry: m.operatorEntry,
            operatorExit: m.operatorExit,
            discount: m.discount,
            surcharge: m.surcharge,
            paymentMethod: m.paymentMethod,
            customerCpfOnReceipt: m.customerCpfOnReceipt,
        });
        return acc;
    }, []);
};

const sanitizeDateArray = <T extends { cancellationTime?: any; paymentDate?: any; movement?: any; time?: any; date?: any }>(data: any[], dateField: keyof T): T[] => {
    if (!Array.isArray(data)) return [];
    return data.filter(item => item && item[dateField] && !isNaN(new Date(item[dateField]).getTime())).map(item => ({
        ...item,
        [dateField]: new Date(item[dateField]),
        ...(item.movement && { // Sanitize nested movement in cancellation logs
            movement: {
                ...item.movement,
                entryTime: new Date(item.movement.entryTime),
                exitTime: item.movement.exitTime ? new Date(item.movement.exitTime) : undefined,
            }
        })
    }));
};


// --- DATA CONTEXT ---
interface AppModules {
    lpr: boolean;
    whatsapp: boolean;
    whatsappInstance?: string;
    whatsappToken?: string;
    barriers: boolean;
    barrierPort?: string;
    barrierIp?: string;
}

const initialAppModules: AppModules = {
    lpr: false,
    whatsapp: false,
    barriers: false,
};

interface DataContextProps {
    customers: Customer[];
    setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
    employees: Employee[];
    setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
    movements: VehicleMovement[];
    setMovements: React.Dispatch<React.SetStateAction<VehicleMovement[]>>;
    services: Service[];
    setServices: React.Dispatch<React.SetStateAction<Service[]>>;
    generalSettings: GeneralSettings;
    setGeneralSettings: React.Dispatch<React.SetStateAction<GeneralSettings>>;
    paymentMethods: PaymentMethod[];
    setPaymentMethods: React.Dispatch<React.SetStateAction<PaymentMethod[]>>;
    pricingConfig: PricingConfig;
    setPricingConfig: React.Dispatch<React.SetStateAction<PricingConfig>>;
    coupons: CouponConfig[];
    setCoupons: React.Dispatch<React.SetStateAction<CouponConfig[]>>;
    vehicleCategories: VehicleCategory[];
    setVehicleCategories: React.Dispatch<React.SetStateAction<VehicleCategory[]>>;
    agreements: Agreement[];
    setAgreements: React.Dispatch<React.SetStateAction<Agreement[]>>;
    cancellationReasons: CancellationReason[];
    setCancellationReasons: React.Dispatch<React.SetStateAction<CancellationReason[]>>;
    couponPrintConfig: CouponPrintConfig;
    setCouponPrintConfig: React.Dispatch<React.SetStateAction<CouponPrintConfig>>;
    printerConfig: PrinterConfig;
    setPrinterConfig: React.Dispatch<React.SetStateAction<PrinterConfig>>;
    cancellationLogs: CancellationLog[];
    setCancellationLogs: React.Dispatch<React.SetStateAction<CancellationLog[]>>;
    monthlyPaymentLogs: MonthlyPaymentLog[];
    setMonthlyPaymentLogs: React.Dispatch<React.SetStateAction<MonthlyPaymentLog[]>>;
    systemLogs: SystemLog[];
    setSystemLogs: React.Dispatch<React.SetStateAction<SystemLog[]>>;
    nfseConfig: NfseConfig;
    setNfseConfig: React.Dispatch<React.SetStateAction<NfseConfig>>;
    cashTransactions: CashTransaction[];
    setCashTransactions: React.Dispatch<React.SetStateAction<CashTransaction[]>>;
    dailyCashBalances: DailyCashBalance[];
    setDailyCashBalances: React.Dispatch<React.SetStateAction<DailyCashBalance[]>>;
    modules: AppModules;
    setModules: React.Dispatch<React.SetStateAction<AppModules>>;
    restoreBackup: (data: BackupData) => void;
    isDataLoaded: boolean;
}


const DataContext = createContext<DataContextProps | undefined>(undefined);

const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [movements, setMovements] = useState<VehicleMovement[]>([]);
    const [services, setServices] = useState<Service[]>([]);
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [pricingConfig, setPricingConfig] = useState<PricingConfig>(initialPricingConfig);
    const [generalSettings, setGeneralSettings] = useState<GeneralSettings>(initialGeneralSettings);
    const [coupons, setCoupons] = useState<CouponConfig[]>([]);
    const [vehicleCategories, setVehicleCategories] = useState<VehicleCategory[]>([]);
    const [agreements, setAgreements] = useState<Agreement[]>([]);
    const [cancellationReasons, setCancellationReasons] = useState<CancellationReason[]>([]);
    const [couponPrintConfig, setCouponPrintConfig] = useState<CouponPrintConfig>(initialCouponPrintConfig);
    const [printerConfig, setPrinterConfig] = useState<PrinterConfig>(initialPrinterConfig);
    const [cancellationLogs, setCancellationLogs] = useState<CancellationLog[]>([]);
    const [monthlyPaymentLogs, setMonthlyPaymentLogs] = useState<MonthlyPaymentLog[]>([]);
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
    const [nfseConfig, setNfseConfig] = useState<NfseConfig>(initialNfseConfig);
    const [modules, setModules] = useState<AppModules>(initialAppModules);
    const [cashTransactions, setCashTransactions] = useState<CashTransaction[]>([]);
    const [dailyCashBalances, setDailyCashBalances] = useState<DailyCashBalance[]>([]);
    const [isDataLoaded, setIsDataLoaded] = useState(false);


    // Efeito para CARREGAR todos os dados na montagem do componente
    useEffect(() => {
        const loadAllData = async () => {
            try {
                // Config Objects
                setCustomers((await window.electronAPI.loadData('flowestac_customers', initialCustomers)));
                setEmployees((await window.electronAPI.loadData('flowestac_employees', initialEmployees)));
                setServices((await window.electronAPI.loadData('flowestac_services', initialServices)));
                setPaymentMethods((await window.electronAPI.loadData('flowestac_payment_methods', initialPaymentMethods)));
                setCoupons((await window.electronAPI.loadData('flowestac_coupons', initialCoupons)));
                setAgreements((await window.electronAPI.loadData('flowestac_agreements', initialAgreements)));
                setCancellationReasons((await window.electronAPI.loadData('flowestac_cancellation_reasons', initialCancellationReasons)));

                // Configs with defaults merge
                const loadedPricing = await window.electronAPI.loadData('flowestac_pricing_config', initialPricingConfig);
                setPricingConfig({ ...initialPricingConfig, ...loadedPricing });

                const loadedGeneral = await window.electronAPI.loadData('flowestac_general_settings', initialGeneralSettings);
                setGeneralSettings({ ...initialGeneralSettings, ...loadedGeneral });

                const loadedVehicleCat = await window.electronAPI.loadData('flowestac_vehicle_categories', initialVehicleCategories);
                setVehicleCategories(Array.isArray(loadedVehicleCat) ? loadedVehicleCat : initialVehicleCategories);

                const loadedCouponPrint = await window.electronAPI.loadData('flowestac_coupon_config', initialCouponPrintConfig);
                setCouponPrintConfig({ ...initialCouponPrintConfig, ...loadedCouponPrint });

                const loadedPrinter = await window.electronAPI.loadData('flowestac_printer_config', initialPrinterConfig);
                setPrinterConfig({ ...initialPrinterConfig, ...loadedPrinter });

                // Data arrays with sanitization
                const rawMovements = await window.electronAPI.loadData('flowestac_movements', initialMovements);
                setMovements(sanitizeMovements(rawMovements));

                const rawCancellations = await window.electronAPI.loadData('flowestac_cancellation_logs', []);
                setCancellationLogs(sanitizeDateArray(rawCancellations, 'cancellationTime'));

                const rawMonthlyPayments = await window.electronAPI.loadData('flowestac_monthly_payments', []);
                setMonthlyPaymentLogs(sanitizeDateArray(rawMonthlyPayments, 'paymentDate'));

                const rawSystemLogs = await window.electronAPI.loadData('flowestac_system_logs', []);
                setSystemLogs(sanitizeDateArray(rawSystemLogs, 'time'));

                const loadedNfse = await window.electronAPI.loadData('flowestac_nfse_config', initialNfseConfig);
                setNfseConfig({ ...initialNfseConfig, ...loadedNfse });

                const loadedModules = await window.electronAPI.loadData('flowestac_modules', initialAppModules);
                setModules({ ...initialAppModules, ...loadedModules });

                const rawCashTransactions = await window.electronAPI.loadData('flowestac_cash_transactions', []);
                setCashTransactions(sanitizeDateArray(rawCashTransactions, 'date'));

                const loadedDailyCashBalances = await window.electronAPI.loadData('flowestac_daily_cash_balances', []);
                setDailyCashBalances(loadedDailyCashBalances);

            } catch (error) {
                console.error("Failed to load data, using initial defaults.", error);
                // Fallback to initial data in case of a critical loading error
                setCustomers(initialCustomers);
                setEmployees(initialEmployees);
                setServices(initialServices);
                // ... set all others to initial ...
            } finally {
                setIsDataLoaded(true);
            }
        };
        loadAllData();
    }, []);

    // Efeitos para SALVAR os dados quando eles mudam
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_customers', customers); }, [customers, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_employees', employees); }, [employees, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_movements', movements); }, [movements, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_services', services); }, [services, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_payment_methods', paymentMethods); }, [paymentMethods, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_pricing_config', pricingConfig); }, [pricingConfig, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_general_settings', generalSettings); }, [generalSettings, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_coupons', coupons); }, [coupons, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_vehicle_categories', vehicleCategories); }, [vehicleCategories, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_agreements', agreements); }, [agreements, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_cancellation_reasons', cancellationReasons); }, [cancellationReasons, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_coupon_config', couponPrintConfig); }, [couponPrintConfig, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_printer_config', printerConfig); }, [printerConfig, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_cancellation_logs', cancellationLogs); }, [cancellationLogs, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_monthly_payments', monthlyPaymentLogs); }, [monthlyPaymentLogs, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_system_logs', systemLogs); }, [systemLogs, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_nfse_config', nfseConfig); }, [nfseConfig, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_cash_transactions', cashTransactions); }, [cashTransactions, isDataLoaded]);
    useEffect(() => { if (isDataLoaded) window.electronAPI.saveData('flowestac_daily_cash_balances', dailyCashBalances); }, [dailyCashBalances, isDataLoaded]);


    // Função para restaurar todos os dados de um backup
    const restoreBackup = (data: BackupData) => {
        setCustomers(data.customers || initialCustomers);
        setEmployees(data.employees || initialEmployees);
        setMovements(sanitizeMovements(data.movements || initialMovements));
        setServices(data.services || initialServices);
        setPaymentMethods(data.paymentMethods || initialPaymentMethods);
        setPricingConfig({ ...initialPricingConfig, ...(data.pricingConfig || {}) });
        setGeneralSettings({ ...initialGeneralSettings, ...(data.generalSettings || {}) });
        setCoupons(data.coupons || initialCoupons);
        setVehicleCategories(data.vehicleCategories || initialVehicleCategories);
        setAgreements(data.agreements || initialAgreements);
        setCancellationReasons(data.cancellationReasons || initialCancellationReasons);
        setCouponPrintConfig({ ...initialCouponPrintConfig, ...(data.couponPrintConfig || {}) });
        setPrinterConfig({ ...initialPrinterConfig, ...(data.printerConfig || {}) });
        setCancellationLogs(sanitizeDateArray(data.cancellationLogs || [], 'cancellationTime'));
        setMonthlyPaymentLogs(sanitizeDateArray(data.monthlyPaymentLogs || [], 'paymentDate'));
        setSystemLogs(sanitizeDateArray(data.systemLogs || [], 'time'));
        setCashTransactions(sanitizeDateArray(data.cashTransactions || [], 'date'));
        setDailyCashBalances(data.dailyCashBalances || []);
        alert('Backup restaurado com sucesso! Os dados foram carregados.');
    };


    const value = {
        customers, setCustomers,
        employees, setEmployees,
        movements, setMovements,
        services, setServices,
        generalSettings, setGeneralSettings,
        paymentMethods, setPaymentMethods,
        pricingConfig, setPricingConfig,
        coupons, setCoupons,
        vehicleCategories, setVehicleCategories,
        agreements, setAgreements,
        cancellationReasons, setCancellationReasons,
        couponPrintConfig, setCouponPrintConfig,
        printerConfig, setPrinterConfig,
        cancellationLogs, setCancellationLogs,
        monthlyPaymentLogs, setMonthlyPaymentLogs,
        systemLogs, setSystemLogs,
        nfseConfig, setNfseConfig,
        modules, setModules,
        cashTransactions, setCashTransactions,
        dailyCashBalances, setDailyCashBalances,
        restoreBackup,
        isDataLoaded
    };


    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};

const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { generalSettings, setGeneralSettings, isDataLoaded } = useData();
    const language = generalSettings.language || 'pt';

    const setLanguage = (lang: Language) => {
        setGeneralSettings(prev => ({ ...prev, language: lang }));
    };

    const t = (path: string) => {
        const keys = path.split('.');
        let result = translations[language];
        for (const key of keys) {
            if (!result || result[key] === undefined) return path;
            result = result[key];
        }
        return result;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
};


// =================================================================
// COMPONENTS
// =================================================================

// --- Sidebar (from components/Sidebar.tsx) ---
const Sidebar: React.FC<{
    currentPage: Page;
    setCurrentPage: (page: Page) => void;
    loggedInUser: Employee;
    onLogout: () => void;
    onSupportClick: () => void;
    updateReady: boolean;
    licenseStatus: 'checking' | 'active' | 'blocked' | 'offline';
    nfseConfig: NfseConfig;
}> = ({ currentPage, setCurrentPage, loggedInUser, onLogout, onSupportClick, updateReady, licenseStatus, nfseConfig }) => {
    const { t } = useLanguage();
    const [version, setVersion] = useState<string>('...');
    const [updateStatus, setUpdateStatus] = useState<string>('');
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isNetworkOnline, setIsNetworkOnline] = useState(navigator.onLine);

    // Trial Calculation
    const TRIAL_PERIOD_DAYS = 14;
    const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);
    const { generalSettings } = useData();

    useEffect(() => {
        const installDateStr = generalSettings?.installationDate;
        if (installDateStr) {
            const installDate = new Date(installDateStr);
            const now = new Date();
            const diffTrialTime = now.getTime() - installDate.getTime();
            const diffTrialDays = Math.floor(diffTrialTime / (1000 * 60 * 60 * 24));
            const remaining = Math.max(0, TRIAL_PERIOD_DAYS - diffTrialDays);

            // Only show trial warning if not admin and actually in trial period
            const ADMIN_CNPJ = '48062404000136';
            const cleanCnpj = nfseConfig?.cnpj?.replace(/\D/g, '') || '';

            if (cleanCnpj !== ADMIN_CNPJ && diffTrialDays <= TRIAL_PERIOD_DAYS) {
                setTrialDaysLeft(remaining);
            }
        }
    }, [generalSettings?.installationDate, nfseConfig?.cnpj]);

    useEffect(() => {
        const handleOnline = () => setIsNetworkOnline(true);
        const handleOffline = () => setIsNetworkOnline(false);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    useEffect(() => {
        if (window.electronAPI && window.electronAPI.getAppVersion) {
            window.electronAPI.getAppVersion().then(setVersion);
        }
        if (window.electronAPI && window.electronAPI.onUpdateStatus) {
            window.electronAPI.onUpdateStatus((status) => setUpdateStatus(status));
        }
    }, []);

    const menuItems = [
        { id: 'dashboard', label: t('common.dashboard'), icon: DashboardIcon },
        { id: 'movements', label: t('common.movements'), icon: CarIcon },
        { id: 'customers', label: t('common.customers'), icon: UsersIcon },
        { id: 'employees', label: t('common.employees'), icon: UserGroupIcon },
        { id: 'reports', label: t('common.reports'), icon: ChartBarIcon },
        { id: 'settings', label: t('common.settings'), icon: CogIcon },
        { id: 'support', label: 'Suporte', icon: ChatIcon },
    ];

    const visibleMenuItems = loggedInUser.isAdmin
        ? menuItems
        : menuItems.filter(item => item.id === 'dashboard');

    // Lógica do Status do Certificado (Simplificada para modo recolhido)
    let certStatusText = t('sidebar.certNotConfigured');
    let certStatusColor = 'text-slate-500';
    let certStatusBg = 'bg-slate-400';
    let certDotColor = 'bg-slate-400';

    if (nfseConfig.certPath) {
        if (nfseConfig.certExpiration) {
            const expirationDate = new Date(nfseConfig.certExpiration);
            const today = new Date();
            if (expirationDate < today) {
                certStatusText = t('sidebar.certExpired');
                certStatusColor = 'text-red-600';
                certStatusBg = 'bg-red-500';
                certDotColor = 'bg-red-500';
            } else {
                certStatusText = t('sidebar.certOk');
                certStatusColor = 'text-green-600';
                certStatusBg = 'bg-green-500';
                certDotColor = 'bg-green-500';
            }
        } else {
            certStatusText = t('sidebar.certPendente');
            certStatusColor = 'text-orange-600';
            certStatusBg = 'bg-orange-500';
            certDotColor = 'bg-orange-500';
        }
    }

    return (
        <aside className={`${isCollapsed ? 'w-20' : 'w-64'} bg-slate-50 dark:bg-slate-900 flex-shrink-0 shadow-xl flex flex-col transition-all duration-300 ease-in-out border-r border-slate-200 dark:border-slate-800 relative`}>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-6 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-full p-1 shadow-md hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors z-50 text-slate-500 dark:text-slate-300"
                title={isCollapsed ? t('sidebar.expand') : t('sidebar.collapse')}
            >
                {isCollapsed ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                    </svg>
                )}
            </button>

            <nav className="flex-1 px-3 py-6 overflow-y-auto overflow-x-hidden">
                <ul className="space-y-2">
                    {visibleMenuItems.map((item) => {
                        const IconComponent = item.icon;
                        const isActive = currentPage === item.id;
                        return (
                            <li key={item.id}>
                                <a
                                    href="#"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (item.id === 'support') {
                                            onSupportClick();
                                        } else {
                                            setCurrentPage(item.id as Page);
                                        }
                                    }}
                                    className={`flex items-center ${isCollapsed ? 'justify-center px-0' : 'px-3'} py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                                        : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 hover:shadow-md'
                                        }`}
                                    title={isCollapsed ? item.label : ''}
                                >
                                    <IconComponent className={`h-6 w-6 flex-shrink-0 transition-transform duration-200 ${!isCollapsed && isActive ? 'animate-pulse_once' : ''}`} />
                                    <span className={`font-medium ml-3 whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 ml-0' : 'w-auto opacity-100'}`}>
                                        {item.label}
                                    </span>

                                    {/* Tooltip for collapsed mode */}
                                    {isCollapsed && (
                                        <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nw shadow-lg z-50">
                                            {item.label}
                                        </div>
                                    )}
                                </a>
                            </li>
                        )
                    })}
                </ul>
            </nav>

            <div className={`px-4 py-4 border-t border-slate-200 dark:border-slate-800 space-y-3 bg-slate-100/50 dark:bg-slate-800/50 transition-all duration-300 ${isCollapsed ? 'items-center flex flex-col' : ''}`}>

                {/* Status System */}
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? (!isNetworkOnline ? t('sidebar.noInternet') : licenseStatus === 'active' ? t('sidebar.online') : licenseStatus === 'blocked' ? t('sidebar.blocked') : t('sidebar.offline')) : ''}>

                    <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-700 shadow-sm flex-shrink-0 
                        ${!isNetworkOnline ? 'bg-slate-400' :
                            licenseStatus === 'active' ? 'bg-green-500' :
                                licenseStatus === 'blocked' ? 'bg-red-500' :
                                    licenseStatus === 'offline' ? 'bg-orange-500' : 'bg-slate-400 animate-pulse'}`}
                    />

                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'} 
                        ${!isNetworkOnline ? 'text-slate-500' :
                            licenseStatus === 'active' ? 'text-green-600' :
                                licenseStatus === 'blocked' ? 'text-red-600' :
                                    licenseStatus === 'offline' ? 'text-orange-600' : 'text-slate-500'}`}>
                        {!isNetworkOnline ? t('sidebar.noInternet') :
                            licenseStatus === 'active' ? t('sidebar.online') :
                                licenseStatus === 'blocked' ? t('sidebar.blocked') :
                                    licenseStatus === 'offline' ? t('sidebar.offline') : t('sidebar.checking')}
                    </span>
                </div>

                {/* Status Certificado */}
                <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${isCollapsed ? 'justify-center' : ''}`} title={isCollapsed ? certStatusText : ''}>
                    <div className={`w-2.5 h-2.5 rounded-full ring-2 ring-white dark:ring-slate-700 shadow-sm flex-shrink-0 ${certDotColor}`} />
                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isCollapsed ? 'w-0 opacity-0 hidden' : 'w-auto opacity-100'} ${certStatusColor}`}>
                        {certStatusText}
                    </span>
                </div>
            </div>

            {/* Trial Warning Banner in Sidebar */}
            {trialDaysLeft !== null && !isCollapsed && (
                <div className="mx-3 mt-4 mb-2 p-3 bg-gradient-to-r from-orange-100 to-amber-100 dark:from-orange-900/40 dark:to-amber-900/40 border border-orange-200 dark:border-orange-800/50 rounded-xl shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                    <div className="flex items-start">
                        <div className="flex-shrink-0 mt-0.5">
                            <svg className="h-5 w-5 text-orange-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div className="ml-2 w-0 flex-1">
                            <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">
                                Período de Teste
                            </h3>
                            <div className="mt-1 text-xs text-orange-700 dark:text-orange-400">
                                <p>Restam <span className="font-extrabold text-orange-900 dark:text-orange-200">{trialDaysLeft} dias</span> grátis.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {updateStatus && !isCollapsed && (
                <div className="px-4 py-2 text-xs text-center text-blue-600 dark:text-blue-400 font-medium animate-pulse bg-blue-50 dark:bg-blue-900/20 mx-2 rounded-lg mb-2">
                    {updateStatus}
                </div>
            )}

            {updateReady && (
                <div className={`px-2 py-2 ${isCollapsed ? 'flex justify-center' : 'px-4'}`}>
                    <button
                        onClick={() => window.electronAPI.restartApp()}
                        className={`flex items-center justify-center p-2 rounded-xl transition-all duration-200 text-white bg-green-600 hover:bg-green-700 animate-pulse shadow-md ${isCollapsed ? 'w-10 h-10' : 'w-full'}`}
                        title={t('common.update')}
                    >
                        <DownloadIcon className="h-5 w-5" />
                        {!isCollapsed && <span className="font-medium ml-2 text-sm">{t('common.update')}</span>}
                    </button>
                </div>
            )}

            <div className={`p-2 ${isCollapsed ? 'flex justify-center' : 'px-4 pb-4'}`}>
                <button
                    onClick={onLogout}
                    className={`flex items-center justify-center p-2 rounded-xl transition-all duration-200 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 border border-transparent hover:border-red-200 dark:hover:border-red-800 ${isCollapsed ? 'w-10 h-10' : 'w-full hover:shadow-sm'}`}
                    title={t('common.logout')}
                >
                    <LogoutIcon className="h-5 w-5" />
                    {!isCollapsed && <span className="font-medium ml-2 text-sm">{t('common.logout')}</span>}
                </button>
            </div>
            <div className={`py-4 text-center text-[10px] text-slate-400 font-medium transition-all duration-300 ${isCollapsed ? 'opacity-0 h-0 hidden' : 'opacity-100'}`}>
                <p className="opacity-70">FlowEstac v{version}</p>
            </div>
        </aside>
    );
};


// --- Helper function to map CustomerType to ChargeType
const getChargeTypeFromCustomerType = (customerType: CustomerType): ChargeType => {
    switch (customerType) {
        case CustomerType.MENSALISTA:
        case CustomerType.MENSALISTA_DIARIO:
        case CustomerType.MENSALISTA_NOTURNO:
            return ChargeType.MENSAL;
        case CustomerType.SEMANAL:
            return ChargeType.SEMANAL;
        case CustomerType.DIARIA:
            return ChargeType.DIARIA;
        case CustomerType.ROTATIVO:
        case CustomerType.CONVENIO:
        default:
            return ChargeType.HORA;
    }
};

// --- Dashboard (from components/Dashboard.tsx) ---
const Dashboard: React.FC = () => {
    const { movements, setMovements, customers, services, generalSettings, couponPrintConfig, printerConfig, setCancellationLogs, modules, nfseConfig } = useData();
    const { loggedInUser } = useAuth();
    const [isMonthlyPaymentModalOpen, setIsMonthlyPaymentModalOpen] = useState(false);
    const [isCashClosingModalOpen, setIsCashClosingModalOpen] = useState(false);
    const [selectedMovementForPayment, setSelectedMovementForPayment] = useState<VehicleMovement | null>(null);
    const [selectedMovementForEdit, setSelectedMovementForEdit] = useState<VehicleMovement | null>(null);
    const [movementToCancel, setMovementToCancel] = useState<VehicleMovement | null>(null);
    const [movementForPrint, setMovementForPrint] = useState<VehicleMovement | null>(null);
    const [isConfirmEntryModalOpen, setIsConfirmEntryModalOpen] = useState(false);
    const [lastRegisteredMovement, setLastRegisteredMovement] = useState<VehicleMovement | null>(null);

    // State for Quick Entry form
    const [plate, setPlate] = useState('');
    const [model, setModel] = useState('');
    const [entryCustomerName, setEntryCustomerName] = useState('');
    const [entryCustomerPhone, setEntryCustomerPhone] = useState('');
    const [customerType, setCustomerType] = useState<CustomerType>(CustomerType.ROTATIVO);
    const [vehicleType, setVehicleType] = useState<VehicleType>(VehicleType.CARRO);
    const [selectedServices, setSelectedServices] = useState<Service[]>([]);

    // State for Search
    const [couponSearch, setCouponSearch] = useState('');

    // Trial Calculation for Dashboard Warning
    const TRIAL_PERIOD_DAYS = 14;
    const [trialDaysLeft, setTrialDaysLeft] = useState<number | null>(null);

    useEffect(() => {
        const installDateStr = generalSettings?.installationDate;
        if (installDateStr) {
            const installDate = new Date(installDateStr);
            const now = new Date();
            const diffTrialTime = now.getTime() - installDate.getTime();
            const diffTrialDays = Math.floor(diffTrialTime / (1000 * 60 * 60 * 24));
            const remaining = Math.max(0, TRIAL_PERIOD_DAYS - diffTrialDays);

            const ADMIN_CNPJ = '48062404000136';
            const cleanCnpj = nfseConfig?.cnpj?.replace(/\D/g, '') || '';

            if (cleanCnpj !== ADMIN_CNPJ && diffTrialDays <= TRIAL_PERIOD_DAYS) {
                setTrialDaysLeft(remaining);
            }
        }
    }, [generalSettings?.installationDate, nfseConfig?.cnpj]);
    const [plateSearch, setPlateSearch] = useState('');
    const plateInputRef = useRef<HTMLInputElement>(null);

    // Estados para modais de gestão de caixa
    const [isOpeningBalanceModalOpen, setIsOpeningBalanceModalOpen] = useState(false);
    const [isWithdrawalModalOpen, setIsWithdrawalModalOpen] = useState(false);
    const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState(''); // Global alert state

    // Focus management - simplified to avoid potential loops
    const focusPlateInput = () => {
        // Only focus if no modal is open (Dashboard only renders when it's the current page)
        if (
            !isMonthlyPaymentModalOpen &&
            !isCashClosingModalOpen &&
            !selectedMovementForPayment &&
            !selectedMovementForEdit &&
            !movementToCancel &&
            !movementForPrint &&
            !isConfirmEntryModalOpen &&
            !isOpeningBalanceModalOpen &&
            !isWithdrawalModalOpen &&
            !isExpenseModalOpen
        ) {
            if (plateInputRef.current) {
                plateInputRef.current.focus();
                // Optionally select text only if it's not empty to avoid disrupting typing
                if (plateInputRef.current.value) {
                    plateInputRef.current.select();
                }
            }
        }
    };

    // Auto-focus only when relevant states change
    useEffect(() => {
        focusPlateInput();
    }, [isMonthlyPaymentModalOpen, isCashClosingModalOpen, selectedMovementForPayment, selectedMovementForEdit, movementToCancel, movementForPrint, isConfirmEntryModalOpen, isOpeningBalanceModalOpen, isWithdrawalModalOpen, isExpenseModalOpen]);

    // Shortcuts and window focus
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'F12') {
                event.preventDefault();
                setIsCashClosingModalOpen(true);
            }
            if (event.key === 'F1') {
                event.preventDefault();
                plateInputRef.current?.focus();
            }
        };

        const handleWindowFocus = () => focusPlateInput();

        const handleDocumentClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT';
            const isButton = target.closest('button');
            const isModal = target.closest('[role="dialog"]') || target.closest('.fixed.inset-0');

            if (!isInput && !isButton && !isModal) {
                focusPlateInput();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('focus', handleWindowFocus);
        document.addEventListener('mousedown', handleDocumentClick);
        
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('focus', handleWindowFocus);
            document.removeEventListener('mousedown', handleDocumentClick);
        };
    }, []); // Removed currentPage dependency as it's not in scope and not needed for mounting listeners

    const Clock = () => {
        const [time, setTime] = useState(new Date());
        useEffect(() => {
            const timerId = setInterval(() => setTime(new Date()), 1000);
            return () => clearInterval(timerId);
        }, []);

        const formattedDate = new Intl.DateTimeFormat('pt-BR', {
            day: '2-digit', month: '2-digit', year: 'numeric', weekday: 'long'
        }).format(time).replace(/(?:^| )(\w)/g, (match, p1) => p1.toUpperCase());

        const formattedTime = time.toLocaleTimeString('pt-BR');

        return (
            <div className="text-right">
                <p className="font-bold text-lg text-blue-600 dark:text-blue-400 font-mono tracking-wider">{formattedDate}</p>
                <p className="font-mono text-slate-500 text-xl">{formattedTime}</p>
            </div>
        );
    };


    const handleServiceToggle = (service: Service) => {
        setSelectedServices(prev =>
            prev.some(s => s.id === service.id)
                ? prev.filter(s => s.id !== service.id)
                : [...prev, service]
        );
    };

    const handlePlateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newPlate = e.target.value.toUpperCase();
        setPlate(newPlate);

        if (newPlate.trim().length >= 7) {
            const existingCustomer = customers.find(c => c.plate.toUpperCase() === newPlate || (c.plate2 && c.plate2.toUpperCase() === newPlate));
            const lastMovement = [...movements]
                .reverse()
                .find(m => m.plate.toUpperCase() === newPlate);

            if (existingCustomer) {
                // Pre-fill model from customer or last movement only if currently empty
                if (!model) setModel(existingCustomer.model || lastMovement?.model || ''); 
                if (!entryCustomerName) setEntryCustomerName(existingCustomer.name);
                if (!entryCustomerPhone) setEntryCustomerPhone(existingCustomer.phone);
                setCustomerType(existingCustomer.customerType);
            } else if (lastMovement) {
                // Fallback to movement history for non-customers
                // Only autofill if not a 'mensalista' from history, as that's a customer-specific status
                if (lastMovement.chargeType !== ChargeType.MENSAL) {
                    if (!model) setModel(lastMovement.model || '');
                    if (!entryCustomerName) setEntryCustomerName(lastMovement.customerName === 'AVULSO' ? '' : lastMovement.customerName || '');
                    if (!entryCustomerPhone) setEntryCustomerPhone(lastMovement.customerPhone || '');
                    setVehicleType(lastMovement.vehicleType);
                }
            }
        }
    };

    const handleRegisterEntry = () => {
        if (!plate) {
            setAlertMessage('A placa é obrigatória.');
            return;
        }

        // Verifica se o veículo já está no pátio
        const isAlreadyInPatio = movements.some(m => m.plate.toUpperCase() === plate.toUpperCase() && m.status === 'parked');
        if (isAlreadyInPatio) {
            setAlertMessage(`O veículo com placa ${plate.toUpperCase()} já está no pátio.`);
            return;
        }

        const existingCustomer = customers.find(c => c.plate.toUpperCase() === plate.toUpperCase() || (c.plate2 && c.plate2.toUpperCase() === plate.toUpperCase()));

        const newMovement: VehicleMovement = {
            id: new Date().toISOString(),
            coupon: String(Math.floor(100000 + Math.random() * 900000)),
            plate: plate.toUpperCase(),
            model,
            vehicleType,
            entryTime: new Date(),
            chargeType: getChargeTypeFromCustomerType(customerType),
            status: 'parked',
            customerName: existingCustomer?.name || entryCustomerName || 'AVULSO',
            customerPhone: existingCustomer?.phone || entryCustomerPhone,
            services: selectedServices,
            operatorEntry: loggedInUser!.name,
            customerType: customerType,
        };

        setMovements(prev => [newMovement, ...prev]);
        setLastRegisteredMovement(newMovement);

        setPlate('');
        setModel('');
        setEntryCustomerName('');
        setEntryCustomerPhone('');
        setSelectedServices([]);
        // Use requestAnimationFrame to ensure the Enter key event cycle is complete 
        // before opening the modal, preventing auto-confirmation.
        requestAnimationFrame(() => {
            setIsConfirmEntryModalOpen(true);
        });
    };

    const handlePlateKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        // Prevent event propagation if the confirmation modal is open 
        // to avoid validation errors when confirming with Enter.
        if (isConfirmEntryModalOpen) return;

        if (e.key === 'Enter') {
            e.preventDefault();
            e.stopPropagation();
            handleRegisterEntry();
        }
    };

    const handleConfirmPrintEntry = () => {
        if (lastRegisteredMovement) {
            printEntryCoupon(lastRegisteredMovement, couponPrintConfig, printerConfig, modules);
        }
        setIsConfirmEntryModalOpen(false);
        focusPlateInput();
    };

    const handleCloseConfirmPrintEntry = () => {
        setIsConfirmEntryModalOpen(false);
        focusPlateInput();
    };

    const handleConfirmMonthlyExit = (movement: VehicleMovement) => {
        const updatedMovement: VehicleMovement = {
            ...movement,
            status: 'completed',
            exitTime: new Date(),
            totalPaid: 0,
            paymentMethod: 'Mensalista',
            operatorExit: loggedInUser!.name,
        };
        setMovements(prev => prev.map(m => m.id === movement.id ? updatedMovement : m));
        alert(`Saída do mensalista (Placa: ${movement.plate}) registrada com sucesso.`);
        focusPlateInput();
    };

    const handleRowDoubleClick = (movement: VehicleMovement) => {
        if (movement.status !== 'parked') return;

        if (movement.chargeType === ChargeType.MENSAL) {
            // If the mensalista has services, we need to go to PaymentModal to charge them.
            if (movement.services && movement.services.length > 0) {
                setSelectedMovementForPayment(movement);
            } else {
                if (window.confirm(`Confirmar saída para o mensalista com placa ${movement.plate}? Esta ação não registrará pagamento.`)) {
                    handleConfirmMonthlyExit(movement);
                }
            }
        } else {
            setSelectedMovementForPayment(movement);
        }
    };

    const handleSearch = () => {
        if (!couponSearch && !plateSearch) return;
        const foundMovement = movements.find(m =>
            m.status === 'parked' && ((plateSearch && m.plate.toUpperCase() === plateSearch.toUpperCase().trim()) || (couponSearch && m.coupon === couponSearch.trim()))
        );
        if (foundMovement) {
            handleRowDoubleClick(foundMovement);
        } else {
            alert('Veículo não encontrado no pátio.');
        }
    };

    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch();

    const handleConfirmCancellation = (password: string, reason: string) => {
        if (!movementToCancel) return;

        const { cancellationPassword } = generalSettings;

        if (!cancellationPassword || cancellationPassword.trim() === '') {
            alert("A senha de cancelamento não foi configurada. Por favor, peça a um administrador para configurá-la na tela de 'Configurações' > 'Geral'.");
            setMovementToCancel(null);
            return;
        }

        if (password === cancellationPassword) {
            const newLog: CancellationLog = {
                id: new Date().toISOString(),
                movement: movementToCancel,
                cancellationTime: new Date(),
                operator: loggedInUser!.name,
                reason: reason,
            };
            setCancellationLogs(prev => [...prev, newLog]);
            setMovements(prev => prev.filter(m => m.id !== movementToCancel!.id));
            alert("Entrada excluída com sucesso.");
        } else {
            alert("Senha incorreta. A exclusão foi cancelada.");
        }
        setMovementToCancel(null);
        // Ensure focus returns to the plate input after modal closure
        requestAnimationFrame(() => focusPlateInput());
    };

    const handleEditClick = (movement: VehicleMovement) => {
        setSelectedMovementForEdit(movement);
    };

    const handleSaveEditedMovement = (updatedMovement: VehicleMovement) => {
        setMovements(prev => prev.map(m => m.id === updatedMovement.id ? updatedMovement : m));
    };


    const parkedVehicles = useMemo(() => movements.filter(m => m.status === 'parked'), [movements]);
    const vehiclesWithServices = useMemo(() => parkedVehicles.filter(m => m.services && m.services.length > 0).length, [parkedVehicles]);
    const totalExitsToday = useMemo(() => {
        const today = new Date().toDateString();
        return movements.filter(m => m.status === 'completed' && m.exitTime && new Date(m.exitTime).toDateString() === today).length
    }, [movements]);
    const parkedMensalistas = useMemo(() => parkedVehicles.filter(m => m.chargeType === ChargeType.MENSAL).length, [parkedVehicles]);

    const mensalistasDiurnosFaltam = useMemo(() => {
        const todosMensalistasDiurnos = customers.filter(
            c => c.isMensalista && c.isMensalistaDiurno
        );
        const parkedPlates = new Set(parkedVehicles.map(v => v.plate.toUpperCase()));
        const faltantes = todosMensalistasDiurnos.filter(
            c => !parkedPlates.has(c.plate.toUpperCase()) && !(c.plate2 && parkedPlates.has(c.plate2.toUpperCase()))
        );
        return faltantes.length;
    }, [customers, parkedVehicles]);

    const sortedParkedMovements = useMemo(() => parkedVehicles
        .sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()),
        [parkedVehicles]);

    const formatEntryTime = (time: Date): string => {
        const entryDate = new Date(time);
        const today = new Date();
        const isSameDay = entryDate.getFullYear() === today.getFullYear() &&
            entryDate.getMonth() === today.getMonth() &&
            entryDate.getDate() === today.getDate();

        if (isSameDay) {
            return entryDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        } else {
            return entryDate.toLocaleString('pt-BR', { day: 'numeric', month: 'numeric', year: '2-digit', hour: '2-digit', minute: '2-digit' });
        }
    };


    return (
        <>
            <PaymentModal
                movement={selectedMovementForPayment}
                onClose={() => setSelectedMovementForPayment(null)}
                onPaymentSuccess={(mov) => setMovementForPrint(mov)}
            />
            <PrintOptionsModal
                isOpen={!!movementForPrint}
                movement={movementForPrint}
                onClose={() => setMovementForPrint(null)}
            />
            <EditMovementModal movement={selectedMovementForEdit} onClose={() => setSelectedMovementForEdit(null)} onSave={handleSaveEditedMovement} />
            <RegisterMonthlyPaymentModal isOpen={isMonthlyPaymentModalOpen} onClose={() => setIsMonthlyPaymentModalOpen(false)} />
            {/* Modals Globais */}
            <AlertModal
                isOpen={!!alertMessage}
                message={alertMessage}
                onClose={() => {
                    setAlertMessage('');
                    focusPlateInput(); // Restore focus immediately after closing alert
                }}
            />

            <ConfirmEntryModal
                isOpen={isConfirmEntryModalOpen}
                onClose={handleCloseConfirmPrintEntry}
                onConfirm={handleConfirmPrintEntry}
            />
            <CancellationModal
                isOpen={!!movementToCancel}
                onClose={() => setMovementToCancel(null)}
                onConfirm={handleConfirmCancellation}
                movement={movementToCancel}
            />
            <CashClosingModal
                isOpen={isCashClosingModalOpen}
                onClose={() => setIsCashClosingModalOpen(false)}
            />
            <SetOpeningBalanceModal
                isOpen={isOpeningBalanceModalOpen}
                onClose={() => setIsOpeningBalanceModalOpen(false)}
            />
            <AddWithdrawalModal
                isOpen={isWithdrawalModalOpen}
                onClose={() => setIsWithdrawalModalOpen(false)}
            />
            <AddExpenseModal
                isOpen={isExpenseModalOpen}
                onClose={() => setIsExpenseModalOpen(false)}
            />

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md flex flex-col h-[calc(100vh-2rem)]">
                {/* Top Bar: Search & Clock */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b dark:border-slate-700 pb-4 mb-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <input type="text" placeholder="Localizar Cupom..." value={couponSearch} onChange={(e) => { setCouponSearch(e.target.value); setPlateSearch(''); }} onKeyDown={handleSearchKeyDown} className="p-2 w-36 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                        <input type="text" placeholder="Localizar Placa..." value={plateSearch} onChange={(e) => { setPlateSearch(e.target.value); setCouponSearch(''); }} onKeyDown={handleSearchKeyDown} className="p-2 w-36 border rounded-md dark:bg-slate-700 dark:border-slate-600" />
                        <button onClick={handleSearch} className="bg-blue-600 text-white rounded-md p-2 h-10 inline-flex items-center justify-center font-semibold hover:bg-blue-700 transition-colors flex-shrink-0" aria-label="Localizar Veículo">
                            <SearchIcon className="w-5 h-5 mr-1" /> Localizar
                        </button>
                    </div>
                    <div className="flex items-center gap-4">
                        <Clock />
                        <button onClick={() => window.electronAPI.closeApp?.()} className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-lg transition-transform hover:scale-105" title="Sair do Sistema">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </header>

                {/* Dashboard Trial Banner - Takes full width if present */}
                {trialDaysLeft !== null && (
                    <div className="mb-4 bg-orange-50 dark:bg-orange-900/30 border-l-4 border-orange-500 p-4 rounded-r-md flex items-center justify-between shadow-sm animate-pulse_once">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <svg className="h-6 w-6 text-orange-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-bold text-orange-800 dark:text-orange-300">Atenção! Seu período de teste grátis ({TRIAL_PERIOD_DAYS} dias) está em andamento.</h3>
                                <div className="mt-1 text-sm text-orange-700 dark:text-orange-400">
                                    Faltam <strong>{trialDaysLeft} dias</strong> para o bloqueio do sistema. Entre as configurações e regularize sua licença.
                                </div>
                            </div>
                        </div>
                        <div>
                            <button onClick={() => window.open('https://wa.me/5551995896312?text=Olá, meu período de teste do FlowEstac está acabando e gostaria de ver os planos.', '_blank')} className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors shadow-sm cursor-pointer">
                                Falar com Suporte (WhatsApp)
                            </button>
                        </div>
                    </div>
                )}

                {/* Entry Form */}
                <section className="border-b dark:border-slate-700 pb-4 mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
                        <div className="flex flex-col"><label className="text-xs font-bold mb-1">Tipo Cobrança</label><select value={customerType} onChange={(e) => setCustomerType(e.target.value as CustomerType)} className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">{Object.values(CustomerType).map(type => <option key={type} value={type}>{type}</option>)}</select></div>
                        <div className="flex flex-col"><label className="text-xs font-bold mb-1">Categoria</label><select value={vehicleType} onChange={(e) => setVehicleType(e.target.value as VehicleType)} className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600">{Object.values(VehicleType).map(type => <option key={type} value={type}>{type}</option>)}</select></div>
                        <div className="flex flex-col"><label className="text-xs font-bold mb-1">Informe a Placa (F1)</label><input type="text" placeholder="Placa*" ref={plateInputRef} value={plate} onChange={handlePlateChange} onKeyDown={handlePlateKeyDown} className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" /></div>
                        <div className="flex flex-col"><label className="text-xs font-bold mb-1">Modelo</label><input type="text" placeholder="Modelo" value={model} onChange={(e) => setModel(capitalizeFirstLetter(e.target.value))} className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" /></div>
                        <div className="flex flex-col col-span-2 md:col-span-2 lg:col-span-1"><label className="text-xs font-bold mb-1">Nome do Cliente</label><input type="text" placeholder="Nome do Cliente" value={entryCustomerName} onChange={(e) => setEntryCustomerName(capitalizeFirstLetter(e.target.value))} className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" /></div>
                        <div className="flex flex-col"><label className="text-xs font-bold mb-1">Telefone</label><input type="text" placeholder="Telefone" value={entryCustomerPhone} onChange={(e) => setEntryCustomerPhone(maskPhone(e.target.value))} className="p-2 border rounded-md dark:bg-slate-700 dark:border-slate-600" /></div>
                    </div>
                    <div className="mt-3 flex flex-col md:flex-row justify-between items-start md:items-end gap-3">
                        {services.length > 0 && (
                            <details className="w-full md:w-auto">
                                <summary className="cursor-pointer text-sm font-medium text-slate-600 dark:text-slate-300 list-none"><span className="flex items-center">Serviços<svg className="w-4 h-4 ml-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg></span></summary>
                                <div className="flex flex-wrap gap-x-4 gap-y-2 pt-2">
                                    {services.map(service => (<div key={service.id} className="flex items-center"><input type="checkbox" id={`service-${service.id}`} checked={selectedServices.some(s => s.id === service.id)} onChange={() => handleServiceToggle(service)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><label htmlFor={`service-${service.id}`} className="ml-2 text-sm">{service.name}</label></div>))}
                                </div>
                            </details>
                        )}
                        <div className="flex-grow"></div>
                        <div className="flex gap-2 self-end">
                            <button onClick={handleRegisterEntry} className="bg-green-600 text-white rounded-md py-2 px-6 h-10 inline-flex items-center justify-center font-semibold hover:bg-green-700 transition-colors">Registrar</button>
                            <button onClick={() => setIsMonthlyPaymentModalOpen(true)} className="bg-teal-600 text-white rounded-md py-2 px-4 h-10 inline-flex items-center justify-center font-semibold hover:bg-teal-700 transition-colors">Mensalista</button>
                            <button onClick={() => setIsOpeningBalanceModalOpen(true)} className="bg-blue-600 text-white rounded-md py-2 px-4 h-10 inline-flex items-center justify-center font-semibold hover:bg-blue-700 transition-colors" title="Definir Saldo Inicial">💰 Troco Inicial</button>
                            <button onClick={() => setIsWithdrawalModalOpen(true)} className="bg-red-600 text-white rounded-md py-2 px-4 h-10 inline-flex items-center justify-center font-semibold hover:bg-red-700 transition-colors" title="Registrar Sangria">💸 Sangria</button>
                            <button onClick={() => setIsExpenseModalOpen(true)} className="bg-orange-600 text-white rounded-md py-2 px-4 h-10 inline-flex items-center justify-center font-semibold hover:bg-orange-700 transition-colors" title="Registrar Despesa">🧾 Despesa</button>
                        </div>
                    </div>
                </section>

                {/* Parked Vehicles List */}
                <main className="flex-grow overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="sticky top-0 bg-white dark:bg-slate-800">
                            <tr className="border-b dark:border-slate-600">
                                <th className="p-2 font-semibold text-slate-500">Nº Cupom</th>
                                <th className="p-2 font-semibold text-slate-500">Placa</th>
                                <th className="p-2 font-semibold text-slate-500">Modelo</th>
                                <th className="p-2 font-semibold text-slate-500">Entrada</th>
                                <th className="p-2 font-semibold text-slate-500">Cliente</th>
                                <th className="p-2 font-semibold text-slate-500">Serviço</th>
                                <th className="p-2 font-semibold text-slate-500 text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {sortedParkedMovements.map(mov => {
                                const hasServices = mov.services && mov.services.length > 0;
                                const isMensalista = mov.chargeType === ChargeType.MENSAL;
                                let rowClass = 'border-b dark:border-slate-700 last:border-b-0 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors cursor-pointer';
                                if (hasServices) { rowClass += ' bg-orange-300 dark:bg-orange-850/40'; }
                                else if (isMensalista) { rowClass += ' bg-yellow-100 dark:bg-yellow-900/30'; }

                                return (
                                    <tr key={mov.id} onDoubleClick={() => handleRowDoubleClick(mov)} className={rowClass}>
                                        <td className="p-2">{mov.coupon}</td>
                                        <td className="p-2 font-mono font-bold">{mov.plate}</td>
                                        <td className="p-2">{mov.model}</td>
                                        <td className="p-2">{formatEntryTime(mov.entryTime)}</td>
                                        <td className="p-2">{mov.customerName || '---'}</td>
                                        <td className="p-2 text-xs">{mov.services?.map(s => s.name).join(', ') || '---'}</td>
                                        <td className="p-2 text-right">
                                            <div className="flex items-center justify-end space-x-1 text-slate-500">
                                                {modules?.whatsapp && mov.customerPhone && (
                                                    <button onClick={(e) => {
                                                        e.stopPropagation();
                                                        const msg = `*Aviso*\n\nOla, seu veiculo placa *${mov.plate}* encontra-se no estacionamento.\nEntrada: ${new Date(mov.entryTime).toLocaleString('pt-BR')}`;
                                                        sendWhatsAppMessage(mov.customerPhone!, msg);
                                                    }} className="p-1 hover:text-green-600" title="WhatsApp"><ChatIcon /></button>
                                                )}
                                                <button onClick={(e) => { e.stopPropagation(); handleEditClick(mov); }} className="p-1 hover:text-blue-600" title="Editar"><PencilIcon /></button>
                                                <button onClick={(e) => { e.stopPropagation(); printEntryCoupon(mov, couponPrintConfig, printerConfig, modules); }} className="p-1 hover:text-gray-600" title="Reimprimir Cupom"><PrinterIcon /></button>
                                                <button onClick={(e) => { e.stopPropagation(); setMovementToCancel(mov); }} className="p-1 hover:text-red-600" title="Excluir Entrada"><TrashIcon /></button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                            {sortedParkedMovements.length === 0 && (
                                <tr><td colSpan={7} className="text-center p-6 text-slate-500">Nenhum veículo estacionado.</td></tr>
                            )}
                        </tbody>
                    </table>
                </main>

                {/* Summary Footer */}
                <footer className="border-t dark:border-slate-700 mt-2 pt-2 text-sm">
                    <div className="flex justify-between items-center font-medium">
                        <div className="flex gap-x-4 flex-wrap">
                            <span>Estacionados: <strong className="text-blue-600">{parkedVehicles.length}</strong></span>
                            <span>Mensalistas: <strong className="text-yellow-600">{parkedMensalistas}</strong></span>
                            <span>Diurnos (Faltam): <strong className="text-orange-500">{mensalistasDiurnosFaltam}</strong></span>
                            <span>Saídas (hoje): <strong className="text-green-600">{totalExitsToday}</strong></span>
                            <span>Em Serviço: <strong className="text-orange-700 dark:text-orange-400">{vehiclesWithServices}</strong></span>
                        </div>
                        <button onClick={() => setIsCashClosingModalOpen(true)} className="bg-sky-600 text-white rounded-md py-1 px-3 inline-flex items-center justify-center font-semibold hover:bg-sky-700 transition-colors">
                            Fechamento de Caixa (F12)
                        </button>
                    </div>
                    <div className="text-xs text-center text-slate-400 mt-1">
                        <strong>Atalhos:</strong> F1 - Registrar Entrada | F12 - Fechar Caixa | ESC - Sair
                    </div>
                </footer>
            </div>
        </>
    );
};

// --- Helper Components for Dashboard ---
const calculateDetailedPrice = (entryTime: Date, exitTime: Date, config: PricingConfig): { price: number; description: string } => {
    if (!(entryTime instanceof Date) || !(exitTime instanceof Date) || isNaN(entryTime.getTime()) || isNaN(exitTime.getTime())) {
        return { price: config.firstHourRate || 0, description: "Erro de data" };
    }

    const durationMillis = exitTime.getTime() - entryTime.getTime();
    if (durationMillis <= 0) return { price: 0, description: 'Sem permanência' };
    const totalDurationHours = durationMillis / (1000 * 60 * 60);

    // Internal helper for hourly/bands logic
    const calculateHourlyPart = (hours: number): { price: number; description: string } => {
        if (hours <= 0) return { price: 0, description: '' };

        if (config.chargeModel === 'fixed') {
            return { price: config.fixedRate, description: 'Diária Fixa' };
        }

        let price = 0;
        let desc = '';

        if (config.chargeModel === 'bands' && Array.isArray(config.timeBands) && config.timeBands.length > 0) {
            const bands = [...config.timeBands].sort((a, b) => a.upToHours - b.upToHours);
            let found = false;
            for (const band of bands) {
                if (hours <= band.upToHours) {
                    price = band.price;
                    desc = `Até ${band.upToHours}h`;
                    found = true;
                    break;
                }
            }
            if (!found) {
                const lastBand = bands[bands.length - 1];
                const additionalHours = Math.ceil(hours - lastBand.upToHours);
                price = lastBand.price + (additionalHours * (config.afterBandsAdditionalHourRate || config.additionalHourRate));
                desc = `Até ${lastBand.upToHours}h + ${additionalHours}h Adic.`;
            }
        } else {
            // Default hourly model
            if (hours <= 1) {
                price = config.firstHourRate;
                desc = '1ª Hora';
            } else {
                const additionalHours = Math.ceil(hours - 1);
                price = config.firstHourRate + (additionalHours * config.additionalHourRate);
                desc = `1ª Hora + ${additionalHours}h Adic.`;
            }
        }

        // Apply daily cap if configured
        if (config.dailyCapHours && hours >= config.dailyCapHours) {
            return { price: config.fixedRate, description: `Limite ${config.dailyCapHours}h → Diária` };
        }

        return { price, description: desc };
    };

    // If Overnight is NOT enabled, use the flat hourly/bands model
    if (!config.enableOvernight || !config.diariaStartTime || !config.diariaEndTime) {
        return calculateHourlyPart(totalDurationHours);
    }

    // NOVA LÓGICA: Se a duração total estiver dentro da faixa horária (até o limite da diária), 
    // calcula como um período único para evitar múltiplas cobranças de "1ª hora" ao cruzar fronteiras.
    const capHours = config.dailyCapHours || 2;
    if (totalDurationHours <= capHours) {
        return calculateHourlyPart(totalDurationHours);
    }

    const [startHour, startMinute] = config.diariaStartTime.split(':').map(Number);
    const [endHour, endMinute] = config.diariaEndTime.split(':').map(Number);

    let current = new Date(entryTime);
    let totalCost = 0;
    const descriptions: string[] = [];

    while (current < exitTime) {
        const isCurrentInDiaria = current.getHours() >= startHour && (current.getHours() < endHour || (current.getHours() === endHour && current.getMinutes() < endMinute));

        const periodEnd = new Date(current);
        if (isCurrentInDiaria) {
            periodEnd.setHours(endHour, endMinute, 0, 0);
            if (periodEnd <= current) periodEnd.setDate(periodEnd.getDate() + 1);
        } else {
            if (current.getHours() >= endHour) periodEnd.setDate(periodEnd.getDate() + 1);
            periodEnd.setHours(startHour, startMinute, 0, 0);
            if (periodEnd <= current) periodEnd.setDate(periodEnd.getDate() + 1);
        }

        const effectiveEnd = exitTime < periodEnd ? exitTime : periodEnd;
        const periodDurationHours = (effectiveEnd.getTime() - current.getTime()) / (1000 * 60 * 60);

        // Se a duração total já excedeu o cap, qualquer tempo gasto em um período 
        // conta como o valor fixo daquele período (Diária ou Pernoite).
        if (periodDurationHours > 0.01) { // Tolerância de 36 segundos
            if (isCurrentInDiaria) {
                totalCost += config.fixedRate;
                descriptions.push("1 Diária");
            } else {
                totalCost += config.overnightRate;
                descriptions.push("1 Pernoite");
            }
        }

        current = effectiveEnd;
    }

    // Simplify description (e.g., "1 Diária + 1 Diária" -> "2 Diárias")
    const simplifiedDesc = descriptions.reduce((acc: any, d) => {
        acc[d] = (acc[d] || 0) + 1;
        return acc;
    }, {});

    const descString = Object.entries(simplifiedDesc)
        .map(([msg, count]) => (count as number) > 1 ? `${count}x ${msg}` : msg)
        .join(' + ');

    return { price: totalCost, description: descString || 'Período' };
};


const printReceipt = async (movement: VehicleMovement, basePrice: number, couponConfig: CouponPrintConfig, printerConfig: PrinterConfig, modules?: AppModules) => {

    if (!movement.exitTime) return;
    const entryTime = new Date(movement.entryTime);
    const exitTime = new Date(movement.exitTime);
    const durationMillis = exitTime.getTime() - entryTime.getTime();
    const hours = Math.floor(durationMillis / (1000 * 60 * 60));
    const minutes = Math.floor((durationMillis % (1000 * 60 * 60)) / (1000 * 60));
    const durationStr = `${hours}h ${minutes}m`;
    const services = movement.services || [];
    const servicesPrice = services.reduce((sum, s) => sum + s.price, 0);

    const data: any[] = [];

    // Header Dinâmico (Split por linhas)
    const headerLines = (couponConfig.headerMessage || '').split('\n');
    headerLines.forEach(line => {
        if (line.trim()) {
            data.push({ type: 'text', value: removeAccents(line), style: { fontWeight: "700", textAlign: 'center', marginBottom: '2px', fontSize: '10px' } });
        }
    });

    data.push(
        { type: 'text', value: removeAccents('COMPROVANTE DE SAIDA'), style: { textAlign: 'center', fontSize: '12px', margin: '5px 0' } },
        { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } },

        // Dados Principais
        { type: 'text', value: `CUPOM: ${movement.coupon}`, style: { textAlign: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' } },

        // Tipo de Cliente
        { type: 'text', value: removeAccents(`Tipo: ${movement.customerType || 'ROTATIVO'}`), style: { fontSize: "10px", textAlign: 'center' } }
    );

    // Placa Grande
    data.push(
        { type: 'text', value: '='.repeat(28), style: { textAlign: 'center', fontSize: '10px' } },
        {
            type: 'text',
            value: ` PLACA: ${movement.plate} `,
            style: {
                fontWeight: "bold",
                fontSize: "32px",
                textAlign: 'center',
                margin: '5px 0'
            }
        },
        { type: 'text', value: '='.repeat(28), style: { textAlign: 'center', fontSize: '10px', marginBottom: '5px' } }
    );

    // Detalhes em Tabela
    data.push(
        { type: 'text', value: removeAccents(`${movement.vehicleType} / ${movement.model || ''}`), style: { fontSize: "10px", textAlign: 'center', marginBottom: '10px' } },
        {
            type: 'table', style: { border: 'none' }, tableHeader: [], tableBody: [
                ['Entrada:', removeAccents(entryTime.toLocaleString('pt-BR'))],
                ['Saida:', removeAccents(exitTime.toLocaleString('pt-BR'))],
                ['Tempo:', durationStr],
                ['Atendente:', removeAccents(movement.operatorExit || movement.operatorEntry || 'Admin')],
            ], tableHeaderStyle: { display: 'none' }, tableBodyStyle: { border: 'none' }, tableCellStyle: { textAlign: 'left', fontSize: '10px' }
        },
        { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } }
    );

    if (couponConfig.showSummary) {
        data.push({ type: 'text', value: `Estadia: ${basePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, style: { fontSize: "10px" } });

        services.forEach(s => {
            data.push({ type: 'text', value: `+ ${removeAccents(s.name)}: ${s.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, style: { fontSize: "10px" } });
        });

        if (services.length > 0) {
            data.push({ type: 'text', value: `Subtotal: ${(basePrice + servicesPrice).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, style: { fontSize: "10px" } });
        }

        if (movement.discount) {
            data.push({ type: 'text', value: `Desconto: -${movement.discount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, style: { fontSize: "10px" } });
        }
        if (movement.surcharge) {
            data.push({ type: 'text', value: `Acrescimo: +${movement.surcharge.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, style: { fontSize: "10px" } });
        }

        data.push({ type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } });
        data.push({ type: 'text', value: `TOTAL: ${(movement.totalPaid ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, style: { fontWeight: "bold", fontSize: "14px", textAlign: 'right' } });
        data.push({ type: 'text', value: `Pagamento: ${removeAccents(movement.paymentMethod || 'DINHEIRO')}`, style: { fontSize: "10px", textAlign: 'right' } });
        if (movement.customerCpfOnReceipt) {
            data.push({ type: 'text', value: `CPF: ${movement.customerCpfOnReceipt}`, style: { fontSize: "10px", textAlign: 'right' } });
        }
        data.push({ type: 'text', value: '-'.repeat(28), style: { textAlign: 'center', marginBottom: '10px' } });
    }

    // Footer Dinâmico (Split por linhas)
    const footerLines = (couponConfig.footerMessage || '').split('\n');
    footerLines.forEach(line => {
        if (line.trim()) {
            data.push({ type: 'text', value: removeAccents(line), style: { textAlign: 'center', marginTop: '2px', fontSize: '10px' } });
        }
    });

    if (couponConfig.printCouponNumberInFooter) {
        data.push({ type: 'text', value: `Cupom: ${movement.coupon}`, style: { textAlign: 'center', fontSize: '10px' } });
    }

    if (couponConfig.printBarcode) {
        data.push({ type: 'barCode', value: movement.coupon, height: 40, width: 2, displayValue: true, fontsize: 10, position: 'center' });
    }

    // QR Code para Totem/Cancelas
    if (modules?.barriers) {
        // O valor do QR pode ser apenas o cupom ou um JSON/String específico dependendo do hardware. 
        // Assumindo envio do número do cupom.
        data.push({ type: 'text', value: ' ', style: { fontSize: '5px' } }); // Spacer
        data.push({ type: 'qrCode', value: movement.coupon, height: 100, width: 100, position: 'center' });
        data.push({ type: 'text', value: 'Aproxime o QR Code do leitor', style: { textAlign: 'center', fontSize: '10px' } });
    }

    pushPaperFeed(data, 6);

    if (window.electronAPI && window.electronAPI.printData) {
        await window.electronAPI.printData(data, printerConfig.printerName, printerConfig.printWidth);
    } else {
        alert("Erro: Sistema de impressão não inicializado.");
    }
};

const printSimpleExitCoupon = async (movement: VehicleMovement, couponConfig: CouponPrintConfig, printerConfig: PrinterConfig, modules?: AppModules) => {
    if (!movement.exitTime) return;
    const entryTime = new Date(movement.entryTime);
    const exitTime = new Date(movement.exitTime);

    const durationMillis = exitTime.getTime() - entryTime.getTime();
    const hours = Math.floor(durationMillis / (1000 * 60 * 60));
    const minutes = Math.floor((durationMillis % (1000 * 60 * 60)) / (1000 * 60));
    const durationStr = `${hours}h ${minutes}m`;

    const data: any[] = [];

    // Header Dinâmico (Split por linhas)
    const headerLines = (couponConfig.headerMessage || '').split('\n');
    headerLines.forEach(line => {
        if (line.trim()) {
            data.push({ type: 'text', value: removeAccents(line), style: { fontWeight: "700", textAlign: 'center', marginBottom: '2px', fontSize: '10px' } });
        }
    });

    data.push(
        { type: 'text', value: removeAccents('COMPROVANTE DE SAIDA'), style: { textAlign: 'center', fontSize: '12px', margin: '10px 0' } },
        { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } },

        // Número do Cupom (Destacado)
        { type: 'text', value: `CUPOM: ${movement.coupon}`, style: { textAlign: 'center', fontSize: '24px', fontWeight: 'bold', margin: '5px 0' } }
    );

    // Adiciona Tipo de Cliente e Nome
    data.push(
        { type: 'text', value: removeAccents(`Tipo: ${movement.customerType || 'ROTATIVO'}`), style: { fontSize: "12px", textAlign: 'center', fontWeight: 'bold' } }
    );
    if (movement.customerName && movement.customerName !== 'AVULSO') {
        data.push({ type: 'text', value: removeAccents(`Cliente: ${movement.customerName}`), style: { fontSize: "10px", textAlign: 'center' } });
    }

    // Placa
    data.push({ type: 'text', value: '='.repeat(28), style: { textAlign: 'center', fontSize: '8px' } });
    data.push({
        type: 'text',
        value: ` PLACA: ${movement.plate} `,
        style: {
            fontSize: "32px",
            textAlign: 'center',
            fontWeight: 'bold',
            margin: '2px 0'
        }
    });
    data.push({ type: 'text', value: '='.repeat(28), style: { textAlign: 'center', fontSize: '8px', marginBottom: '2px' } });

    data.push(
        { type: 'text', value: removeAccents(`Entrada: ${entryTime.toLocaleString('pt-BR')}`), style: { fontSize: "10px" } },
        { type: 'text', value: removeAccents(`Saida:   ${exitTime.toLocaleString('pt-BR')}`), style: { fontSize: "10px" } },
        { type: 'text', value: `Tempo:   ${durationStr}`, style: { fontSize: "10px", fontWeight: "bold" } },
        { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } },

        // Detalhes de Pagamento no Cupom Simples
        { type: 'text', value: `TOTAL: ${(movement.totalPaid ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`, style: { fontWeight: "bold", fontSize: "14px", textAlign: 'right', margin: '5px 0' } },
        { type: 'text', value: removeAccents(`Pagamento: ${movement.paymentMethod || 'DINHEIRO'}`), style: { fontSize: "10px", textAlign: 'right' } },
        { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } }
    );

    // Footer Dinâmico (Split por linhas)
    const footerLines = (couponConfig.footerMessage || '').split('\n');
    footerLines.forEach(line => {
        if (line.trim()) {
            data.push({ type: 'text', value: removeAccents(line), style: { textAlign: 'center', marginTop: '2px', fontSize: '10px' } });
        }
    });

    // Cancelas / Totem na Saída (Talvez para abrir a cancela lendo o comprovante?)
    if (modules?.barriers) {
        data.push({ type: 'text', value: ' ', style: { fontSize: '5px' } });
        data.push({ type: 'qrCode', value: movement.coupon, height: 100, width: 100, position: 'center' });
    }

    pushPaperFeed(data, 6);


    if (window.electronAPI && window.electronAPI.printData) {
        await window.electronAPI.printData(data, printerConfig.printerName, printerConfig.printWidth);
    }
};

const printEntryCoupon = async (movement: VehicleMovement, couponConfig: CouponPrintConfig, printerConfig: PrinterConfig, modules?: AppModules) => {
    const entryTime = new Date(movement.entryTime);

    const data: any[] = [];

    // Header Dinâmico (Split por linhas)
    const headerLines = (couponConfig.headerMessage || '').split('\n');
    headerLines.forEach(line => {
        if (line.trim()) {
            data.push({ type: 'text', value: removeAccents(line), style: { fontWeight: "700", textAlign: 'center', marginBottom: '2px', fontSize: '10px' } });
        }
    });

    data.push(
        { type: 'text', value: removeAccents('COMPROVANTE DE ENTRADA'), style: { textAlign: 'center', fontSize: '12px', fontWeight: 'bold', marginBottom: '5px' } },
        { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } },

        { type: 'text', value: `CUPOM: ${movement.coupon}`, style: { textAlign: 'center', fontSize: '24px', fontWeight: 'bold', marginBottom: '5px' } },

        // Tipo de Cliente e Nome (Se houver)
        { type: 'text', value: removeAccents(`Tipo: ${movement.customerType || 'ROTATIVO'}`), style: { fontSize: "10px", textAlign: 'center', fontWeight: 'bold' } },
        ...(movement.customerName && movement.customerName !== 'AVULSO' ? [{ type: 'text', value: removeAccents(`Cliente: ${movement.customerName}`), style: { fontSize: "10px", textAlign: 'center' } }] : []),

        // Placa
        { type: 'text', value: '='.repeat(28), style: { textAlign: 'center', fontSize: '8px' } },
        { type: 'text', value: ` PLACA: ${movement.plate} `, style: { fontWeight: "bold", fontSize: "32px", textAlign: 'center', margin: '2px 0' } },
        { type: 'text', value: '='.repeat(28), style: { textAlign: 'center', fontSize: '8px', marginBottom: '2px' } },

        // Categoria e Modelo
        { type: 'text', value: removeAccents(`Cat: ${movement.vehicleType.toUpperCase()} / ${movement.model?.toUpperCase() || ''}`), style: { fontSize: "10px", textAlign: 'center', marginBottom: '5px' } },

        // Data e Hora de Entrada (Detalhada)
        { type: 'text', value: `Entrada: ${entryTime.toLocaleDateString('pt-BR')}  Hora: ${entryTime.toLocaleTimeString('pt-BR')}`, style: { fontSize: "12px", textAlign: 'center', fontWeight: 'bold', margin: '5px 0' } },

        { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } }
    );

    if (couponConfig.printBarcode) {
        data.push({ type: 'barCode', value: movement.coupon, height: 40, width: 2, displayValue: true, fontsize: 10, position: 'center' });
    }

    // QR Code para Totem/Cancelas
    if (modules?.barriers) {
        data.push({ type: 'text', value: ' ', style: { fontSize: '5px' } });
        data.push({ type: 'qrCode', value: movement.coupon, height: 100, width: 100, position: 'center' });
        data.push({ type: 'text', value: 'Aproxime o QR Code do leitor', style: { textAlign: 'center', fontSize: '10px' } });
    }

    // Footer Dinâmico (Split por linhas)
    const footerLines = (couponConfig.footerMessage || '').split('\n');
    footerLines.forEach(line => {
        if (line.trim()) {
            data.push({ type: 'text', value: removeAccents(line), style: { textAlign: 'center', marginTop: '2px', fontSize: '10px' } });
        }
    });

    pushPaperFeed(data, 6);

    if (window.electronAPI && window.electronAPI.printData) {
        await window.electronAPI.printData(data, printerConfig.printerName, printerConfig.printWidth);
    }
};

const printCashClosingReport = async (summary: { 
    totalsByPaymentMethod: { [key: string]: number }, 
    rotativoTotalsByMethod: { [key: string]: number },
    mensalistaTotalsByMethod: { [key: string]: number },
    grandTotal: number, 
    rotativoTotal: number,
    totalExits: number, 
    totalEntries: number, 
    currentlyParked: number, 
    openingBalance: number, 
    monthlyPayments: number, 
    withdrawals: number, 
    expenses: number, 
    netCash: number,
    todayTransactions: CashTransaction[],
    todayMonthlyPayments: MonthlyPaymentLog[]
}, couponConfig: CouponPrintConfig, printerConfig: PrinterConfig) => {
    const reportDate = new Date().toLocaleString('pt-BR');

    const data: any[] = [];

    // Header Dinâmico
    const headerLines = (couponConfig.headerMessage || '').split('\n');
    headerLines.forEach(line => {
        if (line.trim()) {
            data.push({ type: 'text', value: removeAccents(line), style: { fontWeight: "700", textAlign: 'center', marginBottom: '2px', fontSize: '10px' } });
        }
    });

    data.push(
        { type: 'text', value: removeAccents('Fechamento de Caixa'), style: { textAlign: 'center', fontSize: '14px', fontWeight: 'bold', marginTop: '5px' } },
        { type: 'text', value: removeAccents(`Data: ${reportDate}`), style: { textAlign: 'center', fontSize: '10px', marginBottom: '5px' } },
        { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } },
    );

    // Saldo Inicial
    data.push(
        { type: 'text', value: removeAccents('SALDO INICIAL:'), style: { fontSize: "10px", fontWeight: 'bold', marginTop: '5px' } },
        { type: 'text', value: `R$ ${summary.openingBalance.toFixed(2).replace('.', ',')}`, style: { fontSize: "12px", textAlign: 'right', fontWeight: 'bold' } },
        { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } },
    );

    // Recebimentos Avulsos (Rotativos)
    if (summary.rotativoTotal > 0) {
        data.push({ type: 'text', value: removeAccents('RECEBIMENTOS ROTATIVO:'), style: { fontSize: "10px", fontWeight: 'bold', marginTop: '5px' } });
        Object.entries(summary.rotativoTotalsByMethod).forEach(([method, total]) => {
            if (total > 0) {
                data.push({ type: 'text', value: removeAccents(`${method}: R$ ${total.toFixed(2).replace('.', ',')}`), style: { fontSize: "10px" } });
            }
        });
        data.push({ type: 'text', value: `Subtotal Rotativo: R$ ${summary.rotativoTotal.toFixed(2).replace('.', ',')}`, style: { fontSize: "10px", textAlign: 'right', fontStyle: 'italic' } });
    }

    // Recebimentos Mensalistas
    if (summary.monthlyPayments > 0) {
        data.push({ type: 'text', value: removeAccents('RECEBIMENTOS MENSALISTA:'), style: { fontSize: "10px", fontWeight: 'bold', marginTop: '8px' } });
        Object.entries(summary.mensalistaTotalsByMethod).forEach(([method, total]) => {
            if (total > 0) {
                data.push({ type: 'text', value: removeAccents(`${method}: R$ ${total.toFixed(2).replace('.', ',')}`), style: { fontSize: "10px" } });
            }
        });
        data.push({ type: 'text', value: `Subtotal Mensalista: R$ ${summary.monthlyPayments.toFixed(2).replace('.', ',')}`, style: { fontSize: "10px", textAlign: 'right', fontStyle: 'italic' } });
    }

    data.push(
        { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center', marginTop: '5px' } },
        { type: 'text', value: `TOTAL RECEBIDO: R$ ${summary.grandTotal.toFixed(2).replace('.', ',')}`, style: { fontSize: "11px", fontWeight: 'bold', textAlign: 'right' } },
        { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } },
    );

    // Saídas Detalhadas
    if (summary.withdrawals > 0 || summary.expenses > 0) {
        data.push({ type: 'text', value: removeAccents('SAIDAS (DETALHE):'), style: { fontSize: "10px", fontWeight: 'bold', marginTop: '5px' } });
        
        summary.todayTransactions.forEach(t => {
            const typeLabel = t.type === 'withdrawal' ? 'SANGRIA' : 'DESPESA';
            data.push({ 
                type: 'text', 
                value: removeAccents(`${typeLabel}: R$ ${t.amount.toFixed(2).replace('.', ',')}`), 
                style: { fontSize: "10px" } 
            });
            data.push({ 
                type: 'text', 
                value: removeAccents(` -> ${t.description}`), 
                style: { fontSize: "9px", fontStyle: 'italic', marginLeft: '5px' } 
            });
        });

        data.push(
            { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } },
            { type: 'text', value: `TOTAL SAIDAS: R$ ${(summary.withdrawals + summary.expenses).toFixed(2).replace('.', ',')}`, style: { fontSize: "11px", fontWeight: 'bold', textAlign: 'right' } },
            { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } },
        );
    }

    // Saldo Final
    data.push(
        { type: 'text', value: removeAccents('SALDO EM CAIXA:'), style: { fontSize: "12px", fontWeight: 'bold', marginTop: '8px' } },
        { type: 'text', value: `R$ ${summary.netCash.toFixed(2).replace('.', ',')}`, style: { fontSize: "14px", textAlign: 'right', fontWeight: 'bold' } },
        { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center' } },
    );

    // Estatísticas
    data.push(
        { type: 'text', value: removeAccents('ESTATISTICAS:'), style: { fontSize: "10px", fontWeight: 'bold', marginTop: '5px' } },
        { type: 'text', value: removeAccents(`Entradas (Hoje):  ${summary.totalEntries}`), style: { fontSize: "10px" } },
        { type: 'text', value: removeAccents(`Saidas (Hoje):    ${summary.totalExits}`), style: { fontSize: "10px" } },
        { type: 'text', value: removeAccents(`No Patio:        ${summary.currentlyParked}`), style: { fontSize: "10px" } },
        { type: 'text', value: '-'.repeat(28), style: { textAlign: 'center', marginBottom: '5px' } }
    );

    // Footer
    const footerLines = (couponConfig.footerMessage || '').split('\n');
    footerLines.forEach(line => {
        if (line.trim()) {
            data.push({ type: 'text', value: removeAccents(line), style: { textAlign: 'center', marginTop: '2px', fontSize: '10px' } });
        }
    });

    pushPaperFeed(data, 8);

    if (window.electronAPI && window.electronAPI.printData) {
        await window.electronAPI.printData(data, printerConfig.printerName, printerConfig.printWidth);
    }
};

const PrintOptionsModal: React.FC<{ isOpen: boolean; onClose: () => void; movement: VehicleMovement | null; }> = ({ isOpen, onClose, movement }) => {
    const { pricingConfig, couponPrintConfig, printerConfig, modules } = useData();
    if (!isOpen || !movement) return null;
    const handlePrintReceipt = () => { if (!movement.exitTime) return; const { price: basePrice } = calculateDetailedPrice(movement.entryTime, movement.exitTime, pricingConfig); printReceipt(movement, basePrice, couponPrintConfig, printerConfig, modules); onClose(); };
    const handlePrintCoupon = () => { printSimpleExitCoupon(movement, couponPrintConfig, printerConfig, modules); onClose(); };

    // WhatsApp Helper
    const handleSendWhastApp = () => {
        if (!movement.customerPhone) {
            // alert('Este movimento não possui um telefone vinculado.'); // Replaced globally? 
            // Since this is inside a Modal, using global alert might be tricky if not passed down. 
            // For now, let's stick to the main issue (Register Entry).
            // But replacing alert here is improved UX too.
            // Let's assume we can pass a callback or specific UI. 
            // Actually, keep it simple for now, focus on the reported bug.
            alert('Este movimento não possui um telefone vinculado.');
            return;
        }

        let msg = `*Comprovante de Estacionamento*\n\n`;
        msg += `Placa: *${movement.plate}*\n`;
        msg += `Entrada: ${new Date(movement.entryTime).toLocaleString('pt-BR')}\n`;
        msg += `Saida: ${new Date().toLocaleString('pt-BR')}\n`;
        msg += `Valor Total: ${(movement.totalPaid ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}\n`;
        msg += `\nObrigado pela preferencia!`;

        sendWhatsAppMessage(movement.customerPhone, msg);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Impressão</h3><p>Pagamento registrado com sucesso. O que você deseja fazer?</p>
                <div className="flex flex-col space-y-3 pt-4">
                    <button onClick={handlePrintReceipt} className="py-3 px-4 w-full bg-blue-600 text-white font-semibold rounded hover:bg-blue-700">Imprimir Comprovante (Nota)</button>
                    <button onClick={handlePrintCoupon} className="py-3 px-4 w-full bg-slate-600 text-white font-semibold rounded hover:bg-slate-700">Imprimir Cupom Simples</button>

                    {modules?.whatsapp && movement.customerPhone && (
                        <button onClick={handleSendWhastApp} className="py-3 px-4 w-full bg-green-600 text-white font-semibold rounded hover:bg-green-700 flex items-center justify-center gap-2">
                            <ChatIcon /> Enviar Comprovante no WhatsApp
                        </button>
                    )}

                    <button onClick={onClose} className="py-3 px-4 w-full bg-slate-200 dark:bg-slate-500 font-semibold rounded hover:bg-slate-300">Não Imprimir</button>
                </div>
            </div>
        </div>
    );
};
// Universal Alert Modal
const AlertModal: React.FC<{ isOpen: boolean, message: string, onClose: () => void }> = ({ isOpen, message, onClose }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[100]" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm text-center space-y-4" onClick={e => e.stopPropagation()}>
                <div className="text-yellow-500 text-5xl">⚠️</div>
                <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Atenção</h3>
                <p className="text-slate-600 dark:text-slate-300">{message}</p>
                <button onClick={onClose} className="py-2 px-6 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 w-full">OK</button>
            </div>
        </div>
    );
};

const CancellationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: (password: string, reason: string) => void; movement: VehicleMovement | null; }> = ({ isOpen, onClose, onConfirm, movement }) => {
    const { cancellationReasons } = useData();
    const [password, setPassword] = useState('');
    const [reason, setReason] = useState('');
    useEffect(() => { if (isOpen) { setPassword(''); setReason(cancellationReasons[0]?.reason || ''); } }, [isOpen, cancellationReasons]);
    if (!isOpen || !movement) return null;
    const handleConfirm = () => { if (!reason && cancellationReasons.length > 0) { alert('Por favor, selecione um motivo.'); return; } onConfirm(password, reason); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
                <h3 className="text-lg font-bold text-red-600">Confirmar Exclusão de Entrada</h3><p>Você está prestes a excluir a entrada do veículo de placa <strong className="font-mono">{movement.plate}</strong>. Esta ação não pode ser desfeita.</p>
                {cancellationReasons.length > 0 && (<div><label className="block text-sm font-medium">Motivo do Cancelamento</label><select value={reason} onChange={e => setReason(e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1">{cancellationReasons.map(r => <option key={r.id} value={r.reason}>{r.reason}</option>)}</select></div>)}
                <div><label className="block text-sm font-medium">Senha de Cancelamento</label><input type="password" value={password} onChange={e => setPassword(e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" /></div>
                <div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700"><button onClick={onClose} className="py-2 px-4 bg-slate-200 dark:bg-slate-600 rounded hover:bg-slate-300">Cancelar</button><button onClick={handleConfirm} className="py-2 px-4 bg-red-600 text-white rounded hover:bg-red-700">Confirmar Exclusão</button></div>
            </div>
        </div>
    );
};
const RegisterMonthlyPaymentModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { customers, setCustomers, setMonthlyPaymentLogs, paymentMethods } = useData();
    const { loggedInUser } = useAuth();
    const defaultPaymentMethod = paymentMethods.find(p => p.isDefault)?.name || paymentMethods[0]?.name || 'DINHEIRO';
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
    const [paymentAmount, setPaymentAmount] = useState<number | string>('');
    const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const monthlyCustomers = useMemo(() => customers.filter(c => c.isMensalista), [customers]);
    const searchResults = useMemo(() => {
        if (!searchTerm) return [];
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return monthlyCustomers.filter(c =>
            (c.name || '').toLowerCase().includes(lowerCaseSearchTerm) ||
            (c.plate || '').toLowerCase().includes(lowerCaseSearchTerm)
        ).slice(0, 5);
    }, [searchTerm, monthlyCustomers]);

    const handleRegisterPayment = () => {
        if (!selectedCustomer) {
            setShowError('Nenhum cliente selecionado.');
            return;
        }
        const finalAmount = typeof paymentAmount === 'string' ? parseFloat(paymentAmount) : paymentAmount;
        if (isNaN(finalAmount) || finalAmount < 0) {
            setShowError('Por favor, insira um valor de pagamento válido.');
            return;
        }

        const newLog: MonthlyPaymentLog = {
            id: new Date().toISOString(),
            customerId: selectedCustomer.id,
            customerName: selectedCustomer.name,
            paymentDate: new Date(),
            amountPaid: finalAmount,
            operator: loggedInUser!.name,
            paymentMethod: paymentMethod,
        };
        setMonthlyPaymentLogs(prev => [...prev, newLog]);
        setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, lastPayment: new Date().toISOString().split('T')[0] } : c));

        // Mostrar sucesso
        setSuccessMessage(`Pagamento de ${finalAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} para ${selectedCustomer.name} via ${paymentMethod} registrado com sucesso!`);
        setShowSuccess(true);

        // Fechar após 2 segundos com restauração de foco
        setTimeout(() => {
            setShowSuccess(false);
            setSelectedCustomer(null);
            setSearchTerm('');
            onClose();

            // Restaurar foco ao campo de placa
            requestAnimationFrame(() => {
                const plateInput = document.querySelector('input[name="plate"]') as HTMLInputElement;
                if (plateInput) {
                    plateInput.focus();
                    plateInput.select();
                }
            });
        }, 2000);
    };

    useEffect(() => {
        if (!isOpen) {
            setSearchTerm('');
            setSelectedCustomer(null);
            setPaymentAmount('');
            setPaymentMethod(defaultPaymentMethod);
            setShowSuccess(false);
            setShowError('');
        }
    }, [isOpen, defaultPaymentMethod]);

    useEffect(() => {
        if (selectedCustomer) {
            setPaymentAmount(selectedCustomer.monthlyFee || '');
        }
    }, [selectedCustomer]);

    // Limpar erros após 3 segundos
    useEffect(() => {
        if (showError) {
            const timer = setTimeout(() => setShowError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [showError]);

    if (!isOpen) return null;

    // Modal de sucesso
    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center space-y-4">
                    <div className="text-green-600 dark:text-green-400 text-6xl">✓</div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Pagamento Registrado!</h3>
                    <p className="text-slate-600 dark:text-slate-300">{successMessage}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold">Registrar Pagamento de Mensalista</h2>
                    <button onClick={onClose} className="text-3xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">&times;</button>
                </div>

                {/* Mensagem de erro */}
                {showError && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                        {showError}
                    </div>
                )}

                {!selectedCustomer ? (
                    <div>
                        <label className="block text-sm font-medium mb-1">Buscar por Nome ou Placa</label>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            placeholder="Digite para buscar..."
                            className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                        />
                        {searchResults.length > 0 && (
                            <ul className="border dark:border-slate-600 rounded mt-2 max-h-48 overflow-y-auto">
                                {searchResults.map(c => (
                                    <li
                                        key={c.id}
                                        onClick={() => { setSelectedCustomer(c); setSearchTerm(''); }}
                                        className="p-2 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700"
                                    >
                                        {c.name} - {c.plate}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : (
                    <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg space-y-4">
                        <div>
                            <p><span className="font-semibold">Cliente:</span> {selectedCustomer.name}</p>
                            <p><span className="font-semibold">Último Pagamento:</span> {selectedCustomer.lastPayment ? new Date(selectedCustomer.lastPayment).toLocaleDateString('pt-BR') : 'Nenhum'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="paymentAmount" className="block text-sm font-medium mb-1">Valor a Pagar (R$)</label>
                                <input
                                    id="paymentAmount"
                                    type="number"
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                                    step="0.01"
                                    placeholder="0,00"
                                />
                            </div>
                            <div>
                                <label htmlFor="paymentMethod" className="block text-sm font-medium mb-1">Forma de Pagamento</label>
                                <select
                                    id="paymentMethod"
                                    value={paymentMethod}
                                    onChange={e => setPaymentMethod(e.target.value)}
                                    className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                                >
                                    {paymentMethods.map(m => (<option key={m.id} value={m.name}>{m.name}</option>))}
                                </select>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Confirme o valor e a forma de pagamento antes de finalizar.</p>
                        <p className="pt-2 text-sm text-blue-600 dark:text-blue-400">Data do pagamento: <strong>{new Date().toLocaleDateString('pt-BR')}</strong>?</p>
                    </div>
                )}

                <div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700">
                    <button onClick={onClose} className="py-2 px-6 bg-slate-200 dark:bg-slate-600 font-semibold rounded hover:bg-slate-300">
                        Cancelar
                    </button>
                    <button
                        onClick={handleRegisterPayment}
                        disabled={!selectedCustomer}
                        className="py-2 px-6 bg-green-600 text-white font-semibold rounded hover:bg-green-700 disabled:bg-slate-400 disabled:cursor-not-allowed"
                    >
                        Confirmar Pagamento
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal para definir Saldo Inicial do dia
const SetOpeningBalanceModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { setCashTransactions, setDailyCashBalances, dailyCashBalances, cashTransactions } = useData();
    const { loggedInUser } = useAuth();
    const [openingBalance, setOpeningBalance] = useState<number | string>('');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState('');

    const todayString = toLocalISOString(new Date());
    const alreadySet = dailyCashBalances.some(b => b.date === todayString);
    const todayOpeningTransaction = cashTransactions.find(t => t.type === 'opening' && toLocalISOString(new Date(t.date)) === todayString);

    const handleSetBalance = () => {
        const amount = typeof openingBalance === 'string' ? parseFloat(openingBalance) : openingBalance;
        if (isNaN(amount) || amount < 0) {
            setShowError('Por favor, insira um valor válido.');
            return;
        }

        // Criar registro de saldo do dia (SOMANDO se já existir)
        const previousBalance = dailyCashBalances.find(b => b.date === todayString)?.openingBalance || 0;
        const newTotal = previousBalance + amount;

        const newBalance: DailyCashBalance = {
            date: todayString,
            openingBalance: newTotal,
            operator: loggedInUser!.name,
        };
        // Remove anterior e adiciona novo total
        setDailyCashBalances(prev => [...prev.filter(b => b.date !== todayString), newBalance]);

        // Criar transação de abertura (APORTE)
        const newTransaction: CashTransaction = {
            id: new Date().toISOString(),
            date: new Date(),
            type: 'opening',
            amount: amount,
            description: alreadySet ? 'Suplementação de Caixa' : 'Saldo Inicial do Dia',
            operator: loggedInUser!.name,
        };
        setCashTransactions(prev => [...prev, newTransaction]);

        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
            requestAnimationFrame(() => {
                const plateInput = document.querySelector('input[name="plate"]') as HTMLInputElement;
                if (plateInput) {
                    plateInput.focus();
                    plateInput.select();
                }
            });
        }, 1500);
    };

    useEffect(() => {
        if (!isOpen) {
            setOpeningBalance('');
            setShowSuccess(false);
            setShowError('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (showError) {
            const timer = setTimeout(() => setShowError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [showError]);

    if (!isOpen) return null;

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center space-y-4">
                    <div className="text-green-600 dark:text-green-400 text-6xl">✓</div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Saldo Inicial Definido!</h3>
                    <p className="text-slate-600 dark:text-slate-300">
                        {alreadySet ? 'Aporte' : 'Saldo inicial'} de {(typeof openingBalance === 'number' ? openingBalance : parseFloat(openingBalance)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrado com sucesso.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold">Definir Saldo Inicial</h2>
                    <button onClick={onClose} className="text-3xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">&times;</button>
                </div>

                {showError && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                        {showError}
                    </div>
                )}

                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg space-y-3">
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Data:</p>
                        <p className="font-semibold">{new Date().toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Operador:</p>
                        <p className="font-semibold">{loggedInUser?.name}</p>
                    </div>
                </div>

                {alreadySet && (
                    <div className="bg-blue-100 dark:bg-blue-900/30 border border-blue-400 dark:border-blue-700 text-blue-700 dark:text-blue-300 px-4 py-3 rounded">
                        <p className="font-semibold">Suplementação de Caixa</p>
                        <p className="text-sm mt-1">
                            Saldo Inicial Atual: {dailyCashBalances.find(b => b.date === todayString)?.openingBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00'}
                        </p>
                        <p className="text-sm">O valor abaixo será SOMADO ao saldo existente.</p>
                    </div>
                )}

                <div>
                    <label htmlFor="openingBalance" className="block text-sm font-medium mb-1">{alreadySet ? 'Valor do Aporte (R$)' : 'Saldo Inicial (R$)'}</label>
                    <input
                        id="openingBalance"
                        type="number"
                        value={openingBalance}
                        onChange={e => setOpeningBalance(e.target.value)}
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 text-lg"
                        step="0.01"
                        placeholder="0,00"
                        autoFocus
                    />
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {alreadySet ? 'Este valor será adicionado ao caixa.' : 'Digite o valor em dinheiro que você tem no caixa no início do dia.'}
                    </p>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700">
                    <button onClick={onClose} className="py-2 px-6 bg-slate-200 dark:bg-slate-600 font-semibold rounded hover:bg-slate-300">
                        {alreadySet ? 'Cancelar' : 'Cancelar'}
                    </button>
                    <button
                        onClick={handleSetBalance}
                        className="py-2 px-6 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700"
                    >
                        {alreadySet ? 'Adicionar Aporte' : 'Definir Saldo'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal para adicionar Sangria (retirada de dinheiro do caixa)
const AddWithdrawalModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { setCashTransactions, paymentMethods } = useData();
    const { loggedInUser } = useAuth();
    const [amount, setAmount] = useState<number | string>('');
    const [description, setDescription] = useState('');
    const [paymentMethod, setPaymentMethod] = useState('DINHEIRO');
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState('');

    const handleAddWithdrawal = () => {
        const finalAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(finalAmount) || finalAmount <= 0) {
            setShowError('Por favor, insira um valor válido maior que zero.');
            return;
        }
        if (!description.trim()) {
            setShowError('Por favor, descreva o motivo da sangria.');
            return;
        }

        const newTransaction: CashTransaction = {
            id: new Date().toISOString(),
            date: new Date(),
            type: 'withdrawal',
            amount: finalAmount,
            description: description,
            operator: loggedInUser!.name,
            paymentMethod: paymentMethod,
        };
        setCashTransactions(prev => [...prev, newTransaction]);

        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
            requestAnimationFrame(() => {
                const plateInput = document.querySelector('input[name="plate"]') as HTMLInputElement;
                if (plateInput) {
                    plateInput.focus();
                    plateInput.select();
                }
            });
        }, 1500);
    };

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setDescription('');
            setPaymentMethod('DINHEIRO');
            setShowSuccess(false);
            setShowError('');
        }
    }, [isOpen]);

    useEffect(() => {
        if (showError) {
            const timer = setTimeout(() => setShowError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [showError]);

    if (!isOpen) return null;

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center space-y-4">
                    <div className="text-green-600 dark:text-green-400 text-6xl">✓</div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Sangria Registrada!</h3>
                    <p className="text-slate-600 dark:text-slate-300">
                        Retirada de {(typeof amount === 'number' ? amount : parseFloat(amount)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrada.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold">Registrar Sangria</h2>
                    <button onClick={onClose} className="text-3xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">&times;</button>
                </div>

                {showError && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                        {showError}
                    </div>
                )}

                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Data/Hora:</span>
                        <span className="font-semibold">{new Date().toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Operador:</span>
                        <span className="font-semibold">{loggedInUser?.name}</span>
                    </div>
                </div>

                <div>
                    <label htmlFor="withdrawalAmount" className="block text-sm font-medium mb-1">Valor da Sangria (R$)</label>
                    <input
                        id="withdrawalAmount"
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 text-lg"
                        step="0.01"
                        placeholder="0,00"
                        autoFocus
                    />
                </div>

                <div>
                    <label htmlFor="withdrawalDescription" className="block text-sm font-medium mb-1">Motivo/Descrição</label>
                    <input
                        id="withdrawalDescription"
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                        placeholder="Ex: Depósito banco, Troco, etc."
                    />
                </div>

                <div>
                    <label htmlFor="withdrawalMethod" className="block text-sm font-medium mb-1">Destino</label>
                    <select
                        id="withdrawalMethod"
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                    >
                        <option value="DINHEIRO">Dinheiro</option>
                        <option value="COFRE">Cofre</option>
                        <option value="BANCO">Banco</option>
                        <option value="OUTRO">Outro</option>
                    </select>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700">
                    <button onClick={onClose} className="py-2 px-6 bg-slate-200 dark:bg-slate-600 font-semibold rounded hover:bg-slate-300">
                        Cancelar
                    </button>
                    <button
                        onClick={handleAddWithdrawal}
                        className="py-2 px-6 bg-red-600 text-white font-semibold rounded hover:bg-red-700"
                    >
                        Confirmar Sangria
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal para adicionar Despesa
const AddExpenseModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { setCashTransactions, paymentMethods } = useData();
    const { loggedInUser } = useAuth();
    const defaultPaymentMethod = paymentMethods.find(p => p.isDefault)?.name || 'DINHEIRO';
    const [amount, setAmount] = useState<number | string>('');
    const [description, setDescription] = useState('');
    const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod);
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState('');

    const handleAddExpense = () => {
        const finalAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
        if (isNaN(finalAmount) || finalAmount <= 0) {
            setShowError('Por favor, insira um valor válido maior que zero.');
            return;
        }
        if (!description.trim()) {
            setShowError('Por favor, descreva a despesa.');
            return;
        }

        const newTransaction: CashTransaction = {
            id: new Date().toISOString(),
            date: new Date(),
            type: 'expense',
            amount: finalAmount,
            description: description,
            operator: loggedInUser!.name,
            paymentMethod: paymentMethod,
        };
        setCashTransactions(prev => [...prev, newTransaction]);

        setShowSuccess(true);
        setTimeout(() => {
            setShowSuccess(false);
            onClose();
            requestAnimationFrame(() => {
                const plateInput = document.querySelector('input[name="plate"]') as HTMLInputElement;
                if (plateInput) {
                    plateInput.focus();
                    plateInput.select();
                }
            });
        }, 1500);
    };

    useEffect(() => {
        if (!isOpen) {
            setAmount('');
            setDescription('');
            setPaymentMethod(defaultPaymentMethod);
            setShowSuccess(false);
            setShowError('');
        }
    }, [isOpen, defaultPaymentMethod]);

    useEffect(() => {
        if (showError) {
            const timer = setTimeout(() => setShowError(''), 3000);
            return () => clearTimeout(timer);
        }
    }, [showError]);

    if (!isOpen) return null;

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-8 w-full max-w-md text-center space-y-4">
                    <div className="text-green-600 dark:text-green-400 text-6xl">✓</div>
                    <h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">Despesa Registrada!</h3>
                    <p className="text-slate-600 dark:text-slate-300">
                        Despesa de {(typeof amount === 'number' ? amount : parseFloat(amount)).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} registrada.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-md space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold">Registrar Despesa</h2>
                    <button onClick={onClose} className="text-3xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">&times;</button>
                </div>

                {showError && (
                    <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded">
                        {showError}
                    </div>
                )}

                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg space-y-2">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Data/Hora:</span>
                        <span className="font-semibold">{new Date().toLocaleString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-600 dark:text-slate-400">Operador:</span>
                        <span className="font-semibold">{loggedInUser?.name}</span>
                    </div>
                </div>

                <div>
                    <label htmlFor="expenseAmount" className="block text-sm font-medium mb-1">Valor da Despesa (R$)</label>
                    <input
                        id="expenseAmount"
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        className="w-full p-3 border rounded dark:bg-slate-700 dark:border-slate-600 text-lg"
                        step="0.01"
                        placeholder="0,00"
                        autoFocus
                    />
                </div>

                <div>
                    <label htmlFor="expenseDescription" className="block text-sm font-medium mb-1">Descrição</label>
                    <input
                        id="expenseDescription"
                        type="text"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                        placeholder="Ex: Material de limpeza, Cafezinho, etc."
                    />
                </div>

                <div>
                    <label htmlFor="expenseMethod" className="block text-sm font-medium mb-1">Forma de Pagamento</label>
                    <select
                        id="expenseMethod"
                        value={paymentMethod}
                        onChange={e => setPaymentMethod(e.target.value)}
                        className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600"
                    >
                        {paymentMethods.map(m => (
                            <option key={m.id} value={m.name}>{m.name}</option>
                        ))}
                    </select>
                </div>

                <div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700">
                    <button onClick={onClose} className="py-2 px-6 bg-slate-200 dark:bg-slate-600 font-semibold rounded hover:bg-slate-300">
                        Cancelar
                    </button>
                    <button
                        onClick={handleAddExpense}
                        className="py-2 px-6 bg-orange-600 text-white font-semibold rounded hover:bg-orange-700"
                    >
                        Confirmar Despesa
                    </button>
                </div>
            </div>
        </div>
    );
};

// Modal de Fechamento de Caixa Completo
// Modal de Fechamento de Caixa Completo
const CashClosingModal: React.FC<{ isOpen: boolean, onClose: () => void }> = ({ isOpen, onClose }) => {
    const { movements, monthlyPaymentLogs, cashTransactions, dailyCashBalances, couponPrintConfig, printerConfig } = useData();
    const [isConfirmingClosing, setIsConfirmingClosing] = useState(false);

    // Reset state when opening
    useEffect(() => {
        if (isOpen) setIsConfirmingClosing(false);
    }, [isOpen]);

    const handleConfirmClose = async (shouldPrint: boolean) => {
        if (shouldPrint) {
            await printCashClosingReport(summary, couponPrintConfig, printerConfig);
        }
        // Force Logout / Restart App
        window.location.reload();
    };

    const summary = useMemo(() => {
        if (!isOpen) return {
            totalsByPaymentMethod: {},
            grandTotal: 0,
            totalExits: 0,
            totalEntries: 0,
            currentlyParked: 0,
            openingBalance: 0,
            monthlyPayments: 0,
            withdrawals: 0,
            expenses: 0,
            netCash: 0,
            todayTransactions: [],
            todayMonthlyPayments: [],
        };

        const todayString = toLocalISOString(new Date());

        // Saldo inicial
        const todayBalance = dailyCashBalances.find(b => b.date === todayString);
        const openingBalance = todayBalance?.openingBalance || 0;

        // Movimentações do dia
        const movementsTodayExits = movements.filter(m =>
            m.status === 'completed' &&
            m.exitTime &&
            toLocalISOString(new Date(m.exitTime)) === todayString
        );

        const movementsTodayEntries = movements.filter(m =>
            toLocalISOString(new Date(m.entryTime)) === todayString
        );

        const currentlyParked = movements.filter(m => m.status === 'parked').length;

        // Total por forma de pagamento (saídas de veículos)
        const totalsByPaymentMethod: { [key: string]: number } = {};
        const rotativoTotalsByMethod: { [key: string]: number } = {};
        const mensalistaTotalsByMethod: { [key: string]: number } = {};
        let grandTotal = 0;
        let paidExitsCount = 0;

        movementsTodayExits.forEach(m => {
            const paid = typeof m.totalPaid === 'number' ? m.totalPaid : Number(m.totalPaid);
            if (m.paymentMethod && Number.isFinite(paid) && paid > 0) {
                totalsByPaymentMethod[m.paymentMethod] = (totalsByPaymentMethod[m.paymentMethod] || 0) + paid;
                rotativoTotalsByMethod[m.paymentMethod] = (rotativoTotalsByMethod[m.paymentMethod] || 0) + paid;
                grandTotal += paid;
                paidExitsCount++;
            }
        });

        // Pagamentos mensalistas do dia
        const todayMonthlyPayments = monthlyPaymentLogs.filter(log =>
            toLocalISOString(new Date(log.paymentDate)) === todayString
        );
        const monthlyPaymentsTotal = todayMonthlyPayments.reduce((sum, log) => sum + log.amountPaid, 0);

        // Agrupar pagamentos mensalistas por forma de pagamento
        todayMonthlyPayments.forEach(log => {
            const method = log.paymentMethod || 'DINHEIRO';
            totalsByPaymentMethod[method] = (totalsByPaymentMethod[method] || 0) + log.amountPaid;
            mensalistaTotalsByMethod[method] = (mensalistaTotalsByMethod[method] || 0) + log.amountPaid;
        });

        // Transações de caixa do dia
        const todayTransactions = cashTransactions.filter(t =>
            toLocalISOString(new Date(t.date)) === todayString
        );

        const withdrawalsTotal = todayTransactions
            .filter(t => t.type === 'withdrawal')
            .reduce((sum, t) => sum + t.amount, 0);

        const expensesTotal = todayTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);

        // Caixa líquido esperado
        const totalIn = grandTotal + monthlyPaymentsTotal;
        const totalOut = withdrawalsTotal + expensesTotal;
        const netCash = openingBalance + totalIn - totalOut;

        return {
            totalsByPaymentMethod,
            rotativoTotalsByMethod,
            mensalistaTotalsByMethod,
            grandTotal: totalIn,
            rotativoTotal: grandTotal,
            totalExits: paidExitsCount,
            totalEntries: movementsTodayEntries.length,
            currentlyParked,
            openingBalance,
            monthlyPayments: monthlyPaymentsTotal,
            withdrawals: withdrawalsTotal,
            expenses: expensesTotal,
            netCash,
            todayTransactions,
            todayMonthlyPayments,
        };
    }, [movements, monthlyPaymentLogs, cashTransactions, dailyCashBalances, isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-2xl space-y-4 max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">
                        Fechamento de Caixa - {new Date().toLocaleDateString('pt-BR')}
                    </h2>
                    <button onClick={onClose} className="text-3xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">&times;</button>
                </div>

                {/* Saldo Inicial */}
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">💰 Saldo Inicial</h3>
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {summary.openingBalance.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                </div>

                {/* Entradas de Caixa */}
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex justify-between items-center">
                        <span>💵 Entradas</span>
                        <span className="text-xs font-normal opacity-70">Total do Dia</span>
                    </h3>

                    <div className="space-y-4">
                        {/* Rotativo */}
                        {summary.rotativoTotal > 0 && (
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Rotativo:</p>
                                {Object.entries(summary.rotativoTotalsByMethod).map(([method, total]) => (
                                    total > 0 && (
                                        <div key={`rot-${method}`} className="flex justify-between items-center text-sm pl-2 border-l-2 border-green-200 dark:border-green-800">
                                            <span className="text-slate-600 dark:text-slate-300">{method}:</span>
                                            <span className="font-semibold font-mono">
                                                {Number(total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}

                        {/* Mensalista */}
                        {summary.monthlyPayments > 0 && (
                            <div className="space-y-1">
                                <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">Mensalistas:</p>
                                {Object.entries(summary.mensalistaTotalsByMethod).map(([method, total]) => (
                                    total > 0 && (
                                        <div key={`mens-${method}`} className="flex justify-between items-center text-sm pl-2 border-l-2 border-blue-200 dark:border-blue-800">
                                            <span className="text-slate-600 dark:text-slate-300">{method}:</span>
                                            <span className="font-semibold font-mono">
                                                {Number(total).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                    )
                                ))}
                            </div>
                        )}

                        {summary.grandTotal === 0 && (
                            <p className="text-slate-500 text-sm text-center py-2">Nenhum recebimento hoje</p>
                        )}
                    </div>

                    <div className="border-t border-green-200 dark:border-green-800/50 pt-2 mt-2">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Total Recebido:</span>
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                {summary.grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Saídas de Caixa */}
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg space-y-3">
                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-2">💸 Saídas Detalhadas</h3>

                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {summary.todayTransactions.length > 0 ? (
                            summary.todayTransactions.map((t, idx) => (
                                <div key={t.id || idx} className="text-xs border-b border-red-100 dark:border-red-900/30 pb-2">
                                    <div className="flex justify-between font-bold text-red-700 dark:text-red-400">
                                        <span>{t.type === 'withdrawal' ? 'SANGRIA' : 'DESPESA'}</span>
                                        <span>{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                                    </div>
                                    <p className="text-slate-500 italic mt-0.5">{t.description}</p>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-500 text-sm text-center">Nenhuma saída registrada</p>
                        )}
                    </div>

                    <div className="border-t border-red-200 dark:border-red-800/50 pt-2">
                        <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-700 dark:text-slate-200">Total Saídas:</span>
                            <span className="text-xl font-bold text-red-600 dark:text-red-400">
                                {(summary.withdrawals + summary.expenses).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Saldo Final Esperado */}
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-800 dark:text-purple-300 mb-2">💼 Saldo em Caixa (Esperado)</h3>
                    <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                        {summary.netCash.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Saldo Inicial + Entradas - Saídas
                    </p>
                </div>

                {/* Estatísticas */}
                <div className="border-t dark:border-slate-700 pt-4 grid grid-cols-3 gap-4 text-center">
                    <div>
                        <p className="text-sm text-slate-500">Entradas Hoje</p>
                        <p className="text-xl font-semibold">{summary.totalEntries}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Saídas Hoje</p>
                        <p className="text-xl font-semibold">{summary.totalExits}</p>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">No Pátio</p>
                        <p className="text-xl font-semibold">{summary.currentlyParked}</p>
                    </div>
                </div>

                {/* Botões */}
                {/* Botões */}
                {!isConfirmingClosing ? (
                    <div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700">
                        <button onClick={onClose} className="py-2 px-6 bg-slate-200 dark:bg-slate-600 font-semibold rounded hover:bg-slate-300">
                            Cancelar
                        </button>
                        <button
                            onClick={() => printCashClosingReport(summary, couponPrintConfig, printerConfig)}
                            className="py-2 px-6 bg-blue-100 text-blue-700 font-semibold rounded hover:bg-blue-200 inline-flex items-center gap-2"
                        >
                            <PrinterIcon className="w-4 h-4" /> Apenas Imprimir
                        </button>
                        <button
                            onClick={() => setIsConfirmingClosing(true)}
                            className="py-2 px-6 bg-red-600 text-white font-semibold rounded hover:bg-red-700 shadow-md transform transition hover:scale-105"
                        >
                            Encerrar Caixa
                        </button>
                    </div>
                ) : (
                    <div className="pt-4 border-t border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 p-4 rounded-lg -mx-2 mb-2 animate-in fade-in slide-in-from-bottom-2">
                        <h4 className="text-lg font-bold text-red-700 dark:text-red-400 mb-2 flex items-center gap-2">
                            ⚠️ Confirmação de Fechamento
                        </h4>
                        <p className="text-slate-700 dark:text-slate-300 mb-4 text-sm">
                            Esta ação irá <strong>encerrar o expediente</strong> de hoje e fazer logout do sistema.
                            Você não poderá reabrir o caixa com a mesma data.
                        </p>
                        <p className="font-semibold text-slate-800 dark:text-slate-200 mb-4">
                            Deseja imprimir o relatório antes de sair?
                        </p>

                        <div className="flex flex-col gap-3">
                            <button
                                onClick={() => handleConfirmClose(true)}
                                className="w-full py-3 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 flex justify-center items-center gap-2 shadow-sm"
                            >
                                <PrinterIcon className="w-5 h-5" /> Sim, Imprimir e Sair
                            </button>
                            <button
                                onClick={() => handleConfirmClose(false)}
                                className="w-full py-3 bg-slate-200 dark:bg-slate-700 font-semibold rounded hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200"
                            >
                                Não, Apenas Sair
                            </button>
                            <button
                                onClick={() => setIsConfirmingClosing(false)}
                                className="w-full py-2 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 hover:underline mt-2"
                            >
                                Cancelar Volta
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ConfirmEntryModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; }> = ({ isOpen, onClose, onConfirm }) => {
    const [selected, setSelected] = useState<'yes' | 'no'>('yes');
    const { modules, movements } = useData();
    // Getting the latest registered movement (assuming it's the first in the list as register logic prepends it)
    const lastMovement = movements[0];

    useEffect(() => {
        if (!isOpen) {
            setSelected('yes');
            return;
        }

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
                setSelected(prev => prev === 'yes' ? 'no' : 'yes');
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (selected === 'yes') onConfirm();
                else onClose();
            } else if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, selected, onConfirm, onClose]);

    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1001]" style={{ pointerEvents: 'auto' }}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center text-blue-600">
                    <h3 className="text-xl font-bold">Veículo Registrado!</h3>
                </div>
                <p className="text-slate-600 dark:text-slate-300">Deseja imprimir o cupom de entrada agora?</p>
                <div className="flex gap-4 pt-4">
                    <button
                        onClick={onClose}
                        className={`flex-1 py-3 px-4 font-semibold rounded-lg transition-colors ${selected === 'no' ? 'bg-slate-300 dark:bg-slate-500 ring-2 ring-blue-500' : 'bg-slate-200 dark:bg-slate-600 hover:bg-slate-300'}`}
                    >
                        Não
                    </button>

                    {modules?.whatsapp && lastMovement?.customerPhone && (
                        <button
                            onClick={() => {
                                const msg = `*Ticket de Estacionamento*\n\nPlaca: *${lastMovement.plate}*\nEntrada: ${new Date(lastMovement.entryTime).toLocaleString('pt-BR')}\nCupom: ${lastMovement.coupon}`;
                                sendWhatsAppMessage(lastMovement.customerPhone!, msg);
                                onClose();
                            }}
                            className="py-3 px-4 font-semibold rounded-lg bg-green-600 hover:bg-green-700 text-white flex items-center justify-center"
                            title="Enviar Ticket via WhatsApp"
                        >
                            <ChatIcon />
                        </button>
                    )}

                    <button
                        onClick={onConfirm}
                        className={`flex-1 py-3 px-4 font-semibold rounded-lg transition-colors ${selected === 'yes' ? 'bg-blue-700 ring-2 ring-blue-300' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                    >
                        Sim, Imprimir
                    </button>
                </div>
                <p className="text-[10px] text-center text-slate-400 mt-2">Use as setas ← → para alternar e ENTER para escolher</p>
            </div>
        </div>
    );
};

const PaymentModal: React.FC<{ movement: VehicleMovement | null; onClose: () => void; onPaymentSuccess: (movement: VehicleMovement) => void; }> = ({ movement, onClose, onPaymentSuccess }) => {
    const { setMovements, paymentMethods, pricingConfig, agreements, vehicleCategories, nfseConfig } = useData();
    const { loggedInUser } = useAuth();
    const defaultPaymentMethod = useMemo(() => paymentMethods.find(p => p.isDefault)?.name || paymentMethods[0]?.name || 'DINHEIRO', [paymentMethods]);
    const [discount, setDiscount] = useState(0); const [surcharge, setSurcharge] = useState(0); const [amountReceived, setAmountReceived] = useState(0); const [paymentMethod, setPaymentMethod] = useState(defaultPaymentMethod); const [customerCpf, setCustomerCpf] = useState('');
    useEffect(() => { if (movement) { setDiscount(0); setSurcharge(0); setAmountReceived(0); setPaymentMethod(defaultPaymentMethod); setCustomerCpf(''); } }, [movement, defaultPaymentMethod]);

    const { duration, basePrice, servicesPrice, totalPayable, change, agreementDiscountValue, agreementDescription, categoryDescription, priceBreakdownDescription } = useMemo(() => {
        if (!movement) return { duration: '0h 0m', basePrice: 0, servicesPrice: 0, totalPayable: 0, change: 0, agreementDiscountValue: 0, agreementDescription: '', categoryDescription: '', priceBreakdownDescription: '' };
        const exitTime = new Date(); const entryTime = new Date(movement.entryTime);
        const durationMillis = exitTime.getTime() - entryTime.getTime();
        const hours = Math.floor(durationMillis / (1000 * 60 * 60)); const minutes = Math.floor((durationMillis % (1000 * 60 * 60)) / (1000 * 60)); const durationStr = `${hours}h ${minutes}m`;

        const agreement = agreements.find(a => a.associatedPlates.toUpperCase().split(',').map(p => p.trim()).includes(movement.plate.toUpperCase()));

        const { price: rawCalculatedPrice, description: priceDesc } = calculateDetailedPrice(entryTime, exitTime, pricingConfig);

        // For mensalistas, the parking stays base price is 0, we only charge for services.
        const basePrice = movement.chargeType === ChargeType.MENSAL ? 0 : rawCalculatedPrice;

        let finalAgreementDiscount = 0; let finalAgreementDescription = ''; let finalCategoryDescription = '';

        const category = vehicleCategories.find(cat => cat.name === movement.vehicleType) || { id: 'default', name: VehicleType.CARRO };

        let finalPrice = basePrice;

        if (agreement && agreement.discountType === 'fixed') {
            finalPrice = agreement.discountValue;
            finalAgreementDescription = `Convênio ${agreement.name} (Valor Fixo)`;
        } else {
            // Removida lógica de multiplicadores por categoria conforme solicitado

            if (agreement && agreement.discountType === 'percentage') {
                finalAgreementDiscount = (finalPrice * agreement.discountValue) / 100;
                finalAgreementDescription = `Convênio ${agreement.name} (${agreement.discountValue}%)`;
            }
        }

        const sPrice = (movement.services || []).reduce((sum, s) => sum + s.price, 0);
        const total = finalPrice - finalAgreementDiscount + sPrice - discount + surcharge;
        const finalChange = amountReceived > 0 ? amountReceived - total : 0;

        return { duration: durationStr, basePrice: finalPrice, servicesPrice: sPrice, totalPayable: total, change: finalChange, agreementDiscountValue: finalAgreementDiscount, agreementDescription: finalAgreementDescription, categoryDescription: finalCategoryDescription, priceBreakdownDescription: priceDesc };
    }, [movement, discount, surcharge, amountReceived, pricingConfig, agreements, vehicleCategories]);

    if (!movement) return null;
    const handleConfirmPayment = () => {
        const updatedMovement: VehicleMovement = { ...movement, status: 'completed', exitTime: new Date(), totalPaid: totalPayable, discount: discount + agreementDiscountValue, surcharge: surcharge, paymentMethod: paymentMethod, customerCpfOnReceipt: customerCpf, operatorExit: loggedInUser!.name, };
        setMovements(prev => prev.map(m => (m.id === movement.id ? updatedMovement : m))); onPaymentSuccess(updatedMovement); onClose();

        // Trigger NFSE if enabled
        if (nfseConfig.autoEmit && nfseConfig.cnpj) {
            if (window.electronAPI && window.electronAPI.emitNfse) {
                window.electronAPI.emitNfse(updatedMovement, nfseConfig).catch(err => {
                    console.error("Erro ao disparar emissão de NFSE:", err);
                });
            }
        }
    };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 md:p-8 w-full max-w-3xl space-y-6 transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-start"><h2 className="text-2xl font-bold text-slate-700 dark:text-slate-200 flex items-center gap-3"><ReceiptIcon className="w-8 h-8 text-blue-600" />Registrar Saída e Pagamento</h2><button onClick={onClose} className="text-3xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">&times;</button></div>
                <div className="bg-slate-100 dark:bg-slate-700/50 p-4 rounded-lg grid grid-cols-2 md:grid-cols-4 gap-4 text-center"><div><span className="block text-sm text-slate-500">Placa</span><strong className="text-lg font-mono">{movement.plate}</strong></div><div><span className="block text-sm text-slate-500">Entrada</span><strong className="text-lg">{new Date(movement.entryTime).toLocaleTimeString('pt-BR')}</strong></div><div><span className="block text-sm text-slate-500">Permanência</span><strong className="text-lg">{duration}</strong></div><div><span className="block text-sm text-slate-500">Categoria</span><strong className="text-lg">{movement.vehicleType} {categoryDescription}</strong></div></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><div className="space-y-4"><div className="border-b dark:border-slate-600 pb-3 space-y-1"><h4 className="text-sm font-medium">Detalhamento</h4><div className="flex justify-between text-sm"><span>Valor Tabela:</span> <span>{basePrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
                    {priceBreakdownDescription && <div className="text-xs text-slate-500 italic text-right">{priceBreakdownDescription}</div>}
                    {agreementDescription && <div className="flex justify-between text-sm text-green-600 dark:text-green-400"><span>{agreementDescription}:</span> <span>- {agreementDiscountValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>}{movement.services && movement.services.length > 0 && (<>{movement.services.map(s => (<div key={s.id} className="flex justify-between text-sm"><span>Serviço: {s.name}</span><span>+ {s.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>))}</>)}</div><div><label className="block text-sm font-medium">Forma de Pagamento</label><select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600">{paymentMethods.map(m => <option key={m.id} value={m.name}>{m.name}</option>)}</select></div><div><label className="block text-sm font-medium">Desconto Manual (-)</label><input type="number" value={discount} onClick={(e) => e.currentTarget.select()} onChange={e => setDiscount(parseFloat(e.target.value) || 0)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /></div><div><label className="block text-sm font-medium">Acréscimo (+)</label><input type="number" value={surcharge} onClick={(e) => e.currentTarget.select()} onChange={e => setSurcharge(parseFloat(e.target.value) || 0)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /></div></div><div className="bg-blue-50 dark:bg-slate-900/50 p-4 rounded-lg flex flex-col justify-between space-y-4"><div className="text-right"><p className="text-slate-500">Total a Pagar</p><p className="text-4xl font-bold text-blue-600">{totalPayable.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div><div className="grid grid-cols-2 gap-2"><div><label className="block text-sm font-medium">Valor Recebido</label><input type="number" value={amountReceived || ''} onClick={(e) => e.currentTarget.select()} placeholder="0,00" onChange={e => setAmountReceived(parseFloat(e.target.value) || 0)} className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /></div><div className="text-right"><p className="text-slate-500">Troco</p><p className="text-2xl font-bold">{change.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p></div></div></div></div>
                <div><label className="block text-sm font-medium">CPF no Cupom (Opcional)</label><input type="text" value={customerCpf} onChange={e => setCustomerCpf(maskCPF(e.target.value))} placeholder="000.000.000-00" className="w-full mt-1 p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /></div>
                <div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700"><button onClick={onClose} className="py-2 px-6 bg-slate-200 dark:bg-slate-600 font-semibold rounded hover:bg-slate-300 dark:hover:bg-slate-500">Cancelar</button><button onClick={handleConfirmPayment} className="py-2 px-6 bg-green-600 text-white font-semibold rounded hover:bg-green-700">Confirmar Pagamento</button></div>
            </div>
        </div>
    );
};
const EditMovementModal: React.FC<{ movement: VehicleMovement | null; onClose: () => void; onSave: (updatedMovement: VehicleMovement) => void; }> = ({ movement, onClose, onSave }) => {
    const { services: allServices } = useData();
    const [editableMovement, setEditableMovement] = useState<VehicleMovement | null>(null);
    const [isSaved, setIsSaved] = useState(false);

    useEffect(() => {
        if (movement) {
            setEditableMovement({
                ...movement,
                customerType: movement.customerType || CustomerType.ROTATIVO
            });
        }
    }, [movement]);

    if (!movement || !editableMovement) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let { name, value } = e.target;

        if (name === 'plate') {
            value = value.toUpperCase();
        } else if (name === 'model' || name === 'customerName') {
            value = capitalizeFirstLetter(value);
        }

        setEditableMovement(prev => {
            if (!prev) return null;
            const newMovement = { ...prev, [name]: value };
            // Se o tipo de cliente for alterado, devemos também atualizar o tipo de cobrança.
            if (name === 'customerType') {
                newMovement.chargeType = getChargeTypeFromCustomerType(value as CustomerType);
            }
            return newMovement;
        });
    };

    const handleServiceToggle = (service: Service) => {
        setEditableMovement(prev => {
            if (!prev) return null;
            const currentServices = prev.services || [];
            const isSelected = currentServices.some(s => s.id === service.id);
            const newServices = isSelected ? currentServices.filter(s => s.id !== service.id) : [...currentServices, service];
            return { ...prev, services: newServices };
        });
    };

    const handleSaveChanges = () => {
        if (editableMovement) {
            // Garante que o tipo de cobrança esteja correto com base no tipo de cliente antes de salvar.
            const finalMovement = {
                ...editableMovement,
                chargeType: getChargeTypeFromCustomerType(editableMovement.customerType as CustomerType)
            };
            onSave(finalMovement);
            setIsSaved(true);
            setTimeout(() => {
                setIsSaved(false);
                onClose();
            }, 1500);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold">Editar Entrada</h2>
                    <button onClick={onClose} className="text-3xl text-slate-400 hover:text-slate-600">&times;</button>
                </div>
                <div className="space-y-4">
                    <fieldset className="border dark:border-slate-600 rounded-lg p-4">
                        <legend className="px-2 font-semibold text-sm">Dados Principais</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <input name="plate" value={editableMovement.plate} onChange={handleChange} placeholder="Placa" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" required />
                            <input name="model" value={editableMovement.model} onChange={handleChange} placeholder="Modelo" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                            <input name="customerName" value={editableMovement.customerName || ''} onChange={handleChange} placeholder="Nome do Cliente" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                            <input name="customerPhone" value={editableMovement.customerPhone || ''} onChange={handleChange} placeholder="Telefone" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" />
                            <select name="customerType" value={editableMovement.customerType} onChange={handleChange} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
                                {Object.values(CustomerType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                            <select name="vehicleType" value={editableMovement.vehicleType} onChange={handleChange} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600">
                                {Object.values(VehicleType).map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                    </fieldset>
                    <div>
                        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Serviços Adicionais</label>
                        <div className="space-y-2 max-h-48 overflow-y-auto p-2 border rounded-md dark:border-slate-600">
                            {allServices.map(service => (
                                <div key={service.id} className="flex items-center">
                                    <input type="checkbox" id={`edit-service-${service.id}`} checked={(editableMovement.services || []).some(s => s.id === service.id)} onChange={() => handleServiceToggle(service)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                    <label htmlFor={`edit-service-${service.id}`} className="ml-3 block text-sm w-full">{service.name} - {service.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700">
                    <button onClick={onClose} className="py-2 px-6 bg-slate-200 dark:bg-slate-600 font-semibold rounded hover:bg-slate-300">Cancelar</button>
                    <button onClick={handleSaveChanges} disabled={isSaved} className={`py-2 px-6 font-semibold rounded transition-colors ${isSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{isSaved ? 'Salvo!' : 'Salvar Alterações'}</button>
                </div>
            </div>
        </div>
    );
};
const StatCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode; color: string; }> = ({ title, value, icon, color }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md flex items-center space-x-3 transition-transform hover:scale-105">
        <div className={`rounded-full p-2 ${color}`}>{icon}</div>
        <div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
        </div>
    </div>
);


// --- Movements (from components/Movements.tsx) ---
const Movements: React.FC = () => {
    const { movements, setMovements, pricingConfig } = useData();
    const parkedVehicles = movements.filter(m => m.status === 'parked');

    const handleRegisterExit = (id: string) => {
        setMovements(prev => prev.map(m => {
            if (m.id === id) {
                const exitTime = new Date();
                const entryTime = new Date(m.entryTime);
                const { price } = calculateDetailedPrice(entryTime, exitTime, pricingConfig);
                return { ...m, status: 'completed', exitTime, totalPaid: price };
            }
            return m;
        }));
    };

    const totalSaidas = movements.filter(m => m.status === 'completed' && m.exitTime && new Date(m.exitTime).toDateString() === new Date().toDateString()).length;
    const totalGeral = movements.filter(m => m.exitTime && new Date(m.exitTime).toDateString() === new Date().toDateString()).reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">Veículos no Pátio</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="border-b dark:border-slate-600">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-slate-500">Cupom</th>
                                <th className="p-3 text-sm font-semibold text-slate-500">Placa</th>
                                <th className="p-3 text-sm font-semibold text-slate-500">Tipo</th>
                                <th className="p-3 text-sm font-semibold text-slate-500">Modelo</th>
                                <th className="p-3 text-sm font-semibold text-slate-500">Entrada</th>
                                <th className="p-3 text-sm font-semibold text-slate-500">Cliente</th>
                                <th className="p-3 text-sm font-semibold text-slate-500">Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {parkedVehicles.map(mov => (
                                <tr key={mov.id} className="border-b dark:border-slate-700 last:border-b-0 hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3">{mov.coupon}</td>
                                    <td className="p-3 font-mono">{mov.plate}</td>
                                    <td className="p-3">{mov.vehicleType}</td>
                                    <td className="p-3">{mov.model}</td>
                                    <td className="p-3">{new Date(mov.entryTime).toLocaleTimeString('pt-BR')}</td>
                                    <td className="p-3">{mov.customerName}</td>
                                    <td className="p-3 flex space-x-2">
                                        <button onClick={() => handleRegisterExit(mov.id)} className="text-green-600 hover:text-green-800 text-sm font-medium p-1">
                                            Registrar Saída (Simples)
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {parkedVehicles.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="text-center p-6 text-slate-500">Nenhum veículo no pátio.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md flex justify-around text-center">
                <div className="font-medium"><span className="text-slate-500">Estacionados no momento:</span> <span className="font-bold text-blue-600">{parkedVehicles.length}</span></div>
                <div className="font-medium"><span className="text-slate-500">Total de Saídas hoje:</span> <span className="font-bold text-green-600">{totalSaidas}</span></div>
                <div className="font-medium"><span className="text-slate-500">Total Geral (dia):</span> <span className="font-bold text-indigo-600">{totalGeral.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span></div>
            </div>
        </div>
    );
};

// --- Customers (from components/Customers.tsx) ---
const Customers: React.FC = () => {
    const { customers, setCustomers, movements } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [activeTab, setActiveTab] = useState<'clientes' | 'todos'>('clientes');
    const formRef = useRef<HTMLDivElement>(null);

    const filteredCustomers = useMemo(() => {
        return customers.filter(c =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.cpfCnpj.includes(searchTerm)
        ).sort((a, b) => a.name.localeCompare(b.name));
    }, [customers, searchTerm]);

    const allVehicles = useMemo(() => {
        const vehicleMap = new Map<string, { plate: string, model: string, type: string, visits: number, lastVisit: Date | null, customerName: string }>();

        customers.forEach(c => {
            if (c.plate) {
                vehicleMap.set(c.plate.toUpperCase(), {
                    plate: c.plate.toUpperCase(),
                    model: c.model || 'N/D',
                    type: c.isMensalista ? 'Mensalista' : 'Cadastrado',
                    visits: 0,
                    lastVisit: null,
                    customerName: c.name,
                });
            }
            if (c.plate2) {
                vehicleMap.set(c.plate2.toUpperCase(), {
                    plate: c.plate2.toUpperCase(),
                    model: c.model || 'N/D',
                    type: c.isMensalista ? 'Mensalista' : 'Cadastrado',
                    visits: 0,
                    lastVisit: null,
                    customerName: c.name,
                });
            }
        });

        movements.forEach(m => {
            const plate = m.plate.toUpperCase();
            const entryTime = new Date(m.entryTime);
            if (vehicleMap.has(plate)) {
                const data = vehicleMap.get(plate)!;
                data.visits += 1;
                if (!data.lastVisit || entryTime > data.lastVisit) data.lastVisit = entryTime;
                if ((!data.model || data.model === 'N/D') && m.model) data.model = m.model;
            } else {
                vehicleMap.set(plate, {
                    plate: plate,
                    model: m.model || 'N/D',
                    type: 'Rotativo',
                    visits: 1,
                    lastVisit: entryTime,
                    customerName: m.customerName || 'AVULSO',
                });
            }
        });

        return Array.from(vehicleMap.values())
            .filter(v => v.plate.includes(searchTerm.toUpperCase()) || v.customerName.toUpperCase().includes(searchTerm.toUpperCase()) || v.model.toUpperCase().includes(searchTerm.toUpperCase()))
            .sort((a, b) => {
                if (a.lastVisit && b.lastVisit) return b.lastVisit.getTime() - a.lastVisit.getTime();
                if (a.lastVisit) return -1;
                if (b.lastVisit) return 1;
                return b.visits - a.visits;
            });
    }, [customers, movements, searchTerm]);

    const handleSave = (customer: Omit<Customer, 'id'> & { id?: string }) => {
        if (customer.id) {
            setCustomers(prev => prev.map(c => c.id === customer.id ? (customer as Customer) : c));
        } else {
            setCustomers(prev => [...prev, { ...customer, id: new Date().toISOString() } as Customer]);
        }
        setTimeout(() => {
            setEditingCustomer(null);
            setIsCreating(false);
        }, 1800);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
            setCustomers(prev => prev.filter(c => c.id !== id));
        }
    }

    const handleEditClick = (customer: Customer) => {
        setIsCreating(false);
        setEditingCustomer(customer);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    }

    const handleAddNewClick = () => {
        setEditingCustomer(null);
        setIsCreating(true);
        setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Gerenciar Clientes / Veículos</h2>
                    <button onClick={handleAddNewClick} className="bg-blue-600 text-white rounded-md shadow-sm py-2 px-4 inline-flex items-center justify-center font-semibold hover:bg-blue-700 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Novo Cliente
                    </button>
                </div>

                <div className="flex border-b dark:border-slate-700 mb-6 space-x-4">
                    <button
                        onClick={() => setActiveTab('clientes')}
                        className={`py-2 px-1 font-semibold transition-colors border-b-2 ${activeTab === 'clientes' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Clientes Cadastrados
                    </button>
                    <button
                        onClick={() => setActiveTab('todos')}
                        className={`py-2 px-1 font-semibold transition-colors border-b-2 ${activeTab === 'todos' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                        Todos os Veículos
                    </button>
                </div>

                <div ref={formRef}>
                    {isCreating || editingCustomer ? (
                        <CustomerForm
                            customer={editingCustomer}
                            customers={customers}
                            onSave={handleSave}
                            onCancel={() => { setIsCreating(false); setEditingCustomer(null); }}
                        />
                    ) : null}
                </div>

                <div className="mt-6">
                    <div className="relative mb-4">
                        <input
                            type="text"
                            placeholder={activeTab === 'clientes' ? "Localizar por Nome, CPF/CNPJ ou Placa..." : "Localizar por Placa, Cliente ou Modelo..."}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 border rounded-md dark:bg-slate-700 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    </div>
                    <div className="overflow-x-auto border dark:border-slate-700 rounded-lg">
                        {activeTab === 'clientes' ? (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-slate-500">Nome / Razão Social</th>
                                        <th className="p-3 text-sm font-semibold text-slate-500">Telefone</th>
                                        <th className="p-3 text-sm font-semibold text-slate-500">Modelo</th>
                                        <th className="p-3 text-sm font-semibold text-slate-500">Último Pagto</th>
                                        <th className="p-3 text-sm font-semibold text-slate-500">Mensalista</th>
                                        <th className="p-3 text-sm font-semibold text-slate-500">Situação</th>
                                        <th className="p-3 text-sm font-semibold text-slate-500">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-slate-700">
                                    {filteredCustomers.map(customer => {
                                        let paymentStatus = {
                                            text: 'N/A',
                                            badgeClass: 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200',
                                            rowClass: ''
                                        };
                                        if (customer.isMensalista) {
                                            if (customer.lastPayment) {
                                                const lastPaymentDate = new Date(customer.lastPayment);
                                                const today = new Date();
                                                lastPaymentDate.setUTCHours(0, 0, 0, 0);
                                                today.setUTCHours(0, 0, 0, 0);

                                                const diffTime = today.getTime() - lastPaymentDate.getTime();
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                                if (diffDays > 31) {
                                                    paymentStatus = {
                                                        text: 'Atrasado',
                                                        badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
                                                        rowClass: 'bg-red-200/50 dark:bg-red-900/40'
                                                    };
                                                } else {
                                                    paymentStatus = {
                                                        text: 'Em Dia',
                                                        badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
                                                        rowClass: ''
                                                    };
                                                }
                                            } else {
                                                paymentStatus = {
                                                    text: 'Pendente',
                                                    badgeClass: 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200',
                                                    rowClass: 'bg-amber-100/60 dark:bg-amber-900/40'
                                                };
                                            }
                                        }

                                        return (
                                            <tr key={customer.id} className={`${paymentStatus.rowClass} hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors`}>
                                                <td className="p-3 font-medium">{customer.name}</td>
                                                <td className="p-3">{customer.phone}</td>
                                                <td className="p-3 font-medium text-slate-600 dark:text-slate-300">{customer.model || '-'}</td>
                                                <td className="p-3">{customer.lastPayment ? new Date(customer.lastPayment).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A'}</td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${customer.isMensalista ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' : 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200'}`}>
                                                        {customer.isMensalista ? 'SIM' : 'NÃO'}
                                                    </span>
                                                </td>
                                                <td className="p-3">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${paymentStatus.badgeClass}`}>
                                                        {paymentStatus.text}
                                                    </span>
                                                </td>
                                                <td className="p-3 flex items-center space-x-2">
                                                    <button onClick={() => handleEditClick(customer)} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"><PencilIcon /></button>
                                                    <button onClick={() => handleDelete(customer.id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon /></button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                    {filteredCustomers.length === 0 && (
                                        <tr>
                                            <td colSpan={7} className="text-center p-6 text-slate-500">Nenhum cliente encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        ) : (
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50">
                                    <tr>
                                        <th className="p-3 text-sm font-semibold text-slate-500">Placa</th>
                                        <th className="p-3 text-sm font-semibold text-slate-500">Modelo</th>
                                        <th className="p-3 text-sm font-semibold text-slate-500">Tipo</th>
                                        <th className="p-3 text-sm font-semibold text-slate-500">Nome do Registro</th>
                                        <th className="p-3 text-sm font-semibold text-slate-500 text-center">Total Visitas</th>
                                        <th className="p-3 text-sm font-semibold text-slate-500 text-right">Última Visita</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y dark:divide-slate-700">
                                    {allVehicles.map(veh => (
                                        <tr key={veh.plate} className="hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors">
                                            <td className="p-3 font-mono font-bold text-slate-700 dark:text-slate-300">{veh.plate}</td>
                                            <td className="p-3 font-medium">{veh.model}</td>
                                            <td className="p-3">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${veh.type === 'Rotativo' ? 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200' : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                                                    {veh.type}
                                                </span>
                                            </td>
                                            <td className="p-3 text-slate-600 dark:text-slate-400">{veh.customerName}</td>
                                            <td className="p-3 font-semibold text-center">{veh.visits}</td>
                                            <td className="p-3 text-sm text-slate-500 text-right">{veh.lastVisit ? veh.lastVisit.toLocaleDateString('pt-BR') + ' ' + veh.lastVisit.toLocaleTimeString('pt-BR') : 'N/A'}</td>
                                        </tr>
                                    ))}
                                    {allVehicles.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="text-center p-6 text-slate-500">Nenhum veículo encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                    <div className="flex justify-between items-center mt-4 text-sm text-slate-500">
                        {activeTab === 'clientes' ? (
                            <>
                                <p>Total de Clientes: {customers.length}</p>
                                <p>Total de Mensalistas: {customers.filter(c => c.isMensalista).length}</p>
                            </>
                        ) : (
                            <>
                                <p>Total de Veículos Únicos: {allVehicles.length}</p>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Helper component for Customers ---
const CustomerForm: React.FC<{ customer: Customer | null; customers: Customer[]; onSave: (customer: Customer) => void; onCancel: () => void; }> = ({ customer, customers, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Omit<Customer, 'id'> & { id?: string }>({ name: '', cpfCnpj: '', plate: '', phone: '', customerType: CustomerType.ROTATIVO, isMensalista: false, isMensalistaDiurno: false, plate2: '', model: '', startDate: '', addressStreet: '', addressNumber: '', addressComplement: '', addressNeighborhood: '', addressCity: '', addressState: '', addressZip: '', monthlyFee: 0, lastPayment: '' });
    const [isSaved, setIsSaved] = useState(false);
    const [isFetching, setIsFetching] = useState(false);
    const [docStatus, setDocStatus] = useState<{ message: string; type: 'error' | 'warning' | 'info' } | null>(null);
    useEffect(() => { if (customer) { setFormData(customer); } else { setFormData({ name: '', cpfCnpj: '', plate: '', phone: '', customerType: CustomerType.ROTATIVO, isMensalista: false, isMensalistaDiurno: false, plate2: '', model: '', startDate: '', addressStreet: '', addressNumber: '', addressComplement: '', addressNeighborhood: '', addressCity: '', addressState: '', addressZip: '', monthlyFee: 0, lastPayment: '' }); } setDocStatus(null); }, [customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        let { name, value, type } = e.target;

        if (name === 'plate' || name === 'plate2') {
            value = value.toUpperCase();
        } else if (['name', 'model', 'addressStreet', 'addressNeighborhood', 'addressCity', 'addressState'].includes(name)) {
            value = capitalizeFirstLetter(value);
        } else if (name === 'cpfCnpj') {
            const numericValue = value.replace(/\D/g, '');
            if (numericValue.length <= 11) {
                value = maskCPF(numericValue);
            } else {
                value = maskCNPJ(numericValue);
            }
        }

        if (name === 'cpfCnpj') { setDocStatus(null); }
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => {
                const newState = { ...prev, [name]: checked };
                if (name === 'isMensalista' && !checked) {
                    newState.isMensalistaDiurno = false;
                }
                return newState;
            });
        }
        else { setFormData(prev => ({ ...prev, [name]: name === 'monthlyFee' ? parseFloat(value) : value })); }
    };

    const validateAndFetchDoc = async () => {
        const doc = formData.cpfCnpj.replace(/[^\d]+/g, '');
        setDocStatus(null);
        if (!doc) return;
        const existingCustomer = customers.find(c => c.cpfCnpj.replace(/[^\d]+/g, '') === doc && c.id !== formData.id);
        if (existingCustomer) { setDocStatus({ message: `Documento já cadastrado para: ${existingCustomer.name}`, type: 'warning' }); return; }
        if (doc.length === 11) {
            if (validateCPF(doc)) {
                setDocStatus({ message: 'CPF válido.', type: 'info' });
                const url = (import.meta as any)?.env?.VITE_CPF_LOOKUP_URL;
                const token = (import.meta as any)?.env?.VITE_CPF_LOOKUP_TOKEN;
                if (url && token) {
                    setIsFetching(true);
                    try {
                        const endpoint = url.includes('{cpf}') ? url.replace('{cpf}', doc) : `${url}/${doc}`;
                        const response = await fetch(endpoint, { headers: { Authorization: `Bearer ${token}` } });
                        if (response.ok) {
                            const data = await response.json();
                            const fullName = data.nome || data.name || data.fullName || '';
                            const phone = data.telefone || data.phone || '';
                            setFormData(prev => ({ ...prev, name: fullName || prev.name, phone: phone || prev.phone }));
                            setDocStatus({ message: 'Dados do CPF preenchidos.', type: 'info' });
                        } else {
                            setDocStatus({ message: 'Integração de CPF indisponível.', type: 'warning' });
                        }
                    } catch {
                        setDocStatus({ message: 'Falha ao consultar CPF.', type: 'warning' });
                    } finally {
                        setIsFetching(false);
                    }
                }
            } else {
                setDocStatus({ message: 'CPF inválido.', type: 'error' });
            }
            return;
        }
        else if (doc.length === 14) {
            if (!validateCNPJ(doc)) { setDocStatus({ message: 'CNPJ inválido.', type: 'error' }); return; }
            setIsFetching(true);
            try {
                const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${doc}`);
                if (!response.ok) {
                    let errorMsg = 'CNPJ não encontrado.';
                    try { const errorData = await response.json(); errorMsg = errorData.message || errorMsg; } catch (e) { }
                    throw new Error(errorMsg);
                }
                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    name: data.razao_social || prev.name,
                    phone: data.ddd_telefone_1 || prev.phone,
                    addressStreet: data.logradouro || prev.addressStreet,
                    addressNumber: data.numero || prev.addressNumber,
                    addressComplement: data.complemento || prev.addressComplement,
                    addressNeighborhood: data.bairro || prev.addressNeighborhood,
                    addressCity: data.municipio || prev.addressCity,
                    addressState: data.uf || prev.addressState,
                    addressZip: data.cep?.replace(/[.-]/g, '') || prev.addressZip,
                }));
                setDocStatus({ message: 'Dados do CNPJ preenchidos.', type: 'info' });
            } catch (error: any) {
                console.error("Erro na consulta de CNPJ:", error);
                const message = error.name === 'TypeError' && error.message === 'Failed to fetch'
                    ? 'Erro de rede ou serviço BrasilAPI offline. Tente novamente em instantes.'
                    : error.message || 'Erro ao buscar dados do CNPJ.';
                setDocStatus({ message, type: 'error' });
            }
            finally { setIsFetching(false); }
        } else { setDocStatus({ message: 'CPF/CNPJ com formato inválido.', type: 'error' }); }
    };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData as Customer); setIsSaved(true); setTimeout(() => { setIsSaved(false); }, 2000); };
    const docStatusColor = docStatus ? { error: 'text-red-500', warning: 'text-amber-600 dark:text-amber-400', info: 'text-green-600 dark:text-green-400' }[docStatus.type] : '';
    function validateCPF(cpf: string): boolean { cpf = cpf.replace(/[^\d]+/g, ''); if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false; let sum = 0, rest; for (let i = 1; i <= 9; i++) sum += parseInt(cpf.substring(i - 1, i)) * (11 - i); rest = (sum * 10) % 11; if ((rest === 10) || (rest === 11)) rest = 0; if (rest !== parseInt(cpf.substring(9, 10))) return false; sum = 0; for (let i = 1; i <= 10; i++) sum += parseInt(cpf.substring(i - 1, i)) * (12 - i); rest = (sum * 10) % 11; if ((rest === 10) || (rest === 11)) rest = 0; if (rest !== parseInt(cpf.substring(10, 11))) return false; return true; }
    function validateCNPJ(cnpj: string): boolean { cnpj = cnpj.replace(/[^\d]+/g, ''); if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false; let length = cnpj.length - 2; let numbers = cnpj.substring(0, length); let digits = cnpj.substring(length); let sum = 0; let pos = length - 7; for (let i = length; i >= 1; i--) { sum += parseInt(numbers.charAt(length - i)) * pos--; if (pos < 2) pos = 9; } let result = sum % 11 < 2 ? 0 : 11 - sum % 11; if (result.toString() !== digits.charAt(0)) return false; length = length + 1; numbers = cnpj.substring(0, length); sum = 0; pos = length - 7; for (let i = length; i >= 1; i--) { sum += parseInt(numbers.charAt(length - i)) * pos--; if (pos < 2) pos = 9; } result = sum % 11 < 2 ? 0 : 11 - sum % 11; if (result.toString() !== digits.charAt(1)) return false; return true; }

    return (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg space-y-6 border dark:border-slate-700">
            <h3 className="text-lg font-bold">{customer ? 'Editar Cliente' : 'Novo Cliente'}</h3>
            <fieldset className="border dark:border-slate-600 rounded-lg p-4"><legend className="px-2 font-semibold">Dados Pessoais</legend><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-center"><input name="name" value={formData.name} onChange={handleChange} placeholder="Nome / Razão Social" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" required /><div><div className="relative"><input name="cpfCnpj" value={formData.cpfCnpj} onChange={handleChange} onBlur={validateAndFetchDoc} placeholder="CPF/CNPJ" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 w-full pr-10" /><button type="button" onClick={validateAndFetchDoc} disabled={isFetching || !formData.cpfCnpj} className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-blue-500 disabled:text-slate-300 disabled:cursor-not-allowed" aria-label="Validar e buscar dados por CPF/CNPJ" title="Validar e buscar dados por CPF/CNPJ">{isFetching ? (<svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>) : (<SearchIcon className="h-5 w-5" />)}</button></div>{docStatus && <p className={`text-xs mt-1 ${docStatusColor}`}>{docStatus.message}</p>}</div><input name="phone" value={formData.phone} onChange={(e) => setFormData(prev => ({ ...prev, phone: maskPhone(e.target.value) }))} placeholder="Telefone" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /><input type="date" name="startDate" value={formData.startDate || ''} onChange={handleChange} title="Data de Início" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /><select name="customerType" value={formData.customerType} onChange={handleChange} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600">{Object.values(CustomerType).map(type => <option key={type} value={type}>{type}</option>)}</select><div className="flex flex-col gap-2"><div className="flex items-center gap-2"><input type="checkbox" id="isMensalista" name="isMensalista" checked={formData.isMensalista} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><label htmlFor="isMensalista">Mensalista</label></div>{formData.isMensalista && (<div className="flex items-center gap-2 pl-2"><input type="checkbox" id="isMensalistaDiurno" name="isMensalistaDiurno" checked={!!formData.isMensalistaDiurno} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><label htmlFor="isMensalistaDiurno">Mensalista Diurno</label></div>)}</div></div></fieldset>
            {formData.isMensalista && (<fieldset className="border dark:border-slate-600 rounded-lg p-4"><legend className="px-2 font-semibold">Financeiro Mensalista</legend><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><div><label htmlFor="monthlyFee" className="text-sm">Valor Mensal (R$)</label><input type="number" step="0.01" id="monthlyFee" name="monthlyFee" value={formData.monthlyFee || ''} onClick={(e) => e.currentTarget.select()} onChange={handleChange} placeholder="Ex: 250.00" className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /></div><div><label htmlFor="lastPayment" className="text-sm">Último Pagamento</label><input type="date" id="lastPayment" name="lastPayment" value={formData.lastPayment || ''} onChange={handleChange} className="w-full p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /></div></div></fieldset>)}
            <fieldset className="border dark:border-slate-600 rounded-lg p-4"><legend className="px-2 font-semibold">Veículos</legend><div className="grid grid-cols-1 md:grid-cols-3 gap-4"><input name="plate" value={formData.plate} onChange={handleChange} placeholder="Placa Principal" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" required /><input name="plate2" value={formData.plate2 || ''} onChange={handleChange} placeholder="Placa Adicional" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /><input name="model" value={formData.model || ''} onChange={handleChange} placeholder="Modelo do Veículo" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /></div></fieldset>
            <fieldset className="border dark:border-slate-600 rounded-lg p-4"><legend className="px-2 font-semibold">Endereço</legend><div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"><input name="addressStreet" value={formData.addressStreet || ''} onChange={handleChange} placeholder="Logradouro" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 md:col-span-2 lg:col-span-3" /><input name="addressNumber" value={formData.addressNumber || ''} onChange={handleChange} placeholder="Número" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /><input name="addressComplement" value={formData.addressComplement || ''} onChange={handleChange} placeholder="Complemento" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /><input name="addressNeighborhood" value={formData.addressNeighborhood || ''} onChange={handleChange} placeholder="Bairro" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /><input name="addressCity" value={formData.addressCity || ''} onChange={handleChange} placeholder="Cidade" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /><div className="grid grid-cols-2 gap-2"><input name="addressState" value={formData.addressState || ''} onChange={handleChange} placeholder="UF" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /><input name="addressZip" value={formData.addressZip || ''} onChange={handleChange} placeholder="CEP" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" /></div></div></fieldset>
            <div className="flex justify-end gap-2 pt-4 border-t dark:border-slate-700"><button type="button" onClick={onCancel} className="py-2 px-4 bg-slate-200 dark:bg-slate-600 rounded hover:bg-slate-300 dark:hover:bg-slate-500">Cancelar</button><button type="submit" disabled={isSaved} className={`py-2 px-4 rounded transition-colors ${isSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{isSaved ? 'Salvo!' : 'Salvar'}</button></div>
        </form>
    );
}

// --- Employees (from components/Employees.tsx) ---
const Employees: React.FC = () => {
    const { employees, setEmployees } = useData();
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    const handleSave = (employeeData: Employee) => {
        if (employeeData.id) {
            setEmployees(prev => prev.map(e => {
                if (e.id === employeeData.id) {
                    const finalPassword = (employeeData.password && employeeData.password.length > 0) ? employeeData.password : e.password;
                    return { ...employeeData, password: finalPassword };
                }
                return e;
            }));
        } else {
            setEmployees(prev => [...prev, { ...employeeData, id: new Date().toISOString() }]);
        }

        setTimeout(() => {
            setEditingEmployee(null);
            setIsCreating(false);
        }, 1800);
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Tem certeza que deseja excluir este funcionário?')) {
            setEmployees(prev => prev.filter(e => e.id !== id));
        }
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Cadastro de Funcionários</h2>
                    <button onClick={() => { setIsCreating(true); setEditingEmployee(null); }} className="bg-blue-600 text-white rounded-md shadow-sm py-2 px-4 inline-flex items-center justify-center font-semibold hover:bg-blue-700 transition-colors">
                        <PlusIcon className="w-5 h-5 mr-2" />
                        Adicionar
                    </button>
                </div>

                {isCreating || editingEmployee ? (
                    <EmployeeForm
                        employee={editingEmployee}
                        onSave={handleSave}
                        onCancel={() => { setIsCreating(false); setEditingEmployee(null); }}
                    />
                ) : null}

                <div className="mt-6 overflow-x-auto border dark:border-slate-700 rounded-lg">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="p-3 text-sm font-semibold text-slate-500">Código</th>
                                <th className="p-3 text-sm font-semibold text-slate-500">Nome</th>
                                <th className="p-3 text-sm font-semibold text-slate-500">Usuário</th>
                                <th className="p-3 text-sm font-semibold text-slate-500">Ativo</th>
                                <th className="p-3 text-sm font-semibold text-slate-500">Admin</th>
                                <th className="p-3 text-sm font-semibold text-slate-500">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y dark:divide-slate-700">
                            {employees.map((employee, index) => (
                                <tr key={employee.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                    <td className="p-3">{index + 1}</td>
                                    <td className="p-3 font-medium">{employee.name}</td>
                                    <td className="p-3">{employee.user}</td>
                                    <td className="p-3">{employee.isActive ? 'Sim' : 'Não'}</td>
                                    <td className="p-3">{employee.isAdmin ? 'Sim' : 'Não'}</td>
                                    <td className="p-3 flex items-center space-x-2">
                                        <button onClick={() => { setEditingEmployee(employee); setIsCreating(false); }} className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/50"><PencilIcon /></button>
                                        <button onClick={() => handleDelete(employee.id)} className="text-red-600 hover:text-red-800 p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/50"><TrashIcon /></button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// --- Helper component for Employees ---
const EmployeeForm: React.FC<{ employee: Employee | null, onSave: (employee: Employee) => void, onCancel: () => void }> = ({ employee, onSave, onCancel }) => {
    const [formData, setFormData] = useState<Employee>(employee || { id: '', name: '', user: '', password: '', isAdmin: false, isActive: true, permissions: [] });
    const [isSaved, setIsSaved] = useState(false);
    useEffect(() => { if (employee) { setFormData({ ...employee, password: '' }); } else { setFormData({ id: '', name: '', user: '', password: '', isAdmin: false, isActive: true, permissions: [] }); } }, [employee]);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let { name, value, type, checked } = e.target;
        if (name === 'name') value = capitalizeFirstLetter(value);
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    };
    const handlePermissionChange = (permission: Permission, checked: boolean) => { setFormData(prev => { const newPermissions = checked ? [...prev.permissions, permission] : prev.permissions.filter(p => p !== permission); return { ...prev, permissions: newPermissions }; }); };
    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); setIsSaved(true); setTimeout(() => { setIsSaved(false); }, 2000); };
    return (
        <form onSubmit={handleSubmit} className="bg-slate-50 dark:bg-slate-800 p-6 rounded-lg space-y-4 border dark:border-slate-700">
            <h3 className="text-lg font-bold">{employee ? 'Editar Funcionário' : 'Novo Funcionário'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"><input name="name" value={formData.name} onChange={handleChange} placeholder="Nome Funcionário" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" required /><input name="user" value={formData.user} onChange={handleChange} placeholder="Usuário" className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" required /><input type="password" name="password" value={formData.password || ''} onChange={handleChange} placeholder={employee ? "Nova Senha (deixe em branco para não alterar)" : "Senha*"} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600" required={!employee} /></div>
            <div className="flex items-center gap-4"><div className="flex items-center gap-2"><input type="checkbox" id="isAdmin" name="isAdmin" checked={formData.isAdmin} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><label htmlFor="isAdmin">Administrador</label></div><div className="flex items-center gap-2"><input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><label htmlFor="isActive">Ativo</label></div></div>
            <div><h4 className="font-semibold mb-2">Permissões de Acesso</h4><div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">{Object.values(Permission).map(permission => (<div key={permission} className="flex items-center"><input type="checkbox" id={`perm-${permission}`} checked={formData.permissions.includes(permission)} onChange={e => handlePermissionChange(permission, e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" /><label htmlFor={`perm-${permission}`} className="ml-2 text-slate-700 dark:text-slate-300">{permission}</label></div>))}</div></div>
            <div className="flex justify-end gap-2"><button type="button" onClick={onCancel} className="py-2 px-4 bg-slate-200 dark:bg-slate-600 rounded hover:bg-slate-300 dark:hover:bg-slate-500">Cancelar</button><button type="submit" disabled={isSaved} className={`py-2 px-4 rounded transition-colors ${isSaved ? 'bg-green-600 text-white' : 'bg-blue-600 text-white hover:bg-blue-700'}`}>{isSaved ? 'Salvo!' : 'Salvar'}</button></div>
        </form>
    );
};

// --- Reports (from components/Reports.tsx) ---
type AccessLogEvent = {
    id: string;
    time: Date;
    type: 'Entrada' | 'Saída' | 'Cancelamento' | 'Pagto Mensal';
    details: string; // Plate or Customer Name
    operator: string;
    value: string | number; // Amount or Reason
    color: 'blue' | 'green' | 'red' | 'teal';
};

const Reports: React.FC = () => {
    const { movements, cancellationLogs, monthlyPaymentLogs, systemLogs } = useData();
    const [activeReportType, setActiveReportType] = useState<ReportType | null>(null);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [plateFilter, setPlateFilter] = useState('');
    const [couponFilter, setCouponFilter] = useState('');
    const [selectedMonth, setSelectedMonth] = useState('');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [displayData, setDisplayData] = useState<any[] | null>(null);
    type ReportType = 'movements' | 'cash' | 'access';
    type DailySummary = { date: Date, totals: { [key: string]: number }, dayTotal: number };

    useEffect(() => { if (selectedMonth) { const year = selectedYear; const month = parseInt(selectedMonth, 10); const firstDay = new Date(year, month - 1, 1); const lastDay = new Date(year, month, 0); setStartDate(firstDay.toISOString().split('T')[0]); setEndDate(lastDay.toISOString().split('T')[0]); } }, [selectedMonth, selectedYear]);
    const handleMonthChange = (e: React.ChangeEvent<HTMLSelectElement>) => { const month = e.target.value; setSelectedMonth(month); if (!month) { setStartDate(''); setEndDate(''); } };

    const handleGenerateReport = () => {
        const start = startDate ? new Date(startDate) : null; if (start) start.setUTCHours(0, 0, 0, 0);
        const end = endDate ? new Date(endDate) : null; if (end) end.setUTCHours(23, 59, 59, 999);

        const baseMovementFilter = (m: VehicleMovement) => {
            let isDateInRange = true;
            if (start && end) {
                const entryDate = new Date(m.entryTime);
                isDateInRange = entryDate >= start && entryDate <= end;
            }
            const plateMatch = !plateFilter || m.plate.toUpperCase().includes(plateFilter.toUpperCase());
            const couponMatch = !couponFilter || m.coupon.includes(couponFilter);
            return isDateInRange && plateMatch && couponMatch;
        };

        const filteredMovements = movements.filter(baseMovementFilter);

        if (activeReportType === 'access') {
            const combinedLog: AccessLogEvent[] = [];

            // 1. From Movements
            movements.forEach(m => {
                const entryTime = new Date(m.entryTime);
                const plateMatch = !plateFilter || m.plate.toUpperCase().includes(plateFilter.toUpperCase());
                const couponMatch = !couponFilter || m.coupon.includes(couponFilter);

                if ((!start || !end || (entryTime >= start && entryTime <= end)) && plateMatch && couponMatch) {
                    combinedLog.push({ id: m.id + '-in', time: entryTime, type: 'Entrada', details: m.plate, operator: m.operatorEntry || 'N/A', value: m.customerName || 'AVULSO', color: 'blue' });
                }
                if (m.exitTime) {
                    const exitTime = new Date(m.exitTime);
                    if ((!start || !end || (exitTime >= start && exitTime <= end)) && plateMatch && couponMatch) {
                        combinedLog.push({ id: m.id + '-out', time: exitTime, type: 'Saída', details: m.plate, operator: m.operatorExit || 'N/A', value: m.totalPaid ?? 0, color: 'green' });
                    }
                }
            });

            // 2. From Cancellation Logs
            cancellationLogs.filter(l => {
                const cancellationTime = new Date(l.cancellationTime);
                const dateMatch = (!start || !end) || (cancellationTime >= start && cancellationTime <= end);
                const plateMatch = !plateFilter || l.movement.plate.toUpperCase().includes(plateFilter.toUpperCase());
                const couponMatch = !couponFilter || l.movement.coupon.includes(couponFilter);
                return dateMatch && plateMatch && couponMatch;
            }).forEach(l => {
                combinedLog.push({ id: l.id, time: new Date(l.cancellationTime), type: 'Cancelamento', details: l.movement.plate, operator: l.operator, value: l.reason, color: 'red' });
            });

            // 3. From Monthly Payment Logs
            monthlyPaymentLogs.filter(l => {
                const paymentDate = new Date(l.paymentDate);
                const dateMatch = (!start || !end) || (paymentDate >= start && paymentDate <= end);
                const customerNameMatch = !plateFilter || l.customerName.toUpperCase().includes(plateFilter.toUpperCase());
                return dateMatch && (customerNameMatch || !plateFilter) && !couponFilter;
            }).forEach(l => {
                combinedLog.push({ id: l.id, time: new Date(l.paymentDate), type: 'Pagto Mensal', details: l.customerName, operator: l.operator, value: l.amountPaid, color: 'teal' });
            });

            // 4. From System Logs
            systemLogs.filter(l => {
                const logTime = new Date(l.time);
                const dateMatch = (!start || !end) || (logTime >= start && logTime <= end);
                return dateMatch;
            }).forEach(l => {
                combinedLog.push({
                    id: l.id,
                    time: new Date(l.time),
                    type: l.type as any,
                    details: l.type,
                    operator: l.operator,
                    value: 'SISTEMA',
                    color: l.type === 'Login' ? 'blue' : 'red'
                });
            });

            setDisplayData(combinedLog.sort((a, b) => a.time.getTime() - b.time.getTime()));
        } else if (activeReportType === 'cash') {
            // For Cash report, we combine concluded movements and monthly payments
            const combinedData: any[] = [];

            // Concluded movements within range
            movements.filter(m => {
                if (m.status !== 'completed' || !m.exitTime) return false;
                const exitTime = new Date(m.exitTime);
                const dateMatch = (!start || !end) || (exitTime >= start && exitTime <= end);
                const plateMatch = !plateFilter || m.plate.toUpperCase().includes(plateFilter.toUpperCase());
                return dateMatch && plateMatch;
            }).forEach(m => combinedData.push({ ...m, _type: 'movement' }));

            // Monthly payments within range
            monthlyPaymentLogs.filter(l => {
                const paymentDate = new Date(l.paymentDate);
                const dateMatch = (!start || !end) || (paymentDate >= start && paymentDate <= end);
                const customerNameMatch = !plateFilter || l.customerName.toUpperCase().includes(plateFilter.toUpperCase());
                return dateMatch && (customerNameMatch || !plateFilter);
            }).forEach(l => combinedData.push({ ...l, _type: 'monthly', totalPaid: l.amountPaid, paymentMethod: 'Mensalidade', exitTime: l.paymentDate }));

            setDisplayData(combinedData.sort((a, b) => new Date(b.exitTime || b.paymentDate).getTime() - new Date(a.exitTime || a.paymentDate).getTime()));
        } else {
            setDisplayData(filteredMovements.sort((a, b) => new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()));
        }
    };

    const handleResetAndGoBack = () => { setActiveReportType(null); setDisplayData(null); setPlateFilter(''); setCouponFilter(''); setStartDate(''); setEndDate(''); setSelectedMonth(''); setSelectedYear(new Date().getFullYear()); };
    const cashSummary = useMemo(() => {
        if (activeReportType !== 'cash' || !displayData) { return { dailySummaries: {} as { [key: string]: DailySummary }, periodTotal: { totals: {} as { [key: string]: number }, grandTotal: 0 } }; }
        const daily: { [key: string]: DailySummary } = {}; const period = { totals: {} as { [key: string]: number }, grandTotal: 0 };
        (displayData as any[]).forEach(m => {
            const exitTime = m.exitTime || m.paymentDate;
            if (m.totalPaid != null && m.paymentMethod && exitTime) {
                const exitDate = new Date(exitTime);
                const dateKey = exitDate.toISOString().split('T')[0];
                if (!daily[dateKey]) { daily[dateKey] = { date: exitDate, totals: {}, dayTotal: 0 }; }
                const paidAmount = Number(m.totalPaid);
                daily[dateKey].totals[m.paymentMethod] = (daily[dateKey].totals[m.paymentMethod] || 0) + paidAmount;
                daily[dateKey].dayTotal += paidAmount;
                period.totals[m.paymentMethod] = (period.totals[m.paymentMethod] || 0) + paidAmount;
                period.grandTotal += paidAmount;
            }
        });
        return { dailySummaries: daily, periodTotal: period };
    }, [displayData, activeReportType]);
    const movementsTotalValue = useMemo(() => { if (activeReportType !== 'movements' || !displayData) return 0; return displayData.reduce((sum, item) => sum + Number(item.totalPaid || 0), 0); }, [displayData, activeReportType]);

    if (!activeReportType) {
        return (
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <h2 className="text-xl font-bold mb-6 text-slate-700 dark:text-slate-200 text-center">Selecione o Tipo de Relatório</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <ReportSelectionCard title="Movimentações" icon={<CarIcon className="w-10 h-10 text-blue-500" />} onClick={() => setActiveReportType('movements')} />
                    <ReportSelectionCard title="Caixa" icon={<ReceiptIcon className="w-10 h-10 text-green-500" />} onClick={() => setActiveReportType('cash')} />
                    <ReportSelectionCard title="Acessos e Auditoria" icon={<UserGroupIcon className="w-10 h-10 text-purple-500" />} onClick={() => setActiveReportType('access')} />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4"><h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">{reportTitles[activeReportType]}</h2><button onClick={handleResetAndGoBack} className="text-sm font-medium text-blue-600 hover:underline">Voltar</button></div>
                <div className="p-4 border dark:border-slate-700 rounded-lg mb-6 bg-slate-50 dark:bg-slate-800/50">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                        <div className="lg:col-span-3"><label className="block text-sm font-medium">Filtro Rápido por Mês</label><div className="flex gap-2"><select value={selectedMonth} onChange={handleMonthChange} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 w-full"><option value="">Todos</option><option value="1">Janeiro</option><option value="2">Fevereiro</option><option value="3">Março</option><option value="4">Abril</option><option value="5">Maio</option><option value="6">Junho</option><option value="7">Julho</option><option value="8">Agosto</option><option value="9">Setembro</option><option value="10">Outubro</option><option value="11">Novembro</option><option value="12">Dezembro</option></select><select value={selectedYear} onChange={e => setSelectedYear(parseInt(e.target.value))} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600">{[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}</select></div></div>
                        <div><label className="block text-sm font-medium">Data Inicial</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} disabled={!!selectedMonth} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 w-full disabled:bg-slate-200 dark:disabled:bg-slate-700/50" /></div>
                        <div><label className="block text-sm font-medium">Data Final</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} disabled={!!selectedMonth} className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 w-full disabled:bg-slate-200 dark:disabled:bg-slate-700/50" /></div>
                        <div><label className="block text-sm font-medium">Placa / Cliente</label><input type="text" value={plateFilter} onChange={e => setPlateFilter(e.target.value)} placeholder="Filtrar..." className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 w-full" /></div>
                        <div><label className="block text-sm font-medium">Cupom</label><input type="text" value={couponFilter} onChange={e => setCouponFilter(e.target.value)} placeholder="Filtrar por cupom..." className="p-2 border rounded dark:bg-slate-700 dark:border-slate-600 w-full" /></div>
                        <button onClick={handleGenerateReport} className="py-2 px-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 w-full h-10 col-span-1 lg:col-span-2">Gerar Relatório</button>
                    </div><p className="text-xs text-slate-500 dark:text-slate-400 text-center mt-2">Deixe as datas em branco para buscar em todo o período, ou use o filtro rápido por mês.</p>
                </div>
                <div className="overflow-x-auto border dark:border-slate-700 rounded-lg">{renderReportContent(activeReportType, displayData, cashSummary)}</div>
                {activeReportType === 'movements' && displayData && displayData.length > 0 && (
                    <div className="mt-4 p-4 bg-slate-100 dark:bg-slate-900/50 rounded-lg flex justify-between items-center">
                        <div className="text-lg font-bold dark:text-slate-200">
                            <span>Quantidade: </span>
                            <span className="text-blue-600 dark:text-blue-400">{displayData.length}</span>
                        </div>
                        <div className="text-lg font-bold dark:text-slate-200">
                            <span>Valor Total (Período): </span>
                            <span className="text-green-600 font-mono">{movementsTotalValue.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ReportSelectionCard: React.FC<{ title: string; icon: React.ReactNode; onClick: () => void }> = ({ title, icon, onClick }) => (<div onClick={onClick} className="cursor-pointer bg-white dark:bg-slate-800 p-8 rounded-xl shadow-md flex flex-col items-center justify-center space-y-4 transition-all hover:shadow-xl hover:scale-105 hover:bg-slate-50 dark:hover:bg-slate-700/70">{icon}<h3 className="text-xl font-bold text-slate-700 dark:text-slate-200">{title}</h3></div>);

const reportTitles = { movements: 'Relatório de Movimentações', cash: 'Relatório de Caixa', access: 'Relatório de Acessos e Auditoria' };

function renderReportContent(activeReportType: any, displayData: any, cashSummary: any) {
    if (displayData === null) return <p className="text-center p-6 text-slate-500">Ajuste os filtros e clique em "Gerar Relatório" para ver os dados.</p>;
    if (displayData.length === 0) return <p className="text-center p-6 text-slate-500">Nenhum dado encontrado para os filtros selecionados.</p>;
    switch (activeReportType) {
        case 'movements': return (<table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-700/50"><tr><th className="p-3 text-sm font-semibold text-slate-500">Cupom</th><th className="p-3 text-sm font-semibold text-slate-500">Placa</th><th className="p-3 text-sm font-semibold text-slate-500">Entrada</th><th className="p-3 text-sm font-semibold text-slate-500">Saída</th><th className="p-3 text-sm font-semibold text-slate-500">Pagamento</th><th className="p-3 text-sm font-semibold text-slate-500 text-right">Valor Pago</th></tr></thead><tbody className="divide-y dark:divide-slate-700">{displayData.map((item: any) => (<tr key={item.id}><td className="p-3">{item.coupon}</td><td className="p-3 font-mono">{item.plate}</td><td className="p-3">{new Date(item.entryTime).toLocaleString('pt-BR')}</td><td className="p-3">{item.exitTime ? new Date(item.exitTime).toLocaleString('pt-BR') : '---'}</td><td className="p-3">{item.paymentMethod || '---'}</td><td className="p-3 text-right">{typeof item.totalPaid === 'number' ? item.totalPaid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : '---'}</td></tr>))}</tbody></table>);
        case 'cash': const sortedDays = Object.values(cashSummary.dailySummaries).sort((a: any, b: any) => a.date.getTime() - b.date.getTime()); if (sortedDays.length === 0) { return <p className="text-center p-6 text-slate-500">Nenhum pagamento encontrado para os filtros selecionados.</p>; } return (<div className="p-4 space-y-6">{sortedDays.map(({ date, totals, dayTotal }: any) => (<div key={date.toISOString()} className="p-4 border rounded-lg dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"><h4 className="font-bold text-slate-800 dark:text-slate-200 text-md mb-2">{new Date(date).toLocaleDateString('pt-BR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h4><table className="w-full text-sm"><tbody>{Object.entries(totals).map(([method, total]) => (<tr key={method}><td className="py-1 pr-2 text-slate-600 dark:text-slate-300">{method}</td><td className="py-1 pl-2 text-right font-mono">{(total as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>))}</tbody><tfoot className="border-t dark:border-slate-600"><tr><td className="pt-2 font-semibold">Total do Dia</td><td className="pt-2 text-right font-semibold font-mono">{dayTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr></tfoot></table></div>))}<div className="mt-6 pt-4 border-t-2 dark:border-slate-600"><h3 className="font-bold text-lg mb-4">Resumo Total do Período</h3><div className="border rounded-lg dark:border-slate-700 overflow-hidden"><table className="w-full text-left"><thead className="bg-slate-100 dark:bg-slate-700/50"><tr><th className="p-3 text-sm font-semibold text-slate-500">Forma de Pagamento</th><th className="p-3 text-sm font-semibold text-slate-500 text-right">Valor Total</th></tr></thead><tbody className="divide-y dark:divide-slate-700">{Object.entries(cashSummary.periodTotal.totals).map(([method, total]) => (<tr key={method}><td className="p-3 font-medium">{method}</td><td className="p-3 font-mono text-right">{(total as number).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr>))}</tbody><tfoot className="bg-slate-200 dark:bg-slate-900/50"><tr><td className="p-3 font-bold text-lg">TOTAL GERAL</td><td className="p-3 font-bold font-mono text-right text-lg text-green-600 dark:text-green-400">{cashSummary.periodTotal.grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</td></tr></tfoot></table></div></div></div>);
        case 'access': return (<table className="w-full text-left"><thead className="bg-slate-50 dark:bg-slate-700/50"><tr><th className="p-3 text-sm font-semibold text-slate-500">Data/Hora</th><th className="p-3 text-sm font-semibold text-slate-500">Evento</th><th className="p-3 text-sm font-semibold text-slate-500">Detalhes (Placa/Cliente)</th><th className="p-3 text-sm font-semibold text-slate-500">Operador</th><th className="p-3 text-sm font-semibold text-slate-500 text-right">Valor / Motivo</th></tr></thead><tbody className="divide-y dark:divide-slate-700">{displayData.map((item: AccessLogEvent) => { const colors = { blue: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', green: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', red: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200', gray: 'bg-slate-100 text-slate-800 dark:bg-slate-600 dark:text-slate-200' }; let valueDisplay; if (typeof item.value === 'number') { valueDisplay = item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); } else { valueDisplay = item.value; } return (<tr key={item.id} className="text-sm"><td className="p-3">{(item.time).toLocaleString('pt-BR')}</td><td className="p-3"><span className={`px-2 py-1 text-xs rounded-full font-medium ${colors[item.color] || colors.gray}`}>{item.type}</span></td><td className="p-3 font-mono">{item.details}</td><td className="p-3">{item.operator}</td><td className="p-3 text-right">{valueDisplay}</td></tr>); })}</tbody></table>);
        default: return null;
    }
}

// --- Settings (from components/Settings.tsx) ---
const Settings: React.FC = () => {
    // This is a large component. Its implementation is consolidated above.
    return <SettingsComponent />;
};

// --- Login (from components/Login.tsx) ---
const Login: React.FC<{ onLoginSuccess: (employee: Employee) => void; }> = ({ onLoginSuccess }) => {
    const { employees, setSystemLogs } = useData();
    const [user, setUser] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !password) { setError('Por favor, informe o usuário e a senha.'); return; }
        const foundEmployee = employees.find(emp => emp.user === user && emp.password === password);
        if (foundEmployee && foundEmployee.isActive) {
            const loginEvent: SystemLog = { id: new Date().toISOString(), time: new Date(), type: 'Login', operator: foundEmployee.name };
            if (setSystemLogs) setSystemLogs(prev => [...(prev || []), loginEvent]);
            onLoginSuccess(foundEmployee);
        }
        else { setError('Usuário ou senha inválidos, ou usuário inativo.'); }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-slate-100 dark:bg-slate-900">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-slate-800 rounded-2xl shadow-2xl relative">
                <button onClick={() => window.electronAPI.closeApp?.()} className="absolute top-4 right-4 text-slate-400 hover:text-red-500 transition-colors" title="Fechar Aplicação">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <div className="flex flex-col items-center"><span className="text-blue-600 dark:text-blue-400 p-3 bg-blue-100 dark:bg-slate-700 rounded-full mb-4"><CarIcon className="w-10 h-10" /></span><h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">FlowEstac</h1><p className="text-slate-500 dark:text-slate-400 mt-1">Acesso ao Sistema de Estacionamento</p></div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div><label htmlFor="user-login" className="sr-only">Usuário</label><input id="user-login" name="user" type="text" value={user} onChange={(e) => { setUser(e.target.value); setError(''); }} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-slate-100 dark:bg-slate-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Digite seu usuário" /></div>
                        <div><label htmlFor="password-login" className="sr-only">Senha</label><input id="password-login" name="password" type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(''); }} required className="appearance-none rounded-md relative block w-full px-3 py-3 border border-slate-300 dark:border-slate-600 placeholder-slate-500 text-slate-900 dark:text-slate-100 dark:bg-slate-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm" placeholder="Digite sua senha" /></div>
                    </div>
                    {error && (<div className="p-3 bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 rounded-md text-center"><p className="text-sm text-red-700 dark:text-red-200">{error}</p></div>)}
                    <div><button type="submit" className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800">Entrar</button></div>
                </form>

                <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                    <button type="button" onClick={() => { if (confirm('Reiniciar o computador?')) window.electronAPI.restartComputer(); }} className="flex-1 py-2 px-3 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded text-sm hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors">Reiniciar PC</button>
                    <button type="button" onClick={() => { if (confirm('Desligar o computador?')) window.electronAPI.shutdownComputer(); }} className="flex-1 py-2 px-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded text-sm hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">Desligar PC</button>
                </div>

                <p className="mt-6 text-center text-xs text-slate-400">&copy; {new Date().getFullYear()} FlowEstac. Todos os direitos reservados.</p>
            </div>
        </div>
    );
};

// --- License Blocked Screen ---
const LicenseBlockedScreen: React.FC<{ onRecheck: () => void }> = ({ onRecheck }) => {
    const { nfseConfig, setNfseConfig } = useData();
    const [cnpj, setCnpj] = useState(nfseConfig.cnpj || '');
    const [isSaving, setIsSaving] = useState(false);

    const handleSaveCnpj = async () => {
        if (!cnpj.trim()) {
            alert('Por favor, informe um CNPJ válido.');
            return;
        }
        setIsSaving(true);
        try {
            await setNfseConfig({ ...nfseConfig, cnpj: cnpj.trim() });
            // O useEffect no App vai disparar o checkLicense automaticamente pois nfseConfig mudou
            // Mas chamamos onRecheck por garantia se o CNPJ for o mesmo
            onRecheck();
        } catch (err) {
            alert('Erro ao salvar CNPJ.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-100 dark:bg-slate-900 z-[9999] flex items-center justify-center p-4 md:p-6 text-center overflow-y-auto">
            <div className="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-2xl shadow-2xl max-w-lg w-full border-2 border-red-500 my-8">
                <div className="text-red-500 mb-6 flex justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-16 h-16 md:w-20 md:h-20">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                    </svg>
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-slate-100 mb-4">Acesso Bloqueado</h1>
                <p className="text-sm md:text-base text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                    Detectamos uma irregularidade na licença de uso do FlowEstac, pagamento pendente ou seu período de teste de 14 dias expirou.
                </p>

                <div className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl mb-6 border border-slate-200 dark:border-slate-700">
                    <label className="block text-left text-xs font-bold uppercase text-slate-500 dark:text-slate-400 mb-2 ml-1">
                        Informe seu CNPJ para Ativação
                    </label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={cnpj}
                            onChange={(e) => setCnpj(e.target.value)}
                            placeholder="00.000.000/0001-00"
                            className="flex-1 p-3 rounded-lg border border-slate-300 dark:border-slate-600 dark:bg-slate-800 text-slate-800 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        <button
                            onClick={handleSaveCnpj}
                            disabled={isSaving}
                            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-bold transition-colors disabled:opacity-50"
                        >
                            {isSaving ? '...' : 'Salvar'}
                        </button>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-2 text-left italic">
                        * Após salvar, o sistema tentará validar sua licença online.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm text-center border border-blue-100 dark:border-blue-800/30">
                        <p className="font-semibold text-slate-700 dark:text-slate-200">Suporte FlowEstac (WhatsApp)</p>
                        <button
                            onClick={() => window.open('https://wa.me/5551998595952?text=Olá, meu FlowEstac foi bloqueado e preciso regularizar minha licença.', '_blank')}
                            className="mt-2 text-green-600 dark:text-green-400 font-bold hover:underline inline-flex items-center gap-2"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                            (51) 99859-5952
                        </button>
                    </div>
                    <button
                        onClick={onRecheck}
                        className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        Tentar Novamente
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- Settings Component implementation (from components/Settings.tsx) ---
const SettingsComponent: React.FC = () => {
    const data = useData(); const [activeTab, setActiveTab] = useState<any>('general'); const fileInputRef = useRef<HTMLInputElement>(null);
    const [editingService, setEditingService] = useState<Service | null>(null); const [editingPaymentMethod, setEditingPaymentMethod] = useState<PaymentMethod | null>(null); const [editingCoupon, setEditingCoupon] = useState<CouponConfig | null>(null); const [editingAgreement, setEditingAgreement] = useState<Agreement | null>(null);
    const [isGeneralSaved, setIsGeneralSaved] = useState(false); const [isPricingSaved, setIsPricingSaved] = useState(false); const [isCouponConfigSaved, setIsCouponConfigSaved] = useState(false); const [isCategoriesSaved, setIsCategoriesSaved] = useState(false); const [isPrinterConfigSaved, setIsPrinterConfigSaved] = useState(false);
    const [newPaymentMethod, setNewPaymentMethod] = useState(''); const [newServiceName, setNewServiceName] = useState(''); const [newServicePrice, setNewServicePrice] = useState<number | ''>(''); const [cancellationPassword, setCancellationPassword] = useState(''); const [discountPassword, setDiscountPassword] = useState(''); const [parkingLimit, setParkingLimit] = useState(100);
    const [localPricingConfig, setLocalPricingConfig] = useState<PricingConfig>(data.pricingConfig); const [localCouponConfig, setLocalCouponConfig] = useState<CouponPrintConfig>(data.couponPrintConfig); const [localPrinterConfig, setLocalPrinterConfig] = useState<PrinterConfig>(data.printerConfig);
    const [newCancellationReason, setNewCancellationReason] = useState(''); const [newAgreementName, setNewAgreementName] = useState(''); const [newAgreementDiscountType, setNewAgreementDiscountType] = useState<'percentage' | 'fixed'>('percentage'); const [newAgreementDiscountValue, setNewAgreementDiscountValue] = useState<number | ''>(''); const [newAgreementPlates, setNewAgreementPlates] = useState('');
    const [newCouponCode, setNewCouponCode] = useState(''); const [newCouponDiscount, setNewCouponDiscount] = useState<number | ''>(''); const [newCouponValidUntil, setNewCouponValidUntil] = useState(''); const [localCategories, setLocalCategories] = useState<VehicleCategory[]>([]);
    const [localNfseConfig, setLocalNfseConfig] = useState<NfseConfig>(data.nfseConfig); const [isNfseSaved, setIsNfseSaved] = useState(false);
    const [localModules, setLocalModules] = useState<AppModules>(data.modules); const [isModulesSaved, setIsModulesSaved] = useState(false);

    useEffect(() => { setLocalCategories(Object.values(VehicleType).map(vt => { const existing = data.vehicleCategories.find(vc => vc.name === vt); return existing ? { ...existing } : { id: vt, name: vt }; })); }, [data.vehicleCategories]);
    useEffect(() => { setCancellationPassword(data.generalSettings.cancellationPassword || ''); setDiscountPassword(data.generalSettings.discountPassword || ''); setParkingLimit(data.generalSettings.parkingLimit || 100); }, [data.generalSettings]);
    useEffect(() => { setLocalPricingConfig(data.pricingConfig); }, [data.pricingConfig]); useEffect(() => { setLocalCouponConfig(data.couponPrintConfig); }, [data.couponPrintConfig]); useEffect(() => { setLocalPrinterConfig(data.printerConfig); }, [data.printerConfig]);
    useEffect(() => { setLocalNfseConfig(data.nfseConfig); }, [data.nfseConfig]);
    useEffect(() => { setLocalModules(data.modules); }, [data.modules]);

    const handleSaveGeneralSettings = () => { data.setGeneralSettings({ cancellationPassword, discountPassword, parkingLimit }); setIsGeneralSaved(true); setTimeout(() => setIsGeneralSaved(false), 2000); };
    const handleAddPaymentMethod = () => { if (newPaymentMethod && !data.paymentMethods.some(p => p.name === newPaymentMethod.toUpperCase())) { const newMethod: PaymentMethod = { id: new Date().toISOString(), name: newPaymentMethod.toUpperCase(), isDefault: data.paymentMethods.length === 0, }; data.setPaymentMethods([...data.paymentMethods, newMethod]); setNewPaymentMethod(''); } };
    const handleDeletePaymentMethod = (id: string) => { if (window.confirm(`Tem certeza que deseja apagar esta forma de pagamento?`)) { data.setPaymentMethods(prev => prev.filter(p => p.id !== id)); } };
    const handleSavePaymentMethod = (pm: PaymentMethod) => { data.setPaymentMethods(prev => prev.map(p => p.id === pm.id ? pm : p)); };
    const handleSetDefaultPaymentMethod = (id: string) => { data.setPaymentMethods(prev => prev.map(p => ({ ...p, isDefault: p.id === id }))); }
    const handleAddService = () => { if (newServiceName && typeof newServicePrice === 'number' && newServicePrice >= 0) { const newService: Service = { id: new Date().toISOString(), name: newServiceName, price: newServicePrice, }; data.setServices([...data.services, newService]); setNewServiceName(''); setNewServicePrice(''); } else { alert('Por favor, preencha o nome e um preço válido para o serviço.'); } };
    const handleDeleteService = (serviceId: string) => { if (window.confirm(`Tem certeza que deseja apagar este serviço?`)) { data.setServices(prev => prev.filter(s => s.id !== serviceId)); } };
    const handleSaveService = (service: Service) => { data.setServices(prev => prev.map(s => s.id === service.id ? service : s)); }
    const handlePricingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        let newValue: any = value;
        if (type === 'checkbox') { newValue = (e.target as HTMLInputElement).checked; }
        else if (type === 'number') { newValue = parseFloat(value); if (isNaN(newValue)) newValue = 0; }
        setLocalPricingConfig(prev => ({ ...prev, [name]: newValue }));
    }
    const handleAddTimeBand = () => { setLocalPricingConfig(prev => ({ ...prev, timeBands: [...(prev.timeBands || []), { upToHours: 1, price: prev.firstHourRate || 0 }] })); }
    const handleUpdateTimeBand = (index: number, field: 'upToHours' | 'price', value: number) => { setLocalPricingConfig(prev => ({ ...prev, timeBands: (prev.timeBands || []).map((b, i) => i === index ? { ...b, [field]: value } : b) })); }
    const handleDeleteTimeBand = (index: number) => { setLocalPricingConfig(prev => ({ ...prev, timeBands: (prev.timeBands || []).filter((_, i) => i !== index) })); }
    const handleSavePricing = () => { data.setPricingConfig(localPricingConfig); setIsPricingSaved(true); setTimeout(() => setIsPricingSaved(false), 2000); }
    const handleAddCancellationReason = () => { if (newCancellationReason.trim()) { const newReason: CancellationReason = { id: new Date().toISOString(), reason: newCancellationReason.trim() }; data.setCancellationReasons(prev => [...prev, newReason]); setNewCancellationReason(''); } }
    const handleDeleteCancellationReason = (id: string) => { if (window.confirm(`Tem certeza que deseja apagar este motivo?`)) { data.setCancellationReasons(prev => prev.filter(r => r.id !== id)); } }
    const handleAddAgreement = () => { if (newAgreementName.trim() && typeof newAgreementDiscountValue === 'number' && newAgreementDiscountValue > 0) { const newAgreement: Agreement = { id: new Date().toISOString(), name: newAgreementName.trim(), discountType: newAgreementDiscountType, discountValue: newAgreementDiscountValue, associatedPlates: newAgreementPlates.toUpperCase().trim() }; data.setAgreements(prev => [...prev, newAgreement]); setNewAgreementName(''); setNewAgreementDiscountValue(''); setNewAgreementPlates(''); setNewAgreementDiscountType('percentage'); } else { alert('Preencha o nome do convênio e um valor de desconto válido.'); } }
    const handleDeleteAgreement = (id: string) => { if (window.confirm(`Tem certeza que deseja apagar este convênio?`)) { data.setAgreements(prev => prev.filter(a => a.id !== id)); } }
    const handleSaveAgreement = (agreement: Agreement) => { data.setAgreements(prev => prev.map(a => a.id === agreement.id ? agreement : a)); }
    const handleCouponConfigChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { const { name, value, type } = e.target; if (type === 'checkbox') { const { checked } = e.target as HTMLInputElement; setLocalCouponConfig(prev => ({ ...prev, [name]: checked })); } else if (type === 'number') { setLocalCouponConfig(prev => ({ ...prev, [name]: parseInt(value, 10) || 1 })); } else { setLocalCouponConfig(prev => ({ ...prev, [name]: value })); } };
    const handleSaveCouponConfig = () => { data.setCouponPrintConfig(localCouponConfig); setIsCouponConfigSaved(true); setTimeout(() => setIsCouponConfigSaved(false), 2000); };
    const handleAddCoupon = () => { if (newCouponCode.trim() && typeof newCouponDiscount === 'number' && newCouponDiscount > 0) { const newCoupon: CouponConfig = { id: new Date().toISOString(), code: newCouponCode.toUpperCase().trim(), discountPercentage: newCouponDiscount, isActive: true, validUntil: newCouponValidUntil || undefined }; data.setCoupons(prev => [...prev, newCoupon]); setNewCouponCode(''); setNewCouponDiscount(''); setNewCouponValidUntil(''); } else { alert('Preencha o código e um percentual de desconto válido.'); } }
    const handleDeleteCoupon = (id: string) => { if (window.confirm(`Tem certeza que deseja apagar este cupom?`)) { data.setCoupons(prev => prev.filter(c => c.id !== id)); } }
    const handleToggleCouponStatus = (id: string) => { data.setCoupons(prev => prev.map(c => c.id === id ? { ...c, isActive: !c.isActive } : c)); }
    const handleSaveCoupon = (coupon: CouponConfig) => { data.setCoupons(prev => prev.map(c => c.id === coupon.id ? coupon : c)); }
    const handleCategoryChange = (id: string, field: string, value: any) => { setLocalCategories(prev => prev.map(cat => cat.id === id ? { ...cat, [field]: value } : cat)); }
    const handleSaveCategories = () => { data.setVehicleCategories(localCategories); setIsCategoriesSaved(true); setTimeout(() => setIsCategoriesSaved(false), 2000); }
    const handlePrinterProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => { const profileKey = e.target.value; const selectedPreset = printerPresets[profileKey]; if (selectedPreset) { setLocalPrinterConfig({ profile: profileKey, printWidth: selectedPreset.width, }); } };
    const handlePrinterWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => { setLocalPrinterConfig(prev => ({ ...prev, printWidth: parseInt(e.target.value, 10) || 0 })); };
    const handleSavePrinterConfig = () => { data.setPrinterConfig(localPrinterConfig); setIsPrinterConfigSaved(true); setTimeout(() => setIsPrinterConfigSaved(false), 2000); };
    const handleSaveNfseConfig = (config?: NfseConfig) => { const finalConfig = config || localNfseConfig; data.setNfseConfig(finalConfig); setIsNfseSaved(true); setTimeout(() => setIsNfseSaved(false), 2000); };
    const handleSaveModules = async () => { data.setModules(localModules); await window.electronAPI.saveData('flowestac_modules', localModules); setIsModulesSaved(true); setTimeout(() => setIsModulesSaved(false), 2000); };

    const handleBackup = () => { const backupData: BackupData = { customers: data.customers, employees: data.employees, movements: data.movements, cancellationLogs: data.cancellationLogs, monthlyPaymentLogs: data.monthlyPaymentLogs, services: data.services, generalSettings: data.generalSettings, paymentMethods: data.paymentMethods, pricingConfig: data.pricingConfig, coupons: data.coupons, vehicleCategories: data.vehicleCategories, agreements: data.agreements, cancellationReasons: data.cancellationReasons, couponPrintConfig: data.couponPrintConfig, printerConfig: data.printerConfig }; const jsonString = JSON.stringify(backupData, null, 2); const blob = new Blob([jsonString], { type: 'application/json' }); const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; const date = new Date().toISOString().split('T')[0]; link.download = `sisestac_backup_${date}.json`; document.body.appendChild(link); link.click(); document.body.removeChild(link); URL.revokeObjectURL(url); };
    const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => { const file = event.target.files?.[0]; if (!file) return; if (!window.confirm("Atenção: Restaurar um backup substituirá TODOS os dados atuais. Deseja continuar?")) { if (fileInputRef.current) { fileInputRef.current.value = ""; } return; } const reader = new FileReader(); reader.onload = (e) => { try { const text = e.target?.result; if (typeof text !== 'string') throw new Error("File content is not a string"); const parsedData: BackupData = JSON.parse(text); data.restoreBackup(parsedData); } catch (error) { console.error("Failed to parse backup file:", error); alert('Erro ao restaurar o backup. O arquivo pode estar corrompido ou em formato inválido.'); } finally { if (fileInputRef.current) { fileInputRef.current.value = ""; } } }; reader.readAsText(file); };

    return (<>
        {editingService && <EditServiceModal service={editingService} onSave={handleSaveService} onClose={() => setEditingService(null)} />}
        {editingPaymentMethod && <EditPaymentMethodModal paymentMethod={editingPaymentMethod} onSave={handleSavePaymentMethod} onClose={() => setEditingPaymentMethod(null)} />}
        {editingCoupon && <EditCouponModal coupon={editingCoupon} onSave={handleSaveCoupon} onClose={() => setEditingCoupon(null)} />}
        {editingAgreement && <EditAgreementModal agreement={editingAgreement} onSave={handleSaveAgreement} onClose={() => setEditingAgreement(null)} />}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4 text-slate-700 dark:text-slate-200">Configurações do Sistema</h2>
            <div className="border-b border-slate-200 dark:border-slate-700 mb-4"><nav className="-mb-px flex space-x-6 overflow-x-auto">{tabs.map(tab => (<button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-200 dark:hover:border-slate-500'}`}>{tab.label}</button>))}</nav></div>
            <div>{renderSettingsContent(activeTab, { data, fileInputRef, editingService, setEditingService, editingPaymentMethod, setEditingPaymentMethod, editingCoupon, setEditingCoupon, editingAgreement, setEditingAgreement, isGeneralSaved, setIsGeneralSaved, isPricingSaved, setIsPricingSaved, isCouponConfigSaved, setIsCouponConfigSaved, isCategoriesSaved, setIsCategoriesSaved, isPrinterConfigSaved, setIsPrinterConfigSaved, newPaymentMethod, setNewPaymentMethod, newServiceName, setNewServiceName, newServicePrice, setNewServicePrice, cancellationPassword, setCancellationPassword, discountPassword, setDiscountPassword, parkingLimit, setParkingLimit, localPricingConfig, setLocalPricingConfig, localCouponConfig, setLocalCouponConfig, localPrinterConfig, setLocalPrinterConfig, newCancellationReason, setNewCancellationReason, newAgreementName, setNewAgreementName, newAgreementDiscountType, setNewAgreementDiscountType, newAgreementDiscountValue, setNewAgreementDiscountValue, newAgreementPlates, setNewAgreementPlates, newCouponCode, setNewCouponCode, newCouponDiscount, setNewCouponDiscount, newCouponValidUntil, setNewCouponValidUntil, localCategories, setLocalCategories, handleSaveGeneralSettings, handleAddPaymentMethod, handleDeletePaymentMethod, handleSetDefaultPaymentMethod, handleAddService, handleDeleteService, handlePricingChange, handleSavePricing, handleAddCancellationReason, handleDeleteCancellationReason, handleAddAgreement, handleDeleteAgreement, handleCouponConfigChange, handleSaveCouponConfig, handleAddCoupon, handleDeleteCoupon, handleToggleCouponStatus, handleSaveCategories, handlePrinterProfileChange, handlePrinterWidthChange, handleSavePrinterConfig, handleBackup, handleRestore, printerPresets, handleAddTimeBand, handleUpdateTimeBand, handleDeleteTimeBand, localNfseConfig, setLocalNfseConfig, handleSaveNfseConfig, setIsNfseSaved, localModules, setLocalModules, handleSaveModules, isModulesSaved })}</div>
        </div>
    </>);
};
const EditServiceModal: React.FC<any> = ({ service, onSave, onClose }) => { const [name, setName] = useState(service.name); const [price, setPrice] = useState(service.price); const handleSave = () => { onSave({ ...service, name, price }); onClose(); }; return (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}><div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}><h3 className="text-lg font-bold">Editar Serviço</h3><div><label className="block text-sm font-medium">Nome do Serviço</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" /></div><div><label className="block text-sm font-medium">Preço</label><input type="number" value={price} onChange={e => setPrice(parseFloat(e.target.value) || 0)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" /></div><div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700"><button onClick={onClose} className="py-2 px-4 bg-slate-200 dark:bg-slate-600 rounded hover:bg-slate-300">Cancelar</button><button onClick={handleSave} className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button></div></div></div>); };
const EditPaymentMethodModal: React.FC<any> = ({ paymentMethod, onSave, onClose }) => { const [name, setName] = useState(paymentMethod.name); const handleSave = () => { onSave({ ...paymentMethod, name: name.toUpperCase() }); onClose(); }; return (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}><div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}><h3 className="text-lg font-bold">Editar Forma de Pagamento</h3><div><label className="block text-sm font-medium">Nome</label><input type="text" value={name} onChange={e => setName(e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" /></div><div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700"><button onClick={onClose} className="py-2 px-4 bg-slate-200 dark:bg-slate-600 rounded hover:bg-slate-300">Cancelar</button><button onClick={handleSave} className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button></div></div></div>); }
const EditCouponModal: React.FC<any> = ({ coupon, onSave, onClose }) => { const [code, setCode] = useState(coupon.code); const [discountPercentage, setDiscountPercentage] = useState(coupon.discountPercentage); const [validUntil, setValidUntil] = useState(coupon.validUntil || ''); const handleSave = () => { onSave({ ...coupon, code: code.toUpperCase(), discountPercentage, validUntil: validUntil || undefined }); onClose(); }; return (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}><div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}><h3 className="text-lg font-bold">Editar Cupom de Desconto</h3><div><label className="block text-sm font-medium">Código do Cupom</label><input type="text" value={code} onChange={e => setCode(e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" /></div><div><label className="block text-sm font-medium">Percentual de Desconto (%)</label><input type="number" value={discountPercentage} onChange={e => setDiscountPercentage(parseFloat(e.target.value) || 0)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" /></div><div><label className="block text-sm font-medium">Válido até</label><input type="date" value={validUntil} onChange={e => setValidUntil(e.target.value)} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" /></div><div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700"><button onClick={onClose} className="py-2 px-4 bg-slate-200 dark:bg-slate-600 rounded hover:bg-slate-300">Cancelar</button><button onClick={handleSave} className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button></div></div></div>); };
const EditAgreementModal: React.FC<any> = ({ agreement, onSave, onClose }) => { const [formData, setFormData] = useState(agreement); const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: name === 'discountValue' ? parseFloat(value) || 0 : value })); }; const handleSave = () => { onSave(formData); onClose(); }; return (<div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50" onClick={onClose}><div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}><h3 className="text-lg font-bold">Editar Convênio</h3><div className="space-y-4"><div><label className="block text-sm font-medium">Nome do Convênio</label><input type="text" name="name" value={formData.name} onChange={handleChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" /></div><div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium">Tipo de Desconto</label><select name="discountType" value={formData.discountType} onChange={handleChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1"><option value="percentage">Percentual (%)</option><option value="fixed">Valor Fixo (R$)</option></select></div><div><label className="block text-sm font-medium">Valor</label><input type="number" name="discountValue" value={formData.discountValue} onChange={handleChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" /></div></div><div><label className="block text-sm font-medium">Placas Associadas (separadas por vírgula)</label><input type="text" name="associatedPlates" value={formData.associatedPlates} onChange={handleChange} className="p-2 w-full border rounded dark:bg-slate-700 dark:border-slate-600 mt-1" /></div></div><div className="flex justify-end gap-4 pt-4 border-t dark:border-slate-700"><button onClick={onClose} className="py-2 px-4 bg-slate-200 dark:bg-slate-600 rounded hover:bg-slate-300">Cancelar</button><button onClick={handleSave} className="py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700">Salvar</button></div></div></div>); };

const tabs = [{ id: 'general', label: 'Geral' }, { id: 'pricing', label: 'Preços' }, { id: 'services', label: 'Serviços' }, { id: 'payments', label: 'Pagamentos' }, { id: 'agreements', label: 'Convênios' }, { id: 'coupons', label: 'Cupons' }, { id: 'printing', label: 'Impressão' }, { id: 'nfse', label: 'NFSE' }, , { id: 'modulos', label: 'Módulos' }, { id: 'backup', label: 'Backup/Restore' }];
const printerPresets: { [key: string]: { name: string, width: number } } = { 'generic_80mm': { name: 'Genérica / Somente Texto (80mm)', width: 300 }, 'epson_tm_t20_80mm': { name: 'EPSON TM-T20 (80mm)', width: 300 }, 'bematech_mp_4200_80mm': { name: 'Bematech MP-4200 (80mm)', width: 300 }, 'generic_58mm': { name: 'Genérica (58mm)', width: 200 }, 'custom': { name: 'Personalizado', width: 288 } };

function renderSettingsContent(activeTab: any, props: any) {
    const { data, fileInputRef, setEditingService, setEditingPaymentMethod, setEditingCoupon, setEditingAgreement, isGeneralSaved, isPricingSaved, isCouponConfigSaved, isCategoriesSaved, isPrinterConfigSaved, newPaymentMethod, setNewPaymentMethod, newServiceName, setNewServiceName, newServicePrice, setNewServicePrice, cancellationPassword, setCancellationPassword, discountPassword, setDiscountPassword, parkingLimit, setParkingLimit, localPricingConfig, handlePricingChange, localCouponConfig, handleCouponConfigChange, localPrinterConfig, newCancellationReason, setNewCancellationReason, newAgreementName, setNewAgreementName, newAgreementDiscountType, setNewAgreementDiscountType, newAgreementDiscountValue, setNewAgreementDiscountValue, newAgreementPlates, setNewAgreementPlates, newCouponCode, setNewCouponCode, newCouponDiscount, setNewCouponDiscount, newCouponValidUntil, setNewCouponValidUntil, localCategories, handleCategoryChange, handleSaveGeneralSettings, handleAddPaymentMethod, handleDeletePaymentMethod, handleSetDefaultPaymentMethod, handleAddService, handleDeleteService, handleSavePricing, handleAddCancellationReason, handleDeleteCancellationReason, handleAddAgreement, handleDeleteAgreement, handleSaveCouponConfig, handleAddCoupon, handleDeleteCoupon, handleToggleCouponStatus, handleSaveCategories, handlePrinterProfileChange, handlePrinterWidthChange, handleSavePrinterConfig, handleSaveNfseConfig, handleBackup, handleRestore, printerPresets, handleAddTimeBand, handleUpdateTimeBand, handleDeleteTimeBand, localModules, setLocalModules, handleSaveModules, isModulesSaved } = props;
    if (activeTab === 'general') return (<GeneralSettings {...props} />);
    if (activeTab === 'pricing') return (<PricingSettings {...props} />);
    if (activeTab === 'services') return (<ServicesSettings {...props} />);
    if (activeTab === 'payments') return (<PaymentsSettings {...props} />);
    if (activeTab === 'agreements') return (<AgreementsSettings {...props} />);
    if (activeTab === 'coupons') return (<CouponsSettings {...props} />);
    if (activeTab === 'printing') return (<PrintingSettings {...props} />);
    if (activeTab === 'nfse') return (<NfseSettings nfseConfig={props.localNfseConfig} setNfseConfig={props.setLocalNfseConfig} handleSaveNfseConfig={props.handleSaveNfseConfig} isNfseSaved={props.isNfseSaved} />);
    if (activeTab === 'modulos') return (<ModulesSettings modules={props.localModules} setModules={props.setLocalModules} handleSaveModules={props.handleSaveModules} isModulesSaved={props.isModulesSaved} />);
    if (activeTab === 'backup') return (<BackupSettings {...props} />);

    return null;
}

// --- Modal de Suporte
const SupportModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-[100]" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all border border-slate-200 dark:border-slate-700" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <ChatIcon className="w-8 h-8 text-blue-600" />
                        Suporte FlowEstac
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <p className="text-slate-600 dark:text-slate-400 mb-8 text-lg leading-relaxed">
                    Precisa de ajuda? Nossa equipe está pronta para te atender. Escolha um dos canais abaixo:
                </p>

                <div className="space-y-4">
                    <a
                        href="https://wa.me/5551998595952"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/40 transition-all group"
                    >
                        <div className="bg-green-500 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 dark:text-white">WhatsApp</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">(51) 99859-5952</div>
                        </div>
                    </a>

                    <a
                        href="mailto:flowestac@gmail.com"
                        className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-all group"
                    >
                        <div className="bg-blue-600 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-bold text-slate-800 dark:text-white">E-mail</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">flowestac@gmail.com</div>
                        </div>
                    </a>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-700 text-center">
                    <button
                        onClick={onClose}
                        className="w-full py-3 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

// =================================================================
// MAIN APP COMPONENT
// =================================================================
const App: React.FC = () => {
    const [currentPage, setCurrentPage] = useState<Page>('dashboard');
    const [loggedInUser, setLoggedInUser] = useState<Employee | null>(null);
    const { isDataLoaded, setSystemLogs, generalSettings, setGeneralSettings, nfseConfig } = useData();
    const [updateReady, setUpdateReady] = useState(false);
    const [licenseStatus, setLicenseStatus] = useState<'checking' | 'active' | 'blocked' | 'offline'>('checking');
    const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

    const handleLogout = () => {
        if (loggedInUser) {
            const logoutEvent: SystemLog = { id: new Date().toISOString(), time: new Date(), type: 'Logout', operator: loggedInUser.name };
            setSystemLogs(prev => [...prev, logoutEvent]);
        }
        setLoggedInUser(null);
    };

    // --- License Check ---
    const checkLicense = async () => {
        const GRACE_PERIOD_DAYS = 5;
        const TRIAL_PERIOD_DAYS = 14;
        const ADMIN_CNPJ = '48062404000136'; // Admin CNPJ for bypass
        const now = new Date();

        try {
            let currentStatus: 'checking' | 'active' | 'blocked' | 'offline' = 'checking';

            // Admin bypass
            const cleanCnpj = nfseConfig?.cnpj?.replace(/\D/g, '') || '';
            if (cleanCnpj === ADMIN_CNPJ) {
                console.log('[LICENSE] Admin bypass detectado.');
                setLicenseStatus('active');
                return;
            }

            // Initialize trial if not set
            let installDateStr = generalSettings.installationDate;
            if (!installDateStr) {
                installDateStr = now.toISOString();
                console.log('[LICENSE] Data de instalação não encontrada, inicializando trial hoje:', installDateStr);
                setGeneralSettings((prev: any) => ({ ...prev, installationDate: installDateStr }));
            }

            const installDate = new Date(installDateStr);
            const diffTrialTime = now.getTime() - installDate.getTime();
            const diffTrialDays = Math.floor(diffTrialTime / (1000 * 60 * 60 * 24));
            const isTrialActive = diffTrialDays < TRIAL_PERIOD_DAYS;

            console.log(`[LICENSE] Dias desde instalação: ${diffTrialDays}. Trial ativo: ${isTrialActive}`);

            const getStatusByTrial = () => {
                const status = isTrialActive ? 'active' : 'blocked';
                console.log(`[LICENSE] Aplicando status baseado no Trial: ${status}`);
                return status;
            };

            // Verifica licença via Firebase
            if (nfseConfig && nfseConfig.cnpj && nfseConfig.cnpj.trim() !== '') {
                console.log('[LICENSE] Verificando licença via Firebase para CNPJ:', nfseConfig.cnpj);
                try {
                    const { doc, getDoc } = await import('firebase/firestore');
                    const { db } = await import('./src/services/firebase');

                    // Busca pelo CNPJ apenas números
                    const cleanCnpjQuery = nfseConfig.cnpj.replace(/\D/g, '');
                    const docRef = doc(db, 'licenses', cleanCnpjQuery);
                    const docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        const licenseData = docSnap.data();
                        console.log('[LICENSE] Dados da licença encontrados no Firebase:', licenseData);
                        if (licenseData.status === 'blocked') {
                            currentStatus = 'blocked';
                            console.log('[LICENSE] Status da licença no Firebase é BLOCKED.');
                        } else if (licenseData.status === 'active') {
                            currentStatus = 'active';
                            console.log('[LICENSE] Status da licença no Firebase é ACTIVE.');
                        } else {
                            console.log('[LICENSE] Status desconhecido no Firebase, recorrendo ao Trial.');
                            currentStatus = getStatusByTrial();
                        }
                    } else {
                        console.log('[LICENSE] CNPJ não encontrado no Firebase, recorrendo ao Trial.');
                        currentStatus = getStatusByTrial();
                    }

                    if (currentStatus === 'active') {
                        setGeneralSettings((prev: any) => ({ ...prev, lastLicenseCheck: now.toISOString() }));
                    }
                } catch (firebaseErr: any) {
                    console.error('[LICENSE] Erro ao buscar no Firebase:', firebaseErr.message);
                    // Offline ou erro - verifica período de carência da última verificação bem sucedida
                    const lastCheckStr = generalSettings.lastLicenseCheck;
                    if (lastCheckStr) {
                        const lastCheck = new Date(lastCheckStr);
                        const diffTime = Math.abs(now.getTime() - lastCheck.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        console.log(`[LICENSE] Último check online bem sucedido há ${diffDays} dias.`);

                        if (diffDays > GRACE_PERIOD_DAYS) {
                            console.log(`[LICENSE] Período de carência de ${GRACE_PERIOD_DAYS} dias expirado.`);
                            currentStatus = getStatusByTrial();
                        } else {
                            console.log('[LICENSE] Dentro do período de carência offline, mantendo ACTIVE.');
                            currentStatus = 'active';
                        }
                    } else {
                        console.log('[LICENSE] Nunca houve check online bem sucedido, recorrendo ao Trial.');
                        currentStatus = getStatusByTrial();
                    }
                }
            } else {
                console.log('[LICENSE] CNPJ não informado nas configurações, recorrendo ao Trial.');
                currentStatus = getStatusByTrial();
            }

            setLicenseStatus(currentStatus);

        } catch (err) {
            console.error('[LICENSE] Erro crítico na verificação:', err);
            setLicenseStatus('offline');
        }
    };

    useEffect(() => {
        if (window.electronAPI) {
            window.electronAPI.onUpdateReady(() => {
                setUpdateReady(true);
            });
        }

        checkLicense();
        const interval = setInterval(checkLicense, 1000 * 60 * 30); // 30 min
        return () => clearInterval(interval);
    }, [nfseConfig, generalSettings.lastLicenseCheck]);

    if (!isDataLoaded) {
        return <div className="flex items-center justify-center h-screen"><div className="text-center"><p className="text-lg font-semibold animate-pulse">Carregando dados...</p><p className="text-sm text-slate-500">Por favor, aguarde.</p></div></div>;
    }

    if (!loggedInUser) {
        return <Login onLoginSuccess={setLoggedInUser} />;
    }

    return (
        <AuthContext.Provider value={{ loggedInUser }}>
            <div className="flex h-screen">
                {isSupportModalOpen && <SupportModal onClose={() => setIsSupportModalOpen(false)} />}
                <Sidebar
                    currentPage={currentPage}
                    setCurrentPage={setCurrentPage}
                    loggedInUser={loggedInUser}
                    onLogout={handleLogout}
                    onSupportClick={() => setIsSupportModalOpen(true)}
                    updateReady={updateReady}
                    licenseStatus={licenseStatus}
                    nfseConfig={nfseConfig}
                />
                <div className="flex-1 p-4 overflow-y-auto">
                    {licenseStatus === 'blocked' && <LicenseBlockedScreen onRecheck={checkLicense} />}
                    {currentPage === 'dashboard' && <Dashboard />}
                    {currentPage === 'movements' && <Movements />}
                    {currentPage === 'customers' && <Customers />}
                    {currentPage === 'employees' && <Employees />}
                    {currentPage === 'reports' && <Reports />}
                    {currentPage === 'settings' && <Settings />}
                </div>
            </div>
        </AuthContext.Provider>
    );
};

const AppContainer = () => {
    const [status, setStatus] = useState<'loading' | 'ready' | 'error_api' | 'error_generic'>('loading');
    const [errorDetails, setErrorDetails] = useState('');

    useEffect(() => {
        // Um pequeno atraso para garantir que o preload.js do Electron tenha tempo de injetar a API
        const timer = setTimeout(() => {
            if (typeof window.electronAPI === 'undefined' || typeof window.electronAPI.loadData !== 'function') {
                setStatus('error_api');
                setErrorDetails("A comunicação com o sistema principal (Electron) falhou. A 'electronAPI' não foi encontrada. Verifique se o arquivo 'preload.js' está configurado corretamente no 'main.js'.");
            } else {
                setStatus('ready');
            }
        }, 100); // 100ms de espera

        return () => clearTimeout(timer);
    }, []);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="text-center">
                    <p className="text-lg font-semibold animate-pulse">Inicializando sistema...</p>
                </div>
            </div>
        );
    }

    if (status === 'error_api') {
        return (
            <FatalErrorScreen
                title="Falha na Inicialização"
                message="Não foi possível estabelecer a comunicação com o núcleo da aplicação (Electron)."
                details={errorDetails}
            />
        );
    }

    if (status === 'error_generic') {
        return (
            <FatalErrorScreen
                title="Erro Catastrófico"
                message="A aplicação encontrou um erro irrecuperável durante a inicialização."
                details={errorDetails}
            />
        );
    }

    // Se tudo estiver OK, renderiza o provedor de dados e o app principal
    return (
        <DataProvider>
            <LanguageProvider>
                <App />
            </LanguageProvider>
        </DataProvider>
    );
}

try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
        throw new Error("Elemento 'root' não encontrado no DOM. O index.html está corrompido ou não foi carregado.");
    }
    const root = ReactDOM.createRoot(rootElement);
    root.render(
        <React.StrictMode>
            <ErrorBoundary>
                <AppContainer />
            </ErrorBoundary>
        </React.StrictMode>
    );
} catch (error: any) {
    const rootElement = document.getElementById('root');
    if (rootElement) {
        rootElement.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: center; height: 100vh; padding: 20px; box-sizing: border-box;">
                <div style="max-width: 600px; padding: 20px; border: 2px solid #ef4444; border-radius: 8px; background-color: #fff0f0; color: #333; font-family: sans-serif;">
                    <h1 style="color: #ef4444; font-size: 24px;">Erro Fatal na Inicialização do React</h1>
                    <p>A aplicação não pôde ser iniciada devido a um erro crítico.</p>
                     <details style="margin-top: 20px; white-space: pre-wrap; background-color: #f5f5f5; padding: 10px; border-radius: 4px;">
                        <summary style="cursor: pointer; font-weight: bold;">Detalhes Técnicos</summary>
                        <code style="font-size: 12px; color: #555;">${error.toString()}<br><br>${error.stack}</code>
                    </details>
                </div>
            </div>
        `;
    }
    console.error("Erro fatal ao tentar renderizar a aplicação React:", error);
}
