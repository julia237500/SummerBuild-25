import { useState, useEffect } from 'react';
import { FaFileInvoice, FaDownload, FaHistory } from 'react-icons/fa';
import { stripeService } from '../services/stripeService';
import './BillingHistory.css';

export default function BillingHistory() {
  const [invoices, setInvoices] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('invoices');

  useEffect(() => {
    if (activeTab === 'invoices') {
      fetchInvoices();
    } else {
      fetchHistory();
    }
  }, [activeTab]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stripeService.getInvoices();
      setInvoices(data);
    } catch (err) {
      setError('Failed to load invoices');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await stripeService.getSubscriptionHistory();
      setHistory(data);
    } catch (err) {
      setError('Failed to load subscription history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      await stripeService.downloadInvoice(invoiceId);
    } catch (err) {
      setError('Failed to download invoice');
      console.error(err);
    }
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount / 100);
  };

  if (loading && !invoices.length && !history.length) {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="billing-history">
      <h2>Billing History</h2>

      {error && <div className="error-message">{error}</div>}

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'invoices' ? 'active' : ''}`}
          onClick={() => setActiveTab('invoices')}
        >
          <FaFileInvoice />
          Invoices
        </button>
        <button
          className={`tab ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory />
          Subscription History
        </button>
      </div>

      {activeTab === 'invoices' && (
        <div className="invoices-list">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="invoice-item">
              <div className="invoice-info">
                <div className="invoice-date">
                  {formatDate(invoice.created)}
                </div>
                <div className="invoice-amount">
                  {formatAmount(invoice.amount_paid)}
                </div>
                <div className="invoice-status" data-status={invoice.status}>
                  {invoice.status}
                </div>
              </div>
              <button
                onClick={() => handleDownloadInvoice(invoice.id)}
                className="download-btn"
              >
                <FaDownload />
                Download PDF
              </button>
            </div>
          ))}
          {!invoices.length && !loading && (
            <div className="empty-state">No invoices found</div>
          )}
        </div>
      )}

      {activeTab === 'history' && (
        <div className="history-list">
          {history.map((event) => (
            <div key={event.id} className="history-item">
              <div className="history-icon">
                <FaHistory />
              </div>
              <div className="history-details">
                <div className="history-date">
                  {formatDate(event.created)}
                </div>
                <div className="history-description">
                  {event.description}
                </div>
                {event.priceChange && (
                  <div className="price-change">
                    <span className="old-price">
                      {formatAmount(event.priceChange.oldAmount)}
                    </span>
                    {' → '}
                    <span className="new-price">
                      {formatAmount(event.priceChange.newAmount)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
          {!history.length && !loading && (
            <div className="empty-state">No subscription history found</div>
          )}
        </div>
      )}
    </div>
  );
} 