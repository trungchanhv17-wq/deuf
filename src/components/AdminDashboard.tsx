import React, { useState, useEffect } from 'react';
import { Users, CreditCard, Activity, ArrowLeft, Check, X, ShieldAlert, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, getDocs, where, deleteDoc } from 'firebase/firestore';

interface AdminDashboardProps {
  onClose: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'payments'>('users');
  const [payments, setPayments] = useState<any[]>([]);
  const [userCount, setUserCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync payments
    const paymentsQ = query(collection(db, 'payments'), orderBy('timestamp', 'desc'));
    const unsubPayments = onSnapshot(paymentsQ, (snap) => {
      setPayments(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'payments'));

    // Get user count (simplified)
    getDocs(collection(db, 'users')).then(snap => setUserCount(snap.size));

    return () => unsubPayments();
  }, []);

  const handleApprove = async (id: string, userId: string) => {
    try {
      // 1. Update user profile to premium
      await updateDoc(doc(db, 'users', userId), {
        isPremium: true
      });
      // 2. Mark payment as completed
      await updateDoc(doc(db, 'payments', id), {
        status: 'completed'
      });
      alert("Đã duyệt nâng cấp cho học viên!");
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'payments/users');
    }
  };

  const handleReject = async (id: string) => {
    if (window.confirm("Bạn có chắc muốn từ chối yêu cầu này?")) {
      try {
        await deleteDoc(doc(db, 'payments', id));
      } catch (error) {
        handleFirestoreError(error, OperationType.DELETE, 'payments');
      }
    }
  };

  const stats = {
    revenue: payments.filter(p => p.status === 'completed').length * 199000,
    newUsers: userCount,
    pending: payments.filter(p => p.status === 'pending').length
  };

  return (
    <div className="fixed inset-0 z-[200] bg-gray-100 flex flex-col">
      {/* Admin Header */}
      <nav className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="bg-red-500 p-1.5 rounded-lg text-white">
              <ShieldAlert size={20} />
            </div>
            <h1 className="text-xl font-black tracking-tighter">ADMIN CENTER</h1>
          </div>
        </div>
        
        <div className="flex bg-gray-100 p-1 rounded-xl">
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'users' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
          >
            Người dùng
          </button>
          <button 
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'payments' ? 'bg-white shadow-sm text-black' : 'text-gray-400'}`}
          >
            Thanh toán ({stats.pending})
          </button>
        </div>
      </nav>

      {/* Admin Stats */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-orange-500">Doanh thu tạm tính</span>
            <div className="bg-orange-50 p-2 rounded-xl text-orange-500"><CreditCard size={18} /></div>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.revenue.toLocaleString()}đ</p>
          <p className="text-[10px] text-green-500 font-bold bg-green-50 px-2 py-0.5 rounded-full inline-block">Real-time sync</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-blue-500">Tổng học viên</span>
            <div className="bg-blue-50 p-2 rounded-xl text-blue-500"><Users size={18} /></div>
          </div>
          <p className="text-3xl font-black text-gray-900">{userCount}</p>
          <p className="text-[10px] text-blue-500 font-bold bg-blue-50 px-2 py-0.5 rounded-full inline-block">Đã đăng ký</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest text-red-500">Đợi phê duyệt</span>
            <div className="bg-red-50 p-2 rounded-xl text-red-500"><Activity size={18} /></div>
          </div>
          <p className="text-3xl font-black text-gray-900">{stats.pending.toString().padStart(2, '0')}</p>
          <p className="text-[10px] text-red-500 font-bold bg-red-50 px-2 py-0.5 rounded-full inline-block">Yêu cầu nâng cấp</p>
        </motion.div>
      </div>

      {/* Content Table */}
      <div className="flex-1 p-6 pt-0 overflow-hidden flex flex-col">
        <div className="bg-white rounded-[32px] border border-gray-200 shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
            <div className="space-y-1">
              <h3 className="font-black text-gray-900 tracking-tight">DANH SÁCH YÊU CẦU</h3>
              <p className="text-[10px] text-gray-400 uppercase font-black tracking-widest">Cần kiểm tra giao dịch ngân hàng trước khi duyệt</p>
            </div>
            {loading && <Loader2 className="animate-spin text-orange-500" size={20} />}
          </div>
          
          <div className="overflow-auto flex-1 h-full">
            <table className="w-full text-left min-w-[800px]">
              <thead className="bg-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest sticky top-0 z-20">
                <tr>
                  <th className="px-8 py-5">Học viên</th>
                  <th className="px-8 py-5">Gói cước</th>
                  <th className="px-8 py-5">Số tiền</th>
                  <th className="px-8 py-5">Ngày yêu cầu</th>
                  <th className="px-8 py-5">Trạng thái</th>
                  <th className="px-8 py-5 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-gray-50">
                {payments.map((p) => (
                  <tr key={p.id} className="group hover:bg-gray-50/80 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-900">{p.email}</span>
                        <span className="text-[10px] text-gray-400 font-mono">{p.userId}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 font-medium text-gray-600">{p.plan}</td>
                    <td className="px-8 py-5">
                      <span className="px-3 py-1 bg-gray-100 rounded-full font-black text-gray-900 border border-gray-200 text-xs">{p.amount}</span>
                    </td>
                    <td className="px-8 py-5 text-gray-400 font-medium text-xs">
                      {new Date(p.timestamp).toLocaleString('vi-VN')}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                        p.status === 'completed' 
                          ? 'bg-green-100 text-green-600 border border-green-200' 
                          : 'bg-orange-100 text-orange-600 border border-orange-200 animate-pulse'
                      }`}>
                        {p.status === 'completed' ? 'Thành công' : 'Chờ quét mã'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      {p.status === 'pending' && (
                        <div className="flex items-center justify-end gap-3">
                          <button 
                            onClick={() => handleApprove(p.id, p.userId)}
                            className="bg-green-500 text-white p-2.5 rounded-2xl hover:bg-green-600 transition-all shadow-lg shadow-green-500/20 active:scale-95"
                            title="Duyệt"
                          >
                            <Check size={18} strokeWidth={3} />
                          </button>
                          <button 
                            onClick={() => handleReject(p.id)}
                            className="bg-white border border-gray-200 text-red-500 p-2.5 rounded-2xl hover:bg-red-50 transition-all active:scale-95"
                            title="Xóa/Từ chối"
                          >
                            <X size={18} strokeWidth={3} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            {!loading && payments.length === 0 && (
              <div className="p-20 text-center space-y-4">
                <div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto text-gray-400">
                  <Activity size={40} />
                </div>
                <div className="space-y-1">
                  <p className="font-bold text-gray-900">Không có dữ liệu</p>
                  <p className="text-xs text-gray-400">Hệ thống sẵn sàng đón nhận yêu cầu mới.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
