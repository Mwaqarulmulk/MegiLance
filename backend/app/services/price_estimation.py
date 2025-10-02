"""
AI-powered Price Estimation Service
Provides project price estimates based on requirements, market data, and historical trends
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func
import logging
from datetime import datetime, timedelta

from app.models.project import Project, ProjectCategory
from app.models.contract import Contract
from app.models.proposal import Proposal

logger = logging.getLogger(__name__)


class PriceEstimationService:
    """Service for AI-powered price estimation"""
    
    # Base rates per category ($/hour)
    BASE_RATES = {
        ProjectCategory.WEB_DEVELOPMENT: 50,
        ProjectCategory.MOBILE_DEVELOPMENT: 60,
        ProjectCategory.DATA_SCIENCE: 70,
        ProjectCategory.DESIGN: 45,
        ProjectCategory.WRITING: 30,
        ProjectCategory.MARKETING: 40,
        ProjectCategory.VIDEO_EDITING: 35,
        ProjectCategory.OTHER: 40,
    }
    
    # Complexity multipliers
    COMPLEXITY_MULTIPLIERS = {
        'simple': 0.8,
        'moderate': 1.0,
        'complex': 1.3,
        'expert': 1.6
    }
    
    def __init__(self, db: Session):
        self.db = db
    
    async def estimate_project_price(
        self,
        category: ProjectCategory,
        skills_required: List[str],
        description: str = "",
        estimated_hours: Optional[int] = None,
        complexity: str = "moderate"
    ) -> Dict[str, Any]:
        """
        Estimate price for a project
        
        Args:
            category: Project category
            skills_required: List of required skills
            description: Project description
            estimated_hours: Estimated hours (if known)
            complexity: Project complexity (simple, moderate, complex, expert)
            
        Returns:
            Price estimation with breakdown
        """
        try:
            # Get base rate for category
            base_rate = self.BASE_RATES.get(category, self.BASE_RATES[ProjectCategory.OTHER])
            
            # Apply complexity multiplier
            complexity_mult = self.COMPLEXITY_MULTIPLIERS.get(complexity, 1.0)
            adjusted_rate = base_rate * complexity_mult
            
            # Adjust for skills
            skill_adjustment = await self._calculate_skill_adjustment(skills_required)
            adjusted_rate *= (1 + skill_adjustment)
            
            # Get market data
            market_data = await self._get_market_data(category, skills_required)
            
            # Calculate estimates
            if estimated_hours:
                min_price = adjusted_rate * estimated_hours * 0.8
                max_price = adjusted_rate * estimated_hours * 1.2
                recommended_price = adjusted_rate * estimated_hours
            else:
                # Use market averages
                min_price = market_data.get('min_price', adjusted_rate * 20)
                max_price = market_data.get('max_price', adjusted_rate * 100)
                recommended_price = market_data.get('avg_price', adjusted_rate * 50)
            
            return {
                'recommended_price': round(recommended_price, 2),
                'price_range': {
                    'min': round(min_price, 2),
                    'max': round(max_price, 2)
                },
                'hourly_rate': round(adjusted_rate, 2),
                'estimated_hours': estimated_hours or market_data.get('avg_hours', 50),
                'breakdown': {
                    'base_rate': round(base_rate, 2),
                    'complexity_multiplier': complexity_mult,
                    'skill_adjustment': f"{skill_adjustment*100:+.0f}%",
                    'market_trend': market_data.get('trend', 'stable')
                },
                'confidence': self._calculate_confidence(market_data),
                'comparable_projects': market_data.get('sample_size', 0)
            }
            
        except Exception as e:
            logger.error(f"Error in price estimation: {e}")
            return self._get_default_estimate(category)
    
    async def _calculate_skill_adjustment(self, skills: List[str]) -> float:
        """Calculate price adjustment based on required skills"""
        # High-value skills that increase rates
        premium_skills = {
            'machine learning': 0.3,
            'blockchain': 0.4,
            'ai': 0.3,
            'aws': 0.2,
            'kubernetes': 0.2,
            'react native': 0.15,
            'flutter': 0.15,
            'solidity': 0.35,
            'tensorflow': 0.25,
            'pytorch': 0.25,
        }
        
        total_adjustment = 0.0
        for skill in skills:
            skill_lower = skill.lower()
            for premium_skill, adjustment in premium_skills.items():
                if premium_skill in skill_lower:
                    total_adjustment += adjustment
                    break
        
        # Cap maximum adjustment at 50%
        return min(total_adjustment, 0.5)
    
    async def _get_market_data(
        self,
        category: ProjectCategory,
        skills: List[str]
    ) -> Dict[str, Any]:
        """Get market data for similar projects"""
        try:
            # Get recent completed projects in same category
            recent_date = datetime.utcnow() - timedelta(days=90)
            
            completed_projects = self.db.query(Project).filter(
                Project.category == category,
                Project.status == 'COMPLETED',
                Project.created_at >= recent_date
            ).all()
            
            if not completed_projects:
                return {}
            
            # Get contract prices for these projects
            project_ids = [p.id for p in completed_projects]
            contracts = self.db.query(Contract).filter(
                Contract.project_id.in_(project_ids),
                Contract.total_amount.isnot(None)
            ).all()
            
            if not contracts:
                return {}
            
            prices = [float(c.total_amount) for c in contracts if c.total_amount]
            hours = [float(c.estimated_hours) for c in contracts if c.estimated_hours]
            
            return {
                'avg_price': sum(prices) / len(prices) if prices else None,
                'min_price': min(prices) if prices else None,
                'max_price': max(prices) if prices else None,
                'avg_hours': sum(hours) / len(hours) if hours else None,
                'sample_size': len(contracts),
                'trend': self._calculate_trend(contracts)
            }
            
        except Exception as e:
            logger.error(f"Error getting market data: {e}")
            return {}
    
    def _calculate_trend(self, contracts: List[Contract]) -> str:
        """Calculate market trend (rising, stable, falling)"""
        if len(contracts) < 5:
            return 'stable'
        
        # Sort by date
        sorted_contracts = sorted(contracts, key=lambda c: c.created_at)
        
        # Compare first half vs second half
        midpoint = len(sorted_contracts) // 2
        first_half_avg = sum(float(c.total_amount) for c in sorted_contracts[:midpoint] if c.total_amount) / midpoint
        second_half_avg = sum(float(c.total_amount) for c in sorted_contracts[midpoint:] if c.total_amount) / (len(sorted_contracts) - midpoint)
        
        change = (second_half_avg - first_half_avg) / first_half_avg
        
        if change > 0.1:
            return 'rising'
        elif change < -0.1:
            return 'falling'
        else:
            return 'stable'
    
    def _calculate_confidence(self, market_data: Dict[str, Any]) -> str:
        """Calculate confidence level of estimation"""
        sample_size = market_data.get('sample_size', 0)
        
        if sample_size >= 20:
            return 'high'
        elif sample_size >= 10:
            return 'medium'
        elif sample_size >= 5:
            return 'low'
        else:
            return 'very_low'
    
    def _get_default_estimate(self, category: ProjectCategory) -> Dict[str, Any]:
        """Return default estimate when calculation fails"""
        base_rate = self.BASE_RATES.get(category, 40)
        
        return {
            'recommended_price': base_rate * 50,
            'price_range': {
                'min': base_rate * 20,
                'max': base_rate * 100
            },
            'hourly_rate': base_rate,
            'estimated_hours': 50,
            'breakdown': {
                'base_rate': base_rate,
                'complexity_multiplier': 1.0,
                'skill_adjustment': '+0%',
                'market_trend': 'unknown'
            },
            'confidence': 'very_low',
            'comparable_projects': 0
        }
    
    async def estimate_freelancer_rate(
        self,
        freelancer_id: int,
        years_experience: Optional[int] = None,
        skills: Optional[List[str]] = None,
        completed_projects: Optional[int] = None,
        average_rating: Optional[float] = None
    ) -> Dict[str, Any]:
        """
        Estimate appropriate hourly rate for a freelancer
        
        Args:
            freelancer_id: Freelancer user ID
            years_experience: Years of professional experience
            skills: List of skills
            completed_projects: Number of completed projects
            average_rating: Average client rating
            
        Returns:
            Rate estimation with justification
        """
        try:
            # Base rate
            base_rate = 40.0
            
            # Experience adjustment
            if years_experience:
                exp_mult = 1 + (years_experience * 0.05)  # 5% per year
                base_rate *= min(exp_mult, 2.0)  # Cap at 2x
            
            # Skills adjustment
            if skills:
                skill_adj = await self._calculate_skill_adjustment(skills)
                base_rate *= (1 + skill_adj)
            
            # Project completion bonus
            if completed_projects and completed_projects > 0:
                completion_mult = 1 + (completed_projects * 0.01)  # 1% per project
                base_rate *= min(completion_mult, 1.5)  # Cap at 1.5x
            
            # Rating adjustment
            if average_rating and average_rating > 0:
                rating_mult = 0.5 + (average_rating / 5.0)  # 0.5 to 1.0
                base_rate *= rating_mult
            
            return {
                'recommended_rate': round(base_rate, 2),
                'rate_range': {
                    'min': round(base_rate * 0.8, 2),
                    'max': round(base_rate * 1.2, 2)
                },
                'factors': {
                    'experience': f"{years_experience or 0} years",
                    'skills_count': len(skills) if skills else 0,
                    'completed_projects': completed_projects or 0,
                    'rating': average_rating or 0.0
                },
                'market_position': self._get_market_position(base_rate),
                'recommendations': self._get_rate_recommendations(base_rate)
            }
            
        except Exception as e:
            logger.error(f"Error estimating freelancer rate: {e}")
            return {
                'recommended_rate': 40.0,
                'rate_range': {'min': 30.0, 'max': 50.0},
                'factors': {},
                'market_position': 'average',
                'recommendations': []
            }
    
    def _get_market_position(self, rate: float) -> str:
        """Determine market position based on rate"""
        if rate < 30:
            return 'budget'
        elif rate < 50:
            return 'average'
        elif rate < 80:
            return 'premium'
        else:
            return 'expert'
    
    def _get_rate_recommendations(self, rate: float) -> List[str]:
        """Get recommendations for freelancer rates"""
        recommendations = []
        
        if rate < 30:
            recommendations.append("Consider building portfolio to justify higher rates")
            recommendations.append("Gain certifications in your field")
        elif rate < 50:
            recommendations.append("Maintain quality to increase rates over time")
            recommendations.append("Collect strong client testimonials")
        elif rate < 80:
            recommendations.append("Focus on specialized, high-value projects")
            recommendations.append("Build reputation as expert in niche")
        else:
            recommendations.append("Consider premium clients only")
            recommendations.append("Offer consulting or mentorship services")
        
        return recommendations


async def estimate_project(
    db: Session,
    category: ProjectCategory,
    skills_required: List[str],
    description: str = "",
    estimated_hours: Optional[int] = None,
    complexity: str = "moderate"
) -> Dict[str, Any]:
    """Convenience function for project price estimation"""
    service = PriceEstimationService(db)
    return await service.estimate_project_price(
        category, skills_required, description, estimated_hours, complexity
    )


async def estimate_freelancer_rate_quick(
    db: Session,
    freelancer_id: int,
    **kwargs
) -> Dict[str, Any]:
    """Convenience function for freelancer rate estimation"""
    service = PriceEstimationService(db)
    return await service.estimate_freelancer_rate(freelancer_id, **kwargs)
