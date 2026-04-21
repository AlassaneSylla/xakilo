import React, {createContext, useContext, useState} from "react";

type Product = {
  productName: string;
  category: string;
  reference: string;
  stock: number;
  alert: number,
  unitPrice: number;
  purchasePrice: number;
};

type Entry = {
  product: string;
  category: string;
  dateRegister: Date;
  quantity: number;
  supplier: string;
  reference: string;
};

type Removal = {
  product: string;        
  category: string;       
  dateRegister: Date;     
  quantity: number;       
  destination: "vente" | "perte" | "autre";  // client, service interne ou perte
  reference: string;      
};

export type Invoice = {
  reference: string;
  date: Date;
  client: string;
  totalAmount: number;
  paymentStatus: 'Payée' | 'En attente' | 'Annulée';
};

//difine the type contexte
type DataContextType = {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  entries: Entry[];
  setEntries: React.Dispatch<React.SetStateAction<Entry[]>>;
  removals: Removal[];
  setRemovals: React.Dispatch<React.SetStateAction<Removal[]>>;
  invoices: Invoice[];
  setInvoices: React.Dispatch<React.SetStateAction<Invoice[]>>;
}

//create the context
const DataContext = createContext<DataContextType | undefined>(undefined);

//providers : 
export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([
      { productName: 'Clavier mécanique AZERTY Logitech', category: 'Informatique', reference: 'PROD-0001', stock: 125, unitPrice: 15000, purchasePrice: 12000, alert: 20 },
      { productName: 'Souris sans fil HP', category: 'Informatique', reference: 'PROD-0002', stock: 75, unitPrice: 3500, purchasePrice: 2800, alert: 15 },
      { productName: 'Écran LED Samsung 24', category: 'Électronique', reference: 'PROD-0003', stock: 100, unitPrice: 250000, purchasePrice: 210000, alert: 10 },
      { productName: 'Chaise ergonomique de bureau', category: 'Mobilier', reference: 'PROD-0004', stock: 50, unitPrice: 45000, purchasePrice: 38000, alert: 10 },
      { productName: 'Bureau en bois massif', category: 'Mobilier', reference: 'PROD-0005', stock: 80, unitPrice: 110000, purchasePrice: 90000, alert: 10 },
      { productName: 'Imprimante LaserJet Pro HP', category: 'Électronique', reference: 'PROD-0006', stock: 55, unitPrice: 35000, purchasePrice: 31000, alert: 10 },
      { productName: 'Tapis de souris ergonomique', category: 'Informatique', reference: 'PROD-0007', stock: 200, unitPrice: 2000, purchasePrice: 1500, alert: 10 },
      { productName: 'Clé USB 64Go SanDisk', category: 'Électronique', reference: 'PROD-0008', stock: 100, unitPrice: 4000, purchasePrice: 3200, alert: 10 },
      { productName: 'Disque dur externe 1To Seagate', category: 'Informatique', reference: 'PROD-0009', stock: 8, unitPrice: 70000, purchasePrice: 60000, alert: 20 },
      { productName: 'Lampe de bureau LED', category: 'Électronique', reference: 'PROD-0010', stock: 300, unitPrice: 5000, purchasePrice: 4200, alert: 10 },
      { productName: 'Ordinateur portable Dell Latitude', category: 'Informatique', reference: 'PROD-0011', stock: 10, unitPrice: 550000, purchasePrice: 500000, alert: 5 },
      { productName: 'Tablette Apple iPad 10.2"', category: 'Électronique', reference: 'PROD-0012', stock: 40, unitPrice: 480000, purchasePrice: 420000, alert: 8 },
      { productName: 'HP Pavilion 15', category: 'Informatique', reference: 'PROD-0013', stock: 60, unitPrice: 520000, purchasePrice: 470000, alert: 10 },
      { productName: 'Table de réunion 6 places', category: 'Mobilier', reference: 'PROD-0014', stock: 20, unitPrice: 180000, purchasePrice: 150000, alert: 5 },
      { productName: 'Console PlayStation 5', category: 'Électronique', reference: 'PROD-0015', stock: 48, unitPrice: 600000, purchasePrice: 500000, alert: 10 }
  ])

  const [entries, setEntries] = useState<Entry[]>([
    { product: 'Clavier mécanique AZERTY Logitech', category: 'Informatique', dateRegister: new Date('2025-01-15'), quantity: 40, supplier: 'TechCorp', reference: 'PROD-0001' },
    { product: 'Souris sans fil HP', category: 'Informatique', dateRegister: new Date('2025-02-10'), quantity: 25, supplier: 'TechCorp', reference: 'PROD-0002' },
    { product: 'Écran LED Samsung 24', category: 'Électronique', dateRegister: new Date('2025-03-05'), quantity: 15, supplier: 'ElecPro', reference: 'PROD-0003' },
    { product: 'Chaise ergonomique de bureau', category: 'Mobilier', dateRegister: new Date('2025-04-22'), quantity: 10, supplier: 'Mobility Design', reference: 'PROD-0004' },
    { product: 'Bureau en bois massif', category: 'Mobilier', dateRegister: new Date('2025-05-03'), quantity: 12, supplier: 'Wood & Co', reference: 'PROD-0005' },
    { product: 'Imprimante LaserJet Pro HP', category: 'Électronique', dateRegister: new Date('2025-05-20'), quantity: 8, supplier: 'ElecPro', reference: 'PROD-0006' },
    { product: 'Tapis de souris ergonomique', category: 'Informatique', dateRegister: new Date('2025-06-15'), quantity: 100, supplier: 'TechCorp', reference: 'PROD-0007' },
    { product: 'Clé USB 64Go SanDisk', category: 'Électronique', dateRegister: new Date('2025-06-28'), quantity: 60, supplier: 'DataZone', reference: 'PROD-0008' },
    { product: 'Disque dur externe 1To Seagate', category: 'Informatique', dateRegister: new Date('2025-07-10'), quantity: 25, supplier: 'StoragePlus', reference: 'PROD-0009' },
    { product: 'Lampe de bureau LED', category: 'Électronique', dateRegister: new Date('2025-08-05'), quantity: 50, supplier: 'LightHouse', reference: 'PROD-0010' },
    { product: 'Ordinateur portable Dell Latitude', category: 'Informatique', dateRegister: new Date('2025-08-27'), quantity: 15, supplier: 'Infinity Services', reference: 'PROD-0011' },
    { product: 'Tablette Apple iPad 10.2"', category: 'Électronique', dateRegister: new Date('2025-09-15'), quantity: 20, supplier: 'Apple SN', reference: 'PROD-0012' },
    { product: 'Console PlayStation 5', category: 'Électronique', dateRegister: new Date('2025-10-01'), quantity: 10, supplier: 'GamingWorld', reference: 'PROD-0015' },
    { product: 'Clavier mécanique AZERTY Logitech', category: 'Informatique', dateRegister: new Date('2025-11-25'), quantity: 20, supplier: 'TechCorp', reference: 'PROD-0001' },
  ])

  const [removals, setRemovals] = useState<Removal[]>([
      { product: 'Clavier mécanique AZERTY Logitech', category: 'Informatique', dateRegister: new Date('2025-02-10'), quantity: 15, destination: 'vente', reference: 'PROD-0001' },
      { product: 'Souris sans fil HP', category: 'Informatique', dateRegister: new Date('2025-03-18'), quantity: 10, destination: 'vente', reference: 'PROD-0002' },
      { product: 'Écran LED Samsung 24', category: 'Électronique', dateRegister: new Date('2025-04-02'), quantity: 8, destination: 'vente', reference: 'PROD-0003' },
      { product: 'Chaise ergonomique de bureau', category: 'Mobilier', dateRegister: new Date('2025-04-28'), quantity: 3, destination: 'vente', reference: 'PROD-0004' },
      { product: 'Bureau en bois massif', category: 'Mobilier', dateRegister: new Date('2025-05-12'), quantity: 4, destination: 'vente', reference: 'PROD-0005' },
      { product: 'Imprimante LaserJet Pro HP', category: 'Électronique', dateRegister: new Date('2025-06-08'), quantity: 5, destination: 'vente', reference: 'PROD-0006' },
      { product: 'Clé USB 64Go SanDisk', category: 'Électronique', dateRegister: new Date('2025-07-05'), quantity: 20, destination: 'vente', reference: 'PROD-0008' },
      { product: 'Disque dur externe 1To Seagate', category: 'Informatique', dateRegister: new Date('2025-08-02'), quantity: 8, destination: 'perte', reference: 'PROD-0009' },
      { product: 'Lampe de bureau LED', category: 'Électronique', dateRegister: new Date('2025-08-20'), quantity: 12, destination: 'vente', reference: 'PROD-0010' },
      { product: 'Ordinateur portable Dell Latitude', category: 'Informatique', dateRegister: new Date('2025-09-25'), quantity: 6, destination: 'vente', reference: 'PROD-0011' },
      { product: 'Console PlayStation 5', category: 'Électronique', dateRegister: new Date('2025-10-03'), quantity: 4, destination: 'autre', reference: 'PROD-0015' }      
  ])

  const [invoices, setInvoices] = useState<Invoice[]>([
    { reference: 'INV001', date: new Date('2025-09-25'), client: 'John Doe', totalAmount: 250000, paymentStatus: 'Payée'},
    { reference: 'INV002', date: new Date('2025-10-02'), client: 'Awa Ndiaye', totalAmount: 78000, paymentStatus: 'En attente' },
    { reference: 'INV003', date: new Date('2025-09-15'), client: 'TechCorp', totalAmount: 450000, paymentStatus: 'Payée' },
    { reference: 'INV004', date: new Date('2025-10-10'), client: 'TechCorp', totalAmount: 15000, paymentStatus: 'Payée' },
  ]);

  return (
    <DataContext.Provider value={{ products, setProducts, entries, setEntries, removals, setRemovals, invoices, setInvoices }}>
      {children}
    </DataContext.Provider>
  );
};

// ---- Hook d’accès simplifié ----
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};