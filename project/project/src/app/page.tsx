

import App from "../App";
import { listProducts } from "./actions/catalog";
import { ProductCatalogTable } from "../components/ProductCatalogTable";

export const dynamic = "force-dynamic";

export default async function Home() {
  const catalog = await listProducts();

  return <App initialCatalog={catalog} catalogTable={<ProductCatalogTable products={catalog} />} />;
}
