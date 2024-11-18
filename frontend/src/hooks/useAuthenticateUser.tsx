import { useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { userContext } from "../context/UserContext";

// This hook is used to authenticate the user. If the user is not authenticated, the user is redirected to the login page, otherwise the user is redirected to the dashboard page.
export function useAuthenticateUser() {
    const navigate = useNavigate();
    const { setUser } = useContext(userContext);

    useEffect(() => {
        fetch('/authenticate_current_user')
            .then(response => {
                if (response.status === 200) {
                    return response.json();
                } else {
                    // get redirect URL
                    console.log('Failed to get user');
                    navigate('/login');
                }
            })
            .then(data => {
                if (data && data.user) {
                    setUser(data.user);
                } else {
                    navigate('/login');
                }
            })
            .catch(error => {
                console.error('Error fetching user:', error);
                navigate('/login');
            });
    }, [navigate, setUser]);
}
