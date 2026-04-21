export default function InpuOutput() {
  const data = [
    { mois: "Janvier", produit: 'Bouye', entrees: 120, sorties: 80, stock: 40 },
    { mois: "Février", produit: 'Bissap', entrees: 150, sorties: 90, stock: 100 },
    { mois: "Mars", produit: 'Arachide', entrees: 200, sorties: 120, stock: 180 },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="overflow-x-auto">
        <table className="table">
          <thead>
            <tr className="bg-base-200">
              <th>Mois</th>
              <th>Produits</th>
              <th>Entrées</th>
              <th>Sorties</th>
              <th>Stock final</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className="hover:bg-base-100">
                <th>{row.mois}</th>
                <td>{row.produit}</td>
                <td>{row.entrees}</td>
                <td>{row.sorties}</td>
                <td>{row.stock}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
