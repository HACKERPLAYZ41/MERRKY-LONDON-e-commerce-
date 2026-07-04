<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Ticket;
use App\Models\TicketMessage;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class TicketController extends Controller
{
    /**
     * List authenticated user's tickets
     */
    public function index()
    {
        $tickets = Auth::user()->tickets()->orderBy('updated_at', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $tickets
        ]);
    }

    /**
     * Create a new ticket (with the first message)
     */
    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
            'priority' => 'nullable|in:Low,Medium,High'
        ]);

        $ticket = Ticket::create([
            'user_id' => Auth::id(),
            'subject' => $request->subject,
            'priority' => $request->priority ?? 'Medium',
            'status' => 'Open'
        ]);

        TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $request->message
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket created successfully.',
            'data' => $ticket->load('messages')
        ], 201);
    }

    /**
     * Show ticket details with full conversation messages
     */
    public function show($id)
    {
        $ticket = Ticket::with('messages.user')->findOrFail($id);

        // Ensure user owns ticket OR is an admin
        if ($ticket->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access.'
            ], 403);
        }

        return response()->json([
            'status' => 'success',
            'data' => $ticket
        ]);
    }

    /**
     * Add message reply to ticket
     */
    public function addReply(Request $request, $id)
    {
        $request->validate([
            'message' => 'required|string'
        ]);

        $ticket = Ticket::findOrFail($id);

        // Ensure user owns ticket OR is an admin
        if ($ticket->user_id !== Auth::id() && Auth::user()->role !== 'admin') {
            return response()->json([
                'status' => 'error',
                'message' => 'Unauthorized access.'
            ], 403);
        }

        // Auto transition status back to open if customer replies, or in progress if admin replies
        if (Auth::user()->role === 'admin') {
            $ticket->status = 'In Progress';
        } else {
            $ticket->status = 'Open';
        }
        $ticket->touch(); // updates updated_at time
        $ticket->save();

        $message = TicketMessage::create([
            'ticket_id' => $ticket->id,
            'user_id' => Auth::id(),
            'message' => $request->message
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Reply posted successfully.',
            'data' => $message->load('user')
        ], 201);
    }

    // --- Admin specific actions ---

    /**
     * Admin: List all tickets
     */
    public function adminIndex()
    {
        $tickets = Ticket::with('user')->orderBy('updated_at', 'desc')->get();
        return response()->json([
            'status' => 'success',
            'data' => $tickets
        ]);
    }

    /**
     * Admin: Update ticket status
     */
    public function adminUpdateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:Open,In Progress,Resolved,Closed'
        ]);

        $ticket = Ticket::findOrFail($id);
        $ticket->status = $request->status;
        $ticket->save();

        return response()->json([
            'status' => 'success',
            'message' => 'Ticket status updated to ' . $request->status,
            'data' => $ticket
        ]);
    }
}
