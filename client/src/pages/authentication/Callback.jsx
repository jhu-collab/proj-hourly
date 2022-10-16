import { useEffect } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import useStoreToken from "../../hooks/useStoreToken";

function Callback() {
  const [searchParams] = useSearchParams();
  const { updateToken } = useStoreToken();

  useEffect(() => {
    const token = searchParams.get("token");
    token && updateToken(token);
  }, [searchParams]);

  return <Navigate to="/" replace={true} />;
}

export default Callback;
