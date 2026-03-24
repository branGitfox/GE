import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { Link } from 'react-router-dom';
import { FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock, FaUserTag, FaImage } from 'react-icons/fa';

const Register = () => {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    mdp: '',
    confirmMdp: '',
    role: 'Admin',
    image: '',
  });
  const [message, setMessage] = useState('');
  const [animate, setAnimate] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimate(true), 100);
  }, []);

  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleFileChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const data = new FormData();
    if (formData.image) data.append('image', formData.image);

    try {
      const url = `${API_URL}/api/users/register`;
      const response = await axios.post(url, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setMessage(response.data.message);
      setFormData({
        nom: '',
        prenom: '',
        email: '',
        mdp: '',
        confirmMdp: '',
        role: 'Admin',
        image: null,
      });
    } catch (error) {
      setMessage(error.response?.data?.message || "Erreur lors de l'inscription ou email déjà utilisé");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex justify-center items-center min-h-screen bg-gradient-to-b from-blue-300 to-blue-500 text-white p-4 overflow-hidden">
      {/* Vagues décoratives */}
      <div className="absolute top-0 left-0 w-full opacity-80">
        <svg className="w-full h-32" viewBox="0 0 1440 150" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,96L48,90.7C96,85,192,75,288,74.7C384,75,480,85,576,101.3C672,117,768,139,864,138.7C960,139,1056,117,1152,101.3C1248,85,1344,75,1392,69.3L1440,64L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path>
        </svg>
      </div>

      <div className="absolute bottom-0 left-0 w-full opacity-80">
        <svg className="w-full h-32" viewBox="0 0 1440 150" preserveAspectRatio="none">
          <path fill="currentColor" d="M0,32L48,37.3C96,43,192,53,288,69.3C384,85,480,107,576,106.7C672,107,768,85,864,74.7C960,64,1056,64,1152,74.7C1248,85,1344,107,1392,117.3L1440,128L1440,150L1392,150C1344,150,1248,150,1152,150C1056,150,960,150,864,150C768,150,672,150,576,150C480,150,384,150,288,150C192,150,96,150,48,150L0,150Z"></path>
        </svg>
      </div>

      {/* Formulaire */}
      <div className={`relative bg - white / 90 backdrop - blur - sm shadow - xl rounded - 2xl p - 8 max - w - md w - full transition - all duration - 500 transform ${animate ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} text - gray - 800 z - 10`}>
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-blue-600 mb-2">Créer un compte</h2>
          <div className="w-20 h-1 bg-blue-400 mx-auto rounded-full"></div>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                <FaUser className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="nom"
                placeholder="Nom"
                value={formData.nom}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                <FaUser className="h-5 w-5" />
              </div>
              <input
                type="text"
                name="prenom"
                placeholder="Prénom"
                value={formData.prenom}
                onChange={handleChange}
                required
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
              />
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
              <FaEnvelope className="h-5 w-5" />
            </div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
              <FaLock className="h-5 w-5" />
            </div>
            <input
              type={showPassword ? "text" : "password"}
              name="mdp"
              placeholder="Mot de passe"
              value={formData.mdp}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-12 py-3 rounded-lg bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400 hover:text-blue-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
              <FaLock className="h-5 w-5" />
            </div>
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmMdp"
              placeholder="Confirmer le mot de passe"
              value={formData.confirmMdp}
              onChange={handleChange}
              required
              className="w-full pl-10 pr-12 py-3 rounded-lg bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent transition"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-blue-400 hover:text-blue-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                <FaUserTag className="h-5 w-5" />
              </div>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg bg-blue-50 border border-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-transparent appearance-none transition"
              >
                <option value="Admin">Admin</option>
                <option value="SuperAdmin">SuperAdmin</option>
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-blue-400">
                <FaImage className="h-5 w-5" />
              </div>
              <input
                type="file"
                name="image"
                onChange={handleFileChange}
                className="w-full opacity-0 absolute inset-0 cursor-pointer"
                id="fileInput"
              />
              <label
                htmlFor="fileInput"
                className="block w-full pl-10 pr-4 py-3 rounded-lg bg-blue-50 border border-blue-100 cursor-pointer truncate transition hover:bg-blue-100"
              >
                {formData.image ? formData.image.name : "Photo de profil"}
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white py-3 px-4 rounded-lg font-semibold shadow-md transition-all transform hover:scale-[1.02] active:scale-100 flex justify-center items-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Création en cours...
              </>
            ) : (
              "S'inscrire"
            )}
          </button>
        </form>

        {message && (
          <div className={`mt - 4 p - 3 rounded - lg text - center animate - fadeIn ${message.includes('succès') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} `}>
            {message.includes('succès') ? (
              <div className="flex items-center justify-center">
                <svg className="h-5 w-5 text-green-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {message}
              </div>
            ) : (
              message
            )}
          </div>
        )}

        <p className="text-center mt-6 text-blue-600">
          Déjà un compte ?{' '}
          <Link to="/login" className="font-semibold text-blue-700 hover:text-blue-800 hover:underline transition">
            Se connecter
          </Link>
        </p>
      </div>

      {/* Styles CSS intégrés */}
      <style jsx>{`
@keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
}
        .animate - fadeIn {
  animation: fadeIn 0.3s ease -in -out;
}
`}</style>
    </div>
  );
};

export default Register;