
export async function requestAuth() {
    let ret = null;
    await fetch(process.env.REACT_APP_BACKENDURL +'/api/validation', {
        method: 'GET',
        credentials: 'include', // ensure cookies are sent with the request
    })
        .then(res => res.json())
        .then(data => {
            console.log(data);
            if (data.authorized) {
                if (data.isAdmin) {
                    ret = { authorized: true, isAdmin: true };
                } else {
                    ret = { authorized: true, isAdmin: false };
                }
                // console.log("if is authenitcated ret is: " + ret);
            } else {
                ret = { authorized: false, isAdmin: false };
            }
        })
        .catch(err => {
            // console.log('Error fetching validation data:', err);
            ret = { authorized: false, isAdmin: false };
        });
    return ret;
}
