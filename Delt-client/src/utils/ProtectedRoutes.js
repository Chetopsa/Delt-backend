import React, {useLayoutEffect, useState} from 'react'
import { Outlet, Navigate, useLocation  } from "react-router-dom";
import { requestAuth } from './requestAuth';

function ProtectedRoutes() {
    const location = useLocation(); // for checking admin routes

    const [validated, setValidated] = useState([]);
    const [admin, setAdmin] = useState([]);
    // const {validated} = useValidation();
    // console.log("protected routes " + validated);
    // // Handle loading state if validation is still being checked

    // if (validated === null) {
    //     return <div>Loading...</div>; // replace with loading ui
    // }
    
    // console.log("validated value right after declaration:  " + validated);
    useLayoutEffect(() => {
        (async () => {
            const isValidated = await requestAuth();
            // console.log("isValidated: " + isValidated);
            setValidated(isValidated.authorized);
            setAdmin(isValidated.isAdmin);
        })();
    }, []);
   
    // console.log("is validated a truthy?: " + (validated == true));
    const isAdminRoute = location.pathname.startsWith('/admin');
    // console.log("is admin route: " + isAdminRoute);

    if (!validated) {
        return <Navigate to="/login"/>;
    }
    if (isAdminRoute && !admin) {
        return <Navigate to="/unauthorized"/>;
    }
    return <Outlet/>;
}
export default ProtectedRoutes