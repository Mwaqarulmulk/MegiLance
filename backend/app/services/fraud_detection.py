"""
Fraud Detection Service
AI-powered fraud detection for suspicious activities
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import logging

from app.models.user import User
from app.models.project import Project
from app.models.proposal import Proposal
from app.models.payment import Payment

logger = logging.getLogger(__name__)


class FraudDetectionService:
    """Service for detecting fraudulent activities"""
    
    # Risk score thresholds
    RISK_LEVELS = {
        'low': (0, 30),
        'medium': (30, 60),
        'high': (60, 85),
        'critical': (85, 100)
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    async def analyze_user(self, user_id: int) -> Dict[str, Any]:
        """Analyze user for fraudulent behavior"""
        try:
            user = self.db.query(User).filter(User.id == user_id).first()
            if not user:
                return {'error': 'User not found'}
            
            risk_score = 0
            flags = []
            
            # Check account age
            account_age_days = (datetime.utcnow() - user.created_at).days
            if account_age_days < 1:
                risk_score += 20
                flags.append('Very new account (< 1 day old)')
            
            # Check verification status
            if not user.is_verified:
                risk_score += 15
                flags.append('Unverified account')
            
            # Check profile completeness
            profile_data = user.profile_data or {}
            if not profile_data.get('bio') or not profile_data.get('skills'):
                risk_score += 10
                flags.append('Incomplete profile')
            
            # Check activity patterns
            activity_risk = await self._analyze_activity_patterns(user_id)
            risk_score += activity_risk['score']
            flags.extend(activity_risk['flags'])
            
            # Check payment history
            payment_risk = await self._analyze_payment_history(user_id)
            risk_score += payment_risk['score']
            flags.extend(payment_risk['flags'])
            
            # Determine risk level
            risk_level = self._get_risk_level(risk_score)
            
            return {
                'user_id': user_id,
                'risk_score': risk_score,
                'risk_level': risk_level,
                'flags': flags,
                'recommendations': self._get_recommendations(risk_level, flags),
                'analyzed_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing user fraud risk: {e}")
            return {'error': str(e)}
    
    async def analyze_project(self, project_id: int) -> Dict[str, Any]:
        """Analyze project for fraudulent characteristics"""
        try:
            project = self.db.query(Project).filter(Project.id == project_id).first()
            if not project:
                return {'error': 'Project not found'}
            
            risk_score = 0
            flags = []
            
            # Check for suspicious keywords
            suspicious_keywords = ['money', 'bitcoin', 'crypto', 'password', 'hack', 'illegal']
            description_lower = (project.description or '').lower()
            title_lower = (project.title or '').lower()
            
            for keyword in suspicious_keywords:
                if keyword in description_lower or keyword in title_lower:
                    risk_score += 15
                    flags.append(f'Contains suspicious keyword: {keyword}')
            
            # Check budget reasonableness
            if project.budget_max and project.budget_max > 100000:
                risk_score += 20
                flags.append('Unusually high budget')
            elif project.budget_max and project.budget_max < 10:
                risk_score += 15
                flags.append('Unusually low budget')
            
            # Check description quality
            if not project.description or len(project.description) < 50:
                risk_score += 10
                flags.append('Very short or missing description')
            
            # Check client history
            client_risk = await self._analyze_user(project.client_id)
            if client_risk['risk_level'] in ['high', 'critical']:
                risk_score += 25
                flags.append('Client has high fraud risk')
            
            risk_level = self._get_risk_level(risk_score)
            
            return {
                'project_id': project_id,
                'risk_score': risk_score,
                'risk_level': risk_level,
                'flags': flags,
                'recommendations': self._get_recommendations(risk_level, flags),
                'analyzed_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing project fraud risk: {e}")
            return {'error': str(e)}
    
    async def analyze_proposal(self, proposal_id: int) -> Dict[str, Any]:
        """Analyze proposal for suspicious activity"""
        try:
            proposal = self.db.query(Proposal).filter(Proposal.id == proposal_id).first()
            if not proposal:
                return {'error': 'Proposal not found'}
            
            risk_score = 0
            flags = []
            
            # Check bid amount vs project budget
            project = proposal.project
            if project and project.budget_max:
                if proposal.bid_amount > project.budget_max * 2:
                    risk_score += 20
                    flags.append('Bid significantly higher than budget')
                elif proposal.bid_amount < project.budget_max * 0.2:
                    risk_score += 15
                    flags.append('Suspiciously low bid')
            
            # Check proposal quality
            if not proposal.cover_letter or len(proposal.cover_letter) < 50:
                risk_score += 10
                flags.append('Very short or missing cover letter')
            
            # Check freelancer history
            freelancer_risk = await self._analyze_user(proposal.freelancer_id)
            if freelancer_risk['risk_level'] in ['high', 'critical']:
                risk_score += 25
                flags.append('Freelancer has high fraud risk')
            
            risk_level = self._get_risk_level(risk_score)
            
            return {
                'proposal_id': proposal_id,
                'risk_score': risk_score,
                'risk_level': risk_level,
                'flags': flags,
                'recommendations': self._get_recommendations(risk_level, flags),
                'analyzed_at': datetime.utcnow().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error analyzing proposal fraud risk: {e}")
            return {'error': str(e)}
    
    async def _analyze_activity_patterns(self, user_id: int) -> Dict[str, Any]:
        """Analyze user activity patterns"""
        risk_score = 0
        flags = []
        
        try:
            # Check rapid submissions
            recent_time = datetime.utcnow() - timedelta(hours=1)
            recent_proposals = self.db.query(Proposal).filter(
                Proposal.freelancer_id == user_id,
                Proposal.submitted_at >= recent_time
            ).count()
            
            if recent_proposals > 10:
                risk_score += 20
                flags.append(f'Rapid proposal submissions ({recent_proposals} in 1 hour)')
            
            # Check project creation patterns
            recent_projects = self.db.query(Project).filter(
                Project.client_id == user_id,
                Project.created_at >= recent_time
            ).count()
            
            if recent_projects > 5:
                risk_score += 15
                flags.append(f'Rapid project creation ({recent_projects} in 1 hour)')
            
        except Exception as e:
            logger.error(f"Error analyzing activity patterns: {e}")
        
        return {'score': risk_score, 'flags': flags}
    
    async def _analyze_payment_history(self, user_id: int) -> Dict[str, Any]:
        """Analyze payment history for red flags"""
        risk_score = 0
        flags = []
        
        try:
            # Check for disputed payments
            disputed_payments = self.db.query(Payment).filter(
                Payment.payer_id == user_id,
                Payment.status == 'DISPUTED'
            ).count()
            
            if disputed_payments > 2:
                risk_score += 25
                flags.append(f'Multiple disputed payments ({disputed_payments})')
            
            # Check for failed payments
            failed_payments = self.db.query(Payment).filter(
                Payment.payer_id == user_id,
                Payment.status == 'FAILED'
            ).count()
            
            if failed_payments > 3:
                risk_score += 15
                flags.append(f'Multiple failed payments ({failed_payments})')
            
        except Exception as e:
            logger.error(f"Error analyzing payment history: {e}")
        
        return {'score': risk_score, 'flags': flags}
    
    def _get_risk_level(self, risk_score: int) -> str:
        """Determine risk level from score"""
        for level, (min_score, max_score) in self.RISK_LEVELS.items():
            if min_score <= risk_score <= max_score:
                return level
        return 'critical'
    
    def _get_recommendations(self, risk_level: str, flags: List[str]) -> List[str]:
        """Get recommendations based on risk level"""
        recommendations = []
        
        if risk_level == 'low':
            recommendations.append('Continue normal monitoring')
        elif risk_level == 'medium':
            recommendations.append('Increase monitoring frequency')
            recommendations.append('Request additional verification if suspicious activity continues')
        elif risk_level == 'high':
            recommendations.append('Require additional identity verification')
            recommendations.append('Limit transaction amounts temporarily')
            recommendations.append('Manual review recommended')
        elif risk_level == 'critical':
            recommendations.append('URGENT: Suspend account pending investigation')
            recommendations.append('Require comprehensive identity verification')
            recommendations.append('Block all financial transactions')
            recommendations.append('Escalate to fraud team immediately')
        
        return recommendations
