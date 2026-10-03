import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import {
  FiCreditCard, FiDollarSign, FiCalendar, FiArrowRight, FiCheck,
  FiX, FiUpload, FiClock, FiAlertCircle, FiCheckCircle
} from 'react-icons/fi';

const PAYMENT_INFO = {
  bKash: { number: '01700000000', type: 'Personal', instruction: 'Send money, then upload screenshot' },
  Nagad: { number: '01800000000', type: 'Personal', instruction: 'Send money, then upload screenshot' },
  Bank: { bank: 'Dutch-Bangla Bank', account: '1234567890', branch: 'Dhaka Main', routing: '090275421', instruction: 'Transfer & send transaction proof' },
};

export default function UserBilling() {
  const { user } = useAuth();
  const [tab, setTab] = useState('plan');
  const [plans, setPlans] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('bKash');
  const [txnId, setTxnId] = useState('');
  const [amountSent, setAmountSent] = useState('');
  const [note, setNote] = useState('');
  const [uploading, setUploading] = useState(false);
  const [paymentSubmitted, setPaymentSubmitted] = useState(false);

  useEffect(() => {
    fetchData();
  }, [tab]);

  const fetchData = async () => {
    try {
      if (tab === 'plan') {
        const { data } = await api.get('/plans');
        setPlans(data.plans || []);
      } else if (tab === 'history') {
        const { data } = await api.get('/payments/my');
        setInvoices(data.payments || []);
      }
    } catch (err) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!txnId.trim()) return toast.error('Please enter transaction ID');
    
    setUploading(true);
    try {
      await api.post('/payments', {
        plan_id: selectedPlan?.id,
        plan_name: selectedPlan?.name,
        amount: amountSent || selectedPlan?.price || 0,
        method: paymentMethod,
        txn_id: txnId,
        note
      });
      setPaymentSubmitted(true);
      toast.success('Payment submitted! We\'ll verify and activate within 24 hours.');
      setTxnId('');
      setAmountSent('');
      setNote('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment submission failed');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{maxWidth:1200}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Billing & Plans</h1>
          <p className="page-subtitle">Manage your subscription and payment history</p>
        </div>
      </div>

      {/* Current Status */}
      <div className="grid grid-3 gap-lg" style={{marginBottom:'1.5rem'}}>
        <div className="stat-card indigo">
          <div className="stat-icon indigo"><FiCreditCard /></div>
          <div className="stat-value">{user?.plan_name || 'Free'}</div>
          <div className="stat-label">Current Plan</div>
        </div>
        <div className="stat-card cyan">
          <div className="stat-icon cyan"><FiDollarSign /></div>
          <div className="stat-value">৳{Number(user?.plan_price || 0).toLocaleString()}</div>
          <div className="stat-label">Monthly Cost</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><FiCalendar /></div>
          <div className="stat-value">
            {user?.next_billing_date
              ? new Date(user.next_billing_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
              : '—'}
          </div>
          <div className="stat-label">Next Billing Date</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        {['plan', 'payment', 'history'].map(t => (
          <button key={t} className={`tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
            {t === 'plan' ? 'Change Plan' : t === 'payment' ? 'Make Payment' : 'Payment History'}
          </button>
        ))}
      </div>

      {/* Plans Tab */}
      {tab === 'plan' && (
        <>
          {loading ? (
            <div style={{textAlign:'center', padding:'3rem', color:'var(--text-muted)'}}>Loading plans...</div>
          ) : (
            <div className="grid grid-3 gap-lg">
              {plans.map(plan => {
                const isCurrentPlan = user?.plan_id ? user.plan_id === plan.id : (user?.plan_name || 'Free') === plan.name;
                const badgeText = plan.is_featured ? 'Popular' : null;
                return (
                  <div key={plan.id} className={`card ${plan.is_featured ? 'featured-plan' : ''}`}
                    style={{border: isCurrentPlan ? '1px solid rgba(99,102,241,0.5)' : undefined, position:'relative'}}>
                    {badgeText && (
                      <div className="plan-top-badge">{badgeText}</div>
                    )}
                    {isCurrentPlan && <div className="current-plan-badge"><FiCheckCircle /> Current Plan</div>}
                    <h3 style={{fontSize:'1.1rem',fontWeight:700,marginBottom:'0.25rem'}}>{plan.name}</h3>
                    <div style={{fontSize:'0.75rem',color:'var(--text-muted)',textTransform:'uppercase',letterSpacing:'0.06em',marginBottom:'1rem'}}>
                      {plan.event_limit === 0 ? 'Unlimited' : plan.event_limit.toLocaleString()} events/mo
                    </div>
                    <div style={{display:'flex',alignItems:'baseline',gap:'2px',marginBottom:'1.5rem'}}>
                      <span style={{color:'var(--text-secondary)',fontSize:'1rem'}}>৳</span>
                      <span style={{fontSize:'2.4rem',fontWeight:900,fontFamily:'var(--font-display)',color:'var(--text-primary)',lineHeight:1}}>
                        {plan.price.toLocaleString()}
                      </span>
                      {plan.price > 0 && <span style={{color:'var(--text-muted)',fontSize:'0.875rem'}}>/month</span>}
                    </div>
                    <div style={{display:'flex',flexDirection:'column',gap:'0.5rem',marginBottom:'1.5rem'}}>
                      {plan.features.map((f, i) => (
                        <div key={i} style={{display:'flex',alignItems:'center',gap:'0.5rem',fontSize:'0.85rem',color:'var(--text-secondary)'}}>
                          <FiCheck style={{color:'var(--success-light)',flexShrink:0}} /> {f}
                        </div>
                      ))}
                    </div>
                    <button
                      className={`btn w-full ${plan.is_featured ? 'btn-primary' : 'btn-secondary'}`}
                      style={{justifyContent:'center'}}
                      disabled={isCurrentPlan}
                      onClick={() => { setSelectedPlan(plan); setTab('payment'); }}
                    >
                      {isCurrentPlan ? 'Current Plan' : `Upgrade to ${plan.name}`}
                      {!isCurrentPlan && <FiArrowRight />}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* Payment Tab */}
      {tab === 'payment' && (
        <div style={{maxWidth:680,margin:'0 auto'}}>
          {paymentSubmitted ? (
            <div className="card text-center" style={{padding:'3rem', textAlign:'center'}}>
              <div style={{fontSize:'4rem',marginBottom:'1rem'}}>✅</div>
              <h2 style={{fontSize:'1.4rem',fontWeight:700,marginBottom:'0.75rem'}}>Payment Submitted!</h2>
              <p style={{color:'var(--text-secondary)',marginBottom:'1.5rem'}}>
                Our team will verify your payment and activate your plan within <strong>24 hours</strong>. You'll receive a confirmation.
              </p>
              <button className="btn btn-secondary" onClick={() => setPaymentSubmitted(false)}>Make Another Payment</button>
            </div>
          ) : (
            <div className="card">
              <div className="card-header">
                <h3 className="card-title">
                  {selectedPlan ? `Upgrade to ${selectedPlan.name}` : 'Make a Payment'}
                </h3>
              </div>

              {selectedPlan && (
                <div style={{background:'rgba(99,102,241,0.06)',border:'1px solid rgba(99,102,241,0.2)',borderRadius:'var(--radius-md)',padding:'1rem',marginBottom:'1.5rem',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <div>
                    <div style={{fontWeight:700,color:'var(--text-primary)'}}>{selectedPlan.name} Plan</div>
                    <div style={{fontSize:'0.82rem',color:'var(--text-secondary)'}}>
                      {selectedPlan.event_limit === 0 ? 'Unlimited' : selectedPlan.event_limit.toLocaleString()} events/month
                    </div>
                  </div>
                  <div style={{fontWeight:800,fontSize:'1.4rem',color:'var(--primary-light)'}}>৳{selectedPlan.price.toLocaleString()}</div>
                </div>
              )}

              {/* Payment Method Selector */}
              <div style={{marginBottom:'1.5rem'}}>
                <label className="form-label">Select Payment Method</label>
                <div style={{display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(130px, 1fr))', gap:'0.75rem'}}>
                  {['bKash', 'Nagad', 'Bank'].map(m => (
                    <button key={m}
                      className={`payment-method-btn ${paymentMethod === m ? 'active' : ''}`}
                      onClick={() => setPaymentMethod(m)}
                      type="button"
                      style={{
                        flex:1, padding:'0.875rem', borderRadius:'var(--radius-md)', cursor:'pointer',
                        border: paymentMethod === m ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: paymentMethod === m ? 'rgba(99,102,241,0.1)' : 'transparent',
                        color: paymentMethod === m ? 'var(--primary-light)' : 'var(--text-secondary)',
                        fontWeight: paymentMethod === m ? 700 : 500, fontFamily:'var(--font-sans)', fontSize:'0.875rem',
                        transition:'all 0.2s ease'
                      }}
                    >
                      {m === 'bKash' ? '📱 bKash' : m === 'Nagad' ? '📱 Nagad' : '🏦 Bank Transfer'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Details */}
              <div style={{background:'var(--bg-void)',border:'1px solid var(--border)',borderRadius:'var(--radius-md)',padding:'1.25rem',marginBottom:'1.5rem'}}>
                <div style={{fontWeight:700,fontSize:'0.85rem',marginBottom:'1rem',color:'var(--text-primary)'}}>
                  {paymentMethod === 'Bank' ? 'Bank Transfer Details' : `${paymentMethod} Details`}
                </div>

                {paymentMethod === 'Bank' ? (
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.75rem',fontSize:'0.85rem'}}>
                    {Object.entries({
                      'Bank': PAYMENT_INFO.Bank.bank,
                      'Account': PAYMENT_INFO.Bank.account,
                      'Branch': PAYMENT_INFO.Bank.branch,
                      'Routing': PAYMENT_INFO.Bank.routing,
                    }).map(([k, v]) => (
                      <div key={k}>
                        <div style={{color:'var(--text-muted)',fontSize:'0.72rem',textTransform:'uppercase',marginBottom:'2px'}}>{k}</div>
                        <div style={{fontWeight:600,color:'var(--text-primary)',fontFamily:'monospace'}}>{v}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{display:'flex',gap:'2rem',fontSize:'0.875rem'}}>
                    <div>
                      <div style={{color:'var(--text-muted)',fontSize:'0.72rem',textTransform:'uppercase',marginBottom:'2px'}}>Number</div>
                      <div style={{fontWeight:700,color:'var(--accent-light)',fontFamily:'monospace',fontSize:'1rem'}}>{PAYMENT_INFO[paymentMethod].number}</div>
                    </div>
                    <div>
                      <div style={{color:'var(--text-muted)',fontSize:'0.72rem',textTransform:'uppercase',marginBottom:'2px'}}>Type</div>
                      <div style={{fontWeight:600,color:'var(--text-primary)'}}>{PAYMENT_INFO[paymentMethod].type}</div>
                    </div>
                  </div>
                )}
                <div style={{marginTop:'0.875rem',padding:'0.625rem',background:'rgba(245,158,11,0.08)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:'var(--radius-sm)',fontSize:'0.8rem',color:'var(--warning-light)'}}>
                  💡 {PAYMENT_INFO[paymentMethod === 'Bank' ? 'Bank' : paymentMethod].instruction}
                </div>
              </div>

              <form onSubmit={handlePaymentSubmit}>
                <div className="form-group">
                  <label className="form-label">Transaction ID / Reference *</label>
                  <input type="text" className="form-input" placeholder="Enter your transaction ID after payment"
                    value={txnId} onChange={e => setTxnId(e.target.value)} required />
                  <p className="form-hint">After sending payment, enter the transaction ID here for verification</p>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount Sent (BDT)</label>
                  <input type="number" className="form-input" placeholder={selectedPlan?.price || '0'}
                    value={amountSent} onChange={e => setAmountSent(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Note (Optional)</label>
                  <textarea className="form-textarea" rows={2} placeholder="Any additional info for our team..."
                    value={note} onChange={e => setNote(e.target.value)} />
                </div>
                <button type="submit" className="btn btn-primary w-full btn-lg" disabled={uploading} style={{justifyContent:'center'}}>
                  {uploading ? <><div className="spinner"/><span>Submitting...</span></> : <><FiUpload /> Submit Payment Proof</>}
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {tab === 'history' && (
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Payment History</h3>
          </div>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Invoice</th>
                  <th>Date</th>
                  <th>Plan</th>
                  <th>Method</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{textAlign:'center', color:'var(--text-muted)', padding:'2rem'}}>Loading history...</td></tr>
                ) : invoices.length === 0 ? (
                  <tr><td colSpan="6" style={{textAlign:'center', color:'var(--text-muted)', padding:'2rem'}}>No payment history found</td></tr>
                ) : (
                  invoices.map(inv => (
                    <tr key={inv.id}>
                      <td><code style={{color:'var(--primary-light)'}}>{inv.id.substring(0, 8)}...</code></td>
                      <td>{new Date(inv.created_at).toLocaleDateString()}</td>
                      <td>{inv.plan_name}</td>
                      <td>{inv.method}</td>
                      <td><strong style={{color:'var(--text-primary)'}}>৳{inv.amount.toLocaleString()}</strong></td>
                      <td>
                        <span className={`badge badge-${inv.status === 'approved' ? 'success' : inv.status === 'rejected' ? 'danger' : 'warning'}`}>
                          {inv.status === 'approved' ? <><FiCheckCircle /> Approved</> : inv.status === 'rejected' ? <><FiX /> Rejected</> : <><FiClock /> Pending</>}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <style>{`
        .featured-plan { border-color: rgba(99,102,241,0.4) !important; box-shadow: 0 0 30px rgba(99,102,241,0.1); }
        .plan-top-badge { position:absolute;top:14px;right:14px;z-index:2;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;padding:0.25rem 0.75rem;border-radius:999px;font-size:0.68rem;font-weight:800;text-transform:uppercase;letter-spacing:0.06em;box-shadow:0 2px 10px rgba(99,102,241,0.45); }
        .current-plan-badge { display:flex;align-items:center;gap:4px;font-size:0.72rem;font-weight:700;color:var(--success-light);margin-bottom:0.5rem; }
      `}</style>
    </div>
  );
}
