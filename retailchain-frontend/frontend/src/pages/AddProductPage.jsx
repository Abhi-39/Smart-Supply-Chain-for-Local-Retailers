import ProductForm from "../components/ProductForm";
import { useNavigate } from "react-router-dom";

export default function AddProductPage() {
  const navigate = useNavigate();

  const onSaved = () => {
    // After save, go back to list
    navigate("/");
  };

  return (
    <div>
      <h2>Add Product</h2>
      <ProductForm onSaved={onSaved} />
    </div>
  );
}
