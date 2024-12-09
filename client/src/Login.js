import { useState, useEffect, useRef, useContext} from 'react';
import AuthContext from './server/contextCheck/AuthProvider'; //importing AuthContext from AuthProvider
import axios from 'axios'; //axios import for http requests // import axios from './api/axios'; <- debugging
const LOGIN_URL = 'http://localhost:3001/auth'; //login url

//login component
const Login = ({ onLogin, socket }) => {

    const { setAuth } = useContext(AuthContext); //useContext hook to access setAuth function
    const userRef = useRef(); //userRef for user
    const errorRef = useRef();//errorRef for error

    const [username, setUser] = useState(''); //username state
    const [password, setPwd] = useState(''); //password state
    const [errMsg, setErrMsg] = useState(''); //error message state
    const [success, setSuccess] = useState(''); //success state

    useEffect(() => {
        setErrMsg('');
    }, [username, password]);

    //async function to handle login
    const handleSubmit = async (e) => {
        e.preventDefault(); //preventing default submit
       
        try {
            const response = await axios.post(LOGIN_URL,  //POST req to login url
                JSON.stringify({ username, password }), //stringify username and password
                {
                    headers: {'Content-Type': 'application/json'},
                    withCredentials: true
                }
            );
            console.log(JSON.stringify(response?.data)); //logging response data
            const accessToken = response?.data?.accessToken; //access token from response
            const roles = response?.data?.roles; //roles from response - not implemented
            setAuth({ username, password, roles, accessToken}); //setting auth with username, password, roles(not implemented) and accessToken
            setUser(''); //resetting user
            setPwd(''); //resetting password
            
            setSuccess(true); //setting success to true

            //emit a "login" event with the username
            socket.emit('login', username);

            onLogin(username); //calling onLogin with username
        
        } catch (err) { //catching errors
            if (!err?.response){
                setErrMsg('No response :(');
            }else if (err.response?.status === 400) {
                setErrMsg('Invalid username or password');
            }else if (err.response?.status === 401) {
                setErrMsg('Unauthorized');
            }else{
                setErrMsg('Login Failed');
            }
        } 
        
    }//x
    
    return (
        <>

        {success ? (
            <section>
                <h1>Logged in!</h1>
                <br />
                <p>
                    <a href="#">Go to Home</a>
                </p>   
            </section>
            ) : (

        <section className="signInBox">
           <p ref={errorRef} className={errMsg ? "errmsg" : "offscreen"} aria-live="assertive">{errMsg}</p>
           <h1>Sign In</h1>
           <form onSubmit={handleSubmit}>
                <label htmlFor="username">Username</label>
                <input 
                type="text" 
                id="username"
                ref={userRef}
                autoComplete='off'
                onChange={(e) => setUser(e.target.value)}
                value={username}
                required
                />
                <label htmlFor="password">Password:</label>
                <input 
                type="password" 
                id="password"
                onChange={(e) => setPwd(e.target.value)}
                value={password}
                required
                />
                <button>Sign In</button>
           </form>
           <p>
            Need an Account?<br />
            <span className='line'>
                <a href="#">Sign Up</a>
            </span>
           </p>
        </section>
        )}

        </>
    );
};

export default Login;