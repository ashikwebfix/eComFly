import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../../utils/api';
import { FiCheckCircle, FiX, FiClock, FiSearch, FiDollarSign, FiEye } from 'react-icons/fi';

const METHOD_EMOJI = { bKash:'📱', Nagad:'📱', 'Bank Transfer':'🏦' };

export default function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [viewPayment, setViewPayment] = useState(null);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const { data } = await api.get('/payments');
      setPayments(data.payments || []);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const filtered = payments.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter;
    const matchSearch = p.user_name?.toLowerCase().includes(search.toLowerCase()) ||
      p.txn_id?.toLowerCase().includes(search.toLowerCase()) ||
      p.user_email?.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  const approve = async (id) => {
    try {
      const { data } = await api.post(`/payments/${id}/approve`);
      setPayments(prev => prev.map(p => p.id === id ? data.payment : p));
      toast.success('Payment approved! User plan activated.');
      setViewPayment(null);
    } catch (err) {
      toast.error('Failed to approve payment');
    }
  };

  const reject = async (id) => {
    try {
      const { data } = await api.post(`/payments/${id}/reject`);
      setPayments(prev => prev.map(p => p.id === id ? data.payment : p));
      toast.error('Payment rejected.');
      setViewPayment(null);
    } catch (err) {
      toast.error('Failed to reject payment');
    }
  };

  const pendingCount = payments.filter(p => p.status === 'pending').length;
  const totalRevenue = payments.filter(p => p.status === 'approved').reduce((s,p) => s + p.amount, 0);

  return (
    <div style={{maxWidth:1200}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">Payment Management</h1>
          <p className="page-subtitle">Review and verify offline payment submissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-4 gap-lg" style={{marginBottom:'1.5rem'}}>
        {[
          {label:'Pending Review', value:pendingCount, color:'amber', icon:<FiClock />},
          {label:'Approved (Month)', value:payments.filter(p=>p.status==='approved').length, color:'green', icon:<FiCheckCircle />},
          {label:'Total Revenue', value:`৳${totalRevenue.toLocaleString()}`, color:'indigo', icon:<FiDollarSign />},
          {label:'Rejected', value:payments.filter(p=>p.status==='rejected').length, color:'red', icon:<FiX />},
        ].map((s,i) => (
          <div key={i} className={`stat-card ${s.color}`}>
            <div className={`stat-icon ${s.color}`}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{marginBottom:'1.25rem',padding:'1rem'}}>
        <div style={{display:'flex',gap:'1rem',alignItems:'center',flexWrap:'wrap'}}>
          <div style={{flex:1,minWidth:220,position:'relative'}}>
            <FiSearch style={{position:'absolute',left:12,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)',fontSize:'0.9rem'}} />
            <input type="text" className="form-input" placeholder="Search by user or txn ID..."
              value={search} onChange={e => setSearch(e.target.value)} style={{paddingLeft:'2.25rem'}} />
          </div>
          <div style={{display:'flex',gap:'0.5rem'}}>
            {['all','pending','approved','rejected'].map(f => (
              <button key={f} className={`btn btn-sm ${filter === f ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setFilter(f)} style={{textTransform:'capitalize'}}>
                {f}{f === 'pending' && pendingCount > 0 && ` (${pendingCount})`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="card">
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>User</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Txn ID</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="8" style={{textAlign:'center', padding:'2rem', color:'var(--text-muted)'}}>Loading payments...</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div>
                      <div style={{fontWeight:600,color:'var(--text-primary)',fontSize:'0.875rem'}}>{p.user_name}</div>
                      <div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{p.user_email}</div>
                    </div>
                  </td>
                  <td><span className="badge badge-primary">{p.plan_name}</span></td>
                  <td><strong style={{color:'var(--text-primary)'}}>৳{p.amount.toLocaleString()}</strong></td>
                  <td>{METHOD_EMOJI[p.method]} {p.method}</td>
                  <td><code style={{fontSize:'0.78rem',color:'var(--accent-light)'}}>{p.txn_id}</code></td>
                  <td style={{fontSize:'0.82rem'}}>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge badge-${p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warning'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td>
                    <div style={{display:'flex',gap:'0.375rem'}}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setViewPayment(p)} title="View"><FiEye /></button>
                      {p.status === 'pending' && (
                        <>
                          <button className="btn btn-success btn-sm" onClick={() => approve(p.id)} title="Approve"><FiCheckCircle /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => reject(p.id)} title="Reject"><FiX /></button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {!loading && filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-icon"><FiDollarSign /></div>
            <div className="empty-state-title">No payments found</div>
          </div>
        )}
      </div>

      {/* View Payment Modal */}
      {viewPayment && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setViewPayment(null)}>
          <div className="modal">
            <div className="modal-header">
              <h2 className="modal-title">Payment Details</h2>
              <button className="modal-close" onClick={() => setViewPayment(null)}><FiX /></button>
            </div>
            <div className="modal-body">
              <div style={{display:'flex',flexDirection:'column',gap:'0.875rem'}}>
                {[
                  {label:'User', value:viewPayment.user_name},
                  {label:'Email', value:viewPayment.user_email},
                  {label:'Plan', value:viewPayment.plan_name},
                  {label:'Amount', value:`৳${viewPayment.amount.toLocaleString()}`},
                  {label:'Payment Method', value:`${METHOD_EMOJI[viewPayment.method]} ${viewPayment.method}`},
                  {label:'Transaction ID', value:viewPayment.txn_id},
                  {label:'Date', value:new Date(viewPayment.created_at).toLocaleDateString()},
                  {label:'Status', value:viewPayment.status},
                  {label:'Note', value:viewPayment.note || '—'},
                ].map((item,i) => (
                  <div key={i} style={{display:'flex',justifyContent:'space-between',padding:'0.625rem 0',borderBottom:'1px solid var(--border)'}}>
                    <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>{item.label}</span>
                    <span style={{fontSize:'0.82rem',fontWeight:600,color:'var(--text-primary)'}}>{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            {viewPayment.status === 'pending' && (
              <div className="modal-footer">
                <button className="btn btn-danger" onClick={() => reject(viewPayment.id)}><FiX /> Reject</button>
                <button className="btn btn-success" onClick={() => approve(viewPayment.id)}><FiCheckCircle /> Approve</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`.stat-card.red::after{background:var(--danger);}.stat-icon.red{background:rgba(239,68,68,0.15);color:var(--danger-light);}.btn-success{background:rgba(16,185,129,0.15);border-color:rgba(16,185,129,0.3);color:var(--success-light);}.btn-success:hover{background:rgba(16,185,129,0.25);}.page-header{display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:1.5rem;gap:1rem;flex-wrap:wrap;}.page-title{font-size:1.8rem;font-weight:800;background:var(--gradient-text);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;margin-bottom:0.25rem;}.page-subtitle{color:var(--text-secondary);font-size:0.9rem;}`}</style>
    </div>
  );
}
