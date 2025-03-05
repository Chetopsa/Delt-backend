import React from 'react';


const Login = () => {

    // const {validated, setValidatedWithExpiration} = useValidation();
    // console.log("protected routes " + validated);

    window.location.href = process.env.REACT_APP_BACKENDURL +'/auth/google'; //redirect user to backend for authentification
    // setValidatedWithExpiration();
    // console.log("protected routes " + validated);
  return (
    <div>login</div>
  )
}

export default Login;

