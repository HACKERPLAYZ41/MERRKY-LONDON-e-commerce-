import React, { useEffect, useState } from 'react';
import API from '../services/api';
import AdminSidebar from '../components/AdminSidebar';
import { Search, Clock, CheckCircle, AlertCircle, MessageSquare } from 'lucide-react';

const AdminTickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Selected ticket chat detail state
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replySubmitLoading, setReplySubmitLoading] = useState(false);
  const [statusUpdateLoading, setStatusUpdateLoading] = useState(false);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const response = await API.get('/control-panel-x7k/tickets');
      setTickets(Array.isArray(response.data.data) ? response.data.data : []);
    } catch (error) {
      console.error('Error fetching admin tickets', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleSelectTicket = async (ticketId) => {
    try {
      const response = await API.get(`/tickets/${ticketId}`);
      setSelectedTicket(response.data.data);
    } catch (error) {
      alert('Failed to retrieve ticket details.');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;

    setReplySubmitLoading(true);
    try {
      await API.post(`/tickets/${selectedTicket.id}/reply`, {
        message: replyMessage
      });
      setReplyMessage('');
      // Reload ticket detail thread
      await handleSelectTicket(selectedTicket.id);
      // Reload main tickets list
      const updatedListRes = await API.get('/control-panel-x7k/tickets');
      setTickets(Array.isArray(updatedListRes.data.data) ? updatedListRes.data.data : []);
    } catch (error) {
      alert('Failed to submit message reply.');
    } finally {
      setReplySubmitLoading(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!selectedTicket) return;

    setStatusUpdateLoading(true);
    try {
      await API.put(`/control-panel-x7k/tickets/${selectedTicket.id}/status`, {
        status: newStatus
      });
      setSelectedTicket((prev) => ({ ...prev, status: newStatus }));
      // Reload main tickets list
      const updatedListRes = await API.get('/control-panel-x7k/tickets');
      setTickets(Array.isArray(updatedListRes.data.data) ? updatedListRes.data.data : []);
    } catch (error) {
      alert('Failed to update status.');
    } finally {
      setStatusUpdateLoading(false);
    }
  };

  const filteredTickets = tickets.filter((t) =>
    t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.id.toString().includes(searchQuery) ||
    (t.user && t.user.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-50 pl-64 pb-12">
      <AdminSidebar />

      {/* Header */}
      <header className="bg-white border-b border-gray-150 py-5 px-8 flex justify-between items-center sticky top-0 z-20">
        <div>
          <h1 className="text-sm font-bold text-gray-800 tracking-wider uppercase">Customer Support Tickets</h1>
          <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5">
            Manage inquiries, view user queries, and send official brand support replies.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-8 max-w-7xl mx-auto space-y-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left / List View: Tickets List */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Search Toolbar */}
            <div className="bg-white border border-gray-150 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div className="relative w-80">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"><Search size={14} /></span>
                <input
                  type="text"
                  placeholder="Search by topic, customer, or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-md border border-gray-200 py-1.5 pr-4 pl-9 text-xs outline-none focus:border-black transition"
                />
              </div>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                Total: {filteredTickets.length} tickets
              </span>
            </div>

            {loading ? (
              <div className="text-center py-12 text-xs text-gray-400 bg-white border border-gray-150 rounded-xl">
                Loading support tickets...
              </div>
            ) : (
              <div className="bg-white border border-gray-150 rounded-xl shadow-sm overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="bg-gray-50 text-gray-400 border-b border-gray-150 uppercase text-[9px] font-bold">
                      <th className="px-6 py-3.5">ID</th>
                      <th className="px-6 py-3.5">Customer details</th>
                      <th className="px-6 py-3.5">Subject Issue</th>
                      <th className="px-6 py-3.5">Priority</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    {filteredTickets.map((t) => (
                      <tr 
                        key={t.id} 
                        className={`hover:bg-gray-50/50 cursor-pointer ${
                          selectedTicket?.id === t.id ? 'bg-zinc-50' : ''
                        }`}
                        onClick={() => handleSelectTicket(t.id)}
                      >
                        <td className="px-6 py-4 font-mono text-[10px]">#TK-{t.id}</td>
                        <td className="px-6 py-4 font-bold text-gray-900">
                          {t.user?.name || 'Customer'}
                          <p className="text-[9px] text-gray-400 font-semibold">{t.user?.email}</p>
                        </td>
                        <td className="px-6 py-4 font-bold text-gray-800">{t.subject}</td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                            t.priority === 'High' ? 'bg-red-50 text-red-600' : t.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'
                          }`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            t.status === 'Resolved' || t.status === 'Closed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                          }`}>
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectTicket(t.id);
                            }}
                            className="text-[10px] font-bold text-black uppercase tracking-wider hover:underline"
                          >
                            Open Thread
                          </button>
                        </td>
                      </tr>
                    ))}
                    {filteredTickets.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-gray-400 text-xs">
                          No support tickets found matching criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

          </div>

          {/* Right View: Selected Support Chat / Conversation details */}
          <div className="bg-white border border-gray-150 rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-xs font-bold text-gray-800 uppercase tracking-wider pb-3 border-b border-gray-100 flex items-center space-x-2">
              <MessageSquare size={14} />
              <span>Conversation details</span>
            </h2>

            {selectedTicket ? (
              <div className="space-y-6 animate-fade-in">
                
                {/* Topic info */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-1">
                  <span className="text-[9px] font-black text-gray-400 uppercase">Subject Issue</span>
                  <p className="text-xs font-bold text-gray-800 leading-normal">{selectedTicket.subject}</p>
                  <div className="flex justify-between items-center pt-2">
                    <span className="text-[9px] font-mono text-gray-400">#TK-{selectedTicket.id}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded font-bold uppercase ${
                      selectedTicket.priority === 'High' ? 'bg-red-50 text-red-600' : selectedTicket.priority === 'Medium' ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-600'
                    }`}>
                      {selectedTicket.priority} Priority
                    </span>
                  </div>
                </div>

                {/* Status Toggle option */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-gray-400 uppercase block">Modify Status State</label>
                  <select
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={statusUpdateLoading}
                    className="w-full rounded border border-gray-250 px-3 py-1.5 text-xs outline-none bg-white font-semibold text-gray-700"
                  >
                    <option value="Open">Open</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Closed">Closed</option>
                  </select>
                </div>

                {/* Message logs */}
                <div className="space-y-4 max-h-[350px] overflow-y-auto border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                  {selectedTicket.messages?.map((msg) => (
                    <div 
                      key={msg.id}
                      className={`flex flex-col max-w-[85%] rounded-lg p-3 space-y-1 ${
                        msg.user?.role === 'admin'
                          ? 'bg-black text-white ml-auto rounded-tr-none'
                          : 'bg-white text-gray-800 mr-auto rounded-tl-none border border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center space-x-4">
                        <span className="text-[9px] font-black uppercase tracking-wider opacity-85">
                          {msg.user?.role === 'admin' ? 'Official Support' : msg.user?.name}
                        </span>
                        <span className="text-[8px] opacity-60">
                          {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed break-words">{msg.message}</p>
                    </div>
                  ))}
                </div>

                {/* Chat reply submission */}
                {selectedTicket.status !== 'Closed' ? (
                  <form onSubmit={handleSendReply} className="space-y-3">
                    <textarea
                      rows={3}
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      placeholder="Type official brand response message..."
                      className="w-full rounded border border-gray-250 p-3 text-xs outline-none focus:border-black resize-none"
                      required
                    />
                    <button
                      type="submit"
                      disabled={replySubmitLoading}
                      className="w-full bg-black text-white text-[10px] font-bold py-2.5 rounded uppercase tracking-widest hover:bg-neutral-800 transition"
                    >
                      {replySubmitLoading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                ) : (
                  <div className="bg-red-50 p-3 rounded-lg text-center text-xs font-bold text-red-650">
                    This support ticket thread has been closed. Re-open ticket status to type replies.
                  </div>
                )}

              </div>
            ) : (
              <div className="text-center py-20 text-xs text-gray-400">
                Select a support ticket from the list to view thread log history and post messages.
              </div>
            )}

          </div>

        </div>

      </main>
    </div>
  );
};

export default AdminTickets;
