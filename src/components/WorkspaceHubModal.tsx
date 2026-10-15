import React, { useState, useEffect } from 'react';
import { 
  X, 
  Mail, 
  CheckSquare, 
  Send, 
  Plus, 
  Check, 
  AlertCircle, 
  Loader2, 
  ExternalLink,
  ShieldCheck,
  Clock,
  Sparkles,
  LogOut,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import { User } from 'firebase/auth';
import { googleSignIn, logout, initAuth, getAccessToken } from '../services/workspaceAuth';
import { 
  sendGmailRescueAlert, 
  listGoogleTasks, 
  createGoogleTask, 
  completeGoogleTask,
  GoogleTask 
} from '../services/googleWorkspaceService';
import { FoodListing } from '../types';

interface WorkspaceHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedListing?: FoodListing | null;
  claimedListings?: FoodListing[];
  onAuthChange?: (user: User | null) => void;
}

export const WorkspaceHubModal: React.FC<WorkspaceHubModalProps> = ({
  isOpen,
  onClose,
  selectedListing,
  claimedListings = [],
  onAuthChange,
}) => {
  const [activeTab, setActiveTab] = useState<'gmail' | 'tasks'>('gmail');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Gmail State
  const [recipientEmail, setRecipientEmail] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailSentSuccess, setEmailSentSuccess] = useState(false);

  // Tasks State
  const [tasks, setTasks] = useState<GoogleTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Confirmation Modal State (Mandatory per Google Workspace Skill for destructive/mutating operations)
  const [pendingConfirmAction, setPendingConfirmAction] = useState<{
    type: 'send_email' | 'create_task' | 'complete_task';
    title: string;
    description: string;
    onConfirm: () => Promise<void>;
  } | null>(null);

  // Init Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
        setAuthError(null);
        onAuthChange?.(currentUser);
      },
      () => {
        setUser(null);
        onAuthChange?.(null);
      }
    );
    return () => unsubscribe();
  }, [onAuthChange]);

  // Update default Gmail and Task templates when selectedListing changes
  useEffect(() => {
    if (selectedListing) {
      setEmailSubject(`[FoodBridge] Surplus Food Pickup Confirmation: ${selectedListing.foodName}`);
      setEmailBody(
`Hello ${selectedListing.contactName} (${selectedListing.donorName}),

This is a confirmation message from FoodBridge regarding the surplus food rescue:
- Meal Item: ${selectedListing.foodName} (${selectedListing.servings} portions)
- Pickup Slot: ${selectedListing.pickupWindow}
- Location: ${selectedListing.pickupAddress}
- 4-Digit Handover Verification Code: ${selectedListing.pickupCode || '4829'}

Our volunteer driver is dispatched and will arrive during your allocated slot. Thank you for eliminating food waste!

Warm regards,
FoodBridge Bhubaneswar Pilot Team`
      );

      setNewTaskTitle(`Food Pickup: ${selectedListing.foodName} (${selectedListing.servings} meals)`);
      setNewTaskNotes(`Donor: ${selectedListing.donorName} (${selectedListing.pickupAddress})\nPickup Slot: ${selectedListing.pickupWindow}\nVerification Code: ${selectedListing.pickupCode || '4829'}\nPhone: ${selectedListing.donorPhone}`);
    } else {
      setEmailSubject('[FoodBridge] Surplus Meal Rescue Coordination');
      setEmailBody('Hello,\n\nWe are coordinating a surplus food pickup via FoodBridge.\n\nThank you for partnering with us to reduce food waste!');
      setNewTaskTitle('Rescue surplus food from local donor');
      setNewTaskNotes('Check FoodBridge app for pickup slot and 4-digit verification code.');
    }
  }, [selectedListing]);

  // Load Google Tasks when on tasks tab and user is logged in
  useEffect(() => {
    if (isOpen && activeTab === 'tasks' && user) {
      loadTasks();
    }
  }, [isOpen, activeTab, user]);

  const loadTasks = async () => {
    setIsLoadingTasks(true);
    try {
      const fetched = await listGoogleTasks();
      setTasks(fetched);
    } catch (err: any) {
      console.warn('Could not load Google Tasks', err);
    } finally {
      setIsLoadingTasks(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const res = await googleSignIn();
      if (res?.user) {
        setUser(res.user);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Google Sign-in failed. Please try again.');
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
  };

  // Gmail Send Request -> Triggers Confirmation Modal First
  const handleInitiateSendEmail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail.trim() || !emailSubject.trim() || !emailBody.trim()) return;

    setPendingConfirmAction({
      type: 'send_email',
      title: 'Confirm Sending Email via Gmail',
      description: `Are you sure you want to send this email to "${recipientEmail}" from your connected Google Account?`,
      onConfirm: async () => {
        setIsSendingEmail(true);
        try {
          await sendGmailRescueAlert({
            toEmail: recipientEmail,
            subject: emailSubject,
            messageBody: emailBody,
            confirmedByUser: true,
          });
          setEmailSentSuccess(true);
          setTimeout(() => setEmailSentSuccess(false), 4000);
        } catch (err: any) {
          alert(`Failed to send email: ${err.message}`);
        } finally {
          setIsSendingEmail(false);
          setPendingConfirmAction(null);
        }
      },
    });
  };

  // Google Task Create Request -> Triggers Confirmation Modal First
  const handleInitiateCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setPendingConfirmAction({
      type: 'create_task',
      title: 'Confirm Adding Task to Google Tasks',
      description: `Add "${newTaskTitle}" to your primary Google Tasks list?`,
      onConfirm: async () => {
        setIsCreatingTask(true);
        try {
          const created = await createGoogleTask({
            title: newTaskTitle,
            notes: newTaskNotes,
            confirmedByUser: true,
          });
          setTasks((prev) => [created, ...prev]);
          setNewTaskTitle('');
          setNewTaskNotes('');
        } catch (err: any) {
          alert(`Failed to create task: ${err.message}`);
        } finally {
          setIsCreatingTask(false);
          setPendingConfirmAction(null);
        }
      },
    });
  };

  // Complete Google Task -> Triggers Confirmation Modal First
  const handleInitiateCompleteTask = (task: GoogleTask) => {
    setPendingConfirmAction({
      type: 'complete_task',
      title: 'Confirm Completing Task in Google Tasks',
      description: `Mark "${task.title}" as completed in your Google Tasks account?`,
      onConfirm: async () => {
        try {
          await completeGoogleTask({
            taskId: task.id,
            confirmedByUser: true,
          });
          setTasks((prev) =>
            prev.map((t) => (t.id === task.id ? { ...t, status: 'completed' } : t))
          );
        } catch (err: any) {
          alert(`Failed to complete task: ${err.message}`);
        } finally {
          setPendingConfirmAction(null);
        }
      },
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 relative max-h-[92vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-600 rounded-full hover:bg-stone-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-red-500 text-white flex items-center justify-center shadow-md">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-stone-900 tracking-tight">
                Google Workspace Hub
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-900">
                Gmail & Tasks
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Coordinate food pickups and log reminders with permission from your connected account.
            </p>
          </div>
        </div>

        {/* Auth Banner & Google Sign-In */}
        {!user ? (
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="text-xs text-stone-600">
              <p className="font-bold text-stone-900">Connect Google Account</p>
              <p className="text-[11px] text-stone-500">
                Sign in to send rescue dispatch emails via Gmail and sync meal pickups to Google Tasks.
              </p>
              {authError && (
                <p className="text-rose-600 text-xs font-semibold mt-1">{authError}</p>
              )}
            </div>

            {/* Official Google Sign-In Button */}
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="px-4 py-2 bg-white hover:bg-stone-50 border border-stone-300 rounded-xl shadow-xs font-semibold text-xs text-stone-700 flex items-center gap-2.5 shrink-0 transition"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
              </svg>
              <span>{isAuthenticating ? 'Signing in...' : 'Sign in with Google'}</span>
            </button>
          </div>
        ) : (
          <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-200 mb-4 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5 truncate">
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt={user.displayName || 'Google Profile'}
                  className="w-7 h-7 rounded-full shrink-0 border border-blue-300"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                  {user.email ? user.email[0].toUpperCase() : 'G'}
                </div>
              )}
              <div className="truncate">
                <span className="font-bold text-stone-900 block truncate">
                  {user.displayName || user.email}
                </span>
                <span className="text-[11px] text-blue-800 truncate block">{user.email}</span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="text-stone-500 hover:text-stone-800 font-semibold px-2 py-1 rounded-lg hover:bg-white text-xs flex items-center gap-1 transition shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Disconnect</span>
            </button>
          </div>
        )}

        {/* Tab Selector */}
        <div className="flex items-center gap-2 border-b border-stone-200 pb-2 mb-4">
          <button
            onClick={() => setActiveTab('gmail')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'gmail'
                ? 'bg-rose-50 text-rose-700 border border-rose-200 shadow-2xs'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <Mail className="w-4 h-4 text-rose-600" />
            <span>Gmail Dispatch & Alerts</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition ${
              activeTab === 'tasks'
                ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
                : 'text-stone-600 hover:bg-stone-50'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-blue-600" />
            <span>Google Tasks Planner</span>
            {tasks.length > 0 && (
              <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                {tasks.filter((t) => t.status !== 'completed').length}
              </span>
            )}
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
          {/* TAB 1: GMAIL DISPATCH */}
          {activeTab === 'gmail' && (
            <form onSubmit={handleInitiateSendEmail} className="space-y-3.5">
              {emailSentSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-900 border border-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>Email successfully dispatched via Gmail API!</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Recipient Email (Donor, NGO Driver, or Volunteer Desk)
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. kitchen@mayfairlagoon.com or volunteer@ekamratrust.org"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs sm:text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Subject Line
                </label>
                <input
                  type="text"
                  required
                  placeholder="Subject..."
                  value={emailSubject}
                  onChange={(e) => setEmailSubject(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs sm:text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Message Body
                </label>
                <textarea
                  rows={6}
                  required
                  value={emailBody}
                  onChange={(e) => setEmailBody(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs sm:text-sm font-sans bg-white leading-relaxed"
                />
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 text-[11px] text-stone-500 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Emails are sent directly from your authorized Google Account. A confirmation prompt will appear before sending.
                </span>
              </div>

              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-xs font-bold text-stone-600 transition"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={!user || isSendingEmail}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-sm transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSendingEmail ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  <span>{user ? 'Send Email via Gmail' : 'Connect Google to Send'}</span>
                </button>
              </div>
            </form>
          )}

          {/* TAB 2: GOOGLE TASKS PLANNER */}
          {activeTab === 'tasks' && (
            <div className="space-y-4">
              {/* Add New Task Form */}
              <form onSubmit={handleInitiateCreateTask} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <h4 className="font-extrabold text-stone-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Plus className="w-4 h-4 text-blue-600" />
                  <span>Add Pickup To Google Tasks</span>
                </h4>

                <div>
                  <input
                    type="text"
                    required
                    placeholder="Task Title (e.g. Pickup 30 meals from Mayfair Lagoon)"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs sm:text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <textarea
                    rows={2}
                    placeholder="Notes (address, contact name, 4-digit code...)"
                    value={newTaskNotes}
                    onChange={(e) => setNewTaskNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={!user || isCreatingTask}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isCreatingTask ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
                    <span>{user ? 'Add to Google Tasks' : 'Connect Google to Add'}</span>
                  </button>
                </div>
              </form>

              {/* Task List */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-stone-900 text-xs">
                    Your Synced Google Tasks
                  </h4>
                  {user && (
                    <button
                      onClick={loadTasks}
                      className="text-[11px] text-blue-700 hover:underline font-medium"
                    >
                      Refresh
                    </button>
                  )}
                </div>

                {!user ? (
                  <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
                    Sign in with Google above to view and synchronize your active meal pickup tasks.
                  </div>
                ) : isLoadingTasks ? (
                  <div className="p-8 text-center text-xs text-stone-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                    <span>Loading tasks from Google Tasks...</span>
                  </div>
                ) : tasks.length === 0 ? (
                  <div className="p-6 text-center bg-stone-50 rounded-2xl border border-stone-200 text-xs text-stone-500">
                    No active tasks found in your Google Tasks account. Use the form above to add a meal collection reminder!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className={`p-3 rounded-xl border flex items-start justify-between gap-3 text-xs transition ${
                          task.status === 'completed'
                            ? 'bg-stone-50 border-stone-200 opacity-60 line-through'
                            : 'bg-white border-stone-200 hover:border-blue-400'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            disabled={task.status === 'completed'}
                            onClick={() => handleInitiateCompleteTask(task)}
                            className={`w-4 h-4 rounded border mt-0.5 flex items-center justify-center transition ${
                              task.status === 'completed'
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-stone-300 hover:border-blue-500'
                            }`}
                          >
                            {task.status === 'completed' && <Check className="w-3 h-3" />}
                          </button>
                          <div>
                            <span className="font-bold text-stone-900">{task.title}</span>
                            {task.notes && (
                              <p className="text-[11px] text-stone-500 mt-0.5 whitespace-pre-line">
                                {task.notes}
                              </p>
                            )}
                          </div>
                        </div>

                        {task.status !== 'completed' && (
                          <button
                            type="button"
                            onClick={() => handleInitiateCompleteTask(task)}
                            className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-bold text-stone-600 transition shrink-0"
                          >
                            Mark Done
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CONFIRMATION MODAL FOR DESTRUCTIVE / MUTATING WORKSPACE OPERATIONS */}
        {pendingConfirmAction && (
          <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-stone-950/70 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 animate-scale-up">
              <div className="flex items-center gap-2.5 mb-2 text-stone-900 font-bold">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                <h4>{pendingConfirmAction.title}</h4>
              </div>

              <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                {pendingConfirmAction.description}
              </p>

              <div className="flex items-center justify-end gap-2 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPendingConfirmAction(null)}
                  className="px-3.5 py-2 rounded-xl border border-stone-200 hover:bg-stone-50 text-stone-600 transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => pendingConfirmAction.onConfirm()}
                  className="px-4 py-2 rounded-xl bg-stone-900 hover:bg-stone-800 text-white transition shadow-xs"
                >
                  Confirm & Proceed
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
