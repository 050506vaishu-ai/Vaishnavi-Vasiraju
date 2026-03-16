/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Phone, 
  ChevronRight, 
  ChevronLeft, 
  Scale, 
  Target, 
  Apple, 
  ChefHat, 
  Camera, 
  BarChart3, 
  CheckCircle2,
  Loader2,
  Upload,
  User,
  Heart,
  Zap,
  Dumbbell,
  Activity
} from 'lucide-react';
import Markdown from 'react-markdown';
import { cn } from './lib/utils';
import { generateRecipe, analyzeMealImage } from './services/gemini';

// --- Types ---
type DietType = 'Vegetarian' | 'Non-Vegetarian' | 'Vegan';
type Goal = 'Weight Loss' | 'Weight Gain' | 'Muscle Gain' | 'Fitness Maintenance' | 'Healthy Lifestyle' | 'Diabetes Control' | 'Heart Health';

interface UserData {
  phone: string;
  height: string;
  weight: string;
  age: string;
  dietType: DietType;
  goals: Goal[];
  selectedIngredients: string[];
  recipe: string;
  mealAnalysis: string;
}

const STEPS = [
  'Login',
  'Health Details',
  'Goals',
  'Ingredients',
  'Recipe',
  'Track',
  'Report'
];

export default function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<UserData>({
    phone: '',
    height: '',
    weight: '',
    age: '',
    dietType: 'Vegetarian',
    goals: [],
    selectedIngredients: [],
    recipe: '',
    mealAnalysis: ''
  });

  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);

  // --- Handlers ---
  const handleNext = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
  const handleBack = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpSent) {
      setLoading(true);
      setTimeout(() => {
        setIsOtpSent(true);
        setLoading(false);
      }, 1500);
    } else {
      if (otp === '123456') { // Mock OTP
        handleNext();
      } else {
        alert('Invalid OTP. Use 123456 for demo.');
      }
    }
  };

  const handleGenerateRecipe = async () => {
    setLoading(true);
    try {
      const recipe = await generateRecipe(
        userData.selectedIngredients, 
        userData.goals[0] || 'Healthy Lifestyle', 
        userData.dietType
      );
      setUserData(prev => ({ ...prev, recipe: recipe || '' }));
      handleNext();
    } catch (error) {
      console.error(error);
      alert('Failed to generate recipe. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(',')[1];
      try {
        const analysis = await analyzeMealImage(base64);
        setUserData(prev => ({ ...prev, mealAnalysis: analysis || '' }));
        handleNext();
      } catch (error) {
        console.error(error);
        alert('Failed to analyze image.');
      } finally {
        setLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // --- Components ---
  const StepWrapper = ({ children, title, description, icon: Icon, colorClass }: { children: React.ReactNode, title: string, description: string, icon?: any, colorClass: string }) => (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -20 }}
      className="w-full max-w-2xl mx-auto"
    >
      <div className="mb-8 text-center">
        <div className={cn("w-20 h-20 mx-auto mb-6 rounded-3xl flex items-center justify-center shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300", colorClass)}>
          {Icon && <Icon className="w-10 h-10 text-white" />}
        </div>
        <h2 className="text-4xl font-black font-display text-white mb-3 drop-shadow-md">{title}</h2>
        <p className="text-indigo-100 font-medium">{description}</p>
      </div>
      <div className="glass-card rounded-[2.5rem] p-10 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
        {children}
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen py-12 px-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-pink-500/20 blur-[120px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full animate-pulse delay-700" />

      {/* Progress Bar */}
      <div className="max-w-4xl mx-auto mb-16 relative z-10">
        <div className="flex justify-between items-center relative">
          <div className="absolute top-1/2 left-0 w-full h-1.5 bg-white/10 -translate-y-1/2 z-0 rounded-full" />
          <div 
            className="absolute top-1/2 left-0 h-1.5 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 -translate-y-1/2 z-0 transition-all duration-700 rounded-full shadow-[0_0_15px_rgba(236,72,153,0.5)]" 
            style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
          />
          {STEPS.map((step, idx) => (
            <div key={step} className="relative z-10 flex flex-col items-center">
              <div className={cn(
                "w-12 h-12 rounded-2xl flex items-center justify-center text-sm font-black transition-all duration-500 transform",
                idx <= currentStep 
                  ? "bg-white text-indigo-600 shadow-[0_8px_20px_rgba(255,255,255,0.3)] scale-110 rotate-6" 
                  : "bg-white/10 text-white/40 border-2 border-white/10 backdrop-blur-sm"
              )}>
                {idx < currentStep ? <CheckCircle2 className="w-6 h-6 text-emerald-500" /> : idx + 1}
              </div>
              <span className={cn(
                "mt-3 text-[10px] uppercase tracking-[0.2em] font-black hidden md:block drop-shadow-sm",
                idx <= currentStep ? "text-white" : "text-white/30"
              )}>
                {step}
              </span>
            </div>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Login */}
        {currentStep === 0 && (
          <StepWrapper 
            key="step0"
            title="NutriAI" 
            description="Your journey to a colorful, healthy life starts here."
            icon={Zap}
            colorClass="bg-gradient-to-br from-pink-500 to-rose-600"
          >
            <form onSubmit={handleLogin} className="space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-black text-slate-700 uppercase tracking-widest">Phone Number</label>
                <div className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-300" />
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500 w-6 h-6" />
                    <input 
                      type="tel" 
                      required
                      placeholder="+1 234 567 8900"
                      className="w-full pl-14 pr-6 py-5 rounded-2xl border-none bg-indigo-50/50 text-indigo-900 font-bold placeholder:text-indigo-300 focus:ring-0 outline-none transition-all text-lg"
                      value={userData.phone}
                      onChange={e => setUserData({...userData, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {isOtpSent && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                  <label className="block text-sm font-black text-slate-700 uppercase tracking-widest text-center">Verification Code</label>
                  <div className="flex justify-center">
                    <input 
                      type="text" 
                      required
                      placeholder="••••••"
                      maxLength={6}
                      className="w-full max-w-[280px] px-6 py-5 rounded-2xl border-none bg-indigo-50 text-indigo-900 font-black text-3xl text-center tracking-[0.5em] focus:ring-4 focus:ring-pink-500/20 outline-none transition-all shadow-inner"
                      value={otp}
                      onChange={e => setOtp(e.target.value)}
                    />
                  </div>
                  <p className="text-xs text-indigo-400 text-center font-bold">Demo Code: <span className="text-pink-500">123456</span></p>
                </motion.div>
              )}

              <button 
                type="submit"
                disabled={loading}
                className="w-full relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-2xl blur opacity-40 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt" />
                <div className="relative w-full bg-slate-900 text-white font-black py-5 rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 text-lg uppercase tracking-widest">
                  {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : (isOtpSent ? 'Unlock My Plan' : 'Get Started')}
                  {!loading && <ChevronRight className="w-6 h-6" />}
                </div>
              </button>
              
              {!isOtpSent && (
                <div className="pt-4 text-center">
                  <p className="text-slate-400 font-bold">
                    New to NutriAI? <button type="button" className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600 font-black hover:opacity-80 transition-opacity">Create Account</button>
                  </p>
                </div>
              )}
            </form>
          </StepWrapper>
        )}

        {/* Step 2: Health Details */}
        {currentStep === 1 && (
          <StepWrapper 
            key="step1"
            title="Body Stats" 
            description="Let's get the numbers right for your perfect diet."
            icon={User}
            colorClass="bg-gradient-to-br from-cyan-400 to-blue-600"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { label: 'Height (cm)', key: 'height', icon: Scale, color: 'bg-blue-100 text-blue-600' },
                { label: 'Weight (kg)', key: 'weight', icon: Scale, color: 'bg-emerald-100 text-emerald-600' },
                { label: 'Age', key: 'age', icon: Activity, color: 'bg-purple-100 text-purple-600' },
              ].map(field => (
                <div key={field.key} className="space-y-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">{field.label}</label>
                  <div className="relative">
                    <div className={cn("absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg", field.color)}>
                      <field.icon className="w-4 h-4" />
                    </div>
                    <input 
                      type="number" 
                      className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-lg"
                      value={(userData as any)[field.key]}
                      onChange={e => setUserData({...userData, [field.key]: e.target.value})}
                    />
                  </div>
                </div>
              ))}
              <div className="space-y-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Diet Type</label>
                <div className="grid grid-cols-1 gap-2">
                  {['Vegetarian', 'Non-Vegetarian', 'Vegan'].map(type => (
                    <button
                      key={type}
                      onClick={() => setUserData({...userData, dietType: type as DietType})}
                      className={cn(
                        "py-3 px-4 rounded-xl font-bold text-sm transition-all border-2",
                        userData.dietType === type 
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-200" 
                          : "bg-white text-slate-600 border-slate-100 hover:border-indigo-200"
                      )}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={handleBack} className="flex-1 py-4 rounded-2xl border-2 border-slate-100 font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-sm">Back</button>
              <button onClick={handleNext} className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-black hover:opacity-90 shadow-xl shadow-blue-200 transition-all uppercase tracking-widest text-sm">Next Step</button>
            </div>
          </StepWrapper>
        )}

        {/* Step 3: Goals */}
        {currentStep === 2 && (
          <StepWrapper 
            key="step2"
            title="Your Mission" 
            description="What are we aiming for today?"
            icon={Target}
            colorClass="bg-gradient-to-br from-purple-500 to-indigo-700"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { id: 'Weight Loss', icon: Scale, color: 'bg-blue-500' },
                { id: 'Weight Gain', icon: Scale, color: 'bg-orange-500' },
                { id: 'Muscle Gain', icon: Dumbbell, color: 'bg-red-500' },
                { id: 'Fitness Maintenance', icon: Activity, color: 'bg-emerald-500' },
                { id: 'Healthy Lifestyle', icon: Heart, color: 'bg-pink-500' },
                { id: 'Diabetes Control', icon: Zap, color: 'bg-yellow-500' },
                { id: 'Heart Health', icon: Heart, color: 'bg-rose-600' }
              ].map(goal => (
                <button
                  key={goal.id}
                  onClick={() => {
                    const goals = userData.goals.includes(goal.id as Goal)
                      ? userData.goals.filter(g => g !== goal.id)
                      : [...userData.goals, goal.id as Goal];
                    setUserData({...userData, goals});
                  }}
                  className={cn(
                    "p-5 rounded-[2rem] border-4 transition-all flex items-center gap-4 text-left group",
                    userData.goals.includes(goal.id as Goal) 
                      ? "border-indigo-500 bg-indigo-50 shadow-lg" 
                      : "border-slate-50 hover:border-indigo-100 hover:bg-slate-50"
                  )}
                >
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 transition-transform", goal.color)}>
                    <goal.icon className="w-6 h-6" />
                  </div>
                  <span className={cn("font-black text-sm uppercase tracking-tight", userData.goals.includes(goal.id as Goal) ? "text-indigo-900" : "text-slate-600")}>
                    {goal.id}
                  </span>
                </button>
              ))}
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={handleBack} className="flex-1 py-4 rounded-2xl border-2 border-slate-100 font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-sm">Back</button>
              <button onClick={handleNext} className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black hover:opacity-90 shadow-xl shadow-indigo-200 transition-all uppercase tracking-widest text-sm">Continue</button>
            </div>
          </StepWrapper>
        )}

        {/* Step 4: Ingredients */}
        {currentStep === 3 && (
          <StepWrapper 
            key="step3"
            title="The Pantry" 
            description="Pick the colors of your plate."
            icon={Apple}
            colorClass="bg-gradient-to-br from-emerald-400 to-teal-600"
          >
            <div className="space-y-8">
              {[
                { category: 'Veggies', items: ['Spinach', 'Broccoli', 'Carrots', 'Tomato', 'Cucumber', 'Bell Peppers'], color: 'bg-emerald-500' },
                { category: 'Proteins', items: ['Chicken', 'Mutton', 'Fish', 'Eggs', 'Tofu', 'Paneer', 'Lentils'], color: 'bg-rose-500' },
                { category: 'Fruits', items: ['Apple', 'Banana', 'Berries', 'Orange', 'Avocado'], color: 'bg-orange-500' },
                { category: 'Dairy & Grains', items: ['Milk', 'Yogurt', 'Cheese', 'Quinoa', 'Oats', 'Brown Rice'], color: 'bg-blue-500' }
              ].map(cat => (
                <div key={cat.category} className="space-y-4">
                  <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] pl-2">{cat.category}</h4>
                  <div className="flex flex-wrap gap-3">
                    {cat.items.map(item => (
                      <button
                        key={item}
                        onClick={() => {
                          const items = userData.selectedIngredients.includes(item)
                            ? userData.selectedIngredients.filter(i => i !== item)
                            : [...userData.selectedIngredients, item];
                          setUserData({...userData, selectedIngredients: items});
                        }}
                        className={cn(
                          "px-6 py-3 rounded-2xl text-sm font-black transition-all border-2 transform hover:scale-105",
                          userData.selectedIngredients.includes(item)
                            ? `${cat.color} text-white border-transparent shadow-lg`
                            : "bg-white text-slate-600 border-slate-100 hover:border-indigo-200"
                        )}
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={handleBack} className="flex-1 py-4 rounded-2xl border-2 border-slate-100 font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-sm">Back</button>
              <button 
                onClick={handleGenerateRecipe} 
                disabled={loading || userData.selectedIngredients.length === 0}
                className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black hover:opacity-90 shadow-xl shadow-emerald-200 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-sm"
              >
                {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <ChefHat className="w-6 h-6" />}
                Cook with AI
              </button>
            </div>
          </StepWrapper>
        )}

        {/* Step 5: Recipe */}
        {currentStep === 4 && (
          <StepWrapper 
            key="step4"
            title="AI Masterpiece" 
            description="Your personalized culinary guide is ready."
            icon={ChefHat}
            colorClass="bg-gradient-to-br from-orange-400 to-rose-600"
          >
            <div className="prose prose-indigo max-w-none overflow-y-auto max-h-[500px] pr-6 custom-scrollbar bg-slate-50/50 p-6 rounded-[2rem] border-2 border-slate-100">
              <Markdown>{userData.recipe}</Markdown>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={handleBack} className="flex-1 py-4 rounded-2xl border-2 border-slate-100 font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-sm">Back</button>
              <button onClick={handleNext} className="flex-[2] py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-600 text-white font-black hover:opacity-90 shadow-xl shadow-rose-200 transition-all uppercase tracking-widest text-sm">I Cooked This!</button>
            </div>
          </StepWrapper>
        )}

        {/* Step 6: Track */}
        {currentStep === 5 && (
          <StepWrapper 
            key="step5"
            title="Snap & Track" 
            description="Show us your creation for an instant nutrition check."
            icon={Camera}
            colorClass="bg-gradient-to-br from-pink-400 to-purple-600"
          >
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-500 rounded-[3rem] blur opacity-20 group-hover:opacity-40 transition duration-1000" />
              <div className="relative flex flex-col items-center justify-center border-4 border-dashed border-indigo-100 rounded-[2.5rem] p-16 bg-white hover:bg-indigo-50/30 transition-all cursor-pointer overflow-hidden">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer z-20"
                  disabled={loading}
                />
                {loading ? (
                  <div className="flex flex-col items-center gap-6">
                    <div className="relative">
                      <div className="w-24 h-24 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                      <Camera className="absolute top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2 w-10 h-10 text-indigo-600" />
                    </div>
                    <p className="font-black text-indigo-900 uppercase tracking-widest text-center">AI Vision Analyzing...</p>
                  </div>
                ) : (
                  <>
                    <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-purple-100 rounded-3xl flex items-center justify-center mb-6 transform group-hover:rotate-12 transition-transform">
                      <Upload className="w-12 h-12 text-purple-600" />
                    </div>
                    <p className="font-black text-slate-800 text-xl mb-2 uppercase tracking-tight">Drop Your Meal Photo</p>
                    <p className="text-sm text-slate-400 font-bold">AI will calculate calories instantly</p>
                  </>
                )}
              </div>
            </div>
            <div className="mt-10 flex gap-4">
              <button onClick={handleBack} className="flex-1 py-4 rounded-2xl border-2 border-slate-100 font-black text-slate-400 hover:bg-slate-50 transition-all uppercase tracking-widest text-sm">Back</button>
              <button onClick={handleNext} className="flex-1 py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-black transition-all uppercase tracking-widest text-sm">Skip Photo</button>
            </div>
          </StepWrapper>
        )}

        {/* Step 7: Report */}
        {currentStep === 6 && (
          <StepWrapper 
            key="step6"
            title="The NutriScore" 
            description="Your daily health summary in full color."
            icon={BarChart3}
            colorClass="bg-gradient-to-br from-cyan-400 to-indigo-600"
          >
            <div className="space-y-10">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-100 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-200/20 rounded-full group-hover:scale-150 transition-transform duration-700" />
                  <div className="flex items-center gap-3 text-emerald-600 mb-2">
                    <Zap className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Energy Intake</span>
                  </div>
                  <p className="text-4xl font-black text-slate-900">1,850 <span className="text-lg font-bold text-slate-400">kcal</span></p>
                </div>
                <div className="p-6 rounded-[2rem] bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-100 relative overflow-hidden group">
                  <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-200/20 rounded-full group-hover:scale-150 transition-transform duration-700" />
                  <div className="flex items-center gap-3 text-blue-600 mb-2">
                    <Target className="w-5 h-5" />
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Goal Sync</span>
                  </div>
                  <p className="text-4xl font-black text-slate-900">88%</p>
                </div>
              </div>

              {/* AI Analysis */}
              <div className="p-8 rounded-[2.5rem] bg-slate-900 text-white shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/20 blur-3xl rounded-full" />
                <h4 className="flex items-center gap-3 font-black text-indigo-400 mb-6 uppercase tracking-widest text-sm">
                  <div className="p-2 bg-indigo-500/20 rounded-lg">
                    <Activity className="w-5 h-5" />
                  </div>
                  AI Health Insights
                </h4>
                <div className="prose prose-invert prose-sm max-w-none text-indigo-100 font-medium">
                  <Markdown>{userData.mealAnalysis || "Track your first meal to see AI insights here! We'll analyze your macros and give you personalized tips."}</Markdown>
                </div>
              </div>

              {/* Suggestions */}
              <div className="space-y-4">
                <h4 className="font-black text-slate-400 text-xs uppercase tracking-[0.3em] pl-2">Daily Tips</h4>
                {[
                  { text: "Hydration Alert: Drink 500ml water now.", color: "bg-blue-500" },
                  { text: "Protein Boost: Your dinner needs 20g more protein.", color: "bg-rose-500" },
                  { text: "Activity: A 15-min walk would perfect your day.", color: "bg-emerald-500" }
                ].map((s, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    key={i} 
                    className="flex items-center gap-4 p-4 rounded-2xl bg-white border-2 border-slate-50 shadow-sm hover:border-indigo-100 transition-all"
                  >
                    <div className={cn("w-3 h-3 rounded-full shrink-0 animate-pulse", s.color)} />
                    <p className="text-sm text-slate-700 font-bold">{s.text}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            
            <button 
              onClick={() => setCurrentStep(0)} 
              className="mt-12 w-full py-5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 text-white font-black uppercase tracking-[0.2em] shadow-2xl hover:opacity-90 transition-all text-lg"
            >
              Reset My Journey
            </button>
          </StepWrapper>
        )}
      </AnimatePresence>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 10px;
          border: 2px solid transparent;
          background-clip: content-box;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
          background-clip: content-box;
        }
        @keyframes tilt {
          0%, 50%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(0.5deg); }
          75% { transform: rotate(-0.5deg); }
        }
        .animate-tilt {
          animation: tilt 10s infinite linear;
        }
      `}</style>
    </div>
  );
}
