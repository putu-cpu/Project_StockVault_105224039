import { PackageSearch } from "lucide-react";
import { formatIDR } from "../data/mockData";
import type { Item } from "../types";
import { ProductCatalogActions } from "./ProductRowActions";

interface ProductCatalogTableProps {
  products: Item[];
}

export function ProductCatalogTable({ products }: ProductCatalogTableProps) {
  return (
    <div className="panel mt-4 overflow-hidden">
      <div className="panel-heading">
        <div>
          <h2>CV. Alam Zempol master catalog</h2>
          <p>Product changes sync to hotel order requests; existing order records remain unchanged.</p>
        </div>
        <ProductCatalogActions />
      </div>

      {products.length === 0 ? (
        <div className="empty-state empty-state-compact">
          <span className="empty-state-mark"><PackageSearch aria-hidden="true" size={21} /></span>
          <h2>No products in the catalog</h2>
          <p>Add the first product to make it available to hotel partners.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="record-table">
            <caption className="sr-only">Alam Zempol master product catalog</caption>
            <thead>
              <tr>
                <th scope="col">Product name</th>
                <th scope="col">Category</th>
                <th scope="col">Package size</th>
                <th scope="col" className="text-right">Unit price</th>
                <th scope="col" className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td className="font-medium text-stone-900">{product.name}</td>
                  <td><span className="catalog-category-badge">{product.category}</span></td>
                  <td>{product.size}</td>
                  <td className="text-right font-semibold">{formatIDR(product.unitPrice)}</td>
                  <td className="text-right"><ProductCatalogActions product={product} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="table-footer">
        <span>{products.length} active products in the supplier master list</span>
        <span>Changes are available to new hotel orders immediately</span>
      </div>
    </div>
  );
}
