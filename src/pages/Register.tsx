import { useLocation } from "react-router-dom";
import Registration from "../components/register/register";

export default function RegisterProvider() {
  const location = useLocation();
  const googleData = location.state?.googleData;

  if (!googleData) {
    return <p>Error: No se recibieron datos.</p>;
  }

  return <Registration googleData={googleData} />;
}