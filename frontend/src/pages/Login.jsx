import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext, useAuth } from '../context/authContext';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { RotatingLines } from 'react-loader-spinner';
import logo from '../img/logo2.png';
import { validRoutes } from '../components/routes';
import { API_URL } from '../config';


const OceanWaves = () => (
  <div className="absolute bottom-0 left-0 w-full overflow-hidden">
    <svg
      viewBox="0 0 1440 320"
      className="relative w-full h-20"
      preserveAspectRatio="none"
    >
      <path
        fill="#ffffff"
        fillOpacity="1"
        d="M0,160L48,149.3C96,139,192,117,288,128C384,139,480,181,576,192C672,203,768,181,864,160C960,139,1056,117,1152,117.3C1248,117,1344,139,1392,149.3L1440,160L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
      ></path>
    </svg>
  </div>
);

const Curves = () => (
  <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
    <svg
      viewBox="0 0 1440 320"
      className="absolute top-0 left-0 w-full h-full"
      preserveAspectRatio="none"
    >
      <path
        fill="#ffffff"
        fillOpacity="0.1"
        d="M0,160L48,149.3C96,139,192,117,288,128C384,139,480,181,576,192C672,203,768,181,864,160C960,139,1056,117,1152,117.3C1248,117,1344,139,1392,149.3L1440,160L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"
      ></path>
    </svg>
  </div>
);

const Login = () => {
  const [email, setEmail] = useState('');
  const [mdp, setMdp] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { user } = useContext(AuthContext);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  useEffect(() => {
    if (user) {
      const lastRoute = localStorage.getItem('lastVisitedPath') || '/dashboard';
      const allowedRoutes = user.permissions || validRoutes[user.role] || [];
      const defaultRoute = user.role === 'SuperAdmin' ? '/dashboard/users' : '/dashboard/clients';

      // Redirige seulement si la route est valide
      navigate(allowedRoutes.includes(lastRoute) ? lastRoute : defaultRoute);
    }
  }, [user, navigate]);


  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError('');
      }, 3000);

      // Nettoyez le timer si le composant est démonté ou si error change avant les 3s
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_URL}/api/users/login`, { email, mdp });
      const { token, user: backendUser } = response.data;
      const { role, email: userEmail, id, nom, prenom, image, permissions } = backendUser;
      const userData = { email: userEmail, role, id, nom, prenom, image, permissions };

      console.log('🔑 Login successful, saving token:', token);
      localStorage.setItem('token', token);
      login(userData, token);
      localStorage.setItem('user', JSON.stringify(userData));

      const currentUrl = window.location.pathname;
      if (currentUrl === "/dashboard/produits" || currentUrl === "/dashboard/clients") {
        navigate(currentUrl);
      } else if (role === 'SuperAdmin') {
        navigate('/dashboard/users');
      } else if (permissions && permissions.length > 0) {
        navigate(permissions[0]);
      } else if (role === "Admin") {
        navigate('/dashboard/clients');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-gradient-to-br from-blue-400 via-blue-300 to-blue-600 min-h-screen flex items-center justify-center relative">
        <div className="absolute top-0 left-0 w-full h-full bg-blue-500 opacity-30"></div>
        <Curves />
        <OceanWaves />

        <div className="w-full max-w-4xl bg-white shadow-2xl rounded-lg flex overflow-hidden border-8 border-blue-600 relative z-10">
          <div className="w-3/4 bg-blue-200 p-8 flex justify-center items-center relative">
            <img src={'/soa.png'} alt="Connexion illustration" className="w-tiny h-tiny object-cover opacity-90 rounded-lg transform scale-60 transition duration-500 ease-in-out hover:scale-110" />
          </div>

          <div className="w-1/2 bg-white p-8 flex flex-col justify-center items-start space-y-6 relative z-10">
            <h1 className="text-4xl font-extrabold text-gray-800 leading-tight text-shadow-lg">Bienvenue</h1>

            <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
              <div className="input-group">
                <label htmlFor="email" className="text-sm text-gray-600">Email</label>
                <div className="input-with-icon relative">
                  <FaEnvelope className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="email"
                    type="text"
                    placeholder="Entrer votre email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 pl-10 bg-gray-100 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out hover:ring-blue-400"
                  />
                </div>
              </div>

              <div className="input-group">
                <label htmlFor="mdp" className="text-sm text-gray-600">Mot de passe</label>
                <div className="input-with-icon relative">
                  <FaLock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    id="mdp"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Entrer votre mot de passe"
                    value={mdp}
                    onChange={(e) => setMdp(e.target.value)}
                    className="w-full p-3 pl-10 bg-gray-100 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-300 ease-in-out hover:ring-blue-400"
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer" onClick={togglePasswordVisibility}>
                    {showPassword ? <FaEyeSlash className="text-gray-500" /> : <FaEye className="text-gray-500" />}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300 ease-in-out flex justify-center items-center"
                disabled={loading}
              >
                {loading ? (
                  <RotatingLines strokeColor="white" strokeWidth="5" animationDuration="0.75" width="25" visible={true} />
                ) : (
                  'Se connecter'
                )}
              </button>
            </form>

            {error && <p className="text-red-500 text-sm">{error}</p>}
            <p className="mt-4 text-sm text-gray-600">
              Pas encore de compte ? <Link to="/register" className="text-blue-500 hover:underline">Créer un compte</Link>
            </p>
          </div>
        </div>

      </div>


    </div>
  );
};

export default Login;