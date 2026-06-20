# @AI-HINT: AI chatbot with intent classification and support ticket creation — DB-backed via Turso
"""Conversational support system with FAQ matching and live agent handoff."""

import logging
import secrets
import json
import re
from datetime import datetime, timezone
from typing import Optional, List, Dict, Any
from enum import Enum
from collections import defaultdict

from app.db.turso_http import execute_query, parse_rows

try:
    from app.services.sentiment_analysis import sentiment_analyzer as _vader
except ImportError:
    _vader = None

logger = logging.getLogger(__name__)


class ChatIntent(str, Enum):
    """Detected conversation intents."""
    GREETING = "greeting"
    GOODBYE = "goodbye"
    HELP = "help"
    FAQ = "faq"
    ACCOUNT_QUESTION = "account_question"
    PROJECT_QUESTION = "project_question"
    PAYMENT_QUESTION = "payment_question"
    TECHNICAL_ISSUE = "technical_issue"
    COMPLAINT = "complaint"
    FEEDBACK = "feedback"
    CREATE_TICKET = "create_ticket"
    SPEAK_TO_AGENT = "speak_to_agent"
    PROJECT_MATCHING = "project_matching"
    PROPOSAL_ASSISTANCE = "proposal_assistance"
    PROFILE_ONBOARDING = "profile_onboarding"
    ROLE_SELECTION = "role_selection"
    PORTFOLIO_BUILD = "portfolio_build"
    SIGN_IN_REQUIRED = "sign_in_required"
    POST_PROJECT_FLOW = "post_project_flow"
    IMPROVE_PROFILE = "improve_profile"
    UNKNOWN = "unknown"


class SentimentLevel(str, Enum):
    """Message sentiment classification."""
    VERY_NEGATIVE = "very_negative"
    NEGATIVE = "negative"
    NEUTRAL = "neutral"
    POSITIVE = "positive"
    VERY_POSITIVE = "very_positive"


class ConversationState(str, Enum):
    """Chatbot conversation states."""
    ACTIVE = "active"
    AWAITING_INPUT = "awaiting_input"
    ESCALATED = "escalated"
    RESOLVED = "resolved"
    CLOSED = "closed"


class AIChatbotService:
    """
    AI-powered chatbot for customer support and FAQ assistance.
    
    Uses intent classification, FAQ matching, and sentiment analysis
    to provide intelligent responses and automate support.
    """
    
    # Intent patterns
    INTENT_PATTERNS = {
        ChatIntent.GREETING: [
            r'\b(hi|hello|hey|good morning|good afternoon|good evening)\b',
            r'\b(howdy|greetings|what\'s up)\b'
        ],
        ChatIntent.GOODBYE: [
            r'\b(bye|goodbye|see you|later|thanks|thank you)\b',
            r'\b(have a nice day|take care)\b'
        ],
        ChatIntent.HELP: [
            r'\b(help|assist|support|how do i|how can i|what is|explain|tell me)\b',
            r'\b(i need help|can you help|guide me|show me)\b'
        ],
        ChatIntent.ACCOUNT_QUESTION: [
            r'\b(account|profile|settings|password|email|login|sign in)\b',
            r'\b(sign up|register|verification|verify|2fa|two.factor)\b'
        ],
        ChatIntent.PROJECT_QUESTION: [
            r'\b(project|job|gig|contract|proposal|bid|posting)\b',
            r'\b(hire|hiring|post a job|find work|find talent)\b'
        ],
        ChatIntent.PAYMENT_QUESTION: [
            r'\b(payment|pay|money|withdraw|deposit|escrow|wallet)\b',
            r'\b(invoice|billing|refund|fee|commission|earnings|payout)\b'
        ],
        ChatIntent.TECHNICAL_ISSUE: [
            r'\b(error|bug|broken|not working|issue|problem|glitch)\b',
            r'\b(crash|stuck|loading|slow|fail|404|500)\b'
        ],
        ChatIntent.COMPLAINT: [
            r'\b(complaint|complain|terrible|awful|worst|scam|fraud)\b',
            r'\b(unacceptable|disappointed|frustrated|angry|cheated)\b'
        ],
        ChatIntent.FEEDBACK: [
            r'\b(feedback|suggestion|improve|feature request|idea)\b',
            r'\b(would be nice|you should|recommend|add a feature)\b'
        ],
        ChatIntent.SPEAK_TO_AGENT: [
            r'\b(speak to|talk to|human|agent|representative|person)\b',
            r'\b(real person|live support|escalate|manager)\b'
        ],
        ChatIntent.PROJECT_MATCHING: [
            r'\b(match|matching|projects for me|jobs for me|find projects)\b',
            r'\b(suitable projects|relevant jobs|recommend projects|best projects)\b'
        ],
        ChatIntent.PROPOSAL_ASSISTANCE: [
            r'\b(proposal|write proposal|draft proposal|proposal help|cover letter)\b',
            r'\b(write bid|bid help|draft bid|win project)\b'
        ],
        ChatIntent.PROFILE_ONBOARDING: [
            r'\b(profile|portfolio|build profile|complete profile|my profile)\b',
            r'\b(improve profile)\b'
        ],
        ChatIntent.ROLE_SELECTION: [
            r'\b(i\'?m a client|i\'?m a freelancer|client or freelancer)\b',
            r'\b(which role)\b'
        ],
        ChatIntent.PORTFOLIO_BUILD: [
            r'\b(build portfolio|add portfolio|create portfolio|show my work)\b'
        ],
        ChatIntent.SIGN_IN_REQUIRED: [
            r'\b(sign in required|need to log in|must be logged in)\b'
        ],
        ChatIntent.POST_PROJECT_FLOW: [
            r'\b(post a project|create project|start project|new job)\b'
        ],
        ChatIntent.IMPROVE_PROFILE: [
            r'\b(improve profile|boost profile|enhance profile|better profile)\b'
        ]
    }

    # Portal-specific response templates for agentic capabilities
    CLIENT_PORTAL_GUIDE = """**As a Client on MegiLance, you can:**

🔍 **Find Talent**
- Post a project with your requirements and budget
- Browse 10,000+ verified freelancers by skill
- Get AI-matched freelancer recommendations
- Use the "Find Talent" page to filter by skill, rate, and rating

📋 **Manage Projects**
- Track all proposals in your Client Dashboard
- Use the AI Scope Planner to break down your project
- Approve milestones to release escrow payments

💳 **Payments & Escrow**
- Fund escrow when a contract starts
- Payment releases only when you approve work
- Multiple payment methods: Card, PayPal, Bank Transfer

📊 **Dashboard Features**
- Active contracts & milestones tracker
- Invoice history and payment records
- Dispute resolution center
- Real-time messaging with freelancers"""

    FREELANCER_PORTAL_GUIDE = """**As a Freelancer on MegiLance, you can:**

🎯 **Find Projects**
- Browse open projects in your skill categories
- View AI-matched project recommendations
- Set job alerts for relevant opportunities
- Use the External Projects board for off-platform gigs

📝 **Submit Proposals**
- Use the AI Proposal Writer to craft winning proposals
- Set your rate and timeline
- Attach portfolio items
- Track proposal status in real-time

💰 **Earnings & Payments**
- Receive payments through escrow (safe & guaranteed)
- Withdraw via PayPal, bank transfer, or Wise
- Track all earnings in your Freelancer Dashboard
- Generate professional invoices automatically

⭐ **Build Your Profile**
- Complete your profile for higher visibility
- Get skill-verified with assessments
- Collect client reviews for reputation building
- Unlock seller tiers: Bronze → Silver → Gold → Platinum"""
    
    # Sentiment keywords
    SENTIMENT_KEYWORDS = {
        SentimentLevel.VERY_NEGATIVE: [
            'terrible', 'awful', 'horrible', 'worst', 'hate', 'furious',
            'disgusting', 'unacceptable', 'scam', 'fraud'
        ],
        SentimentLevel.NEGATIVE: [
            'bad', 'poor', 'disappointed', 'frustrated', 'annoyed',
            'unhappy', 'slow', 'broken', 'useless', 'confused'
        ],
        SentimentLevel.POSITIVE: [
            'good', 'nice', 'helpful', 'thanks', 'appreciate',
            'works', 'fine', 'okay', 'decent'
        ],
        SentimentLevel.VERY_POSITIVE: [
            'great', 'excellent', 'amazing', 'wonderful', 'fantastic',
            'love', 'perfect', 'awesome', 'best', 'outstanding'
        ]
    }
    
    # FAQ Database
    FAQ_DATABASE = {
        "how_to_create_account": {
            "question": "How do I create an account?",
            "answer": "To create an account:\n1. Click 'Sign Up' on the homepage\n2. Choose your role (Client or Freelancer)\n3. Enter your email and create a password\n4. Verify your email address\n5. Complete your profile\n\nNeed more help? Just ask!",
            "keywords": ["create", "account", "sign up", "register", "new user"],
            "category": "account"
        },
        "how_to_post_project": {
            "question": "How do I post a project?",
            "answer": "To post a new project:\n1. Log in to your client account\n2. Click 'Post a Project' from your dashboard\n3. Fill in the project details (title, description, budget, deadline)\n4. Add required skills and preferences\n5. Review and publish\n\nYour project will be visible to matching freelancers immediately!",
            "keywords": ["post", "project", "job", "create project", "new project"],
            "category": "projects"
        },
        "how_to_submit_proposal": {
            "question": "How do I submit a proposal?",
            "answer": "To submit a proposal:\n1. Browse available projects or check your matches\n2. Click on a project that interests you\n3. Click 'Submit Proposal'\n4. Write a compelling cover letter\n5. Set your proposed rate and timeline\n6. Add relevant portfolio items\n7. Submit!\n\nTip: Personalize each proposal for better results.",
            "keywords": ["submit", "proposal", "bid", "apply", "project"],
            "category": "proposals"
        },
        "payment_methods": {
            "question": "What payment methods are supported?",
            "answer": "We support multiple payment methods:\n• Credit/Debit Cards (Visa, Mastercard, Amex)\n• PayPal\n• Bank Transfer\n• Wise (TransferWise)\n\nAll payments are processed securely through our escrow system to protect both clients and freelancers.",
            "keywords": ["payment", "pay", "method", "card", "paypal", "bank"],
            "category": "payments"
        },
        "how_escrow_works": {
            "question": "How does escrow work?",
            "answer": "Our escrow system protects both parties:\n\n1. **Funding**: Client deposits payment into escrow\n2. **Work**: Freelancer completes the milestone\n3. **Approval**: Client reviews and approves work\n4. **Release**: Payment is released to freelancer\n\nFunds are held securely until work is approved. Disputes can be raised if there are issues.",
            "keywords": ["escrow", "secure", "payment", "milestone", "protection"],
            "category": "payments"
        },
        "platform_fees": {
            "question": "What are the platform fees?",
            "answer": "MegiLance fee structure:\n\n• **Freelancers**: 10% service fee on earnings\n• **Clients**: No additional fees (pay what you quote)\n• **Withdrawals**: Free for amounts over $100\n• **Small withdrawals**: $1 flat fee under $100\n\nVolume discounts available for enterprise accounts!",
            "keywords": ["fee", "commission", "charge", "cost", "price"],
            "category": "payments"
        },
        "forgot_password": {
            "question": "I forgot my password",
            "answer": "To reset your password:\n1. Go to the login page\n2. Click 'Forgot Password'\n3. Enter your email address\n4. Check your email for the reset link\n5. Create a new password\n\nLink expires in 24 hours. Check spam folder if not received.",
            "keywords": ["forgot", "password", "reset", "can't login", "locked"],
            "category": "account"
        },
        "dispute_resolution": {
            "question": "How do I raise a dispute?",
            "answer": "To raise a dispute:\n1. Go to the contract page\n2. Click 'Raise Dispute'\n3. Select the reason for dispute\n4. Provide evidence and explanation\n5. Submit for review\n\nOur team will review within 48 hours. Both parties can respond during the process.",
            "keywords": ["dispute", "problem", "issue", "refund", "not satisfied"],
            "category": "disputes"
        },
        "account_verification": {
            "question": "How do I verify my account?",
            "answer": "Verification steps:\n1. Go to Settings > Verification\n2. Upload government ID (passport, driver's license)\n3. Take a selfie for identity match\n4. Submit for review\n\nVerification typically takes 24-48 hours. Verified accounts get a badge and higher trust scores!",
            "keywords": ["verify", "verification", "kyc", "identity", "badge"],
            "category": "account"
        },
        "withdrawal_time": {
            "question": "How long do withdrawals take?",
            "answer": "Withdrawal processing times:\n• **PayPal**: Instant to 24 hours\n• **Bank Transfer**: 3-5 business days\n• **Wise**: 1-2 business days\n\nNote: First-time withdrawals may require additional verification.",
            "keywords": ["withdraw", "withdrawal", "time", "how long", "when"],
            "category": "payments"
        }
    }

    # Profile completeness field definitions
    PROFILE_FIELDS = {
        "name": {"weight": 10, "label": "Display Name", "column": "name"},
        "bio": {"weight": 15, "label": "Bio / About", "column": "bio"},
        "skills": {"weight": 15, "label": "Skills", "column": "skills"},
        "hourly_rate": {"weight": 10, "label": "Hourly Rate", "column": "hourly_rate"},
        "profile_image_url": {"weight": 10, "label": "Profile Photo", "column": "profile_image_url"},
        "location": {"weight": 5, "label": "Location", "column": "location"},
        "headline": {"weight": 10, "label": "Professional Headline", "column": "headline"},
        "portfolio_items": {"weight": 15, "label": "Portfolio Items", "column": None},
        "certifications": {"weight": 5, "label": "Certifications", "column": "certifications"},
        "education": {"weight": 5, "label": "Education", "column": "education"},
    }

    FLOW_DEFINITIONS = {
        "post_project": {
            "total_steps": 5,
            "steps": [
                {"step": 1, "name": "category", "prompt": "What category best describes your project? (e.g., Web Development, Mobile App, Design, Writing, Data Science)"},
                {"step": 2, "name": "title", "prompt": "Give your project a clear, descriptive title:"},
                {"step": 3, "name": "description", "prompt": "Describe what you need in detail. Include deliverables, requirements, and any preferences:"},
                {"step": 4, "name": "budget", "prompt": "What's your budget range? (e.g., $500-$1000, Fixed $750, or Hourly $30-$50/hr)"},
                {"step": 5, "name": "timeline", "prompt": "When do you need this completed? (e.g., 2 weeks, 1 month, ASAP, Flexible)"},
            ]
        },
        "build_portfolio": {
            "total_steps": 4,
            "steps": [
                {"step": 1, "name": "title", "prompt": "What's the title of this portfolio piece? (e.g., 'E-commerce Redesign', 'Brand Identity Package')"},
                {"step": 2, "name": "description", "prompt": "Describe the project — what you did, tools used, and the outcome:"},
                {"step": 3, "name": "skills", "prompt": "What skills does this showcase? (comma-separated, e.g., React, Node.js, Figma)"},
                {"step": 4, "name": "media", "prompt": "Add a project URL or image. You can also upload files later from your portfolio page."},
            ]
        },
        "improve_profile": {
            "total_steps": 0,
            "steps": []
        },
    }

    _MAX_CONVERSATIONS = 5000
    _MAX_MESSAGES_PER_CONVERSATION = 200
    _MAX_TICKETS = 2000

    def __init__(self):
        pass

    async def _get_conversation(self, conversation_id: str) -> Optional[Dict]:
        result = execute_query("SELECT * FROM chatbot_conversations WHERE id = ?", [conversation_id])
        rows = parse_rows(result)
        if not rows:
            return None
        r = rows[0]
        r["intents_detected"] = json.loads(r.get("intents_detected") or "[]")
        r["sentiment_history"] = json.loads(r.get("sentiment_history") or "[]")
        r["context"] = json.loads(r.get("context") or "{}")
        r["escalated"] = bool(int(r.get("escalated", 0)))
        return r
    
    async def start_conversation(
        self,
        user_id: Optional[int] = None,
        context: Optional[Dict[str, Any]] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Start a new chatbot conversation."""
        conversation_id = f"chat_{secrets.token_hex(12)}"
        now = datetime.now(timezone.utc).isoformat()

        merged_context = context or {}
        if user_context:
            merged_context["user"] = user_context

        execute_query(
            """INSERT INTO chatbot_conversations
               (id, user_id, state, context, intents_detected, sentiment_history,
                escalated, started_at, last_activity)
               VALUES (?, ?, ?, ?, '[]', '[]', 0, ?, ?)""",
            [conversation_id, user_id, ConversationState.ACTIVE.value,
             json.dumps(merged_context), now, now]
        )

        greeting = await self._get_greeting(user_id, context, user_context)

        suggestions = [
            "How to get started",
            "Payment questions",
            "Account help",
            "Report an issue"
        ]
        profile_score = None
        onboarding_status = None

        if user_context:
            role = user_context.get("role")
            name = user_context.get("name")
            profile_completed = user_context.get("profile_completed", False)
            page_url = user_context.get("page_url")

            if not profile_completed and user_id:
                profile_info = await self.get_profile_completeness(user_id)
                profile_score = profile_info["score"]
                onboarding_status = "incomplete"
                if profile_score < 50:
                    suggestions.insert(0, "Complete your profile")
            elif role == "freelancer":
                suggestions = [
                    "Find matching projects",
                    "Build my portfolio",
                    "Improve my profile",
                    "Write a proposal"
                ]
            elif role == "client":
                suggestions = [
                    "Post a project",
                    "Find a freelancer",
                    "How does escrow work?",
                    "Payment questions"
                ]

            if page_url:
                suggestions = await self._page_aware_suggestions(page_url, role, suggestions)

        return {
            "conversation_id": conversation_id,
            "response": greeting,
            "suggested_topics": suggestions,
            "profile_score": profile_score,
            "onboarding_status": onboarding_status
        }
    
    async def send_message(
        self,
        conversation_id: str,
        message: str,
        user_id: Optional[int] = None,
        user_context: Optional[Dict[str, Any]] = None,
        page_context: Optional[Dict[str, Any]] = None,
        flow_action: Optional[str] = None
    ) -> Dict[str, Any]:
        """Process user message and generate response."""
        conversation = await self._get_conversation(conversation_id)
        if not conversation:
            return {"error": "Conversation not found"}
        
        if conversation.get("user_id") is not None and conversation.get("user_id") != user_id:
            return {"error": "Access denied"}
        
        now = datetime.now(timezone.utc).isoformat()

        if user_context and conversation.get("context", {}).get("user") is None:
            ctx = conversation.get("context", {})
            ctx["user"] = user_context
            execute_query(
                "UPDATE chatbot_conversations SET context = ? WHERE id = ?",
                [json.dumps(ctx), conversation_id]
            )
            conversation["context"] = ctx
        
        intent = self._classify_intent(message)
        sentiment = self._analyze_sentiment(message)

        flow_state = conversation.get("context", {}).get("flow_state")
        if flow_action and flow_state:
            if flow_action == "step_complete":
                await self._advance_flow(conversation_id, flow_state, message)
            elif flow_action == "flow_cancel":
                await self._cancel_flow(conversation_id)
            elif flow_action == "flow_start":
                pass
        
        execute_query(
            """INSERT INTO chatbot_messages (conversation_id, role, content, intent, sentiment, created_at)
               VALUES (?, 'user', ?, ?, ?, ?)""",
            [conversation_id, message, intent.value, sentiment.value, now]
        )
        
        intents = conversation["intents_detected"]
        intents.append(intent.value)
        sentiments = conversation["sentiment_history"]
        sentiments.append(sentiment.value)
        execute_query(
            """UPDATE chatbot_conversations SET last_activity = ?, intents_detected = ?, sentiment_history = ?
               WHERE id = ?""",
            [now, json.dumps(intents), json.dumps(sentiments), conversation_id]
        )
        conversation["intents_detected"] = intents
        conversation["sentiment_history"] = sentiments
        
        should_escalate = self._check_escalation_triggers(conversation, intent, sentiment)
        if should_escalate:
            return await self._escalate_to_agent(conversation_id, message)
        
        response = await self._generate_response(
            conversation_id, message, intent, sentiment, user_id, user_context
        )
        
        execute_query(
            """INSERT INTO chatbot_messages (conversation_id, role, content, intent, sentiment, created_at)
               VALUES (?, 'assistant', ?, ?, 'neutral', ?)""",
            [conversation_id, response["message"], intent.value, now]
        )
        
        result = {
            "conversation_id": conversation_id,
            "response": response["message"],
            "intent": intent.value,
            "sentiment": sentiment.value,
            "suggestions": response.get("suggestions", []),
            "actions": response.get("actions", []),
            "faq_matched": response.get("faq_matched")
        }

        if user_id:
            completeness = await self.get_profile_completeness(user_id)
            result["profile_score"] = completeness["score"]
            result["missing_fields"] = completeness["missing_fields"]

        return result
    
    async def get_conversation_history(
        self,
        conversation_id: str
    ) -> Dict[str, Any]:
        """Get conversation history."""
        conversation = await self._get_conversation(conversation_id)
        if not conversation:
            return {"error": "Conversation not found"}
        
        result = execute_query(
            "SELECT * FROM chatbot_messages WHERE conversation_id = ? ORDER BY created_at ASC",
            [conversation_id]
        )
        messages = parse_rows(result)
        
        response = {
            "conversation": conversation,
            "messages": messages,
            "message_count": len(messages)
        }

        ctx = conversation.get("context", {})
        if ctx.get("flow_state"):
            response["flow_state"] = ctx["flow_state"]
        if ctx.get("onboarding_progress"):
            response["onboarding_progress"] = ctx["onboarding_progress"]

        return response
    
    async def search_faq(
        self,
        query: str,
        category: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        """Search FAQ database."""
        query_lower = query.lower()
        results = []
        
        for faq_id, faq in self.FAQ_DATABASE.items():
            if category and faq["category"] != category:
                continue
            
            score = 0
            for keyword in faq["keywords"]:
                if keyword in query_lower:
                    score += 2
            
            if any(word in faq["question"].lower() for word in query_lower.split()):
                score += 1
            
            if score > 0:
                results.append({
                    "id": faq_id,
                    "question": faq["question"],
                    "answer": faq["answer"],
                    "category": faq["category"],
                    "relevance_score": score
                })
        
        results.sort(key=lambda x: x["relevance_score"], reverse=True)
        
        return results[:limit]
    
    async def create_support_ticket(
        self,
        conversation_id: str,
        user_id: int,
        subject: str,
        description: str,
        priority: str = "medium",
        category: Optional[str] = None
    ) -> Dict[str, Any]:
        """Create a support ticket from conversation."""
        ticket_id = f"ticket_{secrets.token_hex(8)}"
        now = datetime.now(timezone.utc).isoformat()

        conversation = await self._get_conversation(conversation_id) or {}
        msgs_result = execute_query(
            "SELECT * FROM chatbot_messages WHERE conversation_id = ? ORDER BY created_at ASC",
            [conversation_id]
        )
        messages = parse_rows(msgs_result)

        sentiment_summary = self._summarize_sentiment(conversation.get("sentiment_history", []))
        conversation_summary = self._summarize_conversation(messages)

        execute_query(
            """INSERT INTO chatbot_tickets
               (id, user_id, conversation_id, subject, description, priority, category,
                status, intents_detected, sentiment_summary, conversation_summary, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, 'open', ?, ?, ?, ?, ?)""",
            [ticket_id, user_id, conversation_id, subject, description, priority,
             category or "general", json.dumps(conversation.get("intents_detected", [])),
             sentiment_summary, conversation_summary, now, now]
        )

        if conversation:
            execute_query(
                "UPDATE chatbot_conversations SET ticket_id = ?, state = ? WHERE id = ?",
                [ticket_id, ConversationState.ESCALATED.value, conversation_id]
            )

        return {
            "ticket_id": ticket_id,
            "status": "created",
            "message": f"Support ticket #{ticket_id} created. Our team will respond within 24 hours."
        }
    
    async def get_ticket(self, ticket_id: str) -> Optional[Dict[str, Any]]:
        """Get support ticket details."""
        result = execute_query("SELECT * FROM chatbot_tickets WHERE id = ?", [ticket_id])
        rows = parse_rows(result)
        if not rows:
            return None
        r = rows[0]
        r["intents_detected"] = json.loads(r.get("intents_detected") or "[]")
        return r
    
    async def close_conversation(
        self,
        conversation_id: str,
        resolution: Optional[str] = None
    ) -> Dict[str, Any]:
        """Close a conversation."""
        conversation = await self._get_conversation(conversation_id)
        if not conversation:
            return {"error": "Conversation not found"}
        
        now = datetime.now(timezone.utc).isoformat()
        execute_query(
            "UPDATE chatbot_conversations SET state = ?, closed_at = ?, resolution = ? WHERE id = ?",
            [ConversationState.CLOSED.value, now, resolution, conversation_id]
        )
        
        return {
            "status": "closed",
            "message": "Thank you for chatting with us! Have a great day!"
        }

    async def get_profile_completeness(self, user_id: int) -> Dict[str, Any]:
        """Calculate profile completeness score for a user."""
        result = execute_query(
            """SELECT name, bio, skills, hourly_rate, profile_image_url,
                      location, headline, certifications, education
               FROM users WHERE id = ?""",
            [user_id]
        )
        rows = parse_rows(result)
        if not rows:
            return {"score": 0, "missing_fields": ["User not found"], "suggestions": []}

        user = rows[0]
        score = 0
        missing_fields = []
        suggestions = []

        def _is_empty(val: Any) -> bool:
            if val is None:
                return True
            if isinstance(val, str) and val.strip() == "":
                return True
            if isinstance(val, (int, float)) and val == 0:
                return True
            return False

        def _is_json_empty(val: Any) -> bool:
            if _is_empty(val):
                return True
            try:
                parsed = json.loads(val)
                if isinstance(parsed, list) and len(parsed) == 0:
                    return True
                if isinstance(parsed, dict) and len(parsed) == 0:
                    return True
                if isinstance(parsed, str) and parsed.strip() == "":
                    return True
            except (json.JSONDecodeError, TypeError):
                return True
            return False

        for field_key, field_def in self.PROFILE_FIELDS.items():
            col = field_def.get("column")
            weight = field_def["weight"]
            label = field_def["label"]

            if field_key == "portfolio_items":
                p_result = execute_query(
                    "SELECT COUNT(*) as cnt FROM portfolio_items WHERE user_id = ?",
                    [user_id]
                )
                p_rows = parse_rows(p_result)
                count = int(p_rows[0]["cnt"]) if p_rows else 0
                if count > 0:
                    score += weight
                else:
                    missing_fields.append(label)
                    suggestions.append(f"Add portfolio items to showcase your work — profiles with portfolios get 3x more views")
            else:
                raw_val = user.get(col)
                is_json_field = field_key in ("skills", "certifications", "education")
                if is_json_field:
                    empty = _is_json_empty(raw_val)
                else:
                    empty = _is_empty(raw_val)

                if not empty:
                    score += weight
                else:
                    missing_fields.append(label)
                    if field_key == "name":
                        suggestions.append("Add your display name — clients want to know who they're hiring")
                    elif field_key == "bio":
                        suggestions.append("Write a bio that highlights your expertise and experience (aim for 100+ words)")
                    elif field_key == "skills":
                        suggestions.append("Add at least 5 skills so clients can find you in search results")
                    elif field_key == "hourly_rate":
                        suggestions.append("Set your hourly rate — it helps clients estimate project costs")
                    elif field_key == "profile_image_url":
                        suggestions.append("Upload a professional photo — profiles with photos get 40% more views")
                    elif field_key == "location":
                        suggestions.append("Add your location — some clients prefer local freelancers")
                    elif field_key == "headline":
                        suggestions.append("Add a professional headline (e.g., 'Full-Stack Developer | React & Node.js')")
                    elif field_key == "certifications":
                        suggestions.append("Add certifications to build trust and stand out from the competition")
                    elif field_key == "education":
                        suggestions.append("Add your education background to strengthen your profile")

        return {
            "score": score,
            "missing_fields": missing_fields,
            "suggestions": suggestions
        }

    async def get_onboarding_steps(self, user_id: int, role: str) -> Dict[str, Any]:
        """Return personalized step-by-step onboarding guide based on role and profile state."""
        completeness = await self.get_profile_completeness(user_id)
        missing = completeness["missing_fields"]
        score = completeness["score"]

        if role == "freelancer":
            all_steps = [
                {"step": 1, "name": "name", "title": "Set Your Display Name", "description": "Add your professional name"},
                {"step": 2, "name": "headline", "title": "Add a Professional Headline", "description": "e.g., 'Senior React Developer | 5 Years Exp'"},
                {"step": 3, "name": "bio", "title": "Write Your Bio", "description": "Highlight skills, experience, and what makes you unique"},
                {"step": 4, "name": "skills", "title": "Add Your Skills", "description": "List at least 5 skills for better search visibility"},
                {"step": 5, "name": "hourly_rate", "title": "Set Your Rate", "description": "Research market rates and set a competitive price"},
                {"step": 6, "name": "profile_image_url", "title": "Upload a Photo", "description": "Professional photos get 40% more profile views"},
                {"step": 7, "name": "location", "title": "Add Your Location", "description": "Helps with local project matching"},
                {"step": 8, "name": "portfolio_items", "title": "Add Portfolio Items", "description": "Showcase 3-5 of your best projects"},
                {"step": 9, "name": "certifications", "title": "Add Certifications", "description": "Verified credentials build trust"},
                {"step": 10, "name": "education", "title": "Add Education", "description": "Academic background strengthens your profile"},
            ]
        elif role == "client":
            all_steps = [
                {"step": 1, "name": "name", "title": "Set Your Display Name", "description": "Freelancers want to know who they're working with"},
                {"step": 2, "name": "profile_image_url", "title": "Upload a Photo", "description": "Builds trust with freelancers"},
                {"step": 3, "name": "location", "title": "Add Your Location", "description": "Helps with timezone matching"},
                {"step": 4, "name": "post_project", "title": "Post Your First Project", "description": "Describe what you need and get proposals"},
            ]
        else:
            all_steps = [
                {"step": 1, "name": "name", "title": "Set Your Name", "description": "Add your name to get started"},
            ]

        completed = [s for s in all_steps if s["name"] not in missing and s["name"] != "post_project"]
        pending = [s for s in all_steps if s["name"] in missing or s["name"] == "post_project"]

        return {
            "role": role,
            "profile_score": score,
            "completed_steps": completed,
            "pending_steps": pending,
            "next_step": pending[0] if pending else None,
            "progress": f"{len(completed)}/{len(all_steps)}"
        }

    async def start_flow(
        self,
        conversation_id: str,
        flow_type: str,
        user_id: Optional[int] = None
    ) -> Dict[str, Any]:
        """Initialize a multi-step conversation flow."""
        flow_def = self.FLOW_DEFINITIONS.get(flow_type)
        if not flow_def:
            return {"error": f"Unknown flow type: {flow_type}"}

        if flow_type == "improve_profile" and user_id:
            completeness = await self.get_profile_completeness(user_id)
            onboarding = await self.get_onboarding_steps(user_id, "freelancer")
            flow_state = {
                "flow_type": flow_type,
                "current_step": 0,
                "total_steps": len(onboarding.get("pending_steps", [])),
                "data": {},
                "started_at": datetime.now(timezone.utc).isoformat()
            }
            ctx = {"flow_state": flow_state}
            execute_query(
                "UPDATE chatbot_conversations SET context = json_set(context, '$.flow_state', ?) WHERE id = ?",
                [json.dumps(flow_state), conversation_id]
            )
            try:
                execute_query(
                    "UPDATE chatbot_conversations SET context = ? WHERE id = ?",
                    [json.dumps({"flow_state": flow_state}), conversation_id]
                )
            except Exception:
                pass

            first_prompt = None
            next_step = onboarding.get("next_step")
            if next_step:
                first_prompt = f"**Step 1: {next_step['title']}**\n{next_step['description']}\n\nYour profile is {completeness['score']}% complete. Let's work on the missing pieces!"

            return {
                "flow_id": flow_type,
                "flow_type": flow_type,
                "first_prompt": first_prompt or "Let's improve your profile! I'll guide you step by step.",
                "total_steps": flow_state["total_steps"]
            }

        steps = flow_def["steps"]
        flow_state = {
            "flow_type": flow_type,
            "current_step": 1,
            "total_steps": flow_def["total_steps"],
            "data": {},
            "started_at": datetime.now(timezone.utc).isoformat()
        }

        conversation = await self._get_conversation(conversation_id)
        ctx = conversation.get("context", {}) if conversation else {}
        ctx["flow_state"] = flow_state
        execute_query(
            "UPDATE chatbot_conversations SET context = ? WHERE id = ?",
            [json.dumps(ctx), conversation_id]
        )

        first_step = steps[0]
        return {
            "flow_id": flow_type,
            "flow_type": flow_type,
            "first_prompt": first_step["prompt"],
            "total_steps": flow_def["total_steps"],
            "current_step": 1,
            "step_name": first_step["name"]
        }

    def _classify_intent(self, message: str) -> ChatIntent:
        """Classify the intent of a message."""
        message_lower = message.lower()
        
        intent_scores = defaultdict(int)
        
        for intent, patterns in self.INTENT_PATTERNS.items():
            for pattern in patterns:
                if re.search(pattern, message_lower):
                    intent_scores[intent] += 1
        
        if intent_scores:
            scored = sorted(intent_scores.items(), key=lambda x: x[1], reverse=True)
            priority_intents = {
                ChatIntent.SIGN_IN_REQUIRED,
                ChatIntent.POST_PROJECT_FLOW,
                ChatIntent.PORTFOLIO_BUILD,
                ChatIntent.PROFILE_ONBOARDING,
                ChatIntent.ROLE_SELECTION,
                ChatIntent.IMPROVE_PROFILE,
            }
            for intent, score in scored:
                if intent in priority_intents:
                    return intent
            return scored[0][0]
        
        return ChatIntent.UNKNOWN
    
    def _analyze_sentiment(self, message: str) -> SentimentLevel:
        """Analyze sentiment using VADER (with keyword fallback)."""
        if _vader:
            result = _vader.analyze(message)
            compound = result["compound"]
            if compound >= 0.5:
                return SentimentLevel.VERY_POSITIVE
            elif compound >= 0.05:
                return SentimentLevel.POSITIVE
            elif compound <= -0.5:
                return SentimentLevel.VERY_NEGATIVE
            elif compound <= -0.05:
                return SentimentLevel.NEGATIVE
            return SentimentLevel.NEUTRAL

        message_lower = message.lower()
        scores = {level: 0 for level in SentimentLevel}
        for level, keywords in self.SENTIMENT_KEYWORDS.items():
            for keyword in keywords:
                if keyword in message_lower:
                    scores[level] += 1
        max_score = max(scores.values())
        if max_score == 0:
            return SentimentLevel.NEUTRAL
        for level, score in scores.items():
            if score == max_score:
                return level
        return SentimentLevel.NEUTRAL
    
    def _check_escalation_triggers(
        self,
        conversation: Dict,
        intent: ChatIntent,
        sentiment: SentimentLevel
    ) -> bool:
        """Check if conversation should be escalated."""
        if intent == ChatIntent.SPEAK_TO_AGENT:
            return True
        
        sentiment_history = conversation.get("sentiment_history", [])
        negative_count = sum(
            1 for s in sentiment_history[-3:] 
            if s in [SentimentLevel.NEGATIVE.value, SentimentLevel.VERY_NEGATIVE.value]
        )
        if negative_count >= 2:
            return True
        
        intent_history = conversation.get("intents_detected", [])
        unknown_count = sum(
            1 for i in intent_history[-5:] 
            if i == ChatIntent.UNKNOWN.value
        )
        if unknown_count >= 3:
            return True
        
        if intent == ChatIntent.COMPLAINT and sentiment == SentimentLevel.VERY_NEGATIVE:
            return True
        
        return False
    
    async def _generate_response(
        self,
        conversation_id: str,
        message: str,
        intent: ChatIntent,
        sentiment: SentimentLevel,
        user_id: Optional[int] = None,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """Generate response based on intent."""
        response = {
            "message": "",
            "suggestions": [],
            "actions": []
        }

        uc = user_context or {}
        uc_role = uc.get("role")
        uc_profile_completed = uc.get("profile_completed", False)
        uc_name = uc.get("name")
        
        if intent == ChatIntent.GREETING:
            if uc_name:
                response["message"] = f"Hello {uc_name}! How can I help you today?"
            else:
                response["message"] = "Hello! How can I help you today?"
            response["suggestions"] = [
                "I have a question about payments",
                "I need help with my account",
                "I want to post a project"
            ]
        
        elif intent == ChatIntent.GOODBYE:
            response["message"] = "Thank you for chatting! If you have more questions, feel free to ask. Have a great day!"
            response["actions"] = [{"type": "close_conversation"}]
        
        elif intent == ChatIntent.HELP:
            faq_results = await self.search_faq(message)
            if faq_results:
                top_result = faq_results[0]
                response["message"] = top_result["answer"]
                response["faq_matched"] = top_result["id"]
                if len(faq_results) > 1:
                    response["suggestions"] = [f["question"] for f in faq_results[1:4]]
            else:
                ai_resp = await self._generate_ai_response(message, user_context=user_context)
                if ai_resp:
                    response["message"] = ai_resp
                else:
                    response["message"] = "I'd be happy to help! Here are the most common topics I can assist with:"
                    response["suggestions"] = [
                        "How to post a project",
                        "How does escrow work?",
                        "What are the platform fees?",
                        "How to submit a proposal",
                    ]

        elif intent == ChatIntent.ACCOUNT_QUESTION:
            faq_results = await self.search_faq(message, category="account")
            if faq_results:
                response["message"] = faq_results[0]["answer"]
                response["faq_matched"] = faq_results[0]["id"]
            else:
                response["message"] = (
                    "Here's a quick guide to account management:\n\n"
                    "• **Update Profile**: Settings → Profile → Edit\n"
                    "• **Change Password**: Settings → Security → Change Password\n"
                    "• **Enable 2FA**: Settings → Security → Two-Factor Authentication\n"
                    "• **Verify Identity**: Settings → Verification → Upload ID\n"
                    "• **Forgot Password**: Click 'Forgot Password' on the login page\n\n"
                    "Which of these do you need help with?"
                )
                response["suggestions"] = ["Reset my password", "Enable 2FA", "Verify my identity"]

        elif intent == ChatIntent.PROJECT_QUESTION:
            faq_results = await self.search_faq(message, category="projects")
            if faq_results:
                response["message"] = faq_results[0]["answer"]
                response["faq_matched"] = faq_results[0]["id"]
            else:
                msg_lower = message.lower()
                if any(w in msg_lower for w in ["hire", "find freelancer", "client", "post project"]):
                    response["message"] = self.CLIENT_PORTAL_GUIDE
                    response["suggestions"] = ["Post a project", "How does escrow work?", "Find a freelancer"]
                elif any(w in msg_lower for w in ["proposal", "bid", "apply", "find work", "freelancer"]):
                    response["message"] = self.FREELANCER_PORTAL_GUIDE
                    response["suggestions"] = ["How to write a good proposal", "How do payments work?", "Improve my profile"]
                else:
                    response["message"] = (
                        "I can help with projects and freelancing! Are you a **Client** looking to hire, "
                        "or a **Freelancer** looking for work?\n\n"
                        "**For Clients:**\n• Post a project with your requirements\n• Browse AI-matched freelancers\n• Secure payments via escrow\n\n"
                        "**For Freelancers:**\n• Browse open projects\n• Submit proposals\n• Get paid safely through escrow"
                    )
                    response["suggestions"] = ["I'm a client — how do I hire?", "I'm a freelancer — how do I find work?"]

        elif intent == ChatIntent.PAYMENT_QUESTION:
            faq_results = await self.search_faq(message, category="payments")
            if faq_results:
                response["message"] = faq_results[0]["answer"]
                response["faq_matched"] = faq_results[0]["id"]
            else:
                response["message"] = (
                    "Here's how payments work on MegiLance:\n\n"
                    "💰 **Escrow System**\n"
                    "Client deposits payment → Freelancer completes work → Client approves → Payment released\n\n"
                    "💳 **Payment Methods**\n"
                    "• Credit/Debit cards (Visa, Mastercard, Amex)\n"
                    "• PayPal\n"
                    "• Bank Transfer\n"
                    "• Wise (TransferWise)\n"
                    "• USDC Crypto (Pakistan-friendly)\n\n"
                    "📋 **Fees**\n"
                    "• Freelancers: 10% service fee\n"
                    "• Clients: No additional fees\n"
                    "• Withdrawals: Free above $100, $1 flat fee below\n\n"
                    "What payment question do you have?"
                )
                response["suggestions"] = ["How does escrow work?", "Withdrawal times", "Platform fees"]

        elif intent == ChatIntent.TECHNICAL_ISSUE:
            ai_resp = await self._generate_ai_response(message, user_context=user_context)
            if ai_resp:
                response["message"] = ai_resp
            else:
                response["message"] = (
                    "I'm sorry you're experiencing issues!\n\n"
                    "Let me help you troubleshoot. Please tell me:\n"
                    "1. **What were you trying to do?**\n"
                    "2. **What error or message did you see?**\n"
                    "3. **Which browser/device are you using?**\n\n"
                    "Common quick fixes:\n"
                    "• Clear browser cache and cookies\n"
                    "• Try in incognito/private mode\n"
                    "• Check your internet connection\n"
                    "• Try a different browser\n\n"
                    "If the issue persists, I can create a support ticket for you."
                )
            response["actions"] = [{"type": "offer_ticket"}]

        elif intent == ChatIntent.COMPLAINT:
            if sentiment in [SentimentLevel.VERY_NEGATIVE, SentimentLevel.NEGATIVE]:
                response["message"] = (
                    "I'm really sorry to hear you're having a difficult experience. "
                    "Your satisfaction matters to us.\n\n"
                    "I'd like to help resolve this right away. Would you prefer to:\n"
                    "1. **Tell me the issue** — I'll try to solve it now\n"
                    "2. **Speak to a support specialist** — I'll connect you immediately\n"
                    "3. **Create a formal complaint** — Gets priority review within 24 hours\n\n"
                    "Please share more details about what went wrong."
                )
                response["actions"] = [{"type": "offer_escalation"}]
            else:
                response["message"] = "I'm sorry things aren't going smoothly. I'm here to help! Could you describe the main issue you're facing so I can find the best solution?"

        elif intent == ChatIntent.FEEDBACK:
            response["message"] = (
                "Thank you for your feedback! We genuinely value input from our community.\n\n"
                "Your suggestion will be forwarded to our product team. "
                "We review all feedback weekly to prioritize improvements.\n\n"
                "Is there anything specific you'd like to add or elaborate on?"
            )
            response["actions"] = [{"type": "log_feedback"}]

        elif intent == ChatIntent.PROJECT_MATCHING:
            if not user_id:
                response["message"] = (
                    "I'd love to find matching projects for you!\n\n"
                    "To get personalized project matches, please log in to your account. "
                    "Once logged in, I can analyze your skills and recommend the best opportunities.\n\n"
                    "Not registered yet? Sign up free at megilance.site!"
                )
                response["suggestions"] = ["Browse all projects", "How does matching work?"]
                response["actions"] = [{"type": "suggest_login"}]
            else:
                response["message"] = (
                    "Analyzing the latest projects against your profile...\n\n"
                    "I found projects matching your skills! Check your **Freelancer Dashboard → Matching** tab "
                    "to see your top matches with compatibility scores.\n\n"
                    "Tips to improve your match score:\n"
                    "• Add more skills to your profile\n"
                    "• Complete your profile 100%\n"
                    "• Set your availability status to 'Available'\n"
                    "• Update your hourly rate to market rates"
                )
                response["suggestions"] = ["Open my Dashboard", "How to improve match score?"]
                response["actions"] = [{"type": "trigger_matching", "redirect": "/portal/freelancer/dashboard"}]

        elif intent == ChatIntent.PROPOSAL_ASSISTANCE:
            response["message"] = (
                "I can help you craft a winning proposal!\n\n"
                "**Tips for a high-win-rate proposal:**\n"
                "1. **Personalize the opening** — Reference the client's specific project\n"
                "2. **Show relevant experience** — Link 2-3 portfolio items\n"
                "3. **Be specific about approach** — Explain HOW you'll solve their problem\n"
                "4. **Set a clear timeline** — Break it into milestones\n"
                "5. **Price competitively** — Use our Rate Advisor for market data\n\n"
                "Want me to help you draft a proposal? Share the project title and your key skills!"
            )
            response["suggestions"] = ["Open AI Proposal Writer", "Check market rates", "View proposal templates"]
            response["actions"] = [{"type": "start_proposal_wizard", "redirect": "/ai/proposal-writer"}]

        elif intent == ChatIntent.PROFILE_ONBOARDING:
            if not user_id:
                response["message"] = (
                    "I'd love to help you set up your profile!\n\n"
                    "To get started, please **sign in** to your account. "
                    "Once logged in, I can guide you through building a complete, standout profile.\n\n"
                    "👉 [Sign in](/login) — it only takes a moment!"
                )
                response["suggestions"] = ["Create an account", "What does a complete profile include?"]
                response["actions"] = [{"type": "suggest_login", "redirect": "/login"}]
            elif uc_role == "client":
                response["message"] = (
                    "Let me help you set up your client profile!\n\n"
                    "A complete client profile helps freelancers understand your needs and submit "
                    "better proposals. Here's what to add:\n"
                    "• **Your name** — Builds trust with freelancers\n"
                    "• **Profile photo** — Increases response rates\n"
                    "• **Location** — Helps with timezone matching\n\n"
                    "Ready to post a project? I can walk you through it!"
                )
                response["suggestions"] = ["Post a project", "Complete my profile"]
            else:
                if uc_profile_completed:
                    completeness = await self.get_profile_completeness(user_id)
                    response["message"] = (
                        f"Your profile is looking good at **{completeness['score']}% complete**!\n\n"
                    )
                    if completeness["missing_fields"]:
                        response["message"] += f"Still missing: {', '.join(completeness['missing_fields'])}\n\n"
                        if completeness["suggestions"]:
                            response["message"] += "**Quick wins:**\n"
                            for s in completeness["suggestions"][:3]:
                                response["message"] += f"• {s}\n"
                    else:
                        response["message"] += "You've completed all the key fields. Great job!"
                else:
                    completeness = await self.get_profile_completeness(user_id)
                    missing = completeness["missing_fields"]
                    response["message"] = (
                        f"Let's build your profile! You're at **{completeness['score']}% completeness** right now.\n\n"
                        f"Missing: {', '.join(missing)}\n\n"
                        "Let's start with the most important one. "
                    )
                    if missing:
                        first_missing = missing[0]
                        response["message"] += f"**{first_missing}** — what would you like to add?"
                    else:
                        response["message"] += "Looks like you're all set!"
                response["suggestions"] = ["Start profile flow", "What should I add first?", "Show me example profiles"]

        elif intent == ChatIntent.ROLE_SELECTION:
            response["message"] = (
                "Great question! Let me help you decide:\n\n"
                "**🤵 Client** — You need work done:\n"
                "• Post projects and receive proposals\n"
                "• Browse and hire freelancers\n"
                "• Pay securely through escrow\n"
                "• Manage milestones and approve work\n\n"
                "**💼 Freelancer** — You want to earn:\n"
                "• Browse projects and submit proposals\n"
                "• Build a portfolio and reputation\n"
                "• Get paid securely through escrow\n"
                "• Access AI tools to win more projects\n\n"
                "What sounds like you? I'll get you to the right signup page!"
            )
            response["suggestions"] = ["I'm a client", "I'm a freelancer"]
            response["actions"] = [
                {"type": "role_redirect", "client_url": "/signup/client", "freelancer_url": "/signup/freelancer"}
            ]

        elif intent == ChatIntent.PORTFOLIO_BUILD:
            if not user_id:
                response["message"] = (
                    "I'd love to help you build your portfolio!\n\n"
                    "Please **sign in** first so I can save your work and guide you through the process.\n\n"
                    "👉 [Sign in](/login) to get started!"
                )
                response["suggestions"] = ["Create a freelancer account", "What is a portfolio?"]
                response["actions"] = [{"type": "suggest_login", "redirect": "/login"}]
            else:
                p_result = execute_query(
                    "SELECT COUNT(*) as cnt FROM portfolio_items WHERE user_id = ?",
                    [user_id]
                )
                p_rows = parse_rows(p_result)
                count = int(p_rows[0]["cnt"]) if p_rows else 0

                if count >= 5:
                    response["message"] = (
                        f"You already have **{count} portfolio items** — great job!\n\n"
                        "To make your portfolio even stronger:\n"
                        "• Add detailed descriptions to each item\n"
                        "• Include before/after examples\n"
                        "• Add client testimonials\n"
                        "• Update your skills list\n\n"
                        "Want me to start a portfolio improvement flow?"
                    )
                    response["suggestions"] = ["Improve my profile", "Add another portfolio item"]
                else:
                    response["message"] = (
                        f"You have **{count} portfolio items** so far. "
                        f"Profiles with 3+ portfolio items get 3x more views!\n\n"
                        "Let me guide you through adding a new portfolio piece. I'll walk you through:\n"
                        "1. Project title\n"
                        "2. Description of what you did\n"
                        "3. Skills demonstrated\n"
                        "4. Media/link attachments\n\n"
                        "Ready to start?"
                    )
                    response["suggestions"] = ["Yes, start portfolio flow", "What skills should I add?"]
                    response["actions"] = [{"type": "suggest_flow", "flow": "build_portfolio"}]

        elif intent == ChatIntent.SIGN_IN_REQUIRED:
            response["message"] = (
                "You'll need to sign in to do that. But don't worry — it's quick!\n\n"
                "👉 [Sign in](/login) to unlock:\n"
                "• Post and manage projects\n"
                "• Submit proposals and win work\n"
                "• Build your portfolio and reputation\n"
                "• Access AI tools and personalized recommendations\n\n"
                "Don't have an account yet? [Sign up free](/signup)!"
            )
            response["suggestions"] = ["Sign in", "Create an account"]
            response["actions"] = [{"type": "suggest_login", "redirect": "/login"}]

        elif intent == ChatIntent.POST_PROJECT_FLOW:
            if not user_id:
                response["message"] = (
                    "I'd love to help you post a project!\n\n"
                    "Please **sign in** to your client account first. "
                    "Once logged in, I'll guide you through every step of creating a compelling project post.\n\n"
                    "👉 [Sign in](/login) to get started!"
                )
                response["suggestions"] = ["Create a client account", "How does posting work?"]
                response["actions"] = [{"type": "suggest_login", "redirect": "/login"}]
            else:
                response["message"] = (
                    "Let's create your project! I'll guide you through each step:\n\n"
                    "**Step 1: Category** — What type of project is this?\n"
                    "• Web Development\n• Mobile App\n• Design & Creative\n• Writing\n• Data Science\n• Other\n\n"
                    "Which category fits best?"
                )
                response["suggestions"] = ["Web Development", "Design & Creative", "Mobile App"]
                response["actions"] = [{"type": "suggest_flow", "flow": "post_project"}]

        elif intent == ChatIntent.IMPROVE_PROFILE:
            if not user_id:
                response["message"] = (
                    "I can help you boost your profile!\n\n"
                    "Please **sign in** so I can analyze your current profile and give you personalized tips.\n\n"
                    "👉 [Sign in](/login) to get started!"
                )
                response["suggestions"] = ["Create an account", "What makes a good profile?"]
                response["actions"] = [{"type": "suggest_login", "redirect": "/login"}]
            else:
                completeness = await self.get_profile_completeness(user_id)
                score = completeness["score"]
                missing = completeness["missing_fields"]
                suggestions_list = completeness["suggestions"]

                response["message"] = f"Your profile completeness: **{score}%**\n\n"
                if missing:
                    response["message"] += f"**Missing fields:** {', '.join(missing)}\n\n"
                if suggestions_list:
                    response["message"] += "**Top improvements:**\n"
                    for s in suggestions_list[:5]:
                        response["message"] += f"• {s}\n"
                if score >= 80:
                    response["message"] += "\nYour profile is strong! Small tweaks can push you to the top of search results."
                elif score >= 50:
                    response["message"] += "\nYou're making good progress. Completing the remaining fields will significantly boost your visibility."
                else:
                    response["message"] += "\nLet's build your profile up — every field you add increases your chances of getting hired."

                response["suggestions"] = ["Start profile improvement flow", "Show me top freelancer profiles"]
                response["actions"] = [{"type": "suggest_flow", "flow": "improve_profile"}]

        else:
            ai_response = await self._generate_ai_response(message, user_context=user_context)
            if ai_response:
                response["message"] = ai_response
            else:
                response["message"] = (
                    "I'm your MegiLance AI assistant. Here's what I can help you with:\n\n"
                    "**For Clients:**\n"
                    "• Find and hire top freelancers\n"
                    "• Post projects and manage contracts\n"
                    "• Escrow payments and dispute resolution\n\n"
                    "**For Freelancers:**\n"
                    "• Find projects matching your skills\n"
                    "• Write winning proposals\n"
                    "• Manage earnings and portfolio\n\n"
                    "**AI Tools (Free!):**\n"
                    "• Price Estimator, Proposal Writer, Rate Advisor\n"
                    "• Skill Analyzer, Scope Planner, Income Calculator\n\n"
                    "What would you like help with?"
                )
                response["suggestions"] = [
                    "I'm a client — help me hire",
                    "I'm a freelancer — find me projects",
                    "Show me AI tools",
                    "Payment questions",
                ]
        
        return response

    async def _generate_ai_response(
        self,
        prompt: str,
        user_context: Optional[Dict[str, Any]] = None
    ) -> Optional[str]:
        """Generate response using Advanced LLM Gateway with role-aware context."""
        from app.services.llm_gateway import llm_gateway
        try:
            role_info = ""
            profile_info = ""
            flow_info = ""
            if user_context:
                role = user_context.get("role")
                name = user_context.get("name")
                profile_completed = user_context.get("profile_completed")
                if role:
                    role_info = f"The user's role is: {role}."
                if name:
                    role_info += f" Their name is: {name}."
                if profile_completed is not None:
                    profile_info = f" Profile completed: {profile_completed}."
            system_message = (
                "You are MegiBot, the official helpful AI support assistant for the freelancing platform MegiLance. "
                "Be polite, concise, and helpful. Provide actionable advice specific to MegiLance's features. "
                f"{role_info}{profile_info}{flow_info}"
            )
            response = await llm_gateway.generate_text(
                prompt=prompt,
                system_message=system_message,
                max_tokens=250,
                temperature=0.6,
                task="general"
            )
            if response:
                return response
            return None
        except Exception as e:
            logger.warning(f"Error calling Advanced AI Gateway for chatbot: {e}")
            return None

    
    async def _escalate_to_agent(
        self,
        conversation_id: str,
        last_message: str
    ) -> Dict[str, Any]:
        """Escalate conversation to human agent."""
        now = datetime.now(timezone.utc).isoformat()
        execute_query(
            "UPDATE chatbot_conversations SET escalated = 1, state = ?, escalated_at = ? WHERE id = ?",
            [ConversationState.ESCALATED.value, now, conversation_id]
        )
        
        return {
            "conversation_id": conversation_id,
            "response": "I'll connect you with a support specialist who can better assist you.\n\nA team member will join this chat shortly. Average wait time is under 5 minutes.\n\nIn the meantime, please share any additional details about your issue.",
            "escalated": True,
            "estimated_wait": "5 minutes"
        }
    
    async def _get_greeting(
        self,
        user_id: Optional[int],
        context: Optional[Dict],
        user_context: Optional[Dict[str, Any]] = None
    ) -> str:
        """Generate personalized greeting."""
        hour = datetime.now(timezone.utc).hour
        
        if hour < 12:
            time_greeting = "Good morning"
        elif hour < 17:
            time_greeting = "Good afternoon"
        else:
            time_greeting = "Good evening"
        
        uc = user_context or {}
        name = uc.get("name")
        role = uc.get("role")
        profile_completed = uc.get("profile_completed", False)
        page_url = uc.get("page_url")

        if name:
            greeting = f"{time_greeting}, {name}! I'm MegiBot, your AI assistant.\n\n"
        else:
            greeting = f"{time_greeting}! I'm MegiBot, your AI assistant.\n\n"

        if user_id and not profile_completed:
            greeting += "I noticed your profile isn't fully complete yet. "
            greeting += "A complete profile helps you get the most out of MegiLance!\n\n"
        
        if role == "freelancer":
            greeting += "I can help you with:\n"
            greeting += "• Find matching projects\n"
            greeting += "• Build your portfolio\n"
            greeting += "• Write winning proposals\n"
            greeting += "• Improve your profile visibility\n\n"
        elif role == "client":
            greeting += "I can help you with:\n"
            greeting += "• Post a project and find talent\n"
            greeting += "• Manage contracts and milestones\n"
            greeting += "• Payment and escrow questions\n"
            greeting += "• Dispute resolution\n\n"
        else:
            greeting += "I can help you with:\n"
            greeting += "• Account & Profile questions\n"
            greeting += "• Projects & Proposals\n"
            greeting += "• Payments & Billing\n"
            greeting += "• Technical support\n\n"

        if page_url:
            page_hints = await self._page_aware_hints(page_url, role)
            if page_hints:
                greeting += page_hints + "\n\n"

        greeting += "What can I help you with today?"
        
        return greeting

    async def _page_aware_suggestions(
        self,
        page_url: str,
        role: Optional[str],
        base_suggestions: List[str]
    ) -> List[str]:
        """Adjust suggestions based on current page."""
        url_lower = (page_url or "").lower()
        if "dashboard" in url_lower and "freelancer" in url_lower:
            return ["Find matching projects", "Improve my profile", "Check my earnings", "Write a proposal"]
        elif "dashboard" in url_lower and "client" in url_lower:
            return ["Post a project", "Review proposals", "Manage contracts", "Payment questions"]
        elif "projects" in url_lower:
            return ["Filter projects", "Submit a proposal", "Set job alerts", "How does matching work?"]
        elif "profile" in url_lower:
            return ["Complete my profile", "Add portfolio items", "Set my rate", "Add skills"]
        elif "messages" in url_lower:
            return ["How does messaging work?", "Contact support", "Report an issue"]
        elif "payments" in url_lower or "wallet" in url_lower:
            return ["How does escrow work?", "Withdrawal times", "Platform fees", "Payment methods"]
        return base_suggestions

    async def _page_aware_hints(
        self,
        page_url: str,
        role: Optional[str]
    ) -> str:
        """Generate page-specific proactive hints."""
        url_lower = (page_url or "").lower()
        if "profile" in url_lower and "edit" in url_lower:
            return "I see you're editing your profile — I can suggest improvements!"
        if "post" in url_lower and "project" in url_lower:
            return "I see you're posting a project — want me to guide you through it?"
        if "proposal" in url_lower:
            return "Working on a proposal? I can help you craft a winning one!"
        return ""

    async def _advance_flow(
        self,
        conversation_id: str,
        flow_state: Dict,
        message: str
    ) -> None:
        """Advance a multi-step flow by storing user input."""
        current_step = flow_state.get("current_step", 1)
        flow_type = flow_state.get("flow_type")
        flow_def = self.FLOW_DEFINITIONS.get(flow_type, {})
        steps = flow_def.get("steps", [])

        step_name = None
        if current_step <= len(steps):
            step_name = steps[current_step - 1].get("name", f"step_{current_step}")

        flow_state.setdefault("data", {})
        if step_name:
            flow_state["data"][step_name] = message

        flow_state["current_step"] = current_step + 1

        conversation = await self._get_conversation(conversation_id)
        if conversation:
            ctx = conversation.get("context", {})
            ctx["flow_state"] = flow_state
            execute_query(
                "UPDATE chatbot_conversations SET context = ? WHERE id = ?",
                [json.dumps(ctx), conversation_id]
            )

    async def _cancel_flow(self, conversation_id: str) -> None:
        """Cancel an active flow."""
        conversation = await self._get_conversation(conversation_id)
        if conversation:
            ctx = conversation.get("context", {})
            ctx.pop("flow_state", None)
            execute_query(
                "UPDATE chatbot_conversations SET context = ? WHERE id = ?",
                [json.dumps(ctx), conversation_id]
            )
    
    def _summarize_sentiment(self, sentiment_history: List[str]) -> str:
        """Summarize sentiment history."""
        if not sentiment_history:
            return "neutral"
        
        from collections import Counter
        counts = Counter(sentiment_history)
        most_common = counts.most_common(1)[0][0]
        return most_common
    
    def _summarize_conversation(self, messages: List[Dict]) -> str:
        """Summarize conversation for ticket."""
        if not messages:
            return "No messages"
        
        user_messages = [m for m in messages if m.get("role") == "user"]
        
        if not user_messages:
            return "No user messages"
        
        summary = f"Conversation with {len(messages)} messages.\n"
        summary += f"User queries: {len(user_messages)}\n"
        summary += f"First message: {user_messages[0].get('content', '')[:100]}...\n"
        summary += f"Last message: {user_messages[-1].get('content', '')[:100]}..."
        
        return summary


_chatbot_service: Optional[AIChatbotService] = None


def get_chatbot_service() -> AIChatbotService:
    """Get or create chatbot service instance."""
    global _chatbot_service
    if _chatbot_service is None:
        _chatbot_service = AIChatbotService()
    return _chatbot_service
