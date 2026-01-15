import AppRoutes from "./routes/AppRoutes";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      {/* các component khác */}
      <AppRoutes />
    </>
  );
}

export default App;