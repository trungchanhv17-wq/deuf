import React from 'react';
import { Check, Zap, Crown, Star, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';

interface PricingProps {
  onClose: () => void;
}

export const Pricing: React.FC<PricingProps> = ({ onClose }) => {
  const [step, setStep] = React.useState<'pricing' | 'payment'>('pricing');
  const [method, setMethod] = React.useState<'bank' | 'momo' | 'card' | null>(null);
  const [loading, setLoading] = React.useState(false);

  const handleSelectMethod = async (m: 'bank' | 'momo' | 'card') => {
    if (!auth.currentUser) {
      alert("Vui lòng đăng nhập để nâng cấp Premium!");
      return;
    }

    setLoading(true);
    try {
      await addDoc(collection(db, 'payments'), {
        userId: auth.currentUser.uid,
        email: auth.currentUser.email,
        amount: "199.000đ",
        plan: "Premium Pro",
        method: m,
        status: 'pending',
        timestamp: Date.now()
      });
      setMethod(m);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'payments');
    } finally {
      setLoading(false);
    }
  };

  const plans = [
    {
      name: "Miễn phí",
      price: "0",
      description: "Dành cho người mới bắt đầu",
      features: [
        "10 câu dịch mỗi ngày",
        "Phản hồi ngữ pháp cơ bản",
        "Lưu lịch sử 7 ngày",
        "Mô hình AI tiêu chuẩn"
      ],
      button: "Đang sử dụng",
      premium: false
    },
    {
      name: "Premium Pro",
      id: "pro",
      price: "199.000",
      description: "Dành cho người học nghiêm túc",
      features: [
        "Dịch & Luyện tập không giới hạn",
        "Phân tích chuyên sâu từ chuyên gia AI",
        "Lưu lịch sử vĩnh viễn",
        "Ưu tiên sử dụng mô hình Gemini Ultra",
        "Không quảng cáo",
        "Hỗ trợ lộ trình học cá nhân"
      ],
      button: "Nâng cấp ngay",
      premium: true,
      popular: true
    }
  ];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-4xl rounded-[32px] overflow-hidden shadow-2xl flex flex-col md:flex-row shadow-black/20 max-h-[90vh]"
      >
        {/* Left Side: Branding */}
        <div className="md:w-1/3 bg-black p-10 text-white flex flex-col justify-between hidden md:flex">
          <div className="space-y-6">
            <div className="bg-orange-500 w-12 h-12 rounded-2xl flex items-center justify-center">
              <Crown className="text-white" size={24} />
            </div>
            <div className="space-y-4">
              <h2 className="text-3xl font-bold leading-tight">Mở khóa tiềm năng của bạn</h2>
              <ul className="space-y-4 pt-4">
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Zap size={16} className="text-orange-500" />
                  Kích hoạt ngay sau 30 giây
                </li>
                <li className="flex items-center gap-3 text-sm text-gray-400">
                  <Star size={16} className="text-orange-500" />
                  Hoàn tiền nếu không hài lòng
                </li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-gray-900/50 rounded-2xl border border-white/10">
            <p className="text-[10px] text-gray-500 uppercase tracking-widest mb-1">Cần hỗ trợ?</p>
            <p className="text-xs font-medium">support@deutschlernen.ai</p>
          </div>
        </div>

        {/* Right Side: Content */}
        <div className="flex-1 p-6 md:p-10 bg-gray-50/50 overflow-y-auto">
          <AnimatePresence mode="wait">
            {step === 'pricing' ? (
              <motion.div 
                key="pricing"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <div className="mb-8">
                  <h3 className="text-2xl font-bold text-gray-900">Chọn gói học tập</h3>
                  <p className="text-gray-500 text-sm">Đầu tư vào tri thức là khoản đầu tư tốt nhất.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {plans.map((plan, idx) => (
                    <div 
                      key={idx}
                      className={`relative p-6 rounded-3xl border transition-all duration-300 ${
                        plan.popular 
                          ? 'bg-white border-orange-200 shadow-xl shadow-orange-500/5 ring-1 ring-orange-500/20' 
                          : 'bg-white border-gray-100'
                      }`}
                    >
                      {plan.popular && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-full">
                          Phổ biến nhất
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <div>
                          <h3 className="font-bold text-gray-900">{plan.name}</h3>
                          <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wider">{plan.description}</p>
                        </div>
                        
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-gray-900">{plan.price}đ</span>
                          <span className="text-gray-400 text-xs font-medium">/tháng</span>
                        </div>
                        
                        <ul className="space-y-2.5 pt-2">
                          {plan.features.map((feature, fIdx) => (
                            <li key={fIdx} className="flex items-start gap-2.5">
                              <div className={`mt-0.5 p-0.5 rounded-full ${plan.premium ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                                <Check size={10} />
                              </div>
                              <span className="text-[11px] text-gray-600 leading-tight">{feature}</span>
                            </li>
                          ))}
                        </ul>
                        
                        <button 
                          onClick={() => plan.premium && setStep('payment')}
                          className={`w-full py-3 rounded-2xl text-sm font-bold transition-all ${
                            plan.premium 
                              ? 'bg-black text-white hover:bg-gray-900 shadow-lg shadow-black/10' 
                              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          }`}
                        >
                          {plan.button}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="payment"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-4 mb-8">
                  <button onClick={() => setStep('pricing')} className="p-2 hover:bg-gray-200 rounded-xl transition-colors">
                    <X size={20} />
                  </button>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Thanh toán Premium</h3>
                    <p className="text-gray-500 text-xs text-orange-600 font-bold">Tổng: 199.000 VNĐ / tháng</p>
                  </div>
                </div>

                {!method ? (
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-gray-500 px-1">Chọn phương thức {loading && <Loader2 className="inline ml-2 animate-spin" size={14} />}</p>
                    <button 
                      disabled={loading}
                      onClick={() => handleSelectMethod('bank')}
                      className="w-full p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:border-orange-500 hover:shadow-lg hover:shadow-orange-500/5 transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                          <Zap size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900 text-sm">Chuyển khoản Ngân hàng</p>
                          <p className="text-[10px] text-gray-400">QR Code chuyển khoản nhanh 24/7</p>
                        </div>
                      </div>
                      <Check className="text-orange-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                    </button>

                    <button 
                      disabled={loading}
                      onClick={() => handleSelectMethod('momo')}
                      className="w-full p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:border-pink-500 hover:shadow-lg hover:shadow-pink-500/5 transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-pink-50 text-pink-600 rounded-xl flex items-center justify-center">
                          <Zap size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900 text-sm">Ví điện tử MoMo</p>
                          <p className="text-[10px] text-gray-400">Thanh toán bằng ứng dụng MoMo</p>
                        </div>
                      </div>
                      <Check className="text-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                    </button>
                    
                    <button 
                      disabled={loading}
                      onClick={() => handleSelectMethod('card')}
                      className="w-full p-4 bg-white border border-gray-100 rounded-2xl flex items-center justify-between hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/5 transition-all group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                          <Crown size={20} />
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-gray-900 text-sm">Thẻ Quốc tế (Visa/Master)</p>
                          <p className="text-[10px] text-gray-400">Hỗ trợ thanh toán toàn cầu</p>
                        </div>
                      </div>
                      <Check className="text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                    </button>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-xl flex flex-col items-center text-center space-y-6"
                  >
                    <div className="w-48 h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex items-center justify-center relative">
                      <div className="absolute inset-4 bg-white shadow-sm rounded-lg flex items-center justify-center">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=DEUTSCHLERNEN-PRO" alt="QR" className="w-full h-full opacity-80" />
                      </div>
                      <div className="absolute -bottom-3 bg-black text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter">
                        Quét mã thanh toán
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                    <h4 className="font-bold text-gray-900">Quét mã QR để nâng cấp</h4>
                    <p className="text-[11px] text-gray-500 max-w-xs mx-auto leading-relaxed">
                      Nội dung chuyển khoản: <span className="font-bold text-black select-all">PRO 202612345</span><br />
                      Hệ thống sẽ tự động kích hoạt ngay sau khi nhận được tiền.
                    </p>
                    </div>

                    <button 
                      onClick={() => setMethod(null)}
                      className="text-xs text-gray-400 hover:text-gray-600 underline font-medium"
                    >
                      Thay đổi phương thức
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="mt-8 text-center text-[10px] text-gray-400 uppercase tracking-widest leading-relaxed">
            Hỗ trợ khách hàng 24/7 • deutschlernen.ai
          </div>
        </div>
      </motion.div>
    </div>
  );
};
