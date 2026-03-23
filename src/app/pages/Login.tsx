import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Lock, User, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../utils/auth';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800)); // Smooth transition
    
    if (login(username, password)) {
      navigate('/');
    } else {
      setError(true);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden bg-slate-950">
      {/* Dynamic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-600/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="border-none shadow-2xl bg-white/95 backdrop-blur-md rounded-3xl overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500" />
          <CardHeader className="space-y-2 pt-8 text-center">
            <div className="mx-auto bg-indigo-100 w-16 h-16 rounded-2xl flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <CardTitle className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Login</CardTitle>
            <CardDescription className="text-slate-500">
              Enter your credentials to manage forms and data
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    id="username"
                    placeholder="Admin username"
                    className="pl-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                    value={username}
                    autoComplete="username"
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError(false);
                    }}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-11 bg-slate-50 border-slate-200 focus:bg-white transition-all rounded-xl"
                    value={password}
                    autoComplete="current-password"
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(false);
                    }}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-red-500 bg-red-50 p-3 rounded-xl text-sm font-medium"
                >
                  <AlertCircle className="h-4 w-4" />
                  Invalid username or password
                </motion.div>
              )}

              <div className="flex items-start space-x-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100/50 transition-colors cursor-pointer group">
                <Checkbox
                  id="terms"
                  checked={acceptedTerms}
                  onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                  className="mt-0.5 border-slate-300 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                />
                <Label 
                  htmlFor="terms" 
                  className="cursor-pointer text-sm leading-tight text-slate-600 group-hover:text-slate-900 transition-colors font-medium"
                >
                  I accept the <span className="text-indigo-600 font-bold hover:underline">Terms of Use</span> and privacy policy
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                disabled={isLoading || !acceptedTerms}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full"
                  />
                ) : (
                  'Login to Dashboard'
                )}
              </Button>
            </form>
          </CardContent>
          <div className="px-8 pb-8 text-center border-t border-slate-100 pt-6 bg-slate-50/50">
            <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">
              Secure Admin Access Only
            </p>
          </div>
        </Card>
        
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-slate-500 text-sm font-medium">
            Developed by <span className="text-white font-bold">Vuyo Mbanjwa</span>
          </p>
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em] font-black mt-2">
            Professional Cloud Solutions
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login;
