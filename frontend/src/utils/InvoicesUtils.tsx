
import type { Invoice } from "../context/DataContext";

export function calculateTotals(invoices: Invoice[]) {

    const now = new Date()
    //get invoices of the day
    const numberOfInvoicesOfTheDay = invoices.filter(inv => {
    const invDate = new Date(inv.date);
        return (
            invDate.getDate() === now.getDate() &&
            invDate.getMonth() === now.getMonth() &&
            invDate.getFullYear() === now.getFullYear()
        );
    });

    //recette journalier
    const totalToday = invoices
    .filter(inv => new Date(inv.date).toDateString() === now.toDateString())
    .reduce((sum, inv) => sum + inv.totalAmount, 0)
    //Rectte du mois
    const totalMonth = invoices
    .filter(inv => {
        const d = new Date(inv.date);
        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((sum, inv) => sum + inv.totalAmount, 0)
    //recette annuelle
    const totalYear = invoices
    .filter(inv => new Date(inv.date).getFullYear() === now.getFullYear())
    .reduce((sum, inv) => sum + inv.totalAmount, 0)
    return { totalToday, totalMonth, totalYear, numberOfInvoicesOfTheDay };
}
 