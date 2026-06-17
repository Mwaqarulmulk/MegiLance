# @AI-HINT: Email sending service using Resend 2.0 API (primary) with SMTP fallback
# Email Service Configuration
# This module provides email sending capabilities using Resend 2.0 API and SMTP

import asyncio
import logging
import smtplib
import time
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

import httpx
from app.core.config import get_settings
from jinja2 import Environment, FileSystemLoader

settings = get_settings()
logger = logging.getLogger(__name__)

_RESEND_BASE_URL = "https://api.resend.com"
_RESEND_V2_HEADERS = {
    "Accept": "application/resend+json; version=2.0",
}

_TEMPLATE_CACHE_TTL = 300  # 5 minutes


class _TemplateCache:
    def __init__(self, ttl: int = _TEMPLATE_CACHE_TTL):
        self._ttl = ttl
        self._store: Dict[str, Tuple[str, float]] = {}

    def get(self, key: str) -> Optional[str]:
        entry = self._store.get(key)
        if entry is None:
            return None
        rendered, ts = entry
        if time.time() - ts > self._ttl:
            del self._store[key]
            return None
        return rendered

    def put(self, key: str, value: str) -> None:
        self._store[key] = (value, time.time())


class EmailService:
    """
    Email service for sending transactional and notification emails.
    Primary: Resend 2.0 API (https://resend.com)
    Fallback: SMTP with improved error handling
    Supports both plain text and HTML emails with attachments.
    """

    def __init__(self):
        self.smtp_server = settings.SMTP_HOST
        self.smtp_port = settings.SMTP_PORT
        self.smtp_username = settings.SMTP_USER
        self.smtp_password = settings.SMTP_PASSWORD
        self.from_email = settings.FROM_EMAIL
        self.from_name = settings.FROM_NAME
        self.resend_api_key = settings.RESEND_API_KEY

        template_dir = Path(__file__).parent.parent / "templates" / "emails"
        self.template_env = Environment(loader=FileSystemLoader(str(template_dir)))

        self._template_cache = _TemplateCache()

    def _resend_headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.resend_api_key}",
            "Content-Type": "application/json",
            **_RESEND_V2_HEADERS,
        }

    def send_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
    ) -> bool:
        if self.resend_api_key:
            return self._send_via_resend(to_email, subject, html_content, text_content)
        return self._send_via_smtp(to_email, subject, html_content, text_content, attachments)

    def _send_via_resend(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
    ) -> bool:
        try:
            payload = {
                "from": f"{self.from_name} <{self.from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }
            if text_content:
                payload["text"] = text_content

            response = httpx.post(
                f"{_RESEND_BASE_URL}/emails",
                headers=self._resend_headers(),
                json=payload,
                timeout=30.0,
            )

            if response.status_code in (200, 201):
                data = response.json()
                logger.info(
                    "Email sent via Resend 2.0 to %s: %s (id=%s)",
                    to_email, subject, data.get("id", "unknown"),
                )
                return True
            else:
                error_body = response.text
                try:
                    error_json = response.json()
                    error_body = error_json.get("message", error_json.get("error", error_body))
                except Exception:
                    pass
                logger.error(
                    "Resend 2.0 API error (%d): %s", response.status_code, error_body
                )
                return self._send_via_smtp(to_email, subject, html_content, text_content, None)

        except Exception as e:
            logger.error("Resend 2.0 API exception: %s", e)
            return self._send_via_smtp(to_email, subject, html_content, text_content, None)

    async def send_batch_emails(self, emails: List[Dict]) -> List[Dict]:
        """
        Send batch emails via Resend 2.0 API (up to 100 per call).
        Each dict should have: to, subject, html, and optionally text, tags, metadata.
        Returns list of results with success/error per email.
        """
        if len(emails) > 100:
            logger.warning("Batch email limit is 100; truncating from %d", len(emails))
            emails = emails[:100]

        if not self.resend_api_key:
            results = []
            for email_data in emails:
                success = self._send_via_smtp(
                    email_data["to"],
                    email_data["subject"],
                    email_data["html"],
                    email_data.get("text"),
                    None,
                )
                results.append({"to": email_data["to"], "success": success})
            return results

        try:
            payload = []
            for email_data in emails:
                item = {
                    "from": f"{self.from_name} <{self.from_email}>",
                    "to": [email_data["to"]] if isinstance(email_data["to"], str) else email_data["to"],
                    "subject": email_data["subject"],
                    "html": email_data["html"],
                }
                if email_data.get("text"):
                    item["text"] = email_data["text"]
                if email_data.get("tags"):
                    item["tags"] = email_data["tags"]
                payload.append(item)

            response = httpx.post(
                f"{_RESEND_BASE_URL}/emails/batch",
                headers=self._resend_headers(),
                json=payload,
                timeout=60.0,
            )

            if response.status_code in (200, 201):
                data = response.json()
                logger.info("Batch emails sent via Resend 2.0: %d emails", len(emails))
                return [{"to": e["to"], "success": True, "data": data} for e in emails]
            else:
                error_body = response.text
                try:
                    error_json = response.json()
                    error_body = error_json.get("message", error_json.get("error", error_body))
                except Exception:
                    pass
                logger.error("Resend 2.0 batch error (%d): %s", response.status_code, error_body)
                results = []
                for email_data in emails:
                    success = self._send_via_smtp(
                        email_data["to"],
                        email_data["subject"],
                        email_data["html"],
                        email_data.get("text"),
                        None,
                    )
                    results.append({"to": email_data["to"], "success": success, "fallback": True})
                return results

        except Exception as e:
            logger.error("Resend 2.0 batch exception: %s", e)
            results = []
            for email_data in emails:
                success = self._send_via_smtp(
                    email_data["to"],
                    email_data["subject"],
                    email_data["html"],
                    email_data.get("text"),
                    None,
                )
                results.append({"to": email_data["to"], "success": success, "fallback": True})
            return results

    async def send_scheduled_email(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        scheduled_at: str,
        tags: Optional[List[str]] = None,
    ) -> Dict:
        """
        Schedule email via Resend 2.0 for future delivery.
        scheduled_at: ISO 8601 datetime string (e.g., '2026-07-01T09:00:00Z').
        """
        if not self.resend_api_key:
            logger.warning("Resend API key not configured; scheduled sending requires Resend.")
            return {"success": False, "error": "Resend API key not configured"}

        try:
            payload: Dict[str, Any] = {
                "from": f"{self.from_name} <{self.from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
                "scheduled_at": scheduled_at,
            }
            if tags:
                payload["tags"] = [{"name": t} for t in tags]

            response = httpx.post(
                f"{_RESEND_BASE_URL}/emails",
                headers=self._resend_headers(),
                json=payload,
                timeout=30.0,
            )

            if response.status_code in (200, 201):
                data = response.json()
                logger.info(
                    "Scheduled email via Resend 2.0 to %s for %s (id=%s)",
                    to_email, scheduled_at, data.get("id", "unknown"),
                )
                return {"success": True, "id": data.get("id"), "data": data}
            else:
                error_body = response.text
                try:
                    error_json = response.json()
                    error_body = error_json.get("message", error_json.get("error", error_body))
                except Exception:
                    pass
                logger.error("Resend 2.0 scheduled error (%d): %s", response.status_code, error_body)
                return {"success": False, "error": error_body, "status_code": response.status_code}

        except Exception as e:
            logger.error("Resend 2.0 scheduled exception: %s", e)
            return {"success": False, "error": str(e)}

    def send_email_with_tags(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        tags: Optional[List[Dict[str, str]]] = None,
        metadata: Optional[Dict[str, str]] = None,
    ) -> bool:
        if not self.resend_api_key:
            return self._send_via_smtp(to_email, subject, html_content, None, None)

        try:
            payload: Dict[str, Any] = {
                "from": f"{self.from_name} <{self.from_email}>",
                "to": [to_email],
                "subject": subject,
                "html": html_content,
            }
            if tags:
                payload["tags"] = tags
            if metadata:
                payload["metadata"] = metadata

            response = httpx.post(
                f"{_RESEND_BASE_URL}/emails",
                headers=self._resend_headers(),
                json=payload,
                timeout=30.0,
            )

            if response.status_code in (200, 201):
                data = response.json()
                logger.info(
                    "Tagged email sent via Resend 2.0 to %s: %s (id=%s)",
                    to_email, subject, data.get("id", "unknown"),
                )
                return True
            else:
                error_body = response.text
                try:
                    error_json = response.json()
                    error_body = error_json.get("message", error_json.get("error", error_body))
                except Exception:
                    pass
                logger.error("Resend 2.0 tagged email error (%d): %s", response.status_code, error_body)
                return self._send_via_smtp(to_email, subject, html_content, None, None)

        except Exception as e:
            logger.error("Resend 2.0 tagged email exception: %s", e)
            return self._send_via_smtp(to_email, subject, html_content, None, None)

    def send_contact_form_email(
        self, name: str, from_email: str, subject: str, message: str
    ) -> bool:
        support_email = self.from_email
        html_content = self.render_template(
            "contact_form.html",
            {
                "name": name,
                "from_email": from_email,
                "subject": subject,
                "message": message,
                "app_name": self.from_name,
            },
        )

        if self.resend_api_key:
            try:
                payload = {
                    "from": f"{self.from_name} <{self.from_email}>",
                    "to": [support_email],
                    "subject": f"Contact Form: {subject}",
                    "html": html_content,
                    "reply_to": from_email,
                    "tags": [{"name": "category", "value": "contact-form"}],
                }

                response = httpx.post(
                    f"{_RESEND_BASE_URL}/emails",
                    headers=self._resend_headers(),
                    json=payload,
                    timeout=30.0,
                )

                if response.status_code in (200, 201):
                    logger.info("Contact form email sent from %s", from_email)
                    return True
                else:
                    logger.error("Resend 2.0 contact form error (%d)", response.status_code)
                    return self._send_via_smtp(
                        support_email,
                        f"Contact Form: {subject}",
                        html_content,
                        None,
                        None,
                    )
            except Exception as e:
                logger.error("Resend 2.0 contact form exception: %s", e)
                return self._send_via_smtp(
                    support_email,
                    f"Contact Form: {subject}",
                    html_content,
                    None,
                    None,
                )

        return self._send_via_smtp(
            support_email, f"Contact Form: {subject}", html_content, None, None
        )

    def send_newsletter_email(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        unsubscribe_url: str,
    ) -> bool:
        if self.resend_api_key and len(to_emails) > 1:
            emails_batch = []
            for recipient in to_emails:
                personalized = html_content.replace("{{unsubscribe_url}}", unsubscribe_url)
                emails_batch.append({
                    "to": recipient,
                    "subject": subject,
                    "html": personalized,
                    "tags": [{"name": "category", "value": "newsletter"}],
                })

            loop = asyncio.new_event_loop()
            try:
                results = loop.run_until_complete(self.send_batch_emails(emails_batch))
                all_success = all(r.get("success", False) for r in results)
                if all_success:
                    logger.info("Newsletter sent to %d recipients", len(to_emails))
                else:
                    failed = sum(1 for r in results if not r.get("success", False))
                    logger.warning("Newsletter partial failure: %d failed out of %d", failed, len(to_emails))
                return all_success
            finally:
                loop.close()

        for recipient in to_emails:
            personalized = html_content.replace("{{unsubscribe_url}}", unsubscribe_url)
            success = self.send_email(
                to_email=recipient,
                subject=subject,
                html_content=personalized,
            )
            if not success:
                logger.error("Newsletter failed for %s", recipient)
                return False

        logger.info("Newsletter sent to %d recipients via individual sends", len(to_emails))
        return True

    def send_notification_email(
        self,
        to_email: str,
        user_name: str,
        notification_type: str,
        title: str,
        message: str,
        action_url: Optional[str] = None,
        action_text: Optional[str] = None,
    ) -> bool:
        html_content = self.render_template(
            "notification.html",
            {
                "user_name": user_name,
                "notification_type": notification_type,
                "title": title,
                "message": message,
                "action_url": action_url,
                "action_text": action_text or "View Details",
                "app_name": self.from_name,
                "base_url": settings.FRONTEND_URL,
                "unsubscribe_url": f"{settings.FRONTEND_URL}/notifications/preferences",
            },
        )
        return self.send_email_with_tags(
            to_email=to_email,
            subject=title,
            html_content=html_content,
            tags=[{"name": "type", "value": notification_type}],
            metadata={"notification_type": notification_type},
        )

    def _send_via_smtp(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        text_content: Optional[str] = None,
        attachments: Optional[List[Dict[str, Any]]] = None,
    ) -> bool:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = f"{self.from_name} <{self.from_email}>"
            msg["To"] = to_email

            if text_content:
                text_part = MIMEText(text_content, "plain")
                msg.attach(text_part)

            html_part = MIMEText(html_content, "html")
            msg.attach(html_part)

            if attachments:
                for attachment in attachments:
                    part = MIMEBase("application", "octet-stream")
                    part.set_payload(attachment["content"])
                    encoders.encode_base64(part)
                    part.add_header(
                        "Content-Disposition",
                        f"attachment; filename= {attachment['filename']}",
                    )
                    msg.attach(part)

            if self.smtp_server == "smtp.gmail.com" and not self.smtp_username:
                logger.info("[MOCK EMAIL] To: %s, Subject: %s", to_email, subject)
                logger.debug(
                    "[MOCK EMAIL] Content: %s...", (text_content or html_content[:100])
                )
                return True

            try:
                server = smtplib.SMTP(self.smtp_server, self.smtp_port, timeout=10)
            except (smtplib.SMTPConnectError, ConnectionRefusedError, TimeoutError, OSError) as conn_err:
                logger.error("SMTP connection failed (timeout=10s): %s", conn_err)
                return False

            try:
                server.ehlo()
                server.starttls()
                server.ehlo()
            except smtplib.SMTPNotSupportedError:
                logger.warning("SMTP server does not support STARTTLS, continuing without TLS")
            except Exception as tls_err:
                logger.error("SMTP STARTTLS error: %s", tls_err)
                try:
                    server.quit()
                except Exception:
                    pass
                return False

            if self.smtp_username and self.smtp_password:
                try:
                    server.login(self.smtp_username, self.smtp_password)
                except smtplib.SMTPAuthenticationError as auth_err:
                    logger.error("SMTP auth failed: %s; trying without auth", auth_err)
                    try:
                        server.ehlo()
                    except Exception:
                        pass

            try:
                server.send_message(msg)
            except smtplib.SMTPRecipientsRefused as rcpt_err:
                logger.error("SMTP recipient refused: %s", rcpt_err)
                try:
                    server.quit()
                except Exception:
                    pass
                return False
            except smtplib.SMTPDataError as data_err:
                logger.error("SMTP data error: %s", data_err)
                try:
                    server.quit()
                except Exception:
                    pass
                return False

            try:
                server.quit()
            except Exception:
                pass

            return True

        except smtplib.SMTPException as e:
            logger.error("SMTP error sending email to %s: %s", to_email, e)
            return False
        except Exception as e:
            logger.error("Failed to send email via SMTP: %s", e)
            return False

    def render_template(self, template_name: str, context: Dict[str, Any]) -> str:
        cache_key = f"{template_name}:{hash(tuple(sorted(context.items())))}"
        cached = self._template_cache.get(cache_key)
        if cached is not None:
            return cached

        template = self.template_env.get_template(template_name)
        rendered = template.render(**context)
        self._template_cache.put(cache_key, rendered)
        return rendered

    async def render_template_async(self, template_name: str, context: Dict[str, Any]) -> str:
        return await asyncio.get_event_loop().run_in_executor(
            None, lambda: self.render_template(template_name, context)
        )

    def render_partial(self, partial_name: str, context: Optional[Dict[str, Any]] = None) -> str:
        ctx = context or {}
        ctx.setdefault("app_name", self.from_name)
        ctx.setdefault("base_url", settings.FRONTEND_URL)
        ctx.setdefault("unsubscribe_url", f"{settings.FRONTEND_URL}/notifications/preferences")
        try:
            template = self.template_env.get_template(f"partials/{partial_name}")
            return template.render(**ctx)
        except Exception:
            logger.debug("Partial %s not found, returning empty string", partial_name)
            return ""

    async def render_partial_async(self, partial_name: str, context: Optional[Dict[str, Any]] = None) -> str:
        return await asyncio.get_event_loop().run_in_executor(
            None, lambda: self.render_partial(partial_name, context)
        )

    def send_welcome_email(self, to_email: str, user_name: str) -> bool:
        html_content = self.render_template(
            "welcome.html",
            {
                "user_name": user_name,
                "app_name": "MegiLance",
                "login_url": f"{settings.FRONTEND_URL}/login",
            },
        )
        return self.send_email(
            to_email=to_email,
            subject="Welcome to MegiLance!",
            html_content=html_content,
        )

    def send_verification_email(
        self, to_email: str, user_name: str, verification_token: str
    ) -> bool:
        verification_url = (
            f"{settings.FRONTEND_URL}/verify-email?token={verification_token}"
        )
        html_content = self.render_template(
            "email_verification.html",
            {"user_name": user_name, "verification_url": verification_url},
        )
        return self.send_email(
            to_email=to_email,
            subject="Verify Your Email Address",
            html_content=html_content,
        )

    def send_password_reset_email(
        self, to_email: str, user_name: str, reset_token: str
    ) -> bool:
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={reset_token}"
        html_content = self.render_template(
            "password_reset.html", {"user_name": user_name, "reset_url": reset_url}
        )
        return self.send_email(
            to_email=to_email, subject="Reset Your Password", html_content=html_content
        )

    def send_project_posted_notification(
        self, to_email: str, freelancer_name: str, project_title: str, project_id: int
    ) -> bool:
        project_url = f"{settings.FRONTEND_URL}/projects/{project_id}"
        html_content = self.render_template(
            "project_posted.html",
            {
                "freelancer_name": freelancer_name,
                "project_title": project_title,
                "project_url": project_url,
            },
        )
        return self.send_email(
            to_email=to_email,
            subject=f"New Project: {project_title}",
            html_content=html_content,
        )

    def send_proposal_received_notification(
        self,
        to_email: str,
        client_name: str,
        freelancer_name: str,
        project_title: str,
        proposal_id: int,
    ) -> bool:
        proposal_url = f"{settings.FRONTEND_URL}/proposals/{proposal_id}"
        html_content = self.render_template(
            "proposal_received.html",
            {
                "client_name": client_name,
                "freelancer_name": freelancer_name,
                "project_title": project_title,
                "proposal_url": proposal_url,
            },
        )
        return self.send_email(
            to_email=to_email,
            subject=f"New Proposal from {freelancer_name}",
            html_content=html_content,
        )

    def send_proposal_accepted_notification(
        self, to_email: str, freelancer_name: str, project_title: str, contract_id: int
    ) -> bool:
        contract_url = f"{settings.FRONTEND_URL}/contracts/{contract_id}"
        html_content = self.render_template(
            "proposal_accepted.html",
            {
                "freelancer_name": freelancer_name,
                "project_title": project_title,
                "contract_url": contract_url,
            },
        )
        return self.send_email(
            to_email=to_email,
            subject=f"Proposal Accepted - {project_title}",
            html_content=html_content,
        )

    def send_contract_created_notification(
        self, to_email: str, user_name: str, project_title: str, contract_id: int
    ) -> bool:
        contract_url = f"{settings.FRONTEND_URL}/contracts/{contract_id}"
        html_content = self.render_template(
            "contract_created.html",
            {
                "user_name": user_name,
                "project_title": project_title,
                "contract_url": contract_url,
            },
        )
        return self.send_email(
            to_email=to_email,
            subject=f"Contract Created - {project_title}",
            html_content=html_content,
        )

    def send_milestone_submitted_notification(
        self, to_email: str, client_name: str, milestone_title: str, contract_id: int
    ) -> bool:
        contract_url = f"{settings.FRONTEND_URL}/contracts/{contract_id}"
        html_content = self.render_template(
            "milestone_submitted.html",
            {
                "client_name": client_name,
                "milestone_title": milestone_title,
                "contract_url": contract_url,
            },
        )
        return self.send_email(
            to_email=to_email,
            subject=f"Milestone Submitted - {milestone_title}",
            html_content=html_content,
        )

    def send_milestone_approved_notification(
        self, to_email: str, freelancer_name: str, milestone_title: str, amount: float
    ) -> bool:
        html_content = self.render_template(
            "milestone_approved.html",
            {
                "freelancer_name": freelancer_name,
                "milestone_title": milestone_title,
                "amount": f"${amount:.2f}",
            },
        )
        return self.send_email(
            to_email=to_email,
            subject="Milestone Approved - Payment Released",
            html_content=html_content,
        )

    def send_payment_received_notification(
        self, to_email: str, user_name: str, amount: float, payment_id: int
    ) -> bool:
        html_content = self.render_template(
            "payment_received.html",
            {
                "user_name": user_name,
                "amount": f"${amount:.2f}",
                "payment_id": payment_id,
            },
        )
        return self.send_email(
            to_email=to_email,
            subject=f"Payment Received - ${amount:.2f}",
            html_content=html_content,
        )

    def send_invoice_generated_notification(
        self,
        to_email: str,
        client_name: str,
        invoice_number: str,
        amount: float,
        invoice_id: int,
    ) -> bool:
        invoice_url = f"{settings.FRONTEND_URL}/invoices/{invoice_id}"
        html_content = self.render_template(
            "invoice_generated.html",
            {
                "client_name": client_name,
                "invoice_number": invoice_number,
                "amount": f"${amount:.2f}",
                "invoice_url": invoice_url,
            },
        )
        return self.send_email(
            to_email=to_email,
            subject=f"Invoice {invoice_number} - ${amount:.2f}",
            html_content=html_content,
        )

    def send_invoice_paid_notification(
        self, to_email: str, freelancer_name: str, invoice_number: str, amount: float
    ) -> bool:
        html_content = self.render_template(
            "invoice_paid.html",
            {
                "freelancer_name": freelancer_name,
                "invoice_number": invoice_number,
                "amount": f"${amount:.2f}",
            },
        )
        return self.send_email(
            to_email=to_email,
            subject=f"Invoice Paid - {invoice_number}",
            html_content=html_content,
        )

    def send_dispute_opened_notification(
        self, to_email: str, user_name: str, dispute_subject: str, dispute_id: int
    ) -> bool:
        dispute_url = f"{settings.FRONTEND_URL}/disputes/{dispute_id}"
        html_content = self.render_template(
            "dispute_opened.html",
            {
                "user_name": user_name,
                "dispute_subject": dispute_subject,
                "dispute_url": dispute_url,
            },
        )
        return self.send_email(
            to_email=to_email,
            subject=f"Dispute Opened - {dispute_subject}",
            html_content=html_content,
        )

    def send_review_received_notification(
        self,
        to_email: str,
        user_name: str,
        reviewer_name: str,
        rating: int,
        project_title: str,
    ) -> bool:
        html_content = self.render_template(
            "review_received.html",
            {
                "user_name": user_name,
                "reviewer_name": reviewer_name,
                "rating": rating,
                "project_title": project_title,
            },
        )
        return self.send_email(
            to_email=to_email,
            subject=f"New Review from {reviewer_name}",
            html_content=html_content,
        )

    def send_message_notification(
        self, to_email: str, recipient_name: str, sender_name: str, message_preview: str
    ) -> bool:
        messages_url = f"{settings.FRONTEND_URL}/messages"
        html_content = self.render_template(
            "message_received.html",
            {
                "recipient_name": recipient_name,
                "sender_name": sender_name,
                "message_preview": message_preview[:100],
                "messages_url": messages_url,
            },
        )
        return self.send_email(
            to_email=to_email,
            subject=f"New Message from {sender_name}",
            html_content=html_content,
        )

    def send_support_ticket_update(
        self,
        to_email: str,
        user_name: str,
        ticket_subject: str,
        status: str,
        ticket_id: int,
    ) -> bool:
        ticket_url = f"{settings.FRONTEND_URL}/support/{ticket_id}"
        html_content = self.render_template(
            "support_ticket_update.html",
            {
                "user_name": user_name,
                "ticket_subject": ticket_subject,
                "status": status,
                "ticket_url": ticket_url,
            },
        )
        return self.send_email(
            to_email=to_email,
            subject=f"Support Ticket Update - {ticket_subject}",
            html_content=html_content,
        )

    async def send_email_async(self, *args, **kwargs) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None, lambda: self.send_email(*args, **kwargs)
        )

    async def send_verification_email_async(
        self, to_email: str, user_name: str, verification_token: str
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_verification_email(to_email, user_name, verification_token),
        )

    async def send_password_reset_email_async(
        self, to_email: str, user_name: str, reset_token: str
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_password_reset_email(to_email, user_name, reset_token),
        )

    async def send_welcome_email_async(self, to_email: str, user_name: str) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None, lambda: self.send_welcome_email(to_email, user_name)
        )

    async def send_batch_emails_async(self, emails: List[Dict]) -> List[Dict]:
        return await self.send_batch_emails(emails)

    async def send_scheduled_email_async(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        scheduled_at: str,
        tags: Optional[List[str]] = None,
    ) -> Dict:
        return await self.send_scheduled_email(
            to_email, subject, html_content, scheduled_at, tags
        )

    async def send_email_with_tags_async(
        self,
        to_email: str,
        subject: str,
        html_content: str,
        tags: Optional[List[Dict[str, str]]] = None,
        metadata: Optional[Dict[str, str]] = None,
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_email_with_tags(to_email, subject, html_content, tags, metadata),
        )

    async def send_contact_form_email_async(
        self, name: str, from_email: str, subject: str, message: str
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None, lambda: self.send_contact_form_email(name, from_email, subject, message)
        )

    async def send_newsletter_email_async(
        self,
        to_emails: List[str],
        subject: str,
        html_content: str,
        unsubscribe_url: str,
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_newsletter_email(to_emails, subject, html_content, unsubscribe_url),
        )

    async def send_notification_email_async(
        self,
        to_email: str,
        user_name: str,
        notification_type: str,
        title: str,
        message: str,
        action_url: Optional[str] = None,
        action_text: Optional[str] = None,
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_notification_email(
                to_email, user_name, notification_type, title, message, action_url, action_text
            ),
        )

    async def send_project_posted_notification_async(
        self, to_email: str, freelancer_name: str, project_title: str, project_id: int
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_project_posted_notification(to_email, freelancer_name, project_title, project_id),
        )

    async def send_proposal_received_notification_async(
        self,
        to_email: str,
        client_name: str,
        freelancer_name: str,
        project_title: str,
        proposal_id: int,
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_proposal_received_notification(
                to_email, client_name, freelancer_name, project_title, proposal_id
            ),
        )

    async def send_proposal_accepted_notification_async(
        self, to_email: str, freelancer_name: str, project_title: str, contract_id: int
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_proposal_accepted_notification(to_email, freelancer_name, project_title, contract_id),
        )

    async def send_contract_created_notification_async(
        self, to_email: str, user_name: str, project_title: str, contract_id: int
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_contract_created_notification(to_email, user_name, project_title, contract_id),
        )

    async def send_milestone_submitted_notification_async(
        self, to_email: str, client_name: str, milestone_title: str, contract_id: int
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_milestone_submitted_notification(to_email, client_name, milestone_title, contract_id),
        )

    async def send_milestone_approved_notification_async(
        self, to_email: str, freelancer_name: str, milestone_title: str, amount: float
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_milestone_approved_notification(to_email, freelancer_name, milestone_title, amount),
        )

    async def send_payment_received_notification_async(
        self, to_email: str, user_name: str, amount: float, payment_id: int
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_payment_received_notification(to_email, user_name, amount, payment_id),
        )

    async def send_invoice_generated_notification_async(
        self,
        to_email: str,
        client_name: str,
        invoice_number: str,
        amount: float,
        invoice_id: int,
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_invoice_generated_notification(
                to_email, client_name, invoice_number, amount, invoice_id
            ),
        )

    async def send_invoice_paid_notification_async(
        self, to_email: str, freelancer_name: str, invoice_number: str, amount: float
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_invoice_paid_notification(to_email, freelancer_name, invoice_number, amount),
        )

    async def send_dispute_opened_notification_async(
        self, to_email: str, user_name: str, dispute_subject: str, dispute_id: int
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_dispute_opened_notification(to_email, user_name, dispute_subject, dispute_id),
        )

    async def send_review_received_notification_async(
        self,
        to_email: str,
        user_name: str,
        reviewer_name: str,
        rating: int,
        project_title: str,
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_review_received_notification(
                to_email, user_name, reviewer_name, rating, project_title
            ),
        )

    async def send_message_notification_async(
        self, to_email: str, recipient_name: str, sender_name: str, message_preview: str
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_message_notification(to_email, recipient_name, sender_name, message_preview),
        )

    async def send_support_ticket_update_async(
        self,
        to_email: str,
        user_name: str,
        ticket_subject: str,
        status: str,
        ticket_id: int,
    ) -> bool:
        return await asyncio.get_event_loop().run_in_executor(
            None,
            lambda: self.send_support_ticket_update(to_email, user_name, ticket_subject, status, ticket_id),
        )


email_service = EmailService()
